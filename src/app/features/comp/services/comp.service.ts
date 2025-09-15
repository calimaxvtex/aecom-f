
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, of, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    Componente,
    ComponenteRawResponse,
    ComponenteResponse,
    ComponenteRawArrayResponse,
    ComponenteArrayResponse,
    ComponenteSingleResponse,
    CreateComponenteRequest,
    UpdateComponenteRequest,
    ComponentePaginationParams,
    ComponenteFilters,
    TiposComponenteResponse,
    CanalesResponse,
    ComponenteStatsResponse,
    ComponenteAdvancedFilters,
    TipoComponente,
    Canal,
    ComponenteStats
} from '../models/comp.interface';

@Injectable({
    providedIn: 'root'
})
export class CompService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // ID del endpoint de componentes en la configuración
    private readonly COMP_ENDPOINT_ID = 18;

    constructor() {
        console.log('🏗️ CompService inicializado');
        console.log('🔗 Usando endpoint ID:', this.COMP_ENDPOINT_ID);
    }

    // Método para obtener la URL del endpoint de componentes
    private getCompUrl(): Observable<string> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.COMP_ENDPOINT_ID);
                if (!endpoint) {
                    return throwError(() => new Error(`Endpoint componentes (ID: ${this.COMP_ENDPOINT_ID}) no encontrado`));
                }

                console.log('🔗 URL de componentes obtenida:', endpoint.url);
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
     * Obtiene todos los componentes
     */
    getAllComponentes(params?: ComponentePaginationParams): Observable<ComponenteResponse> {
        console.log('📊 === CONFIGURACIÓN DE ENDPOINT COMPONENTES ===');
        console.log('📊 Método llamado: getAllComponentes');
        console.log('📊 Endpoint ID:', this.COMP_ENDPOINT_ID);

        return this.getCompUrl().pipe(
            switchMap(url => {
                console.log('🔗 === CONEXIÓN HTTP ===');
                console.log('🔗 URL destino:', url);
                console.log('🔗 Método: POST');

                // Preparar el body con la acción y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
                const body: any = {
                    action: 'SL', // Según las convenciones del proyecto: SL para query/search
                    ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
                };

                // Agregar parámetros de paginación y filtros al body si existen
                if (params) {
                    if (params.page) body.page = params.page;
                    if (params.limit) body.limit = params.limit;
                    if (params.sort) body.sort = params.sort;
                    if (params.order) body.order = params.order;

                    // Agregar filtros si existen
                    if (params.filters) {
                        Object.entries(params.filters).forEach(([key, value]) => {
                            if (value !== undefined && value !== null && value !== '') {
                                body[key] = value;
                            }
                        });
                    }
                }

                console.log('🔗 Body enviado:', body);
                console.log('🔗 === FIN CONEXIÓN ===');

                return this.http.post<ComponenteRawArrayResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('🔍 === RESPUESTA CRUDA DEL BACKEND (SIN TIPOS) ===');
                        console.log('🔍 URL que respondió:', url);
                        console.log('🔍 Respuesta completa:', response);
                        console.log('🔍 Tipo de respuesta:', Array.isArray(response) ? 'Array' : typeof response);
                        console.log('🔍 Es array?', Array.isArray(response));
                        console.log('🔍 Longitud si es array:', Array.isArray(response) ? response.length : 'N/A');
                        console.log('🔍 === FIN RESPUESTA CRUDA ===');

                        // Análisis detallado de la estructura
                        if (Array.isArray(response)) {
                            console.log('🔍 === ANÁLISIS DE ARRAY ===');
                            response.forEach((item, index) => {
                                console.log(`🔍 Elemento [${index}]:`, item);
                                console.log(`🔍 Elemento [${index}] tipo:`, typeof item);
                                if (item && typeof item === 'object') {
                                    console.log(`🔍 Elemento [${index}] keys:`, Object.keys(item));
                                    console.log(`🔍 Elemento [${index}] statuscode:`, item.statuscode);
                                    console.log(`🔍 Elemento [${index}] mensaje:`, item.mensaje);
                                    console.log(`🔍 Elemento [${index}] data tipo:`, typeof item.data);
                                    console.log(`🔍 Elemento [${index}] data:`, item.data);
                                }
                            });

                            // Tomar el primer elemento del array (patrón del proyecto)
                            if (response.length > 0) {
                                const firstItem = response[0];
                                return {
                                    statuscode: firstItem.statuscode || 200,
                                    mensaje: firstItem.mensaje || 'OK',
                                    data: firstItem.data || []
                                } as ComponenteResponse;
                            }
                        }

                        // Si la respuesta es un objeto directo
                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || []
                        } as ComponenteResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error en getAllComponentes:', error);
                        return throwError(() => new Error('Error al obtener componentes'));
                    })
                );
            })
        );
    }

    /**
     * Crea un nuevo componente
     */
    createComponente(componente: CreateComponenteRequest): Observable<ComponenteSingleResponse> {
        console.log('➕ Creando componente:', componente);

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'IN' as const, // Insert según convenciones del proyecto
                    ...componente,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para crear componente:', payload);

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de crear componente:', response);

                        // Procesar respuesta (similar al patrón de otros servicios)
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Componente creado correctamente',
                                data: firstItem.data || componente as Componente
                            } as ComponenteSingleResponse;
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Componente creado correctamente',
                            data: response.data || componente as Componente
                        } as ComponenteSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al crear componente:', error);
                        return throwError(() => new Error('Error al crear el componente'));
                    })
                );
            })
        );
    }

    /**
     * Actualiza un componente existente
     */
    updateComponente(componente: UpdateComponenteRequest): Observable<ComponenteSingleResponse> {
        console.log('✏️ Actualizando componente:', componente);

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'UP' as const, // Update según convenciones del proyecto
                    ...componente,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para actualizar componente:', payload);

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de actualizar componente:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Componente actualizado correctamente',
                                data: firstItem.data || componente as Componente
                            } as ComponenteSingleResponse;
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Componente actualizado correctamente',
                            data: response.data || componente as Componente
                        } as ComponenteSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al actualizar componente:', error);
                        return throwError(() => new Error('Error al actualizar el componente'));
                    })
                );
            })
        );
    }

    /**
     * Elimina un componente
     */
    deleteComponente(id: number): Observable<ComponenteSingleResponse> {
        console.log('🗑️ Eliminando componente ID:', id);

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'DL' as const, // Delete según convenciones del proyecto
                    id_comp: id,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para eliminar componente:', payload);

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de eliminar componente:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Componente eliminado correctamente',
                                data: {} as Componente // No hay data en delete
                            } as ComponenteSingleResponse;
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Componente eliminado correctamente',
                            data: {} as Componente
                        } as ComponenteSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al eliminar componente:', error);
                        return throwError(() => new Error('Error al eliminar el componente'));
                    })
                );
            })
        );
    }

    /**
     * Obtiene un componente específico por ID
     */
    getComponenteById(id: number): Observable<ComponenteSingleResponse> {
        console.log('🔍 Obteniendo componente por ID:', id);

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL' as const, // Query según convenciones del proyecto
                    id_comp: id,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para obtener componente:', payload);

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de obtener componente:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            const componentes = firstItem.data || [];
                            const componente = componentes.find((c: Componente) => c.id_comp === id);

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'OK',
                                data: componente || {} as Componente
                            } as ComponenteSingleResponse;
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || {} as Componente
                        } as ComponenteSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener componente:', error);
                        return throwError(() => new Error('Error al obtener el componente'));
                    })
                );
            })
        );
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Obtiene componentes activos (swEnable = 1)
     */
    getComponentesActivos(): Observable<ComponenteResponse> {
        return this.getAllComponentes({
            filters: { swEnable: 1 }
        });
    }

    /**
     * Obtiene componentes por clave
     */
    getComponenteByClave(clave: string): Observable<ComponenteSingleResponse> {
        return this.getAllComponentes({
            filters: { clave }
        }).pipe(
            map(response => ({
                statuscode: response.statuscode,
                mensaje: response.mensaje,
                data: response.data[0] || {} as Componente
            }))
        );
    }

    /**
     * Obtiene componentes por canal
     */
    getComponentesByCanal(canal: string): Observable<ComponenteResponse> {
        return this.getAllComponentes({
            filters: { canal }
        });
    }

    /**
     * Obtiene componentes por tipo
     */
    getComponentesByTipo(tipo_comp: string): Observable<ComponenteResponse> {
        return this.getAllComponentes({
            filters: { tipo_comp }
        });
    }

    /**
     * Obtiene componentes únicos (isUnico = 1)
     */
    getComponentesUnicos(): Observable<ComponenteResponse> {
        return this.getAllComponentes({
            filters: { isUnico: 1 }
        });
    }

    // ========== MÉTODOS DE CONFIGURACIÓN ==========

    /**
     * Obtiene tipos de componentes disponibles
     */
    getTiposComponente(): Observable<TiposComponenteResponse> {
        console.log('🔍 Obteniendo tipos de componentes');

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL',
                    getTipos: true,
                    ...this.getSessionData()
                };

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'OK',
                                data: firstItem.tipos || []
                            } as TiposComponenteResponse;
                        }
                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.tipos || []
                        } as TiposComponenteResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener tipos de componentes:', error);
                        return of({
                            statuscode: 500,
                            mensaje: 'Error al obtener tipos de componentes',
                            data: []
                        });
                    })
                );
            })
        );
    }

    /**
     * Obtiene canales disponibles
     */
    getCanales(): Observable<CanalesResponse> {
        console.log('🔍 Obteniendo canales disponibles');

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL',
                    getCanales: true,
                    ...this.getSessionData()
                };

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'OK',
                                data: firstItem.canales || []
                            } as CanalesResponse;
                        }
                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.canales || []
                        } as CanalesResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener canales:', error);
                        return of({
                            statuscode: 500,
                            mensaje: 'Error al obtener canales',
                            data: []
                        });
                    })
                );
            })
        );
    }

    /**
     * Obtiene estadísticas de componentes
     */
    getEstadisticas(): Observable<ComponenteStatsResponse> {
        console.log('📊 Obteniendo estadísticas de componentes');

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL',
                    getStats: true,
                    ...this.getSessionData()
                };

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'OK',
                                data: firstItem.stats || {} as ComponenteStats
                            } as ComponenteStatsResponse;
                        }
                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.stats || {} as ComponenteStats
                        } as ComponenteStatsResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener estadísticas:', error);
                        return of({
                            statuscode: 500,
                            mensaje: 'Error al obtener estadísticas',
                            data: {} as ComponenteStats
                        });
                    })
                );
            })
        );
    }

    // ========== MÉTODOS DE VALIDACIÓN ==========

    /**
     * Valida si una clave de componente ya existe
     */
    validarClaveUnica(clave: string, excludeId?: number): Observable<boolean> {
        console.log('✅ Validando clave única:', clave);

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL',
                    validarClave: clave,
                    excludeId: excludeId || 0,
                    ...this.getSessionData()
                };

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return firstItem.valido !== false; // Si no viene false, asumimos true
                        }
                        return response.valido !== false;
                    }),
                    catchError(error => {
                        console.error('❌ Error al validar clave:', error);
                        return of(false);
                    })
                );
            })
        );
    }

    /**
     * Obtiene configuración por defecto para un tipo de componente
     */
    getConfiguracionPorDefecto(tipo_comp: string): Observable<any> {
        console.log('⚙️ Obteniendo configuración por defecto para tipo:', tipo_comp);

        return this.getCompUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL',
                    getDefaultConfig: true,
                    tipo_comp: tipo_comp,
                    ...this.getSessionData()
                };

                return this.http.post<ComponenteRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return firstItem.config || {};
                        }
                        return response.config || {};
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener configuración por defecto:', error);
                        return of({});
                    })
                );
            })
        );
    }
}
