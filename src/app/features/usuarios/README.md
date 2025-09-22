# 🧑‍💼 Módulo de Usuarios - AECOM-F

## 📋 **Descripción**

Módulo para la gestión completa de usuarios del sistema AECOM-F. Implementa operaciones CRUD, búsqueda, filtrado y paginación siguiendo los estándares del proyecto.

## 🏗️ **Estructura del Módulo**

```
src/app/features/usuarios/
├── models/
│   ├── index.ts                 # Exportaciones centralizadas
│   ├── usuario.interface.ts     # Interfaces TypeScript
│   └── usuario.constants.ts     # Constantes y configuración
├── services/
│   └── usuario.service.ts       # Servicio principal
└── README.md                    # Esta documentación
```

## 🔧 **Servicio: UsuarioService**

### **Endpoint Base**
- **URL:** `http://localhost:3000/api/admusr/v1`
- **Configurable:** Sí, mediante `setBaseUrl()`

### **Métodos CRUD Estándar**

#### **GET - Consulta de Usuarios**
```typescript
// Obtener todos los usuarios
getUsuarios(): Observable<Usuario[]>

// Obtener usuario específico por ID
getUsuarios(id: number): Observable<Usuario[]>

// Obtener usuario único por ID
getUsuarioById(id: number): Observable<Usuario | null>
```

#### **POST - Crear Usuario**
```typescript
createUsuario(usuario: UsuarioForm): Observable<ApiResponse<Usuario>>
```

#### **PATCH - Actualizar Usuario (Parcial)**
```typescript
updateUsuario(id: number, usuario: Partial<UsuarioForm>): Observable<ApiResponse<Usuario>>
```

#### **PUT - Actualizar Usuario (Completo)**
```typescript
updateUsuarioCompleto(id: number, usuario: UsuarioForm): Observable<ApiResponse<Usuario>>
```

#### **DELETE - Eliminar Usuario**
```typescript
deleteUsuario(id: number): Observable<ApiResponse<Usuario>>
```

### **Método POST Utilitario (Universal)**

#### **executeAction() - Operaciones con Acción Específica**
```typescript
// SL -> Consulta
executeAction('SL', { filters?: UsuarioFilters }): Observable<ApiResponse<Usuario>>

// IN -> Insertar
executeAction('IN', { data: UsuarioForm }): Observable<ApiResponse<Usuario>>

// UP -> Actualizar
executeAction('UP', { id: number, data: Partial<UsuarioForm> }): Observable<ApiResponse<Usuario>>

// DL -> Eliminar
executeAction('DL', { id: number }): Observable<ApiResponse<Usuario>>
```

### **Métodos de Utilidad**

#### **Búsqueda y Filtrado**
```typescript
// Búsqueda por nombre, email o número de usuario
searchUsuarios(query: string): Observable<Usuario[]>

// Filtrar por estado
getUsuariosPorEstado(estado: number): Observable<Usuario[]>

// Usuarios activos (estado = 1)
getUsuariosActivos(): Observable<Usuario[]>

// Usuarios inactivos (estado = 0)
getUsuariosInactivos(): Observable<Usuario[]>
```

#### **Paginación y Ordenamiento**
```typescript
getUsuariosPaginados(pagination: UsuarioPagination): Observable<{ usuarios: Usuario[], total: number }>
```

#### **Conectividad**
```typescript
testConnection(): Observable<boolean>
```

## 📊 **Interfaces TypeScript**

### **Usuario**
```typescript
interface Usuario {
  id?: number;
  usuario: number;           // Número de usuario
  email: string;             // Email del usuario
  nombre: string;            // Nombre completo
  estado: number;            // Estado (0=Inactivo, 1=Activo, 2=Suspendido, 3=Bloqueado)
  logins: number;            // Número de logins exitosos
  intentos: number;          // Número de intentos fallidos
  fecha_login: string | null; // Última fecha de login
  fecha_intento: string | null; // Última fecha de intento fallido
  fecha_m: string;           // Fecha de última modificación
  fecha_a: string;           // Fecha de creación
  fecha: string;             // Fecha actual
  id_session: number;        // ID de sesión actual
  logout: number;            // Estado de logout (0=Logout, 1=Login)
}
```

### **ApiResponse**
```typescript
interface ApiResponse<T> {
  statuscode: number;        // Código de respuesta HTTP
  mensaje: string;           // Mensaje descriptivo
  data: T[];                 // Datos de la respuesta
}
```

