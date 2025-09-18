import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { API_URLS } from '../../../core/constants/api.constants';
import { SessionService } from '../../../core/services/session.service';
import {
    ImageUploadRequest,
    ImageUploadResponse,
    ImageUploadError,
    ImageFile,
    FileValidationResult,
    FILE_VALIDATION_CONFIG,
    ALLOWED_FILE_TYPES,
    UPLOAD_ERROR_CODES,
    ImageUrlInfo,
    extractUrlImgs,
    ImageUploadUtils
} from './image-upload.interface';

@Injectable({
    providedIn: 'root'
})
export class ImageUploadService {
    private http = inject(HttpClient);
    private sessionService = inject(SessionService);

    // URL del endpoint de upload de banners (usa BASE_URL_IMG, no BASE_URL)
    // Esto permite que las imágenes estén en un servidor diferente al de la API principal
    private readonly UPLOAD_BANNER_URL = API_URLS.BANNER_UPLOAD;

    constructor() {
        console.log('🖼️ ImageUploadService inicializado');
        console.log('🔗 Usando URL de upload:', this.UPLOAD_BANNER_URL);
    }

    // Método para obtener la URL del endpoint de upload
    private getUploadUrl(): string {
        console.log('🔗 URL de upload desde constantes:', this.UPLOAD_BANNER_URL);
        return this.UPLOAD_BANNER_URL;
    }

    // Método auxiliar para obtener datos de sesión
    private getSessionData(): any {
        const session = this.sessionService.getSession();
        if (!session) {
            throw new Error('Sesión no encontrada. Usuario debe estar autenticado.');
        }
        return {
            usr: session.usuario,
            id_session: session.id_session
        };
    }

