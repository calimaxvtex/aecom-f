# 🍳 Módulo Receta

Este módulo contiene toda la funcionalidad relacionada con la gestión de recetas de cocina.

## 📁 Estructura

```
receta/
├── models/
│   ├── index.ts
│   └── receta.interface.ts    # Interfaces para CRUD de recetas
├── services/
│   ├── index.ts
│   └── receta.service.ts      # Servicio CRUD para operaciones con API
└── index.ts                   # Exportaciones principales
```

## 🎯 Interfaces

### `RecetaItem`

Interface para ítems de receta en operaciones CRUD (listado/tabla)

```typescript
interface RecetaItem {
    id: number;
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
    category: string;
    url_banner: string;
    time: string;
    people: number;
    difficulty: string;
    // ... campos de auditoría
}
```

### `RecetaFormItem`

Interface para formularios de creación/edición

```typescript
interface RecetaFormItem {
    id?: number | null;
    title?: string;
    description?: string;
    // ... otros campos opcionales
}
```

## 🚀 Servicio CRUD

### `RecetaService`

**Métodos disponibles:**

- `getRecetas()` - Obtener lista completa de recetas
- `getReceta(id)` - Obtener receta específica por ID
- `guardar(receta)` - Crear/actualizar automáticamente (IN/UP)
- `actualizar(id, receta)` - Actualización completa
- `actualizarParcial(id, datosParciales)` - Actualización parcial
- `eliminar(id)` - Eliminar receta
- `ejecutarAccion(action, data?, id?)` - Método genérico para acciones personalizadas

## 📋 Características

✅ **Detección automática de acción**: `guardar()` detecta si crear (IN) o actualizar (UP)  
✅ **Manejo robusto de errores**: Preserva mensajes específicos del backend  
✅ **Logging completo**: Facilita debugging con emojis descriptivos  
✅ **URLs dinámicas**: Soporta configuración de endpoints dinámica  
✅ **Sesión integrada**: Incluye automáticamente datos de usuario y sesión  
✅ **Compatible con el modelo**: Basado exactamente en el JSON proporcionado

## 🔧 Configuración de Endpoint

- **URL base**: `/api/admrcta/v1`
- **Método**: POST con parámetro `action`
- **Acciones**: `SL` (select), `IN` (insert), `UP` (update), `DL` (delete)

## 📖 Uso

```typescript
import { RecetaService } from '@/features/receta';

// En tu componente
constructor(private recetaService: RecetaService) {}

// Cargar recetas
cargarRecetas() {
    this.recetaService.getRecetas().subscribe({
        next: (response) => console.log('Recetas:', response.data),
        error: (error) => console.error('Error:', error)
    });
}
```

## 🔗 Dependencias

- `ApiConfigService` - Configuración de endpoints
- `SessionService` - Gestión de sesión de usuario
- `HttpClient` - Cliente HTTP de Angular

---

**📋 Especificaciones**: Basado en `docs/specifications/CRUD_SERVICE_SPECIFICATIONS.md`