### **UsuarioForm**
```typescript
interface UsuarioForm {
  id?: number;
  usuario: number;
  email: string;
  nombre: string;
  estado: number;
  // Campos opcionales para formularios
}
```

## ⚙️ **Configuración**

### **Constantes de API**
```typescript
import { USUARIO_API_CONFIG } from './models';

// Endpoints
USUARIO_API_CONFIG.ENDPOINTS.USUARIOS

// Estados
USUARIO_API_CONFIG.ESTADOS.ACTIVO
USUARIO_API_CONFIG.ESTADOS.INACTIVO

// Mensajes de validación
USUARIO_API_CONFIG.VALIDATION_MESSAGES.REQUIRED_FIELDS
```

### **Configuración de Tabla**
```typescript
import { USUARIO_TABLE_CONFIG } from './models';

// Columnas configuradas
USUARIO_TABLE_CONFIG.COLUMNS

// Opciones de paginación
USUARIO_TABLE_CONFIG.PAGINATION
```

## 🚀 **Ejemplos de Uso**

### **1. Inyectar el Servicio**
```typescript
import { UsuarioService } from './services/usuario.service';

constructor(private usuarioService: UsuarioService) {}
```

### **2. Obtener Todos los Usuarios**
```typescript
this.usuarioService.getUsuarios().subscribe({
  next: (usuarios) => {
    console.log('Usuarios cargados:', usuarios);
  },
  error: (error) => {
    console.error('Error al cargar usuarios:', error);
  }
});
```

### **3. Crear Nuevo Usuario**
```typescript
const nuevoUsuario: UsuarioForm = {
  usuario: 1002,
  email: 'nuevo@empresa.com',
  nombre: 'Nuevo Usuario',
  estado: 1
};

this.usuarioService.createUsuario(nuevoUsuario).subscribe({
  next: (response) => {
    if (response.statuscode === 200) {
      console.log('Usuario creado exitosamente');
    }
  },
  error: (error) => {
    console.error('Error al crear usuario:', error);
  }
});
```

### **4. Usar Método Utilitario**
```typescript
// Consulta con filtros
this.usuarioService.executeAction('SL', { 
  filters: { estado: 1 } 
}).subscribe({
  next: (response) => {
    console.log('Usuarios activos:', response.data);
  }
});

// Actualización
this.usuarioService.executeAction('UP', {
  id: 1,
  data: { estado: 0 }
}).subscribe({
  next: (response) => {
    console.log('Usuario actualizado');
  }
});
```

### **5. Búsqueda y Filtrado**
```typescript
// Búsqueda por texto
this.usuarioService.searchUsuarios('admin').subscribe({
  next: (usuarios) => {
    console.log('Usuarios encontrados:', usuarios);
  }
});

// Usuarios activos
this.usuarioService.getUsuariosActivos().subscribe({
  next: (usuarios) => {
    console.log('Usuarios activos:', usuarios);
  }
});
```

## 🔍 **Manejo de Errores**

El servicio incluye manejo centralizado de errores:

```typescript
// Los errores se capturan automáticamente
// y se transforman en mensajes legibles
catchError(this.handleError)
```

**Tipos de errores manejados:**
- Errores de cliente (ErrorEvent)
- Errores de servidor (HTTP status codes)
- Errores personalizados
- Errores de red

## 📝 **Notas de Implementación**

### **Patrones Seguidos**
- ✅ **Consistencia** con el patrón del proyecto
- ✅ **Reutilización** de interfaces comunes
- ✅ **Manejo de errores** centralizado
- ✅ **Logging** detallado para debugging
- ✅ **TypeScript estricto** para type safety

### **Integración con el Sistema**
- ✅ **Configuración de URL** centralizada
- ✅ **Headers HTTP** estándar
- ✅ **Respuestas API** consistentes
- ✅ **Manejo de observables** con RxJS

## 🔮 **Próximos Pasos**

1. **Componente de Listado** - Tabla con PrimeNG
2. **Formularios de Edición** - Modales para CRUD
3. **Validaciones Avanzadas** - Validadores personalizados
4. **Filtros Avanzados** - Búsqueda por múltiples criterios
5. **Exportación de Datos** - CSV, Excel, PDF

---

**Última actualización:** $(date)  
**Versión:** 1.0.0  
**Estado:** ✅ **SERVICIO COMPLETO Y FUNCIONAL**
