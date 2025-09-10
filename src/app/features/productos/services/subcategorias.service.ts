import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  Subcategoria,
  SubcategoriaAction,
  SubcategoriaActionParams,
  SubcategoriaFilters
} from '../models/subcategoria.interface';
import { ApiResponse } from '../models/common.interface';

import { ApiConfigService } from '@/core/services/api/api-config.service';
import { SessionService } from '@/core/services/session.service';
import { LocalStorageCacheService } from '@/core/services/local-storage-cache.service';
import { MessageService } from 'primeng/api';
import { CompressionService, CompressedApiResponse, DecompressionResult } from '@/core/services/compression';

/**
 * Servicio para consultas del catálogo de subcategorías
 * Endpoint obtenido dinámicamente por ID 12 usando ApiConfigService
 * Actions disponibles: SCAT (consulta) y LSCAT (load completo)
 * Implementa cache inteligente para optimizar performance
 * Soporta compresión de datos con swcomp=1 para reducir bandwidth
 * Integrado con CompressionService para manejo automático de algoritmos
 * Maneja automáticamente respuestas comprimidas del backend (swcomp=1)
 * Soporta formatos: Buffer de Node.js, base64, arrays directos
 */
@Injectable({
  providedIn: 'root'
})
export class SubcategoriasService {
  private readonly SUBCATEGORIAS_ENDPOINT_ID = 12;
  private readonly CACHE_KEY = 'subcategorias_catalog';
  private readonly ACTIONS = {
    SCAT: 'SCAT',   // Consultar subcategorías (con cache inteligente)
    LSCAT: 'LSCAT'  // Load completo del catálogo
  } as const;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Inyección moderna usando inject()
  private http = inject(HttpClient);
  private apiConfigService = inject(ApiConfigService);
  private sessionService = inject(SessionService);
  private localStorageCache = inject(LocalStorageCacheService);
  private messageService = inject(MessageService);
  private compressionService = inject(CompressionService);

  // Cache inteligente para subcategorías
  private subcategoriasCache: Subcategoria[] = [];
  private isLoaded = false;

  // Callback para mostrar respuesta cruda (para debugging)
  private onRespuestaCruda?: (respuesta: CompressedApiResponse<Subcategoria[]>) => void;

  /**
   * Configurar callback para mostrar respuesta cruda (para debugging)
   */
  setRespuestaCrudaCallback(callback: (respuesta: CompressedApiResponse<Subcategoria[]>) => void): void {
    this.onRespuestaCruda = callback;
    console.log('🔧 Callback de respuesta cruda configurado para subcategorías');
  }

  /**
   * Obtiene la URL del endpoint de subcategorías usando ApiConfigService
   */
  private getSubcategoriasUrl(): string {
    const endpoint = this.apiConfigService.getEndpointById(this.SUBCATEGORIAS_ENDPOINT_ID);

    if (endpoint && endpoint.url) {
      console.log(`🔗 URL de subcategorías obtenida: ${endpoint.url}`);
      return endpoint.url;
    } else {
      // Fallback a la URL hardcodeada si no se encuentra el endpoint
      const fallbackUrl = `${this.apiConfigService.getBaseUrl()}/api/subcategorias/v1/${this.SUBCATEGORIAS_ENDPOINT_ID}`;
      console.warn(`⚠️ Endpoint de subcategorías no encontrado, usando fallback: ${fallbackUrl}`);
      return fallbackUrl;
    }
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    this.apiConfigService.setBaseUrl(url);
    console.log(`🔧 URL base de subcategorías configurada: ${url}`);
  }

  /**
   * Obtiene la URL base actual
   */
  getBaseUrl(): string {
    return this.apiConfigService.getBaseUrl();
  }

  /**
   * Inicializar el servicio asegurando que los endpoints estén cargados
   * Debe llamarse antes de usar cualquier método del servicio
   */
  initialize(): Observable<void> {
    return new Observable(observer => {
      if (this.apiConfigService.hasEndpoints()) {
        console.log('✅ Endpoints ya están cargados para subcategorías');
        observer.next();
        observer.complete();
      } else {
        console.log('⏳ Esperando carga de endpoints para subcategorías...');
        this.apiConfigService.getEndpointsLoaded$().subscribe(loaded => {
          if (loaded) {
            console.log('✅ Endpoints cargados correctamente para subcategorías');
            observer.next();
            observer.complete();
          }
        });

        // Cargar endpoints si no están disponibles
        this.apiConfigService.getspConfis().subscribe({
          next: () => {
            // Los endpoints se cargan automáticamente en el tap del servicio
          },
          error: (error) => {
            console.error('❌ Error cargando configuración de endpoints para subcategorías:', error);
            observer.error(error);
          }
        });
      }
    });
  }

