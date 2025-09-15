# 📋 ESPECIFICACIONES DE SERVICIOS CRUD

## 🎯 **PROPÓSITO**
Esta guía documenta todas las mejores prácticas, patrones y consideraciones para implementar servicios que se conectan al backend vía HTTP, basándose en el servicio `MenuService` implementado y optimizado.

---

## 🚨 **MANEJO DE ERRORES DEL BACKEND**

### **⚠️ PROBLEMA IDENTIFICADO**
El backend **NO** lanza excepciones HTTP tradicionales, sino que devuelve respuestas normales con `statuscode` y `mensaje` indicando errores:

```json
// ❌ Respuesta de ERROR del backend (NO es una excepción HTTP)
[{
  "statuscode": 400,
  "mensaje": "El concepto ya existe en la base de datos",
  "data": null
}]

// ✅ Respuesta de ÉXITO del backend
[{
  "statuscode": 200,
  "mensaje": "Concepto creado correctamente",
  "data": { "id_c": 123, "clave": "ABC", ... }
}]
```

### **✅ SOLUCIÓN OBLIGATORIA**
**TODOS** los servicios deben verificar `statuscode !== 200` y lanzar errores manualmente:

#### **1. Patrón para Respuestas Array**
```typescript
if (Array.isArray(response) && response.length > 0) {
    const firstItem = response[0];

    // ⚠️ CRÍTICO: Verificar errores del backend
    if (firstItem.statuscode && firstItem.statuscode !== 200) {
        console.log('❌ Backend devolvió error en array:', firstItem);
        throw new Error(firstItem.mensaje || 'Error del servidor');
    }

    return {
        statuscode: firstItem.statuscode || 200,
        mensaje: firstItem.mensaje || 'Operación exitosa',
        data: firstItem.data
    };
}
```

#### **2. Patrón para Respuestas Directas**
```typescript
// Verificar error en respuesta directa
if (response.statuscode && response.statuscode !== 200) {
    console.log('❌ Backend devolvió error directo:', response);
    throw new Error(response.mensaje || 'Error del servidor');
}
```

#### **3. Manejo de Errores en Componentes**
```typescript
this.service.operation(data).subscribe({
    next: (response) => {
        // ✅ Éxito - response.statuscode === 200
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.mensaje
        });
    },
    error: (error) => {
        // ❌ Error - statuscode !== 200 convertido a Error
        console.error('Error en operación:', error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message, // Contiene el mensaje del backend
            life: 5000
        });
    }
});
```

---

## 📁 **ESTRUCTURA BASE DEL SERVICIO**

### **1. Imports y Dependencias Obligatorias**
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Servicios obligatorios del proyecto
import { ApiConfigService } from '@/core/services/api-config/api-config.service';
import { SessionService } from '@/core/services/session/session.service';

