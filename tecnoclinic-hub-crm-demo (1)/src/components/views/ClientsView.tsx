import { useMemo, useState } from 'react';
import { Phone, Mail, Car, ChevronDown, MessageCircle, History, Star } from 'lucide-react';
import type { Client } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  clients: Client[];
  globalSearch: string;
  onOpenChat: () => void;
}

const tagStyle: Record<Client['etiqueta'], string> = {
  VIP: 'bg-amber-100 text-amber-700 border-amber-200',
  Frecuente: 'bg-sky-100 text-sky-700 border-sky-200',
  Nuevo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Flota: 'bg-violet-100 text-violet-700 border-violet-200',
};

export default function ClientsView({ clients, globalSearch, onOpenChat }: Props) {
  const [expanded, setExpanded] = useState<string | null>(clients[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.nombre, c.telefono, c.email, ...c.vehiculos.map((v) => `${v.modelo} ${v.placa}`)].join(' ').toLowerCase().includes(q)
    );
  }, [clients, globalSearch]);

  const totalVehiculos = clients.reduce((s, c) => s + c.vehiculos.length, 0);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Clientes registrados', value: clients.length },
          { label: 'Vehículos en cartera', value: totalVehiculos },
          { label: 'Clientes VIP / Flota', value: clients.filter((c) => c.etiqueta === 'VIP' || c.etiqueta === 'Flota').length },
          { label: 'Facturación histórica', value: `$${clients.reduce((s, c) => s + c.totalGastadoUSD, 0).toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-200 p-4">
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((c) => {
          const open = expanded === c.id;
          return (
            <div key={c.id} className="rounded-2xl bg-white border border-gray-200 overflow-hidden transition hover:border-emerald-200">
              <button
                onClick={() => setExpanded(open ? null : c.id)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {c.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{c.nombre}</p>
                    <span className={`text-[10px] font-bold rounded-full border px-2 py-0.5 ${tagStyle[c.etiqueta]}`}>
                      {c.etiqueta === 'VIP' && <Star className="h-2.5 w-2.5 inline mr-0.5 -mt-0.5" />}
                      {c.etiqueta}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {c.telefono}</span>
                    <span className="hidden sm:inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</span>
                  </p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-emerald-600">${c.totalGastadoUSD.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-400">{c.visitas} visitas · últ. {c.ultimaVisita}</p>
                </div>
                <ChevronDown className={cn('h-5 w-5 text-gray-400 transition-transform', open && 'rotate-180')} />
              </button>
              {open && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Vehículos ({c.vehiculos.length})
                    </p>
                    <div className="space-y-2">
                      {c.vehiculos.map((v) => (
                        <div key={v.placa} className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 p-3">
                          <div className="rounded-lg bg-sky-100 p-2 text-sky-600"><Car className="h-4 w-4" /></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{v.modelo}</p>
                            <p className="text-[11px] text-gray-500">
                              Placa <span className="font-mono font-bold">{v.placa}</span> · {v.km}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Acciones rápidas</p>
                    <button
                      onClick={onOpenChat}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 hover:bg-emerald-600 transition w-fit"
                    >
                      <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 px-4 py-2.5 hover:bg-gray-50 transition w-fit">
                      <History className="h-4 w-4" /> Ver historial de servicios
                    </button>
                    <div className="mt-1 rounded-xl bg-slate-900 text-white p-3.5">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">💡 Oportunidad detectada</p>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        {c.etiqueta === 'Flota'
                          ? 'Cliente de flota: ofrecer contrato de mantenimiento preventivo mensual con descuento corporativo.'
                          : c.etiqueta === 'VIP'
                            ? 'Cliente VIP: próximo cambio de aceite estimado en 3 semanas. Enviar recordatorio con 10% de descuento.'
                            : 'Enviar promoción de limpieza de inyectores por ultrasonido para fidelizar.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-10 text-center text-sm text-gray-400">
            No se encontraron clientes con «{globalSearch}».
          </div>
        )}
      </div>
    </div>
  );
}