  /**
   * LSCAT - Load completo del catálogo de subcategorías con cache local persistente
   * Estrategia: localStorage (7 días) → Servidor → Guardar en localStorage
   */
  loadAllSubcategorias(params?: { swcomp?: 0 | 1 }): Observable<Subcategoria[]> {
    console.log(`🚀 Iniciando carga de subcategorías con cache local`);

    // ✅ PASO 1: Intentar cargar desde localStorage
    const cachedSubcategorias = this.localStorageCache.get<Subcategoria[]>(this.CACHE_KEY);

    if (cachedSubcategorias && cachedSubcategorias.length > 0) {
      console.log(`💾 ✅ Subcategorías cargadas desde localStorage: ${cachedSubcategorias.length} subcategorías`);

      // Sincronizar con cache en memoria
      this.subcategoriasCache = cachedSubcategorias;
      this.isLoaded = true;

      return of(cachedSubcategorias);
    }

    // ✅ PASO 2: Si no hay cache local válido, cargar desde servidor
    console.log(`🌐 Cargando subcategorías desde servidor (sin cache local válido)`);

    const sessionData = this.sessionService.getApiPayloadBase();
    const body = {
      action: this.ACTIONS.LSCAT,
      swcomp: params?.swcomp || 0, // 0 = sin compresión, 1 = con compresión
      ...sessionData // usr, id_session
    };

    const modo = params?.swcomp === 1 ? 'COMPRIMIDO' : 'NORMAL';
    console.log(`📥 Cargando catálogo completo de subcategorías con LSCAT (${modo})`);

    const url = this.getSubcategoriasUrl();
    console.log(`🌐 URL de load completo usada: ${url}`);

    return this.http.post<CompressedApiResponse<Subcategoria[]>>(url, body, this.httpOptions).pipe(
      tap(response => {
        // Mostrar respuesta cruda si hay callback configurado
        if (this.onRespuestaCruda) {
          this.onRespuestaCruda(response);
        }
      }),
      map(response => {
        if (response.statuscode === 200) {
          let subcategorias: Subcategoria[] = [];

          // Verificar si la respuesta está comprimida (swcomp puede venir del backend aunque no se solicite)
          if (response.swcomp === 1) {
            console.log('📦 Respuesta comprimida detectada (swcomp=1), descomprimiendo...');

            try {
              const decompressionResult = this.compressionService.detectAndDecompress<Subcategoria[]>(response.data);
              subcategorias = decompressionResult.data;

              console.log(`✅ Datos descomprimidos:`, {
                algoritmo: decompressionResult.algorithm,
                ratio: `${decompressionResult.compressionRatio}%`,
                tiempo: `${decompressionResult.processingTime.toFixed(2)}ms`,
                registros: subcategorias.length
              });
            } catch (error) {
              console.error('❌ Error descomprimiendo datos:', error);
              throw new Error('No se pudieron descomprimir los datos de subcategorías');
            }
          } else {
            // Datos sin comprimir
            subcategorias = response.data || [];
            console.log(`✅ Datos sin comprimir: ${subcategorias.length} registros`);
          }

          return subcategorias;
        }

        console.warn(`⚠️ Respuesta sin datos en LSCAT: ${response.mensaje || 'Sin mensaje'}`);
        return [];
      }),
      tap(subcategorias => {
        // ✅ PASO 3: Guardar en cache en memoria
        this.subcategoriasCache = subcategorias;
        this.isLoaded = true;
        console.log(`💾 Catálogo guardado en cache memoria: ${subcategorias.length} subcategorías`);

        // ✅ PASO 4: Guardar en localStorage para persistencia
        this.localStorageCache.set(this.CACHE_KEY, subcategorias);
        console.log(`💾 Catálogo guardado en localStorage: ${subcategorias.length} subcategorías`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * SCAT - Consulta inteligente de subcategorías
   * Si ya se hizo LSCAT, consulta local desde cache
   * Si no, consulta remota al servidor
   *
   * @param idcat - ID de la categoría (requerido)
   * @param idscat - ID de la subcategoría (opcional)
   *               Si no se especifica, devuelve todas las subcategorías de la categoría
   */
  getSubcategorias(idcat: number, idscat?: number): Observable<Subcategoria[]> {
    // Validar que se especificó la categoría
    if (!idcat) {
      console.error('❌ Error: idcat es requerido para consultar subcategorías');
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Parámetros',
        detail: 'El ID de categoría es requerido',
        life: 5000
      });
      return of([]);
    }

    // Si ya está cargado el catálogo, hacer consulta local
    if (this.isLoaded) {
      return this.getSubcategoriasLocal(idcat, idscat);
    }

    // Si no está cargado, hacer consulta remota
    return this.getSubcategoriasRemote(idcat, idscat);
  }

  /**
   * Consulta local desde el cache (cuando ya se hizo LSCAT)
   */
  private getSubcategoriasLocal(idcat: number, idscat?: number): Observable<Subcategoria[]> {
    console.log(`📊 Consultando subcategorías desde CACHE local - idcat: ${idcat}, idscat: ${idscat || 'todas'}`);

    // Filtrar por categoría
    let resultados = this.subcategoriasCache.filter(sub => sub.idcat === idcat);

    // Si se especificó subcategoría, filtrar también por ella
    if (idscat !== undefined) {
      resultados = resultados.filter(sub => sub.idscat === idscat);
      console.log(`🎯 Subcategoría específica encontrada: ${resultados.length} resultado(s)`);
    } else {
      console.log(`📋 Todas las subcategorías de categoría ${idcat}: ${resultados.length} resultado(s)`);
    }

    return of(resultados);
  }

  /**
   * Consulta remota al servidor (cuando no se hizo LSCAT)
   */
  private getSubcategoriasRemote(idcat: number, idscat?: number): Observable<Subcategoria[]> {
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action: this.ACTIONS.SCAT,
      idcat,
      ...(idscat !== undefined && { idscat }),
      ...sessionData // usr, id_session
    };

    console.log(`🌐 Consultando subcategorías desde SERVIDOR - idcat: ${idcat}, idscat: ${idscat || 'todas'}`);

    const url = this.getSubcategoriasUrl();
    console.log(`🌐 URL de subcategorías usada: ${url}`);
    return this.http.post<ApiResponse<Subcategoria[]>>(url, body, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          console.log(`✅ Consulta remota exitosa: ${response.data.length} subcategorías encontradas`);
          return response.data;
        }
        console.warn(`⚠️ Respuesta sin datos en SCAT: ${response.mensaje}`);
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener todas las subcategorías de una categoría específica
   * Alias conveniente para getSubcategorias(idcat) sin idscat
   */
  getSubcategoriasByCategoria(idcat: number): Observable<Subcategoria[]> {
    return this.getSubcategorias(idcat);
  }

  /**
   * Obtener una subcategoría específica por ID
   * Alias conveniente para getSubcategorias(idcat, idscat) con ambos IDs
   */
  getSubcategoriaById(idcat: number, idscat: number): Observable<Subcategoria | null> {
    return this.getSubcategorias(idcat, idscat).pipe(
      map(subcategorias => subcategorias.length > 0 ? subcategorias[0] : null)
    );
  }

  /**
   * Buscar subcategorías por nombre (solo funciona si está cargado el cache)
   */
  searchSubcategorias(query: string): Observable<Subcategoria[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    if (!this.isLoaded) {
      console.warn('⚠️ Búsqueda requiere que el catálogo esté cargado. Use loadAllSubcategorias() primero.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Cache No Cargado',
        detail: 'Para buscar, primero debe cargar el catálogo completo',
        life: 3000
      });
      return of([]);
    }

    console.log(`🔍 Buscando subcategorías con query: "${query}"`);

    const resultados = this.subcategoriasCache.filter(subcategoria =>
      subcategoria.nombre.toLowerCase().includes(query.toLowerCase())
    );

    return of(resultados);
  }

  /**
   * Obtener estado del cache
   */
  getCacheStatus(): { isLoaded: boolean; count: number; lastUpdated?: Date } {
    return {
      isLoaded: this.isLoaded,
      count: this.subcategoriasCache.length
    };
  }

  /**
   * Limpiar cache local y en memoria
   */
  clearCache(): void {
    this.subcategoriasCache = [];
    this.isLoaded = false;
    this.localStorageCache.remove(this.CACHE_KEY);
    console.log('🗑️ Cache de subcategorías limpiado completamente');
  }

  /**
   * Obtener información del cache local
   */
  getCacheInfo(): { hasLocalCache: boolean, daysRemaining: number, timestamp: number } | null {
    const info = this.localStorageCache.getInfo(this.CACHE_KEY);
    return info ? {
      hasLocalCache: true,
      daysRemaining: info.daysRemaining,
      timestamp: info.timestamp
    } : null;
  }

  /**
   * Verificar si el cache está cargado
   */
  isCacheLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Método genérico para ejecutar cualquier action
   */
  executeAction(action: SubcategoriaAction, params?: Partial<SubcategoriaActionParams>): Observable<Subcategoria[]> {
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action,
      ...params,
      ...sessionData
    };

    console.log(`🔧 Ejecutando action de subcategorías: ${action}`, body);

    const url = this.getSubcategoriasUrl();
    return this.http.post<ApiResponse<Subcategoria[]>>(url, body, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          // Si es LSCAT, actualizar cache
          if (action === this.ACTIONS.LSCAT) {
            this.subcategoriasCache = response.data;
            this.isLoaded = true;
          }
          return response.data;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Probar conectividad con la API de subcategorías
   */
  testConnection(): Observable<boolean> {
    if (!this.isLoaded) {
      // Si no hay cache, probar con LSCAT
      return this.loadAllSubcategorias().pipe(
        map(() => true),
        catchError(() => of(false))
      );
    } else {
      // Si hay cache, probar con una consulta SCAT
      return this.getSubcategorias(1).pipe(
        map(() => true),
        catchError(() => of(false))
      );
    }
  }

  /**
   * Manejo de errores centralizado con MessageService
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de subcategorías';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status) {
      // Error del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.message || 'Error desconocido'}`;
    } else if (error.message) {
      // Error personalizado
      errorMessage = error.message;
    } else if (error.error?.mensaje) {
      // Error desde la API
      errorMessage = error.error.mensaje;
    }

    console.error('❌ Error en SubcategoriasService:', error);

    // Mostrar mensaje de error usando MessageService
    this.messageService.add({
      severity: 'error',
      summary: `Error ${error.status || 'desconocido'}`,
      detail: errorMessage,
      life: 5000
    });

    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}