// Interfaces específicas del dominio
import { EntityCrudItem, EntityFormItem, EntityCrudResponse, EntityCrudSingleResponse } from '@/core/models/entity.interface';
```

### **2. Estructura de Clase Base**
```typescript
@Injectable({
    providedIn: 'root'
})
export class EntityService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    // Método para obtener URL dinámica
    private getEntityUrl(): Observable<string> {
        return this.apiConfigService.getEndpointUrl('ENTITY_ENDPOINT_KEY');
    }
}
```

---

## 🔧 **MÉTODOS CRUD OBLIGATORIOS**

### **1. GET/SELECT - Obtener Lista Completa**
```typescript
getEntityItems(): Observable<EntityCrudResponse> {
    console.log('📋 Obteniendo items de [entity]...');

    return this.getEntityUrl().pipe(
        switchMap(url => {
            // ⚠️ CRÍTICO: Usar POST con action SL (requiere sesión según reglas del proyecto)
            return this.http.post<any>(url, {
                action: 'SL', // Según las convenciones del proyecto: SL para query/search
                ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
            });
        }),
        map((response: any) => {
            console.log('🌐 Respuesta de API:', response);

            // Manejar respuesta en formato array (patrón del backend)
            if (Array.isArray(response) && response.length > 0) {
                const firstItem = response[0];

                // ⚠️ CRÍTICO: Verificar errores del backend
                if (firstItem.statuscode && firstItem.statuscode !== 200) {
                    throw new Error(firstItem.mensaje || 'Error del servidor');
                }

                return {
                    statuscode: firstItem.statuscode || 200,
                    mensaje: firstItem.mensaje || 'OK',
                    data: firstItem.data || []
                } as EntityCrudResponse;
            }

            // Respuesta directa (fallback)
            if (response.statuscode && response.statuscode !== 200) {
                throw new Error(response.mensaje || 'Error del servidor');
            }

            return {
                statuscode: response.statuscode || 200,
                mensaje: response.mensaje || 'OK',
                data: response.data || []
            } as EntityCrudResponse;
        }),
        catchError(error => {
            console.error('❌ Error al obtener items:', error);
            return throwError(() => new Error('Error al cargar datos'));
        })
    );
}
```

### **2. POST/INSERT - Crear Nuevo Item**
```typescript
// ⚠️ CRÍTICO: Este método debe detectar automáticamente si crear (IN) o actualizar (UP)
saveItem(item: EntityFormItem): Observable<EntityCrudSingleResponse> {
    // Determinar acción basada en la presencia de ID
    const hasId = item.id_entity && item.id_entity !== null && item.id_entity !== undefined;
    const action = hasId ? 'UP' : 'IN';

    console.log('🔍 Determinando acción:', {
        id_entity: item.id_entity,
        hasId,
        action,
        itemKeys: Object.keys(item)
    });

    const payload = {
        action: action,
        ...item,
        ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
    };

    console.log(`🚀 ${action === 'IN' ? 'Creando' : 'Actualizando'} item:`, payload);

    return this.getEntityUrl().pipe(
        switchMap(url => this.http.post<any>(url, payload)),
        map((response: any) => {
            console.log('🌐 Respuesta save completa:', response);

            // Manejar respuesta en formato array
            if (Array.isArray(response) && response.length > 0) {
                const firstItem = response[0];

                // ⚠️ CRÍTICO: Verificar errores del backend
                if (firstItem.statuscode && firstItem.statuscode !== 200) {
                    console.log('❌ Backend devolvió error en array:', firstItem);
                    throw new Error(firstItem.mensaje || 'Error del servidor');
                }

                return {
                    statuscode: firstItem.statuscode || 200,
                    mensaje: firstItem.mensaje || 'Item guardado exitosamente',
                    data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : item as EntityCrudItem
                } as EntityCrudSingleResponse;
            }

            // Si la respuesta es un objeto directo
            console.log('📋 Procesando respuesta directa:', response);

            // Verificar error en respuesta directa
            if (response.statuscode && response.statuscode !== 200) {
                console.log('❌ Backend devolvió error directo:', response);
                throw new Error(response.mensaje || 'Error del servidor');
            }

            return {
                statuscode: response.statuscode || 200,
                mensaje: response.mensaje || 'Item guardado exitosamente',
                data: response.data || item as EntityCrudItem
            } as EntityCrudSingleResponse;
        }),
        catchError(error => {
            console.error('❌ Error completo al guardar item:', error);

            // ⚠️ CRÍTICO: Preservar mensaje original del backend
            const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al guardar item';
            console.log('📤 Enviando error al componente:', errorMessage);

            return throwError(() => ({
                message: errorMessage,
                originalError: error
            }));
        })
    );
}
```

---

## 🎨 **LOGGING OBLIGATORIO**

### **1. Entrada de Método**
```typescript
console.log('📋 Obteniendo items de [entity]...');
console.log('🔍 Determinando acción:', { id, action, payload });
```

### **2. Respuestas del Backend**
```typescript
console.log('🌐 Respuesta completa:', response);
console.log('📋 Procesando respuesta:', firstItem);
```

### **3. Errores**
```typescript
console.error('❌ Error completo:', error);
console.log('📤 Enviando error al componente:', errorMessage);
```

### **4. Acciones Exitosas**
```typescript
console.log('✅ [Acción] completada:', response);
```

---

## 🚨 **REGLAS CRÍTICAS OBLIGATORIAS**

### **1. Inyección de Sesión**
```typescript
// ⚠️ OBLIGATORIO en TODOS los métodos (excepto GET públicos)
...this.sessionService.getApiPayloadBase() // usr, id_session
```

### **2. Acciones del Backend**
- **`SL`** - SELECT (consultar datos)
- **`IN`** - INSERT (crear nuevo)
- **`UP`** - UPDATE (actualizar existente)
- **`DL`** - DELETE (eliminar)

### **3. Detección Automática de Acción**
```typescript
// ⚠️ PATRÓN OBLIGATORIO para saveItem()
const hasId = item.id_entity && item.id_entity !== null && item.id_entity !== undefined;
const action = hasId ? 'UP' : 'IN';
```

### **4. Verificación de Errores del Backend**
```typescript
// ⚠️ OBLIGATORIO en todos los map()
if (firstItem.statuscode && firstItem.statuscode !== 200) {
    throw new Error(firstItem.mensaje || 'Error del servidor');
}
```

### **5. Manejo de Errores Completo**
```typescript
// ⚠️ PATRÓN OBLIGATORIO en catchError
catchError(error => {
    console.error('❌ Error completo:', error);

    const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error genérico';
    return throwError(() => ({
        message: errorMessage,
        originalError: error
    }));
})
```

---

## 🎛️ **CONFIGURACIÓN DE DROPDOWNS/COMBOS EN FORMULARIOS**

### **⚠️ PROBLEMA COMÚN: Dropdowns Cortados**
Los `p-select` y otros dropdowns pueden cortarse cuando están cerca de los límites del formulario/modal, haciendo imposible la selección de opciones.

### **✅ SOLUCIÓN ESTÁNDAR OBLIGATORIA:**

#### **1. Configuración Base para Todos los Dropdowns**
```html
<p-select
  formControlName="campo"
  [options]="opciones"
  optionLabel="label"
  optionValue="value"
  placeholder="Seleccionar..."
  class="w-full"
  appendTo="body"                    <!-- 🔑 CRÍTICO: Renderiza fuera del contenedor -->
  [style]="{'z-index': '9999'}"     <!-- 🔑 CRÍTICO: Z-index alto -->
