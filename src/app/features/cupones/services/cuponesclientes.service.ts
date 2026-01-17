import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    CupondItem,
    CupondRawResponse,
    CupondResponse,
    CupondRawArrayResponse,
    CupondArrayResponse,
    CupondSingleResponse,
    CreateCupondRequest,
    UpdateCupondRequest,
    CupondPaginationParams
} from '../models/cupones.interface';

@Injectable({
    providedIn: 'root'
})
export class CupondService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // ID del servicio Clientes
    private readonly SERVICE_ID = 32;


    getClientesPorCupon(id: number): Observable<CupondResponse>{
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
                if (!endpoint) {
                    throw new Error(`Endpoint para servicio ClientesPorCupon (ID: ${this.SERVICE_ID}) no encontrado`);
                }

                return this.http.post<CupondArrayResponse>(endpoint.url, {
                    action: 'SLD',
                    id_cupon: id,
                    ...this.getSessionData()
                }).pipe(
                    map((response: any) => {                      
                        const first = Array.isArray(response) ? response[0] : response;
                      
                        if (!first?.data || !Array.isArray(first.data) || first.data.length === 0) {
                          return {
                            statuscode: first?.statuscode ?? 500,
                            mensaje: 'Sin data',
                            data: []
                          };
                        }
                      
                        const dataRow = first.data[0];                   
                        const realKey = Object.keys(dataRow)[0];
                        const realData = dataRow[realKey];
                                           
                        return {
                          statuscode: first.statuscode,
                          mensaje: first.mensaje,
                          data: realData?.clientes ?? []
                        };
                      }),                      
                    catchError((error) => {
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
