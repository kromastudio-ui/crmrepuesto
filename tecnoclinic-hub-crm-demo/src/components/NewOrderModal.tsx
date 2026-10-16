import { useState } from 'react';
import { X, ClipboardPlus, CheckCircle2 } from 'lucide-react';
import type { Order } from '../types';

interface Props {
  onClose: () => void;
  onCreate: (o: Order) => void;
  nextId: string;
}

export default function NewOrderModal({ onClose, onCreate, nextId }: Props) {
  const [form, setForm] = useState({
    cliente: '',
    telefono: '+58 412-',
    vehiculo: '',
    placa: '',
    servicio: '',
    presupuesto: '',
    prioridad: 'media' as Order['prioridad'],
  });
  const [created, setCreated] = useState(false);

  const valid = form.cliente.trim() && form.vehiculo.trim() && form.servicio.trim();

  const submit = () => {
    if (!valid) return;
    onCreate({
      id: nextId,
      cliente: form.cliente.trim(),
      telefono: form.telefono.trim(),
      vehiculo: form.vehiculo.trim(),
      placa: form.placa.trim().toUpperCase() || 'S/P',
      servicio: form.servicio.trim(),
      presupuestoUSD: Number(form.presupuesto) || 0,
      stage: 'por-cotizar',
      prioridad: form.prioridad,
      tecnico: 'Por asignar',
      fechaIngreso: '2025-01-16',
      notas: 'Orden creada desde la demo interactiva.',
    });
    setCreated(true);
    setTimeout(onClose, 1400);
  };

  const field = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/20 p-2"><ClipboardPlus className="h-4 w-4 text-emerald-400" /></div>
            <div>
              <h3 className="font-bold text-white">Nueva Orden de Trabajo</h3>
              <p className="text-[11px] text-slate-400">Se creará como «Por Cotizar» · {nextId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-300"><X className="h-5 w-5" /></button>
        </div>

        {created ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-gray-900">¡Orden {nextId} creada!</p>
            <p className="text-sm text-gray-500">Ya está visible en el tablero Kanban.</p>
          </div>
        ) : (
          <div className="p-6 space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Cliente *</label>
                <input className={field} placeholder="Ej. Juan Pérez" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Teléfono</label>
                <input className={field} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Placa</label>
                <input className={field} placeholder="AA123BB" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Vehículo *</label>
                <input className={field} placeholder="Ej. Chevrolet Aveo 2012" value={form.vehiculo} onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500">Falla / Servicio solicitado *</label>
                <textarea rows={2} className={field} placeholder="Ej. Limpieza de inyectores por ultrasonido" value={form.servicio} onChange={(e) => setForm({ ...form, servicio: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Presupuesto est. (USD)</label>
                <input type="number" className={field} placeholder="0" value={form.presupuesto} onChange={(e) => setForm({ ...form, presupuesto: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Prioridad</label>
                <select className={field} value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value as Order['prioridad'] })}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>
            <button
              onClick={submit}
              disabled={!valid}
              className="w-full rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold py-3 text-sm shadow-lg shadow-emerald-500/25 transition disabled:opacity-40 active:scale-[0.99]"
            >
              Crear orden de trabajo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