></p-select>
```

#### **2. Propiedades Obligatorias:**
- ✅ **`appendTo="body"`** - Renderiza el dropdown en el body, evitando cortes
- ✅ **`[style]="{'z-index': '9999'}"`** - Z-index alto para aparecer sobre modales
- ✅ **`class="w-full"`** - Ancho completo del contenedor

---

## 📊 **INTERFACES OBLIGATORIAS**

### **1. Response para Lista**
```typescript
export interface EntityCrudResponse {
    statuscode: number;
    mensaje: string;
    data: EntityCrudItem[];
}
```

### **2. Response para Item Individual**
```typescript
export interface EntityCrudSingleResponse {
    statuscode: number;
    mensaje: string;
    data: EntityCrudItem | null;
}
```

### **3. Item para CRUD (Tabla)**
```typescript
export interface EntityCrudItem {
    id_entity: number;
    // ... campos específicos del dominio
    fecha_cre?: string;
    fecha_mod?: string;
    usr_c?: string;
    usr_m?: string;
}
```

### **4. Item para Formulario**
```typescript
export interface EntityFormItem {
    id_entity?: number | null;
    // ... campos específicos del dominio
    // ⚠️ Todos los campos opcionales para crear
}
```

---

## 🧪 **TESTING CONSIDERATIONS**

### **1. Mocks Necesarios**
```typescript
// En tests
const mockApiConfigService = {
    getEndpointUrl: jasmine.createSpy().and.returnValue(of('http://test-url'))
};

