import { useMemo, useRef, useState, useEffect } from 'react';
import {
  Search,
  Send,
  Sparkles,
  Bot,
  User,
  Phone,
  Car,
  ClipboardList,
  CheckCheck,
  Paperclip,
  Smile,
  Loader2,
  BadgeCheck,
  X,
} from 'lucide-react';
import type { Chat, Order } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  chats: Chat[];
  orders: Order[];
  onSendMessage: (chatId: string, texto: string, from: 'agente' | 'ia') => void;
  onMarkRead: (chatId: string) => void;
  globalSearch: string;
}

const estadoStyle: Record<Chat['estado'], string> = {
  abierto: 'bg-emerald-100 text-emerald-700',
  pendiente: 'bg-amber-100 text-amber-700',
  resuelto: 'bg-gray-100 text-gray-500',
};

export default function WhatsAppView({ chats, orders, onSendMessage, onMarkRead, globalSearch }: Props) {
  const [activeId, setActiveId] = useState(chats[0]?.id ?? '');
  const [localSearch, setLocalSearch] = useState('');
  const [iaMode, setIaMode] = useState(true);
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const query = (localSearch || globalSearch).trim().toLowerCase();
  const filteredChats = useMemo(() => {
    if (!query) return chats;
    return chats.filter((c) =>
      [c.cliente, c.telefono, c.vehiculo, c.placa, c.ultimoMensaje].join(' ').toLowerCase().includes(query)
    );
  }, [chats, query]);

  const active = chats.find((c) => c.id === activeId) ?? chats[0];
  const ordenActiva = active?.ordenActiva ? orders.find((o) => o.id === active.ordenActiva) : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [active?.mensajes.length, activeId, suggestion]);

  if (!active) return null;

  const selectChat = (id: string) => {
    setActiveId(id);
    setSuggestion(null);
    setDraft('');
    onMarkRead(id);
  };

  const generateIA = () => {
    setGenerating(true);
    setSuggestion(null);
    setTimeout(() => {
      setSuggestion(active.sugerenciaIA);
      setGenerating(false);
    }, 1400);
  };

  const sendSuggestion = () => {
    if (!suggestion) return;
    onSendMessage(active.id, suggestion, 'ia');
    setSuggestion(null);
  };

  const sendDraft = () => {
    const t = draft.trim();
    if (!t) return;
    onSendMessage(active.id, t, 'agente');
    setDraft('');
  };

  return (
    <div className="h-[calc(100vh-65px)] flex overflow-hidden">
      {/* Chat list */}
      <div className="w-72 lg:w-80 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-3.5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-gray-900 text-sm">Conversaciones</h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              {chats.filter((c) => c.estado === 'abierto').length} abiertas
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar chat…"
              className="w-full rounded-lg bg-gray-50 border border-gray-200 pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((c) => (
            <button
              key={c.id}
              onClick={() => selectChat(c.id)}
              className={cn(
                'w-full flex items-start gap-3 px-3.5 py-3 border-b border-gray-50 text-left hover:bg-gray-50 transition',
                active.id === c.id && 'bg-emerald-50/70 hover:bg-emerald-50'
              )}
            >
              <div className={`h-10 w-10 rounded-full ${c.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {c.iniciales}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{c.cliente}</p>
                  <span className="text-[10px] text-gray-400 shrink-0">{c.hora}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{c.ultimoMensaje}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`text-[9px] font-bold rounded-full px-1.5 py-0.5 capitalize ${estadoStyle[c.estado]}`}>
                    {c.estado}
                  </span>
                  {c.noLeidos > 0 && (
                    <span className="ml-auto rounded-full bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 min-w-[16px] text-center">
                      {c.noLeidos}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 flex flex-col bg-[#ECE5DD]/60 min-w-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '18px 18px' }}>
        {/* Conversation header */}
        <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
          <div className={`h-9 w-9 rounded-full ${active.avatarColor} flex items-center justify-center text-white text-xs font-bold`}>
            {active.iniciales}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 inline-flex items-center gap-1.5">
              {active.cliente} <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
            </p>
            <p className="text-[11px] text-gray-500">{active.telefono} · en línea</p>
          </div>
          {/* IA switch */}
          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
            <span className={cn('text-[11px] font-bold', !iaMode ? 'text-gray-800' : 'text-gray-400')}>
              <User className="h-3.5 w-3.5 inline mr-0.5" /> Manual
            </span>
            <button
              onClick={() => setIaMode(!iaMode)}
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors',
                iaMode ? 'bg-emerald-500' : 'bg-gray-300'
              )}
              aria-label="Alternar asistente IA"
            >
              <span
                className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                  iaMode ? 'left-[18px]' : 'left-0.5'
                )}
              />
            </button>
            <span className={cn('text-[11px] font-bold', iaMode ? 'text-emerald-600' : 'text-gray-400')}>
              <Bot className="h-3.5 w-3.5 inline mr-0.5" /> IA
            </span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 space-y-2.5">
          <div className="text-center">
            <span className="text-[10px] font-semibold text-gray-500 bg-white/80 rounded-full px-3 py-1 shadow-sm">
              Hoy · Jueves 16 de enero
            </span>
          </div>
          {active.mensajes.map((m) => (
            <div key={m.id} className={cn('flex', m.from === 'cliente' ? 'justify-start' : 'justify-end')}>
              <div
                className={cn(
                  'max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm text-sm leading-relaxed',
                  m.from === 'cliente'
                    ? 'bg-white text-gray-800 rounded-tl-sm'
                    : m.from === 'ia'
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-[#D9FDD3] text-gray-800 rounded-tr-sm'
                )}
              >
                {m.from === 'ia' && (
                  <p className="text-[9px] font-bold text-emerald-200 uppercase tracking-wider mb-0.5 inline-flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Asistente IA · Tecnoclinic
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.texto}</p>
                <p className={cn('text-[9px] mt-1 text-right inline-flex items-center gap-0.5 w-full justify-end', m.from === 'cliente' ? 'text-gray-400' : m.from === 'ia' ? 'text-emerald-200' : 'text-gray-500')}>
                  {m.hora}
                  {m.from !== 'cliente' && <CheckCheck className="h-3 w-3 text-sky-500" />}
                </p>
              </div>
            </div>
          ))}

          {/* IA suggestion preview */}
          {suggestion && (
            <div className="flex justify-end">
              <div className="max-w-[78%] rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50 px-3.5 py-2.5">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Respuesta sugerida por IA
                </p>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{suggestion}</p>
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={sendSuggestion}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 hover:bg-emerald-600 transition"
                  >
                    <Send className="h-3 w-3" /> Enviar
                  </button>
                  <button
                    onClick={() => {
                      setDraft(suggestion);
                      setSuggestion(null);
                    }}
                    className="rounded-lg border border-emerald-300 text-emerald-700 text-xs font-bold px-3 py-1.5 hover:bg-emerald-100 transition"
                  >
                    Editar
                  </button>
                  <button onClick={() => setSuggestion(null)} className="rounded-lg text-gray-400 text-xs font-bold px-2 py-1.5 hover:text-gray-600">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="bg-white border-t border-gray-200 p-3">
          {iaMode && (
            <button
              onClick={generateIA}
              disabled={generating}
              className="mb-2.5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-emerald-600 text-white text-sm font-bold py-2.5 hover:opacity-90 transition disabled:opacity-60 shadow-lg shadow-violet-500/20"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> La IA está analizando la conversación…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generar respuesta sugerida con IA
                </>
              )}
            </button>
          )}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600"><Smile className="h-5 w-5" /></button>
            <button className="p-2 text-gray-400 hover:text-gray-600"><Paperclip className="h-5 w-5" /></button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendDraft()}
              placeholder={iaMode ? 'Escribe o usa la IA para responder…' : 'Escribe un mensaje como asesor…'}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              onClick={sendDraft}
              className="rounded-xl bg-emerald-500 p-2.5 text-white hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <Send className="h-4.5 w-4.5" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Context panel */}
      <div className="hidden xl:flex w-72 shrink-0 border-l border-gray-200 bg-white flex-col overflow-y-auto">
        <div className="p-5 border-b border-gray-100 text-center">
          <div className={`mx-auto h-16 w-16 rounded-full ${active.avatarColor} flex items-center justify-center text-white text-xl font-bold`}>
            {active.iniciales}
          </div>
          <p className="mt-3 font-bold text-gray-900">{active.cliente}</p>
          <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-0.5">
            <Phone className="h-3 w-3" /> {active.telefono}
          </p>
          <span className={`mt-2 inline-block text-[10px] font-bold rounded-full px-2.5 py-1 capitalize ${estadoStyle[active.estado]}`}>
            Chat {active.estado}
          </span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Vehículo asociado</p>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center gap-2.5">
              <div className="rounded-lg bg-sky-100 p-2 text-sky-600"><Car className="h-4 w-4" /></div>
              <div>
                <p className="text-sm font-bold text-gray-800">{active.vehiculo}</p>
                <p className="text-[11px] text-gray-500 font-mono">{active.placa}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Orden activa</p>
            {ordenActiva ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <ClipboardList className="h-4 w-4 text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700">{ordenActiva.id}</p>
                </div>
                <p className="text-xs text-gray-700 leading-snug">{ordenActiva.servicio}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">
                    {ordenActiva.stage.replace(/-/g, ' ')}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">${ordenActiva.presupuestoUSD}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Sin órdenes activas</p>
            )}
          </div>
          <div className="rounded-xl bg-slate-900 p-4 text-white">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 inline-flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" /> Resumen IA del cliente
            </p>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Cliente {active.estado === 'resuelto' ? 'satisfecho, candidato a programa de fidelidad' : 'con intención de compra alta'}.
              La IA recomienda responder en menos de 5 minutos y ofrecer agendar cita directa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
