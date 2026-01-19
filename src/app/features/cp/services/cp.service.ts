import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    Cp,
    CpResponse,
    CpResponseInfo,
    CpSingleResponse
} from '../models/cp.interface';

@Injectable({
    providedIn: 'root'
})
export class CpService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    /**
     * Obtiene todos los registros
     */
    getAllRecords(): Observable<CpResponse> {
        // Preparar body 
        const body: any = {
            action: 'SL',
            ...this.getSessionData()
        };
        const url = this.apiConfigService.getCpCrudUrl();


        return this.http.post<CpResponse>(url, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;

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
     * Obtiene registro por id
     */
    getCp(id: number): Observable<CpSingleResponse> {
        const body: any = {
            action: 'SL',
            id: id,
            ...this.getSessionData()
        };
        const url = this.apiConfigService.getCpCrudUrl();

        return this.http.post<CpSingleResponse>(url, body).pipe(
            map(response => {

                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                if (responseData && responseData.statuscode === 200 && responseData.data) {
                    return responseData;
                } else {
                    console.warn('Respuesta inesperada del servidor:', responseData);
                    throw new Error('No se encontró el registro solicitado');
                }
            }),
            catchError(error => {
                if (error && error.message && !error.message.includes('Error en getCp')) {
                    return throwError(() => error);
                }
                return throwError(() => new Error('Error al obtener registro por id'));
            })
        );
    }
    /**
     * Obtiene datos por medio del código postal
     */
    consultByCp(cp: string): Observable<CpResponseInfo> {

        const body = {
            action: 'SL',
            codigo_postal: cp,
            ...this.getSessionData()
        };

        const url = this.apiConfigService.getCpCrudUrl();

        return this.http.post<CpResponseInfo>(url, body).pipe(
            map(resp => Array.isArray(resp) ? resp[0] : resp)
        );
    }


    /**
     * Crea una nueva cobertura
     */
    createRecord(cpData: Partial<Cp>): Observable<CpResponse> {
        const body: any = {
            action: 'IN',
            ...cpData,
            ...this.getSessionData()
        };

        const url = this.apiConfigService.getCpCrudUrl();

        return this.http.post<CpResponse>(url, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                return responseData;
            }),
            catchError(error => {
                console.error('Error al crear cobertura:', error);
                if (error && error.message && !error.message.includes('Error al crear cobertura')) {
                    return throwError(() => error);
                }
                return throwError(() => new Error('Error al crear cobertura'));
            })
        );
    }

    /**
     * Actualiza una cobertura existente
     */
    updateRecord(cpData: Partial<Cp> & { id: number }): Observable<CpResponse> {
        const body: any = {
            action: 'UP',
            ...cpData,
            ...this.getSessionData()
        };

        const url = this.apiConfigService.getCpCrudUrl();

        return this.http.post<CpResponse>(url, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                return responseData;
            }),
            catchError(error => {
                console.error('Error al actualizar cobertura:', error);
                if (error && error.message && !error.message.includes('Error al actualizar cobertura')) {
                    return throwError(() => error);
                }
                return throwError(() => new Error('Error al actualizar cobertura'));
            })
        );
    }

    /**
     * Elimina una cobertura
     */
    deleteRecord(id: number): Observable<CpResponse> {

        const payload = {
            action: 'DL',
            id: id,
            ...this.getSessionData()
        };

        const url = this.apiConfigService.getCpCrudUrl();

        return this.http.delete<any>(url, { body: payload }).pipe(
            map((response: any) => {

                if (response.statuscode && response.statuscode !== 200) {
                    throw new Error(response.mensaje || 'Informacion incompleta');
                }

                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Cobertura eliminada exitosamente',
                    data: []
                } as CpResponse;
            }),
            catchError(error => {
                console.error('Error al eliminar cobertura:', error);

                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al eliminar la cobertura';
                return throwError(() => ({
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }

    /**
     * Método auxiliar para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)*/

    private getSessionData(): { usr?: string | number; id_session?: number } {
        return this.sessionService.getApiPayloadBase();
    }
}
