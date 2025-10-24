# 💳 TipoGateway Service

Servicio CRUD completo para la gestión de tipos de gateways de pagos.

## 📋 Descripción

El `TipoGatewayService` proporciona operaciones CRUD para gestionar los diferentes tipos de gateways de pago disponibles en el sistema.

## 🏗️ Modelo de Datos

### TipoGatewayItem
```typescript
interface TipoGatewayItem {
  id_tipogateway: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  configuracion?: any;
  fecha_creacion: string;
  fecha_actualizacion: string;
  id_usuario_creacion: number;
  id_usuario_actualizacion: number;
}
```

## 🔧 Operaciones CRUD

### 1. **GET** - Obtener Tipos de Gateway
```typescript
getTipoGateways(filters?: {
  activo?: boolean;
  nombre?: string;
}): Observable<TipoGatewayCrudResponse>
```

### 2. **POST** - Crear Tipo de Gateway
```typescript
createTipoGateway(tipogateway: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse>
```

### 3. **PUT** - Actualizar Tipo de Gateway
```typescript
updateTipoGateway(tipogateway: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse>
```

### 4. **DELETE** - Eliminar Tipo de Gateway
```typescript
deleteTipoGateway(id: number): Observable<TipoGatewayCrudSingleResponse>
```

### 5. **SAVE** - Guardar (Crear o Actualizar)
```typescript
saveTipoGateway(tipogateway: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse>
```

### 6. **GET BY ID** - Obtener por ID
```typescript
getTipoGatewayById(id: number): Observable<TipoGatewayCrudSingleResponse>
```

## 🚀 Funcionalidades Adicionales

### URLs Dinámicas
- **Endpoint ID 2:** Configuración dinámica de URLs
- **Base URL:** Obtenida del `ApiConfigService`

### Filtros Avanzados
- **Por estado:** `activo: boolean`
- **Por nombre:** `nombre: string`
- **Combinables:** Múltiples filtros simultáneos

### Validación Automática
- **Crear vs Actualizar:** Detecta automáticamente si es nuevo o existente
- **Campos requeridos:** Validación de campos obligatorios
- **Tipos de datos:** Validación de tipos TypeScript

## 📝 Ejemplos de Uso

### Obtener todos los tipos de gateway activos
```typescript
this.tipoGatewayService.getTipoGateways({ activo: true })
  .subscribe(response => {
    console.log('Tipos de gateway activos:', response.data);
  });
```

### Crear un nuevo tipo de gateway
```typescript
const nuevoTipoGateway: TipoGatewayFormItem = {
  nombre: 'PayPal',
  descripcion: 'Gateway de PayPal',
  activo: true,
  configuracion: { apiKey: 'xxx', secret: 'yyy' }
};

this.tipoGatewayService.createTipoGateway(nuevoTipoGateway)
  .subscribe(response => {
    console.log('Tipo de gateway creado:', response.data);
  });
```

### Actualizar un tipo de gateway existente
```typescript
const tipoGatewayActualizado: TipoGatewayFormItem = {
  id_tipogateway: 1,
  nombre: 'PayPal Pro',
  descripcion: 'Gateway de PayPal Pro',
  activo: true,
  configuracion: { apiKey: 'xxx', secret: 'yyy' }
};

this.tipoGatewayService.updateTipoGateway(tipoGatewayActualizado)
  .subscribe(response => {
    console.log('Tipo de gateway actualizado:', response.data);
  });
```

### Guardar automáticamente (crear o actualizar)
```typescript
this.tipoGatewayService.saveTipoGateway(tipoGateway)
  .subscribe(response => {
    console.log('Tipo de gateway guardado:', response.data);
  });
```

## 🔗 Dependencias

- `@angular/core`
- `@angular/common/http`
- `rxjs`
- `ApiConfigService`

## 📊 Respuestas de API

### Respuesta de Lista
```typescript
interface TipoGatewayCrudResponse {
  statuscode: number;
  mensaje: string;
  data: TipoGatewayItem[];
}
```

### Respuesta Individual
```typescript
interface TipoGatewayCrudSingleResponse {
  statuscode: number;
  mensaje: string;
  data: TipoGatewayItem;
}
```

## 🛠️ Configuración

El servicio se configura automáticamente usando el `ApiConfigService` para obtener la URL base y el endpoint correcto.

## 📈 Rendimiento

- **Caché:** Implementado a nivel de HTTP
- **Filtros:** Optimizados para consultas eficientes
- **Paginación:** Soporte para paginación automática