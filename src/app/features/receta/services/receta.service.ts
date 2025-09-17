import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Servicios obligatorios del proyecto
import { ApiConfigService } from '@/core/services/api/api-config.service';
import { SessionService } from '@/core/services/session.service';

// Interfaces específicas del dominio
import {
    RecetaItem,
    RecetaFormItem,
    RecetaResponse,
    RecetaSingleResponse
} from '../models/receta.interface';

@Injectable({
    providedIn: 'root'
})
export class RecetaService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // Método para obtener URL dinámica del endpoint de receta
    private getRecetaUrl(): Observable<string> {
        return this.apiConfigService.getspConfis().pipe(
            map(() => {
                const endpoint = this.apiConfigService.getEndpointByName('receta');
                if (!endpoint) {
                    console.warn('⚠️ Endpoint "receta" no encontrado, usando URL por defecto');
                    return this.apiConfigService.getRecetaCrudUrl();
                }
                return endpoint.url;
            }),
            catchError(error => {
                console.warn('⚠️ Error obteniendo endpoint dinámico, usando URL por defecto:', error);
                return [this.apiConfigService.getRecetaCrudUrl()];
            })
        );
    }

    /**
     * GET/SELECT - Obtener Lista Completa de Recetas
     */
    getRecetas(): Observable<RecetaResponse> {
        console.log('📋 Obteniendo items de recetas...');

        return this.getRecetaUrl().pipe(
            switchMap(url => {
                // ⚠️ CRÍTICO: Usar POST con action SL (requiere sesión según reglas del proyecto)
                return this.http.post<any>(url, {
                    action: 'SL',
                    ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
                });
            }),
            map((response: any) => {
                console.log('🌐 Respuesta de API para recetas:', response);

                // Manejar respuesta en formato array (patrón del backend)
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'OK',
                        data: firstItem.data || []
                    } as RecetaResponse;
                }

                // Respuesta directa (fallback)
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'OK',
                    data: response.data || []
                } as RecetaResponse;
            }),
            catchError(error => {
                console.error('❌ Error al obtener items de recetas:', error);
                return throwError(() => new Error('Error al cargar las recetas'));
            })
        );
    }

    /**
     * GET BY ID - Obtener Receta Específica
     */
    getReceta(id: number): Observable<RecetaSingleResponse> {
        const payload = {
            action: 'SL',
            id_entity: id,
            ...this.sessionService.getApiPayloadBase()
        };

        console.log('🔍 Obteniendo receta específica:', payload);

        return this.getRecetaUrl().pipe(
            switchMap(url => this.http.post<any>(url, payload)),
            map((response: any) => {
                console.log('🌐 Respuesta receta específica:', response);

                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'OK',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : null
                    } as RecetaSingleResponse;
                }

                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'OK',
                    data: response.data || null
                } as RecetaSingleResponse;
            }),
            catchError(error => {
                console.error('❌ Error al obtener receta específica:', error);
                return throwError(() => new Error('Error al obtener la receta específica'));
            })
        );
    }

    /**
     * POST/INSERT - Crear Nueva Receta
     * ⚠️ CRÍTICO: Este método detecta automáticamente si crear (IN) o actualizar (UP)
     */
    guardar(receta: RecetaFormItem): Observable<RecetaSingleResponse> {
        // Determinar acción basada en la presencia de ID
        const hasId = receta.id && receta.id !== null && receta.id !== undefined;
        const action = hasId ? 'UP' : 'IN';

        console.log('🔍 Determinando acción para receta:', {
            id: receta.id,
            hasId,
            action,
            recetaKeys: Object.keys(receta)
        });

        const payload = {
            action: action,
            ...receta,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log(`🚀 ${action === 'IN' ? 'Creando' : 'Actualizando'} receta:`, payload);

        return this.getRecetaUrl().pipe(
            switchMap(url => this.http.post<any>(url, payload)),
            map((response: any) => {
                console.log('🌐 Respuesta save receta completa:', response);

                // Manejar respuesta en formato array
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];

                    console.log('📋 Procesando respuesta array receta:', firstItem);

                    // ⚠️ CRÍTICO: Verificar errores del backend
                    if (firstItem.statuscode && firstItem.statuscode !== 200) {
                        console.log('❌ Backend devolvió error en array:', firstItem);
                        throw new Error(firstItem.mensaje || 'Error del servidor');
                    }

                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Receta guardada exitosamente',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : receta as RecetaItem
                    } as RecetaSingleResponse;
                }

                // Si la respuesta es un objeto directo
                console.log('📋 Procesando respuesta directa receta:', response);

                // Verificar error en respuesta directa
                if (response.statuscode && response.statuscode !== 200) {
                    console.log('❌ Backend devolvió error directo:', response);
                    throw new Error(response.mensaje || 'Error del servidor');
                }

                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Receta guardada exitosamente',
                    data: response.data || receta as RecetaItem
                } as RecetaSingleResponse;
            }),
            catchError(error => {
                console.error('❌ Error completo al guardar receta:', error);

                // ⚠️ CRÍTICO: Preservar mensaje original del backend
                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al guardar la receta';
                console.log('📤 Enviando error al componente:', errorMessage);

                return throwError(() => ({
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }

    /**
     * PUT/UPDATE - Actualización Completa de Receta
     */
    actualizar(id: number, receta: RecetaFormItem): Observable<RecetaSingleResponse> {
        const payload = {
            action: 'UP',
            id_entity: id,
            ...receta,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('🔄 Actualizando completamente receta:', payload);

        return this.getRecetaUrl().pipe(
            switchMap(url => this.http.post<any>(url, payload)),
            map((response: any) => {
                console.log('🌐 Respuesta update receta:', response);

                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];

                    // Verificar errores del backend
                    if (firstItem.statuscode && firstItem.statuscode !== 200) {
                        throw new Error(firstItem.mensaje || 'Error del servidor');
                    }

                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Receta actualizada exitosamente',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : receta as RecetaItem
                    } as RecetaSingleResponse;
                }

                // Verificar error en respuesta directa
                if (response.statuscode && response.statuscode !== 200) {
                    throw new Error(response.mensaje || 'Error del servidor');
                }

                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Receta actualizada exitosamente',
                    data: response.data || receta as RecetaItem
                } as RecetaSingleResponse;
            }),
            catchError(error => {
                console.error('❌ Error al actualizar completamente receta:', error);

                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al actualizar la receta';
                return throwError(() => ({
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }

    /**
     * PATCH - Actualización Parcial de Receta
     */
    actualizarParcial(id: number, datosParciales: Partial<RecetaFormItem>): Observable<RecetaSingleResponse> {
        const payload = {
            action: 'UP',
            id_entity: id,
            ...datosParciales,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('🔧 Actualizando parcialmente receta:', payload);

        return this.getRecetaUrl().pipe(
            switchMap(url => this.http.post<any>(url, payload)),
            map((response: any) => {
                console.log('🌐 Respuesta patch receta:', response);

                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];

                    // Verificar errores del backend
                    if (firstItem.statuscode && firstItem.statuscode !== 200) {
                        throw new Error(firstItem.mensaje || 'Error del servidor');
                    }

                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Receta actualizada exitosamente',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : {} as RecetaItem
                    } as RecetaSingleResponse;
                }

                // Verificar error en respuesta directa
                if (response.statuscode && response.statuscode !== 200) {
                    throw new Error(response.mensaje || 'Error del servidor');
                }

                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Receta actualizada exitosamente',
                    data: response.data || {} as RecetaItem
                } as RecetaSingleResponse;
            }),
            catchError(error => {
                console.error('❌ Error al actualizar parcialmente receta:', error);

                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al actualizar la receta';
                return throwError(() => ({
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }

    /**
     * DELETE - Eliminar Receta
     */
    eliminar(id: number): Observable<RecetaSingleResponse> {
        const payload = {
            action: 'DL',
            id_entity: id,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('🗑️ Eliminando receta:', payload);

        return this.getRecetaUrl().pipe(
            switchMap(url => this.http.post<any>(url, payload)),
            map((response: any) => {
                console.log('🌐 Respuesta delete receta:', response);

                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];

                    // Verificar errores del backend
                    if (firstItem.statuscode && firstItem.statuscode !== 200) {
                        throw new Error(firstItem.mensaje || 'Error del servidor');
                    }

                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Receta eliminada exitosamente',
                        data: firstItem.data || null
                    } as RecetaSingleResponse;
                }

                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Receta eliminada exitosamente',
                    data: response.data || null
                } as RecetaSingleResponse;
            }),
            catchError(error => {
                console.error('❌ Error al eliminar receta:', error);

                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al eliminar la receta';
                return throwError(() => ({
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }

    /**
     * Método genérico opcional para acciones personalizadas del backend
     */
    ejecutarAccion(action: string, data?: any, id?: number): Observable<any> {
        const payload = {
            action: action,
            ...(id && { id_entity: id }),
            ...(data && data),
            ...this.sessionService.getApiPayloadBase()
        };

        console.log(`⚡ Ejecutando acción ${action} en receta:`, payload);

        return this.getRecetaUrl().pipe(
            switchMap(url => this.http.post<any>(url, payload)),
            map((response: any) => {
                console.log(`🌐 Respuesta acción ${action}:`, response);

                if (Array.isArray(response) && response.length > 0) {
                    return response[0];
                }

                return response;
            }),
            catchError(error => {
                console.error(`❌ Error en acción ${action}:`, error);
                return throwError(() => new Error(`Error al ejecutar acción ${action}`));
            })
        );
    }
}
