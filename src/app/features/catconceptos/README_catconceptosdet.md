# 📋 CatConceptosDet - Detalles de Conceptos

## 🎯 **Descripción**

Módulo para gestión de detalles específicos relacionados con conceptos. Cada concepto (identificado por su clave) puede tener múltiples detalles numerados consecutivamente.

**Ubicación:** Mismo módulo que `CatConceptos` para mantener cohesión.

## 🏗️ **Arquitectura**

```
src/app/features/catconceptos/
├── models/
│   ├── catconceptos.interface.ts
│   └── catconceptosdet.interface.ts    ← NUEVO
├── services/
│   ├── catconceptos.service.ts
│   └── catconceptosdet.service.ts      ← NUEVO
└── README_catconceptosdet.md           ← ESTE ARCHIVO
```

## 📊 **Estructura de Datos**

Basado en el JSON del backend:

```json
{
    "statuscode": 200,
    "mensaje": "ok",
    "data": [
        {
            "clave": "CIUDAD",
            "concepto": 1,
            "descripcion": "ENSENADA",
            "folio": 0,
            "valor1": 3,
            "valorcadena1": "",
            "swestado": 1,
            "nombre_concepto": "Concepto transformado"
        }
    ]
}
```

### **Campos del Modelo:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `clave` | `string` | **FK a `catconceptos.clave`** - Identifica el concepto padre |
| `concepto` | `number` | **Consecutivo automático** - Número del detalle dentro de la clave |
| `descripcion` | `string` | Descripción específica del detalle |
| `folio` | `number` | Número de folio/secuencia adicional |
| `valor1` | `number` | Valor numérico adicional |
| `valorcadena1` | `string` | Valor de cadena adicional |
| `swestado` | `number` | Estado (1=activo, 0=inactivo) |
| `nombre_concepto` | `string` | **Campo JOIN** - Nombre del concepto padre |

## 🔑 **Clave Primaria Compuesta**

```
PK: (clave, concepto)
```

- **`clave`**: string (FK a `catconceptos.clave`)
- **`concepto`**: number (consecutivo automático por clave)

### **Ejemplo de registros:**
```
Clave Padre: "CIUDAD"
├── (clave: "CIUDAD", concepto: 1) → descripción: "ENSENADA"
├── (clave: "CIUDAD", concepto: 2) → descripción: "TIJUANA"
└── (clave: "CIUDAD", concepto: 3) → descripción: "MEXICALI"
```

## 🔗 **Relación con CatConceptos**

- **Tipo de relación:** `1:N` (un concepto → muchos detalles)
- **Campo de enlace:** `clave` (string) → `catconceptos.clave`
- **NO usa:** `id_c` del concepto padre
- **Campo adicional:** `nombre_concepto` (del JOIN)

## ⚙️ **Configuración Técnica**

### **Endpoint ID:** `20`
- **Servicio:** `CatConceptosDetService`
- **Constante:** `CATCONCEPTOSDET_ENDPOINT_ID = 20`

### **URL del Backend:**
```
http://localhost:3000/api/catconceptosdet/v1
```

### **Acciones del CRUD:**
- **`SL`**: Select/Consulta (método unificado)
- **`IN`**: Insert/Crear
- **`UP`**: Update/Actualizar
- **`DL`**: Delete/Eliminar

## 🔧 **Método de Consulta Unificado**

### **Único método POST** con parámetros flexibles:

```typescript
queryDetalles(params: CatConceptoDetQueryParams): Observable<CatConceptoDetResponse>
```

### **Parámetros disponibles:**
```typescript
interface CatConceptoDetQueryParams {
    clave?: string;          // Filtrar por clave padre
    concepto?: number;       // Filtrar por consecutivo específico
    descripcion?: string;    // Búsqueda por descripción
    swestado?: number;       // Filtrar por estado
    valor1?: number;         // Filtrar por valor numérico
    valorcadena1?: string;   // Filtrar por valor de cadena
    folio?: number;          // Filtrar por folio
    page?: number;           // Paginación
    limit?: number;
    sort?: string;           // Ordenamiento
    order?: 'asc' | 'desc';
}
```

### **Ejemplos de consultas:**

```typescript
// Todos los detalles de una clave
this.catConceptosDetService.queryDetalles({ clave: 'CIUDAD' });

// Detalle específico
this.catConceptosDetService.queryDetalles({
    clave: 'CIUDAD',
    concepto: 1
});

// Detalles activos con paginación
this.catConceptosDetService.queryDetalles({
    swestado: 1,
    page: 1,
    limit: 10,
    sort: 'descripcion',
    order: 'asc'
});

// Búsqueda por descripción
this.catConceptosDetService.queryDetalles({
    descripcion: 'ENSENADA'
});

// Combinación de filtros
this.catConceptosDetService.queryDetalles({
    clave: 'CIUDAD',
    swestado: 1,
    valor1: 3
});
```