    /**
     * Valida archivos antes de subirlos
     */
    validateFiles(files: File[]): FileValidationResult {
        const result: FileValidationResult = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Validar cantidad máxima de archivos
        if (files.length > FILE_VALIDATION_CONFIG.maxFilesCount) {
            result.isValid = false;
            result.errors.push(`Máximo ${FILE_VALIDATION_CONFIG.maxFilesCount} archivos permitidos`);
        }

        // Validar cada archivo
        files.forEach((file, index) => {
            // Validar tipo de archivo
            if (!FILE_VALIDATION_CONFIG.allowedTypes.includes(file.type)) {
                result.isValid = false;
                result.errors.push(`Archivo ${file.name}: Tipo de archivo no permitido. Solo JPG, PNG, GIF`);
            }

            // Validar tamaño
            if (file.size > FILE_VALIDATION_CONFIG.maxFileSize) {
                result.isValid = false;
                const maxSizeMB = FILE_VALIDATION_CONFIG.maxFileSize / (1024 * 1024);
                result.errors.push(`Archivo ${file.name}: Tamaño máximo ${maxSizeMB}MB excedido`);
            }

            // Advertencia para archivos grandes
            if (file.size > 2 * 1024 * 1024) { // 2MB
                result.warnings.push(`Archivo ${file.name}: Archivo grande (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
            }
        });

        return result;
    }

    /**
     * Convierte archivos a objetos ImageFile con metadatos
     */
    private convertToImageFiles(files: File[]): ImageFile[] {
        return files.map(file => ({
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        }));
    }

    /**
     * Sube múltiples imágenes de banner
     */
    uploadBannerImages(files: File[]): Observable<ImageUploadResponse> {
        console.log('🖼️ === SUBIDA DE IMÁGENES DE BANNER ===');
        console.log('📊 Cantidad de archivos:', files.length);

        // Validar archivos primero
        const validation = this.validateFiles(files);
        if (!validation.isValid) {
            console.log('❌ Validación fallida:', validation.errors);
            return throwError(() => new Error(validation.errors.join('. ')));
        }

        // Mostrar warnings si existen
        if (validation.warnings.length > 0) {
            console.log('⚠️ Advertencias:', validation.warnings);
        }

        // Obtener URL directamente
        const url = this.getUploadUrl();

        console.log('🔗 === CONEXIÓN HTTP UPLOAD ===');
        console.log('🔗 URL destino:', url);
        console.log('🔗 Método: POST');
        console.log('🔗 Content-Type: multipart/form-data');

        // Crear FormData
        const formData = new FormData();

        // Agregar archivos al FormData
        files.forEach((file, index) => {
            console.log(`📎 Archivo ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
            formData.append('multi-files', file, file.name);
        });

        // Agregar datos de sesión al FormData
        const sessionData = this.getSessionData();
        formData.append('usr', sessionData.usr);
        formData.append('id_session', sessionData.id_session.toString());

        // Headers (no incluir Content-Type para que Angular lo maneje automáticamente con FormData)
        const headers = new HttpHeaders({
            // 'Content-Type': 'multipart/form-data' // No necesario, Angular lo maneja
        });

        console.log('📤 FormData preparado con archivos y sesión');
        console.log('🔗 === FIN CONEXIÓN UPLOAD ===');

        return this.http.post<any>(url, formData, { headers }).pipe(
            map((response: any) => {
                console.log('🔍 === RESPUESTA DEL SERVIDOR ===');
                console.log('🔍 Respuesta completa:', response);
                console.log('🔍 Tipo de respuesta:', Array.isArray(response) ? 'Array' : typeof response);

                // Verificar si hay errores generales
                if (response.errores > 0) {
                    console.log('⚠️ Backend reportó errores en el proceso:', response.errores);
                }

                // Verificar código de error general
                if (response.codigo && response.codigo !== 200) {
                    console.log('❌ Backend devolvió error general:', response);
                    throw new Error(response.mensaje || 'Error en el proceso de carga');
                }

                // Verificar errores en imágenes individuales
                const failedImages = response.images?.filter((img: any) => img.codigo !== 200) || [];
                if (failedImages.length > 0) {
                    console.log('❌ Algunas imágenes fallaron:', failedImages);
                    // No lanzamos error aquí, solo loggeamos
                }

                // Retornar respuesta en formato esperado
                const uploadResponse: ImageUploadResponse = {
                    images: response.images || [],
                    procesados: response.procesados || 0,
                    errores: response.errores || 0,
                    codigo: response.codigo || 200,
                    mensaje: response.mensaje || 'Proceso completado'
                };

                console.log('✅ Respuesta procesada exitosamente');
                console.log('📊 URLs_IMG obtenidas:', ImageUploadUtils.extractUrlImgs(uploadResponse));

                return uploadResponse;
            }),
            catchError(error => {
                console.error('❌ Error en uploadBannerImages:', error);

                // Manejar diferentes tipos de error
                let errorMessage = 'Error al subir las imágenes';

                if (error.status === 413) {
                    errorMessage = 'Archivos demasiado grandes para el servidor';
                } else if (error.status === 415) {
                    errorMessage = 'Tipo de archivo no soportado';
                } else if (error.status === 0) {
                    errorMessage = 'Error de conexión con el servidor';
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }

                console.log('📤 Enviando error al componente:', errorMessage);
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    /**
     * Sube una sola imagen de banner
     */
    uploadSingleBannerImage(file: File): Observable<ImageUploadResponse> {
        return this.uploadBannerImages([file]);
    }

    /**
     * Obtiene información de archivos sin subirlos
     */
    getFileInfo(files: File[]): ImageFile[] {
        return this.convertToImageFiles(files);
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Verifica si un archivo es de tipo imagen válido
     */
    isValidImageType(file: File): boolean {
        return FILE_VALIDATION_CONFIG.allowedTypes.includes(file.type);
    }

    /**
     * Verifica si un archivo no excede el tamaño máximo
     */
    isValidFileSize(file: File): boolean {
        return file.size <= FILE_VALIDATION_CONFIG.maxFileSize;
    }

    /**
     * Obtiene el tamaño formateado de un archivo
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Obtiene la extensión de un archivo
     */
    getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    }

    /**
     * Genera un nombre único para archivo
     */
    generateUniqueFileName(originalName: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = this.getFileExtension(originalName);
        const baseName = originalName.replace(/\.[^/.]+$/, '');

        return `${baseName}_${timestamp}_${random}.${extension}`;
    }

    // ========== MÉTODOS PARA URL_IMG ==========

    /**
     * Extrae URLs_IMG de una respuesta de carga exitosa
     */
    extractUrlImgs(response: ImageUploadResponse): string[] {
        return ImageUploadUtils.extractUrlImgs(response);
    }

    /**
     * Obtiene información detallada de URLs_IMG
     */
    getUrlImgsInfo(response: ImageUploadResponse): ImageUrlInfo[] {
        return response.images?.map(image => ({
            originalName: image.name,
            urlImg: image.img,
            uploadStatus: image.codigo === 200 ? 'success' : 'error',
            errorMessage: image.codigo !== 200 ? image.mensaje : undefined
        })) || [];
    }

    /**
     * Filtra solo URLs_IMG exitosas
     */
    getSuccessfulUrlImgs(response: ImageUploadResponse): string[] {
        return ImageUploadUtils.getSuccessfulUrlImgs(response);
    }

    /**
     * Obtiene la primera URL_IMG exitosa (útil para banner único)
     */
    getFirstSuccessfulUrlImg(response: ImageUploadResponse): string | null {
        const successful = this.getSuccessfulUrlImgs(response);
        return successful.length > 0 ? successful[0] : null;
    }

    /**
     * Verifica si todas las imágenes se cargaron exitosamente
     */
    isUploadCompletelySuccessful(response: ImageUploadResponse): boolean {
        return ImageUploadUtils.isUploadCompletelySuccessful(response);
    }

    /**
     * Obtiene estadísticas de carga
     */
    getUploadStats(response: ImageUploadResponse): {
        total: number;
        successful: number;
        failed: number;
        successRate: number;
    } {
        const total = response.images?.length || 0;
        const successful = response.images?.filter(img => img.codigo === 200).length || 0;
        const failed = total - successful;

        return {
            total,
            successful,
            failed,
            successRate: total > 0 ? (successful / total) * 100 : 0
        };
    }

    /**
     * Formatea estadísticas para mostrar al usuario
     */
    formatUploadStats(response: ImageUploadResponse): string {
        const stats = this.getUploadStats(response);

        if (stats.failed === 0) {
            return `✅ ${stats.successful} imagen(es) subida(s) exitosamente`;
        } else if (stats.successful === 0) {
            return `❌ Error: ${stats.failed} imagen(es) fallaron`;
        } else {
            return `⚠️ ${stats.successful} exitosa(s), ${stats.failed} fallida(s)`;
        }
    }
}
