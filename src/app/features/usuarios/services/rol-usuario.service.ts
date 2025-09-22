import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ApiConfigService } from '../../../core/services/api/api-config.service';

import {
  RolUsuario,
  RolUsuarioApiResponse,
  RolUsuarioForm,
  RolUsuarioAction,
  RolUsuarioActionParams,
  RolUsuarioFilters,
  RolUsuarioPagination,
  RolUsuarioQuery,
  AsignacionRolUsuario,
  PermisosUsuario,
  UsuariosPorRol
} from '../models/rol-usuario.interface';

import { ROL_USUARIO_API_CONFIG, ROL_USUARIO_MESSAGES } from '../models/rol-usuario.constants';

/**
 * Servicio para la gestión de relaciones rol-usuario
 * Endpoint dinámico: ID 6 (Rol Usuario)
 */
@Injectable({
  providedIn: 'root'
})
export class RolUsuarioService {
  private readonly API_ID: number = 6; // ID del endpoint de Rol Usuario
  private readonly endpoints = {
    ROL_USUARIO: ROL_USUARIO_API_CONFIG.ENDPOINTS.ROL_USUARIO // Mantener por compatibilidad
  };

  private readonly httpOptions = {
    headers: new HttpHeaders(ROL_USUARIO_API_CONFIG.DEFAULT_HEADERS)
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
      return this.apiConfig.getBaseUrl() + this.endpoints.ROL_USUARIO;
    }
    return endpoint.url;
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    console.log(`🔧 RolUsuarioService usa ApiConfigService - URL configurada: ${url}`);
    // Este método se mantiene por compatibilidad pero ahora usa ApiConfigService
  }

  /**
   * Obtiene la URL base actual desde ApiConfigService
   */
  getBaseUrl(): string {
    return this.apiConfig.getBaseUrl();
  }

  /**
   * GET - Consulta de relaciones rol-usuario
   * Si no se especifica id, regresa todas las relaciones
   */
  getRelacionesRolUsuario(id?: number): Observable<RolUsuario[]> {
    let url = this.getApiUrl();

    if (id) {
      url += `/${id}`;
    }

    return this.http.get<RolUsuarioApiResponse>(url, this.httpOptions).pipe(
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
   * GET - Obtiene una relación específica por ID
   */
  getRelacionRolUsuarioById(id: number): Observable<RolUsuario | null> {
    return this.getRelacionesRolUsuario(id).pipe(
      map(relaciones => relaciones.length > 0 ? relaciones[0] : null)
    );
  }

  /**
   * POST - Crear nueva relación rol-usuario
   */
  createRelacionRolUsuario(relacion: RolUsuarioForm): Observable<RolUsuarioApiResponse> {
    const url = this.getApiUrl();

    return this.http.post<RolUsuarioApiResponse>(url, relacion, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Rol asignado exitosamente al usuario ${relacion.id_usu}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Actualizar atributos específicos de la relación
   */
  updateRelacionRolUsuario(id: number, relacion: Partial<RolUsuarioForm>): Observable<RolUsuarioApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.patch<RolUsuarioApiResponse>(url, relacion, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Relación rol-usuario actualizada exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Actualización completa de la relación
   */
  updateRelacionRolUsuarioCompleto(id: number, relacion: RolUsuarioForm): Observable<RolUsuarioApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.put<RolUsuarioApiResponse>(url, relacion, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Relación rol-usuario actualizada completamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Eliminar relación rol-usuario
   */
  deleteRelacionRolUsuario(id: number): Observable<RolUsuarioApiResponse> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.delete<RolUsuarioApiResponse>(url, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`🗑️ Relación rol-usuario eliminada exitosamente: ID ${id}`);
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
  executeAction(action: RolUsuarioAction, data?: any): Observable<RolUsuarioApiResponse> {
    const url = this.getApiUrl();
    const body = { action, ...data };

    console.log(`🔧 Ejecutando acción de relación rol-usuario: ${action}`, body);

    return this.http.post<RolUsuarioApiResponse>(url, body, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Acción de relación rol-usuario ${action} ejecutada exitosamente`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Métodos de utilidad usando executeAction
   */
  
  /**
   * SL - Consulta de relaciones usando executeAction
   */
  selectRelacionesRolUsuario(filters?: RolUsuarioFilters): Observable<RolUsuario[]> {
    return this.executeAction('SL', { filters }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * IN - Insertar relación usando executeAction
   */
  insertRelacionRolUsuario(relacion: RolUsuarioForm): Observable<RolUsuarioApiResponse> {
    const url = this.getApiUrl();

    return this.http.post<RolUsuarioApiResponse>(url, { action: 'IN', ...relacion }, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Relación rol-usuario insertada exitosamente`);
        } else {
          // Si el backend devuelve error, lanzar el error
          throw new Error(response.mensaje || `Error del backend: ${response.statuscode}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * UP - Actualizar relación usando executeAction
   */
  updateRelacionRolUsuarioAction(id: number, relacion: Partial<RolUsuarioForm>): Observable<RolUsuarioApiResponse> {
    const url = this.getApiUrl();

    return this.http.post<RolUsuarioApiResponse>(url, { action: 'UP', id, ...relacion }, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Relación rol-usuario actualizada exitosamente: ID ${id}`);
        } else {
          // Si el backend devuelve error, lanzar el error
          throw new Error(response.mensaje || `Error del backend: ${response.statuscode}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DL - Eliminar relación usando executeAction
   */
  deleteRelacionRolUsuarioAction(id: number): Observable<RolUsuarioApiResponse> {
    const url = this.getApiUrl();

    return this.http.post<RolUsuarioApiResponse>(url, { action: 'DL', id }, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`🗑️ Relación rol-usuario eliminada exitosamente: ID ${id}`);
        } else {
          // Si el backend devuelve error, lanzar el error
          throw new Error(response.mensaje || `Error del backend: ${response.statuscode}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Métodos específicos para gestión de permisos
   */

  /**
   * Obtener todos los roles de un usuario específico
   */
  getRolesDeUsuario(idUsuario: number): Observable<RolUsuario[]> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => 
        relaciones.filter(relacion => 
          relacion.id_usu === idUsuario && relacion.estado === 'A'
        )
      )
    );
  }

  /**
   * Obtener todos los usuarios de un rol específico
   */
  getUsuariosDeRol(idRol: number): Observable<RolUsuario[]> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => 
        relaciones.filter(relacion => 
          relacion.id_rol === idRol && relacion.estado === 'A'
        )
      )
    );
  }

  /**
   * Asignar rol a usuario
   */
  asignarRolAUsuario(idUsuario: number, idRol: number, usuModificacion?: string): Observable<RolUsuarioApiResponse> {
    const relacion: RolUsuarioForm = {
      id_usu: idUsuario,
      id_rol: idRol,
      estado: 'A',
      usu_m: usuModificacion || 'SYSTEM'
    };

    return this.createRelacionRolUsuario(relacion);
  }

  /**
   * Remover rol de usuario
   */
  removerRolDeUsuario(idRelacion: number): Observable<RolUsuarioApiResponse> {
    return this.deleteRelacionRolUsuario(idRelacion);
  }

  /**
   * Cambiar estado de relación rol-usuario
   */
  cambiarEstadoRelacion(idRelacion: number, nuevoEstado: string, usuModificacion?: string): Observable<RolUsuarioApiResponse> {
    const updateData = {
      estado: nuevoEstado,
      usu_m: usuModificacion || 'SYSTEM'
    };

    return this.updateRelacionRolUsuario(idRelacion, updateData);
  }

  /**
   * Verificar si un usuario tiene un rol específico
   */
  usuarioTieneRol(idUsuario: number, idRol: number): Observable<boolean> {
    return this.getRolesDeUsuario(idUsuario).pipe(
      map(roles => roles.some(rol => rol.id_rol === idRol))
    );
  }

  /**
   * Obtener permisos completos de un usuario
   */
  getPermisosUsuario(idUsuario: number): Observable<PermisosUsuario | null> {
    return this.getRolesDeUsuario(idUsuario).pipe(
      map(relaciones => {
        if (relaciones.length === 0) return null;

        const primeraRelacion = relaciones[0];
        const roles = relaciones.map(relacion => ({
          id_rol: relacion.id_rol,
          nombre_rol: relacion.nombre_rol,
          estado: relacion.estado
        }));

        return {
          id_usu: idUsuario,
          nombre_usuario: primeraRelacion.nombre_usuario,
          email_usuario: primeraRelacion.email_usuario,
          roles: roles
        };
      })
    );
  }

  /**
   * Obtener usuarios agrupados por rol
   */
  getUsuariosAgrupadosPorRol(): Observable<UsuariosPorRol[]> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => {
        const grupos = new Map<number, UsuariosPorRol>();
        
        relaciones.forEach(relacion => {
          if (!grupos.has(relacion.id_rol)) {
            grupos.set(relacion.id_rol, {
              id_rol: relacion.id_rol,
              nombre_rol: relacion.nombre_rol,
              usuarios: []
            });
          }
          
          const grupo = grupos.get(relacion.id_rol)!;
          grupo.usuarios.push({
            id_usu: relacion.id_usu,
            nombre_usuario: relacion.nombre_usuario,
            email_usuario: relacion.email_usuario,
            estado: relacion.estado
          });
        });
        
        return Array.from(grupos.values());
      })
    );
  }

  /**
   * Métodos de búsqueda y filtrado
   */

  /**
   * Buscar relaciones por nombre de usuario o rol
   */
  searchRelacionesRolUsuario(query: string): Observable<RolUsuario[]> {
    if (!query || query.trim().length === 0) {
      return this.getRelacionesRolUsuario();
    }

    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => 
        relaciones.filter(relacion => 
          relacion.nombre_usuario.toLowerCase().includes(query.toLowerCase()) ||
          relacion.nombre_rol.toLowerCase().includes(query.toLowerCase()) ||
          relacion.email_usuario.toLowerCase().includes(query.toLowerCase()) ||
          relacion.id_usu.toString().includes(query) ||
          relacion.id_rol.toString().includes(query)
        )
      )
    );
  }

  /**
   * Obtener relaciones por estado
   */
  getRelacionesPorEstado(estado: string): Observable<RolUsuario[]> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => relaciones.filter(relacion => relacion.estado === estado))
    );
  }

  /**
   * Obtener relaciones activas (estado = 'A')
   */
  getRelacionesActivas(): Observable<RolUsuario[]> {
    return this.getRelacionesPorEstado('A');
  }

  /**
   * Obtener relaciones inactivas (estado = 'I')
   */
  getRelacionesInactivas(): Observable<RolUsuario[]> {
    return this.getRelacionesPorEstado('I');
  }

  /**
   * Obtener relaciones con paginación
   */
  getRelacionesPaginadas(pagination: RolUsuarioPagination): Observable<{ relaciones: RolUsuario[], total: number }> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => {
        const { page, limit, sortBy, sortOrder } = pagination;
        
        // Aplicar ordenamiento
        let sortedRelaciones = [...relaciones];
        if (sortBy) {
          sortedRelaciones.sort((a, b) => {
            const aValue = a[sortBy as keyof RolUsuario];
            const bValue = b[sortBy as keyof RolUsuario];
            
            if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
            if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
            return 0;
          });
        }
        
        // Aplicar paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedRelaciones = sortedRelaciones.slice(startIndex, endIndex);
        
        return {
          relaciones: paginatedRelaciones,
          total: relaciones.length
        };
      })
    );
  }

  /**
   * Obtener relaciones ordenadas por fecha de modificación
   */
  getRelacionesOrdenadasPorFecha(ascendente: boolean = true): Observable<RolUsuario[]> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => {
        return relaciones.sort((a, b) => {
          const fechaA = new Date(a.fecha_m);
          const fechaB = new Date(b.fecha_m);
          
          if (ascendente) {
            return fechaA.getTime() - fechaB.getTime();
          } else {
            return fechaB.getTime() - fechaA.getTime();
          }
        });
      })
    );
  }

  /**
   * Verificar si existe una relación rol-usuario
   */
  checkRelacionRolUsuarioExists(idUsuario: number, idRol: number, excludeId?: number): Observable<boolean> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => {
        return relaciones.some(relacion => 
          relacion.id_usu === idUsuario && 
          relacion.id_rol === idRol && 
          relacion.id !== excludeId
        );
      })
    );
  }

  /**
   * Obtener relaciones por rango de fechas de modificación
   */
  getRelacionesPorRangoFechas(fechaDesde: string, fechaHasta: string): Observable<RolUsuario[]> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => {
        const desde = new Date(fechaDesde);
        const hasta = new Date(fechaHasta);
        
        return relaciones.filter(relacion => {
          const fechaModificacion = new Date(relacion.fecha_m);
          return fechaModificacion >= desde && fechaModificacion <= hasta;
        });
      })
    );
  }

  /**
   * Probar conectividad con la API
   */
  testConnection(): Observable<boolean> {
    return this.http.get<RolUsuarioApiResponse>(this.getApiUrl(), this.httpOptions).pipe(
      map(response => {
        console.log('✅ Conexión exitosa con la API de relación rol-usuario');
        return true;
      }),
      catchError(error => {
        console.error('❌ Error de conexión con la API de relación rol-usuario:', error);
        return of(false);
      })
    );
  }

  /**
   * Obtener estadísticas de relaciones rol-usuario
   */
  getEstadisticasRelacionesRolUsuario(): Observable<{
    total: number;
    activas: number;
    inactivas: number;
    suspendidas: number;
    bloqueadas: number;
    usuariosConRoles: number;
    rolesConUsuarios: number;
  }> {
    return this.getRelacionesRolUsuario().pipe(
      map(relaciones => {
        const total = relaciones.length;
        const activas = relaciones.filter(rel => rel.estado === 'A').length;
        const inactivas = relaciones.filter(rel => rel.estado === 'I').length;
        const suspendidas = relaciones.filter(rel => rel.estado === 'S').length;
        const bloqueadas = relaciones.filter(rel => rel.estado === 'B').length;
        
        const usuariosUnicos = new Set(relaciones.map(rel => rel.id_usu)).size;
        const rolesUnicos = new Set(relaciones.map(rel => rel.id_rol)).size;

        return {
          total,
          activas,
          inactivas,
          suspendidas,
          bloqueadas,
          usuariosConRoles: usuariosUnicos,
          rolesConUsuarios: rolesUnicos
        };
      })
    );
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de relación rol-usuario';
    
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
    
    console.error('❌ Error en RolUsuarioService:', error);
    
    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}
