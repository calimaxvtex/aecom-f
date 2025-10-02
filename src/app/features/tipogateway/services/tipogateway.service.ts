import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import { 
    TipoGatewayCrudResponse, 
    TipoGatewayCrudSingleResponse, 
    TipoGatewayFormItem, 
    TipoGatewayRequest 
} from '../models/tipogateway.interface';

/**
 * Servicio CRUD para el catálogo de Gateways de Pagos
 * Endpoint ID: 23 - Tipo Gateway
 * Maneja operaciones CRUD completas para tipos de gateway de pago
 */
@Injectable({
    providedIn: 'root'
})
export class TipoGatewayService {
    private readonly ENDPOINT_ID = 23; // ID del endpoint para tipo gateway
    
    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfigService,
        private sessionService: SessionService
    ) {
        console.log('🚀 TipoGatewayService inicializado');
        console.log('🔗 Usando endpoint ID:', this.ENDPOINT_ID);
    }

    /**
     * Obtener URL del endpoint de tipo gateway
     */
    private getTipoGatewayUrl(): Observable<string> {
        return new Observable(observer => {
            const endpoint = this.apiConfig.getEndpointById(this.ENDPOINT_ID);
            if (endpoint) {
                console.log(`📡 URL obtenida para TipoGateway (ID ${this.ENDPOINT_ID}):`, endpoint.url);
                observer.next(endpoint.url);
                observer.complete();
            } else {
                console.error(`❌ No se encontró endpoint con ID ${this.ENDPOINT_ID}`);
                observer.error(new Error(`Endpoint con ID ${this.ENDPOINT_ID} no encontrado`));
            }
        });
    }

    /**
     * GET - Obtener todos los tipos de gateway
     */
    getTipoGateways(): Observable<TipoGatewayCrudResponse> {
        console.log('📋 Obteniendo lista de tipos de gateway...');

        const payload: TipoGatewayRequest = {
            action: 'SL', // SELECT
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('📤 Payload para obtener tipos de gateway:', payload);

        return this.getTipoGatewayUrl().pipe(
            switchMap(url => 
                this.http.post<TipoGatewayCrudResponse>(url, payload, this.httpOptions)
            ),
            map(response => {
                console.log('✅ Tipos de gateway obtenidos:', response.data?.length || 0, 'items');
                return response;
            }),
            catchError(error => {
                console.error('❌ Error al obtener tipos de gateway:', error);
                return throwError(() => new Error('Error al cargar tipos de gateway'));
            })
        );
    }

    /**
     * POST - Crear nuevo tipo de gateway
     */
    createTipoGateway(item: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse> {
        console.log('➕ Creando nuevo tipo de gateway:', item);

        const payload: TipoGatewayRequest = {
            action: 'IN', // INSERT
            nombre: item.nombre ?? undefined,
            clave: item.clave ?? undefined,
            tipo_deposito: item.tipo_deposito ?? undefined,
            estado: item.estado ?? undefined,
            swActivo: item.swActivo ?? undefined,
            idj: item.idj ?? undefined,
            sw: item.sw ?? undefined,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('📤 Payload para crear tipo de gateway:', payload);

        return this.getTipoGatewayUrl().pipe(
            switchMap(url => 
                this.http.post<TipoGatewayCrudSingleResponse>(url, payload, this.httpOptions)
            ),
            map(response => {
                console.log('✅ Tipo de gateway creado exitosamente:', response.data);
                return response;
            }),
            catchError(error => {
                console.error('❌ Error al crear tipo de gateway:', error);
                return throwError(() => new Error('Error al crear tipo de gateway'));
            })
        );
    }

    /**
     * PUT - Actualizar tipo de gateway existente
     */
    updateTipoGateway(item: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse> {
        console.log('✏️ Actualizando tipo de gateway:', item);

        if (!item.id) {
            return throwError(() => new Error('ID es requerido para actualizar'));
        }

        const payload: TipoGatewayRequest = {
            action: 'UP', // UPDATE
            id: item.id,
            nombre: item.nombre ?? undefined,
            clave: item.clave ?? undefined,
            tipo_deposito: item.tipo_deposito ?? undefined,
            estado: item.estado ?? undefined,
            swActivo: item.swActivo ?? undefined,
            idj: item.idj ?? undefined,
            sw: item.sw ?? undefined,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('📤 Payload para actualizar tipo de gateway:', payload);

        return this.getTipoGatewayUrl().pipe(
            switchMap(url => 
                this.http.post<TipoGatewayCrudSingleResponse>(url, payload, this.httpOptions)
            ),
            map(response => {
                console.log('✅ Tipo de gateway actualizado exitosamente:', response.data);
                return response;
            }),
            catchError(error => {
                console.error('❌ Error al actualizar tipo de gateway:', error);
                return throwError(() => new Error('Error al actualizar tipo de gateway'));
            })
        );
    }

    /**
     * DELETE - Eliminar tipo de gateway
     */
    deleteTipoGateway(id: number): Observable<TipoGatewayCrudSingleResponse> {
        console.log('🗑️ Eliminando tipo de gateway con ID:', id);

        const payload: TipoGatewayRequest = {
            action: 'DE', // DELETE
            id: id,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('📤 Payload para eliminar tipo de gateway:', payload);

        return this.getTipoGatewayUrl().pipe(
            switchMap(url => 
                this.http.post<TipoGatewayCrudSingleResponse>(url, payload, this.httpOptions)
            ),
            map(response => {
                console.log('✅ Tipo de gateway eliminado exitosamente');
                return response;
            }),
            catchError(error => {
                console.error('❌ Error al eliminar tipo de gateway:', error);
                return throwError(() => new Error('Error al eliminar tipo de gateway'));
            })
        );
    }

    /**
     * POST - Crear/Actualizar tipo de gateway (detecta automáticamente)
     */
    saveTipoGateway(item: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse> {
        // Determinar si es creación o actualización
        const hasId = item.id && item.id !== null && item.id !== undefined;
        const action = hasId ? 'actualizar' : 'crear';
        
        console.log('🔍 Determinando acción:', {
            id: item.id,
            hasId,
            action,
            itemKeys: Object.keys(item)
        });
        
        if (hasId) {
            return this.updateTipoGateway(item);
        } else {
            return this.createTipoGateway(item);
        }
    }

    /**
     * GET - Obtener un tipo de gateway por ID
     */
    getTipoGatewayById(id: number): Observable<TipoGatewayCrudSingleResponse> {
        console.log('🔍 Obteniendo tipo de gateway por ID:', id);

        const payload: TipoGatewayRequest = {
            action: 'SL', // SELECT
            id: id,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        console.log('📤 Payload para obtener tipo de gateway por ID:', payload);

        return this.getTipoGatewayUrl().pipe(
            switchMap(url => 
                this.http.post<TipoGatewayCrudSingleResponse>(url, payload, this.httpOptions)
            ),
            map(response => {
                console.log('✅ Tipo de gateway obtenido por ID:', response.data);
                return response;
            }),
            catchError(error => {
                console.error('❌ Error al obtener tipo de gateway por ID:', error);
                return throwError(() => new Error('Error al obtener tipo de gateway'));
            })
        );
    }

    /**
     * Método de debug para verificar configuración
     */
    debugService(): void {
        console.log('🔧 TipoGatewayService - Configuración:');
        console.log('  - Endpoint ID:', this.ENDPOINT_ID);
        console.log('  - Sesión actual:', this.sessionService.getSession());
        
        const endpoint = this.apiConfig.getEndpointById(this.ENDPOINT_ID);
        if (endpoint) {
            console.log('  - URL endpoint:', endpoint.url);
        } else {
            console.log('  - ❌ Endpoint no encontrado');
        }
    }
}
