# 📋 GUÍA COMPLETA PARA SERVICIOS CRUD CON HTTP

## 🎯 **PROPÓSITO**
Esta guía documenta todas las mejores prácticas, patrones y consideraciones para implementar servicios CRUD que se conectan al backend vía HTTP, basándose en el servicio `MenuService` implementado y optimizado.

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
                action: 'SL',
                ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
            });
        }),
        map((response: any) => {
            console.log('🌐 Respuesta de API:', response);
            
            // Manejar respuesta en formato array (patrón del backend)
            if (Array.isArray(response) && response.length > 0) {
                const firstItem = response[0];
                return {
                    statuscode: firstItem.statuscode || 200,
                    mensaje: firstItem.mensaje || 'OK',
                    data: firstItem.data || []
                } as EntityCrudResponse;
            }
            
            // Respuesta directa (fallback)
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

### **2. GET BY ID - Obtener Item Específico**
```typescript
getEntityItem(id: number): Observable<EntityCrudSingleResponse> {
    const payload = {
        action: 'SL',
        id_entity: id,
        ...this.sessionService.getApiPayloadBase()
    };
    
    console.log('🔍 Obteniendo item específico:', payload);

    return this.getEntityUrl().pipe(
        switchMap(url => this.http.post<any>(url, payload)),
        map((response: any) => {
            console.log('🌐 Respuesta item específico:', response);
            
            if (Array.isArray(response) && response.length > 0) {
                const firstItem = response[0];
                return {
                    statuscode: firstItem.statuscode || 200,
                    mensaje: firstItem.mensaje || 'OK',
                    data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : null
                } as EntityCrudSingleResponse;
            }
            
            return {
                statuscode: response.statuscode || 200,
                mensaje: response.mensaje || 'OK',
                data: response.data || null
            } as EntityCrudSingleResponse;
        }),
        catchError(error => {
            console.error('❌ Error al obtener item:', error);
            return throwError(() => new Error('Error al obtener item específico'));
        })
    );
}
```

### **3. POST/INSERT - Crear Nuevo Item**
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
                
                console.log('📋 Procesando respuesta array:', firstItem);
                
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

### **4. PUT/UPDATE - Actualización Completa**
```typescript
updateItem(id: number, item: EntityFormItem): Observable<EntityCrudSingleResponse> {
    const payload = {
        action: 'UP',
        id_entity: id,
        ...item,
        ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
    };

    console.log('🔄 Actualizando completamente item:', payload);

    return this.getEntityUrl().pipe(
        switchMap(url => this.http.post<any>(url, payload)),
        map((response: any) => {
            console.log('🌐 Respuesta update:', response);
            
            if (Array.isArray(response) && response.length > 0) {
                const firstItem = response[0];
                
                // Verificar errores del backend
                if (firstItem.statuscode && firstItem.statuscode !== 200) {
                    throw new Error(firstItem.mensaje || 'Error del servidor');
                }
                
                return {
                    statuscode: firstItem.statuscode || 200,
                    mensaje: firstItem.mensaje || 'Item actualizado exitosamente',
                    data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : item as EntityCrudItem
                } as EntityCrudSingleResponse;
            }
            
            // Verificar error en respuesta directa
            if (response.statuscode && response.statuscode !== 200) {
                throw new Error(response.mensaje || 'Error del servidor');
            }
            
            return {
                statuscode: response.statuscode || 200,
                mensaje: response.mensaje || 'Item actualizado exitosamente',
                data: response.data || item as EntityCrudItem
            } as EntityCrudSingleResponse;
        }),
        catchError(error => {
            console.error('❌ Error al actualizar completamente item:', error);
            
            const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al actualizar item';
            return throwError(() => ({ 
                message: errorMessage,
                originalError: error 
            }));
        })
    );
}
```

### **5. PATCH - Actualización Parcial**
```typescript
patchItem(id: number, partialData: Partial<EntityFormItem>): Observable<EntityCrudSingleResponse> {
    const payload = {
        action: 'UP',
        id_entity: id,
        ...partialData,
        ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
    };

    console.log('🔧 Actualizando parcialmente item:', payload);

    return this.getEntityUrl().pipe(
        switchMap(url => this.http.post<any>(url, payload)),
        map((response: any) => {
            console.log('🌐 Respuesta patch:', response);
            
            if (Array.isArray(response) && response.length > 0) {
                const firstItem = response[0];
                
                // Verificar errores del backend
                if (firstItem.statuscode && firstItem.statuscode !== 200) {
                    throw new Error(firstItem.mensaje || 'Error del servidor');
                }
                
                return {
                    statuscode: firstItem.statuscode || 200,
                    mensaje: firstItem.mensaje || 'Item actualizado exitosamente',
                    data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : {} as EntityCrudItem
                } as EntityCrudSingleResponse;
            }
            
            // Verificar error en respuesta directa
            if (response.statuscode && response.statuscode !== 200) {
                throw new Error(response.mensaje || 'Error del servidor');
            }
            
            return {
                statuscode: response.statuscode || 200,
                mensaje: response.mensaje || 'Item actualizado exitosamente',
                data: response.data || {} as EntityCrudItem
            } as EntityCrudSingleResponse;
        }),
        catchError(error => {
            console.error('❌ Error al actualizar parcialmente item:', error);
            
            const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al actualizar item';
            return throwError(() => ({ 
                message: errorMessage,
                originalError: error 
            }));
        })
    );
}
```

### **6. DELETE - Eliminar Item**
```typescript
deleteItem(id: number): Observable<EntityCrudSingleResponse> {
    const payload = {
        action: 'DL',
        id_entity: id,
        ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
    };

    console.log('🗑️ Eliminando item:', payload);

    return this.getEntityUrl().pipe(
        switchMap(url => this.http.post<any>(url, payload)),
        map((response: any) => {
            console.log('🌐 Respuesta delete:', response);
            
            if (Array.isArray(response) && response.length > 0) {
                const firstItem = response[0];
                
                // Verificar errores del backend
                if (firstItem.statuscode && firstItem.statuscode !== 200) {
                    throw new Error(firstItem.mensaje || 'Error del servidor');
                }
                
                return {
                    statuscode: firstItem.statuscode || 200,
                    mensaje: firstItem.mensaje || 'Item eliminado exitosamente',
                    data: firstItem.data || null
                } as EntityCrudSingleResponse;
            }
            
            return {
                statuscode: response.statuscode || 200,
                mensaje: response.mensaje || 'Item eliminado exitosamente',
                data: response.data || null
            } as EntityCrudSingleResponse;
        }),
        catchError(error => {
            console.error('❌ Error al eliminar item:', error);
            
            const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al eliminar item';
            return throwError(() => ({ 
                message: errorMessage,
                originalError: error 
            }));
        })
    );
}
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
// ⚠️ PATRÓN OBLIGATORIO en catchError - PRESERVAR MENSAJES DEL BACKEND
catchError(error => {
    console.error('❌ Error completo:', error);

    // ⚠️ CRÍTICO: Preservar mensaje original del backend si ya existe
    const errorMessage = error instanceof Error ? error.message : 'Error genérico';
    console.log('📤 Enviando error al componente:', errorMessage);

    return throwError(() => new Error(errorMessage));
})
```

---

## 🚨 **MANEJO DE ERRORES DEL BACKEND - GUÍA COMPLETA**

### **⚠️ PROBLEMA IDENTIFICADO**
Durante la implementación del módulo `CatConceptos`, se descubrió que los errores del backend no se estaban mostrando correctamente al usuario. El problema fue **multicapa**:

1. **Servicios no verificaban statuscode** → Trataban errores como éxitos
2. **catchError reemplazaba mensajes** → Perdía información específica del backend
3. **Componentes usaban mensajes genéricos** → Usuario veía "Error genérico" en lugar del mensaje real

### **✅ SOLUCIÓN COMPLETA OBLIGATORIA**

#### **1. Servicio - Verificación de Errores del Backend**
```typescript
// TODOS los métodos deben verificar statuscode en map()
if (Array.isArray(response) && response.length > 0) {
    const firstItem = response[0];

    // ⚠️ CRÍTICO: Verificar errores del backend
    if (firstItem.statuscode && firstItem.statuscode !== 200) {
        console.log('❌ Backend devolvió error en array:', firstItem);
        throw new Error(firstItem.mensaje || 'Error del servidor');
    }

    return { /* respuesta exitosa */ };
}

// Verificar también respuestas directas
if (response.statuscode && response.statuscode !== 200) {
    console.log('❌ Backend devolvió error directo:', response);
    throw new Error(response.mensaje || 'Error del servidor');
}
```

#### **2. Servicio - Preservación de Mensajes en catchError**
```typescript
// ⚠️ NUNCA reemplazar mensajes específicos del backend
catchError(error => {
    console.error('❌ Error en operación:', error);

    // PRESERVAR mensaje original del backend
    const errorMessage = error instanceof Error ? error.message : 'Error genérico';
    console.log('📤 Enviando error al componente:', errorMessage);

    return throwError(() => new Error(errorMessage));
})
```

#### **3. Componente - Mostrar Mensajes Específicos**
```typescript
// EN TODOS los subscribe() de operaciones
.subscribe({
    next: (response) => {
        // Éxito
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.mensaje
        });
    },
    error: (error) => {
        // ⚠️ CRÍTICO: Usar mensaje específico del backend
        console.error('❌ Error en componente:', error);

        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        this.messageService.add({
            severity: 'error',
            summary: 'Error en operación',
            detail: errorMessage,  // ← MENSAJE ESPECÍFICO DEL BACKEND
            life: 5000
        });

        // Revertir cambios locales si es necesario
    }
});
```

### **📋 CHECKLIST OBLIGATORIO PARA MANEJO DE ERRORES**

#### **En Servicios:**
- [ ] `map()` verifica `firstItem.statuscode !== 200` y lanza `Error(firstItem.mensaje)`
- [ ] `map()` verifica `response.statuscode !== 200` en respuestas directas
- [ ] `catchError` usa `error instanceof Error ? error.message : 'fallback'`
- [ ] `catchError` incluye `console.log('📤 Enviando error al componente:', errorMessage)`
- [ ] NO reemplazar mensajes específicos con genéricos

#### **En Componentes:**
- [ ] Error handlers usan `error instanceof Error ? error.message : 'fallback'`
- [ ] `messageService.add()` usa `detail: errorMessage` (no mensajes hardcodeados)
- [ ] Revertir cambios locales en caso de error
- [ ] Mostrar toasts con `life: 5000` para errores

### **🎯 EJEMPLOS DE MANEJO CORRECTO**

#### **Servicio Correcto:**
```typescript
return this.http.post(url, payload).pipe(
    map(response => {
        if (Array.isArray(response) && response.length > 0) {
            const firstItem = response[0];
            if (firstItem.statuscode !== 200) {
                throw new Error(firstItem.mensaje || 'Error del servidor');
            }
            return { statuscode: 200, mensaje: firstItem.mensaje, data: firstItem.data };
        }
        return response;
    }),
    catchError(error => {
        const errorMessage = error instanceof Error ? error.message : 'Error genérico';
        console.log('📤 Enviando error al componente:', errorMessage);
        return throwError(() => new Error(errorMessage));
    })
);
```

#### **Componente Correcto:**
```typescript
this.service.operation(data).subscribe({
    next: (response) => {
        this.messageService.add({
            severity: 'success',
            summary: 'Operación exitosa',
            detail: response.mensaje
        });
    },
    error: (error) => {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        this.messageService.add({
            severity: 'error',
            summary: 'Error en operación',
            detail: errorMessage,
            life: 5000
        });
        // Revertir cambios si es necesario
    }
});
```

### **🚨 ERRORES COMUNES A EVITAR**

1. **❌ NO verificar statuscode:**
```typescript
// MAL: Trata errores como éxitos
return { statuscode: firstItem.statuscode || 200, mensaje: firstItem.mensaje };
```

2. **❌ Reemplazar mensajes en catchError:**
```typescript
// MAL: Pierde información del backend
catchError(() => throwError(() => new Error('Error genérico')));
```

3. **❌ Mensajes hardcodeados en componentes:**
```typescript
// MAL: Usuario no sabe qué pasó
detail: 'Error al guardar'
```

### **📊 FLUJO COMPLETO DE ERRORES**

```
Backend Error → Servicio detecta → Preserva mensaje → Componente recibe → Usuario ve mensaje específico
     ↓              ↓                ↓                  ↓                    ↓
statuscode:400   throw Error()    catchError()    error.message       Toast específico
mensaje:"X"      message:"X"       message:"X"      "X"                "X"
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

#### **3. Casos de Uso Específicos:**

##### **Formularios en Modales:**
```html
<!-- ❌ MAL: Se corta con el borde del modal -->
<p-select formControlName="parent_id" [options]="parentOptions"></p-select>

<!-- ✅ BIEN: Se renderiza fuera del modal -->
<p-select 
  formControlName="parent_id" 
  [options]="parentOptions"
  appendTo="body"
  [style]="{'z-index': '9999'}"
></p-select>
```

##### **Dropdowns al Final del Formulario:**
```html
<!-- Configuración especial para campos al final -->
<p-select 
  formControlName="categoria"
  [options]="categoriaOptions"
  appendTo="body"
  [style]="{'z-index': '9999'}"
  [panelStyle]="{'max-height': '200px'}" <!-- Altura máxima del panel -->
></p-select>
```

#### **4. Posicionamiento Estratégico:**
- ✅ **Campos importantes al inicio**: Coloca dropdowns críticos (como "Padre") al inicio del formulario
- ✅ **Más espacio disponible**: Los campos al inicio tienen más espacio hacia abajo
- ✅ **Mejor UX**: Usuario ve opciones importantes primero

#### **5. Configuración Adicional para Casos Complejos:**
```html
<p-select 
  formControlName="campo"
  [options]="opciones"
  appendTo="body"
  [style]="{'z-index': '9999'}"
  [panelStyle]="{'max-height': '300px', 'overflow-y': 'auto'}"
  [virtualScroll]="true"              <!-- Para listas muy largas -->
  [virtualScrollItemSize]="30"        <!-- Altura de cada item -->
  [showClear]="true"                  <!-- Botón para limpiar -->
  [filter]="true"                     <!-- Filtro de búsqueda -->
  filterPlaceholder="Buscar..."
></p-select>
```

### **🚨 REGLAS CRÍTICAS PARA DROPDOWNS:**

1. **SIEMPRE usar `appendTo="body"`** en formularios modales
2. **SIEMPRE usar z-index alto** (`9999` o superior)
3. **Posicionar campos críticos al inicio** del formulario
4. **Probar en diferentes resoluciones** y tamaños de modal
5. **Considerar `virtualScroll`** para listas de +100 elementos
6. **Agregar filtro** (`[filter]="true"`) para listas largas

### **📋 CHECKLIST DE DROPDOWNS:**
- [ ] `appendTo="body"` configurado
- [ ] Z-index alto establecido
- [ ] Campo posicionado estratégicamente
- [ ] Probado en modal pequeño
- [ ] Probado con lista larga
- [ ] Filtro agregado si es necesario
- [ ] Placeholder descriptivo
- [ ] Opción "Sin selección" incluida

### **🎯 EJEMPLO COMPLETO:**
```html
<!-- Dropdown optimizado para formularios CRUD -->
<div>
  <label class="block text-sm font-medium mb-1">Categoría Padre</label>
  <p-select 
    formControlName="id_categoria_padre"
    [options]="categoriaOptions"
    optionLabel="label"
    optionValue="value"
    placeholder="Sin categoría padre (principal)"
    class="w-full"
    appendTo="body"
    [style]="{'z-index': '9999'}"
    [panelStyle]="{'max-height': '250px'}"
    [filter]="categoriaOptions.length > 10"
    filterPlaceholder="Buscar categoría..."
    [showClear]="true"
    [class.p-invalid]="form.get('id_categoria_padre')?.invalid && form.get('id_categoria_padre')?.touched"
  ></p-select>
  
  <!-- Mensaje de error si es necesario -->
  <small 
    *ngIf="form.get('id_categoria_padre')?.invalid && form.get('id_categoria_padre')?.touched"
    class="text-red-500 mt-1 block"
  >
    Selecciona una categoría válida
  </small>
</div>
```

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

## 🔍 **LOGGING OBLIGATORIO**

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

## 🎯 **MÉTODO GENÉRICO OPCIONAL**

```typescript
// Para acciones personalizadas del backend
executeAction(action: string, data?: any, id?: number): Observable<any> {
    const payload = {
        action: action,
        ...(id && { id_entity: id }),
        ...(data && data),
        ...this.sessionService.getApiPayloadBase()
    };

    console.log(`⚡ Ejecutando acción ${action}:`, payload);

    return this.getEntityUrl().pipe(
        switchMap(url => this.http.post<any>(url, payload)),
        map((response: any) => {
            console.log(`🌐 Respuesta acción ${action}:`, response);
            
            if (Array.isArray(response) && response.length > 0) {
                return response[0];
            }
            
            return response;
        }),
        catchError(error => {
            console.error(`❌ Error en acción ${action}:`, error);
            return throwError(() => new Error(`Error al ejecutar acción ${action}`));
        })
    );
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

---

## 📝 **CHECKLIST DE IMPLEMENTACIÓN**

### **Antes de crear un nuevo servicio CRUD:**
- [ ] Crear interfaces de dominio (CrudItem, FormItem, Response)
- [ ] Configurar endpoint en ApiConfigService
- [ ] Definir clave de endpoint única

### **Durante la implementación:**
- [ ] Inyectar HttpClient, ApiConfigService, SessionService
- [ ] Implementar getEntityUrl() con switchMap
- [ ] Agregar sessionService.getApiPayloadBase() en payloads
- [ ] Verificar statuscode en todas las respuestas
- [ ] Implementar logging completo con emojis
- [ ] Manejar respuestas array y objeto
- [ ] Preservar mensajes de error del backend

### **Después de la implementación:**
- [ ] Probar todos los métodos CRUD
- [ ] Verificar manejo de errores
- [ ] Revisar logs en consola
- [ ] Validar integración con componentes
- [ ] Documentar métodos específicos del dominio

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
            detail: error.message || 'Error al guardar',
            life: 5000
        });
    }
});
```

---

## 📚 **REFERENCIAS**

- Basado en: `src/app/core/services/menu/menu.service.ts`
- Patrón de proyecto: POST con action para todas las operaciones
- Sesión obligatoria: SessionService.getApiPayloadBase()
- URLs dinámicas: ApiConfigService.getEndpointUrl()

---

**🎯 Sigue esta guía para crear servicios CRUD consistentes, robustos y fáciles de mantener.**
