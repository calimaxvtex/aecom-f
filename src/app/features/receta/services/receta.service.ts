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

// Re-exportar interfaces para facilitar el import
export type { RecetaItem, RecetaFormItem, RecetaResponse, RecetaSingleResponse };

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
     * POST - Obtener Lista Completa de Recetas desde API_CONFIG.ENDPOINTS.RECETA.CRUD
     */
    getRecetas(): Observable<RecetaResponse> {
        console.log('📋 Obteniendo items de recetas desde API_CONFIG.ENDPOINTS.RECETA.CRUD...');

        // Preparar payload para la consulta
        const payload = {
            action: 'SL',
            ...this.sessionService.getApiPayloadBase()
        };

        // Usar la URL configurada del endpoint RECETA.CRUD
        // Esto garantiza consistencia con la configuración centralizada del proyecto
        const url = this.apiConfigService.getRecetaCrudUrl();

        console.log('🚀 Payload para obtener recetas:', payload);

        return this.http.post<any>(url, payload).pipe(
            map((response: any) => {
                console.log('🌐 Respuesta de API para recetas:', response);
                console.log('url >> ', url);
                // La respuesta viene directamente en el formato esperado
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
     * PUT - Actualizar Receta existente con formato específico del backend
     *
     * MAPEO DE CAMPOS (Formulario → Base de Datos):
     * - title → titulo
     * - title_min → titulo_min
     * - description → descripcion
     * - ingredients → ingredientes
     * - instructions → instrucciones
     * - category → categoria
     * - time → tiempo
     * - people → personas
     * - difficulty → dificultad
     * - url_mini → (no incluido en PUT según ejemplo)
     */
    actualizarReceta(receta: RecetaFormItem): Observable<RecetaSingleResponse> {
        if (!receta.id) {
            throw new Error('Se requiere ID para actualizar receta');
        }

        // Función de mapeo para claridad y mantenibilidad
        const mapearCamposABD = (formData: RecetaFormItem) => ({
            // Campos de acción y identificación
            action: 'UP',
            id_receta: formData.id,

            // Campos principales mapeados
            titulo: formData.title || '',
            titulo_min: formData.title_min || '',
            descripcion: formData.description || '',
            ingredientes: formData.ingredients || '',
            instrucciones: formData.instructions || '',
            categoria: formData.category || '',

            // Campos específicos de receta
            tiempo: formData.time || '',
            personas: formData.people || 1,
            dificultad: formData.difficulty || 'medio',

            // Campos de sesión (obligatorios)
            ...this.sessionService.getApiPayloadBase()
        });

        const payload = mapearCamposABD(receta);

        console.log('🚀 Actualizando receta con PUT - URL:', this.apiConfigService.getRecetaCrudUrl());
        console.log('🚀 Mapeo de campos aplicado:', {
            'Formulario.title': 'BD.titulo',
            'Formulario.title_min': 'BD.titulo_min',
            'Formulario.description': 'BD.descripcion',
            'Formulario.ingredients': 'BD.ingredientes',
            'Formulario.instructions': 'BD.instrucciones',
            'Formulario.category': 'BD.categoria',
            'Formulario.time': 'BD.tiempo',
            'Formulario.people': 'BD.personas',
            'Formulario.difficulty': 'BD.dificultad'
        });
        console.log('🚀 Payload completo:', JSON.stringify(payload, null, 2));

        // Usar la URL configurada del endpoint RECETA.CRUD con método PUT
        const url = this.apiConfigService.getRecetaCrudUrl();

        console.log(' url >> ', url);
        console.log(' payload >> ', payload);
        return this.http.put<any>(url, payload).pipe(
            map((response: any) => {
                console.log('🌐 Respuesta PUT actualizar receta:', JSON.stringify(response, null, 2));

                // La respuesta viene directamente en el formato esperado
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Receta actualizada exitosamente',
                    data: response.data || null
                } as RecetaSingleResponse;
            }),
            catchError(error => {
                console.error('❌ Error completo al actualizar receta con PUT:', error);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error status:', error.status);
                console.error('❌ Error body:', error.error);

                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al actualizar la receta';
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
            id_receta: id,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('🗑️ Eliminando receta con DELETE:', payload);

        const url = this.apiConfigService.getRecetaCrudUrl();

        return this.http.delete<any>(url, { body: payload }).pipe(
            map((response: any) => {
                console.log('🌐 Respuesta DELETE eliminar receta:', response);

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

    // Alias para compatibilidad con código existente
    deleteReceta(id: number): Promise<any> {
        return this.eliminar(id).toPromise();
    }

    updateReceta(receta: RecetaItem): Promise<any> {
        if (receta.id) {
            return this.actualizar(receta.id, receta).toPromise();
        }
        return Promise.reject(new Error('ID de receta requerido para actualización'));
    }

    /**
     * POST - Crear Nueva Receta
     */
    crearReceta(receta: Omit<RecetaFormItem, 'id'>): Observable<RecetaSingleResponse> {
        /**
         * MAPEO COMPLETO PARA CREACIÓN CON TODOS LOS CAMPOS:
         * - title → titulo
         * - title_min → titulo_min
         * - description → descripcion
         * - ingredients → ingredientes
         * - instructions → instrucciones
         * - category → categoria
         * - time → tiempo
         * - people → personas
         * - difficulty → dificultad
         * - url_mini → url_mini
         * - url_banner → url_banner
         * - id_coll → id_coll
         */
        const payload = {
            action: 'IN',
            titulo: receta.title || '',
            titulo_min: receta.title_min || '',
            descripcion: receta.description || '',
            ingredientes: receta.ingredients || '',
            instrucciones: receta.instructions || '',
            categoria: receta.category || '',
            tiempo: receta.time || '',
            personas: receta.people || 1,
            dificultad: receta.difficulty || 'medio',
            url_mini: receta.url_mini || '',
            url_banner: receta.url_banner || '',
            id_coll: receta.id_coll || null,
            ...this.sessionService.getApiPayloadBase()
        };

        console.log('➕ Creando nueva receta con POST:', payload);

        const url = this.apiConfigService.getRecetaCrudUrl();

        return this.http.post<any>(url, payload).pipe(
            map((response: any) => {
                console.log('🌐 Respuesta POST crear receta:', response);

                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Receta creada exitosamente',
                    data: response.data || null
                } as RecetaSingleResponse;
            }),
            catchError(error => {
                console.error('❌ Error al crear receta:', error);
                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al crear la receta';
                return throwError(() => ({
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }

    // Alias para compatibilidad con código existente
    createReceta(receta: Omit<RecetaFormItem, 'id'>): Promise<any> {
        return this.crearReceta(receta).toPromise();
    }

    updateRecetaField(id: number, field: string, value: any, sessionBase: any): Observable<any> {
        /**
         * MAPEO CONSISTENTE DE CAMPOS (Frontend → Backend):
         * - title → titulo
         * - category → categoria
         * - servings → personas (para edición inline)
         * - time → tiempo
         * - difficulty → dificultad
         * - url_mini → url_mini
         * - description → descripcion
         * - ingredients → ingredientes
         * - instructions → instrucciones
         * - title_min → titulo_min
         */
        const fieldMapping: { [key: string]: string } = {
            'title': 'titulo',
            'category': 'categoria',
            'servings': 'personas',  // Campo usado en edición inline
            'time': 'tiempo',
            'difficulty': 'dificultad',
            'url_mini': 'url_mini',
            'description': 'descripcion',
            'ingredients': 'ingredientes',
            'instructions': 'instrucciones',
            'title_min': 'titulo_min'
        };

        const backendField = fieldMapping[field] || field;

        const payload = {
            action: 'UP',
            id_receta: id,
            [backendField]: value,
            ...sessionBase
        };

        console.log(`🔧 Actualizando campo ${field} (${backendField}) de receta ${id}:`, payload);

        // Usar la URL configurada del endpoint RECETA.CRUD con método PUT
        const url = this.apiConfigService.getRecetaCrudUrl();

        return this.http.put<any>(url, payload).pipe(
            map((response: any) => {
                console.log(`🌐 Respuesta PUT actualización campo ${field}:`, response);

                // La respuesta viene directamente en el formato esperado
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Campo actualizado exitosamente',
                    data: response.data || null
                };
            }),
            catchError(error => {
                console.error(`❌ Error al actualizar campo ${field}:`, error);
                const errorMessage = error.message || error.error?.message || error.error?.mensaje || `Error al actualizar ${field}`;
                return throwError(() => new Error(errorMessage));
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
