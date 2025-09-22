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

## 🔧 Sistema Automático (Sin UI Visible)

### **Características**
- **Completamente automático** según el ambiente
- **Sin paneles flotantes** que estorben la UI
- **Bypass automático** en desarrollo
- **Configuración transparente** para el usuario
- **Logging en consola** para debugging

### **Funcionamiento Automático**
- ✅ **Bypass Auth**: Se activa automáticamente en desarrollo según `environment.bypassAuth`
- 👤 **Mock Session**: Se crea automáticamente si no existe sesión
- 🔒 **Auth Real**: Se requiere en QA, staging y producción
- 📊 **Navegación**: Funciona normalmente sin interferencias

## 🏗️ Configuración de Build

### **angular.json**
```json
{
  "configurations": {
    "qa": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.qa.ts"
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
    },
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ]
    }
  }
}
```

### **Uso con Angular CLI**
```bash
# Usar configuración con --configuration
ng serve --configuration=qa
ng build --configuration=production

# Atajo recomendado: usar npm scripts
npm run serve:qa
npm run build:prod
```

## 🚀 Comandos de Ejecución

### **Desarrollo** (con bypass de auth)
```bash
npm start
# o
ng serve
```

### **QA**
```bash
ng serve --configuration=qa
```

### **Staging**
```bash
ng serve --configuration=staging
```

### **Producción**
```bash
ng build --configuration=production
ng serve --config=production
```

### **Atajos Rápidos Recomendados**
```bash
# Desarrollo (más rápido, con bypass)
npm start

# QA (testing con auth real)
ng serve --configuration=qa

# Staging (ambiente de pruebas)
ng serve --configuration=staging

# Producción (build optimizado)
ng build --configuration=production
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
| `devToolsEnabled` | ❌ N/A | ❌ N/A | ❌ N/A | Sistema automático (sin UI) |

## 🔍 Verificación de Ambiente

### **Sin UI Visible - Cómo Saber el Ambiente:**
- **Consola del navegador**: Revisa los logs de autenticación
- **Comportamiento**: Bypass automático = Ambiente DEV
- **Login requerido**: Ambientes QA/Staging/Producción

### **Logs en Consola por Ambiente:**

#### **Desarrollo (DEV):**
```
🔓 [DEV] Bypass de autenticación activo
👤 [DEV] Sesión mock creada
✅ [AUTH] Usuario autenticado, acceso permitido
```

#### **QA/Staging/Producción:**
```
🔒 [AUTH] Usuario no autenticado, redirigiendo al login
```
*(O mensajes de login exitoso si ya está autenticado)*

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
