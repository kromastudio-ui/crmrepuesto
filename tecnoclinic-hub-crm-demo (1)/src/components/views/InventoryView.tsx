import { useMemo, useState } from 'react';
import { Search, Package, AlertTriangle, CheckCircle2, Filter, Download, TrendingDown } from 'lucide-react';
import type { Part } from '../../types';
import { TASA_BS } from '../../data/mockData';
import { cn } from '../../utils/cn';

interface Props {
  parts: Part[];
  globalSearch: string;
}

const marcas = ['Todas', 'ACDelco', 'Bosch', 'Denso', 'Motul'];

export default function InventoryView({ parts, globalSearch }: Props) {
  const [localSearch, setLocalSearch] = useState('');
  const [marca, setMarca] = useState('Todas');
  const [soloCriticos, setSoloCriticos] = useState(false);

  const query = (localSearch || globalSearch).trim().toLowerCase();

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      if (marca !== 'Todas' && p.marca !== marca) return false;
      if (soloCriticos && p.stock > p.stockMinimo) return false;
      if (query && ![p.codigo, p.descripcion, p.marca, p.categoria, p.compatibilidad].join(' ').toLowerCase().includes(query)) return false;
      return true;
    });
  }, [parts, marca, soloCriticos, query]);

  const criticos = parts.filter((p) => p.stock <= p.stockMinimo).length;
  const valorInventario = parts.reduce((s, p) => s + p.stock * p.precioUSD, 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3">
          <div className="rounded-xl bg-sky-100 p-2.5 text-sky-600"><Package className="h-5 w-5" /></div>
          <div>
            <p className="text-xl font-bold text-gray-900">{parts.length} referencias</p>
            <p className="text-xs text-gray-500">{parts.reduce((s, p) => s + p.stock, 0)} unidades en físico</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
          <div>
            <p className="text-xl font-bold text-gray-900">${valorInventario.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500">Valor del inventario (venta)</p>
          </div>
        </div>
        <button
          onClick={() => setSoloCriticos(!soloCriticos)}
          className={cn(
            'rounded-2xl border p-4 flex items-center gap-3 text-left transition',
            soloCriticos ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300/50' : 'bg-white border-gray-200 hover:border-amber-300'
          )}
        >
          <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600"><AlertTriangle className="h-5 w-5" /></div>
          <div>
            <p className="text-xl font-bold text-gray-900">{criticos} críticos</p>
            <p className="text-xs text-gray-500">{soloCriticos ? 'Mostrando solo críticos · clic para ver todo' : 'Clic para filtrar por agotarse'}</p>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-gray-200">
        <div className="p-4 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar por código, descripción o compatibilidad (ej. Hilux, bujía, PF52)…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400" />
            {marcas.map((m) => (
              <button
                key={m}
                onClick={() => setMarca(m)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-bold border transition',
                  marca === m
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                )}
              >
                {m}
              </button>
            ))}
            <button className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" /> Exportar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="px-4 py-3 font-bold">Código</th>
                <th className="px-4 py-3 font-bold">Descripción</th>
                <th className="px-4 py-3 font-bold">Marca</th>
                <th className="px-4 py-3 font-bold">Compatibilidad</th>
                <th className="px-4 py-3 font-bold text-center">Stock</th>
                <th className="px-4 py-3 font-bold text-right">Precio USD</th>
                <th className="px-4 py-3 font-bold text-right">Precio Bs.</th>
                <th className="px-4 py-3 font-bold text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const critico = p.stock <= p.stockMinimo;
                return (
                  <tr key={p.codigo} className="border-b border-gray-50 hover:bg-emerald-50/40 transition">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-500">{p.codigo}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{p.descripcion}</p>
                      <p className="text-[11px] text-gray-400">{p.categoria}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 rounded-full px-2.5 py-1">{p.marca}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px]">{p.compatibilidad}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('font-bold', critico ? 'text-red-600' : 'text-gray-800')}>{p.stock}</span>
                      <span className="text-[10px] text-gray-400"> / mín {p.stockMinimo}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">${p.precioUSD.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      Bs. {(p.precioUSD * TASA_BS).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {critico ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-1">
                          <TrendingDown className="h-3 w-3" /> Reponer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    No se encontraron repuestos con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
