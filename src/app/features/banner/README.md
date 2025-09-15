# 📢 MÓDULO BANNER - GESTIÓN DE CONTENIDO DE PÁGINAS

## 🎯 **PROPÓSITO**
Módulo para gestionar el contenido dinámico de páginas web mediante banners. Es un servicio **hijo dependiente** del módulo Componentes (`CompService`).

---

## 🏗️ **ARQUITECTURA**

### **Relación con Componentes**
```
Componentes (Padre)
    ↓
    └── Banners (Hijo)
        ├── Carrusel Principal
        ├── Banner Lateral
        ├── Banner Inferior
        └── Banner Pop-up
```

**Cada banner pertenece a un componente específico y hereda sus propiedades.**

---

## 📊 **ESTRUCTURA DE DATOS**

### **Banner Principal**
```typescript
{
    "id_mb": 1,              // ID único del banner
    "nombre": "Banner Principal Home", // Nombre descriptivo del banner
    "id_comp": 1,            // ID del componente padre (FK)
    "id_coll": null,         // ID de colección (opcional)
    "tipo_call": "LINK",     // Tipo de llamada a acción
    "call": null,            // URL o acción del call-to-action
    "sucursales": [1, 2, 3], // Array de IDs de sucursales específicas
    "swsched": 0,            // ¿Tiene programación de fechas?
    "fecha_ini": "2025-09-14",
    "fecha_fin": "2025-09-15",
    "url_banner": null,      // URL de la imagen del banner
    "url_banner_call": null, // URL adicional para call-to-action
    "orden": 1,              // Orden de aparición
    "swEnable": 1,           // ¿Está activo?
    "usr_a": "admin",        // Usuario que creó
    "usr_m": null,           // Usuario que modificó
    "fecha_a": "2025-09-14T13:27:22.530",
    "fecha_m": "2025-09-14T13:27:22.530"
}
```

### **Información Relacionada (JOIN)**
```typescript
{
    "componente_clave": "CARR_HOME",     // Clave del componente padre
    "componente_nombre": "Carrusel Principal",
    "componente_tipo": 1,               // Tipo de componente
    "componente_canal": 1               // Canal del componente
}
```

---

## 🔧 **SERVICIOS**

### **BannerService**
- **Endpoint ID:** `19`
- **Servicio Padre:** `CompService`
- **Métodos CRUD:** Completos con manejo de errores avanzado

#### **Métodos Principales**
- `getAllBanners()` - Lista todos los banners
- `createBanner()` - Crea nuevo banner
- `updateBanner()` - Actualiza banner existente
- `deleteBanner()` - Elimina banner
- `getBannerById()` - Obtiene banner específico

#### **Métodos de Utilidad**
- `getBannersByComponente(idComp)` - Banners de un componente
- `getBannersActivos()` - Solo banners activos
- `getBannersProgramados()` - Banners con programación
- `updateBannerOrder(id, orden)` - Cambia orden
- `toggleBannerStatus(id, activo)` - Activa/desactiva

#### **Métodos de Configuración**
- `getEstadisticas()` - Estadísticas del módulo
- `validarOrdenUnico()` - Valida orden único por componente
- `validarFechas()` - Valida rango de fechas

---

## 🎨 **TIPOS DE BANNER**

### **Por Tipo de Llamada a Acción**
- **`LINK`** - Enlace directo a URL
- **`BUTTON`** - Botón con acción personalizada
- **`NONE`** - Sin llamada a acción

### **Por Sucursales**
- **Todas las sucursales** (`sucursales: null`) - Visible en todas las sucursales
- **Sucursales específicas** (`sucursales: [1, 2, 3]`) - Visible solo en sucursales específicas
- **Array vacío** (`sucursales: []`) - No visible en ninguna sucursal

### **Por Programación**
- **Sin Programación** (`swsched: 0`) - Siempre visible
- **Con Programación** (`swsched: 1`) - Visible en rango de fechas

### **Por Estado**
- **Activo** (`swEnable: 1`) - Visible en el sitio
- **Inactivo** (`swEnable: 0`) - Oculto

---

## 🔗 **RELACIONES**

### **Con Componentes**
- **FK:** `banner.id_comp → componente.id_comp`
- **Herencia:** Tipo y canal del componente padre
- **Dependencia:** No puede existir banner sin componente

