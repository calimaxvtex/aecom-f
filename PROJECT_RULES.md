# 📋 Reglas y Convenciones del Proyecto AECOM-F

## 🎯 **PÁGINA REFERENCIA: TabAdm (Administración de Tabloides)**

Este documento establece las reglas y mejores prácticas del proyecto, basadas en la implementación de la página `tabadm` como referencia.

---

## 📁 **1. ESTRUCTURA DEL PROYECTO**

### **1.1 Arquitectura de Carpetas**
```
src/app/
├── core/                    # Servicios core y utilidades
│   ├── services/           # Servicios globales (SessionService, etc.)
│   └── interceptors/       # Interceptors HTTP
├── features/               # Funcionalidades específicas
│   └── [feature-name]/
│       ├── models/         # Interfaces TypeScript
│       ├── services/       # Servicios específicos
│       └── components/     # Componentes de la feature
├── pages/                  # Páginas principales
│   └── [page-name]/
│       └── [page-name].component.ts
├── shared/                 # Componentes compartidos
└── types/                  # Tipos globales
```

### **1.2 Convención de Nombres**
- **Componentes**: `[feature].component.ts`
- **Servicios**: `[feature].service.ts`
- **Interfaces**: `[feature].interface.ts`
- **Modelos**: `[feature].model.ts`
- **Rutas**: `kebab-case` (ej: `system/usuarios`, `aec/banner/tab`)

---

## 🏗️ **2. ARQUITECTURA DE COMPONENTES**

### **2.1 Componentes Standalone (RECOMENDADO)**
```typescript
@Component({
    selector: 'app-[component-name]',
    standalone: true,
    imports: [
        CommonModule,
        // PrimeNG Modules específicos
        TableModule,
        ButtonModule,
        DialogModule,
        // Angular modules
        FormsModule,
        ReactiveFormsModule
    ],
    template: `...`,
    providers: [MessageService]
})
```

### **2.2 Patrón de Servicios**
```typescript
@Injectable({
    providedIn: 'root'
})
export class [Feature]Service {
    private apiUrl = `${this.baseUrl}/api/[endpoint]/v1`;

    constructor(
        private http: HttpClient,
        private sessionService: SessionService
    ) {}

    // CRUD operations con action parameter
    getData(payload: any): Observable<any> {
        return this.http.post(this.apiUrl, payload);
    }
}
```

---

## 🔌 **3. INTEGRACIÓN DE APIs**

### **3.1 Patrón de Payloads**
```typescript
// POST request con action parameter
const payload = {
    action: 'SL', // SL=Select, IN=Insert, UP=Update, DL=Delete
    ...data,
    ...sessionService.getApiPayloadBase() // usr, id_session
};
```

### **3.2 Inyección de Sesión en Peticiones**

#### **⚠️ REGLA CRÍTICA: Inyección Obligatoria de Sesión**

**Cuando se haga una acción en el servicio con cualquier método (excepto GET), SE DEBE insertar en el body el `usr` y `id_session`.**

#### **Implementación Correcta:**
```typescript
@Injectable({
    providedIn: 'root'
})
export class CollService {
    // ✅ CORRECTO: Inyección de sesión en POST
    createCollection(data: any): Observable<any> {
        const payload = {
            action: 'IN',
            ...data,
            ...this.sessionService.getApiPayloadBase() // usr, id_session
        };
        return this.http.post(this.apiUrl, payload);
    }

    // ✅ CORRECTO: Inyección de sesión en PUT
    updateCollection(data: any): Observable<any> {
        const payload = {
            action: 'UP',
            ...data,
            ...this.sessionService.getApiPayloadBase() // usr, id_session
        };
        return this.http.put(`${this.apiUrl}/${data.id}`, payload);
    }

    // ✅ CORRECTO: Inyección de sesión en DELETE
    deleteCollection(id: number): Observable<any> {
        const sessionData = this.sessionService.getApiPayloadBase();
        const params = new HttpParams()
            .set('usr', sessionData.usr.toString())
            .set('id_session', sessionData.id_session.toString());

        return this.http.delete(`${this.apiUrl}/${id}`, { params });
    }

    // ✅ CORRECTO: GET sin inyección de sesión
    getCollections(): Observable<any> {
        return this.http.get(this.apiUrl);
    }
}
```

