import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    CuponItem,
    CuponRawResponse,
    CuponResponse,
    CuponRawArrayResponse,
    CuponArrayResponse,
    CuponSingleResponse,
    CreateCuponRequest,
    UpdateCuponRequest,
    CuponPaginationParams,

} from '../models/cupones.interface';

@Injectable({
    providedIn: 'root'
})
export class CuponService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);


    getAllRecords(): Observable<CuponResponse> {
        // Preparar body 
        const body: any = {
            action: 'SL',
            ...this.getSessionData()
        };
        const url = this.apiConfigService.getCuponCrudUrl();


        return this.http.post<CuponResponse>(url, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;
                console.log('Esta es la respuesta',responseData)

                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                if (responseData && responseData.statuscode === 200 && responseData.data) {
                    return responseData;
                } else {
                    console.warn('Respuesta inesperada del servidor:', responseData);
                    return { statuscode: 200, mensaje: 'ok', data: [] };
                }
            }),
            catchError(error => {
                if (error && error.message && !error.message.includes('Error en getAllRecords')) {
                    return throwError(() => error);
                }
                return throwError(() => new Error('Error al obtener los registros'));
            })
        );
    }

    /**
     * Obtiene todas las colecciones
     */
    getAllCupones(params?: CuponPaginationParams): Observable<CuponResponse> {
        const CuponUrl = this.apiConfigService.getCuponCrudUrl();

        console.log('🔗 === CONFIGURACIÓN DE ENDPOINT Cupon ===');
        console.log('🔗 Método llamado: getAllCupones');
        console.log('🔗 Endpoint obtenido:', CuponUrl);
        console.log('🔗 === FIN CONFIGURACIÓN Cupon ===');

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
        console.log('🔗 URL destino:', CuponUrl);
        console.log('🔗 Método: POST');
        console.log('🔗 Body enviado:', body);
        console.log('🔗 === FIN CONEXIÓN ===');

        return this.http.post<CuponRawArrayResponse>(CuponUrl, body).pipe(
            map((response: any) => {
                console.log('🔍 === RESPUESTA CRUDA DEL BACKEND (SIN TIPOS) ===');
                console.log('🔍 URL que respondió:', CuponUrl);
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
                            console.error('❌ Error parseando datos Cupon:', error);
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
    getCuponById(id: number): Observable<CuponSingleResponse> {
        const CuponUrl = this.apiConfigService.getCuponCrudUrl();

        return this.http.get<CuponArrayResponse>(`${CuponUrl}/${id}`).pipe(
            map((responseArray: CuponArrayResponse) => {
                // Tomar el primer elemento del array si existe
                if (Array.isArray(responseArray) && responseArray.length > 0) {
                    const response = responseArray[0];
                    // Para respuestas individuales, devolver el primer elemento de data
                    return {
                        statuscode: response.statuscode,
                        mensaje: response.mensaje,
                        data: response.data && response.data.length > 0 ? response.data[0] : null
                    } as CuponSingleResponse;
                }
                throw new Error('No se encontró la colección');
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Crea una nueva colección
     */
    createCuponection(Cuponection: CreateCuponRequest): Observable<CuponSingleResponse> {
        const CuponUrl = this.apiConfigService.getCuponCrudUrl();

        // Preparar el body con la acción y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
        const body: any = {
            action: 'IN', // Insert según convenciones del proyecto
            ...Cuponection,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        console.log('➕ Creando colección con body:', body);

        return this.http.post<any>(CuponUrl, body).pipe(
            map((response: any) => {
                console.log('✅ Respuesta cruda de crear colección:', response);

                // Manejar diferentes formatos de respuesta del backend
                let responseData: any;

                if (Array.isArray(response)) {
                    // Caso 1: Backend regresa array
                    responseData = response.length > 0 ? response[0] : null;
                    console.log('📦 Backend regresó array en create:', responseData);
                } else if (response && typeof response === 'object') {
                    // Caso 2: Backend regresa objeto directo
                    responseData = response;
                    console.log('📦 Backend regresó objeto directo en create:', responseData);
                } else {
                    console.warn('⚠️ Respuesta inesperada en create:', response);
                    responseData = null;
                }

                // Verificar si hay error del backend
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    console.log('❌ Backend regresó error en create:', responseData);
                    throw new Error(responseData.mensaje || 'Error del servidor');
                }

                // Éxito - devolver respuesta formateada
                return {
                    statuscode: responseData?.statuscode || 200,
                    mensaje: responseData?.mensaje || 'Colección creada exitosamente',
                    data: responseData?.data || Cuponection as CuponItem
                } as CuponSingleResponse;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Actualiza una colección existente
     */
    updateCupon(cupon: UpdateCuponRequest): Observable<CuponSingleResponse> {
        const CuponUrl = this.apiConfigService.getCuponCrudUrl();
        const { id_cupon, ...updateData } = cupon;

        // Preparar el body con la acción y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
        const body: any = {
            action: 'UP', // Update según convenciones del proyecto
            id_cupon: id_cupon,
            ...updateData,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        console.log('✏️ Actualizando colección con body:', body);

        return this.http.post<any>(CuponUrl, body).pipe(
            map((response: any) => {
                console.log('✅ Respuesta cruda de actualizar colección:', response);

                // Manejar diferentes formatos de respuesta del backend
                let responseData: any;

                if (Array.isArray(response)) {
                    // Caso 1: Backend regresa array
                    responseData = response.length > 0 ? response[0] : null;
                    console.log('📦 Backend regresó array en update:', responseData);
                } else if (response && typeof response === 'object') {
                    // Caso 2: Backend regresa objeto directo
                    responseData = response;
                    console.log('📦 Backend regresó objeto directo en update:', responseData);
                } else {
                    console.warn('⚠️ Respuesta inesperada en update:', response);
                    responseData = null;
                }

                // Verificar si hay error del backend
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    console.log('❌ Backend regresó error en update:', responseData);
                    throw new Error(responseData.mensaje || 'Error del servidor');
                }

                // Éxito - devolver respuesta formateada
                return {
                    statuscode: responseData?.statuscode || 200,
                    mensaje: responseData?.mensaje || 'Cupón actualizado exitosamente',
                    data: responseData?.data || cupon as CuponItem
                } as CuponSingleResponse;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Elimina una colección
     */
    deleteCupon(id_cupon:number): Observable<CuponResponse>{
        const payload = {
            action: 'DL',
            id_cupon: id_cupon,
            ...this.getSessionData()
        };

        const url = this.apiConfigService.getCuponCrudUrl();

        return this.http.delete<any>(url, { body: payload }).pipe(
            map((response: any) => {

                if (response.statuscode && response.statuscode !== 200) {
                    throw new Error(response.mensaje || 'Informacion incompleta');
                }

                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Cupón eliminado exitosamente',
                    data: []
                } as CuponResponse;
            }),
            catchError(error => {
                console.error('Error al eliminar el cupón:', error);

                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al eliminar la cobertura';
                return throwError(() => ({
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }

    /**
     * Busca colecciones por nombre
     */
    searchCuponections(query: string): Observable<CuponResponse> {
        const CuponUrl = this.apiConfigService.getCuponCrudUrl();

        // Preparar el body con la acción, query y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
        const body: any = {
            action: 'SL', // Según las convenciones del proyecto: SL para query/search
            search: query,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        return this.http.post<CuponArrayResponse>(CuponUrl, body).pipe(
            map((responseArray: CuponArrayResponse) => {
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
     * Método helper para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)
     */
    private getSessionData(): { usr?: string | number; id_session?: number } {
        return this.sessionService.getApiPayloadBase();
    }

    /**
     * Método helper para manejar errores
     */
    private handleError = (error: any): Observable<never> => {
        console.error('Error en CuponService:', error);

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
