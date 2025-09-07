import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import {
    CollItem,
    CollResponse,
    CollArrayResponse,
    CollSingleResponse,
    CreateCollRequest,
    UpdateCollRequest,
    CollPaginationParams,
    CollTypeResponse,
    CollTypeArrayResponse,
    ParsedCollTypesResponse,
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
export class CollService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);

    /**
     * Obtiene todas las colecciones
     */
    getAllCollections(params?: CollPaginationParams): Observable<CollResponse> {
        const collUrl = this.apiConfigService.getCollCrudUrl();
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

        return this.http.get<CollArrayResponse>(collUrl, { params: httpParams }).pipe(
            map((responseArray: CollArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    return responseArray[0];
                }
                // Si no hay elementos, devolver una respuesta vacía
                return {
                    statuscode: 200,
                    mensaje: 'Sin datos',
                    data: []
                };
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene una colección por ID
     */
    getCollectionById(id: number): Observable<CollSingleResponse> {
        const collUrl = this.apiConfigService.getCollCrudUrl();

        return this.http.get<CollArrayResponse>(`${collUrl}/${id}`).pipe(
            map((responseArray: CollArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    // Para respuestas individuales, devolver el primer elemento de data
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje,
                        data: response.data && response.data.length > 0 ? response.data[0] : null
                    } as CollSingleResponse;
                }
                throw new Error('No se encontró la colección');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Crea una nueva colección
     */
    createCollection(collection: CreateCollRequest): Observable<CollSingleResponse> {
        const collUrl = this.apiConfigService.getCollCrudUrl();

        return this.http.post<CollArrayResponse>(collUrl, collection).pipe(
            map((responseArray: CollArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje,
                        data: response.data && response.data.length > 0 ? response.data[0] : null
                    } as CollSingleResponse;
                }
                throw new Error('Error al crear la colección');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Actualiza una colección existente
     */
    updateCollection(collection: UpdateCollRequest): Observable<CollSingleResponse> {
        const collUrl = this.apiConfigService.getCollCrudUrl();
        const { id_coll, ...updateData } = collection;

        return this.http.put<CollArrayResponse>(`${collUrl}/${id_coll}`, updateData).pipe(
            map((responseArray: CollArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje,
                        data: response.data && response.data.length > 0 ? response.data[0] : null
                    } as CollSingleResponse;
                }
                throw new Error('Error al actualizar la colección');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Elimina una colección
     */
    deleteCollection(id: number, sessionData?: { usr?: string | number; id_session?: number }): Observable<{ statuscode: number; mensaje: string }> {
        const collUrl = this.apiConfigService.getCollCrudUrl();
        let httpParams = new HttpParams();

        // Agregar datos de sesión como query parameters
        if (sessionData?.usr) httpParams = httpParams.set('usr', sessionData.usr.toString());
        if (sessionData?.id_session) httpParams = httpParams.set('id_session', sessionData.id_session.toString());

        return this.http.delete<CollArrayResponse>(`${collUrl}/${id}`, { params: httpParams }).pipe(
            map((responseArray: CollArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje
                    };
                }
                return {
                    statuscode: 200,
                    mensaje: 'Colección eliminada'
                };
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Busca colecciones por nombre
     */
    searchCollections(query: string): Observable<CollResponse> {
        const collUrl = this.apiConfigService.getCollCrudUrl();
        const params = new HttpParams().set('search', query);

        return this.http.get<CollArrayResponse>(collUrl, { params }).pipe(
            map((responseArray: CollArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    return responseArray[0];
                }
                // Si no hay elementos, devolver una respuesta vacía
                return {
                    statuscode: 200,
                    mensaje: 'Sin resultados',
                    data: []
                };
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene el catálogo de tipos de colecciones
     */
    getCollTypes(): Observable<ParsedCollTypesResponse> {
        const collUrl = this.apiConfigService.getCollCrudUrl();
        const body = { action: 'TP' };

        return this.http.post<CollTypeArrayResponse>(collUrl, body).pipe(
            map((responseArray: CollTypeArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];

                    // Parsear el string JSON en el campo data
                    let parsedData: any[] = [];
                    try {
                        // Limpiar el JSON string antes de parsear
                        let cleanJsonString = response.data;

                        // Reemplazar caracteres de escape problemáticos
                        cleanJsonString = cleanJsonString.replace(/\\r\\n/g, '');
                        cleanJsonString = cleanJsonString.replace(/\\n/g, '');
                        cleanJsonString = cleanJsonString.replace(/\\r/g, '');

                        // Corregir el problema específico con nomTipo:""VALOR""
                        cleanJsonString = cleanJsonString.replace(/"nomTipo:""([^"]+)"""/g, '"nomTipo":"$1"');

                        // Corregir el caso específico de nomTipo:""VITRINA" (sin coma)
                        cleanJsonString = cleanJsonString.replace(/"nomTipo:""([^"]+)"/g, '"nomTipo":"$1"');

                        console.log('JSON string limpio:', cleanJsonString);

                        parsedData = JSON.parse(cleanJsonString);
                        console.log('Datos parseados:', parsedData);
                    } catch (error) {
                        console.error('Error parseando tipos de colección:', error);
                        console.error('JSON string original:', response.data);

                        // Intentar un último recurso: extraer manualmente los datos
                        try {
                            const matches = response.data.match(/{"id_tipoc":(\d+),"nomTipo":"([^"]+)"}/g);
                            if (matches) {
                                parsedData = matches.map(match => {
                                    const [, id, nombre] = match.match(/{"id_tipoc":(\d+),"nomTipo":"([^"]+)"}/) || [];
                                    return { id_tipoc: parseInt(id), nomTipo: nombre };
                                });
                                console.log('Datos extraídos manualmente:', parsedData);
                            } else {
                                throw new Error('No se pudieron extraer los datos');
                            }
                        } catch (fallbackError) {
                            console.error('Error en fallback parsing:', fallbackError);
                            throw new Error('Error al parsear la respuesta de tipos de colección');
                        }
                    }

                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje,
                        data: parsedData
                    };
                }
                throw new Error('No se encontraron tipos de colección');
            }),
            catchError(this.handleError)
        );
    }

    // ==========================================
    // MÉTODOS PARA COLLECTION DETAILS (COLLD)
    // ==========================================

    /**
     * Obtiene todos los detalles de colección
     */
    getAllColld(params?: ColldPaginationParams): Observable<ColldResponse> {
        const colldUrl = this.apiConfigService.getColldCrudUrl();
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

        return this.http.get<ColldArrayResponse>(colldUrl, { params: httpParams }).pipe(
            map((responseArray: ColldArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    return responseArray[0];
                }
                // Si no hay elementos, devolver una respuesta vacía
                return {
                    statuscode: 200,
                    mensaje: 'Sin datos',
                    data: []
                };
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene detalles de colección por ID de colección
     */
    getColldByCollId(id_coll: number): Observable<ColldResponse> {
        const colldUrl = this.apiConfigService.getColldCrudUrl();
        const params = new HttpParams().set('id_coll', id_coll.toString());

        return this.http.get<ColldArrayResponse>(colldUrl, { params }).pipe(
            map((responseArray: ColldArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    return responseArray[0];
                }
                // Si no hay elementos, devolver una respuesta vacía
                return {
                    statuscode: 200,
                    mensaje: 'Sin datos',
                    data: []
                };
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Crea un nuevo detalle de colección
     */
    createColld(colld: CreateColldRequest): Observable<ColldSingleResponse> {
        const colldUrl = this.apiConfigService.getColldCrudUrl();

        return this.http.post<ColldArrayResponse>(colldUrl, colld).pipe(
            map((responseArray: ColldArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje,
                        data: response.data && response.data.length > 0 ? response.data[0] : null
                    } as ColldSingleResponse;
                }
                throw new Error('Error al crear el detalle de colección');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Actualiza un detalle de colección existente
     */
    updateColld(colld: UpdateColldRequest): Observable<ColldSingleResponse> {
        const colldUrl = this.apiConfigService.getColldCrudUrl();
        const { id_colld, ...updateData } = colld;

        return this.http.put<ColldArrayResponse>(`${colldUrl}/${id_colld}`, updateData).pipe(
            map((responseArray: ColldArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje,
                        data: response.data && response.data.length > 0 ? response.data[0] : null
                    } as ColldSingleResponse;
                }
                throw new Error('Error al actualizar el detalle de colección');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Actualiza el orden de un detalle de colección
     */
    updateColldOrder(id_colld: number, orden: number, sessionData?: { usr?: string | number; id_session?: number }): Observable<ColldSingleResponse> {
        const colldUrl = this.apiConfigService.getColldCrudUrl();

        const body = {
            action: 'UP' as const,
            orden,
            ...sessionData
        };

        return this.http.patch<ColldArrayResponse>(`${colldUrl}/${id_colld}/orden`, body).pipe(
            map((responseArray: ColldArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje,
                        data: response.data && response.data.length > 0 ? response.data[0] : null
                    } as ColldSingleResponse;
                }
                throw new Error('Error al actualizar el orden del detalle de colección');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Elimina un detalle de colección
     */
    deleteColld(id_colld: number, sessionData?: { usr?: string | number; id_session?: number }): Observable<{ statuscode: number; mensaje: string }> {
        const colldUrl = this.apiConfigService.getColldCrudUrl();
        let httpParams = new HttpParams();

        // Agregar datos de sesión como query parameters
        if (sessionData?.usr) httpParams = httpParams.set('usr', sessionData.usr.toString());
        if (sessionData?.id_session) httpParams = httpParams.set('id_session', sessionData.id_session.toString());

        return this.http.delete<ColldArrayResponse>(`${colldUrl}/${id_colld}`, { params: httpParams }).pipe(
            map((responseArray: ColldArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje
                    };
                }
                return {
                    statuscode: 200,
                    mensaje: 'Detalle de colección eliminado'
                };
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Método helper para manejar errores
     */
    private handleError = (error: any): Observable<never> => {
        console.error('Error en CollService:', error);

        let errorMessage = 'Ha ocurrido un error desconocido';

        if (error.error?.mensaje) {
            errorMessage = error.error.mensaje;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status) {
            switch (error.status) {
                case 404:
                    errorMessage = 'Elemento no encontrado';
                    break;
                case 400:
                    errorMessage = 'Datos inválidos';
                    break;
                case 500:
                    errorMessage = 'Error interno del servidor';
                    break;
                default:
                    errorMessage = `Error ${error.status}`;
            }
        }

        return throwError(() => ({
            statuscode: error.status || 500,
            mensaje: errorMessage,
            originalError: error
        }));
    };
}
