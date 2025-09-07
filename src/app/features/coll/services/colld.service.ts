import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import {
    ColldItem,
    ColldResponse,
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

                return this.http.get<ColldArrayResponse>(endpoint.url, { params: httpParams }).pipe(
                    map((responseArray: ColldArrayResponse) => {
                        // Tomar el primer elemento del array si existe
                        if (Array.isArray(responseArray) && responseArray.length > 0) {
                            return responseArray[0];
                        }
                        // Si no es array, devolver directamente
                        return responseArray as any;
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
    getColldById(id: number): Observable<ColldSingleResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                return this.http.get<ColldArrayResponse>(`${endpoint.url}/${id}`).pipe(
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
                        console.error('❌ Error en getColldById:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }

    /**
     * Crea un nuevo detalle de colección
     */
    createColld(request: CreateColldRequest): Observable<ColldSingleResponse> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                const payload: any = {
                    action: 'IN', // Insert
                };

                // Agregar propiedades del request
                Object.assign(payload, request);

                return this.http.post<ColldArrayResponse>(endpoint.url, payload).pipe(
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
                        console.error('❌ Error en createColld:', error);
                        return throwError(() => error);
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
                    id_colld: id
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
                    id_colld: id
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
                    id_colld: id
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
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio COLLD (ID: ${this.SERVICE_ID}) no encontrado`);
                }

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
                        console.error('❌ Error en getColldByCollId:', error);
                        return throwError(() => error);
                    })
                );
            })
        );
    }
}
