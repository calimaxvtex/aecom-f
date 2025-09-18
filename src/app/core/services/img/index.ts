/**
 * Servicios de Imágenes - Core Module
 *
 * Este módulo contiene servicios e interfaces relacionados con la gestión y carga de imágenes
 * en el sistema.
 */

export * from './image-upload.service';
export * from './image-upload.interface';

// Re-exportar funciones helper para uso directo
export { extractUrlImgs, ImageUploadUtils } from './image-upload.interface';
