# 📋 Definición de Páginas Adm-Ecom - AECOM-F

## 🎯 **Propósito**

Este documento define los estándares y patrones que deben seguir todas las páginas del módulo **Adm-Ecom** (Administración E-commerce) en el proyecto AECOM-F.

---

## 📝 **Reglas de Creación**

### **Proceso Estandarizado para Crear Páginas Adm-Ecom**

Para crear una nueva página del módulo **Adm-Ecom**, sigue estrictamente este proceso:

#### **1. 📋 Definición de Página y Ruta**

- **Nombre de la página**: `[Especificar nombre descriptivo]`
- **Ruta**: `[Especificar ruta, ej: /adm-ecom/[page-name]]`
- **Funcionalidad principal**: `[Describir brevemente qué hace la página]`

#### **2. 🎨 Requisitos de Contenido**

Especificar claramente qué debe contener la página:

- **¿Lleva tabs?**
    - Cantidad: `[número]`
    - Nombres: `[tab1, tab2, ...]`
    - Funcionalidad por tab: `[describir cada uno]`

- **¿Lleva búsqueda?**
    - Campos a buscar: `[campo1, campo2, ...]`
    - Tipo de búsqueda: `[global, por filtros, etc.]`

- **¿Lleva filtros?**
    - Tipos de filtros: `[dropdown, checkbox, datepicker, etc.]`
    - Campos filtrables: `[campo1, campo2, ...]`

- **¿Lleva botones?**
    - **Nuevo**: `[descripción o "Sí/No"]`
    - **Actualizar/Sincronizar**: `[descripción o "Sí/No"]`
    - **Exportar**: `[descripción o "Sí/No"]`
    - **Importar**: `[descripción o "Sí/No"]`
    - **Otros**: `[especificar]`

- **Tablas y contenido**
    - **Por cada tab/tabla**:
        - Columnas: `[nombre1, nombre2, ...]`
        - Tipos de datos: `[texto, número, fecha, boolean, etc.]`
        - Funciones: `[ordenamiento, edición inline, acciones]`
        - **Datos de ejemplo**: `[proporcionar datos dummy realistas]`

- **Paginación**: `[Sí/No, tamaño de página]`

- **Características adicionales**:
    - `[Modales, confirmaciones, toast messages, etc.]`

#### **3. 🔧 Funcionalidad CRUD**

Implementar operaciones completas:

- **CREATE**: Formulario de creación con validaciones
- **READ**: Carga y visualización de datos
- **UPDATE**: Edición inline y/o modal
- **DELETE**: Eliminación con confirmación

#### **4. 🔌 Servicios y API**

- **Ruta base del API**: `[ej: /adm-ecom/test1]`
- **Endpoint completo**: `[construir basado en ruta base]`
- **Métodos HTTP**: `[GET, POST, PUT, DELETE según necesite]`
- **Payload structure**: `[describir estructura de datos]`

## 🎨 **Diseño de la Página**

### **HTML - Estructura Visual**

#### **Nombre de la Página**

- Cada página debe tener un título claro y descriptivo
- Usar íconos de PrimeNG para mejorar la UX (`pi-list`, `pi-plus`, `pi-pencil`, etc.)

#### **Nombre de los Componentes**

- Selector único: `[page-name]-list` (ej: `receta-list`, `banner-list`)
- Componente standalone obligatorio

#### **¿Lleva Tabs?**

- Evaluar si la funcionalidad requiere organización en tabs
- Si lleva tabs, especificar:
    - Cantidad de tabs
    - Nombre de cada tab
    - Funcionalidad de cada tab

#### **¿Lleva Búsqueda?**

- Campo global de búsqueda (opcional pero recomendado)
- Filtrar por múltiples campos del modelo de datos

#### **¿Lleva Filtros?**

- Filtros avanzados según necesidades del negocio
- Dropdowns, checkboxes, datepickers según requerimientos

#### **¿Lleva Botones?**

Especificar tipo de botones:

- **Nuevo**: `p-button` con `icon="pi pi-plus"` y `severity="success"`
- **Actualizar**: `p-button` con `icon="pi pi-refresh"` y `loading` state
- **Exportar**: `p-button` con `icon="pi pi-download"`
- **Importar**: `p-button` con `icon="pi pi-upload"`

#### **Tabla y Campos**

##### **Header**

