import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import { MenuLoaderService } from '../../../core/services/menu/menu-loader.service';

import {
  Usuario,
  ApiResponse,
  UsuarioForm,
  UsuarioAction,
  UsuarioActionParams,
  UsuarioFilters,
  UsuarioPagination
} from '../models/usuario.interface';

// Interfaces de autenticación para compatibilidad
import {
  LoginCredentials,
  LoginRequest,
  LoginResponse,
  LoginUserData,
  LogoutRequest,
  LogoutResponse
} from '../../../core/services/auth/login.models';

/**
 * Servicio para la gestión de usuarios
 * Endpoint dinámico: ID 4 (Rol Usuario)
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly API_ID: number = 4; // ID del endpoint de Rol Usuario
  private readonly endpoints = {
    USUARIOS: '/api/admusr/v1' // Mantener por compatibilidad, pero usar API_ID
  };

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private sessionService: SessionService,
    private menuLoaderService: MenuLoaderService
  ) {}

  /**
   * Obtiene la URL del endpoint por ID
   */
  private getApiUrl(): string {
    const endpoint = this.apiConfig.getEndpointById(this.API_ID);
    if (!endpoint) {
      console.warn(`⚠️ Endpoint con ID ${this.API_ID} no encontrado. Usando URL por defecto.`);
      return this.apiConfig.getBaseUrl() + this.endpoints.USUARIOS;
    }
    return endpoint.url;
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    // UsuarioService configurado con URL del ApiConfigService
    // Este método se mantiene por compatibilidad pero ahora usa ApiConfigService
  }

  /**
   * Obtiene la URL base actual desde ApiConfigService
   */
  getBaseUrl(): string {
    return this.apiConfig.getBaseUrl();
  }

  /**
   * GET - Consulta de usuarios
   * Si no se especifica id, regresa todos los usuarios
   */
  getUsuarios(id?: number): Observable<Usuario[]> {
    let url = this.getApiUrl();

    if (id) {
      url += `/${id}`;
    }

    return this.http.get<ApiResponse<Usuario>>(url, this.httpOptions).pipe(
      map(response => {
        // Verificar si hay error del backend en el body
        if (response.statuscode && response.statuscode !== 200) {
          // Error del backend manejado por catchError
          throw new Error(response.mensaje || `Error del servidor: ${response.statuscode}`);
        }

        if (response.statuscode === 200 && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Obtiene un usuario específico por ID
   */
  getUsuarioById(id: number): Observable<Usuario | null> {
    return this.getUsuarios(id).pipe(
      map(usuarios => usuarios.length > 0 ? usuarios[0] : null)
    );
  }

  /**
   * POST - Crear nuevo usuario
   * Si se manda el id lo toma como update
   */
  createUsuario(usuario: UsuarioForm): Observable<ApiResponse<Usuario>> {
    const url = this.getApiUrl();

    return this.http.post<ApiResponse<Usuario>>(url, usuario, this.httpOptions).pipe(
      map(response => {
        // Verificar si hay error del backend en el body
        if (response.statuscode && response.statuscode !== 200) {
          // Error del backend manejado por catchError
          throw new Error(response.mensaje || `Error del servidor: ${response.statuscode}`);
        }
        return response;
      }),
      tap(() => {
        // Usuario creado exitosamente
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Actualizar atributos específicos del usuario
   */
  updateUsuario(id: number, usuario: Partial<UsuarioForm>): Observable<ApiResponse<Usuario>> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.patch<ApiResponse<Usuario>>(url, usuario, this.httpOptions).pipe(
      map(response => {
        // Verificar si hay error del backend en el body
        if (response.statuscode && response.statuscode !== 200) {
          throw new Error(response.mensaje || `Error del servidor: ${response.statuscode}`);
        }
        return response;
      }),
      tap(() => {
        // Usuario actualizado exitosamente
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Actualización completa del usuario
   */
  updateUsuarioCompleto(id: number, usuario: UsuarioForm): Observable<ApiResponse<Usuario>> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.put<ApiResponse<Usuario>>(url, usuario, this.httpOptions).pipe(
      map(response => {
        // Verificar si hay error del backend en el body
        if (response.statuscode && response.statuscode !== 200) {
          throw new Error(response.mensaje || `Error del servidor: ${response.statuscode}`);
        }
        return response;
      }),
      tap(() => {
        // Usuario actualizado completamente
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Eliminar usuario
   */
  deleteUsuario(id: number): Observable<ApiResponse<Usuario>> {
    const url = `${this.getApiUrl()}/${id}`;

    return this.http.delete<ApiResponse<Usuario>>(url, this.httpOptions).pipe(
      map(response => {
        // Verificar si hay error del backend en el body
        if (response.statuscode && response.statuscode !== 200) {
          throw new Error(response.mensaje || `Error del servidor: ${response.statuscode}`);
        }
        return response;
      }),
      tap(() => {
        // Usuario eliminado exitosamente
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
  executeAction(action: UsuarioAction, data?: any): Observable<ApiResponse<Usuario>> {
    const url = this.getApiUrl();
    const body = { action, ...data };

    return this.http.post<ApiResponse<Usuario>>(url, body, this.httpOptions).pipe(
      map(response => {
        // Verificar si hay error del backend en el body
        if (response.statuscode && response.statuscode !== 200) {
          throw new Error(response.mensaje || `Error del servidor: ${response.statuscode}`);
        }
        return response;
      }),
      tap(() => {
        // Acción ejecutada exitosamente
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Métodos de utilidad usando executeAction
   */
  
  /**
   * SL - Consulta de usuarios usando executeAction
   */
  selectUsuarios(filters?: UsuarioFilters): Observable<Usuario[]> {
    return this.executeAction('SL', { filters }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * IN - Insertar usuario usando executeAction
   */
  insertUsuario(usuario: UsuarioForm): Observable<ApiResponse<Usuario>> {
    const url = this.getApiUrl();

    return this.http.post<ApiResponse<Usuario>>(url, { action: 'IN', ...usuario }, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode !== 200) {
          // Si el backend devuelve error, lanzar el error
          throw new Error(response.mensaje || `Error del backend: ${response.statuscode}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * UP - Actualizar usuario usando executeAction
   */
  updateUsuarioAction(id: number, usuario: Partial<UsuarioForm>): Observable<ApiResponse<Usuario>> {
    const url = this.getApiUrl();

    return this.http.post<ApiResponse<Usuario>>(url, { action: 'UP', id, ...usuario }, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode !== 200) {
          // Si el backend devuelve error, lanzar el error
          throw new Error(response.mensaje || `Error del backend: ${response.statuscode}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DL - Eliminar usuario usando executeAction
   */
  deleteUsuarioAction(id: number): Observable<ApiResponse<Usuario>> {
    const url = this.getApiUrl();

    return this.http.post<ApiResponse<Usuario>>(url, { action: 'DL', id }, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode !== 200) {
          // Si el backend devuelve error, lanzar el error
          throw new Error(response.mensaje || `Error del backend: ${response.statuscode}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Métodos de búsqueda y filtrado
   */

  /**
   * Buscar usuarios por nombre o email
   */
  searchUsuarios(query: string): Observable<Usuario[]> {
    if (!query || query.trim().length === 0) {
      return this.getUsuarios();
    }

    return this.getUsuarios().pipe(
      map(usuarios => 
        usuarios.filter(usuario => 
          usuario.nombre.toLowerCase().includes(query.toLowerCase()) ||
          usuario.email.toLowerCase().includes(query.toLowerCase()) ||
          usuario.usuario.toString().includes(query)
        )
      )
    );
  }

  /**
   * Obtener usuarios por estado
   */
  getUsuariosPorEstado(estado: number): Observable<Usuario[]> {
    return this.getUsuarios().pipe(
      map(usuarios => usuarios.filter(usuario => usuario.estado === estado))
    );
  }

  /**
   * Obtener usuarios activos (estado = 1)
   */
  getUsuariosActivos(): Observable<Usuario[]> {
    return this.getUsuariosPorEstado(1);
  }

  /**
   * Obtener usuarios inactivos (estado = 0)
   */
  getUsuariosInactivos(): Observable<Usuario[]> {
    return this.getUsuariosPorEstado(0);
  }

  /**
   * Obtener usuarios con paginación
   */
  getUsuariosPaginados(pagination: UsuarioPagination): Observable<{ usuarios: Usuario[], total: number }> {
    return this.getUsuarios().pipe(
      map(usuarios => {
        const { page, limit, sortBy, sortOrder } = pagination;
        
                // Aplicar ordenamiento
        let sortedUsuarios = [...usuarios];
        if (sortBy) {
            sortedUsuarios.sort((a, b) => {
                const aValue = a[sortBy as keyof Usuario];
                const bValue = b[sortBy as keyof Usuario];
                
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
        const paginatedUsuarios = sortedUsuarios.slice(startIndex, endIndex);
        
        return {
          usuarios: paginatedUsuarios,
          total: usuarios.length
        };
      })
    );
  }

  /**
   * LOGIN - Autenticación de usuario
   * Usa la acción 'LG' para login
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const url = this.getApiUrl();
    const loginPayload: LoginRequest = {
      usuario: credentials.usuario,
      password: credentials.password,
      action: 'LG'
    };

    return this.http.post<LoginResponse>(url, loginPayload, this.httpOptions).pipe(
      tap(response => {
        // 🔍 VALIDAR RESPUESTA DEL SERVIDOR
        if (response.statuscode !== 200) {
          // Respuesta no exitosa - lanzar error con mensaje del servidor
          const errorMessage = response.mensaje || `Error de autenticación: ${response.statuscode}`;
          throw new Error(errorMessage);
        }

        // ✅ Respuesta exitosa - procesar y guardar sesión
        let loginData: LoginUserData | null = null;

        if (Array.isArray(response.data) && response.data.length > 0) {
          loginData = response.data[0];
        } else if (response.data) {
          loginData = response.data as LoginUserData;
        }

        if (loginData) {
          this.sessionService.setSession(loginData);
          // 🔄 ACTUALIZAR MENÚ: Reset completo del menú (igual que LoginService)
          this.menuLoaderService.updateMenuOnLogin().catch(error => {
            console.warn('⚠️ Error actualizando menú después del login:', error);
          });
        } else {
          // No hay datos de usuario válidos
          throw new Error('Respuesta de login inválida: no se encontraron datos de usuario');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * LOGOUT - Cierre de sesión del usuario
   * Usa la acción 'LO' para logout
   */
  logout(): Observable<LogoutResponse> {
    const sessionData = this.sessionService.getSession();
    const url = this.getApiUrl();

    const logoutPayload: LogoutRequest = {
      action: 'LO',
      id_session: sessionData?.id_session
    };

    return this.http.post<LogoutResponse>(url, logoutPayload, this.httpOptions).pipe(
      tap(response => {
        // Limpiar sesión local independientemente del resultado del servidor
        this.sessionService.logout();
      }),
      catchError(error => {
        console.warn('⚠️ UsuarioService - Error en logout remoto, limpiando sesión local:', error);
        // Limpiar sesión local incluso si hay error
        this.sessionService.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Probar conectividad con la API
   */
  testConnection(): Observable<boolean> {
    return this.http.get<ApiResponse<Usuario>>(this.getApiUrl(), this.httpOptions).pipe(
      map(response => {
        return true;
      }),
      catchError(error => {
        console.error('❌ Error de conexión con la API de usuarios:', error);
        return of(false);
      })
    );
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de usuarios';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status) {
      // Error del servidor - verificar si es HTTP error o error del backend
      if (error.error && error.error.statuscode && error.error.statuscode !== 200) {
        // Error del backend en el body (statuscode !== 200)
        errorMessage = error.error.mensaje || `Error del servidor: ${error.error.statuscode}`;
      } else {
        // Error HTTP estándar
        errorMessage = `Error del servidor: ${error.status} - ${error.message || 'Sin mensaje'}`;
      }
    } else if (error.message) {
      // Error personalizado - verificar si ya tiene mensaje del backend
      if (error.message && !error.message.includes('Ocurrió un error en el servicio de usuarios')) {
        // Es un mensaje personalizado del backend
        errorMessage = error.message;
      }
    }

    console.error('❌ Error en UsuarioService:', error);

    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}
