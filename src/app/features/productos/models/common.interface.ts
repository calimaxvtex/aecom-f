/**
 * Interfaces comunes compartidas entre modelos de productos
 */

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  statuscode: number;
  mensaje: string;
  data: T;
}

