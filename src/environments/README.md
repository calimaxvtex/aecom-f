# 🌍 Sistema de Gestión de Entornos

Este directorio contiene las configuraciones de entorno para diferentes ambientes de la aplicación Angular.

## 📁 Archivos de Entorno

### 🔧 `environment.ts` - Desarrollo
- **Modo:** Desarrollo local
- **Autenticación:** Bypass habilitado (`bypassAuth: true`)
- **Debug:** Habilitado con logs completos
- **API:** `https://ec.calimax.digital`
- **Características:** Mock data, dev tools, validación en tiempo real

### 🧪 `environment.qa.ts` - Quality Assurance
- **Modo:** Testing y validación
- **Autenticación:** Real (`bypassAuth: false`)
- **Debug:** Habilitado para debugging
- **API:** `http://localhost:3000` (configurable)
- **Características:** Logs extra, datos de prueba permitidos

### 🚀 `environment.staging.ts` - Pre-producción
- **Modo:** Ambiente de pruebas finales
- **Autenticación:** Real con validación completa
- **Debug:** Habilitado para monitoreo
- **API:** `https://staging-api.calimax.digital`
- **Características:** Monitoreo de performance, analytics habilitado

### 🏭 `environment.prod.ts` - Producción
- **Modo:** Producción
- **Autenticación:** Real obligatoria
- **Debug:** Deshabilitado para performance
- **API:** `https://api.calimax.digital`
- **Características:** Optimizado, analytics, caché extendido

## 🛠️ Configuración de Build

### Angular.json
```json
{
  "build": {
    "configurations": {
      "development": {
        "fileReplacements": [
          {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.ts"
          }
        ]
      },
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
}
```

## 🚀 Comandos de Ejecución

### Desarrollo
```bash
ng serve
# o
npm run start
```

### QA
```bash
ng serve --configuration=qa
# o
npm run start:qa
```

### Staging
```bash
ng build --configuration=staging
# o
npm run build:staging
```

### Producción
```bash
ng build --configuration=production
# o
npm run build:prod
```

## 🔐 Sistema de Autenticación

### AuthGuard
El `AuthGuard` se comporta diferente según el entorno:

- **Desarrollo:** Bypass automático, crea sesión mock
- **QA/Staging/Producción:** Autenticación real requerida

### Bypass de Desarrollo
```typescript
// En desarrollo, el AuthGuard permite acceso sin autenticación
if (!environment.production && environment.bypassAuth) {
  // Crear sesión mock automáticamente
  return true;
}
```

## 📊 Monitoreo y Debug

### Interceptores Condicionales
- **SimpleTestInterceptor:** Solo si `environment.enableLogs`
- **ApiMonitorInterceptor:** Solo si `environment.enableApiMonitor`

### DevTools
- **Desarrollo:** Panel completo de herramientas
- **QA/Staging:** Herramientas limitadas
- **Producción:** Deshabilitado

## 🔧 Variables de Entorno Clave

| Variable | Desarrollo | QA | Staging | Producción |
|----------|------------|----|---------| ---------- |
| `production` | false | false | false | true |
| `bypassAuth` | true | false | false | false |
| `debugMode` | true | true | true | false |
| `enableLogs` | true | true | true | false |
| `mockDataEnabled` | true | false | false | false |
| `devToolsEnabled` | true | true | true | false |

## 📝 Notas de Implementación

1. **Siempre usar `environment` importado** en lugar de valores hardcodeados
2. **Verificar configuración** antes de deploy a producción
3. **Usar variables de entorno** para configuraciones sensibles
4. **Monitorear performance** en entornos de staging y producción