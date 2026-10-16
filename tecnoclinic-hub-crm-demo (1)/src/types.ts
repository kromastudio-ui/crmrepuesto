export type ViewId =
  | 'dashboard'
  | 'citas'
  | 'kanban'
  | 'clientes'
  | 'inventario'
  | 'whatsapp';

export type Role = 'Administrador' | 'Asesor';

export type OrderStage =
  | 'por-cotizar'
  | 'cita-agendada'
  | 'en-diagnostico'
  | 'esperando-repuesto'
  | 'listo-entrega'
  | 'entregado';

export interface Order {
  id: string;
  cliente: string;
  telefono: string;
  vehiculo: string;
  placa: string;
  servicio: string;
  presupuestoUSD: number;
  stage: OrderStage;
  prioridad: 'alta' | 'media' | 'baja';
  tecnico: string;
  fechaIngreso: string;
  notas: string;
}

export interface Vehicle {
  modelo: string;
  placa: string;
  anio: number;
  km: string;
}

export interface Client {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  vehiculos: Vehicle[];
  totalGastadoUSD: number;
  visitas: number;
  ultimaVisita: string;
  etiqueta: 'VIP' | 'Frecuente' | 'Nuevo' | 'Flota';
}

export interface Part {
  codigo: string;
  descripcion: string;
  marca: string;
  categoria: string;
  compatibilidad: string;
  stock: number;
  stockMinimo: number;
  precioUSD: number;
}

export interface ChatMessage {
  id: string;
  from: 'cliente' | 'agente' | 'ia';
  texto: string;
  hora: string;
}

export interface Chat {
  id: string;
  cliente: string;
  telefono: string;
  avatarColor: string;
  iniciales: string;
  ultimoMensaje: string;
  hora: string;
  noLeidos: number;
  estado: 'abierto' | 'pendiente' | 'resuelto';
  vehiculo: string;
  placa: string;
  ordenActiva: string | null;
  mensajes: ChatMessage[];
  sugerenciaIA: string;
}

export interface Appointment {
  id: string;
  cliente: string;
  telefono: string;
  vehiculo: string;
  servicio: string;
  fecha: string; // YYYY-MM-DD
  hora: string;
  estado: 'confirmada' | 'pendiente' | 'completada';
}
