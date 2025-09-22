// Exportar el servicio principal
export { CompressionService } from './compression.service';

// Re-exportar interfaces de compresión
export type {
  CompressionAlgorithm,
  CompressionOptions,
  CompressionAlgorithmHandler,
  CompressionConfig,
  CompressedApiResponse,
  DecompressionResult
} from '@/features/productos/models/subcategoria.interface';

