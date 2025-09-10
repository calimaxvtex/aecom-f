/**
 * Interfaz para el modelo de Artículo
 */
export interface Articulo {
  articulo: number;
  nombre: string;
  marca: string;
  idcat: number;
  catNombre: string;
  idscat: number;
  scatNombre: string;
  idseg: number;
  segNombre: string;
  estado_articulo: string;
  url_img: string;
}

// ApiResponse se importa desde common.interface.ts

/**
 * Tipos de acciones disponibles para el servicio de artículos
 */
export type ArticuloAction = 'GET' | 'SL' | 'LGET';

/**
 * Parámetros para las acciones del servicio de artículos
 */
export interface ArticuloActionParams {
  action?: ArticuloAction;
  filters?: ArticuloFilters;
  id?: number;
  // Parámetros de búsqueda por texto
  nombre?: string;
  marca?: string;
  // Parámetros de paginación
  limit?: number;
}

/**
 * Filtros disponibles para consultar artículos
 */
export interface ArticuloFilters {
  articulo?: number;
  nombre?: string;
  marca?: string;
  idcat?: number;
  idscat?: number;
  idseg?: number;
  estado_articulo?: string;
  items?: Articulo[]
}

/**
 * Configuración de paginación para artículos
 */
export interface ArticuloPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
