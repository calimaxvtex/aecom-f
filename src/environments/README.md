# 🔧 Sistema de Entornos

## 📋 Descripción

Este proyecto implementa un sistema completo de entornos Angular que permite configurar diferentes comportamientos según el ambiente de ejecución (desarrollo, staging, producción).

## 🗂️ Estructura de Archivos

```
src/environments/
├── environment.ts          # Configuración de DESARROLLO
├── environment.staging.ts  # Configuración de STAGING/PRUEBAS
├── environment.prod.ts     # Configuración de PRODUCCIÓN
└── README.md              # Esta documentación
```

## ⚙️ Configuraciones por Entorno

### 🌐 **Desarrollo** (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://ec.calimax.digital',
  apiUrlImg: 'http://10.10.254.127:3013',
  bypassAuth: true,              // ✅ Bypass automático de autenticación
  debugMode: true,
  enableLogs: true,
  enableApiMonitor: true,        // ✅ Interceptor de monitoreo activo
  devToolsEnabled: true          // ✅ DevTools visible
};
```

### 🧪 **Staging** (`environment.staging.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://staging-ec.calimax.digital',
  apiUrlImg: 'http://10.10.254.127:3013',
  bypassAuth: false,             // ❌ Autenticación requerida
  debugMode: true,
  enableLogs: true,
  enableApiMonitor: true,        // ✅ Interceptor de monitoreo activo
  devToolsEnabled: true          // ✅ DevTools visible
};
```

### 🚀 **Producción** (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ec.calimax.digital',
  apiUrlImg: 'http://10.10.254.127:3013',
  bypassAuth: false,             // ❌ Autenticación requerida
  debugMode: false,
  enableLogs: false,
  enableApiMonitor: false,       // ❌ Interceptor de monitoreo inactivo
  devToolsEnabled: false         // ❌ DevTools ocultos
};
```

## 🛡️ Sistema de Guards

### **AuthGuard** - Protección de Rutas
- **Desarrollo**: Bypass automático + sesión mock
- **Staging/Producción**: Verificación real de autenticación
- **Redirección**: `/login` si no está autenticado

### **Configuración de Rutas**
```typescript
// src/app/app.routes.ts
{
  path: '',
  component: AppLayout,
  canActivate: [AuthGuard],  // 🔒 Protección aplicada
  children: [
    // Todas las rutas protegidas
  ]
}
```

## 🔧 DevTools Component

### **Características**
- **Visible solo en desarrollo/staging**
- **Panel flotante** en esquina superior derecha
- **Control de bypass** de autenticación
- **Creación de sesiones mock**
- **Información del entorno** en tiempo real

### **Funciones Disponibles**
- ✅ **Bypass Auth**: Toggle para activar/desactivar bypass
- 👤 **Mock Session**: Crear sesión de desarrollo
- 🗑️ **Limpiar Sesión**: Remover sesión actual
- 🔐 **Ir a Login**: Navegar a página de login
- 📊 **Ir a Dashboard**: Navegar al dashboard

## 🏗️ Configuración de Build

### **angular.json**
```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ]
    },
    "staging": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.staging.ts"
        }
      ]
    }
  }
}
```

## 🚀 Comandos de Ejecución

### **Desarrollo** (con bypass de auth)
```bash
npm start
# o
ng serve
```

### **Staging**
```bash
ng serve --configuration=staging
```

### **Producción**
```bash
ng build --configuration=production
ng serve --configuration=production
```

## 🔄 Interceptores Condicionales

Los interceptors se activan/desactivan según el entorno:

- **SimpleTestInterceptor**: Solo en desarrollo (`enableLogs`)
- **ApiMonitorInterceptor**: Solo si está habilitado (`enableApiMonitor`)

## 📊 Variables de Configuración

| Variable | Desarrollo | Staging | Producción | Descripción |
|----------|------------|---------|------------|-------------|
| `bypassAuth` | ✅ `true` | ❌ `false` | ❌ `false` | Bypass de autenticación |
| `debugMode` | ✅ `true` | ✅ `true` | ❌ `false` | Modo debug |
| `enableLogs` | ✅ `true` | ✅ `true` | ❌ `false` | Logs habilitados |
| `enableApiMonitor` | ✅ `true` | ✅ `true` | ❌ `false` | Monitor de APIs |
| `devToolsEnabled` | ✅ `true` | ✅ `true` | ❌ `false` | DevTools visible |

## 🔗 Integraciones

### **API Configuration**
```typescript
// src/app/core/constants/api.constants.ts
import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  BASE_URL: environment.apiUrl,
  BASE_URL_IMG: environment.apiUrlImg,
  // ...
};
```

### **App Configuration**
```typescript
// src/app.config.ts
import { environment } from './environments/environment';

// Interceptores condicionales
...(environment.enableLogs ? [SimpleTestInterceptor] : []),
...(environment.enableApiMonitor ? [ApiMonitorInterceptor] : [])
```

## 🎯 Beneficios

### **Para Desarrollo**
- ✅ **Rapidez**: No requiere login manual
- ✅ **Debugging**: Logs y monitoreo activos
- ✅ **Flexibilidad**: DevTools para control
- ✅ **Sesión Mock**: Testing inmediato

### **Para Producción**
- 🔒 **Seguridad**: Autenticación requerida
- ⚡ **Performance**: Interceptores optimizados
- 🎨 **UX**: Sin elementos de desarrollo
- 🛡️ **Estabilidad**: Configuración limpia

## 📝 Notas Importantes

1. **Nunca commits cambios en `environment.ts`** con valores de producción
2. **Las URLs de staging** deben configurarse según el ambiente real
3. **Los DevTools solo aparecen** en desarrollo y staging
4. **El bypass se desactiva automáticamente** en producción
5. **Los interceptores se configuran** condicionalmente por entorno

## 🔄 Próximos Pasos Recomendados

1. **Configurar URLs específicas** para cada ambiente
2. **Ajustar timeouts** según necesidades
3. **Documentar** uso del sistema para el equipo
4. **Configurar CI/CD** con variables de entorno
5. **Implementar feature flags** adicionales si es necesario
