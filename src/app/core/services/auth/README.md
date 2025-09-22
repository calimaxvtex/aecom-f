# 🔐 Servicio de Autenticación

## 📋 Descripción

Servicio centralizado para manejar todas las operaciones de autenticación en la aplicación. Implementa el patrón de servicio único para login, logout y gestión de estado de autenticación.

## 🎯 Endpoint Utilizado

- **ID**: 4
- **Ruta**: `/api/admrolu/v1`
- **Descripción**: Rol-Usuario (Permisos)
- **Método**: `admrolu`

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **Login**: Autenticación de usuarios con credenciales
- **Logout**: Cierre de sesión con limpieza completa
- **Estado Reactivo**: Observable para estado de autenticación
- **Gestión de Sesión**: Integración con `SessionService`
- **Carga de Menú**: Integración con `MenuLoaderService`
- **URLs Dinámicas**: Uso de `ApiConfigService` para endpoints dinámicos
- **Manejo de Errores**: Tratamiento robusto de errores HTTP
- **Logging**: Logs detallados para debugging

### 📊 Estado de Autenticación

```typescript
interface AuthState {
  isAuthenticated: boolean;    // Si el usuario está autenticado
  user: LoginUserData | null;  // Datos del usuario actual
  token: string | null;        // Token/ID de sesión
  loading: boolean;            // Estado de carga
  error: string | null;        // Mensaje de error
}
```

## 📝 Uso del Servicio

### 🔐 Login

```typescript
import { LoginService } from '@/core/services/auth';

constructor(private loginService: LoginService) {}

// En el componente
login(credentials: {usuario: string, password: string}) {
  this.loginService.login(credentials).subscribe({
    next: (response) => {
      console.log('Login exitoso:', response);
      // Redirigir al dashboard
      this.router.navigate(['/']);
    },
    error: (error) => {
      console.error('Error en login:', error);
      // Mostrar mensaje de error
    }
  });
}
```

### 🚪 Logout

```typescript
logout() {
  this.loginService.logout().subscribe({
    next: () => {
      console.log('Logout exitoso');
      // Redirigir al login
      this.router.navigate(['/login']);
    }
  });
}
```

### 👀 Estado de Autenticación

```typescript
// Suscribirse a cambios de estado
ngOnInit() {
  this.loginService.authState$.subscribe(state => {
    this.isAuthenticated = state.isAuthenticated;
    this.currentUser = state.user;
    this.loading = state.loading;
    if (state.error) {
      this.showError(state.error);
    }
  });
}

// Verificar estado actual
isLoggedIn(): boolean {
  return this.loginService.isAuthenticated();
}

getCurrentUser(): LoginUserData | null {
  return this.loginService.getCurrentUser();
}
```

## 🔧 Integraciones

### SessionService
- ✅ Almacenamiento de datos de sesión en localStorage
- ✅ Recuperación automática de sesión al iniciar
- ✅ Limpieza completa al hacer logout

### MenuLoaderService
- ✅ Actualización automática del menú después del login
- ✅ Carga de menú dinámico basado en permisos

### ApiConfigService
- ✅ URLs dinámicas en lugar de hardcodeadas
- ✅ Espera automática a que los endpoints estén disponibles
- ✅ Configuración centralizada de URLs

## 📋 Interfaces y Tipos

### LoginCredentials
```typescript
interface LoginCredentials {
  usuario: string;
  password: string;
  action?: string;
}
```

### LoginUserData
```typescript
interface LoginUserData {
  id?: number;
  usuario?: string;
  nombre?: string;
  email?: string;
  id_session?: string;
  rol?: string;
  permisos?: string[];
  estado?: string;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}
```

## 🔄 Flujo de Autenticación

1. **Login Request**: Usuario ingresa credenciales
2. **API Call**: Llamada HTTP al endpoint `/api/admrolu/v1`
3. **Response Processing**: Procesamiento de respuesta del servidor
4. **Session Setup**: Configuración de sesión con `SessionService`
5. **Menu Update**: Actualización del menú con `MenuLoaderService`
6. **State Update**: Actualización del estado de autenticación
7. **Navigation**: Redirección automática al dashboard

## 🛡️ Manejo de Errores

- **401 Unauthorized**: Credenciales incorrectas
- **0 Network Error**: Sin conexión al servidor
- **Endpoint Not Found**: Configuración faltante
- **Invalid Response**: Formato de respuesta inesperado

## 📁 Estructura de Archivos

```
src/app/core/services/auth/
├── login.models.ts          # Interfaces y tipos
├── login.service.ts         # Servicio principal
├── index.ts                 # Barrel exports
└── README.md               # Esta documentación
```

## 🎯 Beneficios

- **🔧 Centralización**: Toda la lógica de autenticación en un solo lugar
- **♻️ Reutilización**: Múltiples componentes pueden usar el mismo servicio
- **🎛️ Configurabilidad**: URLs dinámicas mediante `ApiConfigService`
- **🧪 Testing**: Más fácil de testear unitariamente
- **📦 Mantenimiento**: Cambios en un solo lugar
- **🔄 Reactivo**: Estado observable para actualizaciones en tiempo real

## 🔍 Debugging

```typescript
// Ver estado actual
this.loginService.debugAuthState();

// Verificar configuración
this.loginService.debugAuthState();
```

## 🚀 Próximos Pasos

- [ ] Refactorizar componentes `login.ts` y `login2.ts` para usar este servicio
- [ ] Implementar refresh token automático
- [ ] Agregar manejo de múltiples sesiones
- [ ] Implementar recuperación de contraseña
