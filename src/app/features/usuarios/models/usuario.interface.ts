/**
 * Interfaces para el servicio de usuarios
 * Basado en la estructura de datos de la API: /api/admusr/v1
 */

export interface Usuario {
  id?: number;
  usuario: number;
  email: string;
  nombre: string;
  estado: number;
  logins: number;
  intentos: number;
  fecha_login: string | null;
  fecha_intento: string | null;
  fecha_m: string;
  fecha_a: string;
  fecha: string;
  id_session: number;
  logout: number;
}

/**
 * Respuesta estándar de la API
 * Patrón común para todos los servicios
 */
export interface ApiResponse<T> {
  statuscode: number;
  mensaje: string;
  data: T[];
}

/**
 * Interfaz para formularios de creación/edición
 * Campos editables por el usuario
 */
export interface UsuarioForm {
  id?: number;
  usuario: number;
  email: string;
  nombre: string;
  estado: number;
  logins?: number;
  intentos?: number;
  fecha_login?: string | null;
  fecha_intento?: string | null;
  fecha_m?: string;
  fecha_a?: string;
  fecha?: string;
  id_session?: number;
  logout?: number;
}

/**
 * Acciones disponibles para el método POST utilitario
 */
export type UsuarioAction = 'SL' | 'UP' | 'IN' | 'DL';

/**
 * Parámetros para operaciones con acción específica
 */
export interface UsuarioActionParams {
  action: UsuarioAction;
  data?: Partial<UsuarioForm>;
  id?: number;
}

/**
 * Filtros para búsqueda de usuarios
 */
export interface UsuarioFilters {
  estado?: number;
  email?: string;
  nombre?: string;
  usuario?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Opciones de paginación
 */
export interface UsuarioPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
