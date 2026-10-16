import { Search, Plus, Bell, MapPin, ChevronDown, Menu } from 'lucide-react';
import type { ViewId } from '../types';

const titles: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Resumen operativo del taller en tiempo real' },
  citas: { title: 'Agenda de Citas', subtitle: 'Calendario de servicios programados' },
  kanban: { title: 'Tablero de Órdenes', subtitle: 'Flujo de trabajo del taller · arrastra o haz clic para avanzar' },
  clientes: { title: 'Clientes & Vehículos', subtitle: 'Base de datos de clientes y su historial' },
  inventario: { title: 'Inventario de Repuestos', subtitle: 'Stock de la tienda · ACDelco, Bosch, Denso, Motul' },
  whatsapp: { title: 'Bandeja WhatsApp Multiagente', subtitle: 'Atención al cliente con Asistente IA' },
};

interface HeaderProps {
  view: ViewId;
  search: string;
  onSearch: (s: string) => void;
  onNewOrder: () => void;
  onMenuToggle: () => void;
}

export default function Header({ view, search, onSearch, onNewOrder, onMenuToggle }: HeaderProps) {
  const t = titles[view];
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 px-4 md:px-6 py-3">
      <div className="flex items-center gap-3 md:gap-4">
        <button onClick={onMenuToggle} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden lg:block min-w-0">
          <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">{t.title}</h1>
          <p className="text-xs text-gray-500 truncate">{t.subtitle}</p>
        </div>

        {/* Global search */}
        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar cliente, placa, orden o repuesto…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
          />
        </div>

        {/* Sede selector */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 relative">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <select className="appearance-none bg-transparent font-medium text-sm focus:outline-none cursor-pointer pr-4">
            <option>Sede Maripérez</option>
            <option>Sede La Candelaria (próx.)</option>
          </select>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 absolute right-2.5 pointer-events-none" />
        </div>

        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          onClick={onNewOrder}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 shadow-lg shadow-emerald-500/25 transition active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Orden</span>
        </button>
      </div>
    </header>
  );
}