#### **Implementación Incorrecta:**
```typescript
// ❌ INCORRECTO: POST sin inyección de sesión
createCollection(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data); // FALTA usr e id_session
}

// ❌ INCORRECTO: PUT sin inyección de sesión
updateCollection(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${data.id}`, data); // FALTA usr e id_session
}

// ❌ INCORRECTO: DELETE sin inyección de sesión
deleteCollection(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`); // FALTA usr e id_session
}
```

#### **Beneficios:**
- ✅ **Auditoría completa** de todas las operaciones
- ✅ **Trazabilidad** de usuarios y sesiones
- ✅ **Seguridad** en todas las modificaciones de datos
- ✅ **Consistencia** en todas las peticiones
- ✅ **Mantenibilidad** centralizada

#### **Referencia:**
- **Método:** `SessionService.getApiPayloadBase()`
- **Retorna:** `{ usr: string | number, id_session: number }`
- **Aplicación:** Todas las peticiones POST/PUT/DELETE
- **Excepción:** Peticiones GET (solo lectura)

---

### **3.3 Manejo de Respuestas**
```typescript
// Patrón estándar de respuesta
interface ApiResponse<T = any> {
    statuscode: number;
    mensaje: string;
    data: T;
}

// Manejo flexible de respuestas
cargarDatos(): void {
    this.loading = true;
    this.service.getData(payload).subscribe({
        next: (response: any) => {
            let dataToProcess = null;

            // Manejo de diferentes formatos de respuesta
            if (Array.isArray(response)) {
                if (response[0]?.statuscode === 200) {
                    dataToProcess = response[0].data;
                } else {
                    dataToProcess = response;
                }
            } else if (response?.statuscode === 200) {
                dataToProcess = response.data;
            }

            if (dataToProcess) {
                this.datos = dataToProcess;
            }
        },
        error: (error) => {
            console.error('❌ Error:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message,
                life: 5000
            });
        },
        complete: () => {
            this.loading = false;
        }
    });
}
```

### **3.4 URLs de API**
```typescript
// Patrón de URLs
const BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = {
    usuarios: `${BASE_URL}/api/admusr/v1`,
    spconfig: `${BASE_URL}/api/spconfig/v1`,
    tabloides: `${BASE_URL}/api/admtab/v1`,
    roles: `${BASE_URL}/api/admrol/v1`,
    permisos: `${BASE_URL}/api/admper/v1`
};
```

### **3.5 Configuración Dinámica de Servicios**
```typescript
## ⚠️ **REGLA CRÍTICA: ID de Servicio Obligatorio**

**Cuando se genere un servicio, SE DEBE tener el ID del servicio** para poderlo implementar con `getEndpointById()` del `ApiConfigService`.

### **Implementación Correcta:**
```typescript
@Injectable({
    providedIn: 'root'
})
export class CollService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);

    // ✅ CORRECTO: Usar ID específico del servicio
    private readonly SERVICE_ID = 8; // ID del servicio de colecciones

    getAllCollections(): Observable<CollResponse> {
        // Obtener endpoint dinámicamente por ID
        const endpoint = this.apiConfigService.getEndpointById(this.SERVICE_ID);
        return this.http.get<CollArrayResponse>(endpoint.url);
    }
}
```

### **Implementación Incorrecta:**
```typescript
// ❌ INCORRECTO: Hardcodear URLs
const HARDCODED_URL = 'http://localhost:3000/api/admcoll/v1';

getData(): Observable<any> {
    return this.http.get(HARDCODED_URL); // NO HACER ESTO
}
```

### **Proceso para Obtener ID del Servicio:**
1. **Verificar tabla `spconfig`** en la base de datos
2. **Buscar el registro** correspondiente al servicio
3. **Obtener el `id_sp`** del registro
4. **Documentar el ID** en el código del servicio
5. **Usar `getEndpointById(id)`** para obtener la URL dinámica

### **Beneficios:**
- ✅ **Configuración centralizada** en base de datos
- ✅ **URLs dinámicas** sin hardcodeo
- ✅ **Mantenibilidad** simplificada
- ✅ **Consistencia** en todos los servicios
- ✅ **Flexibilidad** para cambiar URLs sin modificar código

### **Referencia:**
- **Tabla:** `spconfig` en base de datos
- **Campo ID:** `id_sp`
- **Campo URL:** `fullRoute`
- **Servicio:** `ApiConfigService.getEndpointById(id)`
```

