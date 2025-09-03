import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  Usuario,
  ApiResponse,
  UsuarioForm,
  UsuarioAction,
  UsuarioActionParams,
  UsuarioFilters,
  UsuarioPagination
} from '../models/usuario.interface';

/**
 * Servicio para la gestión de usuarios
 * Endpoint: /api/admusr/v1
 * Base URL: http://localhost:3000
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private baseUrl: string = 'http://localhost:3000';
  private readonly endpoints = {
    USUARIOS: '/api/admusr/v1'
  };

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Configura la URL base del servicio
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    console.log(`🔧 URL base configurada: ${this.baseUrl}`);
  }

  /**
   * Obtiene la URL base actual
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * GET - Consulta de usuarios
   * Si no se especifica id, regresa todos los usuarios
   */
  getUsuarios(id?: number): Observable<Usuario[]> {
    let url = `${this.baseUrl}${this.endpoints.USUARIOS}`;
    
    if (id) {
      url += `/${id}`;
    }

    return this.http.get<ApiResponse<Usuario>>(url, this.httpOptions).pipe(
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
    const url = `${this.baseUrl}${this.endpoints.USUARIOS}`;
    
    return this.http.post<ApiResponse<Usuario>>(url, usuario, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Usuario creado exitosamente: ${usuario.nombre}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Actualizar atributos específicos del usuario
   */
  updateUsuario(id: number, usuario: Partial<UsuarioForm>): Observable<ApiResponse<Usuario>> {
    const url = `${this.baseUrl}${this.endpoints.USUARIOS}/${id}`;
    
    return this.http.patch<ApiResponse<Usuario>>(url, usuario, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Usuario actualizado exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Actualización completa del usuario
   */
  updateUsuarioCompleto(id: number, usuario: UsuarioForm): Observable<ApiResponse<Usuario>> {
    const url = `${this.baseUrl}${this.endpoints.USUARIOS}/${id}`;
    
    return this.http.put<ApiResponse<Usuario>>(url, usuario, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Usuario actualizado completamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Eliminar usuario
   */
  deleteUsuario(id: number): Observable<ApiResponse<Usuario>> {
    const url = `${this.baseUrl}${this.endpoints.USUARIOS}/${id}`;
    
    return this.http.delete<ApiResponse<Usuario>>(url, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`🗑️ Usuario eliminado exitosamente: ID ${id}`);
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
  executeAction(action: UsuarioAction, data?: any): Observable<ApiResponse<Usuario>> {
    const url = `${this.baseUrl}${this.endpoints.USUARIOS}`;
    const body = { action, ...data };
    
    console.log(`🔧 Ejecutando acción: ${action}`, body);
    
    return this.http.post<ApiResponse<Usuario>>(url, body, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Acción ${action} ejecutada exitosamente`);
        }
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
    return this.executeAction('IN', { data: usuario });
  }

  /**
   * UP - Actualizar usuario usando executeAction
   */
  updateUsuarioAction(id: number, usuario: Partial<UsuarioForm>): Observable<ApiResponse<Usuario>> {
    return this.executeAction('UP', { id, data: usuario });
  }

  /**
   * DL - Eliminar usuario usando executeAction
   */
  deleteUsuarioAction(id: number): Observable<ApiResponse<Usuario>> {
    return this.executeAction('DL', { id });
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
   * Probar conectividad con la API
   */
  testConnection(): Observable<boolean> {
    return this.http.get<ApiResponse<Usuario>>(`${this.baseUrl}${this.endpoints.USUARIOS}`, this.httpOptions).pipe(
      map(response => {
        console.log('✅ Conexión exitosa con la API de usuarios');
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
      // Error del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
    } else if (error.message) {
      // Error personalizado
      errorMessage = error.message;
    }
    
    console.error('❌ Error en UsuarioService:', error);
    
    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}
