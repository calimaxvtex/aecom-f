/**
 * Interfaces para el servicio de detalle de roles
 * Basado en la estructura de datos de la API: /api/admrold/v1/{id}
 */

export interface RolDetalle {
  id_rold: number;
  id_rol: number;
  ren: number;
  id_menu: number;
  fecha_m: string;
  nombre_rol: string;
  nombre_menu: string | null;
}

/**
 * Respuesta estándar de la API para detalle de roles
 * Patrón común para todos los servicios
 */
export interface RolDetalleApiResponse {
  statuscode: number;
  mensaje: string;
  data: RolDetalle[];
}

/**
 * Interfaz para formularios de creación/edición de detalle de roles
 * Campos editables por el usuario
 */
export interface RolDetalleForm {
  id_rold?: number;
  id_rol: number;
  ren: number;
  id_menu: number;
  fecha_m?: string;
  nombre_rol?: string;
  nombre_menu?: string | null;
}

/**
 * Acciones disponibles para el método POST utilitario
 */
export type RolDetalleAction = 'SL' | 'UP' | 'IN' | 'DL';

/**
 * Parámetros para operaciones con acción específica
 */
export interface RolDetalleActionParams {
  action: RolDetalleAction;
  data?: Partial<RolDetalleForm>;
  id?: number;
}

/**
 * Filtros para búsqueda de detalle de roles
 */
export interface RolDetalleFilters {
  id_rol?: number;
  id_menu?: number;
  ren?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Opciones de paginación para detalle de roles
 */
export interface RolDetallePagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Consulta específica para detalle de roles
 * Se usa en el body del POST para consultas por id_rol o id_rold
 */
export interface RolDetalleQuery {
  id_rol?: number;    // Para consultar todos los detalles de un rol
  id_rold?: number;   // Para consultar un detalle específico
}

/**
 * Estructura para asignación de menús a roles
 */
export interface AsignacionMenuRol {
  id_rol: number;
  id_menu: number;
  ren: number;
  nombre_rol?: string;
  nombre_menu?: string;
}
