/**
 * Modelos e interfaces para el servicio de autenticación
 * ID: 4 - Rol-Usuario (Permisos)
 */

export interface LoginCredentials {
  usuario: string;
  password: string;
  action?: string;
}

export interface LoginRequest extends LoginCredentials {
  action: 'LG'; // Acción específica para login
}

export interface LoginResponse {
  statuscode: number;
  mensaje: string;
  data?: LoginUserData | LoginUserData[];
}

export interface LoginUserData {
  id?: number;
  usuario?: string | number;
  nombre?: string;
  email?: string;
  id_session?: number | string;
  rol?: string;
  permisos?: string[];
  estado?: string;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: LoginUserData | null;
  token: number | string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginApiResponse {
  statuscode: number;
  mensaje: string;
  data: LoginUserData;
}

export interface LogoutRequest {
  action: 'LO'; // Acción específica para logout
  id_session?: number | string;
}

export interface LogoutResponse {
  statuscode: number;
  mensaje: string;
  data?: any;
}

/**
 * Tipos de acciones disponibles para el endpoint de usuarios
 */
export type UserAction = 'LG' | 'LO' | 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * Payload base para todas las operaciones de usuario
 */
export interface BaseUserPayload {
  action: UserAction;
  [key: string]: any;
}

/**
 * Estados posibles de autenticación
 */
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
  ERROR = 'error'
}
