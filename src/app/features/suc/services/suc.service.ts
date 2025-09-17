import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap, of } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import { Sucursal, SucursalResponse, SucursalFilters } from '../models/suc.interface';

@Injectable({
    providedIn: 'root'
})
export class SucService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // ID del endpoint según configuración del backend
    private readonly SUC_ENDPOINT_ID = 15;

    /**
     * Método para obtener URL dinámica del endpoint de sucursales
     */
    private getSucUrl(): Observable<string> {
        const endpoint = this.apiConfigService.getEndpointById(this.SUC_ENDPOINT_ID);
        if (!endpoint) {
            return throwError(() => new Error(`Endpoint con ID ${this.SUC_ENDPOINT_ID} no encontrado`));
        }
        return of(endpoint.url);
    }

    /**
     * Método helper para obtener datos de sesión
     */
    private getSessionData(): { usr?: string | number; id_session?: number } {
        return this.sessionService.getApiPayloadBase();
    }

    /**
     * Método helper para manejar errores
     */
    private handleError = (error: any): Observable<never> => {
        console.error('Error en SucService:', error);

        let errorMessage = 'Error desconocido';

        // Error HTTP
        if (error.status) {
            errorMessage = error.error?.message || error.message || `Error HTTP ${error.status}`;
        }
        // Error de respuesta del backend
        else if (error.error?.mensaje) {
            errorMessage = error.error.mensaje;
        }
        // Error de mensaje directo
        else if (error.mensaje) {
            errorMessage = error.mensaje;
        }

        return throwError(() => new Error(errorMessage));
    };

    /**
     * Obtiene todas las sucursales
     */
    getAllSucursales(params?: { filters?: SucursalFilters }): Observable<SucursalResponse> {
        console.log('Obteniendo sucursales con parámetros:', params);

        return this.getSucUrl().pipe(
            switchMap(url => {
                const body: any = {
                    action: 'SL',
                    ...this.getSessionData()
                };

                // Agregar filtros si existen
                if (params?.filters) {
                    Object.entries(params.filters).forEach(([key, value]) => {
                        if (value !== undefined && value !== null && value !== '') {
                            body[key] = value;
                        }
                    });
                }

                return this.http.post<any>(url, body).pipe(
                    map((response: any) => {
                        // Procesar respuesta según formato del backend
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'OK',
                                data: Array.isArray(firstItem.data) ? firstItem.data : []
                            } as SucursalResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: Array.isArray(response.data) ? response.data : []
                        } as SucursalResponse;
                    }),
                    catchError(this.handleError)
                );
            })
        );
    }

    /**
     * Obtiene sucursales activas del proyecto 2
     */
    getSucursalesActivasProyecto2(): Observable<SucursalResponse> {
        return this.getAllSucursales({
            filters: {
                id_proy: 2,
                estado: 'A'
            }
        });
    }
}