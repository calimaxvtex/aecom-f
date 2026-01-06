import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    Pagina,
    PaginaResponse,
    PaginaSingleResponse,
    CreatePaginaRequest,
    UpdatePaginaRequest,
    PaginaQueryParams
} from '../models/pagina.interface';

@Injectable({
    providedIn: 'root'
})
export class PaginaService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    constructor() {
        console.log('📄 PaginaService inicializado');
    }

    // Metodo para obtener URL dinamica del endpoint de paginas
    private getPaginasUrl(): Observable<string> {
        return this.apiConfigService.getspConfis().pipe(
            map(() => {
                const endpoint = this.apiConfigService.getEndpointByName('paginas');
                if (!endpoint) {
                    console.warn('⚠️ Endpoint "paginas" no encontrado, usando URL por defecto');
                    return this.apiConfigService.getPaginasCrudUrl();
                }
                return endpoint.url;
            }),
            catchError(error => {
                console.warn('⚠️ Error obteniendo endpoint dinamico, usando URL por defecto:', error);
                return [this.apiConfigService.getPaginasCrudUrl()];
            })
        );
    }

    // Metodo para obtener datos de sesion (REGLA CRITICA DEL PROYECTO)
    private getSessionData(): any {
        const session = this.sessionService.getSession();
        if (!session) {
            throw new Error('Sesion no encontrada. Usuario debe estar autenticado.');
        }
        return {
            usr: session.usuario,
            id_session: session.id_session
        };
    }

    /**
     * Obtiene todas las paginas
     */
    getAllPaginas(params?: PaginaQueryParams): Observable<PaginaResponse> {
        console.log('📄 === CONFIGURACION DE ENDPOINT PAGINAS ===');
        console.log('📄 Metodo llamado: getAllPaginas');
        console.log('📄 Parametros:', params);

        return this.getPaginasUrl().pipe(
            switchMap(url => {
                console.log('🔗 === CONEXION HTTP ===');
                console.log('🔗 URL destino:', url);
                console.log('🔗 Metodo: POST');

                // Preparar el body con la accion y datos de sesion (REGLA CRITICA DEL PROYECTO)
                const body: any = {
                    action: 'SL', // Segun las convenciones del proyecto: SL para query/search
                    ...this.getSessionData() // ⚠️ REGLA CRITICA: Inyeccion obligatoria de sesion
                };

                // Agregar filtros si existen
                if (params) {
                    if (params.canal) body.canal = params.canal;
                    if (params.estado) body.estado = params.estado;
                    if (params.search) body.search = params.search;
                }

                console.log('🔗 Body enviado:', body);

                return this.http.post<PaginaResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('🔍 === RESPUESTA DEL BACKEND ===');
                        console.log('🔍 URL que respondio:', url);
                        console.log('🔍 Respuesta completa:', response);
                        console.log('🔍 Tipo de respuesta:', typeof response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvio error:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || []
                        } as PaginaResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error en getAllPaginas:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, usalo
                        if (error && error.message && error.message !== 'Error al obtener paginas') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje generico
                        return throwError(() => new Error('Error al obtener paginas'));
                    })
                );
            })
        );
    }

    /**
     * Crea una nueva pagina
     */
    createPagina(pagina: CreatePaginaRequest): Observable<PaginaSingleResponse> {
        console.log('➕ Creando pagina:', pagina);

        return this.getPaginasUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'IN' as const, // Insert segun convenciones del proyecto
                    ...pagina,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para crear pagina:', payload);

                return this.http.post<PaginaResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de crear pagina:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvio error en creacion:', response);
                            console.log('📊 StatusCode recibido:', response.statuscode);
                            console.log('📝 Mensaje de error:', response.mensaje);
                            throw new Error(response.mensaje || `Error del servidor (${response.statuscode})`);
                        }

                        // Tomar el primer elemento del array de respuesta
                        const paginaCreada = response.data && response.data.length > 0 ? response.data[0] : null;

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Pagina creada correctamente',
                            data: paginaCreada
                        } as PaginaSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al crear pagina:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, usalo
                        if (error && error.message && error.message !== 'Error al crear la pagina') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje generico
                        return throwError(() => new Error('Error al crear la pagina'));
                    })
                );
            })
        );
    }

    /**
     * Actualiza una pagina existente
     */
    updatePagina(pagina: UpdatePaginaRequest): Observable<PaginaSingleResponse> {
        console.log('✏️ Actualizando pagina:', pagina);

        return this.getPaginasUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'UP' as const, // Update segun convenciones del proyecto
                    ...pagina,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para actualizar pagina:', payload);

                return this.http.post<PaginaResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de actualizar pagina:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvio error en actualizacion:', response);
                            console.log('📊 StatusCode recibido:', response.statuscode);
                            console.log('📝 Mensaje de error:', response.mensaje);
                            throw new Error(response.mensaje || `Error del servidor (${response.statuscode})`);
                        }

                        // Tomar el primer elemento del array de respuesta
                        const paginaActualizada = response.data && response.data.length > 0 ? response.data[0] : null;

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Pagina actualizada correctamente',
                            data: paginaActualizada
                        } as PaginaSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al actualizar pagina:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, usalo
                        if (error && error.message && error.message !== 'Error al actualizar la pagina') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje generico
                        return throwError(() => new Error('Error al actualizar la pagina'));
                    })
                );
            })
        );
    }

    /**
     * Elimina una pagina (marca como baja)
     */
    deletePagina(idPag: number): Observable<PaginaSingleResponse> {
        console.log('🗑️ Eliminando pagina (marcando como baja) ID:', idPag);

        return this.getPaginasUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'DL' as const, // Delete segun convenciones del proyecto
                    id_pag: idPag,
                    id_pagd: idPag, // Segun el ejemplo, ambos IDs son requeridos
                    ...this.getSessionData()
                };

                console.log('📤 Payload para eliminar pagina:', payload);

                return this.http.post<PaginaResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de eliminar pagina:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvio error en eliminacion:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        // Tomar el primer elemento del array de respuesta
                        const paginaEliminada = response.data && response.data.length > 0 ? response.data[0] : null;

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Pagina eliminada correctamente',
                            data: paginaEliminada
                        } as PaginaSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al eliminar pagina:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, usalo
                        if (error && error.message && error.message !== 'Error al eliminar la pagina') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje generico
                        return throwError(() => new Error('Error al eliminar la pagina'));
                    })
                );
            })
        );
    }

    // ========== METODOS DE UTILIDAD ==========

    /**
     * Obtiene paginas activas
     */
    getPaginasActivas(): Observable<PaginaResponse> {
        return this.getAllPaginas({ estado: 1 });
    }

    /**
     * Obtiene paginas por canal
     */
    getPaginasByCanal(canal: 'WEB' | 'APP'): Observable<PaginaResponse> {
        return this.getAllPaginas({ canal });
    }

    /**
     * Busca paginas por nombre
     */
    buscarPaginas(termino: string): Observable<PaginaResponse> {
        return this.getAllPaginas({ search: termino });
    }
}