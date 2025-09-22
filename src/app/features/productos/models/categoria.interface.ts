/**
 * Interfaz para el modelo de Categoría
 * Modelo simplificado para el servicio de categorías
 */
export interface Categoria {
  idcat: number;
  nombre: string;
}

// ApiResponse se importa desde common.interface.ts

/**
 * Tipo de action específico para categorías
 */
export type CategoriaAction = 'CAT';

/**
 * Parámetros para las acciones del servicio de categorías
 */
export interface CategoriaActionParams {
  action?: CategoriaAction;
}

/**
 * Filtros disponibles para consultar categorías (si es necesario en el futuro)
 */
export interface CategoriaFilters {
  idcat?: number;
  nombre?: string;
}
