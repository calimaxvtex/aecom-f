/**
 * Barrel exports para el módulo de autenticación
 */

// Servicios
export { LoginService } from './login.service';

// Modelos
export * from './login.models';

// Re-exportar tipos útiles
export type {
  LoginCredentials,
  LoginRequest,
  LoginResponse,
  LoginUserData,
  AuthState,
  LoginApiResponse,
  LogoutRequest,
  LogoutResponse
} from './login.models';

export { AuthStatus } from './login.models';
