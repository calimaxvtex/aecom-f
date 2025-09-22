/**
 * Interfaces para el servicio de carga de imágenes de banners
 * Ubicación: core/services/img/ para mantener consistencia con el servicio
 */

// ========== INTERFACES DE UPLOAD DE IMÁGENES ==========

/**
 * Solicitud de carga de imágenes
 */
export interface ImageUploadRequest {
    multi_files: File[]; // Array de archivos (JPG/PNG/GIF)
}

/**
 * Archivo individual con metadatos
 */
export interface ImageFile {
    file: File;
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

/**
 * Respuesta de carga de imágenes exitosa (Formato real del backend)
 */
export interface ImageUploadResponse {
    images: ImageUploadResult[];      // Array con información de cada imagen ⭐
    procesados: number;               // Número de archivos procesados exitosamente
    errores: number;                  // Número de errores
    codigo: number;                   // Código de estado general
    mensaje: string;                  // Mensaje general del proceso
}

/**
 * Resultado individual de carga de imagen (Formato real del backend)
 */
export interface ImageUploadResult {
    name: string;              // Nombre original del archivo
    codigo: number;            // Código de estado (200 = éxito)
    mensaje: string;           // Mensaje descriptivo
    img: string;              // URL_IMG que se utiliza en las páginas ⭐ IMPORTANTE
}

/**
 * Resumen del proceso de carga
 */
export interface UploadProcessSummary {
    procesados: number;        // Número de archivos procesados exitosamente
    errores: number;           // Número de errores
}

/**
 * Información de URL_IMG para uso en páginas
 */
export interface ImageUrlInfo {
    originalName: string;      // Nombre original del archivo
    urlImg: string;           // URL_IMG que se utiliza en las páginas ⭐
    uploadStatus: 'success' | 'error';  // Estado de la carga
    errorMessage?: string;     // Mensaje de error si falló
}

/**
 * Respuesta de error de carga
 */
export interface ImageUploadError {
    statuscode: number;
    mensaje: string;
    errors: ImageUploadErrorDetail[];
}

/**
 * Detalle de error individual
 */
export interface ImageUploadErrorDetail {
    file_name: string;
    error: string;
    code: string;
}

// ========== INTERFACES DE VALIDACIÓN ==========

/**
 * Configuración de validación de archivos
 */
export interface FileValidationConfig {
    maxFileSize: number; // en bytes
    allowedTypes: string[];
    maxFilesCount: number;
}

/**
 * Resultado de validación de archivo
 */
export interface FileValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// ========== CONSTANTES ==========

/**
 * Configuración por defecto para validación de archivos
 */
export const FILE_VALIDATION_CONFIG: FileValidationConfig = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFilesCount: 10
};

/**
 * Códigos de error comunes
 */
export const UPLOAD_ERROR_CODES = {
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_TYPE: 'INVALID_TYPE',
    TOO_MANY_FILES: 'TOO_MANY_FILES',
    NETWORK_ERROR: 'NETWORK_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    INVALID_FORMAT: 'INVALID_FORMAT'
} as const;

/**
 * Tipos de archivo permitidos
 */
export const ALLOWED_FILE_TYPES = {
    JPEG: 'image/jpeg',
    JPG: 'image/jpeg',
    PNG: 'image/png',
    GIF: 'image/gif'
} as const;

// ========== FUNCIONES HELPER ==========

/**
 * Función helper para extraer URLs_IMG de una respuesta
 */
export function extractUrlImgs(response: ImageUploadResponse): string[] {
    return response.images?.map((img: ImageUploadResult) => img.img) || [];
}

/**
 * Clase utilitaria para operaciones con respuestas de carga de imágenes
 */
export class ImageUploadUtils {
    /**
     * Extrae todas las URLs_IMG de una respuesta
     */
    static extractUrlImgs(response: ImageUploadResponse): string[] {
        return response.images?.map(img => img.img) || [];
    }

    /**
     * Obtiene solo las URLs_IMG de imágenes exitosas
     */
    static getSuccessfulUrlImgs(response: ImageUploadResponse): string[] {
        return response.images
            ?.filter(img => img.codigo === 200)
            ?.map(img => img.img) || [];
    }

    /**
     * Verifica si la carga fue completamente exitosa
     */
    static isUploadCompletelySuccessful(response: ImageUploadResponse): boolean {
        return response.errores === 0 && response.procesados > 0;
    }
}
