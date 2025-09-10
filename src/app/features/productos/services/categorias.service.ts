import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  Categoria,
  CategoriaAction,
  CategoriaActionParams,
  CategoriaFilters
} from '../models/categoria.interface';
import { ApiResponse } from '../models/common.interface';

import { ApiConfigService } from '@/core/services/api/api-config.service';
import { SessionService } from '@/core/services/session.service';
import { MessageService } from 'primeng/api';

/**
 * Servicio para consultas del catálogo de categorías
 * Endpoint obtenido dinámicamente por ID 12 usando ApiConfigService
 * Solo utiliza método POST con action: CAT
 * Modelo simplificado: {idcat, nombre}
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private readonly CATEGORIAS_ENDPOINT_ID = 12;
  private readonly CATEGORIAS_ACTION = 'CAT';
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

  /**
   * Obtiene la URL del endpoint de categorías usando ApiConfigService
   */
  private getCategoriasUrl(): string {
    const endpoint = this.apiConfigService.getEndpointById(this.CATEGORIAS_ENDPOINT_ID);

    if (endpoint && endpoint.url) {
      console.log(`🔗 URL de categorías obtenida: ${endpoint.url}`);
      return endpoint.url;
    } else {
      // Fallback a la URL hardcodeada si no se encuentra el endpoint
      const fallbackUrl = `${this.apiConfigService.getBaseUrl()}/api/categorias/v1/${this.CATEGORIAS_ENDPOINT_ID}`;
      console.warn(`⚠️ Endpoint de categorías no encontrado, usando fallback: ${fallbackUrl}`);
      return fallbackUrl;
    }
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    this.apiConfigService.setBaseUrl(url);
    console.log(`🔧 URL base de categorías configurada: ${url}`);
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
        console.log('✅ Endpoints ya están cargados');
        observer.next();
        observer.complete();
      } else {
        console.log('⏳ Esperando carga de endpoints para categorías...');
        this.apiConfigService.getEndpointsLoaded$().subscribe(loaded => {
          if (loaded) {
            console.log('✅ Endpoints cargados correctamente para categorías');
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
            console.error('❌ Error cargando configuración de endpoints para categorías:', error);
            observer.error(error);
          }
        });
      }
    });
  }

  /**
   * POST - Consulta general de categorías usando action CAT
   * Incluye inyección obligatoria de sesión (usr, id_session)
   */
  getCategorias(): Observable<Categoria[]> {
    // Inyección obligatoria de sesión para POST
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action: this.CATEGORIAS_ACTION,
      ...sessionData // usr, id_session
    };

    console.log(`🔍 Consultando categorías con action: ${this.CATEGORIAS_ACTION}`, body);

    const url = this.getCategoriasUrl();
    console.log(`🌐 URL de categorías usada: ${url}`);
    return this.http.post<ApiResponse<Categoria[]>>(url, body, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          console.log(`✅ Consulta exitosa: ${response.data.length} categorías encontradas`);
          return response.data;
        }
        console.warn(`⚠️ Respuesta sin datos: ${response.mensaje}`);
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Consulta categorías por ID específico
   */
  getCategoriaById(idcat: number): Observable<Categoria | null> {
    return this.getCategorias().pipe(
      map(categorias => categorias.find(cat => cat.idcat === idcat) || null)
    );
  }

  /**
   * POST - Buscar categorías por nombre
   */
  searchCategorias(query: string): Observable<Categoria[]> {
    if (!query || query.trim().length === 0) {
      return this.getCategorias();
    }

    return this.getCategorias().pipe(
      map(categorias =>
        categorias.filter(categoria =>
          categoria.nombre.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  /**
   * POST - Obtener categorías ordenadas alfabéticamente
   */
  getCategoriasOrdenadas(): Observable<Categoria[]> {
    return this.getCategorias().pipe(
      map(categorias => [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    );
  }

  /**
   * POST - Obtener categorías activas (si en el futuro hay campo de estado)
   */
  getCategoriasActivas(): Observable<Categoria[]> {
    // Por ahora devuelve todas las categorías, ya que el modelo actual no tiene campo de estado
    return this.getCategorias();
  }

  /**
   * POST - Método genérico para ejecutar cualquier action (flexibilidad futura)
   */
  executeAction(action: CategoriaAction, params?: Partial<CategoriaActionParams>): Observable<Categoria[]> {
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action,
      ...params,
      ...sessionData
    };

    console.log(`🔧 Ejecutando action de categorías: ${action}`, body);

    const url = this.getCategoriasUrl();
    return this.http.post<ApiResponse<Categoria[]>>(url, body, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Probar conectividad con la API de categorías
   * Incluye inyección obligatoria de sesión (usr, id_session)
   */
  testConnection(): Observable<boolean> {
    const url = this.getCategoriasUrl();
    const sessionData = this.sessionService.getApiPayloadBase();

    const body = {
      action: this.CATEGORIAS_ACTION,
      ...sessionData // usr, id_session
    };

    return this.http.post<ApiResponse<Categoria[]>>(url, body, this.httpOptions).pipe(
      map(response => {
        console.log('✅ Conexión exitosa con la API de categorías');
        return true;
      }),
      catchError(error => {
        console.error('❌ Error de conexión con la API de categorías:', error);
        return of(false);
      })
    );
  }

  /**
   * Manejo de errores centralizado con MessageService
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de categorías';

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

    console.error('❌ Error en CategoriasService:', error);

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
