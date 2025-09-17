import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { Tabloide, TabloideResponse, TabloideAction, ApiResponse } from '../models/tabloide.interface';

@Injectable({
    providedIn: 'root'
})
export class TabloideService {
    private readonly API_ID: number = 7; // ID del endpoint de Tabloide

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfigService
    ) {}

    /**
     * Obtiene la URL del endpoint por ID
     */
    private getApiUrl(): string {
        const endpoint = this.apiConfig.getEndpointById(this.API_ID);
        if (!endpoint) {
            console.warn(`⚠️ Endpoint con ID ${this.API_ID} no encontrado. Usando configuración centralizada.`);
            return this.apiConfig.getBaseUrl() + '/api/admtab/v1'; // Fallback usando configuración centralizada
        }
        return endpoint.url;
    }

    /**
     * Obtener todos los tabloides
     * @param payload - Datos para la consulta (action: 'SL')
     * @returns Observable con la respuesta de tabloides
     */
    getTableides(payload: TabloideAction): Observable<any> {
        console.log('📊 TabloideService: Consultando tabloides con payload:', payload);
        return this.http.post<any>(this.getApiUrl(), payload);
    }

    /**
     * Crear un nuevo tabloide
     * @param payload - Datos del tabloide a crear (action: 'IN')
     * @returns Observable con la respuesta
     */
    createTabloide(payload: TabloideAction): Observable<ApiResponse> {
        console.log('➕ TabloideService: Creando tabloide con payload:', payload);
        return this.http.post<ApiResponse>(this.getApiUrl(), payload);
    }

    /**
     * Actualizar un tabloide existente
     * @param payload - Datos del tabloide a actualizar (action: 'UP')
     * @returns Observable con la respuesta
     */
    updateTabloide(payload: TabloideAction): Observable<ApiResponse> {
        console.log('✏️ TabloideService: Actualizando tabloide con payload:', payload);
        return this.http.post<ApiResponse>(this.getApiUrl(), payload);
    }

    /**
     * Eliminar un tabloide
     * @param payload - Datos del tabloide a eliminar (action: 'DL')
     * @returns Observable con la respuesta
     */
    deleteTabloide(payload: TabloideAction): Observable<ApiResponse> {
        console.log('🗑️ TabloideService: Eliminando tabloide con payload:', payload);
        return this.http.post<ApiResponse>(this.getApiUrl(), payload);
    }

    /**
     * Actualizar campo específico de un tabloide (para edición inline)
     * @param tabloideId - ID del tabloide
     * @param field - Campo a actualizar
     * @param value - Nuevo valor
     * @param additionalData - Datos adicionales como usr, id_session
     * @returns Observable con la respuesta
     */
    updateTabloideField(
        tabloideId: number,
        field: string,
        value: any,
        additionalData: { usr?: string | number; id_session?: number }
    ): Observable<ApiResponse> {
        const payload: TabloideAction = {
            action: 'UP',
            id_tab: tabloideId,
            [field]: value,
            ...additionalData
        };

        console.log('🔄 TabloideService: Actualizando campo inline:', field, 'con payload:', payload);
        return this.http.post<ApiResponse>(this.getApiUrl(), payload);
    }

    /**
     * Validar URL de imagen
     * @param url - URL a validar
     * @returns Promise<boolean> - true si la imagen es válida
     */
    async validateImageUrl(url: string): Promise<boolean> {
        try {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
                
                // Timeout después de 5 segundos
                setTimeout(() => resolve(false), 5000);
            });
        } catch {
            return false;
        }
    }

    /**
     * Validar URL de tabloide (fliphtml5)
     * @param url - URL a validar
     * @returns Promise<boolean> - true si la URL es válida
     */
    async validateTabloideUrl(url: string): Promise<boolean> {
        try {
            // Verificar que sea una URL válida de fliphtml5
            if (!url.includes('fliphtml5.com')) {
                return false;
            }
            
            // Hacer una petición HEAD para verificar que existe
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }
}
