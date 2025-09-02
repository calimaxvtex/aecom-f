/**
 * Interfaces para el servicio de relación rol-usuario
 * Basado en la estructura de datos de la API: /api/admrolu/v1
 */

export interface RolUsuario {
  id: number;
  id_usu: number;
  id_rol: number;
  estado: string;
  fecha_m: string;
  usu_m: string;
  nombre_usuario: string;
  email_usuario: string;
  nombre_rol: string;
}

/**
 * Respuesta estándar de la API para relación rol-usuario
 * Patrón común para todos los servicios
 */
export interface RolUsuarioApiResponse {
  statuscode: number;
  mensaje: string;
  data: RolUsuario[];
}

/**
 * Interfaz para formularios de creación/edición de relación rol-usuario
 * Campos editables por el usuario
 */
export interface RolUsuarioForm {
  id?: number;
  id_usu: number;
  id_rol: number;
  estado: string;
  fecha_m?: string;
  usu_m?: string;
  nombre_usuario?: string;
  email_usuario?: string;
  nombre_rol?: string;
}

/**
 * Acciones disponibles para el método POST utilitario
 */
export type RolUsuarioAction = 'SL' | 'UP' | 'IN' | 'DL';

/**
 * Parámetros para operaciones con acción específica
 */
export interface RolUsuarioActionParams {
  action: RolUsuarioAction;
  data?: Partial<RolUsuarioForm>;
  id?: number;
}

/**
 * Filtros para búsqueda de relaciones rol-usuario
 */
export interface RolUsuarioFilters {
  id_usu?: number;
  id_rol?: number;
  estado?: string;
  usu_m?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Opciones de paginación para relaciones rol-usuario
 */
export interface RolUsuarioPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Consulta específica para relaciones rol-usuario
 */
export interface RolUsuarioQuery {
  id_usu?: number;    // Para consultar todos los roles de un usuario
  id_rol?: number;    // Para consultar todos los usuarios de un rol
  id?: number;        // Para consultar una relación específica
}

/**
 * Estructura para asignación de roles a usuarios
 */
export interface AsignacionRolUsuario {
  id_usu: number;
  id_rol: number;
  estado: string;
  usu_m?: string;
}

/**
 * Estructura para consulta de permisos de usuario
 */
export interface PermisosUsuario {
  id_usu: number;
  nombre_usuario: string;
  email_usuario: string;
  roles: {
    id_rol: number;
    nombre_rol: string;
    estado: string;
  }[];
}

/**
 * Estructura para consulta de usuarios por rol
 */
export interface UsuariosPorRol {
  id_rol: number;
  nombre_rol: string;
  usuarios: {
    id_usu: number;
    nombre_usuario: string;
    email_usuario: string;
    estado: string;
  }[];
}
