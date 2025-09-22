import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';

export interface Proyecto {
    id_proy: number;
    nombre: string;
    descripcion?: string;
    estado?: string;
    fecha_creacion?: string;
    fecha_mod?: string;
    usr_a?: string | number;
    usr_m?: string | number;
}

export interface ProyectoResponse {
    statuscode: number;
    mensaje: string;
    data: Proyecto[];
}

@Injectable({
    providedIn: 'root'
})
export class ProyectoService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // ID del servicio de proyectos (debe coincidir con el registro en tabla spconfig)
    private readonly SERVICE_ID = 10; // Ajustar según el ID real en spconfig

    /**
     * Obtiene todos los proyectos
     */
    getAllProyectos(): Observable<ProyectoResponse> {
        // Obtener endpoint desde configuración
        const proyectoUrl = this.apiConfigService.getProyectoCrudUrl();

        console.log('🔗 === CONFIGURACIÓN DE ENDPOINT PROYECTO ===');
        console.log('🔗 Método llamado: getAllProyectos');
        console.log('🔗 Endpoint obtenido:', proyectoUrl);
        console.log('🔗 === FIN CONFIGURACIÓN PROYECTO ===');

        // Preparar el body con la acción y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
        const body = {
            action: 'SL', // Según las convenciones del proyecto: SL para query/search
            ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
        };

        console.log('📤 Payload enviado:', body);

        return this.http.post<ProyectoResponse>(proyectoUrl, body).pipe(
            map(response => {
                console.log('✅ Respuesta cruda del servidor:', response);

                // Procesar respuesta según el patrón del proyecto
                const responseData = Array.isArray(response) ? response[0] : response;

                // Verificar si hay error del backend en el body
                if (responseData && responseData.statuscode && responseData.statuscode !== 200) {
                    console.log('❌ Error del backend detectado en getAllProyectos:', responseData);
                    throw new Error(responseData.mensaje || `Error del servidor: ${responseData.statuscode}`);
                }

                if (responseData && responseData.statuscode === 200 && responseData.data) {
                    console.log('✅ Proyectos procesados correctamente:', responseData.data.length, 'proyectos');
                    return responseData;
                } else {
                    console.warn('⚠️ Respuesta inesperada del servidor:', responseData);
                    return { statuscode: 200, mensaje: 'ok', data: [] };
                }
            }),
            catchError(error => {
                console.error('❌ Error en getAllProyectos:', error);
                // Si el error ya tiene un mensaje personalizado del backend, úsalo
                if (error && error.message && !error.message.includes('Error en getAllProyectos')) {
                    return throwError(() => error);
                }
                // Si no, usa el mensaje genérico
                return throwError(() => new Error('Error al obtener proyectos'));
            })
        );
    }

    /**
     * Obtiene un proyecto específico por ID
     */
    getProyectoById(idProyecto: number): Observable<Proyecto | null> {
        return this.getAllProyectos().pipe(
            map(response => {
                const proyecto = response.data.find(p => p.id_proy === idProyecto);
                return proyecto || null;
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