- **Nombre de columnas**: Descriptivos y en español
- **Tamaño de las columnas**: Definir `style="width: XXpx"` para columnas críticas
- **¿Lleva ordenamiento?**: `p-sortIcon` en columnas ordenables

##### **Body**

- **Valor de la columna**: Binding a propiedades del modelo
- **Tipo de componente**: `p-column`, `p-checkbox`, `p-tag`, etc.
- **Edición**: Especificar si es editable (inline, modal, etc.)
- **Funciones de edición**:
    - `blur`: Cancelar edición y resetear valor
    - **Botones de confirmación**: Solo para nuevos valores o ediciones
    - **Botones de cancelación**: Resetear a valor inicial

- **Botones de acción**:
    - **Editar**: Abrir modal de edición (`pi pi-pencil`)
    - **Eliminar**: Abrir modal de confirmación (`pi pi-trash`, `severity="danger"`)

### **CSS - Estilos y Layout**

#### **Estructura de Estilos**

- Archivo separado: `[page-name].component.scss`
- Variables personalizadas para colores y espaciado
- Responsive design con Tailwind CSS
- Animaciones y transiciones sutiles

#### **Clases Recomendadas**

```scss
.page-header {
    @apply bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-lg;
}

.action-buttons {
    @apply flex gap-2 flex-wrap;
}

.table-responsive {
    @apply overflow-x-auto;
}
```

### **JavaScript (Component) - Lógica**

#### **Estructura del Componente**

- **Propiedades**: Estados de carga, datos, formularios
- **Métodos**: CRUD operations, manejo de UI, validaciones
- **Ciclo de vida**: `ngOnInit`, `ngOnDestroy`
- **Inyección de dependencias**: Servicios requeridos

---

## 🧩 **Componentes y Subcomponentes**

### **Componentes Principales**

- **Tabla**: `p-table` con funcionalidades completas
- **Formularios**: `p-dialog` con formularios reactivos
- **Modales**: Confirmación de eliminación, edición
- **Toast**: Notificaciones de éxito/error

### **Subcomponentes**

- **Widgets**: Si la página tiene widgets específicos
- **Cards**: Para organizar secciones
- **Filtros**: Componentes de filtrado avanzado

---

## 🔧 **Servicios**

### **Funciones para Consumo de API**

#### **Operaciones CRUD**

```typescript
// Servicio específico del módulo
@Injectable({
    providedIn: 'root'
})
export class [Module]Service {
    // Configuración
    private readonly SERVICE_ID = X; // ID del endpoint

    // Operaciones
    getAll(): Observable<[ItemType][]> { /* ... */ }
    create(item: [ItemType]): Observable<any> { /* ... */ }
    update(id: number, item: [ItemType]): Observable<any> { /* ... */ }
    delete(id: number): Observable<any> { /* ... */ }
}
```

#### **Manejo de Respuestas y Errores**

- **Respuestas exitosas**: Seguir patrones definidos
- **Errores**: Manejo robusto según diferentes formatos HTTP
- **Logging**: Console logs para debugging

---

## 🏗️ **Estructura de Archivos Obligatoria**

### **Patrón de Archivos por Página**

```
src/app/pages/adm-ecom/[page-name]/
├── [page-name].component.ts          # ✅ Componente principal (lógica)
├── [page-name].component.html        # ✅ Template HTML
├── [page-name].component.scss        # ✅ Estilos específicos
└── components/                       # 📁 Opcional: sub-componentes
    └── [sub-component].component.ts
```

### **Archivos Prohibidos**

- ❌ **Templates inline**: `template: '...'`
- ❌ **Estilos inline**: `styles: ['...']`
- ❌ **Archivos mezclados**: Todo en un solo archivo

---

## 🔧 **Componente Principal - Estructura Obligatoria**

### **Decorador del Componente**

```typescript
@Component({
    selector: '[page-name]-list',              // ✅ Selector específico
    standalone: true,                          // ✅ Obligatorio
    imports: [                                 // ✅ Imports explícitos
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        // PrimeNG Modules (20+ módulos típicos)
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        // Servicios y componentes específicos
    ],
    templateUrl: './[page-name].component.html',  // ✅ Archivo separado
    styleUrl: './[page-name].component.scss',     // ✅ Archivo separado
    providers: [MessageService]                   // ✅ Servicios locales
})
```

### **Clase del Componente**

