import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    Sucursal,
    SucursalResponse,
    CreateSucursalRequest,
    UpdateSucursalRequest,
    SucursalFilters
} from '../models/sucursal.interface';

@Injectable({
    providedIn: 'root'
})
export class SucursalService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    /**
     * Obtiene todas las sucursales
     */
    getAllSucursales(filters?: SucursalFilters): Observable<SucursalResponse> {
        // Obtener endpoint desde configuración
        const sucursalUrl = this.apiConfigService.getSucursalCrudUrl();

        console.log('🔗 === CONFIGURACIÓN DE ENDPOINT SUCURSAL ===');
        console.log('🔗 Método llamado: getAllSucursales');
        console.log('🔗 Endpoint obtenido:', sucursalUrl);
        console.log('🔗 Filtros aplicados:', filters);
        console.log('🔗 === FIN CONFIGURACIÓN SUCURSAL ===');

        // Preparar el body con la acción y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
        const body: any = {
            action: 'SL', // Según las convenciones del proyecto: SL para query/search
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        // Agregar filtros si existen
        if (filters) {
            if (filters.id_proy) body.id_proy = filters.id_proy;
            if (filters.estado) body.estado = filters.estado;
            if (filters.zona_geografica) body.zona_geografica = filters.zona_geografica;
        }

        console.log('📤 Payload enviado:', body);

        return this.http.post<SucursalResponse>(sucursalUrl, body).pipe(
            map(response => {
                console.log('✅ Respuesta cruda del servidor:', response);

                // Procesar respuesta según el patrón del proyecto
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200 && responseData.data) {
                    console.log('✅ Datos procesados correctamente:', responseData.data.length, 'sucursales');
                    return responseData;
                } else {
                    console.warn('⚠️ Respuesta inesperada del servidor:', responseData);
                    return { statuscode: 200, mensaje: 'ok', data: [] };
                }
            }),
            catchError(error => {
                console.error('❌ Error en getAllSucursales:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Obtiene sucursales por proyecto específico
     */
    getSucursalesByProyecto(idProyecto: number): Observable<SucursalResponse> {
        return this.getAllSucursales({ id_proy: idProyecto });
    }

    /**
     * Crea una nueva sucursal
     */
    createSucursal(sucursalData: CreateSucursalRequest): Observable<SucursalResponse> {
        const sucursalUrl = this.apiConfigService.getSucursalCrudUrl();

        const body = {
            action: 'IN', // Insert
            ...sucursalData,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        console.log('➕ Creando nueva sucursal:', body);

        return this.http.post<SucursalResponse>(sucursalUrl, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;
                console.log('✅ Sucursal creada:', responseData);
                return responseData;
            }),
            catchError(error => {
                console.error('❌ Error al crear sucursal:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Actualiza una sucursal existente
     */
    updateSucursal(sucursalData: UpdateSucursalRequest): Observable<SucursalResponse> {
        const sucursalUrl = this.apiConfigService.getSucursalCrudUrl();

        const body = {
            action: 'UP', // Update
            ...sucursalData,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        console.log('📝 Actualizando sucursal:', body);

        return this.http.post<SucursalResponse>(sucursalUrl, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;
                console.log('✅ Sucursal actualizada:', responseData);
                return responseData;
            }),
            catchError(error => {
                console.error('❌ Error al actualizar sucursal:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Elimina una sucursal
     */
    deleteSucursal(idSucursal: number): Observable<SucursalResponse> {
        const sucursalUrl = this.apiConfigService.getSucursalCrudUrl();

        // Para DELETE, enviar usr e id_session como query params (REGLA CRÍTICA DEL PROYECTO)
        const sessionData = this.getSessionData();
        const params = new HttpParams()
            .set('usr', sessionData.usr?.toString() || '')
            .set('id_session', sessionData.id_session?.toString() || '');

        const body = {
            action: 'DL', // Delete
            sucursal: idSucursal
        };

        console.log('🗑️ Eliminando sucursal:', idSucursal);

        return this.http.delete<SucursalResponse>(sucursalUrl, { params, body }).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;
                console.log('✅ Sucursal eliminada:', responseData);
                return responseData;
            }),
            catchError(error => {
                console.error('❌ Error al eliminar sucursal:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Actualiza un campo específico de una sucursal (para edición inline)
     */
    updateSucursalField(idSucursal: number, field: string, value: any): Observable<SucursalResponse> {
        const sucursalUrl = this.apiConfigService.getSucursalCrudUrl();

        const body = {
            action: 'UP',
            sucursal: idSucursal,
            [field]: value,
            ...this.getSessionData()
        };

        console.log('📝 Actualizando campo', field, 'de sucursal', idSucursal, 'con valor:', value);

        return this.http.post<SucursalResponse>(sucursalUrl, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;
                console.log('✅ Campo actualizado:', responseData);
                return responseData;
            }),
            catchError(error => {
                console.error('❌ Error al actualizar campo:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Método auxiliar para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)
     */
    private getSessionData(): { usr?: string | number; id_session?: number } {
        return this.sessionService.getApiPayloadBase();
    }
}
