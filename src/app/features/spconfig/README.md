# ⚙️ Módulo de Configuración de Stored Procedures - AECOM-F

## 📋 **Descripción**

Módulo para la configuración y gestión de Stored Procedures del sistema AECOM-F. Permite configurar SPs para transformación automática a controladores backend, incluyendo parámetros, rutas de API y métodos HTTP.

## 🏗️ **Estructura del Módulo**

```
src/app/features/spconfig/
├── models/
│   ├── index.ts                 # Exportaciones centralizadas
│   ├── spconfig.interface.ts    # Interfaces TypeScript
│   └── spconfig.constants.ts    # Constantes y configuración
├── services/
│   └── spconfig.service.ts      # Servicio principal
└── README.md                    # Esta documentación
```

## 🔧 **Servicio: SPConfigService**

### **Endpoint Base**
- **URL:** `http://localhost:3000/api/spconfig/v1/1`
- **Configurable:** Sí, mediante `setBaseUrl()`

### **Métodos CRUD Estándar**

#### **GET - Consulta de Configuraciones**
```typescript
// Obtener todas las configuraciones
getSPConfigs(): Observable<SPConfig[]>

// Obtener configuración específica por ID
getSPConfigs(id: number): Observable<SPConfig[]>

// Obtener configuración única por ID
getSPConfigById(id: number): Observable<SPConfig | null>
```

#### **POST - Crear Configuración**
```typescript
createSPConfig(config: SPConfigForm): Observable<SPConfigApiResponse>
```

#### **PATCH - Actualizar Configuración (Parcial)**
```typescript
updateSPConfig(id: number, config: Partial<SPConfigForm>): Observable<SPConfigApiResponse>
```

#### **PUT - Actualizar Configuración (Completo)**
```typescript
updateSPConfigCompleto(id: number, config: SPConfigForm): Observable<SPConfigApiResponse>
```

#### **DELETE - Eliminar Configuración**
```typescript
deleteSPConfig(id: number): Observable<SPConfigApiResponse>
```

### **Método POST Utilitario (Universal)**

#### **executeAction() - Operaciones con Acción Específica**
```typescript
// SL -> consulta
executeAction('SL', { filters?: SPConfigFilters }): Observable<SPConfigApiResponse>

// IN -> insertar
executeAction('IN', { data: SPConfigForm }): Observable<SPConfigApiResponse>

// UP -> actualizar
executeAction('UP', { id: number, data: Partial<SPConfigForm> }): Observable<SPConfigApiResponse>

// DL -> eliminar
executeAction('DL', { id: number }): Observable<SPConfigApiResponse>
```

### **Métodos Específicos para SPs**

#### **Filtrado por Criterios**
```typescript
// Por base de datos
getSPsPorBaseDatos(db: string): Observable<SPConfig[]>

// Por estado
getSPsPorEstado(estado: string): Observable<SPConfig[]>

// Por método HTTP
getSPsPorMetodo(metodo: string): Observable<SPConfig[]>

// Por ruta
getSPsPorRuta(ruta: string): Observable<SPConfig[]>
```

#### **Validación y Parseo**
```typescript
// Validar parámetros JSON
validateSPParams(params: string): boolean

// Parsear parámetros JSON
parseSPParams(params: string): SPParam[]
```

#### **Generación de Controladores**
```typescript
// Generar configuración de API
generateAPIConfig(spConfig: SPConfig): APIConfig

// Generar configuración de controlador
generateControllerConfig(spConfig: SPConfig): ControllerConfig

// Generar código de controlador
generateControllerCode(spConfig: SPConfig): string
```

#### **Estadísticas y Reportes**
```typescript
// Estadísticas completas
getEstadisticasSPs(): Observable<{...}>

// Exportar a JSON
exportSPConfigsToJSON(): Observable<string>

// Importar desde JSON
importSPConfigsFromJSON(jsonData: string): Observable<SPConfig[]>
```

## 📊 **Interfaces TypeScript**

