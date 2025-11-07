# 📄 Página de Gestión de Páginas

Esta página permite administrar las páginas web y de aplicación del sistema.

## 🎯 Funcionalidades

### ✅ **Operaciones CRUD**

- **Crear**: Nueva página con nombre
- **Leer**: Lista paginada con filtros por canal
- **Actualizar**: Modificar nombre, cambiar estado con ToggleSwitch
- **Eliminar**: Marcar como baja (lógico)

### ✅ **Características de UI**

- **Tabla responsive** con paginación
- **Filtros avanzados** por canal y búsqueda
- **ToggleSwitch** para cambio rápido de estado
- **Modal de formulario** con validación
- **Confirmaciones** para operaciones críticas
- **Notificaciones** toast para feedback
- **Estados visuales** con ToggleSwitch intuitivo

## 🏗️ Estructura de Archivos

```
paginas/
├── paginas.component.ts      # Lógica del componente
├── paginas.component.html    # Template de la UI
├── paginas.component.scss    # Estilos personalizados
└── README.md                 # Esta documentación
```

## 🔧 Dependencias

### **Servicios**

- `PaginaService` - CRUD operations
- `MessageService` - Notificaciones toast
- `ConfirmationService` - Diálogos de confirmación

### **PrimeNG Modules**

- `TableModule` - Tabla de datos
- `ButtonModule` - Botones de acción
- `DialogModule` - Modal de formulario
- `ConfirmDialogModule` - Confirmaciones
- `ToastModule` - Notificaciones
- `TagModule` - Etiquetas de estado
- `SelectModule` - Selects de filtro
- `ToggleSwitchModule` - Switch de estado

## 🎨 Campos del Formulario

### **Crear Página**

```typescript
{
    nombre: string,  // Requerido, 3-100 caracteres
    estado: boolean  // Por defecto true (activo)
}
```

### **Editar Página**

```typescript
{
    id_pag: number,  // Requerido
    nombre: string,  // Requerido, 3-100 caracteres
    estado: 1 | 0   // Opcional
}
```

## 🔍 Estados y Filtros

### **Estados de Página**

- `1` - **Activo** (verde, success)
- `0` - **Inactivo** (rojo, danger)

### **Canales Disponibles**

- `WEB` - Páginas web
- `APP` - Páginas de aplicación

## 🚀 URL de Acceso

```
/adm-ecom/paginas
```

## 📋 Flujo de Operaciones

### **1. Listar Páginas**

- Carga automática al inicializar
- Paginación de 10 registros
- Estados de carga visuales

### **2. Crear Página**

1. Click en "Nueva Página"
2. Completar formulario (nombre)
3. Validación automática
4. Submit → API → Notificación → Recarga lista

### **3. Editar Página**

**Opción A - Edición Rápida:**

1. **Cambiar estado**: ToggleSwitch directo en tabla (confirmación para desactivar)
2. **Editar nombre**: Click en celda nombre → edición inline

**Opción B - Edición Completa:**

1. Click en botón editar (lápiz)
2. Modificar todos los campos en modal
3. Submit → API → Notificación → Recarga lista

### **4. Eliminar Página**

1. Click en botón eliminar (basura)
2. Confirmación con diálogo
3. Submit → API → Notificación → Recarga lista

## 🎯 Validaciones

### **Frontend**

- Nombre: requerido, 3-100 caracteres
- Formulario completo antes de submit

### **Backend**

- Validaciones del servicio `PaginaService`
- Manejo de errores con mensajes específicos

## 📱 Responsive Design

- **Desktop**: Layout completo con filtros en grid
- **Tablet/Mobile**: Filtros apilados, tabla responsive
- **Modal**: Adaptable al tamaño de pantalla

## 🎨 Tema Visual

- **Colores**: Basado en Tailwind + PrimeNG
- **Estados**: Verde (activo), Rojo (inactivo), Azul (app)
- **Animaciones**: Hover effects y transiciones suaves
- **Typography**: Jerarquía clara con títulos y subtítulos

## 🔗 Integración con API

### **Endpoint**: `/acatpag/v1`

### **Payloads**:

- **SL**: `{ action: "SL", usr, id_session }`
- **IN**: `{ action: "IN", nombre, usr, id_session }`
- **UP**: `{ action: "UP", id_pag, nombre?, usr, id_session }`
- **DL**: `{ action: "DL", id_pag, id_pagd, usr, id_session }`

## 🐛 Manejo de Errores

- **Errores de red**: Toast con mensaje genérico
- **Errores de validación**: Mensajes específicos por campo
- **Errores del backend**: Preservar mensajes originales
- **Estados de carga**: Indicadores visuales durante operaciones

## 🔄 Estados del Componente

```typescript
// Datos
paginas: Pagina[] = [];           // Lista de páginas
paginaSeleccionada: Pagina | null = null;  // Para edición

// Estados
loadingPaginas = false;           // Carga de lista
guardando = false;               // Operaciones de guardado
mostrarModal = false;            // Visibilidad del modal
esEdicion = false;               // Modo del modal

// Filtros
canalFiltroSeleccionado: string = '';
filtroEstado: number | null = null;
filtroBusqueda: string = '';
```

## 🎉 Resultado Final

Una página completa de gestión de páginas con:

- ✅ **UX moderna** y intuitiva
- ✅ **Filtro por canal** (WEB/APP) con botones visuales
- ✅ **ToggleSwitch** para cambios de estado rápidos
- ✅ **Edición inline** para nombres
- ✅ **Operaciones CRUD** completas
- ✅ **Validación robusta**
- ✅ **Feedback visual** constante
- ✅ **Responsive** y accesible
- ✅ **Integración perfecta** con el backend
