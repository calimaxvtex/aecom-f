import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  Marca,
  MarcasResponse,
  MarcasList
} from '../models/marca.interface';
import { ApiResponse } from '../models/common.interface';

import { ApiConfigService } from '@/core/services/api/api-config.service';
import { SessionService } from '@/core/services/session.service';
import { LocalStorageCacheService } from '@/core/services/local-storage-cache.service';
import { MessageService } from 'primeng/api';

/**
 * Servicio para consultas del catálogo de marcas
 * Endpoint obtenido dinámicamente por ID 12 usando ApiConfigService
 * Solo utiliza método POST con action: M
 * Implementa cache inteligente para optimizar performance
 * Sin compresión - consulta directa al servidor
 */
@Injectable({
  providedIn: 'root'
})
export class MarcasService {
  private readonly MARCAS_ENDPOINT_ID = 12;
  private readonly DEFAULT_ACTION = 'M';
  private readonly CACHE_KEY = 'marcas_catalog';

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

  // Cache inteligente para marcas
  private marcasCache: Marca[] = [];
  private isLoaded = false;

  /**
   * Obtiene la URL del endpoint de marcas usando ApiConfigService
   */
  private getMarcasUrl(): string {
    const endpoint = this.apiConfigService.getEndpointById(this.MARCAS_ENDPOINT_ID);

    if (endpoint && endpoint.url) {
      console.log(`🔗 URL de marcas obtenida: ${endpoint.url}`);
      return endpoint.url;
    } else {
      // Fallback a la URL hardcodeada si no se encuentra el endpoint
      const fallbackUrl = `${this.apiConfigService.getBaseUrl()}/api/marcas/v1/${this.MARCAS_ENDPOINT_ID}`;
      console.warn(`⚠️ Endpoint de marcas no encontrado, usando fallback: ${fallbackUrl}`);
      return fallbackUrl;
    }
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    this.apiConfigService.setBaseUrl(url);
    console.log(`🔧 URL base de marcas configurada: ${url}`);
  }

  /**
   * Obtiene la URL base actual
   */
  getBaseUrl(): string {
    return this.apiConfigService.getBaseUrl();
  }

  /**
   * POST - Consulta inteligente de marcas con action: M
   * Si ya se cargó el catálogo completo, consulta desde cache
   * Si no, consulta remota al servidor
   *
   * @param marca - Nombre de la marca (opcional)
   *               Si no se especifica, devuelve todas las marcas
   */
  getMarcas(marca?: string): Observable<Marca[]> {
    // Si ya está cargado el catálogo, hacer consulta local desde cache
    if (this.isLoaded) {
      return this.getMarcasLocal(marca);
    }

    // Si no está cargado, hacer consulta remota
    return this.getMarcasRemote(marca);
  }

  /**
   * Consulta local desde el cache (cuando ya se cargó el catálogo)
   */
  private getMarcasLocal(marca?: string): Observable<Marca[]> {
    console.log(`📊 Consultando marcas desde CACHE local - marca: ${marca || 'todas'}`);

    let resultados = this.marcasCache;

    // Si se especificó marca, filtrar por ella
    if (marca) {
      resultados = resultados.filter(m =>
        m.marca.toLowerCase().includes(marca.toLowerCase())
      );
      console.log(`🎯 Marcas encontradas con filtro "${marca}": ${resultados.length} resultado(s)`);
    } else {
      console.log(`📋 Todas las marcas: ${resultados.length} resultado(s)`);
    }

    return of(resultados);
  }

  /**
   * Consulta remota al servidor (cuando no se cargó el catálogo)
   */
  private getMarcasRemote(marca?: string): Observable<Marca[]> {
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action: this.DEFAULT_ACTION,
      ...(marca && { marca }),
      ...sessionData // usr, id_session
    };

    console.log(`🌐 Consultando marcas desde SERVIDOR - marca: ${marca || 'todas'}`);

    const url = this.getMarcasUrl();
    console.log(`🌐 URL de marcas usada: ${url}`);