---

## 🎨 **5. UI/UX CON PRIMENG**

### **5.1 Tema y Configuración**
```typescript
// app.config.ts
providePrimeNG({
    ripple: true,
    inputStyle: 'filled', // IMPORTANTE: usar 'filled'
    theme: { preset: MyPreset, options: { darkModeSelector: '.app-dark' } }
})
```

### **5.2 Componentes de Tabla (p-table)**
```typescript
<p-table
    [value]="datos"
    [loading]="loading"
    [paginator]="true"
    [rows]="10"
    [rowsPerPageOptions]="[5, 10, 25, 50]"
    [globalFilterFields]="['nombre', 'descripcion']"
    responsiveLayout="scroll"
    dataKey="id"
    editMode="row"
    (onRowSelect)="onRowSelect($event)"
    (onRowUnselect)="onRowUnselect($event)"
>
    <!-- Columnas con templates -->
    <ng-template pTemplate="header">
        <tr>
            <th style="width: 100px">ID</th>
            <th>Nombre</th>
            <th style="width: 150px">Acciones</th>
        </tr>
    </ng-template>

    <ng-template pTemplate="body" let-item>
        <tr [class.bg-blue-50]="item === selectedItem">
            <td>{{item.id}}</td>
            <td>{{item.nombre}}</td>
            <td>
                <div class="flex gap-1">
                    <p-button
                        icon="pi pi-pencil"
                        (click)="editar(item)"
                        pTooltip="Editar"
                    ></p-button>
                    <p-button
                        icon="pi pi-trash"
                        (click)="eliminar(item)"
                        severity="danger"
                        pTooltip="Eliminar"
                    ></p-button>
                </div>
            </td>
        </tr>
    </ng-template>
</p-table>
```

### **5.3 Sistema de Tabs (p-tabs)**
```typescript
<p-tabs [value]="activeTabIndex" (onTabChange)="onTabChange($event)">
    <p-tablist>
        <p-tab value="0">
            <i class="pi pi-list mr-2"></i>
            Datos
        </p-tab>
        <p-tab value="1">
            <i class="pi pi-eye mr-2"></i>
            Preview
        </p-tab>
    </p-tablist>

    <p-tabpanels>
        <p-tabpanel value="0">
            <!-- Contenido del primer tab -->
        </p-tabpanel>
        <p-tabpanel value="1">
            <!-- Contenido del segundo tab -->
        </p-tabpanel>
    </p-tabpanels>
</p-tabs>
```

### **5.4 Formularios con p-dialog**
```typescript
<p-dialog
    [(visible)]="showForm"
    [modal]="true"
    [closable]="true"
    [draggable]="false"
    header="Nuevo Registro"
    [style]="{ width: '600px' }"
>
    <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-2">Nombre</label>
                <input
                    pInputText
                    formControlName="nombre"
                    class="w-full"
                    placeholder="Ingrese nombre"
                />
            </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
            <p-button
                label="Cancelar"
                icon="pi pi-times"
                severity="secondary"
                (click)="cancelar()"
            ></p-button>
            <p-button
                label="Guardar"
                icon="pi pi-check"
                type="submit"
                [loading]="saving"
                [disabled]="form.invalid"
            ></p-button>
        </div>
    </form>
</p-dialog>
```

---

## 🔄 **6. GESTIÓN DE ESTADO**

### **6.1 Patrón de Estados**
```typescript
export class [Component]Component {
    // Estados de carga
    loading = false;
    saving = false;

    // Estados de datos
    datos: [Type][] = [];
    selectedItem: [Type] | null = null;

    // Estados de UI
    showForm = false;
    showDeleteDialog = false;
    activeTabIndex = 0;

    // Estados de edición
    editingCell = '';
}
```

