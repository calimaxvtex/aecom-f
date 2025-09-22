import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError, from, of, switchMap, tap } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';

// Interfaz para entradas del cache
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}
import {
    CatConcepto,
    CatConceptoRawResponse,
    CatConceptoResponse,
    CatConceptoRawArrayResponse,
    CatConceptoArrayResponse,
    CatConceptoSingleResponse,
    CreateCatConceptoRequest,
    UpdateCatConceptoRequest,
    CatConceptoPaginationParams
} from '../models/catconceptos.interface';

@Injectable({
    providedIn: 'root'
})
export class CatConceptosService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // ID del endpoint de catconceptos en la configuración
    private readonly CATCONCEPTOS_ENDPOINT_ID = 16;

    // Cache para almacenar respuestas
    private cache = new Map<string, CacheEntry<any>>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos

    constructor() {
        console.log('🏗️ CatConceptosService inicializado con cache');
        console.log('🔗 Usando endpoint ID:', this.CATCONCEPTOS_ENDPOINT_ID);
        console.log('💾 Cache duration:', this.CACHE_DURATION / 1000 / 60, 'minutos');
    }

    // ========== MÉTODOS DE CACHE ==========

    /**
     * Obtiene datos del cache si son válidos
     */
    private getFromCache<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now > entry.expiresAt) {
            console.log('🗑️ Cache expirado para key:', key);
            this.cache.delete(key);
            return null;
        }

        console.log('✅ Cache hit para key:', key);
        return entry.data;
    }

    /**
     * Almacena datos en el cache
     */
    private setInCache<T>(key: string, data: T): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.CACHE_DURATION
        };

        this.cache.set(key, entry);
        console.log('💾 Datos almacenados en cache para key:', key);
    }

    /**
     * Invalida el cache para una clave específica o todo el cache
     */
    clearCache(key?: string): void {
        if (key) {
            this.cache.delete(key);
            console.log('🗑️ Cache limpiado para key:', key);
        } else {
            this.cache.clear();
            console.log('🗑️ Todo el cache limpiado');
        }
    }

    /**
     * Crea una clave única para el cache basada en el método y parámetros
     */
    private createCacheKey(method: string, params?: any): string {
        const paramString = params ? JSON.stringify(params) : '';
        return `${method}_${paramString}`;
    }

    /**
     * Obtiene estadísticas del cache
     */
    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    // Método para obtener la URL del endpoint de catconceptos
    private getCatConceptosUrl(): Observable<string> {
        return from(this.apiConfigService.waitForEndpoints()).pipe(
            switchMap(() => {
                const endpoint = this.apiConfigService.getEndpointById(this.CATCONCEPTOS_ENDPOINT_ID);
                if (!endpoint) {
                    return throwError(() => new Error(`Endpoint catconceptos (ID: ${this.CATCONCEPTOS_ENDPOINT_ID}) no encontrado`));
                }

                console.log('🔗 URL de catconceptos obtenida:', endpoint.url);
                return of(endpoint.url);
            })
        );
    }

    // Método auxiliar para obtener datos de sesión (REGLA CRÍTICA DEL PROYECTO)
    private getSessionData(): any {
        const session = this.sessionService.getSession();

        // Si no hay sesión, intentar crear una sesión temporal para testing
        if (!session) {
            console.warn('⚠️ No hay sesión activa. Creando sesión temporal para testing...');

            // Crear sesión temporal con valores por defecto
            const tempSession = {
                usuario: 'test_user',
                id_session: 999,
                nombre: 'Usuario Test',
                email: 'test@example.com',
                isLoggedIn: true
            };

            // Establecer la sesión temporal
            this.sessionService.setSession(tempSession);

            return {
                usr: tempSession.usuario,
                id_session: tempSession.id_session
            };
        }

        return {
            usr: session.usuario,
            id_session: session.id_session
        };
    }

    /**
     * Obtiene todos los conceptos (con cache)
     */
    getAllConceptos(params?: CatConceptoPaginationParams, forceRefresh: boolean = false): Observable<CatConceptoResponse> {
        console.log('📊 === CONFIGURACIÓN DE ENDPOINT CATCONCEPTOS ===');
        console.log('📊 Método llamado: getAllConceptos');
        console.log('📊 Endpoint ID:', this.CATCONCEPTOS_ENDPOINT_ID);

        // Crear clave única para el cache basada en los parámetros
        const cacheKey = this.createCacheKey('getAllConceptos', params);
        console.log('🔑 Cache key generada:', cacheKey);

        // Si se fuerza el refresh, limpiar el cache primero
        if (forceRefresh) {
            console.log('🔄 Forzando refresh - limpiando cache para key:', cacheKey);
            this.clearCache(cacheKey);
        }

        // Verificar si hay datos en cache (solo si no se fuerza refresh)
        const cachedData = this.getFromCache<CatConceptoResponse>(cacheKey);
        if (cachedData && !forceRefresh) {
            console.log('🚀 Retornando datos desde cache');
            return of(cachedData);
        }

        return this.getCatConceptosUrl().pipe(
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

                return this.http.post<CatConceptoRawArrayResponse>(url, body).pipe(
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
                                } as CatConceptoResponse;
                            }
                        }

                        // Si la respuesta es un objeto directo
                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        const result = {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || []
                        } as CatConceptoResponse;

                        // Almacenar en cache si la respuesta es exitosa
                        if (result.statuscode === 200) {
                            this.setInCache(cacheKey, result);
                        }

                        return result;
                    }),
                    catchError(error => {
                        console.error('❌ Error en getAllConceptos:', error);

                        // ⚠️ CRÍTICO: Preservar mensaje original del backend si ya existe
                        const errorMessage = error instanceof Error ? error.message : 'Error al obtener conceptos';
                        console.log('📤 Enviando error al componente:', errorMessage);

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    /**
     * Crea un nuevo concepto
     */
    createConcepto(concepto: CreateCatConceptoRequest): Observable<CatConceptoSingleResponse> {
        console.log('➕ Creando concepto:', concepto);

        return this.getCatConceptosUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'IN' as const, // Insert según convenciones del proyecto
                    ...concepto,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para crear concepto:', payload);

                return this.http.post<CatConceptoRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de crear concepto:', response);

                        // Procesar respuesta (similar al patrón de otros servicios)
                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Concepto creado correctamente',
                                data: firstItem.data || concepto as CatConcepto
                            } as CatConceptoSingleResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Concepto creado correctamente',
                            data: response.data || concepto as CatConcepto
                        } as CatConceptoSingleResponse;
                    }),
                    tap(() => {
                        // 🧹 Limpiar cache después de crear exitosamente
                        console.log('🧹 Limpiando cache después de crear concepto');
                        this.clearCache();
                    }),
                    catchError(error => {
                        console.error('❌ Error al crear concepto:', error);

                        // ⚠️ CRÍTICO: Preservar mensaje original del backend si ya existe
                        const errorMessage = error instanceof Error ? error.message : 'Error al crear el concepto';
                        console.log('📤 Enviando error al componente:', errorMessage);

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    /**
     * Actualiza un concepto existente
     */
    updateConcepto(concepto: UpdateCatConceptoRequest): Observable<CatConceptoSingleResponse> {
        console.log('✏️ Actualizando concepto:', concepto);

        return this.getCatConceptosUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'UP' as const, // Update según convenciones del proyecto
                    ...concepto,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para actualizar concepto:', payload);

                return this.http.post<CatConceptoRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de actualizar concepto:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Concepto actualizado correctamente',
                                data: firstItem.data || concepto as CatConcepto
                            } as CatConceptoSingleResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Concepto actualizado correctamente',
                            data: response.data || concepto as CatConcepto
                        } as CatConceptoSingleResponse;
                    }),
                    tap(() => {
                        // 🧹 Limpiar cache después de actualizar exitosamente
                        console.log('🧹 Limpiando cache después de actualizar concepto');
                        this.clearCache();
                    }),
                    catchError(error => {
                        console.error('❌ Error al actualizar concepto:', error);

                        // ⚠️ CRÍTICO: Preservar mensaje original del backend si ya existe
                        const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el concepto';
                        console.log('📤 Enviando error al componente:', errorMessage);

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    /**
     * Elimina un concepto
     */
    deleteConcepto(id: number): Observable<CatConceptoSingleResponse> {
        console.log('🗑️ Eliminando concepto ID:', id);

        return this.getCatConceptosUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'DL' as const, // Delete según convenciones del proyecto
                    id_c: id,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para eliminar concepto:', payload);

                return this.http.post<CatConceptoRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de eliminar concepto:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'Concepto eliminado correctamente',
                                data: {} as CatConcepto // No hay data en delete
                            } as CatConceptoSingleResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'Concepto eliminado correctamente',
                            data: {} as CatConcepto
                        } as CatConceptoSingleResponse;
                    }),
                    tap(() => {
                        // 🧹 Limpiar cache después de eliminar exitosamente
                        console.log('🧹 Limpiando cache después de eliminar concepto');
                        this.clearCache();
                    }),
                    catchError(error => {
                        console.error('❌ Error al eliminar concepto:', error);

                        // ⚠️ CRÍTICO: Preservar mensaje original del backend si ya existe
                        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el concepto';
                        console.log('📤 Enviando error al componente:', errorMessage);

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    /**
     * Obtiene un concepto específico por ID
     */
    getConceptoById(id: number): Observable<CatConceptoSingleResponse> {
        console.log('🔍 Obteniendo concepto por ID:', id);

        return this.getCatConceptosUrl().pipe(
            switchMap(url => {
                const payload = {
                    action: 'SL' as const, // Query según convenciones del proyecto
                    id_c: id,
                    ...this.getSessionData()
                };

                console.log('📤 Payload para obtener concepto:', payload);

                return this.http.post<CatConceptoRawArrayResponse>(url, payload).pipe(
                    map((response: any) => {
                        console.log('✅ Respuesta de obtener concepto:', response);

                        if (Array.isArray(response) && response.length > 0) {
                            const firstItem = response[0];

                            // ⚠️ CRÍTICO: Verificar errores del backend
                            if (firstItem.statuscode && firstItem.statuscode !== 200) {
                                console.log('❌ Backend devolvió error en array:', firstItem);
                                throw new Error(firstItem.mensaje || 'Error del servidor');
                            }

                            const conceptos = firstItem.data || [];
                            const concepto = conceptos.find((c: CatConcepto) => c.id_c === id);

                            return {
                                statuscode: firstItem.statuscode || 200,
                                mensaje: firstItem.mensaje || 'OK',
                                data: concepto || {} as CatConcepto
                            } as CatConceptoSingleResponse;
                        }

                        // Verificar error en respuesta directa
                        if (response.statuscode && response.statuscode !== 200) {
                            console.log('❌ Backend devolvió error directo:', response);
                            throw new Error(response.mensaje || 'Error del servidor');
                        }

                        return {
                            statuscode: response.statuscode || 200,
                            mensaje: response.mensaje || 'OK',
                            data: response.data || {} as CatConcepto
                        } as CatConceptoSingleResponse;
                    }),
                    catchError(error => {
                        console.error('❌ Error al obtener concepto:', error);

                        // ⚠️ CRÍTICO: Preservar mensaje original del backend si ya existe
                        const errorMessage = error instanceof Error ? error.message : 'Error al obtener el concepto';
                        console.log('📤 Enviando error al componente:', errorMessage);

                        return throwError(() => new Error(errorMessage));
                    })
                );
            })
        );
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Obtiene los conceptos activos (swestado = 1)
     */
    getConceptosActivos(): Observable<CatConceptoResponse> {
        return this.getAllConceptos({
            filters: { swestado: 1 }
        });
    }

    /**
     * Obtiene conceptos por clave
     */
    getConceptoByClave(clave: string): Observable<CatConceptoSingleResponse> {
        return this.getAllConceptos({
            filters: { clave }
        }).pipe(
            map(response => ({
                statuscode: response.statuscode,
                mensaje: response.mensaje,
                data: response.data[0] || {} as CatConcepto
            }))
        );
    }
}