    return this.http.post<MarcasResponse>(url, body, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          console.log(`✅ Consulta remota exitosa: ${response.data.length} marcas encontradas`);
          return response.data;
        }
        console.warn(`⚠️ Respuesta sin datos: ${response.mensaje}`);
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cargar catálogo completo de marcas con cache local persistente
   * Estrategia: localStorage (7 días) → Servidor → Guardar en localStorage
   */
  loadAllMarcas(): Observable<Marca[]> {
    console.log(`🚀 Iniciando carga de marcas con cache local`);

    // ✅ PASO 1: Intentar cargar desde localStorage
    const cachedMarcas = this.localStorageCache.get<Marca[]>(this.CACHE_KEY);

    if (cachedMarcas && cachedMarcas.length > 0) {
      console.log(`💾 ✅ Marcas cargadas desde localStorage: ${cachedMarcas.length} marcas`);

      // Sincronizar con cache en memoria
      this.marcasCache = cachedMarcas;
      this.isLoaded = true;

      return of(cachedMarcas);
    }

    // ✅ PASO 2: Si no hay cache local válido, cargar desde servidor
    console.log(`🌐 Cargando marcas desde servidor (sin cache local válido)`);

    const sessionData = this.sessionService.getApiPayloadBase();
    const body = {
      action: this.DEFAULT_ACTION,
      ...sessionData // usr, id_session (sin parámetro marca = todas)
    };

    const url = this.getMarcasUrl();
    console.log(`🌐 URL de carga usada: ${url}`);

    return this.http.post<MarcasResponse>(url, body, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          console.log(`✅ Marcas cargadas desde servidor: ${response.data.length} marcas`);
          return response.data;
        }
        console.warn(`⚠️ Respuesta sin datos: ${response.mensaje || 'Sin mensaje'}`);
        return [];
      }),
      tap(marcas => {
        // ✅ PASO 3: Guardar en cache en memoria
        this.marcasCache = marcas;
        this.isLoaded = true;
        console.log(`💾 Catálogo guardado en cache memoria: ${marcas.length} marcas`);

        // ✅ PASO 4: Guardar en localStorage para persistencia
        this.localStorageCache.set(this.CACHE_KEY, marcas);
        console.log(`💾 Catálogo guardado en localStorage: ${marcas.length} marcas`);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener todas las marcas disponibles
   * Alias conveniente para getMarcas() sin parámetro
   */
  getAllMarcas(): Observable<Marca[]> {
    return this.getMarcas();
  }

  /**
   * Buscar marcas por nombre (solo funciona si está cargado el cache)
   */
  searchMarcas(query: string): Observable<Marca[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    if (!this.isLoaded) {
      console.warn('⚠️ Búsqueda requiere que el catálogo esté cargado. Use loadAllMarcas() primero.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Cache No Cargado',
        detail: 'Para buscar, primero debe cargar el catálogo completo',
        life: 3000
      });
      return of([]);
    }

    console.log(`🔍 Buscando marcas con query: "${query}"`);

    const resultados = this.marcasCache.filter(marca =>
      marca.marca.toLowerCase().includes(query.toLowerCase())
    );

    return of(resultados);
  }

  /**
   * Obtener una marca específica por nombre
   */
  getMarcaByName(nombre: string): Observable<Marca | null> {
    return this.getMarcas(nombre).pipe(
      map(marcas => marcas.length > 0 ? marcas[0] : null)
    );
  }

  /**
   * Verificar si una marca existe
   */
  marcaExists(nombre: string): Observable<boolean> {
    return this.getMarcaByName(nombre).pipe(
      map(marca => marca !== null)
    );
  }

  /**
   * Probar conectividad con la API de marcas
   */
  testConnection(): Observable<boolean> {
    if (!this.isLoaded) {
      // Si no hay cache, probar con loadAllMarcas
      return this.loadAllMarcas().pipe(
        map(() => true),
        catchError(() => of(false))
      );
    } else {
      // Si hay cache, probar con una consulta getMarcas
      return this.getMarcas().pipe(
        map(marcas => Array.isArray(marcas)),
        catchError(() => of(false))
      );
    }
  }

  /**
   * Obtener estado del cache
   */
  getCacheStatus(): { isLoaded: boolean; count: number } {
    return {
      isLoaded: this.isLoaded,
      count: this.marcasCache.length
    };
  }

  /**
   * Limpiar cache local y en memoria
   */
  clearCache(): void {
    this.marcasCache = [];
    this.isLoaded = false;
    this.localStorageCache.remove(this.CACHE_KEY);
    console.log('🗑️ Cache de marcas limpiado completamente');
  }

  /**
   * Verificar si el cache está cargado
   */
  isCacheLoaded(): boolean {
    return this.isLoaded;
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
   * Manejo de errores centralizado con MessageService
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de marcas';

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

    console.error('❌ Error en MarcasService:', error);

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