### **SPConfig**
```typescript
interface SPConfig {
  id_sp: number;           // ID del Stored Procedure
  nombre: string;          // Nombre del SP
  db: string;              // Base de datos (ec, sqlserver, mysql, etc.)
  params: string;          // Parámetros en formato JSON string
  estado: string;          // Estado (A=Activo, I=Inactivo, S=Suspendido, B=Bloqueado, D=En Desarrollo)
  swApi: number;           // Switch para habilitar API (1=Habilitado, 0=Deshabilitado)
  ruta: string;            // Ruta de la API
  apiName: string;         // Nombre de la API
  metodo: string;          // Método HTTP (GET, POST, PUT, PATCH, DELETE)
  keyId: string;           // ID de clave para operaciones
  fecha_m: string;         // Fecha de última modificación
}
```

### **SPParam**
```typescript
interface SPParam {
  ParamName: string;       // Nombre del parámetro (ej: @JSON)
  ParamType: string;       // Tipo de dato (ej: nvarchar, int, datetime)
  MaxLength: number;       // Longitud máxima (-1 para MAX)
  IsOutput: boolean;       // Si es parámetro de salida
  DefaultValue?: string;   // Valor por defecto
  IsNullable?: boolean;    // Si permite valores nulos
}
```

### **APIConfig**
```typescript
interface APIConfig {
  ruta: string;            // Ruta de la API
  apiName: string;         // Nombre de la API
  metodo: string;          // Método HTTP
  keyId: string;           // ID de clave
  swApi: number;           // Switch de API
}
```

## ⚙️ **Configuración**

### **Estados de SP**
```typescript
import { SPCONFIG_API_CONFIG } from './models';

// Estados disponibles
SPCONFIG_API_CONFIG.ESTADOS.ACTIVO        // 'A'
SPCONFIG_API_CONFIG.ESTADOS.INACTIVO      // 'I'
SPCONFIG_API_CONFIG.ESTADOS.SUSPENDIDO    // 'S'
SPCONFIG_API_CONFIG.ESTADOS.BLOQUEADO     // 'B'
SPCONFIG_API_CONFIG.ESTADOS.EN_DESARROLLO // 'D'
```

### **Tipos de Base de Datos**
```typescript
// Tipos soportados
SPCONFIG_API_CONFIG.DATABASE_TYPES.EC          // 'ec'
SPCONFIG_API_CONFIG.DATABASE_TYPES.SQLSERVER   // 'sqlserver'
SPCONFIG_API_CONFIG.DATABASE_TYPES.MYSQL       // 'mysql'
SPCONFIG_API_CONFIG.DATABASE_TYPES.POSTGRESQL  // 'postgresql'
SPCONFIG_API_CONFIG.DATABASE_TYPES.ORACLE      // 'oracle'
```

### **Métodos HTTP**
```typescript
// Métodos soportados
SPCONFIG_API_CONFIG.HTTP_METHODS.GET     // 'GET'
SPCONFIG_API_CONFIG.HTTP_METHODS.POST    // 'POST'
SPCONFIG_API_CONFIG.HTTP_METHODS.PUT     // 'PUT'
SPCONFIG_API_CONFIG.HTTP_METHODS.PATCH   // 'PATCH'
SPCONFIG_API_CONFIG.HTTP_METHODS.DELETE  // 'DELETE'
```

## 🚀 **Ejemplos de Uso**

### **1. Inyectar el Servicio**
```typescript
import { SPConfigService } from './services/spconfig.service';

constructor(private spConfigService: SPConfigService) {}
```

### **2. Obtener Todas las Configuraciones**
```typescript
this.spConfigService.getSPConfigs().subscribe({
  next: (configs) => {
    console.log('SPs configurados:', configs);
  },
  error: (error) => {
    console.error('Error al cargar SPs:', error);
  }
});
```

### **3. Crear Nueva Configuración**
```typescript
const nuevaConfig: SPConfigForm = {
  nombre: 'ADM_USUARIO_100',
  db: 'ec',
  params: '[{"ParamName":"@JSON","ParamType":"nvarchar","MaxLength":-1,"IsOutput":false}]',
  estado: 'A',
  swApi: 1,
  ruta: 'adminUsr',
  apiName: 'usuario',
  metodo: 'POST',
  keyId: 'id_usuario'
};

this.spConfigService.createSPConfig(nuevaConfig).subscribe({
  next: (response) => {
    if (response.statusCode === 200) {
      console.log('SP configurado exitosamente');
    }
  },
  error: (error) => {
    console.error('Error al configurar SP:', error);
  }
});
```