### **6.2 SessionService (OBLIGATORIO)**
```typescript
@Injectable({
    providedIn: 'root'
})
export class SessionService {
    getApiPayloadBase(): { usr: string | number; id_session: number } {
        const session = this.getSession();
        return {
            usr: session.usuario,
            id_session: session.id_session
        };
    }
}
```

---

## ⚡ **7. INTERACTIVIDAD AVANZADA**

### **7.1 Edición Inline**
```typescript
// Template
<td>
    <span *ngIf="editingCell !== item.id + '_campo'"
          (click)="startEdit(item, 'campo')"
          class="editable-cell">
        {{item.campo}}
    </span>
    <input *ngIf="editingCell === item.id + '_campo'"
           [(ngModel)]="item.campo"
           (keyup.enter)="saveEdit(item, 'campo')"
           (keyup.escape)="cancelEdit()"
           class="w-full" />
</td>

// Component
startEdit(item: any, field: string): void {
    this.editingCell = item.id + '_' + field;
}

saveEdit(item: any, field: string): void {
    const payload = {
        action: 'UP',
        id: item.id,
        [field]: item[field],
        ...this.sessionService.getApiPayloadBase()
    };

    this.service.updateField(payload).subscribe({
        next: () => {
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Campo actualizado correctamente'
            });
        }
    });

    this.editingCell = '';
}
```

### **7.2 Doble Clic con Transición**
```typescript
// Template
<tr (click)="seleccionarItem(item)"
    (dblclick)="seleccionarYMostrarPreview(item)"
    [class.bg-blue-50]="item === selectedItem">

// Component
seleccionarItem(item: any): void {
    this.selectedItem = item;
}

seleccionarYMostrarPreview(item: any): void {
    this.selectedItem = item;

    // Forzar transición al tab de preview
    if (this.activeTabIndex === 1) {
        this.activeTabIndex = 0;
        setTimeout(() => this.activeTabIndex = 1, 50);
    } else {
        this.activeTabIndex = 1;
    }
}
```

### **7.3 Toggle de Estado**
```typescript
// Template
<p-tag [value]="getEstadoLabel(item.estado)"
       [severity]="getEstadoSeverity(item.estado)"
       (click)="toggleEstado(item)"
       class="cursor-pointer">

// Component
toggleEstado(item: any): void {
    const nuevoEstado = item.estado === 'A' ? 'I' : 'A';
    const payload = {
        action: 'UP',
        id: item.id,
        estado: nuevoEstado,
        ...this.sessionService.getApiPayloadBase()
    };

    this.service.updateEstado(payload).subscribe({
        next: () => {
            item.estado = nuevoEstado;
        }
    });
}

getEstadoLabel(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
}

getEstadoSeverity(estado: string): string {
    return estado === 'A' ? 'success' : 'danger';
}
```

---

## 🚨 **8. MANEJO DE ERRORES**

### **8.1 Toast Messages (RECOMENDADO)**
```typescript
// Éxito
this.messageService.add({
    severity: 'success',
    summary: 'Operación exitosa',
    detail: 'Registro guardado correctamente',
    life: 3000
});

// Error
this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: error.message || 'Ocurrió un error inesperado',
    life: 5000
});

// Advertencia
this.messageService.add({
    severity: 'warn',
    summary: 'Advertencia',
    detail: 'Esta acción no se puede deshacer',
    life: 4000
});
```

### **8.2 Manejo de Errores HTTP**
```typescript
this.http.post(url, payload).subscribe({
    next: (response) => {
        // Manejar respuesta exitosa
    },
    error: (error: HttpErrorResponse) => {
        console.error('❌ Error HTTP:', error);

        let errorMessage = 'Error desconocido';

        if (error.error?.mensaje) {
            errorMessage = error.error.mensaje;
        } else if (error.message) {
            errorMessage = error.message;
        }

        this.messageService.add({
            severity: 'error',
            summary: `Error ${error.status}`,
            detail: errorMessage,
            life: 5000
        });

        // Fallback a datos mock si es necesario
        if (error.status === 500) {
            this.cargarDatosMock();
        }
    }
});
```

---

## 🎯 **9. RUTAS Y NAVEGACIÓN**

