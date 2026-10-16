import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/views/DashboardView';
import KanbanView from './components/views/KanbanView';
import WhatsAppView from './components/views/WhatsAppView';
import InventoryView from './components/views/InventoryView';
import ClientsView from './components/views/ClientsView';
import AppointmentsView from './components/views/AppointmentsView';
import NewOrderModal from './components/NewOrderModal';
import {
  initialOrders,
  initialClients,
  initialParts,
  initialChats,
  initialAppointments,
} from './data/mockData';
import type { ViewId, Role, Order, OrderStage, Chat, ChatMessage } from './types';
import { X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard');
  const [role, setRole] = useState<Role>('Administrador');
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [showNewOrder, setShowNewOrder] = useState(false);

  const navigate = (v: ViewId) => {
    setView(v);
    setSearch('');
    setMobileMenu(false);
  };

  const moveOrder = (id: string, stage: OrderStage) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));
  };

  const createOrder = (o: Order) => {
    setOrders((prev) => [o, ...prev]);
    setView('kanban');
  };

  const sendMessage = (chatId: string, texto: string, from: 'agente' | 'ia') => {
    const hora = new Date().toLocaleTimeString('es-VE', { hour: 'numeric', minute: '2-digit', hour12: true });
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        const msg: ChatMessage = { id: `m${Date.now()}`, from, texto, hora };
        return { ...c, mensajes: [...c.mensajes, msg], ultimoMensaje: texto, hora, estado: 'abierto' };
      })
    );
  };

  const markRead = (chatId: string) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, noLeidos: 0 } : c)));
  };

  const toggleAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, estado: a.estado === 'pendiente' ? 'confirmada' : a.estado === 'confirmada' ? 'completada' : 'pendiente' }
          : a
      )
    );
  };

  const unread = chats.reduce((s, c) => s + c.noLeidos, 0);
  const nextOrderId = `OT-${1050 + orders.filter((o) => o.id.startsWith('OT-10') && Number(o.id.slice(3)) >= 1050).length}`;

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-gray-900 antialiased">
      <Sidebar view={view} onNavigate={navigate} role={role} onRoleChange={setRole} unreadChats={unread} />

      {/* Mobile sidebar overlay */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenu(false)} />
          <div className="absolute left-0 top-0 h-full">
            <div className="relative h-full [&>aside]:flex [&>aside]:h-full">
              <Sidebar view={view} onNavigate={navigate} role={role} onRoleChange={setRole} unreadChats={unread} />
            </div>
            <button
              onClick={() => setMobileMenu(false)}
              className="absolute top-4 -right-12 rounded-full bg-white/10 p-2 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          view={view}
          search={search}
          onSearch={setSearch}
          onNewOrder={() => setShowNewOrder(true)}
          onMenuToggle={() => setMobileMenu(true)}
        />
        <main className="flex-1">
          {view === 'dashboard' && (
            <DashboardView orders={orders} parts={initialParts} appointments={appointments} onNavigate={navigate} />
          )}
          {view === 'citas' && <AppointmentsView appointments={appointments} onToggleEstado={toggleAppointment} />}
          {view === 'kanban' && <KanbanView orders={orders} onMove={moveOrder} search={search} />}
          {view === 'clientes' && (
            <ClientsView clients={initialClients} globalSearch={search} onOpenChat={() => navigate('whatsapp')} />
          )}
          {view === 'inventario' && <InventoryView parts={initialParts} globalSearch={search} />}
          {view === 'whatsapp' && (
            <WhatsAppView
              chats={chats}
              orders={orders}
              onSendMessage={sendMessage}
              onMarkRead={markRead}
              globalSearch={search}
            />
          )}
        </main>
      </div>

      {showNewOrder && (
        <NewOrderModal onClose={() => setShowNewOrder(false)} onCreate={createOrder} nextId={nextOrderId} />
      )}
    </div>
  );
}
