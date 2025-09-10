/**
 * Interfaces para el modelo de Marca
 */

/**
 * Interfaz para el modelo de Marca
 */
export interface Marca {
  marca: string;
}

/**
 * Respuesta de la API para consultar marcas
 * Estructura: {"statuscode": 200, "mensaje": "Ok", "data": Marca[]}
 */
export type MarcasResponse = import('./common.interface').ApiResponse<Marca[]>;

/**
 * Array de marcas
 */
export type MarcasList = Marca[];

/**
 * Marca individual (alias para mayor claridad)
 */
export type MarcaItem = Marca;

/**
 * Tipos de acciones disponibles para el servicio de marcas
 */
export type MarcaAction = 'M';

/**
 * Parámetros para las acciones del servicio de marca
 * 
 */
export interface MarcaActionParams {
  action?: MarcaAction;
  filters?: MarcaFilters;
  id?: number;
  // Parámetros de búsqueda por texto
  marca?: string;
  // Parámetros de paginación
  limit?: number;
  offset?: number;
}

/**
 * Filtros disponibles para consultar marcas
 */
export interface MarcaFilters {
  marca?: string;
  estado_marca?: string;
}

/**
 * Configuración de paginación para marcas
 */
export interface MarcaPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
