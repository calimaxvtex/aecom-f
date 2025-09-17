# 📋 Patrón de Diseño CRUD - TabAdm Component

## 🎯 **Referencia Principal**
**Archivo**: `src/app/pages/adm-ecom/tabadm/tabadm.component.ts`

Este documento establece el patrón de diseño estándar para componentes CRUD basado en la implementación de `TabAdmComponent`. Úsalo como guía para crear nuevos componentes CRUD consistentes y funcionales.

---

## 🏗️ **1. ESTRUCTURA BASE DEL COMPONENTE**

### **1.1 Imports Esenciales**
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Servicios específicos del dominio
import { [Entity]Service } from '@/features/[entity]/services/[entity].service';
import { SessionService } from '@/core/services/session.service';
```

### **1.2 Configuración del Componente**
```typescript
@Component({
    selector: 'app-[entity-name]',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        TabsModule,
        TooltipModule
    ],
    providers: [MessageService],
    template: `...`,
    styles: [`...`]
})
```

---

## 🎨 **2. ESTRUCTURA DE PESTAÑAS (TABS)**

### **2.1 Configuración de Tabs**
```typescript
<p-tabs [value]="activeTabIndex.toString()" (onTabChange)="onTabChange($event)">
    <p-tablist>
        <p-tab value="0">
            <i class="pi pi-[icon] mr-2"></i>
            [Entity Name]
        </p-tab>
        <p-tab value="1">
            <i class="pi pi-eye mr-2"></i>
            Preview
        </p-tab>
    </p-tablist>
    
    <p-tabpanels>
        <!-- Panel 1: CRUD -->
        <p-tabpanel value="0">
            <!-- Contenido de la tabla CRUD -->
        </p-tabpanel>
        
        <!-- Panel 2: Preview/Detalle -->
        <p-tabpanel value="1">
            <!-- Contenido del preview -->
        </p-tabpanel>
    </p-tabpanels>
</p-tabs>
```

### **2.2 Manejo de Cambio de Tabs**
```typescript
onTabChange(event: any): void {
    const newIndex = event.index !== undefined ? parseInt(event.index) : parseInt(event.value);
    this.activeTabIndex = newIndex;
    console.log('📑 Tab cambiado a:', this.activeTabIndex);
}
```

---

## 📊 **3. TABLA CRUD ESTÁNDAR**

### **3.1 Configuración de p-table**
```typescript
<p-table
    #dt[EntityName]
    [value]="[entities]"
    [paginator]="true"
    [rows]="10"
    [showCurrentPageReport]="true"
    responsiveLayout="scroll"
    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} [entities]"
    [rowsPerPageOptions]="[10, 25, 50]"
    [globalFilterFields]="['campo1', 'campo2', 'campo3']"
    selectionMode="single"
    [(selection)]="[entity]Seleccionado"
    (onRowSelect)="on[Entity]Select($event)"
>
```

### **3.2 Caption con Controles**
```typescript
<ng-template #caption>
    <div class="flex flex-wrap gap-2 items-center justify-between">
        <input 
            pInputText
            type="text" 
            (input)="onGlobalFilter(dt[EntityName], $event)" 
            placeholder="Buscar [entities]..." 
            class="w-full sm:w-80 order-1 sm:order-0"
        />
            <div class="flex gap-2 order-0 sm:order-1">
                <!-- ✅ PATRÓN CRÍTICO: Botones solo con íconos, raised, sin clases de ancho -->
                <button 
                    (click)="cargar[Entities]()" 
                    pButton 
                    raised 
                    icon="pi pi-refresh" 
                    [loading]="loading[Entities]"
                    pTooltip="Actualizar"
                ></button>
                <button 
                    (click)="open[Entity]Form()" 
                    pButton 
                    raised 
                    icon="pi pi-plus" 
                    pTooltip="Agregar [Entity]"
                ></button>
            </div>
    </div>
</ng-template>
```

### **3.3 Headers Estándar**
```typescript
<ng-template #header>
    <tr>
        <th pSortableColumn="id" style="width: 80px">ID <p-sortIcon field="id"></p-sortIcon></th>
        <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
        <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
        <th pSortableColumn="fecha_mod" style="width: 150px">Modificado <p-sortIcon field="fecha_mod"></p-sortIcon></th>
        <th pSortableColumn="usr_m" style="width: 120px">Usuario <p-sortIcon field="usr_m"></p-sortIcon></th>
        <th style="width: 150px">Acciones</th>
    </tr>
</ng-template>
```

---

## ✏️ **4. EDICIÓN INLINE**

### **4.1 Patrón de Celda Editable**
```typescript
<td>
    <!-- Vista normal -->
    <span
        *ngIf="editingCell !== item.id + '_campo'"
        (click)="editInline[Entity](item, 'campo'); $event.stopPropagation()"
        class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
        title="Clic para editar"
    >
        {{item.campo}}
    </span>
    
    <!-- Vista de edición -->
    <div
        *ngIf="editingCell === item.id + '_campo'"
        class="inline-edit-container"
    >
        <input
            pInputText
            type="text"
            [(ngModel)]="item.campo"
            (keyup.enter)="saveInlineEdit[Entity](item, 'campo')"
            (keyup.escape)="cancelInlineEdit()"
            class="p-inputtext-sm flex-1"
            #input
            (focus)="input.select()"
            autofocus
            placeholder="[Campo] del [entity]"
        />
        <button
            pButton
            icon="pi pi-check"
            (click)="saveInlineEdit[Entity](item, 'campo')"
            class="p-button-sm p-button-success p-button-text inline-action-btn"
            pTooltip="Guardar (Enter)"
        ></button>
        <button
            pButton
            icon="pi pi-undo"
            (click)="cancelInlineEdit()"
            class="p-button-sm p-button-secondary p-button-text inline-action-btn"
            pTooltip="Deshacer (Escape)"
        ></button>
    </div>
</td>
```

### **4.2 Lógica de Edición Inline**
```typescript
// Propiedades del componente
editingCell: string | null = null;
originalValue: any = null;

// Iniciar edición
editInline[Entity](item: [Entity], field: string): void {
    this.editingCell = item.id + '_' + field;
    this.originalValue = (item as any)[field];
    console.log('✏️ Editando inline:', field, 'Valor:', this.originalValue);
}

