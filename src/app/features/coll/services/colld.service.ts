import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    ColldItem,
    ColldRawResponse,
    ColldResponse,
    ColldRawArrayResponse,
    ColldArrayResponse,
    ColldSingleResponse,
    CreateColldRequest,
    UpdateColldRequest,
    ColldPaginationParams
} from '../models/coll.interface';

@Injectable({
    providedIn: 'root'
})
export class ColldService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // ID del servicio COLLD según la regla crítica
    private readonly SERVICE_ID = 9;

    /**
     * Obtiene todos los detalles de colección (COLLD)
     */
    getAllColld(params?: ColldPaginationParams): Observable<ColldResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                let httpParams = new HttpParams();

                if (params) {
                    if (params.page) httpParams = httpParams.set('page', params.page.toString());
                    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
                    if (params.sort) httpParams = httpParams.set('sort', params.sort);
                    if (params.order) httpParams = httpParams.set('order', params.order);

                    // Agregar filtros si existen
                    if (params.filters) {
                        Object.entries(params.filters).forEach(([key, value]) => {
                            if (value !== undefined && value !== null && value !== '') {
                                httpParams = httpParams.set(key, value.toString());
                            }
                        });
                    }
                }

                return this.http.post<ColldArrayResponse>(endpoint.url, {
                    action: 'SL',
                    ...this.getSessionData()
                }).pipe(
                    map((response: any) => {
                        console.log('🔍 Respuesta COLLD cruda:', response);
                        console.log('📋 Tipo de respuesta:', typeof response);
                        console.log('🔍 ¿Es array?', Array.isArray(response));

                        // VALIDACIÓN ROBUSTA: Backend puede regresar array u objeto directo
                        if (Array.isArray(response)) {
                            console.log('📦 Backend regresó ARRAY, longitud:', response.length);
                            if (response.length > 0) {
                                console.log('✅ Tomando primer elemento del array');
                                return response[0];
                            } else {
                                console.warn('⚠️ Array vacío del backend');
                                return { statuscode: 200, mensaje: 'Sin datos', data: [] };
                            }
                        } else if (response && typeof response === 'object') {
                            console.log('📦 Backend regresó OBJETO DIRECTO');
                            console.log('🔍 ¿Tiene statuscode?', !!response.statuscode);
                            console.log('🔍 ¿Tiene data?', !!response.data);
                            console.log('🔍 Data es array?', Array.isArray(response.data));
                            return response;
                        } else {
                            console.error('❌ Respuesta inesperada del backend:', response);
                            throw new Error('Formato de respuesta del backend inesperado');
                        }
                    }),
                    catchError((error) => {
                        console.error('❌ Error en getAllColld:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    /**
     * Obtiene un detalle de colección por ID
     */
    getColldById(id: number): Observable<ColldResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                return this.http.post<ColldArrayResponse>(endpoint.url, {
                    action: 'SL',
                    id_colld: id,
                    ...this.getSessionData()
                }).pipe(
                    map((response: any) => {
                        console.log('🔍 Respuesta getColldById:', response);

                        if (Array.isArray(response)) {
                            const first = response[0];
                            if (first) {
                              return {
                                statuscode: first.statuscode,
                                mensaje: first.mensaje,
                                data: first.data
                              };
                            } else {
                              return { statuscode: 404, mensaje: 'Detalle no encontrado', data: null };
                            }
                          }
                
                          if (response && typeof response === 'object') {
                            return response as ColldResponse;
                          }
                
                          throw new Error('Formato de respuesta inesperado');
                    }),
                    catchError((error) => {
                        console.error('❌ Error en getColldById:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    /**
     * Crea un nuevo detalle de colección (soporta múltiples items)
     */
    createColld(request: CreateColldRequest | any): Observable<ColldSingleResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                const payload: any = {
                    action: 'IN', // Insert
                    ...this.getSessionData() // REGLA CRÍTICA: Inyección de sesión
                };

                // ✅ SOPORTE PARA MÚLTIPLES ITEMS
                if (request.items && Array.isArray(request.items)) {
                    // Si viene con array de items, incluir todo el request
                    Object.assign(payload, request);
                    console.log('📦 Payload múltiple preparado:', payload);
                } else {
                    // Formato original para compatibilidad
                    Object.assign(payload, request);
                    console.log('📦 Payload individual preparado:', payload);
                }

                return this.http.post<ColldArrayResponse>(endpoint.url, payload).pipe(
                    map((responseArray: ColldArrayResponse) => {
                        console.log('📥 Respuesta cruda del backend:', responseArray);

                        let response: any;

                        // Tomar el primer elemento del array si existe
                        if (Array.isArray(responseArray) && responseArray.length > 0) {
                            response = {
                                statuscode: responseArray[0].statuscode,
                                mensaje: responseArray[0].mensaje,
                                data: responseArray[0].data
                            };
                        } else {
                            // Si no es array, devolver directamente
                            response = responseArray as any;
                        }

                        console.log('📋 Respuesta procesada:', response);

                        // ✅ VALIDAR STATUS CODE - Convertir errores del backend en excepciones
                        if (response.statuscode && response.statuscode !== 200) {
                            console.warn('⚠️ Status code de error detectado:', response.statuscode);

                            // Crear un error personalizado con la información del backend
                            const backendError = new Error(response.mensaje || 'Error del backend');
                            (backendError as any).status = response.statuscode;
                            (backendError as any).error = response;

                            console.error('❌ Lanzando error del backend:', backendError);
                            throw backendError;
                        }

                        console.log('✅ Respuesta exitosa, retornando:', response);
                        return response;
                    }),
                    catchError((error) => {
                        console.error('❌ ===== ERROR EN SERVICIO createColld =====');
                        console.error('❌ Error completo:', error);
                        console.error('❌ Tipo de error:', typeof error);
                        console.error('❌ Error status:', error?.status);
                        console.error('❌ Error message:', error?.message);
                        console.error('❌ Error body:', error?.error);

                        // Procesar errores del backend vs errores HTTP
                        let processedError: any;

                        if (error?.status && typeof error.status === 'number') {
                            // Error del backend convertido (status code del backend)
                            processedError = {
                                ...error,
                                message: error.message || error?.error?.mensaje || 'Error del backend',
                                status: error.status,
                                error: error.error || error
                            };
                            console.log('🔄 Error procesado del backend:', processedError);
                        } else {
                            // Error HTTP estándar
                            processedError = {
                                ...error,
                                message: error?.message || error?.error?.mensaje || error?.error?.message || 'Error desconocido',
                                status: error?.status || 500,
                                error: error?.error || error
                            };
                            console.log('🔄 Error HTTP procesado:', processedError);
                        }

                        console.error('❌ Error final que se enviará al componente:', processedError);

                        return throwError(() => processedError);
                    })
                );
            })
        );
    }

    /**
     * Actualiza un detalle de colección existente
     */
    updateColld(id: number, request: UpdateColldRequest): Observable<ColldSingleResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                const payload: any = {
                    action: 'UP', // Update
                    id_colld: id,
                    ...this.getSessionData() // REGLA CRÍTICA: Inyección de sesión
                };

                // Agregar propiedades del request
                Object.assign(payload, request);

                return this.http.put<ColldArrayResponse>(`${endpoint.url}/${id}`, payload).pipe(
                    map((responseArray: ColldArrayResponse) => {
                        // Tomar el primer elemento del array si existe
                        if (Array.isArray(responseArray) && responseArray.length > 0) {
                            return {
                                statuscode: responseArray[0].statuscode,
                                mensaje: responseArray[0].mensaje,
                                data: responseArray[0].data
                            };
                        }
                        // Si no es array, devolver directamente
                        return responseArray as any;
                    }),
                    catchError((error) => {
                        console.error('❌ Error en updateColld:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    /**
     * Actualiza parcialmente un detalle de colección
     */
    patchColld(id: number, request: Partial<UpdateColldRequest>): Observable<ColldSingleResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                const payload: any = {
                    action: 'UP', // Update
                    id_colld: id,
                    ...this.getSessionData() // REGLA CRÍTICA: Inyección de sesión
                };

                // Agregar propiedades del request
                Object.assign(payload, request);

                return this.http.patch<ColldArrayResponse>(`${endpoint.url}/${id}`, payload).pipe(
                    map((responseArray: ColldArrayResponse) => {
                        // Tomar el primer elemento del array si existe
                        if (Array.isArray(responseArray) && responseArray.length > 0) {
                            return {
                                statuscode: responseArray[0].statuscode,
                                mensaje: responseArray[0].mensaje,
                                data: responseArray[0].data
                            };
                        }
                        // Si no es array, devolver directamente
                        return responseArray as any;
                    }),
                    catchError((error) => {
                        console.error('❌ Error en patchColld:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    /**
     * Elimina un detalle de colección
     */
    deleteColld(id: number): Observable<ColldSingleResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                const payload = {
                    action: 'DL', // Delete
                    id_colld: id,
                    ...this.getSessionData() // REGLA CRÍTICA: Inyección de sesión
                };

                return this.http.request<ColldArrayResponse>('DELETE', `${endpoint.url}/${id}`, {
                    body: payload
                }).pipe(
                    map((responseArray: ColldArrayResponse) => {
                        // Tomar el primer elemento del array si existe
                        if (Array.isArray(responseArray) && responseArray.length > 0) {
                            return {
                                statuscode: responseArray[0].statuscode,
                                mensaje: responseArray[0].mensaje,
                                data: responseArray[0].data
                            };
                        }
                        // Si no es array, devolver directamente
                        return responseArray as any;
                    }),
                    catchError((error) => {
                        console.error('❌ Error en deleteColld:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    /**
     * Busca detalles de colección con filtros
     */
    searchColld(params: ColldPaginationParams): Observable<ColldResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                let httpParams = new HttpParams();
                let payload: any = {
                    action: 'SL' // Select
                };

                if (params) {
                    if (params.page) httpParams = httpParams.set('page', params.page.toString());
                    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
                    if (params.sort) httpParams = httpParams.set('sort', params.sort);
                    if (params.order) httpParams = httpParams.set('order', params.order);

                    // Agregar filtros si existen
                    if (params.filters) {
                        Object.entries(params.filters).forEach(([key, value]) => {
                            if (value !== undefined && value !== null && value !== '') {
                                payload[key] = value;
                            }
                        });
                    }
                }

                return this.http.post<ColldArrayResponse>(endpoint.url, payload, { params: httpParams }).pipe(
                    map((responseArray: ColldArrayResponse) => {
                        // Tomar el primer elemento del array si existe
                        if (Array.isArray(responseArray) && responseArray.length > 0) {
                            return responseArray[0];
                        }
                        // Si no es array, devolver directamente
                        return responseArray as any;
                    }),
                    catchError((error) => {
                        console.error('❌ Error en searchColld:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    /**
     * Obtiene detalles de colección por ID de colección padre
     */
    getColldByCollId(collId: number, params?: ColldPaginationParams): Observable<ColldResponse> {
        console.log('🔗 === CONFIGURACIÓN DE ENDPOINT COLLD ===');
        console.log('🔗 Método llamado: getColldByCollId');
        console.log('🔗 Parámetro collId:', collId);
        console.log('🔗 Servicio ID:', this.SERVICE_ID);

        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                console.log('🔗 Endpoint obtenido:', endpoint);
                console.log('🔗 URL del endpoint:', endpoint.url);
                console.log('🔗 === FIN CONFIGURACIÓN COLLD ===');

                let httpParams = new HttpParams();
                let payload: any = {
                    action: 'SL', // Select
                    id_coll: collId
                };

                if (params) {
                    if (params.page) httpParams = httpParams.set('page', params.page.toString());
                    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
                    if (params.sort) httpParams = httpParams.set('sort', params.sort);
                    if (params.order) httpParams = httpParams.set('order', params.order);

                    // Agregar filtros adicionales si existen
                    if (params.filters) {
                        Object.entries(params.filters).forEach(([key, value]) => {
                            if (value !== undefined && value !== null && value !== '') {
                                payload[key] = value;
                            }
                        });
                    }
                }

                console.log('🔗 === CONEXIÓN HTTP COLLD ===');
                console.log('🔗 URL destino:', endpoint.url);
                console.log('🔗 Método: POST');
                console.log('🔗 Payload enviado:', payload);
                console.log('🔗 Parámetros URL:', httpParams);
                console.log('🔗 === FIN CONEXIÓN COLLD ===');

                return this.http.post<ColldRawArrayResponse>(endpoint.url, payload, { params: httpParams }).pipe(
                    map((responseArray: ColldRawArrayResponse) => {
                        console.log('🚀 === INICIO PROCESAMIENTO COLLD ===');
                        console.log('🔍 URL que respondió:', endpoint.url);
                        console.log('🔍 Respuesta CRUDA del HTTP POST:', responseArray);
                        console.log('🔍 Tipo de respuesta:', Array.isArray(responseArray) ? 'Array' : typeof responseArray);
                        console.log('🔍 Longitud si es array:', Array.isArray(responseArray) ? responseArray.length : 'N/A');

                        // Tomar el primer elemento del array si existe
                        let responseData: any;
                        if (Array.isArray(responseArray) && responseArray.length > 0) {
                            console.log('📦 Tomando primer elemento del array...');
                            responseData = responseArray[0];
                        } else {
                            console.log('📦 La respuesta no es array, usando directamente...');
                            responseData = responseArray;
                        }

                        console.log('📦 ResponseData después de procesar array:', responseData);
                        console.log('📦 Contenido de responseData.data:', responseData?.data);
                        console.log('📦 Tipo de responseData.data:', typeof responseData?.data);

                        // Si responseData.data es un string JSON, parsearlo
                        if (responseData && responseData.data && typeof responseData.data === 'string') {
                            try {
                                console.log('🔧 Iniciando parsing del string JSON...');
                                console.log('📄 String JSON original:', responseData.data);

                                // Limpiar el JSON string antes de parsear (igual que coll.service.ts)
                                let cleanJsonString = responseData.data;

                                // Reemplazar caracteres de escape problemáticos
                                cleanJsonString = cleanJsonString.replace(/\\r\\n/g, '');
                                cleanJsonString = cleanJsonString.replace(/\\n/g, '');
                                cleanJsonString = cleanJsonString.replace(/\\r/g, '');
                                cleanJsonString = cleanJsonString.replace(/\\t/g, '');

                                console.log('🧹 JSON string después de limpieza:', cleanJsonString);

                                // Verificar si el string está vacío o solo contiene caracteres de escape
                                if (!cleanJsonString || cleanJsonString.trim() === '' || cleanJsonString.trim() === '[]') {
                                    console.warn('⚠️ String JSON vacío o solo brackets');
                                    responseData.data = [];
                                    responseData.mensaje = 'Sin datos disponibles';
                                } else {
                                    // Parsear el JSON
                                    const parsedData = JSON.parse(cleanJsonString);
                                    console.log('✅ Datos parseados exitosamente:', parsedData);
                                    console.log('📊 Tipo de datos parseados:', Array.isArray(parsedData) ? 'Array' : typeof parsedData);
                                    console.log('📊 Longitud de datos:', Array.isArray(parsedData) ? parsedData.length : 'N/A');

                                    // Reemplazar el string con el array parseado
                                    responseData.data = parsedData;
                                    responseData.mensaje = 'Datos parseados correctamente';
                                }

                            } catch (error) {
                                console.error('❌ Error parseando datos COLLD:', error);
                                console.error('📄 JSON string que causó error:', responseData.data);

                                // En caso de error, devolver respuesta con datos vacíos
                                responseData.data = [];
                                responseData.mensaje = 'Error al parsear datos';
                            }
                        } else {
                            console.log('ℹ️ responseData.data no es string o no existe:', {
                                responseData,
                                dataType: typeof responseData?.data,
                                dataValue: responseData?.data
                            });
                        }

                        console.log('📤 ResponseData final:', responseData);
                        console.log('🏁 === FIN PROCESAMIENTO COLLD ===');
                        return responseData;
                    }),
                    catchError((error) => {
                        console.error('❌ Error en getColldByCollId:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    /**
     * Método helper para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)
     */
    private getSessionData(): { usr?: string | number; id_session?: number } {
        return this.sessionService.getApiPayloadBase();
    }
}
