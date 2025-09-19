import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    ProyItem,
    ProyResponse,
    ProyArrayResponse,
    ProySingleResponse,
    CreateProyRequest,
    UpdateProyRequest,
    DeleteProyRequest,
    QueryProyRequest,
    ProyFilters
} from '../proy.interfaces';

@Injectable({
    providedIn: 'root'
})
export class ProyService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    /**
     * ID del servicio de proyectos (según configuración)
     */
    private readonly SERVICE_ID = 14;

    /**
     * Obtiene la URL dinámica del endpoint de proyectos
     */
    private getProyEndpoint(): string {
        const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
        if (!endpoint) {
            throw new Error(`Endpoint no encontrado para el servicio ID: ${this.SERVICE_ID}`);
        }
        return endpoint.url;
    }

    /**
     * Obtiene todos los proyectos
     */
    getAllProyectos(filters?: ProyFilters): Observable<ProyResponse> {
        const proyUrl = this.getProyEndpoint();

        console.log('🔗 === CONFIGURACIÓN DE ENDPOINT PROY ===');
        console.log('🔗 Método llamado: getAllProyectos');
        console.log('🔗 ID del servicio:', this.SERVICE_ID);
        console.log('🔗 Endpoint obtenido:', proyUrl);
        console.log('🔗 === FIN CONFIGURACIÓN PROY ===');

        // Preparar el body con la acción y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
        const body: any = {
            action: 'SL', // Según las convenciones del proyecto: SL para query/search
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        // Agregar filtros si existen
        if (filters) {
            if (filters.descripcion) body.descripcion = filters.descripcion;
            if (filters.estado !== undefined) body.estado = filters.estado;
            if (filters.usuario) body.usuario = filters.usuario;
            if (filters.fechaDesde) body.fecha_desde = filters.fechaDesde;
            if (filters.fechaHasta) body.fecha_hasta = filters.fechaHasta;
        }

        console.log('🔗 === CONEXIÓN HTTP ===');
        console.log('🔗 URL destino:', proyUrl);
        console.log('🔗 Método: POST');
        console.log('🔗 Body enviado:', body);
        console.log('🔗 === FIN CONEXIÓN ===');

        return this.http.post<any>(proyUrl, body).pipe(
            map((response: any) => {
                console.log('🔍 === RESPUESTA CRUDA DEL BACKEND (SIN TIPOS) ===');
                console.log('🔍 URL que respondió:', proyUrl);
                console.log('🔍 Respuesta completa:', response);
                console.log('🔍 Tipo de respuesta:', Array.isArray(response) ? 'Array' : typeof response);
                console.log('🔍 Es array?', Array.isArray(response));
                console.log('🔍 Longitud si es array:', Array.isArray(response) ? response.length : 'N/A');
                console.log('🔍 === FIN RESPUESTA CRUDA ===');

                return this.processResponse(response);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene un proyecto por ID
     */
    getProyectoById(id_proy: number): Observable<ProySingleResponse> {
        const proyUrl = this.getProyEndpoint();

        const body = {
            action: 'SL' as const,
            id_proy: id_proy,
            ...this.getSessionData()
        };

        return this.http.post<any>(proyUrl, body).pipe(
            map((response: any) => {
                const processedResponse = this.processResponse(response);

                // Para respuestas individuales, devolver el primer elemento de data
                return {
                    statuscode: processedResponse.statuscode,
                    mensaje: processedResponse.mensaje,
                    data: processedResponse.data && processedResponse.data.length > 0 ? processedResponse.data[0] : null
                } as ProySingleResponse;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Crea un nuevo proyecto
     */
    createProyecto(proyecto: CreateProyRequest): Observable<ProySingleResponse> {
        const proyUrl = this.getProyEndpoint();

        return this.http.post<any>(proyUrl, proyecto).pipe(
            map((response: any) => {
                const processedResponse = this.processResponse(response);

                return {
                    statuscode: processedResponse.statuscode,
                    mensaje: processedResponse.mensaje,
                    data: processedResponse.data && processedResponse.data.length > 0 ? processedResponse.data[0] : null
                } as ProySingleResponse;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Actualiza un proyecto existente
     */
    updateProyecto(proyecto: UpdateProyRequest): Observable<ProySingleResponse> {
        const proyUrl = this.getProyEndpoint();

        return this.http.post<any>(proyUrl, proyecto).pipe(
            map((response: any) => {
                const processedResponse = this.processResponse(response);

                return {
                    statuscode: processedResponse.statuscode,
                    mensaje: processedResponse.mensaje,
                    data: processedResponse.data && processedResponse.data.length > 0 ? processedResponse.data[0] : null
                } as ProySingleResponse;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Elimina un proyecto
     */
    deleteProyecto(id_proy: number, sessionData?: { usr?: string | number; id_session?: number }): Observable<{ statuscode: number; mensaje: string }> {
        const proyUrl = this.getProyEndpoint();

        const body = {
            action: 'DL' as const,
            id_proy: id_proy,
            ...this.getSessionData()
        };

        return this.http.post<any>(proyUrl, body).pipe(
            map((response: any) => {
                const processedResponse = this.processResponse(response);

                return {
                    statuscode: processedResponse.statuscode,
                    mensaje: processedResponse.mensaje
                };
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Busca proyectos por descripción
     */
    searchProyectos(query: string): Observable<ProyResponse> {
        const proyUrl = this.getProyEndpoint();

        const body = {
            action: 'SL' as const,
            descripcion: query,
            ...this.getSessionData()
        };

        return this.http.post<any>(proyUrl, body).pipe(
            map((response: any) => {
                return this.processResponse(response);
            }),
            catchError(this.handleError)
        );
    }

    /**
     * Método privado para procesar respuestas del backend (maneja array y objeto)
     */
    private processResponse(response: any): ProyResponse {
        console.log('🔍 === ANÁLISIS DETALLADO DE RESPUESTA ===');

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

            if (Array.isArray(responseData.data)) {
                console.log('✅ Datos ya son array directo:', responseData.data.length, 'registros');
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
        console.error('❌ Error en ProyService:', error);

        let errorMessage = 'Ha ocurrido un error desconocido';

        if (error.error?.mensaje) {
            errorMessage = error.error.mensaje;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status) {
            switch (error.status) {
                case 404:
                    errorMessage = 'Proyecto no encontrado';
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