```typescript
export class [PageName]Component implements OnInit, OnDestroy {

    // ============ PROPIEDADES OBLIGATORIAS ============

    // Estados de carga
    loading = false;
    saving = false;

    // Estados de UI
    showForm = false;
    showDeleteDialog = false;

    // Datos principales
    items: [ItemType][] = [];
    selectedItem: [ItemType] | null = null;

    // Formularios
    form!: FormGroup;

    // ============ SERVICIOS INYECTADOS ============

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private sessionService = inject(SessionService);

    // Servicio específico del módulo
    private [module]Service = inject([Module]Service);

    // ============ CICLO DE VIDA ============

    ngOnInit(): void {
        this.initializeForm();
        this.loadData();
    }

    ngOnDestroy(): void {
        // Cleanup si es necesario
    }

    // ============ MÉTODOS PRINCIPALES ============

    private initializeForm(): void {
        this.form = this.fb.group({
            // Definición del formulario reactivo
        });
    }

    loadData(): void {
        this.loading = true;
        this.[module]Service.getAll().subscribe({
            next: (response) => this.handleResponse(response),
            error: (error) => this.handleError(error),
            complete: () => this.loading = false
        });
    }

    // ============ MÉTODOS DE ACCIÓN ============

    onCreate(): void {
        this.selectedItem = null;
        this.form.reset();
        this.showForm = true;
    }

    onEdit(item: [ItemType]): void {
        this.selectedItem = item;
        this.form.patchValue(item);
        this.showForm = true;
    }

    onSave(): void {
        if (this.form.invalid) return;

        this.saving = true;
        const data = this.form.value;

        const operation = this.selectedItem ? 'update' : 'create';
        const observable = this.selectedItem
            ? this.[module]Service.update(this.selectedItem.id, data)
            : this.[module]Service.create(data);

        observable.subscribe({
            next: (response) => {
                if (this.handleWriteResponse(response)) {
                    this.handleSaveSuccess(operation);
                }
            },
            error: (error) => this.handleError(error),
            complete: () => this.saving = false
        });
    }

    onDelete(item: [ItemType]): void {
        this.selectedItem = item;
        this.showDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedItem) return;

        this.[module]Service.delete(this.selectedItem.id).subscribe({
            next: (response) => {
                if (this.handleWriteResponse(response)) {
                    this.handleDeleteSuccess();
                }
            },
            error: (error) => this.handleError(error)
        });
    }

    // ============ MÉTODOS DE MANEJO ============

    private handleReadResponse(response: any): [ItemType][] {
        // Manejo según estructura del API para operaciones de lectura
        if (response?.statuscode === 200 && response?.data !== null) {
            // Datos encontrados
            return response.data;
        } else if (response?.statuscode === 204 || response?.data === null) {
            // Sin contenido
            return [];
        }
        return [];
    }

    private handleWriteResponse(response: any): boolean {
        // Manejo según estructura del API para operaciones de escritura
        if (response?.statuscode === 201) {
            // Operación exitosa (creado/actualizado/eliminado)
            return true;
        } else if (response?.statuscode === 200) {
            // Operación exitosa alternativa
            return true;
        } else if (response?.statuscode === 400 && response?.mensaje) {
            // Error específico del negocio
            throw new Error(response.mensaje);
        }
        return false;
    }

    private handleResponse(response: any): void {
        // Manejo según estructura de respuesta del API
        this.items = this.handleReadResponse(response);
    }

    private handleSaveSuccess(operation: string): void {
        const message = operation === 'create' ? 'creado' : 'actualizado';
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Registro ${message} correctamente`
        });
        this.showForm = false;
        this.loadData();
    }

    private handleDeleteSuccess(): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Registro eliminado correctamente'
        });
        this.showDeleteDialog = false;
        this.selectedItem = null;
        this.loadData();
    }

    private handleError(error: any): void {
        console.error('❌ Error:', error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Ocurrió un error inesperado'
        });
    }

    // ============ MÉTODOS DE UI ============

    onCancel(): void {
        this.showForm = false;
        this.selectedItem = null;
    }

    onCancelDelete(): void {
        this.showDeleteDialog = false;
        this.selectedItem = null;
    }
}
```

---

## 📄 **Template HTML - Estructura Obligatoria**

### **Estructura General**

```html
<div class="card">
    <h2 class="text-2xl font-semibold mb-4">
        <i class="[icon-class] mr-2"></i>
        [Título de la Página]
    </h2>

    <!-- Barra de acciones -->
    <div class="flex justify-between items-center mb-4">
        <div class="flex gap-2">
            <p-button label="Nuevo" icon="pi pi-plus" (onClick)="onCreate()" severity="success"> </p-button>
            <p-button label="Actualizar" icon="pi pi-refresh" (onClick)="loadData()" [loading]="loading"> </p-button>
        </div>

        <!-- Buscador global (opcional) -->
        <div class="w-80">
            <input pInputText placeholder="Buscar..." class="w-full" [(ngModel)]="globalFilter" />
        </div>
    </div>

    <!-- Tabla principal -->
    <p-table
        [value]="items"
        [loading]="loading"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 25, 50]"
        [globalFilterFields]="['[campo1]', '[campo2]']"
        responsiveLayout="scroll"
        dataKey="id"
        [(selection)]="selectedItem"
        (onRowSelect)="onRowSelect($event)"
        (onRowUnselect)="onRowUnselect($event)"
    >
        <ng-template pTemplate="header">
            <tr>
                <th style="width: 50px">
                    <p-checkbox [(ngModel)]="selectAll" (onChange)="onSelectAllChange()" [binary]="true"> </p-checkbox>
                </th>
                <th [pSortableColumn]="'[campo]'">
                    [Nombre Campo]
                    <p-sortIcon field="[campo]"></p-sortIcon>
                </th>
                <!-- Más columnas según necesidades -->
                <th style="width: 150px">Acciones</th>
            </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item let-rowIndex="rowIndex">
            <tr [class.bg-blue-50]="item === selectedItem">
                <td>
                    <p-checkbox [(ngModel)]="item.selected" (onChange)="onItemSelectChange()" [binary]="true"> </p-checkbox>
                </td>
                <td>{{ item.[campo] }}</td>
                <!-- Más celdas según columnas -->
                <td>
                    <div class="flex gap-1">
                        <p-button icon="pi pi-pencil" severity="info" pTooltip="Editar" tooltipPosition="top" (click)="onEdit(item)"> </p-button>
                        <p-button icon="pi pi-trash" severity="danger" pTooltip="Eliminar" tooltipPosition="top" (click)="onDelete(item)"> </p-button>
                    </div>
                </td>
            </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="[numero-columnas]" class="text-center py-8">
                    <i class="pi pi-info-circle text-4xl text-gray-400 mb-4 block"></i>
                    <span class="text-gray-500">No se encontraron registros</span>
                </td>
            </tr>
        </ng-template>
    </p-table>

    <!-- Formulario Modal -->
    <p-dialog [(visible)]="showForm" [modal]="true" [closable]="true" [draggable]="false" header="[Nuevo|Editar] [Entidad]" [style]="{ width: '600px' }">
        <form [formGroup]="form" (ngSubmit)="onSave()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Campos del formulario -->
                <div>
                    <label class="block text-sm font-medium mb-2">[Nombre Campo]</label>
                    <input pInputText formControlName="[campo]" class="w-full" placeholder="Ingrese [campo]" [class.ng-invalid]="form.get('[campo]')?.invalid && form.get('[campo]')?.touched" />
                    <small class="text-red-500" *ngIf="form.get('[campo]')?.invalid && form.get('[campo]')?.touched"> Campo requerido </small>
                </div>
                <!-- Más campos según necesidades -->
            </div>

            <div class="flex justify-end gap-2 mt-6">
                <p-button label="Cancelar" icon="pi pi-times" severity="secondary" type="button" (click)="onCancel()"> </p-button>
                <p-button label="Guardar" icon="pi pi-check" type="submit" [loading]="saving" [disabled]="form.invalid"> </p-button>
            </div>
        </form>
    </p-dialog>

    <!-- Diálogo de Confirmación de Eliminación -->
    <p-confirmDialog [style]="{ width: '450px' }" header="Confirmar Eliminación" icon="pi pi-exclamation-triangle"> </p-confirmDialog>

    <!-- Toast Messages -->
    <p-toast></p-toast>
