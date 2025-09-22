import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ApiConfigService } from '../../../core/services/api/api-config.service';

import {
  RolDetalle,
  RolDetalleApiResponse,
  RolDetalleForm,
  RolDetalleAction,
  RolDetalleFilters,
  RolDetallePagination,
  RolDetalleQuery,
  AsignacionMenuRol
} from '../models/rol-detalle.interface';

import { ROL_DETALLE_API_CONFIG, ROL_DETALLE_MESSAGES } from '../models/rol-detalle.constants';

/**
 * Servicio para la gestión de detalle de roles
 * Endpoint dinámico: ID 3 (Rol Detalle)
 *
 * IMPORTANTE: Las consultas se realizan principalmente con POST
 * GET solo funciona para consultas de items específicos
 */
@Injectable({
  providedIn: 'root'
})
export class RolDetalleService {
  private readonly API_ID: number = 5; // ID del endpoint de Rol Detalle
  private readonly endpoints = {
    ROL_DETALLE: ROL_DETALLE_API_CONFIG.ENDPOINTS.ROL_DETALLE // Mantener por compatibilidad
  };

  private readonly httpOptions = {
    headers: new HttpHeaders(ROL_DETALLE_API_CONFIG.DEFAULT_HEADERS)
  };

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  /**
   * Obtiene la URL del endpoint por ID
   */
  private getApiUrl(): string {
    const endpoint = this.apiConfig.getEndpointById(this.API_ID);
    if (!endpoint) {
      console.warn(`⚠️ Endpoint con ID ${this.API_ID} no encontrado. Usando URL por defecto.`);
      return this.apiConfig.getBaseUrl() + this.endpoints.ROL_DETALLE;
    }
    return endpoint.url;
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    console.log(`🔧 RolDetalleService usa ApiConfigService - URL configurada: ${url}`);
    // Este método se mantiene por compatibilidad pero ahora usa ApiConfigService
  }

  /**
   * Obtiene la URL base actual desde ApiConfigService
   */
  getBaseUrl(): string {
    return this.apiConfig.getBaseUrl();
  }

