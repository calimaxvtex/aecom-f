import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, of, switchMap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import { CompService } from '../../comp/services/comp.service';
import {
    Banner,
    BannerRawArrayResponse,
    BannerResponse,
    BannerSingleResponse,
    CreateBannerRequest,
    UpdateBannerRequest,
    BannerPaginationParams,
    BannerFilters,
    BannerStatsResponse,
    BannerAdvancedFilters,
    BannerRawResponseItem
} from '../models/banner.interface';

@Injectable({
    providedIn: 'root'
})
export class BannerService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);
    private compService = inject(CompService); // Servicio padre (dependencia)

    // ID del endpoint de banners en la configuración
    private readonly BANNER_ENDPOINT_ID = 19;

    constructor() {
        console.log('🏗️ BannerService inicializado');
        console.log('🔗 Usando endpoint ID:', this.BANNER_ENDPOINT_ID);
        console.log('👨‍👦 Servicio hijo dependiente de CompService');
    }

    // Método para obtener la URL del endpoint de banners
    private getBannerUrl(): Observable<string> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.BANNER_ENDPOINT_ID);
                if (!endpoint) {
                    return throwError(() => new Error(`Endpoint banners (ID: ${this.BANNER_ENDPOINT_ID}) no encontrado`));
                }

                console.log('🔗 URL de banners obtenida:', endpoint.url);
                return of(endpoint.url);
            })
        );
    }

    // Método auxiliar para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)
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
     * Obtiene todos los banners
     */
    getAllBanners(params?: BannerPaginationParams): Observable<BannerResponse> {
        console.log('📊 === CONFIGURACIÓN DE ENDPOINT BANNERS ===');
        console.log('📊 Método llamado: getAllBanners');
        console.log('📊 Endpoint ID:', this.BANNER_ENDPOINT_ID);

        return this.getBannerUrl().pipe(
            switchMap(url => {
                console.log('🔗 === CONEXIÓN HTTP ===');
                console.log('🔗 URL destino:', url);
                console.log('🔗 Método: POST');

                // Preparar el body con la acción y datos de sesión (REGLA CRÍTICA DEL PROYECTO)
                const body: any = {
                    action: 'SL', // Según las convenciones del proyecto: SL para query/search
                    ...this.getSessionData() // ⚠️ REGLA CRÍTICA: Inyección obligatoria de sesión
                };

                // Agregar parámetros de paginación y filtros al body si existen
                if (params) {
                    if (params.page) body.page = params.page;
                    if (params.limit) body.limit = params.limit;
                    if (params.sort) body.sort = params.sort;
                    if (params.order) body.order = params.order;

                    // Agregar filtros si existen
                    if (params.filters) {
                        Object.entries(params.filters).forEach(([key, value]) => {
                            if (value !== undefined && value !== null && value !== '') {
                                body[key] = value;
                            }
                        });
                    }
                }

                console.log('🔗 Body enviado:', body);
                console.log('🔗 === FIN CONEXIÓN ===');

                return this.http.post<BannerRawArrayResponse>(url, body).pipe(
                    map((response: any) => {
                        console.log('🔍 === RESPUESTA CRUDA DEL BACKEND (SIN TIPOS) ===');
                        console.log('🔍 URL que respondió:', url);
                        console.log('🔍 Respuesta completa:', response);
                        console.log('🔍 Tipo de respuesta:', Array.isArray(response) ? 'Array' : typeof response);
                        console.log('🔍 Es array?', Array.isArray(response));
                        console.log('🔍 Longitud si es array:', Array.isArray(response) ? response.length : 'N/A');
                        console.log('🔍 === FIN RESPUESTA CRUDA ===');

                        // Análisis detallado de la estructura
                        if (Array.isArray(response)) {
                            console.log('🔍 === ANÁLISIS DE ARRAY ===');
                            response.forEach((item, index) => {
                                console.log(`🔍 Elemento [${index}]:`, item);
                                console.log(`🔍 Elemento [${index}] tipo:`, typeof item);
                                if (item && typeof item === 'object') {
                                    console.log(`🔍 Elemento [${index}] keys:`, Object.keys(item));
                                    console.log(`🔍 Elemento [${index}] statuscode:`, item.statuscode);
                                    console.log(`🔍 Elemento [${index}] mensaje:`, item.mensaje);
                                    console.log(`🔍 Elemento [${index}] data tipo:`, typeof item.data);
                                    console.log(`🔍 Elemento [${index}] data:`, item.data);
                                }
                            });

                            // Tomar el primer elemento del array (patrón del proyecto)
                            if (response.length > 0) {
                                const firstItem = response[0];

                                // ⚠️ CRÍTICO: Verificar errores del backend
                                if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                    console.log('❌ Backend devolvió error en array:', firstItem);
                                    throw new Error(firstItem.mensaje || 'Error del servidor');
                                }

                                return {
                                    statuscode: firstItem.statuscode || 200,
                                    mensaje: firstItem.mensaje || 'OK',
                                    data: firstItem.data || []
                                } as BannerResponse;
                            }
                        }

                        // Si la respuesta es un objeto directo
                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || []
                        } as BannerResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error en getAllBanners:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al obtener banners') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al obtener banners'));
                    })
                );
            })
        );
    }

    /**
     * Crea un nuevo banner
     */
    createBanner(banner: CreateBannerRequest): Observable<BannerSingleResponse> {
        console.log('➕ Creando banner:', banner);

        return this.getBannerUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'IN' as const, // Insert según convenciones del proyecto
                    ...banner,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para crear banner:', payload);

                return this.http.post<BannerRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de crear banner:', response);

                        // Procesar respuesta (similar al patrón de otros servicios)
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                console.log('📊 StatusCode recibido:', firstItem.statuscode);
                                console.log('📝 Mensaje de error:', firstItem.mensaje);
                                throw new Error(firstItem.mensaje || `Error del servidor (${firstItem.statuscode})`);
                            }

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Banner creado correctamente',
                                data: firstItem.data || null
                            } as BannerSingleResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            console.log('📊 StatusCode recibido:', response.statuscode);
                            console.log('📝 Mensaje de error:', response.mensaje);
                            throw new Error(response.mensaje || `Error del servidor (${response.statuscode})`);
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Banner creado correctamente',
                            data: response.data || null
                        } as BannerSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al crear banner:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al crear el banner') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al crear el banner'));
                    })
                );
            })
        );
    }

    /**
     * Actualiza un banner existente
     */
    updateBanner(banner: UpdateBannerRequest): Observable<BannerSingleResponse> {
        console.log('✏️ Actualizando banner:', banner);

        return this.getBannerUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'UP' as const, // Update según convenciones del proyecto
                    ...banner,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para actualizar banner:', payload);

                return this.http.post<BannerRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de actualizar banner:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                console.log('📊 StatusCode recibido:', firstItem.statuscode);
                                console.log('📝 Mensaje de error:', firstItem.mensaje);
                                throw new Error(firstItem.mensaje || `Error del servidor (${firstItem.statuscode})`);
                            }

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Banner actualizado correctamente',
                                data: firstItem.data || banner as Banner
                            } as BannerSingleResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            console.log('📊 StatusCode recibido:', response.statuscode);
                            console.log('📝 Mensaje de error:', response.mensaje);
                            throw new Error(response.mensaje || `Error del servidor (${response.statuscode})`);
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Banner actualizado correctamente',
                            data: response.data || banner as Banner
                        } as BannerSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al actualizar banner:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al actualizar el banner') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al actualizar el banner'));
                    })
                );
            })
        );
    }

    /**
     * Elimina un banner
     */
    deleteBanner(id: number): Observable<BannerSingleResponse> {
        console.log('🗑️ Eliminando banner ID:', id);

        return this.getBannerUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'DL' as const, // Delete según convenciones del proyecto
                    id_mb: id,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para eliminar banner:', payload);

                return this.http.post<BannerRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de eliminar banner:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Banner eliminado correctamente',
                                data: {} as Banner // No hay data en delete
                            } as BannerSingleResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Banner eliminado correctamente',
                            data: {} as Banner
                        } as BannerSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al eliminar banner:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al eliminar el banner') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al eliminar el banner'));
                    })
                );
            })
        );
    }

    /**
     * Obtiene un banner específico por ID
     */
    getBannerById(id: number): Observable<BannerSingleResponse> {
        console.log('🔍 Obteniendo banner por ID:', id);

        return this.getBannerUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL' as const, // Query según convenciones del proyecto
                    id_mb: id,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para obtener banner:', payload);

                return this.http.post<BannerRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de obtener banner:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }

                            const banners = firstItem.data || [];
                            const banner = banners.find((b: Banner) => b.id_mb === id);

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'OK',
                                data: banner || {} as Banner
                            } as BannerSingleResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || {} as Banner
                        } as BannerSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener banner:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al obtener el banner') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al obtener el banner'));
                    })
                );
            })
        );
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Obtiene banners por componente
     */
    getBannersByComponente(idComp: number): Observable<BannerResponse> {
        return this.getAllBanners({
            filters: { id_comp: idComp }
        });
    }

    /**
     * Obtiene banners activos
     */
    getBannersActivos(): Observable<BannerResponse> {
        return this.getAllBanners({
            filters: { swEnable: 1 }
        });
    }

    /**
     * Obtiene banners programados (con fechas)
     */
    getBannersProgramados(): Observable<BannerResponse> {
        return this.getAllBanners({
            filters: { swsched: 1 }
        });
    }

    /**
     * Actualiza el orden de un banner
     */
    updateBannerOrder(id: number, orden: number): Observable<BannerSingleResponse> {
        console.log('🔄 Actualizando orden del banner:', { id, orden });

        return this.updateBanner({
            id_mb: id,
            orden: orden
        });
    }

    /**
     * Activa/desactiva un banner
     */
    toggleBannerStatus(id: number, activo: boolean): Observable<BannerSingleResponse> {
        console.log('🔄 Cambiando estado del banner:', { id, activo });

        return this.updateBanner({
            id_mb: id,
            swEnable: activo ? 1 : 0
        });
    }

    // ========== MÉTODOS DE CONFIGURACIÓN ==========

    /**
     * Obtiene estadísticas de banners
     */
    getEstadisticas(): Observable<BannerStatsResponse> {
        console.log('📊 Obteniendo estadísticas de banners');

        return this.getBannerUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL',
                    getStats: true,
                    ...this.getSessionData()
                };

                return this.http.post<BannerRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'OK',
                                data: firstItem.stats || {} as any
                            } as BannerStatsResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.stats || {} as any
                        } as BannerStatsResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener estadísticas:', error);

                        // Si el error ya tiene un mensaje personalizado del backend, úsalo
                        if (error && error.message && error.message !== 'Error al obtener estadísticas') {
                            return throwError(() => error);
                        }
                        // Si no, usa el mensaje genérico
                        return throwError(() => new Error('Error al obtener estadísticas'));
                    })
                );
            })
        );
    }

    // ========== MÉTODOS DE VALIDACIÓN ==========

    /**
     * Valida si el orden ya existe para un componente
     */
    validarOrdenUnico(idComp: number, orden: number, excludeId?: number): Observable<boolean> {
        console.log('✅ Validando orden único:', { idComp, orden, excludeId });

        return this.getBannerUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL',
                    validarOrden: orden,
                    id_comp: idComp,
                    excludeId: excludeId || 0,
                    ...this.getSessionData()
                };

                return this.http.post<BannerRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];
                            return firstItem.valido !== false; // Si no viene false, asumimos true
                        }
                        return response.valido !== false;
                    }),
                    catchError(error => {
                        console.error('❌ Error al validar orden:', error);
                        return of(false);
                    })
                );
            })
        );
    }

    /**
     * Valida las fechas de un banner
     */
    validarFechas(fechaIni: string, fechaFin: string): boolean {
        const ini = new Date(fechaIni);
        const fin = new Date(fechaFin);
        return ini <= fin;
    }
}
