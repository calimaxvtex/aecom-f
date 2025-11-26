import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    PushNotification,
    PushNotificationResponse,
    CreatePushNotificationRequest,
    UpdatePushNotificationRequest
} from '../models/push-notification.interface';

/**
 * Servicio para la gestión de Push Notifications
 * Endpoint: /api/admpush/v1
 */
@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    /**
     * Obtiene todas las push notifications según filtros
     */
    getAllPushNotifications(filters?: {
        ESTADO?: 'A' | 'B' | 'R' | 'I';
    }): Observable<PushNotificationResponse> {
        const pushUrl = this.apiConfigService.getPushNotificationCrudUrl();

        const payload = {
            action: 'SL',
            ...this.sessionService.getApiPayloadBase(),
            ...filters
        };

        console.log('📱 Consultando push notifications desde:', pushUrl);
        console.log('📱 Payload:', payload);
        return this.http.post<PushNotificationResponse>(pushUrl, payload);
    }

    /**
     * Crea una nueva push notification
     */
    createPushNotification(pushNotification: CreatePushNotificationRequest): Observable<any> {
        const pushUrl = this.apiConfigService.getPushNotificationCrudUrl();

        const payload = {
            action: 'IN',
            ...this.sessionService.getApiPayloadBase(),
            ...pushNotification
        };

        console.log('📱 Creando push notification:', payload);
        return this.http.post(pushUrl, payload);
    }

    /**
     * Actualiza una push notification existente
     */
    updatePushNotification(pushNotification: UpdatePushNotificationRequest): Observable<any> {
        const pushUrl = this.apiConfigService.getPushNotificationCrudUrl();

        const payload = {
            action: 'UP',
            ...this.sessionService.getApiPayloadBase(),
            ...pushNotification
        };

        console.log('📱 Actualizando push notification:', payload);
        return this.http.post(pushUrl, payload);
    }

    /**
     * Elimina una push notification
     */
    deletePushNotification(id: number): Observable<any> {
        const pushUrl = this.apiConfigService.getPushNotificationCrudUrl();

        const payload = {
            action: 'DL',
            ...this.sessionService.getApiPayloadBase(),
            ID: id
        };

        console.log('📱 Eliminando push notification:', payload);
        return this.http.post(pushUrl, payload);
    }

    /**
     * Actualiza un campo específico de una push notification
     */
    updatePushNotificationField(id: number, field: string, value: any): Observable<any> {
        const pushUrl = this.apiConfigService.getPushNotificationCrudUrl();

        const payload = {
            action: 'UP',
            ...this.sessionService.getApiPayloadBase(),
            ID: id,
            [field]: value
        };

        console.log('📱 Actualizando campo push notification:', payload);
        return this.http.post(pushUrl, payload);
    }
}