## 📝 **Operaciones CRUD**

### **Crear Detalle:**
```typescript
const nuevoDetalle = {
    clave: 'CIUDAD',        // Obligatorio - FK existente
    descripcion: 'LA PAZ',  // Obligatorio
    folio: 1,               // Opcional
    valor1: 100,            // Opcional
    swestado: 1             // Opcional (default 1)
};

// El backend asigna automáticamente 'concepto' = MAX + 1
this.catConceptosDetService.createDetalle(nuevoDetalle);
```

### **Actualizar Detalle:**
```typescript
const detalleActualizado = {
    clave: 'CIUDAD',        // PK parte 1
    concepto: 4,            // PK parte 2
    descripcion: 'LA PAZ, BCS', // Nuevo valor
    valor1: 200             // Actualizar valor
};

this.catConceptosDetService.updateDetalle(detalleActualizado);
```

### **Eliminar Detalle:**
```typescript
// PK compuesta completa
this.catConceptosDetService.deleteDetalle('CIUDAD', 4);
```

## 🎭 **Lógica de Negocio**

### **Consecutivo Automático:**
1. **Usuario especifica:** `clave` (FK a catconceptos)
2. **Backend calcula:** `concepto = MAX(concepto) + 1` para esa clave
3. **Resultado:** Nuevo registro con PK `(clave, concepto)`

### **Validaciones:**
- ✅ **Clave padre existe** en `catconceptos`
- ✅ **PK compuesta única** `(clave, concepto)`
- ✅ **Campos opcionales** con valores por defecto

## 🔄 **Integración con el Sistema**

### **Dependencias:**
- ✅ **ApiConfigService:** Endpoint ID 20
- ✅ **SessionService:** Inyección de sesión
- ✅ **CatConceptosService:** Para validaciones de FK (futuro)

### **Convenciones del proyecto:**
- ✅ **Acciones:** SL/IN/UP/DL
- ✅ **Inyección de sesión:** usr, id_session
- ✅ **Manejo de respuestas:** Array/objeto
- ✅ **Logging detallado:** Para debugging

## 💡 **Casos de Uso Típicos**

### **1. Gestión de Ciudades por País:**
```
Clave: "PAIS_MEXICO"
├── (concepto: 1) → descripción: "CIUDAD DE MÉXICO"
├── (concepto: 2) → descripción: "GUADALAJARA"
└── (concepto: 3) → descripción: "MONTERREY"
```

### **2. Estados de un País:**
```
Clave: "PAIS_MEXICO"
├── (concepto: 1) → descripción: "AGUASCALIENTES"
├── (concepto: 2) → descripción: "BAJA CALIFORNIA"
└── (concepto: 3) → descripción: "CAMPECHE"
```

### **3. Categorías de Productos:**
```
Clave: "PRODUCTO_ELECTRONICA"
├── (concepto: 1) → descripción: "TELÉFONOS"
├── (concepto: 2) → descripción: "COMPUTADORAS"
└── (concepto: 3) → descripción: "ACCESORIOS"
```

## 🚀 **Próximos Pasos**

1. **Crear componente CRUD visual** para gestión de detalles
2. **Implementar validación de FK** con CatConceptosService
3. **Agregar filtros contextuales** (click derecho en headers)
4. **Crear lógica de consecutivos** automática en UI
5. **Implementar búsqueda avanzada** por descripción

## 📋 **Referencias**

- **Módulo padre:** `CatConceptos` (mismo directorio)
- **Patrón de servicios:** Ver `CatConceptosService`
- **Convenciones del proyecto:** `PROJECT_RULES.md`
- **Endpoint ID:** 20 (configurar en backend)

---

## 🎯 **Diferencias con CatConceptos**

| Aspecto | CatConceptos | CatConceptosDet |
|---------|-------------|-----------------|
| **Relación** | Independiente | FK por clave string |
| **PK** | Simple (id_c) | Compuesta (clave, concepto) |
| **Consecutivo** | N/A | Automático por clave |
| **Uso** | Catálogos maestros | Detalles específicos |
| **Consulta** | Múltiples métodos | 1 método unificado |

---

*Este módulo extiende el sistema de catálogos para manejar detalles jerárquicos con consecutivos automáticos.*
