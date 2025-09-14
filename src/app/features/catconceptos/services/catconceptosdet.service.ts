import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, of, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    CatConceptoDet,
    CatConceptoDetRawResponse,
    CatConceptoDetResponse,
    CatConceptoDetRawArrayResponse,
    CatConceptoDetSingleResponse,
    CreateCatConceptoDetRequest,
    UpdateCatConceptoDetRequest,
    CatConceptoDetQueryParams
} from '../models/catconceptosdet.interface';

@Injectable({
    providedIn: 'root'
})
export class CatConceptosDetService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // ID del endpoint de catconceptosdet en la configuración
    private readonly CATCONCEPTOSDET_ENDPOINT_ID = 20;

    constructor() {
        console.log('🏗️ CatConceptosDetService inicializado');
        console.log('🔗 Usando endpoint ID:', this.CATCONCEPTOSDET_ENDPOINT_ID);
    }

    // Método para obtener la URL del endpoint de catconceptosdet
    private getCatConceptosDetUrl(): Observable<string> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.CATCONCEPTOSDET_ENDPOINT_ID);
                if (!endpoint) {
                    return throwError(() => new Error(`Endpoint catconceptosdet (ID: ${this.CATCONCEPTOSDET_ENDPOINT_ID}) no encontrado`));
                }

                console.log('🔗 URL de catconceptosdet obtenida:', endpoint.url);
                return of(endpoint.url);
            })
        );
    }

    // Método auxiliar para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)
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
     * MÉTODO UNIFICADO DE CONSULTA - Único método para todas las consultas
     * El backend filtra inteligentemente según los parámetros enviados
     */
    queryDetalles(params: CatConceptoDetQueryParams = {}): Observable<CatConceptoDetResponse> {
        console.log('🔍 === CONSULTA UNIFICADA CATCONCEPTOSDET ===');
        console.log('🔍 Parámetros de consulta:', params);

        return this.getCatConceptosDetUrl().pipe(
            switchMap(url => {
                console.log('🔗 === CONEXIÓN HTTP ===');
                console.log('🔗 URL destino:', url);
                console.log('🔗 Método: POST');

                // Preparar el body con la acción, parámetros y datos de sesión
                const body: any = {
                    action: 'SL', // Según las convenciones del proyecto: SL para query/search
                    ...params,     // Todos los parámetros de consulta van aquí
                    ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
                };

                console.log('🔗 Body enviado:', body);
                console.log('🔗 === FIN CONEXIÓN ===');

                return this.http.post<CatConceptoDetRawArrayResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('🔍 === RESPUESTA CRUDA DEL BACKEND ===');
                        console.log('🔍 Respuesta completa:', response);
                        console.log('🔍 Tipo de respuesta:', Array.isArray(response) ? 'Array' : typeof response);

                        // Análisis detallado de la estructura
                        if (Array.isArray(response)) {
                            console.log('🔍 === ANÁLISIS DE ARRAY ===');
                            response.forEach((item, index) => {
                                console.log(`🔍 Elemento [${index}]:`, item);
                                if (item && typeof item === 'object') {
                                    console.log(`🔍 Elemento [${index}] statuscode:`, item.statuscode);
                                    console.log(`🔍 Elemento [${index}] mensaje:`, item.mensaje);
                                    console.log(`🔍 Elemento [${index}] data tipo:`, typeof item.data);
                                }
                            });

                            // Tomar el primer elemento del array (patrón del proyecto)
                            if (response.length > 0) {
                                const firstItem = response[0];
                                return {
                                    statuscode: firstItem.statuscode || 200,
                                    mensaje: firstItem.mensaje || 'OK',
                                    data: firstItem.data || []
                                } as CatConceptoDetResponse;
                            }
                        }

                        // Si la respuesta es un objeto directo
                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || []
                        } as CatConceptoDetResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error en queryDetalles:', error);
                        return throwError(() => new Error('Error al consultar detalles de conceptos'));
                    })
                );
            })
        );
    }

    /**
     * Crear un nuevo detalle de concepto
     * El backend asigna automáticamente el número de concepto (consecutivo)
     */
    createDetalle(detalle: CreateCatConceptoDetRequest): Observable<CatConceptoDetSingleResponse> {
        console.log('➕ Creando detalle de concepto:', detalle);

        return this.getCatConceptosDetUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'IN' as const, // Insert según convenciones del proyecto
                    ...detalle,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para crear detalle:', payload);

                return this.http.post<CatConceptoDetRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de crear detalle:', response);

                        // Procesar respuesta (similar al patrón de otros servicios)
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Detalle creado correctamente',
                                data: firstItem.data || detalle as CatConceptoDet
                            } as CatConceptoDetSingleResponse;
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Detalle creado correctamente',
                            data: response.data || detalle as CatConceptoDet
                        } as CatConceptoDetSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al crear detalle:', error);
                        return throwError(() => new Error('Error al crear el detalle de concepto'));
                    })
                );
            })
        );
    }

    /**
     * Actualizar un detalle de concepto existente
     * PK compuesta: (clave, concepto)
     */
    updateDetalle(detalle: UpdateCatConceptoDetRequest): Observable<CatConceptoDetSingleResponse> {
        console.log('✏️ Actualizando detalle de concepto:', detalle);

        return this.getCatConceptosDetUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'UP' as const, // Update según convenciones del proyecto
                    ...detalle,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para actualizar detalle:', payload);

                return this.http.post<CatConceptoDetRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de actualizar detalle:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Detalle actualizado correctamente',
                                data: firstItem.data || detalle as CatConceptoDet
                            } as CatConceptoDetSingleResponse;
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Detalle actualizado correctamente',
                            data: response.data || detalle as CatConceptoDet
                        } as CatConceptoDetSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al actualizar detalle:', error);
                        return throwError(() => new Error('Error al actualizar el detalle de concepto'));
                    })
                );
            })
        );
    }

    /**
     * Eliminar un detalle de concepto
     * PK compuesta: (clave, concepto)
     */
    deleteDetalle(clave: string, concepto: number): Observable<CatConceptoDetSingleResponse> {
        console.log('🗑️ Eliminando detalle de concepto - Clave:', clave, 'Concepto:', concepto);

        return this.getCatConceptosDetUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'DL' as const, // Delete según convenciones del proyecto
                    clave: clave,
                    concepto: concepto,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para eliminar detalle:', payload);

                return this.http.post<CatConceptoDetRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de eliminar detalle:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Detalle eliminado correctamente',
                                data: {} as CatConceptoDet // No hay data en delete
                            } as CatConceptoDetSingleResponse;
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Detalle eliminado correctamente',
                            data: {} as CatConceptoDet
                        } as CatConceptoDetSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al eliminar detalle:', error);
                        return throwError(() => new Error('Error al eliminar el detalle de concepto'));
                    })
                );
            })
        );
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Obtener el máximo número de concepto para una clave específica
     * Útil para conocer el siguiente consecutivo disponible
     */
    getMaxConceptoByClave(clave: string): Observable<{maxConcepto: number}> {
        console.log('🔢 Obteniendo máximo concepto para clave:', clave);

        return this.getCatConceptosDetUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL',
                    clave: clave,
                    getMaxConcepto: true, // Parámetro especial para obtener máximo
                    ...this.getSessionData()
                };

                return this.http.post<CatConceptoDetRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        // El backend debería devolver el máximo concepto para esa clave
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            const maxConcepto = firstItem.maxConcepto || 0;
                            return { maxConcepto };
                        }
                        return { maxConcepto: 0 };
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener máximo concepto:', error);
                        return of({ maxConcepto: 0 });
                    })
                );
            })
        );
    }

    /**
     * Validar que una clave padre existe en catconceptos
     */
    validarClavePadre(clave: string): Observable<boolean> {
        console.log('✅ Validando clave padre:', clave);

        // Aquí necesitaríamos consultar el servicio de catconceptos
        // Por ahora retornamos true (asumiendo que el backend valida)
        return of(true);
    }
}
