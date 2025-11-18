import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    Carrier,
    CarrierResponse,
    CreateCarrierRequest,
    UpdateCarrierRequest,
    HorarioCarrier,
    HorarioCarrierResponse,
    CreateHorarioCarrierRequest,
    UpdateHorarioCarrierRequest
} from '../models/carrier.interface';

/**
 * Servicio para la gestión de carriers
 * Endpoint: /api/admcarr/v1
 */
@Injectable({
    providedIn: 'root'
})
export class CarrierService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    /**
     * Obtiene todos los carriers según filtros
     */
    getAllCarriers(filters?: {
        estado?: 'A' | 'I' | 'B' | 'R';
    }): Observable<CarrierResponse> {
        const carrierUrl = this.apiConfigService.getCarrierCrudUrl();

        const payload = {
            action: 'SL',
            ...this.sessionService.getApiPayloadBase(),
            ...filters
        };

        console.log('📦 Consultando carriers desde:', carrierUrl);
        console.log('📦 Payload:', payload);
        return this.http.post<CarrierResponse>(carrierUrl, payload);
    }

    /**
     * Crea un nuevo carrier
     */
    createCarrier(carrier: CreateCarrierRequest): Observable<any> {
        const carrierUrl = this.apiConfigService.getCarrierCrudUrl();

        const payload = {
            action: 'IN',
            ...this.sessionService.getApiPayloadBase(),
            ...carrier
        };

        console.log('📦 Creando carrier:', payload);
        return this.http.post(carrierUrl, payload);
    }

    /**
     * Actualiza un carrier existente
     */
    updateCarrier(carrier: UpdateCarrierRequest): Observable<any> {
        const carrierUrl = this.apiConfigService.getCarrierCrudUrl();

        const payload = {
            action: 'UP',
            ...this.sessionService.getApiPayloadBase(),
            ...carrier
        };

        console.log('📦 Actualizando carrier:', payload);
        return this.http.post(carrierUrl, payload);
    }

    /**
     * Elimina un carrier
     */
    deleteCarrier(idCarrier: number): Observable<any> {
        const carrierUrl = this.apiConfigService.getCarrierCrudUrl();

        const payload = {
            action: 'DL',
            ...this.sessionService.getApiPayloadBase(),
            id_carrier: idCarrier
        };

        console.log('📦 Eliminando carrier:', payload);
        return this.http.post(carrierUrl, payload);
    }

    /**
     * Actualiza un campo específico de un carrier
     */
    updateCarrierField(idCarrier: number, field: string, value: any): Observable<any> {
        const carrierUrl = this.apiConfigService.getCarrierCrudUrl();

        const payload = {
            action: 'UP',
            ...this.sessionService.getApiPayloadBase(),
            id_carrier: idCarrier,
            [field]: value
        };

        console.log('📦 Actualizando campo carrier:', payload);
        return this.http.post(carrierUrl, payload);
    }

    // ========== MÉTODOS PARA HORARIOS ==========

    /**
     * Obtiene todos los horarios de un carrier
     */
    getHorariosByCarrier(idCarrier: number): Observable<HorarioCarrierResponse> {
        const carrierUrl = this.apiConfigService.getCarrierSchedCrudUrl();

        const payload = {
            action: 'SL',
            ...this.sessionService.getApiPayloadBase(),
            id_carrier: idCarrier
        };

        console.log('🕐 Consultando horarios del carrier:', idCarrier);
        console.log('🕐 Payload:', payload);
        return this.http.post<HorarioCarrierResponse>(carrierUrl, payload);
    }

    /**
     * Crea un nuevo horario para un carrier
     */
    createHorario(horario: CreateHorarioCarrierRequest): Observable<any> {
        const carrierUrl = this.apiConfigService.getCarrierSchedCrudUrl();

        const payload = {
            action: 'IN',
            ...this.sessionService.getApiPayloadBase(),
            ...horario
        };

        console.log('🕐 Creando horario:', payload);
        return this.http.post(carrierUrl, payload);
    }

    /**
     * Actualiza un horario existente
     */
    updateHorario(horario: UpdateHorarioCarrierRequest): Observable<any> {
        const carrierUrl = this.apiConfigService.getCarrierSchedCrudUrl();

        const payload = {
            action: 'UP',
            ...this.sessionService.getApiPayloadBase(),
            ...horario
        };

        console.log('🕐 Actualizando horario:', payload);
        return this.http.post(carrierUrl, payload);
    }

    /**
     * Elimina un horario
     */
    deleteHorario(idSched: number): Observable<any> {
        const carrierUrl = this.apiConfigService.getCarrierSchedCrudUrl();

        const payload = {
            action: 'DL',
            ...this.sessionService.getApiPayloadBase(),
            id_sched: idSched
        };

        console.log('🕐 Eliminando horario:', payload);
        return this.http.post(carrierUrl, payload);
    }
}
