import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ApiConfigService } from './api/api-config.service';

/**
 * Servicio para la gestión de controladores de API
 * Endpoint: /apic/config
 * Maneja carga y recarga de controladores del sistema
 */
@Injectable({
  providedIn: 'root'
})
export class ControllersService {
  private readonly ENDPOINT_CONFIG = '/apic/config';
  private readonly ENDPOINT_RELOAD = '/apic/config/reload';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    console.log('🔧 ControllersService inicializado');
  }

  /**
   * Obtiene la URL base para operaciones de controladores
   */
  getBaseUrl(): string {
    return this.apiConfig.getBaseUrl();
  }

  /**
   * Obtiene la URL completa para consultar controladores
   */
  getConfigUrl(): string {
    return this.getBaseUrl() + this.ENDPOINT_CONFIG;
  }

  /**
   * Obtiene la URL completa para recargar controladores
   */
  getReloadUrl(): string {
    return this.getBaseUrl() + this.ENDPOINT_RELOAD;
  }

  /**
   * Carga controladores desde la API
   */
  loadControllers(): Observable<any> {
    const url = this.getConfigUrl();
    console.log(`🔍 Cargando controladores desde: ${url}`);

    return this.http.get(url, this.httpOptions).pipe(
      tap(response => {
        console.log('✅ Controladores cargados:', response);
      }),
      catchError(error => {
        console.error('❌ Error cargando controladores:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Recarga controladores del sistema
   */
  reloadControllers(): Observable<any> {
    const url = this.getReloadUrl();
    console.log(`🔄 Recargando controladores desde: ${url}`);

    return this.http.post(url, {}, this.httpOptions).pipe(
      tap(response => {
        console.log('✅ Controladores recargados:', response);
      }),
      catchError(error => {
        console.error('❌ Error recargando controladores:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Método de debug para mostrar URLs del servicio
   */
  debugUrls(): void {
    console.log('🔧 ControllersService - URLs disponibles:');
    console.log(`  CONFIG: ${this.getConfigUrl()}`);
    console.log(`  RELOAD: ${this.getReloadUrl()}`);
    console.log(`  BASE: ${this.getBaseUrl()}`);
  }

  /**
   * Verifica conectividad con el servicio de controladores
   */
  testConnection(): Observable<boolean> {
    const url = this.getConfigUrl();
    console.log(`🔍 Probando conexión con controladores: ${url}`);

    return this.http.get(url, this.httpOptions).pipe(
      map(() => {
        console.log('✅ Conexión exitosa con servicio de controladores');
        return true;
      }),
      catchError(error => {
        console.error('❌ Error de conexión con servicio de controladores:', error);
        return of(false);
      })
    );
  }
}
