import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

import {
  Articulo,
  ArticuloAction,
  ArticuloActionParams,
  ArticuloFilters,
  ArticuloPagination
} from '../models/articulo.interface';
import { ApiResponse } from '../models/common.interface';

import { ApiConfigService } from '@/core/services/api/api-config.service';
import { SessionService } from '@/core/services/session.service';
import { MessageService } from 'primeng/api';
import { CompressionService } from '@/core/services/compression/compression.service';

/**
 * Servicio para consultas del catálogo de artículos
 * Endpoint obtenido dinámicamente por ID 12 usando ApiConfigService
 * Solo utiliza método POST con actions: GET, SL y LGET
 * Por defecto inyecta SL si no se especifica action
 * Incluye funcionalidad de cache inteligente con LGET
 * Las consultas GET y SL responden desde cache si está disponible
 */
@Injectable({
  providedIn: 'root'
})
export class ArticulosService {
  private readonly ARTICULOS_ENDPOINT_ID = 12;
  private readonly ARTICULOS_LOAD_ACTION = 'LGET';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Inyección moderna usando inject()
  private http = inject(HttpClient);
  private apiConfigService = inject(ApiConfigService);
  private sessionService = inject(SessionService);
  private messageService = inject(MessageService);
  private compressionService = inject(CompressionService);

  // ========== CACHE/BUFFER PARA ARTÍCULOS ==========
  private articulosCache: Articulo[] = [];
  private isCacheLoaded: boolean = false;

  // ========== CALLBACK PARA RESPUESTAS CRUDAS ==========
  private onRespuestaCruda?: (respuesta: any) => void;

  /**
   * Obtiene la URL del endpoint de artículos usando ApiConfigService
   */
  private getArticulosUrl(): string {
    const endpoint = this.apiConfigService.getEndpointById(this.ARTICULOS_ENDPOINT_ID);

    if (endpoint && endpoint.url) {
      console.log(`🔗 URL de artículos obtenida: ${endpoint.url}`);
      return endpoint.url;
    } else {
      // Fallback a la URL hardcodeada si no se encuentra el endpoint
      const fallbackUrl = `${this.apiConfigService.getBaseUrl()}/api/articulos/v1/${this.ARTICULOS_ENDPOINT_ID}`;
      console.warn(`⚠️ Endpoint no encontrado, usando fallback: ${fallbackUrl}`);
      return fallbackUrl;
    }
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    this.apiConfigService.setBaseUrl(url);
    console.log(`🔧 URL base de artículos configurada: ${url}`);
  }

  /**
   * Configurar callback para capturar respuestas crudas (para debugging de compresión)
   */
  setRespuestaCrudaCallback(callback: (respuesta: any) => void): void {
    this.onRespuestaCruda = callback;
    console.log('🔧 Callback de respuesta cruda configurado para artículos');
  }

  /**
   * Obtiene la URL base actual
   */
  getBaseUrl(): string {
    return this.apiConfigService.getBaseUrl();
  }

  /**
   * POST - Consulta general de artículos usando action por defecto 'SL'
   * Si no se especifica action, se inyecta 'SL' automáticamente
   * Incluye inyección obligatoria de sesión (usr, id_session)
   * Ahora valida si hay datos en cache antes de hacer consulta HTTP
   * Soporta compresión opcional con parámetro swcomp
   */
  getArticulos(params?: ArticuloActionParams, compressionParams?: { swcomp?: 0 | 1 }): Observable<Articulo[]> {
    // Por defecto inyectar 'SL' si no se especifica action
    const action = params?.action || 'SL';

    // Verificar si hay datos en cache para actions SL y GET
    if ((action === 'SL' || action === 'GET') && this.isCacheLoaded && this.articulosCache.length > 0) {
      console.log(`📦 Respondiendo desde CACHE: ${this.articulosCache.length} artículos disponibles`);

      // Aplicar filtros si existen
      if (params?.filters) {
        return this.applyFiltersToCache(params.filters);
      }

      return of([...this.articulosCache]);
    }

    // Inyección obligatoria de sesión para POST
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action,
      swcomp: compressionParams?.swcomp || 0, // Por defecto sin compresión
      ...params,
      ...sessionData // usr, id_session
    };