const mockSessionService = {
    getApiPayloadBase: jasmine.createSpy().and.returnValue({ usr: 'test', id_session: '123' })
};
```

### **2. Casos de Prueba Obligatorios**
- ✅ Respuesta exitosa (statuscode 200)
- ✅ Error del backend (statuscode ≠ 200)
- ✅ Error de red/HTTP
- ✅ Respuesta en formato array
- ✅ Respuesta en formato objeto
- ✅ Detección automática IN vs UP
- ✅ Preservación de mensajes de error del backend

---

## ⚠️ **ERRORES COMUNES A EVITAR**

1. **No inyectar datos de sesión** → Backend rechaza petición
2. **No verificar statuscode** → Errores del backend se muestran como éxito
3. **Perder mensajes de error** → Usuario ve mensajes genéricos
4. **No manejar respuestas array** → Datos no se procesan correctamente
5. **ID null en saveItem** → Se envía UP en lugar de IN
6. **Logging insuficiente** → Debugging imposible
7. **No usar switchMap con URL dinámica** → URL hardcodeada
8. **Catch genérico** → Se pierde información del backend

---

## 🚀 **EJEMPLO DE USO EN COMPONENTE**

```typescript
// En el componente
this.entityService.saveItem(formData).subscribe({
    next: (response) => {
        console.log('✅ Respuesta:', response);
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.mensaje || 'Guardado correctamente'
        });
    },
    error: (error) => {
        console.error('❌ Error:', error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al guardar', // Contiene mensaje del backend
            life: 5000
        });
    }
});
```

---

## 🚨 **MANEJO DE ERRORES DEL BACKEND - LECCIÓN APRENDIDA**

### **⚠️ PROBLEMA QUE NOS COSTÓ MÚLTIPLES ITERACIONES**
Durante la implementación del módulo `CatConceptos`, descubrimos que el manejo de errores del backend era problemático porque:

1. **Servicios no verificaban statuscode** → Trataban errores HTTP como respuestas exitosas
2. **catchError reemplazaba mensajes específicos** → Perdía la información valiosa del backend
3. **Componentes mostraban mensajes genéricos** → Usuario no entendía qué había fallado

### **✅ SOLUCIÓN COMPLETA - OBLIGATORIA PARA TODOS LOS SERVICIOS**

#### **1. Verificación de Errores en Servicios**
```typescript
// TODOS los métodos deben verificar statuscode
if (Array.isArray(response) && response.length > 0) {
    const firstItem = response[0];
    if (firstItem.statuscode && firstItem.statuscode !== 200) {
        throw new Error(firstItem.mensaje || 'Error del servidor');
    }
    // Procesar respuesta exitosa...
}
```

#### **2. Preservación de Mensajes en catchError**
```typescript
// NUNCA reemplazar mensajes específicos del backend
catchError(error => {
    const errorMessage = error instanceof Error ? error.message : 'Error genérico';
    console.log('📤 Enviando error al componente:', errorMessage);
    return throwError(() => new Error(errorMessage));
})
```

#### **3. Uso de Mensajes Específicos en Componentes**
```typescript
// EN TODOS los subscribe() de operaciones
.subscribe({
    next: (response) => {
        this.messageService.add({
            severity: 'success',
            detail: response.mensaje
        });
    },
    error: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        this.messageService.add({
            severity: 'error',
            detail: errorMessage,  // ← MENSAJE ESPECÍFICO DEL BACKEND
            life: 5000
        });
    }
});
```

### **📋 CHECKLIST PREVENCIÓN DE ERRORES**

#### **Antes de implementar un servicio:**
- [ ] Verificar que todos los `map()` verifiquen `statuscode !== 200`
- [ ] Asegurar que `catchError` preserve mensajes: `error instanceof Error ? error.message : fallback`
- [ ] Planificar cómo los componentes usarán `error.message` en lugar de mensajes hardcodeados

#### **Durante el desarrollo:**
- [ ] Probar operaciones que generen errores del backend
- [ ] Verificar que los mensajes específicos se muestren en los toasts
- [ ] Revisar logs para confirmar preservación de mensajes

#### **Después de implementar:**
- [ ] Ejecutar pruebas con errores simulados
- [ ] Verificar experiencia de usuario con diferentes tipos de error
- [ ] Documentar casos específicos de error encontrados

### **🎯 RESULTADO ESPERADO**
```
Usuario intenta operación inválida
    ↓