</div>
```

---

## 🎨 **Estilos SCSS - Estructura Recomendada**

### **Archivo de Estilos**

```scss
// src/app/pages/adm-ecom/[page-name]/[page-name].component.scss

// Variables específicas del componente
$page-primary-color: #3b82f6;
$page-secondary-color: #64748b;

// Estilos personalizados
.custom-header {
    background: linear-gradient(135deg, $page-primary-color, lighten($page-primary-color, 10%));
    color: white;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
}

.action-buttons {
    .p-button {
        margin-right: 0.5rem;

        &:last-child {
            margin-right: 0;
        }
    }
}

// Responsive design
@media (max-width: 768px) {
    .action-buttons {
        flex-direction: column;
        gap: 0.5rem;

        .p-button {
            width: 100%;
            margin-right: 0;
        }
    }
}

// Animaciones personalizadas
.fade-in {
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

// Estilos para estados específicos
.row-selected {
    background-color: rgba(59, 130, 246, 0.1) !important;
    border-left: 3px solid $page-primary-color;
}

// Override de PrimeNG si es necesario
.p-datatable {
    .p-datatable-tbody > tr:hover {
        background-color: rgba(59, 130, 246, 0.05);
    }
}
```

---

## 🔗 **Integraciones Obligatorias**

### **1. Servicio Específico del Módulo**

```typescript
// Import del servicio específico
import { [Module]Service } from '@/features/[module]/services/[module].service';

// Inyección del servicio
private [module]Service = inject([Module]Service);
```

### **2. SessionService para Payload Base**

```typescript
// Inyección obligatoria
private sessionService = inject(SessionService);

// Uso en operaciones POST/PUT/DELETE
const payload = {
    action: 'IN', // IN=Insert, UP=Update, DL=Delete
    ...data,
    ...this.sessionService.getApiPayloadBase() // usr, id_session
};
```

### **3. MessageService para Notificaciones**

```typescript
// Inyección obligatoria
private messageService = inject(MessageService);

// Uso consistente
this.messageService.add({
    severity: 'success', // success, info, warn, error
    summary: 'Título',
    detail: 'Mensaje descriptivo',
    life: 3000 // duración en ms
});
```

### **4. FormBuilder para Formularios Reactivos**

```typescript
// Inyección obligatoria
private fb = inject(FormBuilder);

// Definición del formulario
this.form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', Validators.required],
    activo: [true]
});
```

---

## 📡 **Estructura de Respuestas del API**

### **Formatos de Respuesta Estándar**

#### **✅ HTTP 200 OK - Lectura Exitosa**

```json
{
    "statuscode": 200,
    "mensaje": "Peticion procesada correctamente",
    "data": [
        {
            "id": 1,
            "nombre": "Item 1"
            // ... otros campos
        }
    ]
}
```

#### **✅ HTTP 200 OK - Creación Exitosa**

```json
{
    "statuscode": 201,
    "mensaje": "Creado",
    "data": null
}
```

#### **✅ HTTP 200 OK - Sin Contenido**

```json
{
    "statuscode": 204,
    "mensaje": "Sin contenido que mostrar",
    "data": []
}
```

#### **❌ HTTP 200 OK - Error de Validación**

```json
{
    "statuscode": 400,
    "mensaje": "Ocurrió un error al procesar la informacion",
    "data": null
}
```

#### **❌ Errores HTTP (404, 500, 503)**

**⚠️ IMPORTANTE**: La estructura de errores HTTP (>= 400) puede variar significativamente según cómo el servidor y los interceptores manejen estos casos. No siempre llegan como JSON estructurado con `statuscode` y `mensaje`.

**Opción A - Error HTTP estándar (interceptores Angular):**

```
HTTP 404 Not Found
Content-Type: text/plain
"No autorizado"
```

_Llega como `HttpErrorResponse` con `error.status = 404`_

**Opción B - Error del backend en JSON (HTTP 200 + statuscode interno):**

```json
{
    "statuscode": 404,
    "mensaje": "No autorizado",
    "data": null
}
```

_Llega como respuesta HTTP 200 con error en el body_

**Opción C - Error como HttpErrorResponse con JSON:**

```javascript
HttpErrorResponse {
    status: 404,
    statusText: "Not Found",
    error: {
        statuscode: 404,
        mensaje: "No autorizado",
        data: null
    }
}
```

**💡 Recomendación**: Implementa manejo de errores robusto y registra en logs cómo llegan realmente los errores HTTP en tu entorno específico. El manejo de errores debe ser flexible para adaptarse a diferentes formatos que puede enviar el servidor.

---

## 📊 **Rutas y Configuración**

### **Registro en pages.routes.ts**

```typescript
// src/app/pages/pages.routes.ts
{
    path: 'adm-ecom/[page-name]',
    data: {
        breadcrumb: '[Nombre Completo de la Página]',
        proy: 1
    },
    loadComponent: () => import('./adm-ecom/[page-name]/[page-name].component')
        .then(c => c.[PageName]Component)
}
```

### **Lazy Loading Obligatorio**

- ✅ **Usar `loadComponent`** en lugar de `component`
- ✅ **Import dinámico** con `.then()`
- ✅ **Nombre consistente** del componente

---

## 💻 **Implementación**

### **Patrones de Implementación**

### **1. Patrón CRUD Estándar**

```typescript
// CREATE
createItem(data: any): Observable<any> {
    const payload = {
        action: 'IN',
        ...data,
        ...this.sessionService.getApiPayloadBase()
    };
    return this.http.post(this.apiUrl, payload);
}