    console.log(`🔍 Consultando artículos con action: ${action} (desde SERVIDOR)`, body);

    const url = this.getArticulosUrl();
    console.log(`🌐 URL de artículos usada: ${url}`);

    return this.http.post(url, body, this.httpOptions).pipe(
      tap(response => {
        // Llamar al callback si está configurado (para debugging de compresión)
        if (this.onRespuestaCruda) {
          this.onRespuestaCruda(response);
        }
      }),
      map((response: any) => {
        if (response.statuscode === 200) {
          let articulos: Articulo[] = [];

          // Verificar si la respuesta está comprimida (swcomp=1)
          if (response.swcomp === 1) {
            console.log('🗜️ Respuesta comprimida detectada, descomprimiendo...');
            const decompressionResult = this.compressionService.detectAndDecompress<Articulo[]>(response.data);

            articulos = decompressionResult.data;
            console.log(`✅ Datos descomprimidos: ${decompressionResult.algorithm} - ${decompressionResult.compressionRatio}% de compresión`);
          } else {
            // Respuesta sin comprimir
            articulos = response.data || [];
            console.log(`📋 Datos sin comprimir: ${articulos.length} artículos`);
          }

          console.log(`✅ Consulta exitosa: ${articulos.length} artículos encontrados`);
          return articulos;
        }
        console.warn(`⚠️ Respuesta sin datos: ${response.mensaje}`);
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Carga completa del catálogo de artículos usando action 'LGET'
   * Almacena los datos en cache para consultas futuras
   * Soporta compresión opcional con parámetro swcomp y descompresión automática
   */
  loadAllArticulos(params?: { swcomp?: 0 | 1 }): Observable<Articulo[]> {
    // Inyección obligatoria de sesión para POST
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action: this.ARTICULOS_LOAD_ACTION,
      swcomp: params?.swcomp || 0, // Por defecto sin compresión
      ...sessionData // usr, id_session
    };

    console.log(`📦 Cargando catálogo completo de artículos con action: ${this.ARTICULOS_LOAD_ACTION}`, body);

    const url = this.getArticulosUrl();
    console.log(`🌐 URL de artículos usada para carga completa: ${url}`);

    return this.http.post(url, body, this.httpOptions).pipe(
      tap(response => {
        // Llamar al callback si está configurado (para debugging de compresión)
        if (this.onRespuestaCruda) {
          this.onRespuestaCruda(response);
        }
      }),
      map((response: any) => {
        if (response.statuscode === 200) {
          let articulos: Articulo[] = [];

          // Verificar si la respuesta está comprimida (swcomp=1)
          if (response.swcomp === 1) {
            console.log('🗜️ Respuesta comprimida detectada, descomprimiendo...');
            const decompressionResult = this.compressionService.detectAndDecompress<Articulo[]>(response.data);

            articulos = decompressionResult.data;
            console.log(`✅ Datos descomprimidos: ${decompressionResult.algorithm} - ${decompressionResult.compressionRatio}% de compresión`);
          } else {
            // Respuesta sin comprimir
            articulos = response.data || [];
            console.log(`📋 Datos sin comprimir: ${articulos.length} artículos`);
          }

          // Almacenar en cache
          this.articulosCache = [...articulos];
          this.isCacheLoaded = true;
          console.log(`💾 Catálogo completo almacenado en cache: ${this.articulosCache.length} artículos`);

          return articulos;
        }
        console.warn(`⚠️ Respuesta sin datos en carga completa: ${response.mensaje}`);
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Consulta usando action 'GET' (equivalente a obtener todos)
   */
  getAllArticulos(): Observable<Articulo[]> {
    return this.getArticulos({ action: 'GET' });
  }

  /**
   * POST - Consulta usando action 'SL' (select)
   * Ahora valida si hay datos en cache antes de hacer consulta HTTP
   */
  selectArticulos(filters?: ArticuloFilters): Observable<Articulo[]> {
    // Verificar si hay datos en cache
    if (this.isCacheLoaded && this.articulosCache.length > 0) {
      console.log(`📦 Consultando desde CACHE: ${this.articulosCache.length} artículos disponibles`);

      if (filters) {
        return this.applyFiltersToCache(filters);
      }

      return of([...this.articulosCache]);
    }

    // Si no hay cache, hacer consulta HTTP
    return this.getArticulos({ action: 'SL', filters });
  }

  /**
   * Aplicar filtros a los datos del cache
   */
  private applyFiltersToCache(filters: ArticuloFilters): Observable<Articulo[]> {
    console.log(`🔍 Aplicando filtros al cache:`, filters);

    let filteredArticulos = [...this.articulosCache];

    // Aplicar filtros uno por uno
    if (filters.articulo) {
      filteredArticulos = filteredArticulos.filter(art => art.articulo === filters.articulo);
    }

    if (filters.nombre) {
      const nombreFilter = filters.nombre.toLowerCase();
      filteredArticulos = filteredArticulos.filter(art =>
        art.nombre.toLowerCase().includes(nombreFilter)
      );
    }

    if (filters.marca) {
      const marcaFilter = filters.marca.toLowerCase();
      filteredArticulos = filteredArticulos.filter(art =>
        art.marca.toLowerCase().includes(marcaFilter)
      );
    }

    if (filters.idcat) {
      filteredArticulos = filteredArticulos.filter(art => art.idcat === filters.idcat);
    }

    if (filters.idscat) {
      filteredArticulos = filteredArticulos.filter(art => art.idscat === filters.idscat);
    }

    if (filters.idseg) {
      filteredArticulos = filteredArticulos.filter(art => art.idseg === filters.idseg);
    }

    if (filters.estado_articulo) {
      filteredArticulos = filteredArticulos.filter(art => art.estado_articulo === filters.estado_articulo);
    }

    console.log(`✅ Filtros aplicados: ${filteredArticulos.length} artículos encontrados`);
    return of(filteredArticulos);
  }

  /**
   * POST - Consulta artículos por ID específico
   */
  getArticuloById(id: number): Observable<Articulo | null> {
    return this.selectArticulos({ articulo: id }).pipe(
      map(articulos => articulos.length > 0 ? articulos[0] : null)
    );
  }

  /**
   * POST - Buscar artículos por nombre o marca
   */
  searchArticulos(query: string): Observable<Articulo[]> {
    if (!query || query.trim().length === 0) {
      return this.getArticulos();
    }

    return this.selectArticulos({
      nombre: query,
      marca: query
    }).pipe(
      map(articulos =>
        articulos.filter(articulo =>
          articulo.nombre.toLowerCase().includes(query.toLowerCase()) ||
          articulo.marca.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  /**
   * POST - Obtener artículos por categoría
   */
  getArticulosByCategoria(idcat: number): Observable<Articulo[]> {
    return this.selectArticulos({ idcat });
  }

  /**
   * POST - Obtener artículos por subcategoría
   */
  getArticulosBySubcategoria(idscat: number): Observable<Articulo[]> {
    return this.selectArticulos({ idscat });
  }

  /**
   * POST - Obtener artículos por segmento
   */
  getArticulosBySegmento(idseg: number): Observable<Articulo[]> {
    return this.selectArticulos({ idseg });
  }

  /**
   * POST - Obtener artículos por marca
   */
  getArticulosByMarca(marca: string): Observable<Articulo[]> {
    return this.selectArticulos({ marca });
  }

  /**
   * POST - Obtener artículos por estado
   */
  getArticulosByEstado(estado: string): Observable<Articulo[]> {
    return this.selectArticulos({ estado_articulo: estado });
  }

  /**
   * POST - Obtener artículos activos (estado_articulo = 'A')
   */
  getArticulosActivos(): Observable<Articulo[]> {
    return this.getArticulosByEstado('A');
  }

  /**
   * POST - Obtener artículos con paginación
   */
  getArticulosPaginados(pagination: ArticuloPagination, filters?: ArticuloFilters): Observable<{ articulos: Articulo[], total: number }> {
    return this.selectArticulos(filters).pipe(
      map(articulos => {
        const { page, limit, sortBy, sortOrder } = pagination;

        // Aplicar ordenamiento
        let sortedArticulos = [...articulos];
        if (sortBy) {
          sortedArticulos.sort((a, b) => {
            const aValue = a[sortBy as keyof Articulo];
            const bValue = b[sortBy as keyof Articulo];

            // Manejar valores null/undefined
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortOrder === 'desc' ? 1 : -1;
            if (bValue == null) return sortOrder === 'desc' ? -1 : 1;

            if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
            if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
            return 0;
          });
        }

        // Aplicar paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedArticulos = sortedArticulos.slice(startIndex, endIndex);

        return {
          articulos: paginatedArticulos,
          total: articulos.length
        };
      })
    );
  }

  /**
   * POST - Método genérico para ejecutar cualquier action
   */
  executeAction(action: ArticuloAction, params?: Partial<ArticuloActionParams>): Observable<Articulo[]> {
    return this.getArticulos({ action, ...params });
  }

  /**
   * Inicializar el servicio asegurando que los endpoints estén cargados
   * Debe llamarse antes de usar cualquier método del servicio
   */
  initialize(): Observable<void> {
    return new Observable(observer => {
      if (this.apiConfigService.hasEndpoints()) {
        console.log('✅ Endpoints ya están cargados');
        observer.next();
        observer.complete();
      } else {
        console.log('⏳ Esperando carga de endpoints...');
        this.apiConfigService.getEndpointsLoaded$().subscribe(loaded => {
          if (loaded) {
            console.log('✅ Endpoints cargados correctamente');
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
            console.error('❌ Error cargando configuración de endpoints:', error);
            observer.error(error);
          }
        });
      }
    });
  }

  /**
   * ========== GESTIÓN DE CACHE ==========
   */

  /**
   * Verificar si el cache está cargado
   */
  isCacheLoadedStatus(): boolean {
    return this.isCacheLoaded;
  }

  /**
   * Obtener el estado actual del cache
   */
  getCacheStatus(): { isLoaded: boolean; count: number } {
    return {
      isLoaded: this.isCacheLoaded,
      count: this.articulosCache.length
    };
  }

  /**
   * Limpiar el cache de artículos
   */
  clearCache(): void {
    this.articulosCache = [];
    this.isCacheLoaded = false;
    console.log('🗑️ Cache de artículos limpiado');
  }

  /**
   * Obtener artículos desde cache (solo si está cargado)
   */
  getArticulosFromCache(): Articulo[] {
    if (this.isCacheLoaded) {
      console.log(`📦 Retornando ${this.articulosCache.length} artículos desde cache`);
      return [...this.articulosCache];
    }
    console.warn('⚠️ Cache no está cargado, retornando array vacío');
    return [];
  }

  /**
   * Forzar recarga del cache
   * Soporta compresión opcional con parámetro swcomp
   */
  reloadCache(params?: { swcomp?: 0 | 1 }): Observable<Articulo[]> {
    console.log('🔄 Recargando cache de artículos...');
    this.clearCache();
    return this.loadAllArticulos(params);
  }

  /**
   * ========== UTILIDADES ==========
   */

  /**
   * Probar conectividad con la API de artículos
   * Incluye inyección obligatoria de sesión (usr, id_session)
   */
  testConnection(): Observable<boolean> {
    const url = this.getArticulosUrl();
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action: 'SL',
      ...sessionData // usr, id_session
    };

    return this.http.post<ApiResponse<Articulo[]>>(url, body, this.httpOptions).pipe(
      map(response => {
        console.log('✅ Conexión exitosa con la API de artículos');
        return true;
      }),
      catchError(error => {
        console.error('❌ Error de conexión con la API de artículos:', error);
        return of(false);
      })
    );
  }

  /**
   * Manejo de errores centralizado con MessageService
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de artículos';

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

    console.error('❌ Error en ArticulosService:', error);

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