### **9.1 Configuración de Rutas**
```typescript
// src/app/app.routes.ts
{
    path: 'feature/page',
    data: { breadcrumb: 'Nombre de la Página' },
    loadComponent: () => import('@/pages/feature-page/feature-page.component')
        .then(c => c.FeaturePageComponent)
}
```

### **8.2 Patrón de Rutas**
- **Páginas del sistema**: `system/[module]/[page]`
- **Aplicaciones**: `apps/[app-name]`
- **Autenticación**: `auth/[action]`
- **Páginas públicas**: ruta directa

### **8.3 Archivo de Rutas Principal**
```typescript
## ⚠️ **REGLA CRÍTICA: Archivo de Rutas Principal**

**El archivo de rutas principal del proyecto es:**
```
📄 src/app/app.routes.ts
```

### **Ubicación Exacta:**
```
src/
├── app/
│   ├── app.routes.ts        ← 📍 **ARCHIVO PRINCIPAL DE RUTAS**
│   ├── app.config.ts
│   ├── app.component.ts
│   └── ...
```

### **¿Cuándo usar cada archivo?**

#### **✅ src/app/app.routes.ts (PRINCIPAL)**
- **Rutas principales** de la aplicación
- **Lazy loading** de módulos principales
- **Rutas del sistema**: `/system/*`
- **Rutas de aplicaciones**: `/apps/*`
- **Rutas de autenticación**: `/auth/*`

#### **❌ src/app/pages/pages.routes.ts (SECUNDARIO)**
- **Solo rutas de páginas** individuales
- **Configurado como children** en rutas principales
- **No usar directamente** como archivo principal

### **Ejemplo de Configuración Correcta:**
```typescript
// ✅ CORRECTO: src/app/app.routes.ts
export const appRoutes: Routes = [
    {
        path: 'system',
        loadChildren: () => import('@/pages/pages.routes')
            .then(m => m.default)
    },
    {
        path: 'apps',
        loadChildren: () => import('@/apps/apps.routes')
            .then(m => m.default)
    }
];
```

### **Beneficios:**
- ✅ **Consistencia** en la configuración de rutas
- ✅ **Mantenibilidad** centralizada
- ✅ **Estandarización** del proyecto
- ✅ **Evita confusión** entre archivos de rutas

### **Referencia:**
- **Archivo Principal:** `src/app/app.routes.ts`
- **Páginas Secundarias:** `src/app/pages/pages.routes.ts`
- **Aplicaciones:** `src/app/apps/apps.routes.ts`
```

---

## 📱 **9. RESPONSIVE DESIGN**

### **9.1 Grid System con Tailwind**
```typescript
<!-- Grid responsivo -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div class="col-span-1 md:col-span-2 lg:col-span-3">
        <!-- Contenido de ancho completo -->
    </div>
</div>

<!-- Layout con sidebar -->
<div class="flex flex-col lg:flex-row gap-4">
    <div class="w-full lg:w-1/3">
        <!-- Sidebar -->
    </div>
    <div class="w-full lg:w-2/3">
        <!-- Contenido principal -->
    </div>
</div>
```

### **9.2 Breakpoints Recomendados**
- `sm:` 640px+
- `md:` 768px+
- `lg:` 1024px+
- `xl:` 1280px+

---

## 🔧 **10. DEBUGGING Y LOGGING**

### **10.1 Patrón de Logging**
```typescript
// Información general
console.log('📊 Componente cargado:', this.datos.length, 'registros');

// Operaciones exitosas
console.log('✅ Operación exitosa:', operation, result);

// Errores
console.error('❌ Error en', method, error);

// Debugging detallado
console.log('🔍 Debug:', { variable, state, payload });
```

### **10.2 Herramientas de Debug**
```typescript
// Router tracing (temporal)
// withDebugTracing() en app.config.ts

// HTTP Interceptors para debugging
// ApiMonitorInterceptor para seguimiento de requests

// TypeScript strict checks
// "strict": true en tsconfig.json
```

---

## 💬 **11. COMUNICACIÓN Y WORKFLOW**

### **11.1 Reglas de Comunicación**
```markdown
## ⚠️ **REGLA CRÍTICA DE WORKFLOW**

**Cuando se haga una pregunta en el prompt:**
- ❌ **NO EJECUTAR** acciones automáticamente
- ✅ **RESPONDER** la pregunta de manera clara y completa
- ✅ **PEDIR CONFIRMACIÓN** antes de ejecutar cualquier acción
- ✅ **ESPERAR** aprobación explícita del usuario

### **Ejemplo de Flujo Correcto:**
```
Usuario: "agrega un botón rojo a la página"
Respuesta: "Entiendo que quieres agregar un botón rojo. ¿Dónde exactamente lo quieres ubicar y qué acción debe realizar?"
[ESPERAR CONFIRMACIÓN DEL USUARIO]
```

### **Flujo Incorrecto:**
```
Usuario: "agrega un botón rojo a la página"
Respuesta: [Ejecuta automáticamente sin preguntar]
```

### **Beneficios:**
- ✅ **Claridad** en los requerimientos
- ✅ **Evita malentendidos** en la implementación
- ✅ **Mejor comunicación** usuario-desarrollador
- ✅ **Control total** del usuario sobre los cambios
```

### **11.2 Confirmación de Cambios**
- **Antes de cualquier modificación:** Pedir confirmación
- **Cambios críticos:** Documentar el impacto esperado
- **Nuevas funcionalidades:** Confirmar ubicación y comportamiento
- **Refactors:** Explicar el alcance del cambio

---

## ✅ **12. CHECKLIST DE CALIDAD**

### **Antes de commit:**
- [ ] **Linting**: `npm run lint` sin errores
- [ ] **TypeScript**: `npx tsc --noEmit` sin errores
- [ ] **Imports**: Usar alias `@/` en lugar de rutas relativas
- [ ] **Interfaces**: Definir tipos para todas las respuestas de API
- [ ] **Error handling**: Manejar todos los casos de error posibles
- [ ] **Loading states**: Implementar indicadores de carga
- [ ] **Responsive**: Probar en diferentes tamaños de pantalla
- [ ] **Accesibilidad**: Usar etiquetas apropiadas y ARIA cuando sea necesario

### **Después de commit:**
- [ ] **Testing**: Verificar funcionamiento en desarrollo
- [ ] **Rutas**: Confirmar que las rutas funcionan correctamente
- [ ] **API**: Verificar integración con backend
- [ ] **Performance**: Revisar carga inicial y operaciones
- [ ] **Documentación**: Actualizar este documento si es necesario

---

## 🚀 **12. PATRONES PROHIBIDOS**

### **❌ NO HACER:**
- **No usar módulos legacy**: Siempre usar componentes standalone
- **No hardcodear URLs**: Usar variables de configuración
- **No manejar errores con alert()**: Usar MessageService/toasts
- **No usar any**: Definir interfaces para todos los tipos
- **No importar módulos innecesarios**: Solo importar lo que se usa
- **No usar setTimeout() para lógica de negocio**: Solo para forzar re-renders
- **No duplicar código**: Crear servicios reutilizables
- **No usar rutas absolutas**: Usar alias `@/` para imports

---

## 📈 **13. MÉTRICAS DE CALIDAD**

### **Objetivos por componente:**
- **Complejidad ciclomática**: < 10 por método
- **Líneas por archivo**: < 500 líneas
- **Imports por archivo**: < 20 imports
- **Métodos por clase**: < 15 métodos
- **Parámetros por método**: < 5 parámetros

### **Performance targets:**
- **Tiempo de carga inicial**: < 3 segundos
- **Tiempo de respuesta API**: < 1 segundo
- **Bundle size**: < 2MB (con tree-shaking)
- **Lighthouse score**: > 90 en mobile/desktop

---

## 🎯 **REFERENCIAS**

### **Páginas modelo:**
- `tabadm` - Arquitectura completa standalone
- `usuarios` - Integración API compleja
- `spconfig` - Manejo avanzado de estado

### **Documentación relacionada:**
- `docs/CONTEXT.md` - Contexto del proyecto
- `docs/FEATURES.md` - Funcionalidades disponibles
- `docs/TECHNICAL.md` - Detalles técnicos

---

*Este documento se actualiza con cada nueva página desarrollada. Última actualización: TabAdm (Administración de Tabloides)*
