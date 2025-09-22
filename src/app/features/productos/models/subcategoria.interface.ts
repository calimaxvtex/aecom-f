/**
 * Interfaz para el modelo de Subcategoría
 * Modelo simplificado para el servicio de subcategorías
 */
export interface Subcategoria {
  idcat: number;
  idscat: number;
  nombre: string;
}

/**
 * Tipos de actions disponibles para el servicio de subcategorías
 */
export type SubcategoriaAction = 'SCAT' | 'LSCAT';

/**
 * Parámetros para las acciones del servicio de subcategorías
 */
export interface SubcategoriaActionParams {
  action?: SubcategoriaAction;
  idcat?: number;
  idscat?: number;
  swcomp?: 0 | 1; // Parámetro de compresión opcional
}

/**
 * Filtros disponibles para consultar subcategorías
 */
export interface SubcategoriaFilters {
  idcat?: number;
  idscat?: number;
  nombre?: string;
}

/**
 * Respuesta comprimida genérica de la API
 */
export interface CompressedApiResponse<T> {
  statuscode: number;
  mensaje: string;
  data: T;
  swcomp?: 0 | 1;
}

/**
 * Resultado de la descompresión con métricas
 */
export interface DecompressionResult<T> {
  data: T;
  algorithm: string;
  originalSize: number;
  decompressedSize: number;
  compressionRatio: number;
  processingTime: number;
}

/**
 * Configuración de algoritmos de compresión soportados
 */
export type CompressionAlgorithm = 'gzip' | 'zlib' | 'lz' | 'none';

/**
 * Opciones de compresión
 */
export interface CompressionOptions {
  algorithm?: CompressionAlgorithm;
  level?: number; // Nivel de compresión (1-9)
  fallback?: boolean; // Si debe hacer fallback a 'none' en caso de error
}

/**
 * Interfaz para algoritmos de compresión
 */
export interface CompressionAlgorithmHandler {
  name: CompressionAlgorithm;
  compress(data: any, options?: CompressionOptions): string;
  decompress(data: string, options?: CompressionOptions): any;
  detect(data: string): boolean;
}

/**
 * Configuración del servicio de compresión
 */
export interface CompressionConfig {
  defaultAlgorithm: CompressionAlgorithm;
  algorithms: CompressionAlgorithm[];
  enableMetrics: boolean;
  enableLogging: boolean;
  fallbackToNone: boolean;
}
