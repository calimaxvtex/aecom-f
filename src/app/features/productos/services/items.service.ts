import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  ItemsResponse,
  ItemsList,
  Item
} from '../models/items.interface';
import { ApiResponse } from '../models/common.interface';

import { ApiConfigService } from '@/core/services/api/api-config.service';
import { SessionService } from '@/core/services/session.service';

/**
 * Servicio para consultas del catálogo de items/productos
 * Endpoint obtenido dinámicamente por ID 12 usando ApiConfigService
 * Solo utiliza método POST con action: SL
 *
 * REGLAS DE VALIDACIÓN:
 * - El body NO se puede mandar solo con SL, debe tener al menos uno de:
 *   - nombre
 *   - idcat
 *   - idscat (requiere que también esté definido idcat)
 *   - marca
 */
@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private readonly ITEMS_ENDPOINT_ID = 12;
  private readonly DEFAULT_ACTION = 'SL';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Inyección moderna usando inject()
  private http = inject(HttpClient);
  private apiConfigService = inject(ApiConfigService);
  private sessionService = inject(SessionService);

  /**
   * Obtiene la URL del endpoint de items usando ApiConfigService
   */
  private getItemsUrl(): string {
    const endpoint = this.apiConfigService.getEndpointById(this.ITEMS_ENDPOINT_ID);

    if (endpoint && endpoint.url) {
      console.log(`🔗 URL de items obtenida: ${endpoint.url}`);
      return endpoint.url;
    } else {
      // Fallback a la URL hardcodeada si no se encuentra el endpoint
      const fallbackUrl = `${this.apiConfigService.getBaseUrl()}/api/items/v1/${this.ITEMS_ENDPOINT_ID}`;
      console.warn(`⚠️ Endpoint no encontrado, usando fallback: ${fallbackUrl}`);
      return fallbackUrl;
    }
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    this.apiConfigService.setBaseUrl(url);
    console.log(`🔧 URL base de items configurada: ${url}`);
  }

  /**
   * Obtiene la URL base actual
   */
  getBaseUrl(): string {
    return this.apiConfigService.getBaseUrl();
  }

  /**
   * Valida que los parámetros cumplan con las reglas de negocio
 * REGLAS:
 * - Debe tener al menos uno de: nombre, marca, idcat, articulo, items
 * - Si tiene idscat, también debe tener idcat
   */
  private validateParams(params: {
    nombre?: string;
    marca?: string;
    idcat?: number;
    idscat?: number;
    idseg?: number;
    estado_articulo?: string;
    articulo?: number;
    items?: any[];
  }): void {
    const { nombre, marca, idcat, idscat, articulo, items } = params;

    // Verificar que al menos uno de los parámetros requeridos esté presente
    const hasRequiredParam = nombre || marca || idcat || articulo || (items && items.length > 0);

    if (!hasRequiredParam) {
      throw new Error('Debe especificar al menos uno de los siguientes parámetros: nombre, marca, idcat, articulo, o items');
    }

    // Si se especifica idscat, idcat también debe estar definido
    if (idscat !== undefined && idcat === undefined) {
      throw new Error('Cuando se especifica idscat, también debe definirse idcat');
    }
  }

  /**
   * POST - Consulta de items con action: SL
   * Recibe todos los parámetros posibles y permite combinarlos
   * Incluye validación de parámetros requeridos según reglas de negocio
   * Incluye inyección obligatoria de sesión (usr, id_session)
   *
 * Parámetros permitidos:
 * - nombre: string (opcional)
 * - marca: string (opcional)
 * - idcat: number (opcional)
 * - idscat: number (opcional, requiere idcat)
 * - idseg: number (opcional)
 * - estado_articulo: string (opcional)
 * - articulo: number (opcional, para búsqueda por ID específico)
 * - limit: number (opcional, para paginación)
 * - offset: number (opcional, para paginación)
 * - items: any[] (opcional, array de items seleccionados)
 *
 * REGLAS DE VALIDACIÓN:
 * - Debe tener al menos uno de: nombre, marca, idcat, articulo, items
 * - Si tiene idscat, también debe tener idcat
   */
  getItems(params: {
    nombre?: string;
    marca?: string;
    idcat?: number;
    idscat?: number;
    idseg?: number;
    estado_articulo?: string;
    articulo?: number;
    limit?: number;
    offset?: number;
    items?: any[]; // Nuevo parámetro para items seleccionados
  } = {}): Observable<ItemsResponse> {

    // Validar parámetros según reglas de negocio
    this.validateParams(params);

    // Preparar el payload de la consulta
    const session = this.sessionService.getSession();
    const payload = {
      action: this.DEFAULT_ACTION,
      usr: session?.usuario,
      id_session: session?.id_session,
      ...params
    };

    console.log('🔍 Consultando items con payload:', payload);

    const url = this.getItemsUrl();

    return this.http.post<ItemsResponse>(url, payload, this.httpOptions).pipe(
      tap(response => {
        console.log('✅ Respuesta de items obtenida:', response);
      }),
      catchError(error => {
        console.error('❌ Error al consultar items:', error);
        // Nota: El manejo de mensajes de error ahora se hace en el componente
        return throwError(() => error);
      })
    );
  }

  /**
   * Método de debug para verificar configuración
   */
  debugService(): void {
    console.log('🔧 ItemsService - Estado del servicio:');
    console.log('📍 Endpoint ID:', this.ITEMS_ENDPOINT_ID);
    console.log('🔗 URL actual:', this.getItemsUrl());
    console.log('👤 Usuario actual:', this.sessionService.getSession()?.usuario);
    console.log('🔑 ID de sesión:', this.sessionService.getSession()?.id_session);
    console.log('📋 Action por defecto:', this.DEFAULT_ACTION);
  }
}
