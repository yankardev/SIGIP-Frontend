// Contratos de la API de SIGIP (mismos nombres de campos que los DTO del backend).

export type Rol = 'ADMIN' | 'CLIENTE';

export interface Usuario {
  idusuario: number;
  nomusuario: string;
  email: string;
  nombres: string;
  apellidos: string;
  activo: boolean;
  roles: Rol[];
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuario: Usuario;
}

export interface UsuarioRequest {
  nomusuario: string;
  email: string;
  password?: string;
  nombres: string;
  apellidos: string;
  activo?: boolean;
  roles?: Rol[];
}

export interface Categoria {
  idcategoria: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Servicio {
  idservicio: number;
  nombre: string;
  descripcion: string | null;
  precioBase: number;
  requiereCotizacion: boolean;
  activo: boolean;
  idcategoria: number;
  categoria: string;
}

export interface ServicioRequest {
  nombre: string;
  descripcion: string;
  precioBase: number;
  requiereCotizacion: boolean;
  idcategoria: number;
  activo: boolean;
}

export const ESTADOS_PEDIDO = [
  'REGISTRADO', 'PAGO_EN_REVISION', 'CONFIRMADO', 'EN_DISENO',
  'EN_PRODUCCION', 'TERMINADO', 'ENTREGADO', 'CANCELADO',
] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

export interface Pedido {
  idpedido: number;
  cliente: string;
  idservicio: number;
  nombreServicio: string;
  precioUnitario: number;
  cantidad: number;
  total: number;
  estado: EstadoPedido;
  siguientesEstados: EstadoPedido[];
  especificaciones: string | null;
  observacion: string | null;
  fechaPedido: string;
  fechaActualizacion: string | null;
}

export interface PedidoRequest {
  idservicio: number;
  cantidad: number;
  especificaciones: string;
}

export const METODOS_PAGO = ['YAPE', 'PLIN', 'TRANSFERENCIA', 'EFECTIVO'] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export interface Pago {
  idpago: number;
  idpedido: number;
  monto: number;
  metodo: MetodoPago;
  numeroOperacion: string;
  estado: 'PENDIENTE' | 'VERIFICADO' | 'RECHAZADO';
  fechaRegistro: string;
  fechaVerificacion: string | null;
  verificadoPor: string | null;
  observacion: string | null;
}

export interface PagoRequest {
  monto: number;
  metodo: MetodoPago;
  numeroOperacion: string;
}

export type EstadoDiseno = 'EN_REVISION' | 'APROBADO' | 'OBSERVADO' | 'REEMPLAZADO';

export interface Diseno {
  iddiseno: number;
  idpedido: number;
  cliente: string;
  version: number;
  nombreArchivo: string;
  urlArchivo: string | null;
  descripcion: string | null;
  estado: EstadoDiseno;
  comentarioCliente: string | null;
  registradoPor: string;
  fechaRegistro: string;
  fechaDecision: string | null;
}

export interface DisenoRequest {
  idpedido: number;
  nombreArchivo: string;
  urlArchivo: string;
  descripcion: string;
}

export const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA'] as const;
export type Prioridad = (typeof PRIORIDADES)[number];
export const ESTADOS_ORDEN = ['PENDIENTE', 'EN_PROCESO', 'OBSERVADA', 'TERMINADA'] as const;
export type EstadoOrden = (typeof ESTADOS_ORDEN)[number];

export interface Orden {
  idorden: number;
  idpedido: number;
  descripcionTrabajo: string;
  estado: EstadoOrden;
  prioridad: Prioridad;
  responsable: string | null;
  reprocesos: number;
  fechaRegistro: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  observacion: string | null;
}

export interface OrdenRequest {
  idpedido: number;
  prioridad: Prioridad;
  responsable: string;
  observacion: string;
}

export interface Insumo {
  idinsumo: number;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
  bajoStock: boolean;
}

export interface InsumoRequest {
  codigo: string;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
}

export interface Movimiento {
  idmovimiento: number;
  idinsumo: number;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  stockResultante: number;
  motivo: string;
  idpedido: number | null;
  usuario: string;
  fecha: string;
}

export interface MovimientoRequest {
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  motivo: string;
  idpedido: number | null;
}

export const CANALES = ['SISTEMA', 'EMAIL', 'WHATSAPP'] as const;
export type Canal = (typeof CANALES)[number];

export interface Notificacion {
  idnotificacion: number;
  destinatario: string;
  canal: Canal;
  asunto: string;
  mensaje: string;
  estado: 'PENDIENTE' | 'ENVIADA' | 'LEIDA';
  idpedido: number | null;
  fecha: string;
  fechaLectura: string | null;
}

export interface NotificacionRequest {
  destinatario: string;
  canal: Canal;
  asunto: string;
  mensaje: string;
  idpedido: number | null;
}

export interface ResumenVentas {
  totalPedidos: number;
  pedidosPorEstado: Record<string, number>;
  ventasConfirmadas: number;
}

export interface InsumoCritico {
  idinsumo: number;
  codigo: string;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
}

export interface Dashboard {
  generadoEn: string;
  ventas: ResumenVentas | null;
  pedidosPorAtender: number;
  pedidosEnTaller: number;
  insumosBajoStock: InsumoCritico[];
  avisos: string[];
}

/** Formato único de error del backend (sigip-common ApiError). */
export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
}
