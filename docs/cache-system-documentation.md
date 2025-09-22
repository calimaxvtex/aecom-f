# Sistema de Cache Local - Documentación

## 📋 Resumen

Se ha implementado un sistema de cache local persistente usando `localStorage` para mejorar la experiencia del usuario al cargar datos de marcas y subcategorías. El cache dura **7 días** y se actualiza automáticamente.

## 🏗️ Arquitectura

### 1. LocalStorageCacheService
**Ubicación:** `src/app/core/services/local-storage-cache.service.ts`

Servicio central que maneja:
- ✅ Almacenamiento en localStorage con expiración
- ✅ Validación automática de cache expirado
- ✅ Limpieza de cache corrupto
- ✅ Métodos seguros que no fallan si localStorage está lleno

**Características principales:**
```typescript
// Configuración
private readonly CACHE_EXPIRY_DAYS = 7; // 1 semana
private readonly CACHE_PREFIX = 'aec_cache_'; // Prefijo para evitar conflictos

// Métodos principales
set<T>(key: string, data: T): void           // Guardar con expiración
get<T>(key: string): T | null               // Obtener si no expiró
has(key: string): boolean                   // Verificar existencia
remove(key: string): void                   // Eliminar específico
clear(): void                              // Limpiar todo
getInfo(key: string)                       // Información del cache
```

### 2. Servicios Actualizados

#### MarcasService
**Ubicación:** `src/app/features/productos/services/marcas.service.ts`

**Nuevos métodos:**
```typescript
getCacheInfo(): CacheInfo | null              // Información del cache
clearCache(): void                           // Limpiar cache completo
```

**Flujo mejorado:**
```
1. loadAllMarcas()
2. Buscar en localStorage
3. Si existe y no expiró → Retornar datos
4. Si no existe → Cargar desde servidor → Guardar en localStorage
```

#### SubcategoriasService
**Ubicación:** `src/app/features/productos/services/subcategorias.service.ts`

**Nuevos métodos:**
```typescript
getCacheInfo(): CacheInfo | null              // Información del cache
clearCache(): void                           // Limpiar cache completo
```

**Flujo mejorado:**
```
1. loadAllSubcategorias()
2. Buscar en localStorage
3. Si existe y no expiró → Retornar datos
4. Si no existe → Cargar desde servidor → Guardar en localStorage
```

### 3. Componente Actualizado

#### ItemsComponent
**Ubicación:** `src/app/pages/collections/items.component.ts`

**Nuevos métodos de gestión:**
```typescript
// Información del cache
getMarcasCacheInfo()
getSubcategoriasCacheInfo()

// Limpieza de cache
clearMarcasCache()
clearSubcategoriasCache()
clearAllCache()

// Debugging
logCacheInfo()
```

## 🔄 Flujo de Funcionamiento

### Primera Carga (Sin Cache)
```
Usuario carga página
    ↓
loadAllMarcas()
    ↓
❌ No hay cache en localStorage
    ↓
🌐 Cargar desde servidor
    ↓
💾 Guardar en localStorage (7 días)
    ↓
✅ Retornar datos al componente
```

### Cargas Posteriores (Con Cache)
```
Usuario carga página
    ↓
loadAllMarcas()
    ↓
✅ Cache válido encontrado en localStorage
    ↓
💾 Cargar desde localStorage
    ↓
✅ Retornar datos inmediatamente
```

### Cache Expirado
```
Usuario carga página
    ↓
loadAllMarcas()
    ↓
⏰ Cache expirado detectado
    ↓
🗑️ Eliminar cache expirado
    ↓
🌐 Cargar desde servidor
    ↓
💾 Guardar nuevo cache (7 días)
```

## 📊 Beneficios

### ✅ Ventajas Implementadas
- **Carga inmediata**: Datos disponibles sin esperar al servidor
- **Offline-ready**: Funciona sin conexión si hay cache
- **Auto-expiración**: Cache se limpia automáticamente después de 7 días
- **Transparente**: No cambia la API de los servicios
- **Resistente**: Maneja errores de localStorage corrupto
- **Performance**: Cache en memoria + localStorage
- **Debugging**: Métodos para inspeccionar y limpiar cache

