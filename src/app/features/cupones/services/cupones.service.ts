import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    CuponItem,
    CuponResponse,
    CuponSingleResponse,
    CreateCuponRequest,
    UpdateCuponRequest,

} from '../models/cupones.interface';

@Injectable({
    providedIn: 'root'
})
export class CuponService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);


    getAllRecords(): Observable<CuponResponse> {
        const body: any = {
            action: 'SL',
            ...this.getSessionData()
        };
        const url = this.apiConfigService.getCuponCrudUrl();

        return this.http.post<CuponResponse>(url, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;
                console.log('Esta es la respuesta', responseData)

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
     * Crea un cupón
     */
    createCuponection(Cuponection: CreateCuponRequest): Observable<CuponSingleResponse> {
        const CuponUrl = this.apiConfigService.getCuponCrudUrl();

        const body: any = {
            action: 'IN',
            ...Cuponection,
            ...this.getSessionData()
        };

        return this.http.post<any>(CuponUrl, body).pipe(
            map((response: any) => {
                // Manejar diferentes formatos de respuesta del backend
                let responseData: any;

                if (Array.isArray(response)) {
                    // Caso 1: Backend regresa array
                    responseData = response.length > 0 ? response[0] : null;
                } else if (response && typeof response === 'object') {
                    // Caso 2: Backend regresa objeto directo
                    responseData = response;
                } else {
                    console.warn('⚠️ Respuesta inesperada en create:', response);
                    responseData = null;
                }

                // Verificar si hay error del backend
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
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
     * Actualiza un cupón existente
     */
    updateCupon(cupon: UpdateCuponRequest): Observable<CuponSingleResponse> {
        const CuponUrl = this.apiConfigService.getCuponCrudUrl();
        const { id_cupon, ...updateData } = cupon;

        const body: any = {
            action: 'UP',
            id_cupon: id_cupon,
            ...updateData,
            ...this.getSessionData()
        };

        return this.http.post<any>(CuponUrl, body).pipe(
            map((response: any) => {

                // Manejar diferentes formatos de respuesta del backend
                let responseData: any;

                if (Array.isArray(response)) {
                    // Caso 1: Backend regresa array
                    responseData = response.length > 0 ? response[0] : null;
                } else if (response && typeof response === 'object') {
                    // Caso 2: Backend regresa objeto directo
                    responseData = response;
                } else {
                    console.warn('⚠️ Respuesta inesperada en update:', response);
                    responseData = null;
                }
                // Verificar si hay error del backend
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
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
     * Elimina una cupón
     */
    deleteCupon(id_cupon: number): Observable<CuponResponse> {
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

                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al eliminar el cupón';
                return throwError(() => ({
                    message: errorMessage,
                    originalError: error
                }));
            })
        );
    }    /**
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
