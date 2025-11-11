import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, switchMap, of } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    PaginaDet,
    PaginaDetResponse,
    PaginaDetSingleResponse,
    CreatePaginaDetRequest,
    UpdatePaginaDetRequest,
    PaginaDetQueryParams
} from '../models/pagina-det.interface';

@Injectable({
    providedIn: 'root'
})
export class PaginaDetService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    constructor() {
        console.log('📄 PaginaDetService inicializado');
    }

    // Método para obtener URL dinámica del endpoint de detalles de páginas
    private getPaginasDetUrl(): Observable<string> {
        return this.apiConfigService.getspConfis().pipe(
            map(() => {
                const endpoint = this.apiConfigService.getEndpointByName('paginas_det');
                if (!endpoint) {
                    console.warn('⚠️ Endpoint "paginas_det" no encontrado, usando URL por defecto');
                    return this.apiConfigService.getPaginasDetCrudUrl();
                }
                return endpoint.url;
            }),
            catchError(error => {
                console.warn('⚠️ Error obteniendo endpoint dinámico, usando URL por defecto:', error);
                return [this.apiConfigService.getPaginasDetCrudUrl()];
            })
        );
    }

    // Método para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)
    private getSessionData(): any {
        const session = this.sessionService.getSession();
        if (!session) {
            throw new Error('Sesión no encontrada. Usuario debe estar autenticado.');
        }
        return {
            usr: session.usuario,
            id_session: session.id_session
        };
    }

    /**
     * Obtiene componentes asociados a una página específica
     */
    getComponentesByPagina(idPag: number): Observable<PaginaDetResponse> {
        console.log('📄 === CONSULTA COMPONENTES POR PÁGINA ===');
        console.log('📄 Método llamado: getComponentesByPagina');
        console.log('📄 ID de página:', idPag);

        return this.getPaginasDetUrl().pipe(
            switchMap(url => {
                console.log('🔗 === CONEXIÓN HTTP ===');
                console.log('🔗 URL destino:', url);
                console.log('🔗 Método: POST');

                // Preparar el body según especificación del usuario
                const body: any = {
                    action: 'SL',
                    id_pag: idPag,
                    ...this.getSessionData() // usr, id_session
                };

                console.log('🔗 Body enviado:', body);
                console.log('🔗 Payload esperado:');
                console.log('🔗 {');
                console.log('🔗   "action": "SL",');
                console.log('🔗   "id_pag":', idPag + ',');
                console.log('🔗   "usr": "ADMIN",');
                console.log('🔗   "id_session": 1');
                console.log('🔗 }');

                return this.http.post<PaginaDetResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('🔍 === RESPUESTA DEL BACKEND ===');
                        console.log('🔍 URL que respondió:', url);
                        console.log('🔍 Respuesta completa:', response);
                        console.log('🔍 Tipo de respuesta:', typeof response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        console.log('✅ Respuesta exitosa - Componentes obtenidos:', response.data?.length || 0);
                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || []
                        } as PaginaDetResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error en getComponentesByPagina:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al obtener componentes de la página') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al obtener componentes de la página'));
                    })
                );
            })
        );
    }

    /**
     * Obtiene todos los detalles de páginas (LEGACY - mantener compatibilidad)
     * @deprecated Usar getComponentesByPagina(idPag) para consultas específicas
     */
    getAllPaginasDet(params?: PaginaDetQueryParams): Observable<PaginaDetResponse> {
        console.log('⚠️ Método getAllPaginasDet deprecated - usar getComponentesByPagina');
        console.log('📄 Parámetros:', params);

        // Si se proporciona id_pag, usar el método específico
        if (params?.id_pag) {
            return this.getComponentesByPagina(params.id_pag);
        }

        // Si no hay id_pag, devolver array vacío (este método requiere id_pag)
        console.warn('⚠️ getAllPaginasDet requiere id_pag - devolviendo array vacío');
        return of({
            statuscode: 200,
            mensaje: 'Se requiere especificar id_pag para obtener componentes',
            data: []
        });
    }

    /**
     * Agrega un componente a una página específica
     */
    agregarComponenteAPagina(paginaDet: CreatePaginaDetRequest): Observable<PaginaDetSingleResponse> {
        console.log('➕ Agregando componente a página:', paginaDet);

        return this.getPaginasDetUrl().pipe(
            switchMap(url => {
                // Payload específico según requerimiento del usuario
                const payload = {
                    action: 'IN' as const,
                    id_pag: paginaDet.id_pag.toString(), // Convertir a string como en el ejemplo
                    tipo_comp: paginaDet.tipo_comp,
                    id_ref: paginaDet.id_ref,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para agregar componente a página:', payload);
                console.log('📤 Payload esperado:');
                console.log('📤 {');
                console.log('📤   "action": "IN",');
                console.log('📤   "id_pag": "' + paginaDet.id_pag + '",');
                console.log('📤   "tipo_comp": "' + paginaDet.tipo_comp + '",');
                console.log('📤   "id_ref": ' + paginaDet.id_ref + ',');
                console.log('📤   "usr": "ADMIN",');
                console.log('📤   "id_session": 1');
                console.log('📤 }');

                return this.http.post<PaginaDetResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de agregar componente a página:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error al agregar componente:', response);
                            console.log('📊 StatusCode recibido:', response.statuscode);
                            console.log('📝 Mensaje de error:', response.mensaje);
                            throw new Error(response.mensaje || `Error del servidor (${response.statuscode})`);
                        }

                        // Tomar el primer elemento del array de respuesta
                        const componenteAgregado = response.data && response.data.length > 0 ? response.data[0] : null;

                        console.log('✅ Componente agregado exitosamente con id_pagd:', componenteAgregado?.id_pagd);

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Componente agregado exitosamente a la página',
                            data: componenteAgregado
                        } as PaginaDetSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al agregar componente a página:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al agregar componente a la página') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al agregar componente a la página'));
                    })
                );
            })
        );
    }

    /**
     * Crea un nuevo detalle de página (LEGACY - mantener compatibilidad)
     * @deprecated Usar agregarComponenteAPagina() en su lugar
     */
    createPaginaDet(paginaDet: CreatePaginaDetRequest): Observable<PaginaDetSingleResponse> {
        return this.agregarComponenteAPagina(paginaDet);
    }

    /**
     * Actualiza un detalle de página existente
     */
    updatePaginaDet(paginaDet: UpdatePaginaDetRequest): Observable<PaginaDetSingleResponse> {
        console.log('✏️ Actualizando detalle de página:', paginaDet);

        return this.getPaginasDetUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'UP' as const, // Update según convenciones del proyecto
                    ...paginaDet,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para actualizar detalle de página:', payload);

                return this.http.post<PaginaDetResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de actualizar detalle de página:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error en actualización:', response);
                            console.log('📊 StatusCode recibido:', response.statuscode);
                            console.log('📝 Mensaje de error:', response.mensaje);
                            throw new Error(response.mensaje || `Error del servidor (${response.statuscode})`);
                        }

                        // Tomar el primer elemento del array de respuesta
                        const paginaDetActualizada = response.data && response.data.length > 0 ? response.data[0] : null;

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Detalle de página actualizado correctamente',
                            data: paginaDetActualizada
                        } as PaginaDetSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al actualizar detalle de página:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al actualizar el detalle de página') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al actualizar el detalle de página'));
                    })
                );
            })
        );
    }

    /**
     * Elimina un detalle de página (marca como baja)
     */
    deletePaginaDet(idPagd: number, idPag: number): Observable<PaginaDetSingleResponse> {
        console.log('🗑️ Eliminando detalle de página (marcando como baja) ID:', idPagd);

        return this.getPaginasDetUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'DL' as const, // Delete según convenciones del proyecto
                    id_pagd: idPagd,
                    id_pag: idPag, // ID de la página padre también requerido
                    ...this.getSessionData()
                };

                console.log('📤 Payload para eliminar detalle de página:', payload);

                return this.http.post<PaginaDetResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de eliminar detalle de página:', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error en eliminación:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        // Tomar el primer elemento del array de respuesta
                        const paginaDetEliminada = response.data && response.data.length > 0 ? response.data[0] : null;

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Detalle de página eliminado correctamente',
                            data: paginaDetEliminada
                        } as PaginaDetSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al eliminar detalle de página:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al eliminar el detalle de página') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al eliminar el detalle de página'));
                    })
                );
            })
        );
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Obtiene componentes por página (método principal)
     */
    getByPagina(idPag: number): Observable<PaginaDetResponse> {
        return this.getComponentesByPagina(idPag);
    }

    /**
     * Verifica si una página tiene componentes asociados
     */
    paginaTieneComponentes(idPag: number): Observable<boolean> {
        return this.getComponentesByPagina(idPag).pipe(
            map(response => (response.data?.length || 0) > 0),
            catchError(() => of(false))
        );
    }

    /**
     * Obtiene el número de componentes de una página
     */
    contarComponentes(idPag: number): Observable<number> {
        return this.getComponentesByPagina(idPag).pipe(
            map(response => response.data?.length || 0),
            catchError(() => of(0))
        );
    }

    // ========== MÉTODOS LEGACY (MANTENER COMPATIBILIDAD) ==========

    /**
     * @deprecated Usar getByPagina(idPag) en su lugar
     */
    getPaginasDetByPagina(idPag: number): Observable<PaginaDetResponse> {
        return this.getByPagina(idPag);
    }

    /**
     * Obtiene componentes disponibles por tipo (payload dinámico)
     * Payload: {"action": "SL", "tipo_comp": "[tipo_seleccionado]", "usr": "ADMIN", "id_session": 1}
     * @param tipo_comp Tipo de componente seleccionado por el usuario (carrusel, categoria, vitrina, etc.)
     */
    getComponentesPorTipo(tipo_comp: string): Observable<any> {
        console.log('🔍 Consultando componentes por tipo:', tipo_comp);

        return this.getPaginasDetUrl().pipe(
            switchMap(url => {
                // Payload con tipo_comp dinámico según selección del usuario
                const payload = {
                    action: 'SL',
                    tipo_comp: tipo_comp,
                    usr: 'ADMIN',
                    id_session: 1
                };

                console.log('📤 Payload enviado:', payload);
                console.log('🔗 URL destino:', url);
                console.log('📋 Tipo de componente solicitado:', tipo_comp);

                return this.http.post<any>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta del backend para tipo', tipo_comp + ':', response);

                        // Verificar error del backend
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error para tipo', tipo_comp + ':', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return response;
                    }),
                    catchError(error => {
                        console.error('❌ Error en getComponentesPorTipo para tipo', tipo_comp + ':', error);
                        return throwError(() => new Error('Error al obtener componentes por tipo'));
                    })
                );
            })
        );
    }
}
