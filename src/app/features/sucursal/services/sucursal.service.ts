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
        // Obtener endpoint dinámicamente por ID=15
        const endpoint = this.apiConfigService.getEndpointById(15);
        const sucursalUrl = endpoint ? endpoint.url : this.apiConfigService.getSucursalCrudUrl();

        console.log('🔗 === CONFIGURACIÓN DE ENDPOINT SUCURSAL ===');
        console.log('🔗 Método llamado: getAllSucursales');
        console.log('🔗 Endpoint dinámico ID=15:', endpoint ? endpoint.url : 'NO ENCONTRADO');
        console.log('🔗 Endpoint usado:', sucursalUrl);
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

                // Verificar si hay error del backend en el body
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    console.log('❌ Error del backend detectado en getAllSucursales:', responseData);
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

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
                // Si el error ya tiene un mensaje personalizado del backend, úsalo
                if (error && error.message && !error.message.includes('Error en getAllSucursales')) {
                    return throwError(() => error);
                }
                // Si no, usa el mensaje genérico
                return throwError(() => new Error('Error al obtener sucursales'));
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
        // Obtener endpoint dinámicamente por ID=15
        const endpoint = this.apiConfigService.getEndpointById(15);
        const sucursalUrl = endpoint ? endpoint.url : this.apiConfigService.getSucursalCrudUrl();

        const body = {
            action: 'IN', // Insert
            ...sucursalData,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        console.log('➕ Creando nueva sucursal:', body);

        return this.http.post<SucursalResponse>(sucursalUrl, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;

                // Verificar si hay error del backend en el body
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    console.log('❌ Error del backend detectado en createSucursal:', responseData);
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                console.log('✅ Sucursal creada:', responseData);
                return responseData;
            }),
            catchError(error => {
                console.error('❌ Error al crear sucursal:', error);
                // Si el error ya tiene un mensaje personalizado del backend, úsalo
                if (error && error.message && !error.message.includes('Error al crear sucursal')) {
                    return throwError(() => error);
                }
                // Si no, usa el mensaje genérico
                return throwError(() => new Error('Error al crear sucursal'));
            })
        );
    }

    /**
     * Actualiza una sucursal existente
     */
    updateSucursal(sucursalData: UpdateSucursalRequest): Observable<SucursalResponse> {
        // Obtener endpoint dinámicamente por ID=15
        const endpoint = this.apiConfigService.getEndpointById(15);
        const sucursalUrl = endpoint ? endpoint.url : this.apiConfigService.getSucursalCrudUrl();

        const body = {
            action: 'UP', // Update
            ...sucursalData,
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        console.log('📝 Actualizando sucursal:', body);

        return this.http.post<SucursalResponse>(sucursalUrl, body).pipe(
            map(response => {
                const responseData = Array.isArray(response) ? response[0] : response;

                // Verificar si hay error del backend en el body
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    console.log('❌ Error del backend detectado en updateSucursal:', responseData);
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                console.log('✅ Sucursal actualizada:', responseData);
                return responseData;
            }),
            catchError(error => {
                console.error('❌ Error al actualizar sucursal:', error);
                // Si el error ya tiene un mensaje personalizado del backend, úsalo
                if (error && error.message && !error.message.includes('Error al actualizar sucursal')) {
                    return throwError(() => error);
                }
                // Si no, usa el mensaje genérico
                return throwError(() => new Error('Error al actualizar sucursal'));
            })
        );
    }

    /**
     * Elimina una sucursal
     */
    deleteSucursal(idSucursal: number): Observable<SucursalResponse> {
        // Obtener endpoint dinámicamente por ID=15
        const endpoint = this.apiConfigService.getEndpointById(15);
        const sucursalUrl = endpoint ? endpoint.url : this.apiConfigService.getSucursalCrudUrl();

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

                // Verificar si hay error del backend en el body
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    console.log('❌ Error del backend detectado en deleteSucursal:', responseData);
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                console.log('✅ Sucursal eliminada:', responseData);
                return responseData;
            }),
            catchError(error => {
                console.error('❌ Error al eliminar sucursal:', error);
                // Si el error ya tiene un mensaje personalizado del backend, úsalo
                if (error && error.message && !error.message.includes('Error al eliminar sucursal')) {
                    return throwError(() => error);
                }
                // Si no, usa el mensaje genérico
                return throwError(() => new Error('Error al eliminar sucursal'));
            })
        );
    }

    /**
     * Actualiza un campo específico de una sucursal (para edición inline)
     */
    updateSucursalField(idSucursal: number, field: string, value: any): Observable<SucursalResponse> {
        // Obtener endpoint dinámicamente por ID=15
        const endpoint = this.apiConfigService.getEndpointById(15);
        const sucursalUrl = endpoint ? endpoint.url : this.apiConfigService.getSucursalCrudUrl();

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

                // Verificar si hay error del backend en el body
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    console.log('❌ Error del backend detectado en updateSucursalField:', responseData);
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                console.log('✅ Campo actualizado:', responseData);
                return responseData;
            }),
            catchError(error => {
                console.error('❌ Error al actualizar campo:', error);
                // Si el error ya tiene un mensaje personalizado del backend, úsalo
                if (error && error.message && !error.message.includes('Error al actualizar campo')) {
                    return throwError(() => error);
                }
                // Si no, usa el mensaje genérico
                return throwError(() => new Error('Error al actualizar campo de sucursal'));
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
