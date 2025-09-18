# Módulo de Sucursales (SUC)

Sistema para gestión de sucursales y tiendas del proyecto.

## 📋 Descripción

Este módulo maneja toda la información relacionada con las sucursales, incluyendo:
- Datos básicos de sucursal (dirección, coordenadas, estado)
- Configuraciones de APIs externas (VTEX, Rappi, Uber)
- Información de conectividad y seguridad
- Relaciones con ciudades y zonas geográficas

## 🏗️ Estructura

```
features/suc/
├── models/
│   ├── suc.interface.ts      # Interfaces y tipos de datos
│   └── index.ts             # Exportaciones de modelos
├── services/
│   ├── suc.service.ts       # Servicio principal de sucursales
│   └── index.ts            # Exportaciones de servicios
└── README.md               # Esta documentación
```

## 📊 Modelo de Datos

### Sucursal Principal
```typescript
interface Sucursal {
    sucursal: number;        // ID único de sucursal
    tienda: string;          // Nombre de la tienda
    direccion: string;       // Dirección completa
    latitud: string;         // Coordenada GPS
    longitud: string;        // Coordenada GPS
    estado: string;          // 'A' (activo) | 'I' (inactivo)
    // ... más campos
}
```

### Respuesta del Backend
```json
{
    "statuscode": 200,
    "mensaje": "ok",
    "data": [
        {
            "sucursal": 5,
            "tienda": "RIO",
            "direccion": "BLVD. CUAUHTEMOC Y PASEO DE LOS HEROES #2150 ZONA URBANA RIO TIJUANA",
            "latitud": "32.523702",
            "longitud": "-117.017570",
            "estado": "A",
            // ... más campos
        }
    ]
}
```

## 🔧 Configuración de API

### URL Base
- **Endpoint**: `/api/admsuc/v1/15`
- **Método**: POST con `action` en el body
- **Autenticación**: Datos de sesión obligatorios

### Acciones Disponibles
- `'SL'`: Listar/Consultar sucursales
- `'IN'`: Insertar nueva sucursal
- `'UP'`: Actualizar sucursal existente
- `'DL'`: Eliminar sucursal
- `'ESTADOS'`: Catálogo de estados
- `'CIUDADES'`: Catálogo de ciudades
- `'ZONAS'`: Catálogo de zonas geográficas
- `'STATS'`: Estadísticas de sucursales
- `'NEARBY'`: Búsqueda por proximidad

## 🚀 Uso del Servicio

### Inyección del Servicio
```typescript
import { SucService } from '@features/suc';

constructor(private sucService: SucService) {}
```

### Obtener Todas las Sucursales
```typescript
this.sucService.getAllSucursales().subscribe({
    next: (response) => {
        console.log('Sucursales:', response.data);
    },
    error: (error) => {
        console.error('Error:', error.mensaje);
    }
});
```

### Crear Nueva Sucursal
```typescript
const nuevaSucursal = {
    tienda: 'Nueva Tienda',
    direccion: 'Dirección completa',
    latitud: '32.523702',
    longitud: '-117.017570',
    estado: 'A',
    // ... más campos
};

this.sucService.createSucursal(nuevaSucursal).subscribe({
    next: (response) => {
        console.log('Sucursal creada:', response.data);
    }
});
```

### Actualizar Sucursal
```typescript
const sucursalActualizada = {
    sucursal: 5,  // ID de la sucursal
    tienda: 'Tienda Actualizada',
    // ... campos a actualizar
};

this.sucService.updateSucursal(sucursalActualizada).subscribe({
    next: (response) => {
        console.log('Sucursal actualizada:', response.data);
    }
});
```

### Búsqueda por Ciudad
```typescript
this.sucService.getSucursalesByCiudad(4).subscribe({
    next: (response) => {
        console.log('Sucursales en ciudad 4:', response.data);
    }
});
```

## 📋 Campos Importantes

### Información Básica
- `sucursal`: ID único de la sucursal
- `tienda`: Nombre comercial
- `direccion`: Dirección física completa
- `latitud/longitud`: Coordenadas GPS

### Estado y Configuración
- `estado`: 'A' (activo) | 'I' (inactivo)
- `prioridad`: Nivel de prioridad (1-10)
- `zona_geografica`: ID de zona geográfica

### Integraciones Externas
- **VTEX**: `appkey`, `apptoken`, `sellerid`
- **Rappi**: `swRappi` (1=activado, 2=desactivado)
- **Uber**: `swUber` (1=activado, 2=desactivado)

### Información Técnica
- `ip`: Dirección IP de la sucursal
- `ip_serv`: IP del servidor
- `telefono`: Número de contacto
- `indexApp`: Índice para Elasticsearch

## 🎯 Casos de Uso

### 1. Gestión de Sucursales
- CRUD completo de sucursales
- Activación/desactivación
- Actualización de coordenadas GPS

### 2. Integraciones con Delivery
- Control de switches Rappi/Uber
- Configuración de tokens de API
- Gestión de puntos de recogida

### 3. Búsqueda y Filtros
- Búsqueda por proximidad GPS
- Filtrado por ciudad/zona
- Búsqueda por nombre de tienda

### 4. Reportes y Estadísticas
- Conteo por estado/ciudad
- Sucursales activas vs inactivas
- Distribución geográfica

## ⚠️ Consideraciones Importantes

### 1. Datos de Sesión Obligatorios
Todos los requests requieren datos de sesión:
```typescript
{
    usr: 'usuario_actual',
    id_session: 12345
}
```

### 2. Manejo de Errores
Los errores del backend incluyen:
```typescript
{
    statuscode: 400,
    mensaje: "Descripción del error específico",
    originalError: {...}
}
```

### 3. Parsing de Datos
El servicio maneja automáticamente:
- JSON strings anidados
- Arrays de respuesta del backend
- Limpieza de caracteres de escape

### 4. Coordenadas GPS
- Formato: strings decimales
- Ejemplo: `"32.523702"`, `"-117.017570"`

## 🔍 Debugging

El servicio incluye logs detallados para debugging:
- URLs generadas
- Body enviado al backend
- Respuesta cruda del backend
- Estructura de datos parseados
- Mensajes de error específicos

## 📚 Referencias

- **API Backend**: Endpoint `/api/admsuc/v1/15`
- **Base de Datos**: Tabla principal `sucursales`
- **Coordenadas**: Formato WGS84 decimal
- **Estados**: 'A' (activo), 'I' (inactivo)
