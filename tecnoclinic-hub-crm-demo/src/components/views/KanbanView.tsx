import { useMemo, useState } from 'react';
import {
  Phone,
  Car,
  ChevronRight,
  X,
  User,
  Wrench,
  FileText,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  GripVertical,
} from 'lucide-react';
import type { Order, OrderStage } from '../../types';
import { STAGES, TASA_BS } from '../../data/mockData';
import { cn } from '../../utils/cn';

interface Props {
  orders: Order[];
  onMove: (id: string, stage: OrderStage) => void;
  search: string;
}

const prioridadStyle: Record<Order['prioridad'], string> = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-amber-100 text-amber-700',
  baja: 'bg-gray-100 text-gray-600',
};

export default function KanbanView({ orders, onMove, search }: Props) {
  const [selected, setSelected] = useState<Order | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<OrderStage | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      [o.cliente, o.vehiculo, o.placa, o.servicio, o.id, o.telefono].join(' ').toLowerCase().includes(q)
    );
  }, [orders, search]);

  const stageIndex = (s: OrderStage) => STAGES.findIndex((st) => st.id === s);

  const advance = (o: Order) => {
    const idx = stageIndex(o.stage);
    if (idx < STAGES.length - 1) onMove(o.id, STAGES[idx + 1].id);
  };
  const goBack = (o: Order) => {
    const idx = stageIndex(o.stage);
    if (idx > 0) onMove(o.id, STAGES[idx - 1].id);
  };

  const selectedLive = selected ? orders.find((o) => o.id === selected.id) ?? null : null;

  return (
    <div className="p-4 md:p-6 h-full">
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[70vh]">
        {STAGES.map((stage) => {
          const items = filtered.filter((o) => o.stage === stage.id);
          const total = items.reduce((s, o) => s + o.presupuestoUSD, 0);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverStage(stage.id);
              }}
              onDragLeave={() => setOverStage(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) onMove(dragId, stage.id);
                setDragId(null);
                setOverStage(null);
              }}
              className={cn(
                'w-72 shrink-0 rounded-2xl bg-gray-100/80 border border-gray-200 transition',
                overStage === stage.id && 'ring-2 ring-emerald-400 bg-emerald-50/60'
              )}
            >
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                <h3 className="text-sm font-bold text-gray-800 flex-1">{stage.label}</h3>
                <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>
              <p className="px-4 pb-2 text-[11px] text-gray-400 font-medium">${total.toLocaleString()} en juego</p>
              <div className="px-2.5 pb-3 space-y-2.5 max-h-[62vh] overflow-y-auto">
                {items.map((o) => (
                  <div
                    key={o.id}
                    draggable
                    onDragStart={() => setDragId(o.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => setSelected(o)}
                    className={cn(
                      'group rounded-xl bg-white border border-gray-200 p-3.5 cursor-pointer shadow-sm hover:shadow-md hover:border-emerald-300 transition select-none',
                      dragId === o.id && 'opacity-50 rotate-1'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider">{o.id}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 capitalize ${prioridadStyle[o.prioridad]}`}>
                          {o.prioridad}
                        </span>
                        <GripVertical className="h-3.5 w-3.5 text-gray-300" />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{o.cliente}</p>
                    <p className="text-[11px] text-gray-500 inline-flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> {o.telefono}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5">
                      <Car className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                      <p className="text-[11px] font-semibold text-gray-700 truncate">
                        {o.vehiculo} · <span className="font-mono">{o.placa}</span>
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 leading-snug line-clamp-2">{o.servicio}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-emerald-600">${o.presupuestoUSD}</p>
                      {stageIndex(o.stage) < STAGES.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            advance(o);
                          }}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-full px-2 py-1 transition"
                          title="Mover a la siguiente etapa"
                        >
                          Avanzar <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                    Suelta una tarjeta aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selectedLive && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-400 tracking-widest">{selectedLive.id}</p>
                <h3 className="text-lg font-bold text-white">{selectedLive.cliente}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/10 text-slate-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow icon={Phone} label="Teléfono" value={selectedLive.telefono} />
                <InfoRow icon={Car} label="Vehículo" value={`${selectedLive.vehiculo} · ${selectedLive.placa}`} />
                <InfoRow icon={User} label="Técnico asignado" value={selectedLive.tecnico} />
                <InfoRow icon={FileText} label="Fecha de ingreso" value={selectedLive.fechaIngreso} />
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 inline-flex items-center gap-1">
                  <Wrench className="h-3.5 w-3.5" /> Servicio solicitado
                </p>
                <p className="text-sm text-gray-800">{selectedLive.servicio}</p>
                <p className="text-xs text-gray-500 mt-2 italic">📝 {selectedLive.notas}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                <p className="text-sm font-semibold text-emerald-800 inline-flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" /> Presupuesto estimado
                </p>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">${selectedLive.presupuestoUSD}</p>
                  <p className="text-[11px] text-emerald-700">
                    ≈ Bs. {(selectedLive.presupuestoUSD * TASA_BS).toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              {/* Stage stepper */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Etapa actual</p>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((st, i) => {
                    const currentIdx = stageIndex(selectedLive.stage);
                    const done = i < currentIdx;
                    const current = i === currentIdx;
                    return (
                      <button
                        key={st.id}
                        onClick={() => onMove(selectedLive.id, st.id)}
                        className={cn(
                          'text-[10px] font-bold rounded-full px-2.5 py-1.5 border transition',
                          current
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                            : done
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-white text-gray-400 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                        )}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => goBack(selectedLive)}
                  disabled={stageIndex(selectedLive.stage) === 0}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  <ArrowLeft className="h-4 w-4" /> Retroceder
                </button>
                <button
                  onClick={() => advance(selectedLive)}
                  disabled={stageIndex(selectedLive.stage) === STAGES.length - 1}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition"
                >
                  Avanzar etapa <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide inline-flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}