// Guardar edición
saveInlineEdit[Entity](item: [Entity], field: string): void {
    console.log('💾 Guardando inline:', field, 'Nuevo valor:', (item as any)[field]);
    
    if ((item as any)[field] === this.originalValue) {
        console.log('ℹ️ Valor no cambió, cancelando');
        this.cancelInlineEdit();
        return;
    }

    // Obtener datos de sesión - REGLA OBLIGATORIA
    const sessionBase = this.sessionService.getApiPayloadBase();
    
    this.[entity]Service.update[Entity]Field(
        item.id, 
        field, 
        (item as any)[field],
        sessionBase
    ).subscribe({
        next: (response) => {
            console.log('✅ Campo actualizado:', response);
            
            // Actualizar metadatos locales
            item.fecha_mod = new Date().toISOString();
            item.usr_m = sessionBase.usr || item.usr_m;
            
            this.editingCell = null;
            this.originalValue = null;

            this.messageService.add({
                severity: 'success',
                summary: 'Campo Actualizado',
                detail: `${this.getFieldLabel(field)} actualizado correctamente`
            });
        },
        error: (error) => {
            console.error('❌ Error al actualizar campo:', error);
            
            // Revertir el cambio local
            (item as any)[field] = this.originalValue;
            this.editingCell = null;
            this.originalValue = null;

            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error al actualizar ${this.getFieldLabel(field)}`,
                life: 5000
            });
        }
    });
}

// Cancelar edición
cancelInlineEdit(): void {
    this.editingCell = null;
    this.originalValue = null;
}
```

---

## 🔄 **5. TOGGLE DE ESTADO**

### **5.1 Celda de Estado con Toggle**
```typescript
<td>
    <p-tag 
        [value]="getEstadoLabel(item.estado)" 
        [severity]="getEstadoSeverity(item.estado)"
        (click)="toggleEstado(item); $event.stopPropagation()"
        class="cursor-pointer hover:opacity-80 transition-opacity"
        title="Clic para cambiar"
    ></p-tag>
</td>
```

### **5.2 Lógica de Toggle con Confirmación**
```typescript
toggleEstado(item: [Entity]): void {
    const nuevoEstado = item.estado === 'A' ? 'I' : 'A';
    
    if (nuevoEstado === 'I') {
        // ⚠️ REGLA: Confirmar desactivación
        this.confirmMessage = `¿Está seguro de que desea desactivar ${item.nombre}?`;
        this.confirmHeader = 'Confirmar Desactivación';
        this.accionConfirmada = () => this.procesarCambioEstado(item, nuevoEstado);
        this.showConfirmDialog = true;
    } else {
        // Activar directamente
        this.procesarCambioEstado(item, nuevoEstado);
    }
}

private procesarCambioEstado(item: [Entity], nuevoEstado: string): void {
    const estadoAnterior = item.estado;
    item.estado = nuevoEstado;
    
    const sessionBase = this.sessionService.getApiPayloadBase();
    
    this.[entity]Service.update[Entity]Field(
        item.id, 
        'estado', 
        nuevoEstado,
        sessionBase
    ).subscribe({
        next: (response) => {
            console.log('✅ Estado actualizado:', response);
            
            item.fecha_mod = new Date().toISOString();
            item.usr_m = sessionBase.usr || item.usr_m;

            this.messageService.add({
                severity: 'success',
                summary: 'Estado Actualizado',
                detail: `[Entity] ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`
            });
        },
        error: (error) => {
            console.error('❌ Error al cambiar estado:', error);
            
            // Revertir cambio local
            item.estado = estadoAnterior;

            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cambiar el estado',
                life: 5000
            });
        }
    });
}
```

---

## 🎛️ **6. COLUMNA DE ACCIONES**

### **6.1 Botones de Acción Estándar**
```typescript
<td (click)="$event.stopPropagation()">
    <div class="flex gap-1">
        <button
            pButton
            icon="pi pi-pencil"
            (click)="open[Entity]Form(item)"
            class="p-button-sm p-button-text p-button-warning"
            pTooltip="Editar [Entity]"
        ></button>
        <button
            pButton
            icon="pi pi-trash"
            (click)="eliminar[Entity](item)"
            class="p-button-sm p-button-text p-button-danger"
            pTooltip="Eliminar [Entity]"
        ></button>
    </div>
</td>
```

---

## 🗑️ **7. ELIMINACIÓN CON CONFIRMACIÓN**

### **7.1 Modal de Confirmación**
```typescript
<p-dialog 
    [(visible)]="showConfirmDelete[Entity]" 
    header="Confirmar Eliminación"
    [modal]="true" 
    [style]="{width: '400px', minHeight: '200px'}"
    [draggable]="false" 
    [resizable]="false"
    [closable]="true"
>
    <div class="flex items-center gap-3 mb-4">
        <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
        <div>
            <h4 class="font-semibold text-lg mb-1">¿Eliminar [Entity]?</h4>
            <p class="text-gray-600">
                ¿Estás seguro de que deseas eliminar 
                <strong>"{{[entity]ToDelete?.nombre}}"</strong>?
            </p>
            <p class="text-sm text-red-600 mt-2">
                ⚠️ Esta acción no se puede deshacer.
            </p>
        </div>
    </div>
    
    <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
        <button 
            pButton 
            type="button" 
            (click)="cancelDelete[Entity]()" 
            label="Cancelar" 
            class="p-button-text"
        ></button>
        <button 
            pButton 
            type="button" 
            (click)="confirmDelete[Entity]()" 
            label="Eliminar" 
            class="p-button-danger"
            [loading]="deleting[Entity]"
        ></button>
    </div>
</p-dialog>
```

---

## ⚠️ **7.3 MODAL DE ELIMINACIÓN CON ÍCONO EMOJI**

### **7.3.1 ⚠️ REGLA CRÍTICA: ÍCONO DE ADVERTENCIA MODERNO**

**TODOS los modales de eliminación DEBEN usar el ícono emoji ⚠️ (triángulo de advertencia) con animación de rebote. NO usar íconos tradicionales de PrimeIcons.**

#### **7.3.1.1 ✅ IMPLEMENTACIÓN ESTÁNDAR:**
```html
<!-- Modal de eliminación con ícono emoji moderno -->
<p-dialog
  [(visible)]="showConfirmDelete[Entity]"
  header="Confirmar Eliminación"
  [modal]="true"
  [style]="{width: '400px', minHeight: '200px'}"
  [draggable]="false"
  [resizable]="false"
  [closable]="true"
  [maximizable]="false"
>
  <div class="flex items-center gap-4 mb-4">
    <span class="text-8xl animate-bounce">⚠️</span>
    <div>
      <h4 class="font-semibold text-xl mb-1">¿Eliminar [Entity]?</h4>
      <p class="text-gray-700 text-lg">
        ¿Estás seguro de que deseas eliminar
        <strong>"{{[entity]ToDelete?.nombre}}"</strong>?
      </p>
      <p class="text-sm text-red-600 mt-2 font-medium">
        ⚠️ Esta acción no se puede deshacer.
      </p>
    </div>
  </div>

  <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
    <button
      pButton
      type="button"
      (click)="cancelDelete[Entity]()"
      label="Cancelar"
      class="p-button-text"
    ></button>
    <button
      pButton
      type="button"
      (click)="confirmDelete[Entity]()"
      label="Eliminar"
      class="p-button-danger"
      [loading]="deleting[Entity]"
    ></button>
  </div>
</p-dialog>
```

#### **7.3.1.2 ❌ PROHIBIDO - Íconos tradicionales:**
```html
<!-- ❌ NUNCA usar íconos tradicionales -->
<i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
<i class="pi pi-trash text-red-600 text-7xl drop-shadow-lg"></i>
<i class="pi pi-times-circle text-red-500 text-5xl"></i>
```

#### **7.3.1.3 ✅ CORRECTO - Ícono emoji moderno:**
```html
<!-- ✅ SIEMPRE usar emoji con animación -->
<span class="text-8xl animate-bounce">⚠️</span>
```

### **7.3.2 CARACTERÍSTICAS DEL ÍCONO ESTÁNDAR**

#### **7.3.2.1 Dimensiones obligatorias:**
- **Tamaño**: `text-8xl` (muy grande, ocupa altura del modal)
- **Animación**: `animate-bounce` (rebote llamativo)
- **Color**: **Natural del emoji** (amarillo con borde negro)

#### **7.3.2.2 Posicionamiento y layout:**
- **Contenedor**: `flex items-center gap-4`
- **Ícono primero**: A la izquierda del texto
- **Separación**: `gap-4` para mejor proporción
- **Texto alineado**: Con `items-center`

### **7.3.3 BENEFICIOS DEL ÍCONO EMOJI**

#### **✅ Ventajas:**
- **Universal**: Reconocible en cualquier dispositivo
- **Expresivo**: Transmite urgencia y advertencia claramente
- **Moderno**: Estilo actual y llamativo
- **Responsive**: Se adapta bien a diferentes tamaños
- **Accesible**: Compatible con lectores de pantalla
- **Ligero**: No requiere carga de fuentes adicionales

#### **🎯 Impacto visual:**
- **Antes**: Ícono pequeño y discreto que podía pasar desapercibido
- **Después**: Ícono gigante que rebota y **llama la atención inmediatamente**

### **7.3.4 IMPLEMENTACIÓN EN COMPONENTE**

#### **7.3.4.1 Componente de referencia:**
**Archivo**: `src/app/pages/system/amenu/amenu.component.ts`

#### **7.3.4.2 Ejemplo implementado:**
```typescript
// En el template del componente amenu
<div class="flex items-center gap-4 mb-4">
  <span class="text-8xl animate-bounce">⚠️</span>
  <div>
    <h4 class="font-semibold text-xl mb-1">¿Eliminar Menú?</h4>
    <p class="text-gray-700 text-lg">
      ¿Estás seguro de que deseas eliminar el menú
      <strong>"{{menuToDelete?.label}}"</strong>?
    </p>
    <p class="text-sm text-red-600 mt-2 font-medium">
      ⚠️ Esta acción no se puede deshacer.
    </p>
  </div>
</div>
```

### **7.3.5 CHECKLIST DE IMPLEMENTACIÓN**

#### **✅ Verificación obligatoria:**
- [ ] Modal de eliminación usa `<span class="text-8xl animate-bounce">⚠️</span>`
- [ ] Ícono posicionado a la izquierda del texto con `gap-4`
- [ ] NO se usan íconos tradicionales de PrimeIcons
- [ ] Texto del modal está bien alineado con `items-center`
- [ ] Animación de rebote funciona correctamente
- [ ] Ícono es claramente visible y llamativo

---

### **7.2 Lógica de Eliminación**
```typescript
// ⚠️ REGLA: Siempre pedir confirmación para eliminar
eliminar[Entity](item: [Entity]): void {
    this.[entity]ToDelete = item;
    this.showConfirmDelete[Entity] = true;
}

confirmDelete[Entity](): void {
    if (this.[entity]ToDelete) {
        this.deleting[Entity] = true;
        
        const sessionBase = this.sessionService.getApiPayloadBase();
        const payload = {
            action: 'DL' as const,
            id: this.[entity]ToDelete.id,
            ...sessionBase
        };
        
        this.[entity]Service.delete[Entity](payload).subscribe({
            next: (response) => {
                console.log('✅ [Entity] eliminado:', response);
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: '[Entity] eliminado correctamente'
                });
                
                // Si el item eliminado estaba seleccionado, deseleccionar
                if (this.[entity]Seleccionado?.id === this.[entity]ToDelete?.id) {
                    this.[entity]Seleccionado = null;
                }
                
                this.cancelDelete[Entity]();
                this.cargar[Entities]();
            },
            error: (error) => {
                console.error('❌ Error al eliminar [entity]:', error);
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar el [entity]',
                    life: 5000
                });
                
                this.deleting[Entity] = false;
            }
        });
    }
}

cancelDelete[Entity](): void {
    this.showConfirmDelete[Entity] = false;
    this.[entity]ToDelete = null;
    this.deleting[Entity] = false;
}
```

---

## 📝 **8. FORMULARIO MODAL**

### **8.1 Estructura del Modal**
```typescript
<p-dialog 
    [(visible)]="show[Entity]Modal" 
    [header]="isEditing[Entity] ? 'Editar [Entity]' : 'Nuevo [Entity]'"
    [modal]="true" 
    [style]="{width: '700px', maxHeight: '80vh'}"
    [draggable]="false" 
    [resizable]="false"
    [closable]="true"
>
    <form [formGroup]="[entity]Form" (ngSubmit)="save[Entity]()">
        <div class="grid grid-cols-1 gap-4" style="max-height: 60vh; overflow-y: auto; padding-right: 8px;">
            <!-- Campos del formulario -->
        </div>
        
        <!-- Botones -->
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
            <button 
                pButton 
                type="button" 
                (click)="close[Entity]Form()" 
                label="Cancelar" 
                class="p-button-text"
            ></button>
            <button 
                pButton 
                type="button" 
                (click)="save[Entity]()" 
                [label]="isEditing[Entity] ? 'Actualizar' : 'Crear'"
                [disabled]="![entity]Form.valid || saving[Entity]"
                [loading]="saving[Entity]"
                class="p-button-success"
            ></button>
        </div>
    </form>
</p-dialog>
```

### **8.2 Lógica del Formulario**
```typescript
// Inicialización
initializeForms(): void {
    this.[entity]Form = this.fb.group({
        campo1: ['', [Validators.required]],
        campo2: [''],
        estado: ['A', [Validators.required]]
    });
}

// Abrir formulario
open[Entity]Form(item?: [Entity]): void {
    this.isEditing[Entity] = !!item;
    
    if (item) {
        console.log('✏️ Editando [entity]:', item);
        this.[entity]Form.patchValue({
            campo1: item.campo1,
            campo2: item.campo2,
            estado: item.estado
        });
    } else {
        console.log('➕ Creando nuevo [entity]');
        this.[entity]Form.reset({
            estado: 'A'
        });
    }
    
    this.show[Entity]Modal = true;
}

// Guardar
save[Entity](): void {
    if (this.[entity]Form.valid) {
        this.saving[Entity] = true;
        const formData = this.[entity]Form.value;
        
        const sessionBase = this.sessionService.getApiPayloadBase();
        
        if (this.isEditing[Entity] && this.[entity]Seleccionado) {
            // Actualizar
            const payload = {
                action: 'UP' as const,
                id: this.[entity]Seleccionado.id,
                ...formData,
                ...sessionBase
            };
            
            this.[entity]Service.update[Entity](payload).subscribe({
                next: (response) => {
                    console.log('✅ [Entity] actualizado:', response);
                    this.handleSaveSuccess('[Entity] actualizado correctamente');
                },
                error: (error) => this.handleSaveError(error, 'actualizar')
            });
        } else {
            // Crear
            const payload = {
                action: 'IN' as const,
                ...formData,
                ...sessionBase
            };
            
            this.[entity]Service.create[Entity](payload).subscribe({
                next: (response) => {
                    console.log('✅ [Entity] creado:', response);
                    this.handleSaveSuccess('[Entity] creado correctamente');
                },
                error: (error) => this.handleSaveError(error, 'crear')
            });
        }
    }
}
```

---

## 🎭 **9. ESTADOS Y PROPIEDADES**

### **9.1 Propiedades Estándar del Componente**
```typescript
export class [Entity]Component implements OnInit {
    // Datos
    [entities]: [Entity][] = [];
    [entity]Seleccionado: [Entity] | null = null;

    // Estados de carga
    loading[Entities] = false;
    saving[Entity] = false;
    deleting[Entity] = false;

    // Estados de modales
    show[Entity]Modal = false;
    showConfirmDelete[Entity] = false;
    showConfirmDialog = false;

    // Formularios
    [entity]Form!: FormGroup;
    isEditing[Entity] = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Confirmaciones
    [entity]ToDelete: [Entity] | null = null;
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;

    // Tabs
    activeTabIndex = 0;
}
```

---

## 🎨 **10. ESTILOS CSS ESTÁNDAR**

```css
.inline-edit-container {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.inline-action-btn {
    padding: 0.25rem;
    min-width: 2rem;
}

.editable-cell {
    display: block;
    min-height: 1.5rem;
}

.p-datatable .p-datatable-tbody > tr > td {
    padding: 0.5rem;
    vertical-align: middle;
}

.p-datatable .p-datatable-tbody > tr:hover {
    background-color: #f8fafc;
}

/* Estilos para botones de tabla */
.p-button.p-button-text.p-button-sm {
    width: 2rem !important;
    height: 2rem !important;
    min-width: 2rem !important;
    padding: 0 !important;
    border-radius: 0.25rem !important;
}

.p-button.p-button-text.p-button-sm .p-button-icon {
    font-size: 0.875rem !important;
}

/* Fila seleccionada */
.bg-blue-50 {
    background-color: #eff6ff !important;
}

/* Scroll personalizado para formularios */
.grid::-webkit-scrollbar {
    width: 8px;
}

.grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.grid::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.grid::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
```

---

## 🔧 **11. MÉTODOS DE UTILIDAD**

### **11.1 Manejo de Estados**
```typescript
getEstadoLabel(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
}

getEstadoSeverity(estado: string): 'success' | 'danger' {
    return estado === 'A' ? 'success' : 'danger';
}

getEstadosOptions() {
    return [
        { label: 'Activo', value: 'A' },
        { label: 'Inactivo', value: 'I' }
    ];
}
```

### **11.2 Filtrado Global**
```typescript
onGlobalFilter(table: any, event: any): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}
```

### **11.3 Manejo de Errores**
```typescript
private handleSaveSuccess(message: string): void {
    this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: message
    });
    
    this.close[Entity]Form();
    this.cargar[Entities]();
    this.saving[Entity] = false;
}

private handleSaveError(error: any, operation: string): void {
    console.error(`❌ Error al ${operation} [entity]:`, error);
    
    this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Error al ${operation} el [entity]`,
        life: 5000
    });
    
    this.saving[Entity] = false;
}
```

---

## ⚠️ **12. REGLAS CRÍTICAS**

### **12.1 Inyección de Sesión (OBLIGATORIO)**
- **Todos los métodos POST/PUT/DELETE** deben incluir `usr` e `id_session`
- Usar `this.sessionService.getApiPayloadBase()` en cada operación

### **12.2 Confirmaciones (OBLIGATORIO)**
- **Eliminación**: Siempre pedir confirmación con modal
- **Desactivación**: Pedir confirmación para cambio de estado A→I
- **Activación**: Permitir sin confirmación (I→A)

### **12.3 Edición Inline**
- **Enter**: Guardar cambios
- **Escape**: Cancelar y revertir
- **Click fuera**: Mantener en edición (no auto-guardar)
- **Revertir**: En caso de error, restaurar valor original

### **12.4 Estados de Carga**
- **loading**: Para cargar datos iniciales
- **saving**: Para operaciones de guardado
- **deleting**: Para operaciones de eliminación
- Deshabilitar controles durante operaciones

### **12.5 Botones de Caption (CRÍTICO)**
- **Solo íconos**: Sin `label`, solo `icon`
- **Raised**: Usar `pButton raised`
- **Sin clases de ancho**: No usar `class="w-full sm:w-auto"`
- **Con tooltips**: Siempre incluir `pTooltip` descriptivo
- **Orden**: Refresh primero, luego Add

### **12.6 Campos Booleanos/Estado (CRÍTICO)**
- **Usar p-tag clickeable**: No `p-togglebutton`, usar `p-tag` con click
- **Confirmación para desactivar**: Siempre pedir confirmación cuando se cambia de activo/visible a inactivo/oculto
- **Activación directa**: Sin confirmación cuando se activa/muestra
- **Colores**: Verde (`success`) para activo, Rojo (`danger`) para inactivo
- **Hover effect**: `cursor-pointer hover:opacity-80 transition-opacity`
- **Labels descriptivos**: "Activo/Inactivo", "Visible/Oculto", "Con Sub-Items/Sin Sub-Items"

### **12.7 Manejo de Errores**
- **Console logging**: Siempre con emojis identificadores
- **Toast messages**: Error con `life: 5000`, éxito con `life: 3000`
- **Revertir cambios**: En caso de error en operaciones optimistas

---

## 📋 **13. CHECKLIST DE IMPLEMENTACIÓN**

### **Estructura Base**
- [ ] Componente standalone con imports correctos
- [ ] Provider de MessageService
- [ ] Estructura de tabs (CRUD + Preview)
- [ ] Manejo de activeTabIndex

### **Tabla CRUD**
- [ ] p-table con paginación y filtros
- [ ] Caption con botones de refresh y add (solo íconos, raised, sin clases de ancho)
- [ ] Botones con tooltips descriptivos
- [ ] Headers con sorting
- [ ] Selección de fila
- [ ] Columna de acciones

### **Edición Inline**
- [ ] Campos editables con click
- [ ] Enter para guardar, Escape para cancelar
- [ ] Botones de confirmar/cancelar inline
- [ ] Revertir en caso de error

### **Estados y Toggles**
- [ ] Toggle de estado con confirmación para desactivar
- [ ] p-tag con colores según estado
- [ ] Actualización optimista con rollback

### **Formulario Modal**
- [ ] ReactiveForm con validaciones
- [ ] Modal responsive
- [ ] Modo crear/editar
- [ ] Botones de cancelar/guardar

### **Eliminación**
- [ ] Modal de confirmación obligatorio
- [ ] Mensaje claro con nombre del item
- [ ] Advertencia de acción irreversible
- [ ] Estado de loading en botón

### **Servicios e Integración**
- [ ] Inyección de sesión en todas las operaciones
- [ ] Manejo de respuestas API flexible
- [ ] Error handling con toast messages
- [ ] Console logging con identificadores

### **Estilos y UX**
- [ ] Estilos CSS estándar aplicados
- [ ] Botones con tooltips
- [ ] Transiciones suaves
- [ ] Estados visuales claros

---

## 🚀 **14. EJEMPLO DE USO**

Para crear un nuevo componente CRUD siguiendo este patrón:

1. **Copiar** la estructura base del `TabAdmComponent`
2. **Reemplazar** todas las referencias `[Entity]` con el nombre de tu entidad
3. **Adaptar** los campos específicos en tabla y formulario
4. **Configurar** el servicio correspondiente
5. **Ajustar** las validaciones según tus reglas de negocio
6. **Probar** todas las operaciones CRUD
7. **Verificar** que se siguen las reglas críticas

---

## 🔍 **15. FILTROS CONTEXTUALES POR CLICK DERECHO (OPCIONAL)**

### **15.1 ⚠️ REGLA CRÍTICA: SISTEMA DE FILTROS ESTÁNDAR**

**Los filtros en tablas CRUD son OPCIONALES, pero SI se implementan, DEBEN seguir EXCLUSIVAMENTE este patrón: filtros contextuales por click derecho en los headers de tabla, NO paneles de filtros permanentes.**

### **15.1.1 ¿Cuándo implementar filtros?**

#### **✅ IMPLEMENTAR filtros cuando:**
- La tabla tiene **más de 25-50 registros** regularmente
- Los usuarios necesitan **buscar datos específicos** frecuentemente
- Hay **múltiples campos** que requieren filtrado independiente
- Se requiere **filtrado por estado** (activo/inactivo, visible/oculto, etc.)
- El cliente **solicita explícitamente** funcionalidad de filtros

#### **❌ NO implementar filtros cuando:**
- La tabla tiene **menos de 20 registros** típicamente
- Los datos son **principalmente de solo lectura**
- El **tiempo de desarrollo es limitado** y los filtros no son prioritarios
- La tabla es para **configuraciones simples** o **datos de referencia**

#### **🎯 Regla práctica:**
```
Si la tabla necesita paginación (>10 registros), probablemente necesita filtros.
Si la tabla cabe en una pantalla sin scroll, los filtros son opcionales.
```

### **15.2 ⚠️ REGLA CRÍTICA: VIEWCHILD OBLIGATORIO**

**TODOS los componentes que implementen filtros DEBEN usar ViewChild para acceder a la instancia de p-table. NO usar document.querySelector().**

#### **15.2.1 Import y ViewChild obligatorios:**
```typescript
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';

@Component({
  // ... configuración
})
export class EntityCrudComponent implements OnInit {
  @ViewChild('dt') dt!: Table;  // ⚠️ OBLIGATORIO para filtros
  
  // ... resto del componente
}
```

#### **15.2.2 ❌ PROHIBIDO - No usar document.querySelector:**
```typescript
// ❌ NUNCA HACER ESTO - No funciona desde modals
const dt = document.querySelector('p-table') as any;
if (dt && dt.dt) {
  dt.dt.filter(value, column, mode);
}
```

#### **15.2.3 ✅ CORRECTO - Usar ViewChild:**
```typescript
// ✅ SIEMPRE HACER ESTO - Funciona desde cualquier contexto
applyColumnFilter(): void {
  if (!this.activeColumn || !this.dt) return;
  
  this.dt.filter(filterValue, this.activeColumn, filterMode);
}
```

### **15.3 Configuración de la Tabla**

#### **Propiedades obligatorias de p-table:**
```typescript
<p-table
  #dt
  [value]="items"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[10,25,50]"
  [loading]="loading"
  responsiveLayout="scroll"
  selectionMode="single"
  [(selection)]="selectedItem"
  dataKey="id_[entity]"
  [sortMode]="'multiple'"                    // ✅ OBLIGATORIO: Ordenamiento múltiple
  [globalFilterFields]="['field1','field2']" // ✅ OBLIGATORIO: Campos para búsqueda global
  [filterDelay]="300"                        // ✅ OBLIGATORIO: Debounce para rendimiento
>
```

### **15.4 Headers con Filtros Contextuales**

#### **Template estándar para headers:**
```html
<ng-template #header>
  <tr>
    <th 
      style="width:90px" 
      pSortableColumn="id_entity"
      (contextmenu)="openColumnFilter($event, 'id_entity')"
      class="cursor-context-menu"
      title="Click derecho para filtrar"
    >
      ID <p-sortIcon field="id_entity"></p-sortIcon>
    </th>
    <th 
      pSortableColumn="name"
      (contextmenu)="openColumnFilter($event, 'name')"
      class="cursor-context-menu"
      title="Click derecho para filtrar"
    >
      Nombre <p-sortIcon field="name"></p-sortIcon>
    </th>
    <th 
      pSortableColumn="active"
      (contextmenu)="openColumnFilter($event, 'active')"
      class="cursor-context-menu"
      title="Click derecho para filtrar"
    >
      Activo <p-sortIcon field="active"></p-sortIcon>
    </th>
    <!-- Columnas sin filtro (Acciones, Icono) NO llevan eventos contextmenu -->
    <th style="width:140px">Acciones</th>
  </tr>
</ng-template>
```

#### **CSS obligatorio para headers:**
```html
<style>
  .cursor-context-menu {
    cursor: context-menu;
    position: relative;
  }
  .cursor-context-menu:hover {
    background-color: rgba(59, 130, 246, 0.05);
  }
</style>
```

### **15.5 Dialog de Filtros Contextuales**

#### **Template estándar del dialog:**
```html
<p-dialog 
  [(visible)]="showColumnFilter" 
  [modal]="true" 
  [draggable]="false" 
  [style]="{width: '300px'}" 
  [closable]="true" 
  [dismissableMask]="true" 
  [resizable]="false" 
  [header]="'Filtrar ' + getColumnDisplayName(activeColumn)"
>
  <div class="filter-content">
    <!-- Input para campos de texto -->
    <div *ngIf="getFilterType(activeColumn) === 'text'" class="mb-3">
      <label class="block text-sm font-medium mb-1">Buscar texto</label>
      <input 
        pInputText 
        [(ngModel)]="activeFilterValue"
        (input)="applyColumnFilter()"
        [placeholder]="'Buscar en ' + getColumnDisplayName(activeColumn) + '...'"
        class="w-full"
        autofocus
      />
    </div>
    
    <!-- Input para campos numéricos -->
    <div *ngIf="getFilterType(activeColumn) === 'number'" class="mb-3">
      <label class="block text-sm font-medium mb-1">Buscar número</label>
      <input 
        pInputText 
        type="number"
        [(ngModel)]="activeFilterValue"
        (input)="applyColumnFilter()"
        placeholder="Ingresa un número..."
        class="w-full"
        autofocus
      />
    </div>
    
    <!-- ⚠️ CRÍTICO: P-TAGS para campos booleanos (NO p-select) -->
    <div *ngIf="getFilterType(activeColumn) === 'boolean'" class="mb-3">
      <label class="block text-sm font-medium mb-1">Seleccionar valor</label>
      <div class="flex gap-2">
        <p-tag
          value="Todos"
          [severity]="activeFilterValue === '' ? 'info' : 'secondary'"
          (click)="setBooleanFilter('')"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          title="Mostrar todos"
        ></p-tag>
        <p-tag
          value="Sí"
          [severity]="activeFilterValue === true ? 'success' : 'secondary'"
          (click)="setBooleanFilter(true)"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          title="Solo elementos activos/visibles"
        ></p-tag>
        <p-tag
          value="No"
          [severity]="activeFilterValue === false ? 'danger' : 'secondary'"
          (click)="setBooleanFilter(false)"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          title="Solo elementos inactivos/ocultos"
        ></p-tag>
      </div>
    </div>
    
    <!-- Botones de acción -->
    <div class="flex gap-2 justify-end mt-4">
      <button 
        pButton 
        label="Limpiar" 
        icon="pi pi-times"
        size="small" 
        severity="secondary"
        outlined
        (click)="clearColumnFilter()"
      ></button>
      <button 
        pButton 
        label="Cerrar" 
        icon="pi pi-check"
        size="small" 
        (click)="closeColumnFilter()"
      ></button>
    </div>
  </div>
</p-dialog>
```

### **15.6 Propiedades Obligatorias del Componente**

```typescript
export class EntityCrudComponent implements OnInit {
  // ========== FILTROS CONTEXTUALES (OBLIGATORIO) ==========
  showColumnFilter = false;
  activeColumn = '';
  activeFilterValue: any = '';
  
  // Opciones para filtros booleanos (OBLIGATORIO)
  booleanFilterOptions = [
    { label: 'Sí', value: true },
    { label: 'No', value: false }
  ];
}
```

### **15.7 Métodos Obligatorios para Filtros**

#### **15.7.1 Abrir filtro contextual:**
```typescript
/**
 * ⚠️ MÉTODO OBLIGATORIO: Muestra el filtro contextual para una columna específica
 */
openColumnFilter(event: MouseEvent, column: string): void {
  event.preventDefault(); // Prevenir menú contextual del browser
  
  this.activeColumn = column;
  this.activeFilterValue = this.getCurrentFilterValue(column);
  this.showColumnFilter = true;
  
  console.log('🔍 Abriendo filtro contextual para:', column);
}
```

#### **15.7.2 Aplicar filtro:**
```typescript
/**
 * ⚠️ MÉTODO OBLIGATORIO: Aplica el filtro a la columna activa
 */
applyColumnFilter(): void {
  if (!this.activeColumn) return;

  // ⚠️ CRÍTICO: Usar ViewChild, NO document.querySelector
  if (!this.activeColumn || !this.dt) return;

  const filterMode = this.getFilterType(this.activeColumn) === 'boolean' ? 'equals' : 'contains';
  
  // Para filtros booleanos, si el valor es string vacío, limpiar el filtro
  const filterValue = (this.getFilterType(this.activeColumn) === 'boolean' && this.activeFilterValue === '') 
    ? null 
    : this.activeFilterValue;
  
  if (filterValue === null) {
    this.dt.filter('', this.activeColumn, 'contains'); // Limpiar filtro
  } else {
    this.dt.filter(filterValue, this.activeColumn, filterMode);
  }
  
  console.log('🔍 Filtro aplicado con ViewChild:', {
    columna: this.activeColumn,
    valorOriginal: this.activeFilterValue,
    valorFiltro: filterValue,
    modo: filterMode,
    tablaDisponible: !!this.dt  // ✅ Verificar disponibilidad
  });
}
```

#### **15.7.3 Limpiar filtro:**
```typescript
/**
 * ⚠️ MÉTODO OBLIGATORIO: Limpia el filtro de la columna activa
 */
clearColumnFilter(): void {
  if (!this.activeColumn) return;

  // ⚠️ CRÍTICO: Usar ViewChild, NO document.querySelector
  if (!this.activeColumn || !this.dt) return;

  this.dt.filter('', this.activeColumn, 'contains');
  this.activeFilterValue = '';
  
  console.log('🧹 Filtro limpiado para columna con ViewChild:', this.activeColumn);
  
  // Cerrar dialog
  this.showColumnFilter = false;
  
  this.messageService.add({
    severity: 'info',
    summary: 'Filtro Eliminado',
    detail: `Filtro de ${this.getColumnDisplayName(this.activeColumn)} eliminado`,
    life: 2000
  });
}
```

#### **15.7.4 Filtros booleanos con p-tags:**
```typescript
/**
 * ⚠️ MÉTODO OBLIGATORIO: Establece un filtro booleano usando p-tags
 */
setBooleanFilter(value: boolean | string): void {
  this.activeFilterValue = value;
  this.applyColumnFilter();
  
  console.log('🔘 Filtro booleano establecido:', {
    columna: this.activeColumn,
    valor: value,
    tipo: typeof value
  });
}
```

#### **15.7.5 Métodos auxiliares obligatorios:**
```typescript
/**
 * ⚠️ MÉTODO OBLIGATORIO: Obtiene el tipo de filtro según la columna
 */
getFilterType(column: string): 'text' | 'boolean' | 'number' {
  // ADAPTAR según las columnas de tu entidad
  const booleanColumns = ['active', 'visible', 'enabled', 'swItems'];
  const numberColumns = ['id', 'order', 'count', 'price'];
  
  if (booleanColumns.includes(column)) return 'boolean';
  if (numberColumns.includes(column)) return 'number';
  return 'text';
}

/**
 * ⚠️ MÉTODO OBLIGATORIO: Obtiene el nombre amigable de la columna
 */
getColumnDisplayName(column: string): string {
  // ADAPTAR según las columnas de tu entidad
  const displayNames: { [key: string]: string } = {
    'id': 'ID',
    'name': 'Nombre',
    'active': 'Activo',
    'created_at': 'Fecha de Creación'
  };
  
  return displayNames[column] || column;
}

/**
 * ⚠️ MÉTODO OBLIGATORIO: Obtiene el valor actual del filtro para una columna
 */
getCurrentFilterValue(column: string): any {
  // ⚠️ CRÍTICO: Usar ViewChild, NO document.querySelector
  if (!this.dt) return this.getFilterType(column) === 'boolean' ? '' : '';
  
  const filters = (this.dt as any).filters;
  if (filters && filters[column]) {
    const filter = filters[column];
    const value = Array.isArray(filter) ? filter[0]?.value : filter.value;
    
    // Para filtros booleanos, manejar valores null/undefined como string vacío
    if (this.getFilterType(column) === 'boolean') {
      return value === null || value === undefined ? '' : value;
    }
    
    return value || '';
  }
  
  // Valor por defecto según el tipo
  return this.getFilterType(column) === 'boolean' ? '' : '';
}

/**
 * ⚠️ MÉTODO OBLIGATORIO: Cierra el dialog de filtro contextual
 */
closeColumnFilter(): void {
  this.showColumnFilter = false;
  console.log('🔍 Dialog de filtro cerrado');
}
```

### **15.7 ⚠️ REGLAS CRÍTICAS DE IMPLEMENTACIÓN**

#### **✅ OBLIGATORIO:**
- **Headers con cursor contextual** - `cursor-context-menu` class
- **Event handler** - `(contextmenu)="openColumnFilter($event, 'column')"`
- **Tooltips informativos** - `title="Click derecho para filtrar"`
- **P-tags para booleanos** - NO usar p-select (se corta en dialogs)
- **Filtros en tiempo real** - `(input)="applyColumnFilter()"` para texto/número
- **Autofocus** - En el primer input del dialog
- **Logging detallado** - Console logs con emojis para debugging
- **Notificaciones** - MessageService para acciones de limpieza

#### **❌ PROHIBIDO:**
- **Paneles de filtros permanentes** - Abarrotan la interfaz
- **P-select en dialogs** - Se cortan por los límites del modal
- **Filtros inline en headers** - Hacen la tabla muy alta
- **Botones de toggle para filtros** - Innecesarios con click derecho
- **Múltiples dialogs de filtro** - Solo uno activo por vez

### **15.8 Estados Visuales de P-tags Booleanos**

```typescript
// Estados de severity según valor activo:
// "Todos" (string vacío): severity="info" (azul)
// "Sí" (true): severity="success" (verde) 
// "No" (false): severity="danger" (rojo)
// Inactivos: severity="secondary" (gris)
```

### **15.9 Experiencia de Usuario Esperada**

1. **Headers limpios** - Solo ordenamiento visible por defecto
2. **Click derecho intuitivo** - Cursor contextual indica funcionalidad
3. **Dialog específico** - Solo para la columna seleccionada  
4. **Filtros inmediatos** - Aplicación en tiempo real
5. **Feedback visual** - P-tags con colores según estado
6. **Gestión simple** - Limpiar + cerrar, o solo cerrar

---

## 🚨 **16. TROUBLESHOOTING DE FILTROS**

### **16.1 ❌ PROBLEMA: "Los filtros no funcionan desde el modal"**

#### **🔍 Síntomas:**
- Los filtros no se aplican al hacer clic en p-tags o escribir en inputs
- No hay errores en consola, pero la tabla no se filtra
- El filtro funciona en otros contextos pero no desde el dialog

#### **✅ SOLUCIÓN:**
```typescript
// ❌ INCORRECTO - No funciona desde modals
const dt = document.querySelector('p-table') as any;
if (dt && dt.dt) {
  dt.dt.filter(value, column, mode);
}

// ✅ CORRECTO - Funciona desde cualquier contexto
@ViewChild('dt') dt!: Table;

applyColumnFilter(): void {
  if (!this.activeColumn || !this.dt) return;
  this.dt.filter(filterValue, this.activeColumn, filterMode);
}
```

### **16.2 ❌ PROBLEMA: "ViewChild es undefined"**

#### **🔍 Síntomas:**
- Error: "Cannot read property 'filter' of undefined"
- `this.dt` es `undefined` al intentar filtrar

#### **✅ SOLUCIÓN:**
```typescript
// ✅ Verificar que la tabla esté inicializada
applyColumnFilter(): void {
  if (!this.activeColumn || !this.dt) {
    console.warn('⚠️ Tabla no disponible:', { 
      activeColumn: this.activeColumn, 
      dt: !!this.dt 
    });
    return;
  }
  
  this.dt.filter(filterValue, this.activeColumn, filterMode);
}
```

### **16.3 ❌ PROBLEMA: "Filtros booleanos no funcionan"**

#### **🔍 Síntomas:**
- Filtros de texto y número funcionan, pero los booleanos no
- Los p-tags se seleccionan pero no filtran

#### **✅ SOLUCIÓN:**
```typescript
// ✅ Verificar tipos de datos y modo de filtro
applyColumnFilter(): void {
  const filterMode = this.getFilterType(this.activeColumn) === 'boolean' ? 'equals' : 'contains';
  
  // ✅ Para booleanos, usar null para "limpiar", no string vacío
  const filterValue = (this.getFilterType(this.activeColumn) === 'boolean' && this.activeFilterValue === '') 
    ? null 
    : this.activeFilterValue;
  
  if (filterValue === null) {
    this.dt.filter('', this.activeColumn, 'contains'); // Limpiar
  } else {
    this.dt.filter(filterValue, this.activeColumn, filterMode); // Filtrar
  }
}
```

### **16.4 ❌ PROBLEMA: "Template reference 'dt' no encontrada"**

#### **🔍 Síntomas:**
- Error de compilación: "Cannot find a reference to 'dt'"
- ViewChild no puede encontrar la tabla

#### **✅ SOLUCIÓN:**
```html
<!-- ✅ Asegurar que p-table tenga la referencia #dt -->
<p-table
  #dt
  [value]="items"
  [sortMode]="'multiple'"
  [globalFilterFields]="['field1','field2']"
  [filterDelay]="300"
>
  <!-- contenido de la tabla -->
</p-table>
```

### **16.5 🔧 DEBUG: Verificar estado de filtros**

#### **Agregar logs de debugging:**
```typescript
applyColumnFilter(): void {
  console.log('🔍 Estado del filtro:', {
    activeColumn: this.activeColumn,
    activeFilterValue: this.activeFilterValue,
    filterType: this.getFilterType(this.activeColumn),
    dtDisponible: !!this.dt,
    dtFilters: this.dt ? (this.dt as any).filters : 'N/A'
  });
  
  // ... resto del método
}
```

---

## 📝 **17. FORMULARIOS CRUD - LABELS FLOTANTES**

### **17.1 ⚠️ REGLA CRÍTICA: LABELS FLOTANTES OBLIGATORIOS**

**TODOS los formularios CRUD DEBEN usar labels flotantes con `p-floatLabel` y `variant="on"`. NO usar labels tradicionales externos.**

#### **17.1.1 Import obligatorio:**
```typescript
// ✅ OBLIGATORIO en todos los componentes con formularios
import { FloatLabelModule } from 'primeng/floatlabel';

// ✅ Agregar a imports del componente
imports: [
  // ... otros módulos
  FloatLabelModule,
  // ... otros módulos
]
```

#### **17.1.2 ❌ PROHIBIDO - Labels tradicionales:**
```html
<!-- ❌ NUNCA usar este patrón -->
<label class="block text-sm font-medium mb-1">Nombre del campo</label>
<input pInputText formControlName="campo" class="w-full" />
```

#### **17.1.3 ✅ CORRECTO - Labels flotantes:**
```html
<!-- ✅ SIEMPRE usar este patrón -->
<p-floatLabel variant="on">
  <input pInputText formControlName="campo" placeholder="Placeholder descriptivo" class="w-full" />
  <label>Nombre del campo</label>
</p-floatLabel>
```

### **17.2 TIPOS DE CAMPOS Y SUS IMPLEMENTACIONES**

#### **17.2.1 Input de texto básico:**
```html
<p-floatLabel variant="on">
  <input pInputText
         formControlName="nombre"
         placeholder="Ingrese el nombre"
         class="w-full"
         maxlength="100" />
  <label>Nombre *</label>
</p-floatLabel>
```

#### **17.2.2 Input numérico:**
```html
<p-floatLabel variant="on">
  <p-inputNumber
    formControlName="cantidad"
    [min]="0"
    [max]="9999"
    placeholder="0"
    class="w-full">
  </p-inputNumber>
  <label>Cantidad</label>
</p-floatLabel>
```

#### **17.2.3 Select/Dropdown:**
```html
<p-floatLabel variant="on">
  <p-select
    formControlName="categoria"
    [options]="categoriaOptions"
    optionLabel="label"
    optionValue="value"
    placeholder="Seleccione una categoría"
    class="w-full"
    appendTo="body"
    [style]="{'z-index': '9999'}">
  </p-select>
  <label>Categoría *</label>
</p-floatLabel>
```

#### **17.2.4 AutoComplete:**
```html
<p-floatLabel variant="on">
  <p-autoComplete
    formControlName="cliente"
    [suggestions]="clientesFiltrados"
    (completeMethod)="filtrarClientes($event)"
    field="nombre"
    optionLabel="nombre"
    placeholder="Buscar cliente"
    class="w-full"
    [dropdown]="true"
    [showClear]="true">
  </p-autoComplete>
  <label>Cliente</label>
</p-floatLabel>
```

#### **17.2.5 TextArea:**
```html
<p-floatLabel variant="on">
  <textarea
    pInputTextarea
    formControlName="descripcion"
    placeholder="Ingrese la descripción detallada"
    class="w-full"
    rows="3"
    maxlength="500">
  </textarea>
  <label>Descripción</label>
</p-floatLabel>
```

#### **17.2.6 Campos con selectores personalizados:**
```html
<p-floatLabel variant="on">
  <div class="flex items-center gap-2">
    <i [class]="iconModel || 'pi pi-question-circle'" class="text-lg"></i>
    <span class="text-sm text-gray-600">{{ iconModel || 'Sin selección' }}</span>
    <button pButton type="button" icon="pi pi-chevron-down" class="p-button-text p-button-sm"
            (click)="toggleSelector()" pTooltip="Seleccionar opción"></button>
  </div>
  <label>Icono</label>
</p-floatLabel>
```

### **17.3 CAMPOS BOOLEANOS - EXCEPCIÓN A LA REGLA**

#### **17.3.1 Campos booleanos NO usan labels flotantes:**
```html
<!-- ✅ CORRECTO para campos booleanos -->
<div class="flex items-center gap-2">
  <p-tag
    [value]="campoBoolean ? 'Sí' : 'No'"
    [severity]="campoBoolean ? 'success' : 'danger'"
    (click)="toggleCampoBoolean()"
    class="cursor-pointer hover:opacity-80 transition-opacity"
    title="Clic para cambiar">
  </p-tag>
  <span>¿Campo booleano?</span>
</div>
```

#### **17.3.2 ToggleButton alternativo:**
```html
<!-- ✅ También válido para booleanos -->
<div class="flex items-center gap-2">
  <label class="text-sm font-medium">¿Campo booleano?</label>
  <p-toggleSwitch
    formControlName="campoBoolean"
    onLabel="Sí"
    offLabel="No">
  </p-toggleSwitch>
</div>
```

### **17.4 LAYOUT Y ORGANIZACIÓN DE FORMULARIOS**

#### **17.4.1 Grid responsive básico:**
```html
<form [formGroup]="form" (ngSubmit)="submitForm()">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

    <!-- Campo 1 -->
    <div>
      <p-floatLabel variant="on">
        <input pInputText formControlName="campo1" placeholder="Campo 1" class="w-full" />
        <label>Campo 1 *</label>
      </p-floatLabel>
    </div>

    <!-- Campo 2 -->
    <div>
      <p-floatLabel variant="on">
        <input pInputText formControlName="campo2" placeholder="Campo 2" class="w-full" />
        <label>Campo 2</label>
      </p-floatLabel>
    </div>

  </div>
</form>
```

#### **17.4.2 Campos relacionados en fila:**
```html
<!-- Campos relacionados comparten fila -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
  <div>
    <p-floatLabel variant="on">
      <input pInputText formControlName="label" placeholder="Etiqueta del menú" class="w-full" />
      <label>Label *</label>
    </p-floatLabel>
  </div>
  <div>
    <p-floatLabel variant="on">
      <input pInputText formControlName="tooltip" placeholder="Ayuda contextual" class="w-full" />
      <label>Tooltip</label>
    </p-floatLabel>
  </div>
</div>
```

### **17.5 COMPORTAMIENTO DE LABELS FLOTANTES**

#### **17.5.1 Estados del label:**
- **Sin foco/vacío:** Label aparece **dentro** del campo como placeholder
- **Con foco:** Label se **desplaza hacia arriba** y se reduce
- **Con valor:** Label permanece **arriba** indicando campo completado
- **Con error:** Label puede mostrar estilos de error

#### **17.5.2 Configuración de estilos:**
```typescript
// Estilos recomendados para labels flotantes
styles: [`
  :host ::ng-deep .p-floatlabel {
    width: 100%;
  }

  :host ::ng-deep .p-floatlabel label {
    background: white;
    padding: 0 4px;
    font-size: 0.875rem;
  }

  :host ::ng-deep .p-floatlabel input:focus + label,
  :host ::ng-deep .p-floatlabel input:not(:placeholder-shown) + label {
    color: #6366f1; /* Indigo */
  }
`]
```

### **17.6 INTEGRACIÓN CON VALIDACIONES**

#### **17.6.1 Labels con validaciones:**
```html
<p-floatLabel variant="on">
  <input pInputText
         formControlName="email"
         placeholder="correo@ejemplo.com"
         class="w-full"
         [class.ng-invalid]="form.get('email')?.invalid && form.get('email')?.touched" />
  <label>Email *</label>
</p-floatLabel>

<!-- Mostrar errores debajo -->
<div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-red-500 text-xs mt-1">
  <span *ngIf="form.get('email')?.errors?.['required']">El email es requerido</span>
  <span *ngIf="form.get('email')?.errors?.['email']">Formato de email inválido</span>
</div>
```

### **17.7 EJEMPLO COMPLETO DE FORMULARIO**

#### **17.7.1 Componente de referencia:**
**Archivo**: `src/app/pages/system/amenu/amenu.component.ts`

#### **17.7.2 Implementación completa:**
```html
<form [formGroup]="form" (ngSubmit)="submitForm()">
  <div class="grid grid-cols-1 gap-4">

    <!-- Menú Padre -->
    <div>
      <p-floatLabel variant="on">
        <p-select
          formControlName="id_padre"
          [options]="parentOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Sin padre (menú principal)"
          class="w-full"
          appendTo="body"
          [style]="{'z-index': '9999'}">
        </p-select>
        <label>Menú Padre</label>
      </p-floatLabel>
    </div>

    <!-- RouterLink -->
    <div>
      <p-floatLabel variant="on">
        <p-select
          formControlName="routerLink"
          [options]="routeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar ruta"
          class="w-full"
          appendTo="body"
          [style]="{'z-index': '9999'}"
          (onChange)="onRouteChange($event)">
        </p-select>
        <label>RouterLink</label>
      </p-floatLabel>
    </div>

    <!-- Label y Tooltip -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <p-floatLabel variant="on">
          <input
            pInputText
            formControlName="label"
            placeholder="Etiqueta de menú"
            class="w-full"
            (blur)="formatLabelOnBlur()" />
          <label>Label *</label>
        </p-floatLabel>
      </div>
      <div>
        <p-floatLabel variant="on">
          <input pInputText formControlName="tooltip" placeholder="Ayuda contextual" class="w-full" />
          <label>Tooltip</label>
        </p-floatLabel>
      </div>
    </div>

    <!-- Icono -->
    <div>
      <div class="flex items-center gap-2">
        <i [class]="iconModel || 'pi pi-question-circle'" class="text-lg"></i>
        <span class="text-sm text-gray-600">{{ iconModel || 'Sin icono' }}</span>
        <button pButton type="button" icon="pi pi-chevron-down" class="p-button-text p-button-sm"
                (click)="toggleIconSelector()" pTooltip="Seleccionar icono"></button>
      </div>
      <div *ngIf="showIconSelector" class="mt-2 border rounded-lg p-2">
        <app-icon-selector
          [(ngModel)]="iconModel"
          (selectedIconChange)="onIconSelected($event)"
          [currentLabel]="form.get('label')?.value || ''"
          [ngModelOptions]="{standalone: true}">
        </app-icon-selector>
      </div>
    </div>

    <!-- Campos booleanos -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <div class="flex items-center gap-2">
        <p-tag
          [value]="form.get('swItenms')?.value ? 'Sí' : 'No'"
          [severity]="form.get('swItenms')?.value ? 'success' : 'danger'"
          (click)="toggleFormField('swItenms')"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          title="Clic para cambiar">
        </p-tag>
        <span>¿Tiene sub-items?</span>
      </div>

      <div class="flex items-center gap-2">
        <p-tag
          [value]="form.get('visible')?.value ? 'Sí' : 'No'"
          [severity]="form.get('visible')?.value ? 'success' : 'danger'"
          (click)="toggleFormField('visible')"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          title="Clic para cambiar">
        </p-tag>
        <span>Visible</span>
      </div>

      <div class="flex items-center gap-2">
        <p-tag
          [value]="form.get('disable')?.value ? 'Sí' : 'No'"
          [severity]="form.get('disable')?.value ? 'danger' : 'success'"
          (click)="toggleFormField('disable')"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          title="Clic para cambiar">
        </p-tag>
        <span>Disable</span>
      </div>
    </div>

  </div>

  <!-- Botones -->
  <div class="flex justify-end gap-2 mt-5">
    <button pButton type="button" label="Cancelar" class="p-button-text" (click)="closeForm()"></button>
    <button pButton type="submit" [label]="isEditing ? 'Actualizar' : 'Guardar'"
            [loading]="saving" [disabled]="form.invalid"></button>
  </div>
</form>
```

### **17.8 ESPACIO PARA LABELS EN FORMULARIOS SUPERIORES**

#### **⚠️ REGLA CRÍTICA: DIV ESPACIADOR OBLIGATORIO**

**TODOS los formularios que se encuentren en la parte superior (top) de los componentes DEBEN incluir un div espaciador antes de cada campo con label flotante.**

#### **17.8.1 Implementación obligatoria:**
```html
<!-- ✅ CORRECTO - Con div espaciador -->
<div>
  <div style="height: 0; margin-top: 1rem;"></div>
  <p-floatLabel variant="on">
    <input pInputText formControlName="campo" placeholder="Campo" class="w-full" />
    <label>Campo *</label>
  </p-floatLabel>
</div>
```

#### **17.8.2 ❌ PROHIBIDO - Sin div espaciador:**
```html
<!-- ❌ INCORRECTO - Sin div espaciador -->
<div>
  <p-floatLabel variant="on">
    <input pInputText formControlName="campo" placeholder="Campo" class="w-full" />
    <label>Campo *</label>
  </p-floatLabel>
</div>
```

#### **17.8.3 Propiedades del div espaciador:**
- **height: 0** - No ocupa espacio visual
- **margin-top: 1rem** - Crea espacio vertical para que el label sea visible
- **Posición** - Debe estar ANTES del p-floatLabel
- **Alcance** - Aplicable solo a formularios en posición top

#### **17.8.4 ¿Cuándo aplicar?**

##### **✅ SÍ aplicar en:**
- **Primer elemento del formulario** o elementos en el **primer renglón**
- Campos que usan `p-floatLabel variant="on"`
- Formularios en la parte superior de componentes
- Cuando el label no es visible por superposición
- Formularios dentro de modales o dialogs

##### **❌ NO aplicar en:**
- Campos en renglones posteriores al primero
- Formularios en posiciones centrales o inferiores
- Campos que no usan labels flotantes
- Formularios en tabs secundarios
- Campos booleanos con p-tag

#### **17.8.5 Ejemplo implementado:**
**Archivo de referencia**: `src/app/pages/adm-ecom/banners/banners-components-tab.component.ts`

```html
<!-- PRIMER RENGLÓN: Espaciadores aplicados solo a campos del primer renglón -->
<div class="grid grid-cols-2 gap-4">
    <!-- Clave -->
    <div>
        <div style="height: 0; margin-top: 1rem;"></div>
        <p-floatLabel variant="on">
            <input pInputText formControlName="clave" placeholder="Ej: BANNER, HEADER, FOOTER" class="w-full" />
            <label>Clave </label>
        </p-floatLabel>
    </div>

    <!-- Canal -->
    <div>
        <div style="height: 0; margin-top: 1rem;"></div>
        <p-select formControlName="canal" [options]="canalesFormOptions" class="w-full"></p-select>
    </div>
</div>

<!-- SEGUNDO RENGLÓN: Sin espaciadores -->
<div class="grid grid-cols-2 gap-4">
    <!-- Nombre -->
    <div>
        <p-floatLabel variant="on">
            <input pInputText formControlName="nombre" placeholder="Nombre descriptivo del componente" class="w-full" />
            <label>Nombre *</label>
        </p-floatLabel>
    </div>

    <!-- Tipo Componente -->
    <div>
        <p-floatLabel variant="on">
            <p-select formControlName="tipo_comp" [options]="tiposCompOptions" class="w-full"></p-select>
            <label>Tipo Componente *</label>
        </p-floatLabel>
    </div>
</div>
```

#### **17.8.6 Beneficios del div espaciador:**
- **Labels visibles** - Los labels flotantes se muestran correctamente
- **UX consistente** - Experiencia uniforme en todos los formularios
- **Prevención de bugs** - Evita problemas de visualización
- **Compatibilidad** - Funciona en diferentes navegadores y dispositivos

#### **17.8.7 Checklist de implementación:**
- [ ] Campo está en el primer renglón del formulario
- [ ] Campo usa `p-floatLabel variant="on"`
- [ ] Div espaciador agregado antes del p-floatLabel
- [ ] Propiedades del div: `height: 0; margin-top: 1rem;`
- [ ] Label es visible y funciona correctamente
- [ ] Campos en renglones posteriores NO tienen espaciador

### **17.8 BENEFICIOS DE USAR LABELS FLOTANTES**

#### **✅ Ventajas:**
- **Interfaz más limpia** - Sin labels externos que ocupan espacio
- **UX moderna** - Patrón reconocido por usuarios
- **Espacio optimizado** - Mejor aprovechamiento del área del formulario
- **Consistencia visual** - Patrón uniforme en toda la aplicación
- **Responsive** - Se adapta bien a diferentes tamaños de pantalla
- **Accesibilidad** - Labels siempre visibles y asociados correctamente

#### **❌ Desventajas:**
- **Requiere PrimeNG** - Depende de la librería FloatLabelModule
- **Configuración inicial** - Necesita configuración específica
- **Campos booleanos** - No aplicable (usar p-tag o toggle)

### **17.9 CHECKLIST DE IMPLEMENTACIÓN**

#### **✅ Verificación obligatoria:**
- [ ] `FloatLabelModule` importado en TypeScript
- [ ] `FloatLabelModule` agregado a imports del componente
- [ ] Todos los inputs usan `<p-floatLabel variant="on">`
- [ ] Labels colocados **dentro** del p-floatLabel
- [ ] Placeholders descriptivos en todos los campos
- [ ] Campos booleanos usan p-tag (NO labels flotantes)
- [ ] Layout responsive con grid adecuado
- [ ] Validaciones integradas correctamente
- [ ] No hay labels tradicionales externos

---

## 📚 **18. REFERENCIAS**

- **Componente de referencia**: `src/app/pages/adm-ecom/tabadm/tabadm.component.ts`
- **Implementación completa**: `src/app/pages/system/amenu/amenu.component.ts`
- **Reglas del proyecto**: `PROJECT_RULES.md`
- **Patrones de servicios**: Sección 3 de PROJECT_RULES.md
- **Configuración de PrimeNG**: Sección 5 de PROJECT_RULES.md

---

*Este patrón garantiza consistencia, mantenibilidad y una excelente experiencia de usuario en todos los componentes CRUD del proyecto.*
