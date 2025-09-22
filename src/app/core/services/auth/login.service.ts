import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

import { ApiConfigService } from '../api/api-config.service';
import { SessionService } from '../session.service';
import { MenuLoaderService } from '../menu/menu-loader.service';

import {
  LoginCredentials,
  LoginRequest,
  LoginResponse,
  LoginUserData,
  AuthState,
  LoginApiResponse,
  LogoutRequest,
  LogoutResponse,
  AuthStatus
} from './login.models';

/**
 * Servicio de autenticación
 * Endpoint ID: 4 - /api/admrolu/v1 (Rol-Usuario/Permisos)
 * Maneja login, logout y estado de autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly ENDPOINT_NAME = 'admrolu'; // ID 4 - Rol-Usuario
  private readonly LOGIN_ACTION = 'LG';
  private readonly LOGOUT_ACTION = 'LO';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  // Estado de autenticación
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private sessionService: SessionService,
    private menuLoaderService: MenuLoaderService
  ) {
    // Inicializar estado desde localStorage si existe
    this.initializeAuthState();
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuthState(): void {
    try {
      const sessionData = this.sessionService.getSession();
      if (sessionData && sessionData.isLoggedIn) {
        this.authStateSubject.next({
          isAuthenticated: true,
          user: sessionData as LoginUserData,
          token: sessionData.id_session || null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.warn('⚠️ Error inicializando estado de autenticación:', error);
    }
  }

  /**
   * Obtiene el estado actual de autenticación
   */
  getCurrentAuthState(): AuthState {
    return this.authStateSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Obtiene los datos del usuario actual
   */
  getCurrentUser(): LoginUserData | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('🔐 Iniciando proceso de login');

    // Actualizar estado a loading
    this.updateAuthState({
      loading: true,
      error: null
    });

    // Convertir Promise a Observable y continuar con el flujo
    return new Observable<LoginResponse>(observer => {
      this.apiConfig.waitForEndpoints().then(() => {
        const endpoint = this.apiConfig.getEndpointByName(this.ENDPOINT_NAME);

        if (!endpoint) {
          const error = new Error(`Endpoint '${this.ENDPOINT_NAME}' no encontrado`);
          console.error('❌ Endpoint no encontrado:', this.ENDPOINT_NAME);
          observer.error(error);
          return;
        }

        const loginPayload: LoginRequest = {
          usuario: credentials.usuario,
          password: credentials.password,
          action: this.LOGIN_ACTION
        };

        console.log('📤 Enviando login a:', endpoint.url);
        console.log('📤 Payload:', { ...loginPayload, password: '***' });

        this.http.post<LoginResponse>(endpoint.url, loginPayload, this.httpOptions).subscribe({
          next: (response) => {
            console.log('✅ Respuesta de login:', response);
            // Procesar respuesta exitosa
            this.handleLoginResponse(response as LoginResponse).subscribe({
              next: (processedResponse) => {
                observer.next(processedResponse);
                observer.complete();
              },
              error: (error) => {
                observer.error(error);
              }
            });
          },
          error: (error) => {
            // Manejar error de HTTP
            this.handleLoginError(error).subscribe({
              error: (handledError) => {
                observer.error(handledError);
              }
            });
          }
        });
      }).catch(error => {
        console.error('❌ Error esperando endpoints:', error);
        observer.error(error);
      });
    });
  }

  /**
   * Realiza el logout del usuario
   */
  logout(): Observable<LogoutResponse> {
    console.log('🚪 Iniciando proceso de logout');

    const sessionData = this.sessionService.getSession();

    return new Observable<LogoutResponse>(observer => {
      this.apiConfig.waitForEndpoints().then(() => {
        const endpoint = this.apiConfig.getEndpointByName(this.ENDPOINT_NAME);

        if (!endpoint) {
          console.warn('⚠️ Endpoint no encontrado para logout, procediendo con limpieza local');
          this.performLocalLogout();
          observer.next({
            statuscode: 200,
            mensaje: 'Logout local exitoso',
            data: null
          });
          observer.complete();
          return;
        }

        const logoutPayload: LogoutRequest = {
          action: this.LOGOUT_ACTION,
          id_session: sessionData?.id_session
        };

        console.log('📤 Enviando logout a:', endpoint.url);

        this.http.post<LogoutResponse>(endpoint.url, logoutPayload, this.httpOptions).subscribe({
          next: (response) => {
            this.performLocalLogout();
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            console.warn('⚠️ Error en logout remoto, procediendo con logout local:', error);
            this.performLocalLogout();
            observer.next({
              statuscode: 200,
              mensaje: 'Logout local exitoso',
              data: null
            });
            observer.complete();
          }
        });
      }).catch(error => {
        console.warn('⚠️ Error esperando endpoints para logout:', error);
        this.performLocalLogout();
        observer.next({
          statuscode: 200,
          mensaje: 'Logout local exitoso',
          data: null
        });
        observer.complete();
      });
    });
  }

  /**
   * Limpia la sesión local y estado de autenticación
   */
  private performLocalLogout(): void {
    // Limpiar servicios
    this.sessionService.logout();

    // Limpiar estado local
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null
    });

    console.log('✅ Logout completado');
  }

  /**
   * Procesa la respuesta exitosa del login
   */
  private handleLoginResponse(response: LoginResponse): Observable<LoginResponse> {
    console.log('🔍 Procesando respuesta de login');

    try {
      let loginData: LoginUserData | null = null;
      let responseMessage = '';

      // Procesar respuesta (mismo formato que los componentes actuales)
      if (Array.isArray(response) && response.length > 0) {
        const firstItem = response[0];
        if (firstItem && firstItem.statuscode === 200) {
          responseMessage = firstItem.mensaje || 'Login exitoso';
          if (firstItem.data) {
            loginData = Array.isArray(firstItem.data) ? firstItem.data[0] : firstItem.data;
          }
        }
      } else if (response && typeof response === 'object') {
        if (response.statuscode === 200) {
          responseMessage = response.mensaje || 'Login exitoso';
          if (response.data) {
            loginData = Array.isArray(response.data) ? response.data[0] : response.data;
          }
        }
      }

      if (loginData && (loginData.id || loginData.usuario)) {
        console.log('✅ Login exitoso para usuario:', loginData.usuario || loginData.nombre);

        // Establecer sesión
        this.sessionService.setSession(loginData);

        // 🔐 SEGURIDAD: Esperar actualización completa del menú
        await this.updateMenuAfterLogin();

        // Actualizar estado de autenticación
        this.updateAuthState({
          isAuthenticated: true,
          user: loginData,
          token: loginData.id_session || null,
          loading: false,
          error: null
        });

        return of(response);
      } else {
        return throwError(() => new Error(responseMessage || 'Datos de usuario inválidos'));
      }
    } catch (error) {
      console.error('❌ Error procesando respuesta de login:', error);
      return throwError(() => error);
    }
  }

  /**
   * Maneja errores de login
   */
  private handleLoginError(error: any): Observable<never> {
    console.error('❌ Error en login:', error);

    let errorMessage = 'Error de autenticación';

    if (error instanceof HttpErrorResponse) {
      if (error.error?.mensaje) {
        errorMessage = error.error.mensaje;
      } else if (error.status === 401) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar al servidor';
      }
    }

    // Actualizar estado con error
    this.updateAuthState({
      loading: false,
      error: errorMessage
    });

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Actualiza el menú después del login exitoso
   */
  private async updateMenuAfterLogin(): Promise<void> {
    try {
      await this.menuLoaderService.updateMenuOnLogin();
      console.log('✅ Menú actualizado después del login');
    } catch (error) {
      console.warn('⚠️ Error actualizando menú:', error);
    }
  }

  /**
   * Actualiza el estado de autenticación
   */
  private updateAuthState(updates: Partial<AuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      ...updates
    });
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    console.log(`🔧 LoginService - URL base configurada: ${url}`);
    // Este servicio usa ApiConfigService, pero mantenemos compatibilidad
  }

  /**
   * Obtiene la URL base actual
   */
  getBaseUrl(): string {
    return this.apiConfig.getBaseUrl();
  }

  /**
   * Método de debug para verificar configuración
   */
  debugAuthState(): void {
    console.log('🔐 Estado de autenticación actual:', this.getCurrentAuthState());
  }

  /**
   * Refresca el estado de autenticación desde localStorage
   */
  refreshAuthState(): void {
    this.initializeAuthState();
  }
}
