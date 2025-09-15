# 📋 CatConceptos - Sistema de Multi-Catálogos

## 🎯 **Descripción**

Módulo genérico para gestión de catálogos de conceptos. Diseñado como **sistema base** para múltiples catálogos que comparten la misma estructura de datos.

## 🏗️ **Estructura del Módulo**

```
src/app/features/catconceptos/
├── models/
│   └── catconceptos.interface.ts    # Interfaces y tipos
├── services/
│   └── catconceptos.service.ts      # Servicio CRUD
└── README.md                        # Esta documentación
```

## 📊 **Estructura de Datos**

Basado en el JSON del backend:

```json
{
    "statuscode": 200,
    "mensaje": "ok",
    "data": [
        {
            "id_c": 1,
            "clave": "CONC001_UPD",
            "nombre": "Concepto transformado",
            "swestado": 1
        }
    ]
}
```

### **Campos del Modelo:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_c` | `number` | Identificador único del concepto |
| `clave` | `string` | Código/clave del concepto |
| `nombre` | `string` | Nombre descriptivo |
| `swestado` | `number` | Estado (1=activo, 0=inactivo) |

## 🔧 **Configuración**

### **Endpoint ID:** `16`
- **Servicio:** `CatConceptosService`
- **Constante:** `CATCONCEPTOS_ENDPOINT_ID = 16`

### **URL del Backend:**
```
http://localhost:3000/api/catconceptos/v1
```

## 📚 **Uso del Servicio**

```typescript
import { CatConceptosService } from '@/features/catconceptos/services/catconceptos.service';

constructor(private catConceptosService: CatConceptosService) {}

// Obtener todos los conceptos
this.catConceptosService.getAllConceptos().subscribe(response => {
    console.log('Conceptos:', response.data);
});

// Crear un nuevo concepto
const nuevoConcepto = {
    clave: 'CONC002',
    nombre: 'Nuevo Concepto',
    swestado: 1
};

this.catConceptosService.createConcepto(nuevoConcepto).subscribe(response => {
    console.log('Concepto creado:', response.data);
});

// Actualizar un concepto
this.catConceptosService.updateConcepto({
    id_c: 1,
    nombre: 'Concepto Modificado'
}).subscribe(response => {
    console.log('Concepto actualizado:', response.data);
});

// Eliminar un concepto
this.catConceptosService.deleteConcepto(1).subscribe(response => {
    console.log('Concepto eliminado');
});
```

## 🎭 **Arquitectura Multi-Catálogos**

Este servicio está diseñado para ser **base genérica** para otros catálogos. La estructura permite:

1. **Campos comunes:** `id`, `clave`, `nombre`, `swestado`
2. **Operaciones CRUD estándar:** Create, Read, Update, Delete
3. **Filtros y paginación:** Soporte completo
4. **Sesión integrada:** Inyección automática de datos de usuario

### **Catálogos que pueden usar esta base:**

- ✅ **CatConceptos** (actual)
- 🔄 **CatTipos** (futuro)
- 🔄 **CatEstados** (futuro)
- 🔄 **CatCategorias** (futuro)
- 🔄 **CatSubcategorias** (futuro)

## 🔗 **Integración con el Sistema**

### **Dependencias:**
- ✅ **ApiConfigService:** Para obtener URLs dinámicamente
- ✅ **SessionService:** Para inyección de datos de usuario
- ✅ **HttpClient:** Para llamadas HTTP

### **Patrones Seguidos:**
- ✅ **Convenciones del proyecto:** Acciones `SL`, `IN`, `UP`, `DL`
- ✅ **Manejo de respuestas:** Arrays y objetos directos
- ✅ **Inyección de sesión:** `usr` e `id_session` en cada petición
- ✅ **Logging detallado:** Para debugging y monitoreo

## 🚀 **Próximos Pasos**

1. **Crear componente CRUD** para gestión visual de conceptos
2. **Implementar filtros avanzados** (búsqueda por clave/nombre)
3. **Agregar paginación** en la interfaz
4. **Crear variantes** para otros catálogos usando esta base

## 📋 **Referencias**

- **Documento base:** `CRUD_TABLE_SPECIFICATIONS.md`
- **Patrón de servicios:** Ver otros servicios en `/features/*/services/`
- **Convenciones del proyecto:** `PROJECT_RULES.md`</contents>
</xai:function_call">README.md