// READ
getAllItems(): Observable<any> {
    return this.http.post(this.apiUrl, {
        action: 'SL',
        ...this.sessionService.getApiPayloadBase()
    });
}

// UPDATE
updateItem(id: number, data: any): Observable<any> {
    const payload = {
        action: 'UP',
        id,
        ...data,
        ...this.sessionService.getApiPayloadBase()
    };
    return this.http.post(this.apiUrl, payload);
}

// DELETE
deleteItem(id: number): Observable<any> {
    const payload = {
        action: 'DL',
        id,
        ...this.sessionService.getApiPayloadBase()
    };
    return this.http.post(this.apiUrl, payload);
}
```

### **2. Patrón de Manejo de Respuestas**

#### **Para operaciones de lectura (GET):**

```typescript
private handleReadResponse(response: any): [ItemType][] {
    // Manejo según estructura del API para operaciones de lectura
    if (response?.statuscode === 200 && response?.data !== null) {
        // Datos encontrados
        return response.data;
    } else if (response?.statuscode === 204 || response?.data === null) {
        // Sin contenido
        return [];
    }
    return [];
}
```

#### **Para operaciones de escritura (POST/PUT/DELETE):**

```typescript
private handleWriteResponse(response: any): boolean {
    // Manejo según estructura del API para operaciones de escritura
    if (response?.statuscode === 201) {
        // Operación exitosa (creado/actualizado/eliminado)
        return true;
    } else if (response?.statuscode === 200) {
        // Operación exitosa alternativa
        return true;
    } else if (response?.statuscode === 400 && response?.mensaje) {
        // Error específico del negocio
        throw new Error(response.mensaje);
    }
    return false;
}
```

### **3. Patrón de Manejo de Errores**

#### **Manejo Completo de Errores (Recomendado):**

```typescript
private handleApiError(error: any, operation: string): void {
    console.error(`❌ Error en ${operation}:`, error);

    let errorMessage = 'Ocurrió un error inesperado';
    let severity: 'error' | 'warn' = 'error';

    if (error.error instanceof ErrorEvent) {
        // Error del cliente (JavaScript)
        errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status) {
        // Error HTTP - puede venir de diferentes formas
        if (error.status >= 500) {
            // Error del servidor (500, 503)
            errorMessage = `Error del servidor: ${error.status} - ${error.statusText || 'Servicio no disponible'}`;
        } else if (error.status === 404) {
            // No encontrado/No autorizado
            errorMessage = 'Recurso no encontrado o acceso no autorizado';
        } else if (error.status >= 400) {
            // Error del cliente (400-499)
            if (error.error && typeof error.error === 'object' && error.error.mensaje) {
                // Error del backend en JSON (HTTP error con body JSON)
                errorMessage = error.error.mensaje;
                severity = error.error.statuscode === 400 ? 'warn' : 'error';
            } else {
                // Error HTTP estándar sin body JSON
                errorMessage = `Error de solicitud: ${error.status} - ${error.statusText || error.message || 'Sin detalles'}`;
            }
        } else if (error.error && typeof error.error === 'object') {
            // Respuesta HTTP 200 pero con error en el body (statuscode interno)
            if (error.error.statuscode && error.error.statuscode !== 200) {
                errorMessage = error.error.mensaje || `Error del servidor: ${error.error.statuscode}`;
                severity = error.error.statuscode === 400 ? 'warn' : 'error';
            }
        }
    } else if (error.message) {
        // Error con mensaje personalizado (ej: throw new Error())
        errorMessage = error.message;
        severity = 'warn'; // Errores de negocio suelen ser warnings
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    this.messageService.add({
        severity: severity,
        summary: `Error en ${operation}`,
        detail: errorMessage,
        life: severity === 'error' ? 5000 : 4000
    });
}
```

#### **Manejo Simplificado (Alternativo):**

```typescript
private handleApiError(error: any, operation: string): void {
    console.error(`❌ Error en ${operation}:`, error);

    let errorMessage = 'Ocurrió un error inesperado';

    // Verificar mensaje de error en diferentes formatos
    if (error?.error?.mensaje) {
        errorMessage = error.error.mensaje;
    } else if (error?.mensaje) {
        errorMessage = error.mensaje;
    } else if (error?.message) {
        errorMessage = error.message;
    } else if (error?.statusText) {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    this.messageService.add({
        severity: 'error',
        summary: `Error en ${operation}`,
        detail: errorMessage,
        life: 5000
    });
}
```

---

## 📋 **Checklist de Implementación**

### **Antes de Commit**

- [ ] **Estructura de archivos**: 3 archivos separados (.ts, .html, .scss)
- [ ] **Componente standalone**: `standalone: true` configurado
- [ ] **Imports explícitos**: Todos los módulos PrimeNG listados
- [ ] **Servicios inyectados**: SessionService, MessageService, FormBuilder
- [ ] **Formulario reactivo**: Definido con validaciones
- [ ] **Tabla PrimeNG**: Configurada con paginación y sorting
- [ ] **Estados de carga**: Implementados para todas las operaciones
- [ ] **Manejo de errores**: Toast messages consistentes
- [ ] **Payload base**: Inyección de usr e id_session en POST/PUT/DELETE
- [ ] **Lazy loading**: Ruta configurada correctamente
- [ ] **Responsive**: Layout adaptable a móviles

### **Después de Commit**

- [ ] **Linting**: `npm run lint` sin errores
- [ ] **TypeScript**: `npx tsc --noEmit` sin errores
- [ ] **Build**: `ng build` exitoso
- [ ] **Rutas**: Navegación funciona correctamente
- [ ] **API**: Integración con backend operativa
- [ ] **CRUD**: Todas las operaciones funcionan

---

## 🎯 **Ejemplos de Implementación**

### **Página de Recetas** (`receta.component.ts`)

- ✅ **1024+ líneas** de código funcional
- ✅ **3 archivos separados** (ts, html, scss)
- ✅ **Integración completa** con RecetaService
- ✅ **Formulario avanzado** con validaciones
- ✅ **Tabla responsive** con operaciones CRUD

### **Página de Sucursales** (`sucursal.component.ts`)

- ✅ **Estructura idéntica** a recetas
- ✅ **Mismos patrones** de implementación
- ✅ **Integración** con SucursalService

---

## 🚨 **Reglas Críticas**

### **OBLIGATORIO**

- ✅ **Archivos separados**: TypeScript, HTML y SCSS independientes
- ✅ **Standalone components**: Sin módulos NgModule
- ✅ **Session injection**: usr e id_session en todas las modificaciones
- ✅ **Error handling**: Manejo robusto con toast messages
- ✅ **Reactive forms**: Formularios con validaciones
- ✅ **PrimeNG table**: Tabla avanzada con funcionalidades completas

### **PROHIBIDO**

- ❌ **Templates inline**: `template: '...'` no permitido
- ❌ **Estilos inline**: `styles: ['...']` no permitido
- ❌ **Hardcoded URLs**: Usar ApiConfigService
- ❌ **Alert()**: Usar MessageService/toasts
- ❌ **Any type**: Interfaces bien definidas
- ❌ **Direct DOM manipulation**: Usar Angular binding

---

## 📚 **Referencias**

- **[Reglas del Proyecto](../guidelines/PROJECT_RULES.md)** - Convenciones generales
- **[Especificaciones CRUD](../CRUD_TABLE_SPECIFICATIONS.md)** - Patrones de tablas
- **[Especificaciones de Servicios](../CRUD_SERVICE_SPECIFICATIONS.md)** - Patrones de servicios
- **[Manejo de Errores](../ERROR_HANDLING_README.md)** - Estrategias de error handling

---

**Última actualización:** $(date)  
**Versión:** 1.0  
**Estado:** ✅ **DEFINICIÓN COMPLETA Y OBLIGATORIA**
