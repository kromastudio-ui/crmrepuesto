import { useState } from 'react';
import { CalendarDays, Clock, Car, Phone, CheckCircle2, CircleDashed, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  appointments: Appointment[];
  onToggleEstado: (id: string) => void;
}

// Semana demo: 13–19 enero 2025
const week = [
  { fecha: '2025-01-13', dia: 'Lun', num: 13 },
  { fecha: '2025-01-14', dia: 'Mar', num: 14 },
  { fecha: '2025-01-15', dia: 'Mié', num: 15 },
  { fecha: '2025-01-16', dia: 'Jue', num: 16 },
  { fecha: '2025-01-17', dia: 'Vie', num: 17 },
  { fecha: '2025-01-18', dia: 'Sáb', num: 18 },
  { fecha: '2025-01-20', dia: 'Lun', num: 20 },
];

const HOY = '2025-01-16';

export default function AppointmentsView({ appointments, onToggleEstado }: Props) {
  const [selectedDay, setSelectedDay] = useState(HOY);

  const citasDia = appointments.filter((a) => a.fecha === selectedDay);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Week selector */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 inline-flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-500" /> Enero 2025
          </h3>
          <div className="flex gap-1">
            <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50"><ChevronLeft className="h-4 w-4" /></button>
            <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {week.map((d) => {
            const count = appointments.filter((a) => a.fecha === d.fecha).length;
            const active = selectedDay === d.fecha;
            return (
              <button
                key={d.fecha}
                onClick={() => setSelectedDay(d.fecha)}
                className={cn(
                  'rounded-xl border p-3 text-center transition relative',
                  active
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
                )}
              >
                <p className={cn('text-[10px] font-bold uppercase', active ? 'text-emerald-400' : 'text-gray-400')}>{d.dia}</p>
                <p className="text-lg font-bold">{d.num}</p>
                {d.fecha === HOY && (
                  <span className={cn('text-[8px] font-bold uppercase', active ? 'text-emerald-300' : 'text-emerald-600')}>Hoy</span>
                )}
                {count > 0 && (
                  <span
                    className={cn(
                      'absolute top-1.5 right-1.5 h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center',
                      active ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day agenda */}
      <div className="rounded-2xl bg-white border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">
              Agenda del {week.find((d) => d.fecha === selectedDay)?.dia} {week.find((d) => d.fecha === selectedDay)?.num} de enero
            </h3>
            <p className="text-xs text-gray-400">{citasDia.length} citas programadas · haz clic en el estado para confirmar</p>
          </div>
        </div>
        {citasDia.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarDays className="h-10 w-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Sin citas para este día. ¡Agenda disponible!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {citasDia
              .slice()
              .sort((a, b) => a.hora.localeCompare(b.hora))
              .map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 hover:border-emerald-200 transition"
                >
                  <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2 w-fit">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-bold text-gray-800">{c.hora}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{c.cliente}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-3 flex-wrap mt-0.5">
                      <span className="inline-flex items-center gap-1"><Car className="h-3 w-3" /> {c.vehiculo}</span>
                      <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {c.telefono}</span>
                    </p>
                    <p className="text-xs font-medium text-sky-700 mt-1">🔧 {c.servicio}</p>
                  </div>
                  <button
                    onClick={() => onToggleEstado(c.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition active:scale-95 w-fit',
                      c.estado === 'confirmada'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : c.estado === 'completada'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    )}
                  >
                    {c.estado === 'pendiente' ? <CircleDashed className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    {c.estado === 'confirmada' ? 'Confirmada' : c.estado === 'completada' ? 'Completada' : 'Por confirmar'}
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
