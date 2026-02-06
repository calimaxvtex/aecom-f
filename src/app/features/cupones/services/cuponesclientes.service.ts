import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import { CupondResponse, CupondArrayResponse } from '../models/cupones.interface';

@Injectable({
    providedIn: 'root'
})
export class CupondService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    private getClientesPorCuponUrl(): Observable<string> {
        return this.apiConfigService.getspConfis().pipe(
            map(() => {
                const endpoint = this.apiConfigService.getEndpointByName('admcuponcte');
                if (!endpoint) {
                    console.warn(
                        `Endpoint "cupones" no encontrado, usando URL por defecto`
                    );
                    return this.apiConfigService.getCuponCteCrudUrl();
                }
                return endpoint.url;
            }),
            catchError(error => {
                console.warn(
                    'Error obteniendo endpoint dinamico de clientes por cupon, usando URL por defecto:',
                    error
                );
                return [this.apiConfigService.getCuponCteCrudUrl()];
            })
        );
    }

    getClientesPorCupon(id: number): Observable<CupondResponse> {
        return this.getClientesPorCuponUrl().pipe(
            switchMap(url => {
                const body = {
                    action: 'SLD',
                    id_cupon: id,
                    ...this.getSessionData()
                };
    
                return this.http.post<any>(url, body).pipe(
                    map(response => {
                        const first = Array.isArray(response) ? response[0] : response;
    
                        if (first?.statuscode && first.statuscode !== 200) {
                            throw new Error(first.mensaje || 'Error del servidor');
                        }
    
                        return {
                            statuscode: first?.statuscode ?? 200,
                            mensaje: first?.mensaje ?? 'OK',
                            data: first?.data ?? {
                                clientes: [],
                                conteo_estados: []
                            }
                        } as CupondResponse;
                    }),
                    catchError(error => {
                        console.error('Error en getClientesPorCupon:', error);
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
