import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    CollItem,
    CollRawResponse,
    CollResponse,
    CollRawArrayResponse,
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
    private sessionService = inject(SessionService);

    /**
     * Obtiene todas las colecciones
     */
    getAllCollections(params?: CollPaginationParams): Observable<CollResponse> {
        const collUrl = this.apiConfigService.getCollCrudUrl();

        console.log('🔗 === CONFIGURACIÓN DE ENDPOINT COLL ===');
        console.log('🔗 Método llamado: getAllCollections');
        console.log('🔗 Endpoint obtenido:', collUrl);
        console.log('🔗 === FIN CONFIGURACIÓN COLL ===');

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

        console.log('🔗 === CONEXIÓN HTTP ===');
        console.log('🔗 URL destino:', collUrl);
        console.log('🔗 Método: POST');
        console.log('🔗 Body enviado:', body);
        console.log('🔗 === FIN CONEXIÓN ===');

        return this.http.post<CollRawArrayResponse>(collUrl, body).pipe(
            map((response: any) => {
                console.log('🔍 === RESPUESTA CRUDA DEL BACKEND (SIN TIPOS) ===');
                console.log('🔍 URL que respondió:', collUrl);
                console.log('🔍 Respuesta completa:', response);
                console.log('🔍 Tipo de respuesta:', Array.isArray(response) ? 'Array' : typeof response);
                console.log('🔍 Es array?', Array.isArray(response));
                console.log('🔍 Longitud si es array:', Array.isArray(response) ? response.length : 'N/A');
                console.log('🔍 JSON.stringify completo:', JSON.stringify(response, null, 2));
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
                    console.log('🔍 === FIN ANÁLISIS DE ARRAY ===');
                } else if (response && typeof response === 'object') {
                    console.log('🔍 === ANÁLISIS DE OBJETO ===');
                    console.log('🔍 Keys del objeto:', Object.keys(response));
                    console.log('🔍 Statuscode:', response.statuscode);
                    console.log('🔍 Mensaje:', response.mensaje);
                    console.log('🔍 Data tipo:', typeof response.data);
                    console.log('🔍 Data:', response.data);
                    if (Array.isArray(response.data)) {
                        console.log('🔍 Data es array, longitud:', response.data.length);
                        response.data.forEach((item: any, index: number) => {
                            console.log(`🔍 Data[${index}]:`, item);
                        });
                    }
                    console.log('🔍 === FIN ANÁLISIS DE OBJETO ===');
                }

                // El backend puede regresar:
                // 1. Un array: [ {statuscode, mensaje, data} ]
                // 2. Un objeto directo: {statuscode, mensaje, data}

                let responseData: any;

                if (Array.isArray(response)) {
                    // Caso 1: Es un array, tomar el primer elemento
                    responseData = response.length > 0 ? response[0] : null;
                    console.log('📦 Backend regresó array, tomando primer elemento:', responseData);
                } else if (response && typeof response === 'object') {
                    // Caso 2: Es un objeto directo
                    responseData = response;
                    console.log('📦 Backend regresó objeto directo:', responseData);
                } else {
                    // Caso 3: Respuesta inesperada
                    console.warn('⚠️ Respuesta del backend inesperada:', response);
                    responseData = null;
                }

                // Procesar los datos si es necesario
                if (responseData && responseData.data) {
                    console.log('📦 Contenido de responseData.data:', responseData.data);
                    console.log('📦 Tipo de responseData.data:', typeof responseData.data);

                    // Si responseData.data es un string JSON, parsearlo
                    if (typeof responseData.data === 'string') {
                        try {
                            console.log('🔧 Iniciando parsing del string JSON...');

                            // Limpiar el JSON string antes de parsear
                            let cleanJsonString = responseData.data;
                            cleanJsonString = cleanJsonString.replace(/\\r\\n/g, '');
                            cleanJsonString = cleanJsonString.replace(/\\n/g, '');
                            cleanJsonString = cleanJsonString.replace(/\\r/g, '');
                            cleanJsonString = cleanJsonString.replace(/\\t/g, '');

                            console.log('🧹 JSON string después de limpieza:', cleanJsonString);

                            // Parsear el JSON
                            const parsedData = JSON.parse(cleanJsonString);
                            console.log('✅ Datos parseados exitosamente:', parsedData);

                            // Reemplazar el string con el array parseado
                            responseData.data = parsedData;
                            responseData.mensaje = 'Datos parseados correctamente';

                        } catch (error) {
                            console.error('❌ Error parseando datos COLL:', error);
                            console.error('📄 JSON string que causó error:', responseData.data);

                            // En caso de error, devolver respuesta con datos vacíos
                            responseData.data = [];
                            responseData.mensaje = 'Error al parsear datos';
                        }
                    } else if (Array.isArray(responseData.data)) {
                        // Verificar si es array anidado (caso especial del backend)
                        if (responseData.data.length > 0 && responseData.data[0] && typeof responseData.data[0] === 'object' && responseData.data[0].data) {
                            console.log('🔍 Detectado array anidado, extrayendo datos internos...');
                            console.log('📦 Elemento 0 del array:', responseData.data[0]);
                            const innerData = responseData.data[0].data;
                            console.log('📦 Datos internos extraídos:', innerData);
                            console.log('📦 Tipo de datos internos:', Array.isArray(innerData) ? 'Array' : typeof innerData);

                            // Reemplazar el array anidado con los datos reales
                            responseData.data = Array.isArray(innerData) ? innerData : [];
                            console.log('✅ Datos finales extraídos:', responseData.data.length, 'registros');
                        } else {
                            // Ya es un array directo, no necesita parsing
                            console.log('✅ Datos ya son array directo:', responseData.data.length, 'registros');
                        }
                    } else {
                        console.warn('⚠️ Tipo de datos inesperado:', typeof responseData.data);
                        responseData.data = [];
                        responseData.mensaje = 'Tipo de datos inesperado';
                    }

                    console.log('📤 ResponseData final:', responseData);
                    return responseData;
                } else {
                    console.warn('⚠️ No se encontraron datos en la respuesta');
                    return {
                        statuscode: 200,
                        mensaje: 'Sin datos válidos',
                        data: []
                    };
                }
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

        // Preparar el body con la acción, query y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
        const body: any = {
            action: 'SL', // Según las convenciones del proyecto: SL para query/search
            search: query,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        return this.http.post<CollArrayResponse>(collUrl, body).pipe(
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
                // Si no hay elementos en el array, devolver respuesta vacía en lugar de error
                console.warn('⚠️ No se encontraron tipos de colección en la respuesta del backend');
                return {
                    statuscode: 200,
                    mensaje: 'No se encontraron tipos de colección',
                    data: []
                };
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

        return this.http.post<ColldArrayResponse>(colldUrl, body).pipe(
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

        // Preparar el body con la acción, filtro y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
        const body: any = {
            action: 'SL', // Según las convenciones del proyecto: SL para query/search
            id_coll: id_coll,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        return this.http.post<ColldArrayResponse>(colldUrl, body).pipe(
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
     * Método helper para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)
     */
    private getSessionData(): { usr?: string | number; id_session?: number } {
        return this.sessionService.getApiPayloadBase();
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
