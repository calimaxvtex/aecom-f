import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ApiConfigService } from '../../../core/services/api/api-config.service';

import {
  Rol,
  RolApiResponse,
  RolForm,
  RolAction,
  RolActionParams,
  RolFilters,
  RolPagination
} from '../models/rol.interface';

import { ROL_API_CONFIG } from '../models/rol.constants';

/**
 * Servicio para la gestión de roles
 * Endpoint dinámico: ID 2 (Roles)
 */
@Injectable({
  providedIn: 'root'
})
export class RolService {
  private readonly API_ID: number = 2; // ID del endpoint de Roles
  private readonly endpoints = {
    ROLES: ROL_API_CONFIG.ENDPOINTS.ROLES // Mantener por compatibilidad
  };

  private readonly httpOptions = {
    headers: new HttpHeaders(ROL_API_CONFIG.DEFAULT_HEADERS)
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
      return this.apiConfig.getBaseUrl() + this.endpoints.ROLES;
    }
    return endpoint.url;
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    console.log(`🔧 RolService usa ApiConfigService - URL configurada: ${url}`);
    // Este método se mantiene por compatibilidad pero ahora usa ApiConfigService
  }

  /**
   * Obtiene la URL base actual desde ApiConfigService
   */
  getBaseUrl(): string {
    return this.apiConfig.getBaseUrl();
  }

  /**
   * GET - Consulta de roles
   * Si no se especifica id, regresa todos los roles
   */
  getRoles(id?: number): Observable<Rol[]> {
    let url = this.getApiUrl();

    if (id) {
      url += `/${id}`;
    }

    return this.http.get<RolApiResponse>(url, this.httpOptions).pipe(
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
   * GET - Obtiene un rol específico por ID
   */
  getRolById(id: number): Observable<Rol | null> {
    return this.getRoles(id).pipe(
      map(roles => roles.length > 0 ? roles[0] : null)
    );
  }

  /**
   * POST - Crear nuevo rol
   * Si se manda el id lo toma como update
   */
  createRol(rol: RolForm): Observable<RolApiResponse> {
    const url = this.getApiUrl();

    return this.http.post<RolApiResponse>(url, rol, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Rol creado exitosamente: ${rol.nombre}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Actualizar atributos específicos del rol
   */
  updateRol(id: number, rol: Partial<RolForm>): Observable<RolApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.patch<RolApiResponse>(url, rol, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Rol actualizado exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Actualización completa del rol
   */
  updateRolCompleto(id: number, rol: RolForm): Observable<RolApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.put<RolApiResponse>(url, rol, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Rol actualizado completamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Eliminar rol
   */
  deleteRol(id: number): Observable<RolApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.delete<RolApiResponse>(url, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`🗑️ Rol eliminado exitosamente: ID ${id}`);
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
  executeAction(action: RolAction, data?: any): Observable<RolApiResponse> {
    const url = this.getApiUrl();
    const body = { action, ...data };

    console.log(`🔧 Ejecutando acción de rol: ${action}`, body);

    return this.http.post<RolApiResponse>(url, body, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Acción de rol ${action} ejecutada exitosamente`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Métodos de utilidad usando executeAction
   */
  
  /**
   * SL - Consulta de roles usando executeAction
   */
  selectRoles(filters?: RolFilters): Observable<Rol[]> {
    return this.executeAction('SL', { filters }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * IN - Insertar rol usando executeAction
   */
  insertRol(rol: RolForm): Observable<RolApiResponse> {
    return this.executeAction('IN', { data: rol });
  }

  /**
   * UP - Actualizar rol usando executeAction
   */
  updateRolAction(id: number, rol: Partial<RolForm>): Observable<RolApiResponse> {
    return this.executeAction('UP', { id, data: rol });
  }

  /**
   * DL - Eliminar rol usando executeAction
   */
  deleteRolAction(id: number): Observable<RolApiResponse> {
    return this.executeAction('DL', { id });
  }

  /**
   * Métodos de búsqueda y filtrado
   */

  /**
   * Buscar roles por nombre
   */
  searchRoles(query: string): Observable<Rol[]> {
    if (!query || query.trim().length === 0) {
      return this.getRoles();
    }

    return this.getRoles().pipe(
      map(roles => 
        roles.filter(rol => 
          rol.nombre.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  /**
   * Obtener roles por estado
   */
  getRolesPorEstado(estado: string): Observable<Rol[]> {
    return this.getRoles().pipe(
      map(roles => roles.filter(rol => rol.estado === estado))
    );
  }

  /**
   * Obtener roles activos (estado = 'A')
   */
  getRolesActivos(): Observable<Rol[]> {
    return this.getRolesPorEstado('A');
  }

  /**
   * Obtener roles inactivos (estado = 'I')
   */
  getRolesInactivos(): Observable<Rol[]> {
    return this.getRolesPorEstado('I');
  }

  /**
   * Obtener roles suspendidos (estado = 'S')
   */
  getRolesSuspendidos(): Observable<Rol[]> {
    return this.getRolesPorEstado('S');
  }

  /**
   * Obtener roles bloqueados (estado = 'B')
   */
  getRolesBloqueados(): Observable<Rol[]> {
    return this.getRolesPorEstado('B');
  }

  /**
   * Obtener roles con paginación
   */
  getRolesPaginados(pagination: RolPagination): Observable<{ roles: Rol[], total: number }> {
    return this.getRoles().pipe(
      map(roles => {
        const { page, limit, sortBy, sortOrder } = pagination;
        
        // Aplicar ordenamiento
        let sortedRoles = [...roles];
        if (sortBy) {
          sortedRoles.sort((a, b) => {
            const aValue = a[sortBy as keyof Rol];
            const bValue = b[sortBy as keyof Rol];
            
            if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
            if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
            return 0;
          });
        }
        
        // Aplicar paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRoles = sortedRoles.slice(startIndex, endIndex);
        
        return {
          roles: paginatedRoles,
          total: roles.length
        };
      })
    );
  }

  /**
   * Obtener roles ordenados por nombre
   */
  getRolesOrdenadosPorNombre(ascendente: boolean = true): Observable<Rol[]> {
    return this.getRoles().pipe(
      map(roles => {
        return roles.sort((a, b) => {
          if (ascendente) {
            return a.nombre.localeCompare(b.nombre);
          } else {
            return b.nombre.localeCompare(a.nombre);
          }
        });
      })
    );
  }

  /**
   * Verificar si existe un rol con el mismo nombre
   */
  checkRolExists(nombre: string, excludeId?: number): Observable<boolean> {
    return this.getRoles().pipe(
      map(roles => {
        return roles.some(rol => 
          rol.nombre.toLowerCase() === nombre.toLowerCase() && 
          rol.id_rol !== excludeId
        );
      })
    );
  }

  /**
   * Obtener roles por rango de fechas de modificación
   */
  getRolesPorRangoFechas(fechaDesde: string, fechaHasta: string): Observable<Rol[]> {
    return this.getRoles().pipe(
      map(roles => {
        const desde = new Date(fechaDesde);
        const hasta = new Date(fechaHasta);
        
        return roles.filter(rol => {
          const fechaModificacion = new Date(rol.fecha_m);
          return fechaModificacion >= desde && fechaModificacion <= hasta;
        });
      })
    );
  }

  /**
   * Probar conectividad con la API
   */
  testConnection(): Observable<boolean> {
    return this.http.get<RolApiResponse>(this.getApiUrl(), this.httpOptions).pipe(
      map(response => {
        console.log('✅ Conexión exitosa con la API de roles');
        return true;
      }),
      catchError(error => {
        console.error('❌ Error de conexión con la API de roles:', error);
        return of(false);
      })
    );
  }

  /**
   * Obtener estadísticas de roles
   */
  getEstadisticasRoles(): Observable<{
    total: number;
    activos: number;
    inactivos: number;
    suspendidos: number;
    bloqueados: number;
  }> {
    return this.getRoles().pipe(
      map(roles => {
        const total = roles.length;
        const activos = roles.filter(rol => rol.estado === 'A').length;
        const inactivos = roles.filter(rol => rol.estado === 'I').length;
        const suspendidos = roles.filter(rol => rol.estado === 'S').length;
        const bloqueados = roles.filter(rol => rol.estado === 'B').length;

        return {
          total,
          activos,
          inactivos,
          suspendidos,
          bloqueados
        };
      })
    );
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de roles';
    
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
    
    console.error('❌ Error en RolService:', error);
    
    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}