### **4. Generar Controlador**
```typescript
this.spConfigService.getSPConfigById(1).subscribe({
  next: (spConfig) => {
    if (spConfig) {
      const controllerCode = this.spConfigService.generateControllerCode(spConfig);
      console.log('Código del controlador:', controllerCode);
    }
  }
});
```

### **5. Filtrar por Base de Datos**
```typescript
this.spConfigService.getSPsPorBaseDatos('ec').subscribe({
  next: (sps) => {
    console.log('SPs de EC Database:', sps);
  }
});
```

### **6. Obtener Estadísticas**
```typescript
this.spConfigService.getEstadisticasSPs().subscribe({
  next: (stats) => {
    console.log('Total de SPs:', stats.total);
    console.log('SPs activos:', stats.activos);
    console.log('SPs por base de datos:', stats.porBaseDatos);
  }
});
```

## 🔍 **Validaciones**

### **Parámetros JSON**
```typescript
// Validar formato de parámetros
const params = '[{"ParamName":"@JSON","ParamType":"nvarchar","MaxLength":-1,"IsOutput":false}]';
const isValid = this.spConfigService.validateSPParams(params);

if (isValid) {
  const parsedParams = this.spConfigService.parseSPParams(params);
  console.log('Parámetros parseados:', parsedParams);
}
```

### **Verificar Duplicados**
```typescript
// Verificar si existe SP con el mismo nombre
this.spConfigService.checkSPExists('ADM_ROL_100').subscribe({
  next: (exists) => {
    if (exists) {
      console.log('Ya existe un SP con ese nombre');
    } else {
      console.log('Nombre disponible');
    }
  }
});
```

## 📝 **Plantillas de Parámetros**

### **Parámetro JSON Estándar**
```typescript
import { SPCONFIG_PARAM_TEMPLATES } from './models';

const jsonParam = SPCONFIG_PARAM_TEMPLATES.JSON_PARAM;
// {
//   ParamName: '@JSON',
//   ParamType: 'nvarchar',
//   MaxLength: -1,
//   IsOutput: false,
//   IsNullable: true
// }
```

### **Parámetro de ID**
```typescript
const idParam = SPCONFIG_PARAM_TEMPLATES.ID_PARAM;
// {
//   ParamName: '@ID',
//   ParamType: 'int',
//   MaxLength: 4,
//   IsOutput: false,
//   IsNullable: false
// }
```

## 🔮 **Funcionalidades Futuras**

1. **Generación Automática de Controladores** - Crear archivos .ts automáticamente
2. **Validación de Sintaxis SQL** - Verificar sintaxis de SPs
3. **Testing de SPs** - Pruebas unitarias automáticas
4. **Documentación Automática** - Generar docs desde configuración
5. **Deployment Automático** - Desplegar controladores al backend

## 📚 **Casos de Uso**

### **Configuración de SP para Usuarios**
```typescript
// SP para gestión de usuarios
const userSPConfig: SPConfigForm = {
  nombre: 'ADM_USUARIO_CRUD',
  db: 'ec',
  params: JSON.stringify([
    { ParamName: '@ACTION', ParamType: 'varchar', MaxLength: 2, IsOutput: false },
    { ParamName: '@JSON', ParamType: 'nvarchar', MaxLength: -1, IsOutput: false }
  ]),
  estado: 'A',
  swApi: 1,
  ruta: 'adminUsr',
  apiName: 'usuario',
  metodo: 'POST',
  keyId: 'id_usuario'
};
```

### **Configuración de SP para Roles**
```typescript
// SP para gestión de roles
const roleSPConfig: SPConfigForm = {
  nombre: 'ADM_ROL_CRUD',
  db: 'ec',
  params: JSON.stringify([
    { ParamName: '@ACTION', ParamType: 'varchar', MaxLength: 2, IsOutput: false },
    { ParamName: '@JSON', ParamType: 'nvarchar', MaxLength: -1, IsOutput: false }
  ]),
  estado: 'A',
  swApi: 1,
  ruta: 'adminUsr',
  apiName: 'rol',
  metodo: 'POST',
  keyId: 'id_rol'
};
```

---

**Última actualización:** $(date)  
**Versión:** 1.0.0  
**Estado:** ✅ **SERVICIO COMPLETO Y FUNCIONAL**