  /**
   * POST - Consulta principal de detalle de roles
   * Se usa para consultas por id_rol o id_rold
   */
  consultarDetalleRol(query: RolDetalleQuery): Observable<RolDetalle[]> {
    const url = `${this.getApiUrl()}/1`; // ID fijo en URL

    console.log(`🔍 Consultando detalles de rol:`, query);

    return this.http.post<RolDetalleApiResponse>(url, query, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          console.log(`✅ Consulta de detalle de roles exitosa: ${response.mensaje}`);
          return response.data;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Consultar todos los detalles de un rol específico
   */
  getDetallesPorRol(idRol: number): Observable<RolDetalle[]> {
    const query: RolDetalleQuery = { id_rol: idRol };
    return this.consultarDetalleRol(query);
  }

  /**
   * POST - Consultar un detalle específico por ID
   */
  getDetallePorId(idRold: number): Observable<RolDetalle | null> {
    const query: RolDetalleQuery = { id_rold: idRold };
    return this.consultarDetalleRol(query).pipe(
      map(detalles => detalles.length > 0 ? detalles[0] : null)
    );
  }

  /**
   * GET - Solo para consultas de items específicos (no para consultas generales)
   */
  getDetalleRolById(id: number): Observable<RolDetalle | null> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.get<RolDetalleApiResponse>(url, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data && response.data.length > 0) {
          return response.data[0];
        }
        return null;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Crear nuevo detalle de rol
   */
  createDetalleRol(detalle: RolDetalleForm): Observable<RolDetalleApiResponse> {
    const url = `${this.getApiUrl()}/1`;

    return this.http.post<RolDetalleApiResponse>(url, detalle, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Detalle de rol creado exitosamente para rol ${detalle.id_rol}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Actualizar atributos específicos del detalle de rol
   */
  updateDetalleRol(id: number, detalle: Partial<RolDetalleForm>): Observable<RolDetalleApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.patch<RolDetalleApiResponse>(url, detalle, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Detalle de rol actualizado exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Actualización completa del detalle de rol
   */
  updateDetalleRolCompleto(id: number, detalle: RolDetalleForm): Observable<RolDetalleApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.put<RolDetalleApiResponse>(url, detalle, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Detalle de rol actualizado completamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Eliminar detalle de rol
   */
  deleteDetalleRol(id: number): Observable<RolDetalleApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.delete<RolDetalleApiResponse>(url, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`🗑️ Detalle de rol eliminado exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST UTILITARIO - Método universal con atributo "action"
   * SL -> consulta
   * UP -> actualizar el id definido
   * IN -> insert (si no se manda será insert o se puede poner explícito)
   * DL -> eliminar el registro señalado por el id
   */
  executeAction(action: RolDetalleAction, data?: any): Observable<RolDetalleApiResponse> {
    const url = `${this.getApiUrl()}/1`;
    const body = { action, ...data };

    console.log(`🔧 Ejecutando acción de detalle de rol: ${action}`, body);

    return this.http.post<RolDetalleApiResponse>(url, body, this.httpOptions).pipe(
      map((response: any) => {
        // ⚠️ CRÍTICO: Verificar errores del backend
        if (Array.isArray(response) && response.length > 0) {
          const firstItem = response[0];
          if (firstItem.statuscode && firstItem.statuscode !== 200) {
            console.log('❌ Backend devolvió error en array:', firstItem);
            throw new Error(firstItem.mensaje || 'Error del servidor');
          }
          return {
            statuscode: firstItem.statuscode || 200,
            mensaje: firstItem.mensaje || 'OK',
            data: firstItem.data || []
          };
        }

        // Verificar error en respuesta directa
        if (response.statuscode && response.statuscode !== 200) {
          console.log('❌ Backend devolvió error directo:', response);
          throw new Error(response.mensaje || 'Error del servidor');
        }

        return {
          statuscode: response.statuscode || 200,
          mensaje: response.mensaje || 'Operación exitosa',
          data: response.data
        };
      }),
      catchError(error => {
        console.error('❌ Error en executeAction:', error);

        // ⚠️ CRÍTICO: Preservar mensaje original del backend si ya existe
        const errorMessage = error instanceof Error ? error.message : 'Error en operación de detalle de rol';
        console.log('📤 Enviando error al componente:', errorMessage);

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Métodos de utilidad usando executeAction
   */
  
  /**
   * SL - Consulta de detalles usando executeAction
   */
  selectDetallesRol(filters?: RolDetalleFilters): Observable<RolDetalle[]> {
    return this.executeAction('SL', { filters }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * IN - Insertar detalle usando executeAction
   */
  insertDetalleRol(detalle: RolDetalleForm): Observable<RolDetalleApiResponse> {
    return this.executeAction('IN', detalle);
  }

  /**
   * UP - Actualizar detalle usando executeAction
   */
  updateDetalleRolAction(id: number, detalle: Partial<RolDetalleForm>): Observable<RolDetalleApiResponse> {
    return this.executeAction('UP', { id_rol: id, ...detalle });
  }

  /**
   * DL - Eliminar detalle usando executeAction
   */
  deleteDetalleRolAction(id: number): Observable<RolDetalleApiResponse> {
    return this.executeAction('DL', { id_rold: id });
  }

  /**
   * Métodos de búsqueda y filtrado
   */

  /**
   * Buscar detalles por nombre de rol o menú
   */
  searchDetallesRol(query: string): Observable<RolDetalle[]> {
    if (!query || query.trim().length === 0) {
      return this.consultarDetalleRol({});
    }

    return this.consultarDetalleRol({}).pipe(
      map(detalles => 
        detalles.filter(detalle => 
          detalle.nombre_rol?.toLowerCase().includes(query.toLowerCase()) ||
          detalle.nombre_menu?.toLowerCase().includes(query.toLowerCase()) ||
          detalle.id_rol.toString().includes(query) ||
          detalle.id_menu.toString().includes(query)
        )
      )
    );
  }

  /**
   * Obtener detalles por rol específico
   */
  getDetallesPorRolId(idRol: number): Observable<RolDetalle[]> {
    return this.getDetallesPorRol(idRol);
  }

  /**
   * Obtener detalles por menú específico
   */
  getDetallesPorMenu(idMenu: number): Observable<RolDetalle[]> {
    return this.consultarDetalleRol({}).pipe(
      map(detalles => detalles.filter(detalle => detalle.id_menu === idMenu))
    );
  }

  /**
   * Obtener detalles con paginación
   */
  getDetallesPaginados(pagination: RolDetallePagination): Observable<{ detalles: RolDetalle[], total: number }> {
    return this.consultarDetalleRol({}).pipe(
      map(detalles => {
        const { page, limit, sortBy, sortOrder } = pagination;
        
                // Aplicar ordenamiento
        let sortedDetalles = [...detalles];
        if (sortBy) {
            sortedDetalles.sort((a, b) => {
                const aValue = a[sortBy as keyof RolDetalle];
                const bValue = b[sortBy as keyof RolDetalle];
                
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
        const paginatedDetalles = sortedDetalles.slice(startIndex, endIndex);
        
        return {
          detalles: paginatedDetalles,
          total: detalles.length
        };
      })
    );
  }

  /**
   * Obtener detalles ordenados por orden (ren)
   */
  getDetallesOrdenadosPorRen(ascendente: boolean = true): Observable<RolDetalle[]> {
    return this.consultarDetalleRol({}).pipe(
      map(detalles => {
        return detalles.sort((a, b) => {
          if (ascendente) {
            return a.ren - b.ren;
          } else {
            return b.ren - a.ren;
          }
        });
      })
    );
  }

  /**
   * Verificar si existe un menú asignado a un rol
   */
  checkMenuRolExists(idRol: number, idMenu: number, excludeId?: number): Observable<boolean> {
    return this.getDetallesPorRol(idRol).pipe(
      map(detalles => {
        return detalles.some(detalle => 
          detalle.id_menu === idMenu && 
          detalle.id_rold !== excludeId
        );
      })
    );
  }

  /**
   * Obtener el siguiente número de orden disponible para un rol
   */
  getNextOrdenDisponible(idRol: number): Observable<number> {
    return this.getDetallesPorRol(idRol).pipe(
      map(detalles => {
        if (detalles.length === 0) return 1;
        
        const maxOrden = Math.max(...detalles.map(d => d.ren));
        return maxOrden + 1;
      })
    );
  }

  /**
   * Asignar múltiples menús a un rol
   */
  asignarMenusARol(idRol: number, menus: number[]): Observable<RolDetalleApiResponse[]> {
    const asignaciones: Observable<RolDetalleApiResponse>[] = [];
    
    menus.forEach((idMenu, index) => {
      const detalle: RolDetalleForm = {
        id_rol: idRol,
        id_menu: idMenu,
        ren: index + 1
      };
      asignaciones.push(this.createDetalleRol(detalle));
    });
    
    // Retornar array de observables para manejo individual
    return asignaciones as any;
  }

  /**
   * Remover todos los menús de un rol
   */
  removerTodosLosMenusDelRol(idRol: number): Observable<RolDetalleApiResponse[]> {
    return this.getDetallesPorRol(idRol).pipe(
      map(detalles => {
        return detalles.map(detalle => 
          this.deleteDetalleRol(detalle.id_rold)
        ) as any;
      })
    );
  }

  /**
   * Probar conectividad con la API
   */
  testConnection(): Observable<boolean> {
    return this.http.post<RolDetalleApiResponse>(
      `${this.getApiUrl()}/1`,
      {},
      this.httpOptions
    ).pipe(
      map(response => {
        console.log('✅ Conexión exitosa con la API de detalle de roles');
        return true;
      }),
      catchError(error => {
        console.error('❌ Error de conexión con la API de detalle de roles:', error);
        return of(false);
      })
    );
  }

  /**
   * Obtener estadísticas de detalle de roles
   */
  getEstadisticasDetalleRoles(): Observable<{
    total: number;
    rolesConMenus: number;
    menusAsignados: number;
    promedioMenusPorRol: number;
  }> {
    return this.consultarDetalleRol({}).pipe(
      map(detalles => {
        const total = detalles.length;
        const rolesUnicos = new Set(detalles.map(d => d.id_rol)).size;
        const menusUnicos = new Set(detalles.map(d => d.id_menu)).size;
        const promedio = rolesUnicos > 0 ? total / rolesUnicos : 0;

        return {
          total,
          rolesConMenus: rolesUnicos,
          menusAsignados: menusUnicos,
          promedioMenusPorRol: Math.round(promedio * 100) / 100
        };
      })
    );
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de detalle de roles';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status) {
      // Error del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
    } else if (error.message) {
      // Error personalizado
      errorMessage = error.message;
    }
    
    console.error('❌ Error en RolDetalleService:', error);
    
    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}
