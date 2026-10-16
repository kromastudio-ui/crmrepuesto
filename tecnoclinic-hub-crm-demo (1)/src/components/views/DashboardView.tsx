import {
  DollarSign,
  Wrench,
  AlertTriangle,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { Order, Part, Appointment, ViewId } from '../../types';
import { serviciosDemandados, ingresosSemanales, TASA_BS, STAGES } from '../../data/mockData';

interface Props {
  orders: Order[];
  parts: Part[];
  appointments: Appointment[];
  onNavigate: (v: ViewId) => void;
}

const HOY = '2025-01-16';

export default function DashboardView({ orders, parts, appointments, onNavigate }: Props) {
  const ingresosMes = 7840 + orders.filter((o) => o.stage === 'entregado').reduce((s, o) => s + o.presupuestoUSD, 0);
  const activas = orders.filter((o) => o.stage !== 'entregado').length;
  const criticos = parts.filter((p) => p.stock <= p.stockMinimo);
  const citasHoy = appointments.filter((a) => a.fecha === HOY);
  const maxMonto = Math.max(...ingresosSemanales.map((d) => d.monto));
  const maxServicio = Math.max(...serviciosDemandados.map((s) => s.cantidad));

  const kpis = [
    {
      label: 'Ingresos del mes',
      value: `$${ingresosMes.toLocaleString('en-US')}`,
      sub: `≈ Bs. ${(ingresosMes * TASA_BS).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`,
      delta: '+18% vs. diciembre',
      icon: DollarSign,
      iconBg: 'bg-emerald-100 text-emerald-600',
      onClick: () => onNavigate('kanban'),
    },
    {
      label: 'Órdenes activas en taller',
      value: String(activas),
      sub: `${orders.filter((o) => o.stage === 'listo-entrega').length} listas para entrega`,
      delta: 'Flujo saludable',
      icon: Wrench,
      iconBg: 'bg-sky-100 text-sky-600',
      onClick: () => onNavigate('kanban'),
    },
    {
      label: 'Repuestos críticos',
      value: String(criticos.length),
      sub: 'Por debajo del stock mínimo',
      delta: 'Reponer esta semana',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 text-amber-600',
      onClick: () => onNavigate('inventario'),
      alert: criticos.length > 0,
    },
    {
      label: 'Citas de hoy',
      value: String(citasHoy.length),
      sub: `${citasHoy.filter((c) => c.estado === 'confirmada').length} confirmadas`,
      delta: 'Jueves 16 Ene',
      icon: CalendarCheck,
      iconBg: 'bg-violet-100 text-violet-600',
      onClick: () => onNavigate('citas'),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-medium text-emerald-300 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Demo interactiva · TecnoClinic Hub
          </div>
          <h2 className="text-xl md:text-2xl font-bold">¡Buenos días, equipo Tecnoclinic! 🔧</h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Hoy tienes <span className="text-emerald-300 font-semibold">{citasHoy.length} citas</span> agendadas,{' '}
            <span className="text-emerald-300 font-semibold">{activas} vehículos</span> en el taller y el asistente IA ya
            respondió <span className="text-emerald-300 font-semibold">14 consultas</span> por WhatsApp esta mañana.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <button
              key={k.label}
              onClick={k.onClick}
              className="text-left rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-lg hover:border-emerald-200 transition group"
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-xl p-2.5 ${k.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition" />
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900 flex items-center gap-2">
                {k.value}
                {k.alert && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
              </p>
              <p className="text-sm font-medium text-gray-600">{k.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-2 inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {k.delta}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Weekly revenue chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Ingresos de la semana</h3>
              <p className="text-xs text-gray-400">USD facturados por día</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
              $5,530 total
            </span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {ingresosSemanales.map((d) => (
              <div key={d.dia} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition">
                  ${d.monto}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    d.monto === maxMonto ? 'bg-emerald-500' : 'bg-emerald-200 group-hover:bg-emerald-400'
                  }`}
                  style={{ height: `${(d.monto / maxMonto) * 100}%` }}
                />
                <span className="text-[11px] text-gray-500 font-medium">{d.dia}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top services */}
        <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Servicios más demandados</h3>
              <p className="text-xs text-gray-400">Enero 2025 · unidades realizadas e ingresos</p>
            </div>
          </div>
          <div className="space-y-4">
            {serviciosDemandados.map((s) => (
              <div key={s.nombre}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{s.nombre}</span>
                  <span className="text-xs text-gray-400">
                    <span className="font-bold text-gray-700">{s.cantidad}</span> servicios ·{' '}
                    <span className="font-semibold text-emerald-600">${s.ingresos.toLocaleString()}</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all`}
                    style={{ width: `${(s.cantidad / maxServicio) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today appointments */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-500" /> Citas de hoy
            </h3>
            <button onClick={() => onNavigate('citas')} className="text-xs font-semibold text-emerald-600 hover:underline">
              Ver calendario →
            </button>
          </div>
          <div className="space-y-3">
            {citasHoy.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <div className="rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 text-center min-w-[70px]">
                  <p className="text-xs font-bold text-gray-800">{c.hora}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{c.cliente}</p>
                  <p className="text-xs text-gray-500 truncate">{c.vehiculo} · {c.servicio}</p>
                </div>
                <span
                  className={`text-[10px] font-bold rounded-full px-2 py-1 ${
                    c.estado === 'confirmada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {c.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Workshop pipeline snapshot */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 inline-flex items-center gap-2">
              <Wrench className="h-4 w-4 text-sky-500" /> Estado del taller
            </h3>
            <button onClick={() => onNavigate('kanban')} className="text-xs font-semibold text-emerald-600 hover:underline">
              Abrir Kanban →
            </button>
          </div>
          <div className="space-y-2.5">
            {STAGES.map((st) => {
              const count = orders.filter((o) => o.stage === st.id).length;
              return (
                <div key={st.id} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${st.color}`} />
                  <span className="flex-1 text-sm text-gray-600">{st.label}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: count }).map((_, i) => (
                      <span key={i} className={`h-5 w-1.5 rounded-sm ${st.color} opacity-70`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              <span className="font-bold">{criticos.length} repuestos críticos:</span>{' '}
              {criticos.slice(0, 3).map((p) => p.descripcion.split(' ').slice(0, 3).join(' ')).join(', ')}…{' '}
              <button onClick={() => onNavigate('inventario')} className="font-bold underline">
                Revisar inventario
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
