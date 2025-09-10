/**
 * Interfaces para la gestión de items/productos
 */
import { ApiResponse } from './common.interface';
import { Articulo } from './articulo.interface';

/**
 * Respuesta de la API para consultar items
 * Estructura: {"statuscode": 200, "mensaje": "Ok", "data": Articulo[]}
 */
export type ItemsResponse = ApiResponse<Articulo[]>;

/**
 * Array de items/artículos
 */
export type ItemsList = Articulo[];

/**
 * Item individual (alias para mayor claridad en el contexto de items)
 */
export type Item = Articulo;
