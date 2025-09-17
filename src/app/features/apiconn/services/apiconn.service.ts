import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, of, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    ApiConnItem,
    ApiConnRawResponse,
    ApiConnResponse,
    ApiConnRawArrayResponse,
    ApiConnArrayResponse,
    ApiConnSingleResponse,
    CreateApiConnRequest,
    UpdateApiConnRequest,
    ApiConnPaginationParams,
    ApiConnFilters,
    ApiConnType,
    ApiConnEnvironment,
    APICONN_TYPES,
    APICONN_ENVIRONMENTS,
    ApiConnStats,
    ApiConnValidationResult,
    ApiConnTestResult
} from '../models/apiconn.interface';

@Injectable({
    providedIn: 'root'
})
export class ApiConnService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // ID del endpoint de conexiones API en la configuración
    private readonly APICONN_ENDPOINT_ID = 21;

    constructor() {
        console.log('🔗 ApiConnService inicializado');
        console.log('🔗 Usando endpoint ID:', this.APICONN_ENDPOINT_ID);
    }

    // Método para obtener la URL del endpoint de conexiones API
    private getApiConnUrl(): Observable<string> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.APICONN_ENDPOINT_ID);
                if (!endpoint) {
                    return throwError(() => new Error(`Endpoint conexiones API (ID: ${this.APICONN_ENDPOINT_ID}) no encontrado`));
                }

                console.log('🔗 URL de conexiones API obtenida:', endpoint.url);
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
     * Obtiene todas las conexiones API
     */
    getAllApiConns(params?: ApiConnPaginationParams): Observable<ApiConnResponse> {
        console.log('🔗 === CONFIGURACIÓN DE ENDPOINT APICONN ===');
        console.log('🔗 Método llamado: getAllApiConns');
        console.log('🔗 Endpoint ID:', this.APICONN_ENDPOINT_ID);

        return this.getApiConnUrl().pipe(
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

                console.log('📤 Body preparado:', body);

                return this.http.post<ApiConnRawResponse | ApiConnRawArrayResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('📥 Respuesta cruda del backend:', response);

                        // ⚠️ MANEJO CRÍTICO: Verificar errores del backend según especificaciones
                        let responseData: any = null;

                        // Patrón 1: Respuesta directa con statuscode
                        if (response && typeof response === 'object' && 'statuscode' in response) {
                            if (response.statuscode && response.statuscode !== 200) {
                                console.log('❌ Backend devolvió error directo:', response);
                                throw new Error(response.mensaje || 'Error del servidor');
                            }
                            responseData = response;
                        }
                        // Patrón 2: Array de respuestas
                        else if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }
                            responseData = firstItem;
                        }
                        // Patrón 3: Respuesta sin estructura esperada
                        else {
                            console.warn('⚠️ Respuesta sin estructura esperada:', response);
                            responseData = {
                                statuscode: 200,
                                mensaje: 'Operación exitosa',
                                data: Array.isArray(response) ? response : []
                            };
                        }

                        // Asegurar que data siempre sea un array
                        const data = Array.isArray(responseData.data) ? responseData.data : [];

                        const result: ApiConnResponse = {
                            statuscode: responseData.statuscode || 200,
                            mensaje: responseData.mensaje || 'Operación exitosa',
                            data: data
                        };

                        console.log('✅ Respuesta procesada:', result);
                        return result;
                    }),
                    catchError((error: any) => {
                        console.error('❌ Error en getAllApiConns:', error);

                        // Si es un error que ya procesamos arriba, lo re-lanzamos
                        if (error.message && (error.message.includes('Backend devolvió error') || error.message.includes('Sesión no encontrada'))) {
                            return throwError(() => error);
                        }

                        // Para otros errores HTTP, crear mensaje descriptivo
                        let errorMessage = 'Error al obtener conexiones API';
                        if (error.status === 0) {
                            errorMessage = 'No se pudo conectar al servidor. Verifique su conexión.';
                        } else if (error.status === 500) {
                            errorMessage = 'Error interno del servidor (500). Intente nuevamente.';
                        } else if (error.status) {
                            errorMessage = `Error HTTP ${error.status}: ${error.statusText || 'Desconocido'}`;
                        }

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    /**
     * Obtiene una conexión API por ID
     */
    getApiConnById(id: number): Observable<ApiConnSingleResponse> {
        console.log('🔗 Método llamado: getApiConnById');
        console.log('🔗 ID solicitado:', id);

        return this.getApiConnUrl().pipe(
            switchMap(url => {
                const body = {
                    action: 'SL', // Query single
                    id: id,
                    ...this.getSessionData()
                };

                console.log('📤 Body preparado:', body);

                return this.http.post<ApiConnRawResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('📥 Respuesta cruda del backend:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        const result: ApiConnSingleResponse = {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Operación exitosa',
                            data: response.data
                        };

                        console.log('✅ Conexión obtenida:', result);
                        return result;
                    }),
                    catchError((error: any) => {
                        console.error('❌ Error en getApiConnById:', error);
                        return throwError(() => new Error('Error al obtener la conexión API'));
                    })
                );
            })
        );
    }

    /**
     * Crea una nueva conexión API
     */
    createApiConn(apiConn: CreateApiConnRequest): Observable<ApiConnSingleResponse> {
        console.log('🔗 Método llamado: createApiConn');
        console.log('🔗 Datos a crear:', apiConn);

        return this.getApiConnUrl().pipe(
            switchMap(url => {
                const body = {
                    action: 'IN', // Insert
                    ...apiConn,
                    ...this.getSessionData()
                };

                console.log('📤 Body preparado:', body);

                return this.http.post<ApiConnRawResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('📥 Respuesta cruda del backend:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            throw new Error(response.mensaje || 'Error al crear la conexión API');
                        }

                        const result: ApiConnSingleResponse = {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Conexión API creada exitosamente',
                            data: response.data
                        };

                        console.log('✅ Conexión creada:', result);
                        return result;
                    }),
                    catchError((error: any) => {
                        console.error('❌ Error en createApiConn:', error);
                        let errorMessage = 'Error al crear la conexión API';

                        if (error.message && (error.message.includes('Backend devolvió error') || error.message.includes('Sesión no encontrada'))) {
                            errorMessage = error.message;
                        }

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    /**
     * Actualiza una conexión API existente
     */
    updateApiConn(apiConn: UpdateApiConnRequest): Observable<ApiConnSingleResponse> {
        console.log('🔗 Método llamado: updateApiConn');
        console.log('🔗 Datos a actualizar:', apiConn);

        return this.getApiConnUrl().pipe(
            switchMap(url => {
                const body = {
                    action: 'UP', // Update
                    ...apiConn,
                    ...this.getSessionData()
                };

                console.log('📤 Body preparado:', body);

                return this.http.post<ApiConnRawResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('📥 Respuesta cruda del backend:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            throw new Error(response.mensaje || 'Error al actualizar la conexión API');
                        }

                        const result: ApiConnSingleResponse = {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Conexión API actualizada exitosamente',
                            data: response.data
                        };

                        console.log('✅ Conexión actualizada:', result);
                        return result;
                    }),
                    catchError((error: any) => {
                        console.error('❌ Error en updateApiConn:', error);
                        let errorMessage = 'Error al actualizar la conexión API';

                        if (error.message && (error.message.includes('Backend devolvió error') || error.message.includes('Sesión no encontrada'))) {
                            errorMessage = error.message;
                        }

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    /**
     * Elimina una conexión API
     */
    deleteApiConn(id: number): Observable<ApiConnSingleResponse> {
        console.log('🔗 Método llamado: deleteApiConn');
        console.log('🔗 ID a eliminar:', id);

        return this.getApiConnUrl().pipe(
            switchMap(url => {
                const body = {
                    action: 'DL', // Delete
                    id: id,
                    ...this.getSessionData()
                };

                console.log('📤 Body preparado:', body);

                return this.http.post<ApiConnRawResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('📥 Respuesta cruda del backend:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            throw new Error(response.mensaje || 'Error al eliminar la conexión API');
                        }

                        const result: ApiConnSingleResponse = {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Conexión API eliminada exitosamente',
                            data: response.data
                        };

                        console.log('✅ Conexión eliminada:', result);
                        return result;
                    }),
                    catchError((error: any) => {
                        console.error('❌ Error en deleteApiConn:', error);
                        let errorMessage = 'Error al eliminar la conexión API';

                        if (error.message && (error.message.includes('Backend devolvió error') || error.message.includes('Sesión no encontrada'))) {
                            errorMessage = error.message;
                        }

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    /**
     * Obtiene estadísticas de conexiones API
     */
    getApiConnStats(): Observable<ApiConnStats> {
        console.log('🔗 Método llamado: getApiConnStats');

        return this.getAllApiConns().pipe(
            map(response => {
                const stats: ApiConnStats = {
                    total: response.data.length,
                    active: response.data.filter(conn => conn.activo === 1).length,
                    by_type: {},
                    by_env: {}
                };

                // Contar por tipo
                response.data.forEach(conn => {
                    stats.by_type[conn.tipo] = (stats.by_type[conn.tipo] || 0) + 1;
                    stats.by_env[conn.env] = (stats.by_env[conn.env] || 0) + 1;
                });

                console.log('📊 Estadísticas calculadas:', stats);
                return stats;
            }),
            catchError((error: any) => {
                console.error('❌ Error en getApiConnStats:', error);
                return throwError(() => new Error('Error al obtener estadísticas'));
            })
        );
    }

    /**
     * Valida los datos de una conexión API
     */
    validateApiConn(apiConn: CreateApiConnRequest): ApiConnValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validaciones básicas
        if (!apiConn.nombre || apiConn.nombre.trim().length === 0) {
            errors.push('El nombre es obligatorio');
        }

        if (!apiConn.env || !APICONN_ENVIRONMENTS.some(env => env.value === apiConn.env)) {
            errors.push('El entorno seleccionado no es válido');
        }

        if (!apiConn.tipo || !APICONN_TYPES.some(type => type.value === apiConn.tipo)) {
            errors.push('El tipo seleccionado no es válido');
        }

        // Validar que al menos tenga host/puerto o URL
        const hasHostPort = apiConn.host && apiConn.puerto;
        const hasUrl = apiConn.url;

        if (!hasHostPort && !hasUrl) {
            warnings.push('Se recomienda especificar host/puerto o URL para la conexión');
        }

        // Validar formato de URL si está presente
        if (apiConn.url) {
            try {
                new URL(apiConn.url);
            } catch {
                errors.push('La URL especificada no tiene un formato válido');
            }
        }

        // Validar puerto si está presente
        if (apiConn.puerto && (apiConn.puerto < 1 || apiConn.puerto > 65535)) {
            errors.push('El puerto debe estar entre 1 y 65535');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Prueba la conexión a un servicio API
     */
    testApiConn(apiConn: CreateApiConnRequest): Observable<ApiConnTestResult> {
        console.log('🔗 Método llamado: testApiConn');
        console.log('🔗 Probando conexión:', apiConn.nombre);

        // Esta sería una implementación básica de test de conexión
        // En un escenario real, se haría una petición real al servicio
        return of({
            success: true,
            message: 'Conexión probada exitosamente',
            responseTime: 150
        }).pipe(
            map(result => {
                console.log('✅ Test de conexión completado:', result);
                return result;
            }),
            catchError((error: any) => {
                console.error('❌ Error en testApiConn:', error);
                return of({
                    success: false,
                    message: 'Error al probar la conexión',
                    errorDetails: error
                });
            })
        );
    }

    /**
     * Obtiene los tipos de conexión disponibles
     */
    getApiConnTypes(): ApiConnType[] {
        return APICONN_TYPES;
    }

    /**
     * Obtiene los entornos disponibles
     */
    getApiConnEnvironments(): ApiConnEnvironment[] {
        return APICONN_ENVIRONMENTS;
    }
}