### **Con Colecciones (Opcional)**
- **FK:** `banner.id_coll → coleccion.id_coll` (opcional)
- **Uso:** Banners específicos para ciertas colecciones

---

## 📋 **VALIDACIONES**

### **De Negocio**
- **Orden único** por componente
- **Fechas válidas** (`fecha_ini <= fecha_fin`)
- **Componente existente** (FK válida)
- **URLs válidas** (si se proporcionan)

### **De Integridad**
- **Componente padre** debe existir
- **Colección** debe existir (si se especifica)
- **Usuario** debe estar autenticado

---

## 🔍 **CONSULTAS FRECUENTES**

### **Banners Activos por Componente**
```typescript
// Obtener banners activos del carrusel principal
this.bannerService.getBannersByComponente(componentId)
    .subscribe(response => {
        const bannersActivos = response.data.filter(b => b.swEnable === 1);
    });
```

### **Banners Programados**
```typescript
// Obtener banners con programación de fechas
this.bannerService.getBannersProgramados()
    .subscribe(response => {
        // Manejar banners programados
    });
```

### **Validar Orden**
```typescript
// Antes de guardar, validar que el orden no esté duplicado
this.bannerService.validarOrdenUnico(idComponente, orden, idBannerActual)
    .subscribe(esValido => {
        if (!esValido) {
            // Mostrar error de orden duplicado
        }
    });
```

---

## 🚨 **MANEJO DE ERRORES**

### **Errores del Backend**
- **StatusCode 400:** Datos inválidos, campos requeridos faltantes
- **StatusCode 404:** Banner o componente no encontrado
- **StatusCode 409:** Conflictos de integridad (orden duplicado)
- **StatusCode 500:** Errores del servidor

### **Mensajes Específicos Preservados**
- ✅ `"La clave es obligatoria"`
- ✅ `"El orden ya existe para este componente"`
- ✅ `"Fecha de inicio debe ser anterior a fecha fin"`
- ✅ `"Componente padre no encontrado"`

---

## 📈 **ESTADÍSTICAS**

### **Métricas Disponibles**
```typescript
{
    "total": 25,           // Total de banners
    "activos": 18,         // Banners activos
    "programados": 7,      // Con programación
    "expirados": 3,        // Fuera de fecha
    "por_componente": [    // Agrupados por componente
        {
            "id_comp": 1,
            "componente": "Carrusel Principal",
            "total": 5,
            "activos": 4
        }
    ]
}
```

---

## 🛠️ **IMPLEMENTACIÓN**

### **Dependencias**
```typescript
import { BannerService } from '@/features/banner/services/banner.service';
import { CompService } from '@/features/comp/services/comp.service';
```

### **Inyección**
```typescript
constructor(
    private bannerService: BannerService,
    private compService: CompService  // Servicio padre
) {}
```

### **Uso Básico**
```typescript
// Crear banner
const nuevoBanner: CreateBannerRequest = {
    nombre: 'Banner Principal Home',  // Nombre descriptivo requerido
    id_comp: 1,
    tipo_call: 'LINK',
    call: 'https://ejemplo.com',
    sucursales: [1, 2, 3],            // Solo visible en sucursales 1, 2 y 3
    swsched: 0,
    fecha_ini: '2025-01-01',
    fecha_fin: '2025-12-31',
    orden: 1,
    swEnable: 1
};

// Crear banner para todas las sucursales
const bannerGlobal: CreateBannerRequest = {
    nombre: 'Banner Global',
    id_comp: 1,
    tipo_call: 'BUTTON',
    call: 'contactanos',
    sucursales: null,                 // Visible en todas las sucursales
    swsched: 1,                       // Con programación de fechas
    fecha_ini: '2025-01-01',
    fecha_fin: '2025-12-31',
    orden: 2,
    swEnable: 1
};

this.bannerService.createBanner(nuevoBanner)
    .subscribe(response => {
        console.log('Banner creado:', response.data);
    });
```

---

## 📚 **REFERENCIAS**

- **Servicio Padre:** `CompService` (ID: 18)
- **Endpoint ID:** `19`
- **Documentación de Errores:** `ERROR_HANDLING_README.md`
- **Especificaciones CRUD:** `CRUD_SERVICE_SPECIFICATIONS.md`

---

**🎯 Este módulo permite gestionar dinámicamente el contenido de páginas web mediante banners contextuales.**
