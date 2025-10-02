# 💳 Servicio de Tipo Gateway

## 📋 Descripción

Servicio CRUD completo para la gestión del catálogo de gateways de pagos (tipos de gateway). Implementa todas las operaciones CRUD siguiendo el patrón estándar del proyecto.

## 🎯 Endpoint Utilizado

- **ID**: 23
- **Descripción**: Catálogo de Gateways de Pagos
- **URL**: Se obtiene dinámicamente desde `ApiConfigService`

## 🏗️ Modelo de Datos

```typescript
interface TipoGatewayItem {
    id: number;
    nombre: string;           // Nombre del gateway (ej: "OpenPay")
    clave: string;           // Clave identificadora (ej: "VT")
    tipo_deposito: number;   // Tipo de depósito (ej: 30)
    estado: string;          // Estado (ej: "A" = Activo)
    fecha_mov: string;       // Fecha de movimiento
    swActivo: number;        // Switch activo (0/1)
    idj: number | null;      // ID adicional (opcional)
    sw: string | null;       // Switch adicional (opcional)
}
```

## 🚀 Características Implementadas

### ✅ Operaciones CRUD Completas

- **GET** - `getTipoGateways()`: Obtener todos los tipos de gateway
- **GET** - `getTipoGatewayById(id)`: Obtener un tipo específico por ID
- **POST** - `createTipoGateway(item)`: Crear nuevo tipo de gateway
- **PUT** - `updateTipoGateway(item)`: Actualizar tipo existente
- **DELETE** - `deleteTipoGateway(id)`: Eliminar tipo de gateway
- **SAVE** - `saveTipoGateway(item)`: Auto-detecta crear/actualizar

### 🔧 Funcionalidades Adicionales

- **URLs Dinámicas**: Uso de `ApiConfigService` con endpoint ID 23
- **Gestión de Sesión**: Integración automática con `SessionService`
- **Manejo de Errores**: Tratamiento robusto de errores HTTP
- **Logging Detallado**: Logs completos para debugging
- **Validaciones**: Validación de datos requeridos
- **Método Debug**: `debugService()` para verificar configuración

## 📝 Uso del Servicio

### 📋 Obtener Lista de Tipos de Gateway

```typescript
import { TipoGatewayService } from '@/features/tipogateway/services/tipogateway.service';

constructor(private tipoGatewayService: TipoGatewayService) {}

// Obtener todos los tipos
getTiposGateway() {
  this.tipoGatewayService.getTipoGateways().subscribe({
    next: (response) => {
      console.log('Tipos de gateway:', response.data);
      this.tiposGateway = response.data;
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}
```

### ➕ Crear Nuevo Tipo de Gateway

```typescript
createTipoGateway() {
  const nuevoTipo: TipoGatewayFormItem = {
    nombre: 'PayPal',
    clave: 'PP',
    tipo_deposito: 20,
    estado: 'A',
    swActivo: 1,
    idj: null,
    sw: null
  };

  this.tipoGatewayService.createTipoGateway(nuevoTipo).subscribe({
    next: (response) => {
      console.log('Tipo creado:', response.data);
      this.refreshList();
    },
    error: (error) => {
      console.error('Error al crear:', error);
    }
  });
}
```

### ✏️ Actualizar Tipo Existente

```typescript
updateTipoGateway(id: number) {
  const tipoActualizado: TipoGatewayFormItem = {
    id: id,
    nombre: 'OpenPay Updated',
    clave: 'VT',
    tipo_deposito: 35,
    estado: 'A',
    swActivo: 1
  };

  this.tipoGatewayService.updateTipoGateway(tipoActualizado).subscribe({
    next: (response) => {
      console.log('Tipo actualizado:', response.data);
      this.refreshList();
    },
    error: (error) => {
      console.error('Error al actualizar:', error);
    }
  });
}
```

### 🗑️ Eliminar Tipo de Gateway

```typescript
deleteTipoGateway(id: number) {
  if (confirm('¿Está seguro de eliminar este tipo de gateway?')) {
    this.tipoGatewayService.deleteTipoGateway(id).subscribe({
      next: (response) => {
        console.log('Tipo eliminado exitosamente');
        this.refreshList();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
      }
    });
  }
}
```

### 💾 Auto-Save (Crear o Actualizar)

```typescript
saveTipoGateway(formData: TipoGatewayFormItem) {
  // El servicio detecta automáticamente si crear o actualizar
  this.tipoGatewayService.saveTipoGateway(formData).subscribe({
    next: (response) => {
      const action = formData.id ? 'actualizado' : 'creado';
      console.log(`Tipo ${action}:`, response.data);
      this.refreshList();
    },
    error: (error) => {
      console.error('Error al guardar:', error);
    }
  });
}
```

## 🔧 Configuración y Debug

### Verificar Configuración del Servicio

```typescript
// En consola del navegador o en código
this.tipoGatewayService.debugService();
```

### Requisitos Previos

1. **Endpoint Configurado**: El endpoint con ID 23 debe estar configurado en `ApiConfigService`
2. **Sesión Activa**: Usuario debe estar logueado para obtener `usr` e `id_session`
3. **Permisos**: Usuario debe tener permisos para operaciones CRUD

## 📊 Respuestas de la API

### Lista de Tipos (GET)
```json
{
  "statuscode": 200,
  "mensaje": "ok",
  "data": [
    {
      "id": 1,
      "nombre": "OpenPay",
      "clave": "VT",
      "tipo_deposito": 30,
      "estado": "A",
      "fecha_mov": "2024-04-23T10:53:02.050",
      "swActivo": 0,
      "idj": null,
      "sw": null
    }
  ]
}
```

### Operación Individual (POST/PUT/DELETE)
```json
{
  "statuscode": 200,
  "mensaje": "Operación exitosa",
  "data": {
    "id": 1,
    "nombre": "OpenPay",
    "clave": "VT",
    // ... resto de campos
  }
}
```

## 🔄 Integración con Otros Servicios

- **ApiConfigService**: Obtención dinámica de URLs
- **SessionService**: Datos de sesión para autenticación
- **HttpClient**: Comunicación HTTP con la API

## 🎯 Estados y Códigos

- **Estado "A"**: Activo
- **Estado "I"**: Inactivo
- **swActivo 1**: Habilitado
- **swActivo 0**: Deshabilitado

## 🚨 Manejo de Errores

El servicio incluye manejo robusto de errores:
- Validación de datos requeridos
- Manejo de errores HTTP
- Logging detallado de errores
- Mensajes de error descriptivos
