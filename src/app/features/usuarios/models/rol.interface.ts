/**
 * Interfaces para el servicio de roles
 * Basado en la estructura de datos de la API: /api/adminUsr/rol
 */

export interface Rol {
  id_rol: number;
  nombre: string;
  estado: string;
  fecha_m: string;
}

/**
 * Respuesta estándar de la API para roles
 * Patrón común para todos los servicios
 */
export interface RolApiResponse {
  statuscode: number;
  mensaje: string;
  data: Rol[];
}

/**
 * Interfaz para formularios de creación/edición de roles
 * Campos editables por el usuario
 */
export interface RolForm {
  id_rol?: number;
  nombre: string;
  estado: string;
  fecha_m?: string;
}

/**
 * Acciones disponibles para el método POST utilitario
 */
export type RolAction = 'SL' | 'UP' | 'IN' | 'DL';

/**
 * Parámetros para operaciones con acción específica
 */
export interface RolActionParams {
  action: RolAction;
  data?: Partial<RolForm>;
  id?: number;
}

/**
 * Filtros para búsqueda de roles
 */
export interface RolFilters {
  estado?: string;
  nombre?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Opciones de paginación para roles
 */
export interface RolPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Estados disponibles para roles
 */
export interface RolEstados {
  ACTIVO: 'A';
  INACTIVO: 'I';
  SUSPENDIDO: 'S';
  BLOQUEADO: 'B';
}