### 📈 Mejoras de UX
- **Tiempo de carga**: Reducido significativamente en visitas posteriores
- **Experiencia offline**: Funciona sin conexión a internet
- **Feedback visual**: Toast que indica fuente de datos (localStorage/servidor)
- **Gestión manual**: Posibilidad de limpiar cache desde interfaz

## 🛠️ Uso en Desarrollo

### Inspeccionar Cache
```typescript
// En consola del navegador
component.logCacheInfo()

// Salida esperada:
📊 INFORMACIÓN DEL CACHE: {
  marcas: { hasLocalCache: true, daysRemaining: 5, timestamp: 1234567890 },
  subcategorias: { hasLocalCache: true, daysRemaining: 5, timestamp: 1234567891 },
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

### Limpiar Cache
```typescript
// Limpiar todo el cache
component.clearAllCache()

// Limpiar solo marcas
component.clearMarcasCache()

// Limpiar solo subcategorías
component.clearSubcategoriasCache()
```

### Verificar Funcionamiento
```typescript
// Primera carga (sin cache)
🚀 Iniciando carga de marcas con cache local
🌐 Cargando marcas desde servidor (sin cache local válido)
✅ Marcas cargadas desde servidor: 150
💾 Catálogo guardado en localStorage: 150

// Cargas posteriores (con cache)
🚀 Iniciando carga de marcas con cache local
💾 ✅ Marcas cargadas desde localStorage: 150
💾 Cache cargado: marcas_catalog (5 días restantes)
```

## 🔧 Configuración

### Cambiar Duración del Cache
```typescript
// En LocalStorageCacheService
private readonly CACHE_EXPIRY_DAYS = 7; // Cambiar a 3, 14, 30, etc.
```

### Agregar Más Servicios
Para agregar cache a otros servicios:

```typescript
// 1. Importar el servicio
import { LocalStorageCacheService } from '@/core/services/local-storage-cache.service';

// 2. Inyectar
private localStorageCache = inject(LocalStorageCacheService);

// 3. Definir key
private readonly CACHE_KEY = 'mi_servicio_catalog';

// 4. Aplicar patrón en método de carga
loadData(): Observable<Data[]> {
  // Buscar en cache
  const cached = this.localStorageCache.get<Data[]>(this.CACHE_KEY);
  if (cached) return of(cached);

  // Cargar desde servidor y guardar
  return this.http.get<Data[]>('api/data').pipe(
    tap(data => this.localStorageCache.set(this.CACHE_KEY, data))
  );
}
```

## 🚨 Consideraciones Técnicas

### Limitaciones de localStorage
- **Tamaño**: ~5-10MB por dominio
- **Tipo de datos**: Solo strings (se serializa automáticamente)
- **Bloqueante**: Operaciones síncronas
- **Compartido**: Visible para todas las pestañas

### Estrategia de Resiliencia
- ✅ Try-catch en todas las operaciones
- ✅ Limpieza automática de cache corrupto
- ✅ Fallback silencioso si localStorage falla
- ✅ No interrumpe funcionamiento si cache falla

### Seguridad
- ✅ Prefijo único para evitar conflictos
- ✅ No almacena datos sensibles
- ✅ Expiración automática previene datos obsoletos

## 🎯 Próximos Pasos

### Posibles Mejoras
1. **Compresión**: Comprimir datos grandes antes de guardar
2. **Versionado**: Invalidar cache cuando cambia estructura de datos
3. **Sincronización**: Compartir cache entre pestañas
4. **Métricas**: Estadísticas de uso del cache
5. **Configuración**: Hacer duración configurable por usuario

### Servicios Candidatos
- Categorías
- Items
- Configuraciones de usuario
- Preferencias de interfaz

---

## 📝 Notas de Implementación

- **Fecha**: Enero 2024
- **Versión**: 1.0
- **Duración del cache**: 7 días
- **Cobertura**: Marcas y Subcategorías
- **Compatibilidad**: Mantiene API existente