Backend devuelve: {statuscode: 400, mensaje: "Campo X requerido"}
    ↓
Servicio detecta error y lanza: Error("Campo X requerido")
    ↓
catchError preserva: Error("Campo X requerido")
    ↓
Componente recibe: error.message = "Campo X requerido"
    ↓
Usuario ve toast: "Campo X requerido"
```

---

## 🎯 **SERVICIOS IMPLEMENTADOS**

### **Lista de Servicios por Endpoint ID**

| ID | Servicio | Descripción | Servicio Padre |
|----|----------|-------------|----------------|
| 16 | CatConceptosService | Gestión de catálogos maestros | - |
| 17 | CatConceptosDetService | Detalles de catálogos | CatConceptosService |
| 18 | CompService | Gestión de componentes | - |
| **19** | **BannerService** | **Contenido dinámico de páginas** | **CompService** |

### **BannerService - Servicio Hijo de CompService**

#### **Propósito**
Gestiona el contenido dinámico de páginas web mediante banners contextuales que pertenecen a componentes específicos.

#### **Características**
- **Servicio Hijo:** Dependiente de `CompService` (cada banner pertenece a un componente)
- **Relación FK:** `banner.id_comp → componente.id_comp`
- **Herencia:** Tipo y canal del componente padre
- **Programación:** Soporte para fechas de activación/desactivación
- **Orden:** Control de secuencia por componente

#### **Estructura de Datos**
```typescript
interface Banner {
    id_mb: number;           // ID único
    nombre: string;          // Nombre descriptivo del banner
    id_comp: number;         // FK al componente padre
    id_coll?: number;        // FK opcional a colección
    tipo_call: 'LINK' | 'BUTTON' | 'NONE';
    swsched: number;         // ¿Programado?
    fecha_ini: string;
    fecha_fin: string;
    url_banner?: string;     // Imagen del banner
    orden: number;           // Posición
    swEnable: number;        // ¿Activo?
    // ... campos de auditoría
}
```

#### **Métodos CRUD Completos**
- `getAllBanners()` - Lista con filtros y paginación
- `createBanner()` - Crear nuevo banner
- `updateBanner()` - Actualizar banner existente
- `deleteBanner()` - Eliminar banner
- `getBannerById()` - Obtener banner específico

#### **Métodos Especializados**
- `getBannersByComponente(idComp)` - Banners de un componente
- `getBannersActivos()` - Solo banners activos
- `getBannersProgramados()` - Con programación de fechas
- `updateBannerOrder(id, orden)` - Cambiar orden
- `toggleBannerStatus(id, activo)` - Activar/desactivar
- `getEstadisticas()` - Métricas del módulo
- `validarOrdenUnico()` - Validar orden único por componente

#### **Validaciones Implementadas**
- Orden único por componente
- Fechas válidas (`fecha_ini <= fecha_fin`)
- Componente padre existente
- URLs válidas cuando se proporcionan

---

## 📚 **REFERENCIAS**

- Basado en: `src/app/core/services/menu/menu.service.ts`
- Patrón de proyecto: POST con action para todas las operaciones
- Sesión obligatoria: SessionService.getApiPayloadBase()
- URLs dinámicas: ApiConfigService.getEndpointUrl()
- Errores del backend: Verificar statuscode ≠ 200 y throw Error
- Lección aprendida: Implementación de CatConceptos - múltiples iteraciones por manejo de errores
- Servicios hijos: BannerService depende de CompService

---

**🎯 Sigue esta guía para crear servicios consistentes, robustos y que manejen correctamente los errores del backend.**
