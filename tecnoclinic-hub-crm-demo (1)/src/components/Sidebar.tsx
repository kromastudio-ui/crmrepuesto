import {
  LayoutDashboard,
  CalendarDays,
  KanbanSquare,
  Users,
  PackageSearch,
  MessageCircle,
  Wrench,
  ChevronDown,
  Zap,
} from 'lucide-react';
import type { ViewId, Role } from '../types';
import { cn } from '../utils/cn';

interface SidebarProps {
  view: ViewId;
  onNavigate: (v: ViewId) => void;
  role: Role;
  onRoleChange: (r: Role) => void;
  unreadChats: number;
}

const groups: {
  title: string;
  items: { id: ViewId; label: string; icon: React.ElementType }[];
}[] = [
  {
    title: 'General',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'citas', label: 'Citas', icon: CalendarDays },
    ],
  },
  {
    title: 'Taller',
    items: [
      { id: 'kanban', label: 'Órdenes (Kanban)', icon: KanbanSquare },
      { id: 'clientes', label: 'Clientes & Vehículos', icon: Users },
      { id: 'inventario', label: 'Inventario', icon: PackageSearch },
    ],
  },
  {
    title: 'Comunicación',
    items: [{ id: 'whatsapp', label: 'Bandeja WhatsApp', icon: MessageCircle }],
  },
];

export default function Sidebar({ view, onNavigate, role, onRoleChange, unreadChats }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#0F172A] text-slate-300 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight tracking-tight">
              Tecno<span className="text-emerald-400">Clinic</span> Hub
            </p>
            <p className="text-[10px] text-slate-500 font-medium">CRM Automotriz · RIF J-311592024</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-300">Sede Maripérez · Caracas</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {g.title}
            </p>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = view === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'bg-emerald-500/15 text-emerald-300 shadow-inner'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    )}
                  >
                    <Icon className={cn('h-4.5 w-4.5', active && 'text-emerald-400')} size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === 'whatsapp' && unreadChats > 0 && (
                      <span className="rounded-full bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center">
                        {unreadChats}
                      </span>
                    )}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Promo card */}
        <div className="mx-1 rounded-xl bg-gradient-to-br from-emerald-600/20 to-sky-600/10 border border-emerald-500/20 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-bold text-white">Asistente IA activo</p>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Responde cotizaciones por WhatsApp automáticamente, 24/7.
          </p>
        </div>
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {role === 'Administrador' ? 'JT' : 'MA'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {role === 'Administrador' ? 'Jorge Tecnoclinic' : 'María Asesora'}
            </p>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => onRoleChange(e.target.value as Role)}
                className="w-full appearance-none bg-transparent text-[11px] text-slate-400 font-medium cursor-pointer focus:outline-none pr-4"
              >
                <option value="Administrador" className="bg-slate-900">Administrador</option>
                <option value="Asesor" className="bg-slate-900">Asesor</option>
              </select>
              <ChevronDown className="h-3 w-3 text-slate-500 absolute right-0 top-0.5 pointer-events-none" />
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-400" title="En línea" />
        </div>
      </div>
    </aside>
  );
}
