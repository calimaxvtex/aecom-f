import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { MenuService } from '../../../core/services/menu/menu.service';
import { MenuCrudItem, MenuFormItem } from '../../../core/models/menu.interface';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { RouteSelector } from './route-selector';
import { RouteExplorer } from './route-explorer';
import { IconExplorer } from './icon-explorer';
import { IconSelectorAdvanced } from './icon-selector-advanced';

@Component({
    selector: 'app-menu-admin-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        TagModule,
        TooltipModule,
        ToastModule,
        TabsModule,
        CheckboxModule,
        IconField,
        InputIcon,
        RouteSelector,
        RouteExplorer,
        IconExplorer,
        IconSelectorAdvanced
    ],
    providers: [MessageService],
    template: `
        <div class="card">
            <div class="mb-4">
                <h1 class="text-2xl font-bold mb-2">✅ Administración de Menú</h1>
                <p class="text-gray-600 mb-4">Gestiona los items del menú de la aplicación</p>
            </div>

            <!-- Pestañas siguiendo el patrón del proyecto -->
            <p-tabs value="0">
                <p-tablist>
                    <p-tab value="0">
                        <i class="pi pi-list mr-2"></i>
                        Gestión de Menú
                    </p-tab>
                    <p-tab value="1">
                        <i class="pi pi-search mr-2"></i>
                        Explorar Rutas
                    </p-tab>
                    <p-tab value="2">
                        <i class="pi pi-palette mr-2"></i>
                        Explorar Iconos
                    </p-tab>
                </p-tablist>
                <p-tabpanels>
                    <!-- Panel 1: Gestión de Menú -->
                    <p-tabpanel value="0">
            
            <p-table
                #dt
                [value]="menuItems"
                [paginator]="true"
                [rows]="10"
                [showCurrentPageReport]="true"
                responsiveLayout="scroll"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} items"
                [rowsPerPageOptions]="[10, 25, 50]"
                [globalFilterFields]="['label', 'icon', 'routerLink', 'nivel', 'id_padre']"
            >
                <ng-template #caption>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <p-icon-field class="w-full sm:w-80 order-1 sm:order-0">
                            <p-inputicon class="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar en menú..." class="w-full" />
                        </p-icon-field>
                        <button (click)="openForm()" pButton outlined class="w-full sm:w-auto flex-order-0 sm:flex-order-1" icon="pi pi-plus" label="Agregar Item"></button>
                    </div>
                </ng-template>

                <ng-template #header>
                    <tr>
                        <th pSortableColumn="nivel" style="width: 80px">Nivel <p-sortIcon field="nivel"></p-sortIcon></th>
                        <th pSortableColumn="id_padre" style="width: 100px">Padre <p-sortIcon field="id_padre"></p-sortIcon></th>
                        <th pSortableColumn="label" style="min-width: 150px">Label <p-sortIcon field="label"></p-sortIcon></th>
                        <th pSortableColumn="icon" style="min-width: 120px">Icono <p-sortIcon field="icon"></p-sortIcon></th>
                        <th pSortableColumn="routerLink" style="min-width: 150px">Ruta <p-sortIcon field="routerLink"></p-sortIcon></th>
                        <th pSortableColumn="swItenms" style="width: 100px">Sub Items <p-sortIcon field="swItenms"></p-sortIcon></th>
                        <th pSortableColumn="visible" style="width: 100px">Visible <p-sortIcon field="visible"></p-sortIcon></th>
                        <th pSortableColumn="disable" style="width: 120px">Habilitado <p-sortIcon field="disable"></p-sortIcon></th>
                        <th style="width: 120px">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template #body let-item>
                    <tr>
                        <!-- Nivel - Editable -->
                        <td>
                            <span
                                *ngIf="editingCell !== item.id_menu + '_nivel'"
                                (click)="editInline(item, 'nivel')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{item.nivel || 'N/A'}}
                            </span>
                            <div
                                *ngIf="editingCell === item.id_menu + '_nivel'"
                                class="inline-edit-container"
                            >
                                <input
                                    pInputText
                                    type="number"
                                    [(ngModel)]="item.nivel"
                                    (keyup.enter)="saveInlineEdit(item, 'nivel')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                />
                                <p-button
                                    icon="pi pi-check"
                                    (onClick)="saveInlineEdit(item, 'nivel')"
                                    [text]="true"
                                    severity="success"
                                    class="inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                />
                                <p-button
                                    icon="pi pi-undo"
                                    (onClick)="cancelInlineEdit()"
                                    [text]="true"
                                    severity="secondary"
                                    class="inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                />
                            </div>
                        </td>

                        <!-- Nivel Padre - Editable -->
                        <td>
                            <span
                                *ngIf="editingCell !== item.id_menu + '_id_padre'"
                                (click)="editInline(item, 'id_padre')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{item.id_padre || '0'}}
                            </span>
                            <div
                                *ngIf="editingCell === item.id_menu + '_id_padre'"
                                class="inline-edit-container"
                            >
                                <input
                                    pInputText
                                    type="number"
                                    [(ngModel)]="item.id_padre"
                                    (keyup.enter)="saveInlineEdit(item, 'id_padre')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                />
                                <p-button
                                    icon="pi pi-check"
                                    (onClick)="saveInlineEdit(item, 'id_padre')"
                                    [text]="true"
                                    severity="success"
                                    class="inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                />
                                <p-button
                                    icon="pi pi-undo"
                                    (onClick)="cancelInlineEdit()"
                                    [text]="true"
                                    severity="secondary"
                                    class="inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                />
                            </div>
                        </td>

                        <!-- Label - Editable -->
                        <td>
                            <span
                                *ngIf="editingCell !== item.id_menu + '_label'"
                                (click)="editInline(item, 'label')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{item.label}}
                            </span>
                            <div
                                *ngIf="editingCell === item.id_menu + '_label'"
                                class="inline-edit-container"
                            >
                                <input
                                    pInputText
                                    [(ngModel)]="item.label"
                                    (keyup.enter)="saveInlineEdit(item, 'label')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="flex-1 p-inputtext-sm"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                />
                                <p-button
                                    icon="pi pi-check"
                                    (onClick)="saveInlineEdit(item, 'label')"
                                    [text]="true"
                                    severity="success"
                                    class="inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                />
                                <p-button
                                    icon="pi pi-undo"
                                    (onClick)="cancelInlineEdit()"
                                    [text]="true"
                                    severity="secondary"
                                    class="inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                />
                            </div>
                        </td>

                        <!-- Icono - Editable -->
                        <td>
                            <div *ngIf="editingCell !== item.id_menu + '_icon'" class="flex items-center gap-2">
                                <i *ngIf="item.icon" [class]="item.icon" class="text-lg"></i>
                                <span
                                    (click)="editInline(item, 'icon')"
                                    class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded text-xs transition-colors"
                                    title="Clic para editar"
                                >
                                    {{getIconName(item.icon)}}
                                </span>
                            </div>
                            <div
                                *ngIf="editingCell === item.id_menu + '_icon'"
                                class="inline-edit-container"
                            >
                                <input
                                    pInputText
                                    [(ngModel)]="item.icon"
                                    (keyup.enter)="saveInlineEdit(item, 'icon')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    placeholder="pi pi-home"
                                    class="flex-1 p-inputtext-sm"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                />
                                <p-button
                                    icon="pi pi-check"
                                    (onClick)="saveInlineEdit(item, 'icon')"
                                    [text]="true"
                                    severity="success"
                                    class="inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                />
                                <p-button
                                    icon="pi pi-undo"
                                    (onClick)="cancelInlineEdit()"
                                    [text]="true"
                                    severity="secondary"
                                    class="inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                />
                            </div>
                        </td>

                        <!-- Router Link - Editable -->
                        <td>
                            <span
                                *ngIf="editingCell !== item.id_menu + '_routerLink'"
                                (click)="editInline(item, 'routerLink')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{item.routerLink || 'Sin ruta'}}
                            </span>
                            <div
                                *ngIf="editingCell === item.id_menu + '_routerLink'"
                                class="inline-edit-container"
                            >
                                <input
                                    pInputText
                                    [(ngModel)]="item.routerLink"
                                    (keyup.enter)="saveInlineEdit(item, 'routerLink')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    placeholder="/dashboard"
                                    class="flex-1 p-inputtext-sm"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                />
                                <p-button
                                    icon="pi pi-check"
                                    (onClick)="saveInlineEdit(item, 'routerLink')"
                                    [text]="true"
                                    severity="success"
                                    class="inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                />
                                <p-button
                                    icon="pi pi-undo"
                                    (onClick)="cancelInlineEdit()"
                                    [text]="true"
                                    severity="secondary"
                                    class="inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                />
                            </div>
                        </td>

                        <!-- Sub Items - Solo informativo -->
                        <td>
                            <div class="flex items-center justify-center">
                                <p-tag 
                                    [value]="item.swItenms ? 'Sí' : 'No'" 
                                    [severity]="item.swItenms ? 'info' : 'secondary'"
                                    class="text-xs"
                                    [title]="item.swItenms ? 'Este item tiene sub-items' : 'Este item no tiene sub-items'"
                                />
                            </div>
                        </td>

                        <!-- Visible - Toggle -->
                        <td>
                            <p-tag 
                                [value]="item.visible ? 'Sí' : 'No'" 
                                [severity]="item.visible ? 'success' : 'danger'"
                                (click)="toggleField(item, 'visible')"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                title="Clic para cambiar"
                            ></p-tag>
                        </td>

                        <!-- Habilitado - Toggle -->
                        <td>
                            <p-tag 
                                [value]="!item.disable ? 'Sí' : 'No'" 
                                [severity]="!item.disable ? 'success' : 'warning'"
                                (click)="toggleField(item, 'disable')"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                title="Clic para cambiar"
                            ></p-tag>
                        </td>

                        <!-- Acciones -->
                        <td>
                            <div class="flex gap-1">
                                <p-button
                                    icon="pi pi-pencil"
                                    (onClick)="openForm(item)"
                                    size="small"
                                    [text]="true"
                                    pTooltip="Editar en modal"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    (onClick)="deleteItem(item.id_menu)"
                                    size="small"
                                    [text]="true"
                                    severity="danger"
                                    pTooltip="Eliminar"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Modal del Formulario -->
            <p-dialog 
                [header]="formTitle" 
                [(visible)]="showFormModal"
                [modal]="true"
                [style]="{width: '600px'}"
                [closable]="true"
            >
                <form [formGroup]="menuForm" (ngSubmit)="saveNewItem()">
                    <div class="grid grid-cols-1 gap-4">
                        <!-- Label -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Label *</label>
                            <input 
                                pInputText 
                                formControlName="label"
                                placeholder="Nombre del menú"
                                class="w-full"
                            />
                        </div>

                        <!-- Icono con Selector Avanzado -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Icono *</label>
                            <app-icon-selector-advanced
                                formControlName="icon"
                                class="w-full"
                            ></app-icon-selector-advanced>
                            <small class="text-gray-500 text-xs mt-1">
                                💡 Usa el selector visual para encontrar el icono perfecto
                            </small>
                        </div>

                        <!-- Router Link -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium mb-1">
                                Ruta 
                                <span *ngIf="menuForm.get('swItenms')?.value" class="text-red-500 text-xs">(Deshabilitada - Item con hijos)</span>
                            </label>
                            <app-route-selector
                                formControlName="routerLink"
                                class="w-full"
                                [class.opacity-50]="menuForm.get('swItenms')?.value"
                                [style.pointer-events]="menuForm.get('swItenms')?.value ? 'none' : 'auto'"
                            ></app-route-selector>
                            <small class="text-gray-500 text-xs mt-1" *ngIf="!menuForm.get('swItenms')?.value">
                                💡 Haz clic en el campo para abrir el selector de rutas disponibles
                            </small>
                            <small class="text-red-500 text-xs mt-1" *ngIf="menuForm.get('swItenms')?.value">
                                🚫 Los items con sub-items no pueden tener ruta asignada
                            </small>
                        </div>

                        <!-- Nivel -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Nivel</label>
                            <input 
                                pInputText 
                                type="number"
                                formControlName="nivel"
                                placeholder="1"
                                class="w-full"
                            />
                        </div>

                        <!-- Nivel Padre -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Nivel Padre</label>
                            <input 
                                pInputText 
                                type="number"
                                formControlName="id_padre"
                                placeholder="0"
                                class="w-full"
                            />
                            <small class="text-gray-500 text-xs mt-1">
                                0 = Item raíz, otro número = ID del item padre
                            </small>
                        </div>

                        <!-- Tiene hijos (swItems) -->
                        <div class="md:col-span-2">
                            <div class="flex items-center gap-2 mb-2">
                                <p-checkbox 
                                    formControlName="swItenms" 
                                    [binary]="true"
                                    inputId="swItems"
                                    (onChange)="onSwItemsChange()"
                                />
                                <label for="swItems" class="text-sm font-medium">
                                    Este item tiene sub-items (hijos)
                                </label>
                            </div>
                            <small class="text-gray-500 text-xs">
                                ⚠️ Los items con hijos no pueden tener ruta asignada
                            </small>
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 mt-4">
                        <p-button
                            label="Cancelar"
                            icon="pi pi-times"
                            (onClick)="closeForm()"
                            [text]="true"
                        />
                        <p-button
                            label="Guardar"
                            icon="pi pi-check"
                            type="submit"
                            [disabled]="!menuForm.valid"
                        />
                    </div>
                </form>
            </p-dialog>

                            <!-- Diálogo de Confirmación de Eliminación -->
                <p-dialog 
                    header="Confirmar Eliminación" 
                    [(visible)]="showDeleteDialog"
                    [modal]="true"
                    [style]="{width: '500px'}"
                    [closable]="true"
                    [draggable]="false"
                    [resizable]="false"
                >
                    <div class="flex items-start gap-4 mb-6">
                        <div class="flex-shrink-0">
                            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">
                                ¿Estás seguro de eliminar este item?
                            </h3>
                            <div *ngIf="itemToDelete" class="space-y-2 text-sm text-gray-600">
                                <p><strong>Label:</strong> {{itemToDelete.label}}</p>
                                <p><strong>Ruta:</strong> {{itemToDelete.routerLink || 'Sin ruta'}}</p>
                                <p><strong>Nivel:</strong> {{itemToDelete.nivel}}</p>
                                <p *ngIf="itemToDelete.swItenms" class="text-amber-600">
                                    <i class="pi pi-info-circle mr-1"></i>
                                    <strong>Advertencia:</strong> Este item tiene sub-items asociados.
                                </p>
                            </div>
                            <p class="text-sm text-gray-500 mt-3">
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3">
                        <p-button
                            label="Cancelar"
                            icon="pi pi-times"
                            (onClick)="cancelDelete()"
                            [text]="true"
                            class="p-button-secondary"
                        />
                        <p-button
                            label="Eliminar"
                            icon="pi pi-trash"
                            (onClick)="confirmDelete()"
                            severity="danger"
                        />
                    </div>
                </p-dialog>

                <!-- Toast para notificaciones -->
                <p-toast />

                <!-- Debug Info -->
                <div class="mt-6 p-3 bg-blue-100 border border-blue-300 rounded">
                    <strong>Debug Info:</strong><br>
                    Total items: {{menuItems.length}}<br>
                    Editando: {{editingCell || 'Ninguno'}}<br>
                    <br>
                    <strong>Primer item:</strong><br>
                    <pre>{{menuItems[0] | json}}</pre>
                </div>
                    </p-tabpanel>

                    <!-- Panel 2: Explorar Rutas -->
                    <p-tabpanel value="1">
                        <app-route-explorer></app-route-explorer>
                    </p-tabpanel>

                    <!-- Panel 3: Explorar Iconos -->
                    <p-tabpanel value="2">
                        <app-icon-explorer></app-icon-explorer>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>
    `,
    styles: [`
        .editable-cell {
            border: 1px solid transparent;
            min-height: 32px;
            display: inline-block;
            min-width: 60px;
        }
        
        .editable-cell:hover {
            border-color: #3b82f6;
            background-color: #eff6ff !important;
        }
        
        .p-inputtext-sm {
            padding: 4px 8px;
            font-size: 0.875rem;
        }

        /* Indicador visual para campos editables */
        .editable-cell::after {
            content: "✏️";
            opacity: 0;
            margin-left: 4px;
            font-size: 0.7rem;
            transition: opacity 0.2s;
        }
        
        .editable-cell:hover::after {
            opacity: 0.6;
        }

        /* Mejorar apariencia de tags clickeables */
        .p-tag.cursor-pointer:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* Botones inline pequeños */
        .inline-action-btn {
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
            padding: 0 !important;
        }

        .inline-action-btn .p-button-icon {
            font-size: 0.75rem;
        }

        /* Contenedor de edición inline */
        .inline-edit-container {
            display: flex;
            align-items: center;
            gap: 4px;
            max-width: 200px; /* Limitar ancho máximo */
        }

        .inline-edit-container input {
            flex: 1;
            min-width: 80px; /* Ancho mínimo para legibilidad */
            max-width: 140px; /* Ancho máximo para proporción */
        }

        /* Ajustar específicamente para campos numéricos */
        .inline-edit-container input[type="number"] {
            max-width: 80px;
        }
    `]
})
export class MenuAdminList implements OnInit {
    // Datos
    menuItems: MenuCrudItem[] = [];
    
    // Formulario
    menuForm: FormGroup;
    showFormModal = false;
    formTitle = '';
    isEditing = false;
    editingItemId: number | null = null;

    // Edición inline
    editingCell: string | null = null; // Format: "itemId_fieldName"
    originalValue: any = null;

    // Confirmación de eliminación
    showDeleteDialog = false;
    itemToDelete: MenuCrudItem | null = null;

    constructor(
        private menuService: MenuService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        this.menuForm = this.fb.group({
            label: ['', Validators.required],
            icon: ['', Validators.required],
            routerLink: [''],
            nivel: [1],
            id_padre: [0],
            swItenms: [false],
            visible: [true],
            disable: [false]
        });
    }

    ngOnInit(): void {
        this.loadMenuItems();
    }

    // Cargar datos
    loadMenuItems(): void {
        this.menuService.getMenuItems().subscribe({
            next: (response) => {
                this.menuItems = response.data;
                console.log('✅ Datos cargados:', this.menuItems);
            },
            error: (error) => {
                console.error('❌ Error al cargar datos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los datos del menú'
                });
            }
        });
    }

    // Filtro global
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // Obtener nombre del icono (sin prefijo)
    getIconName(icon: string): string {
        if (!icon) return 'Sin icono';
        return icon.replace('pi pi-', '').replace(/-/g, ' ');
    }

    // Toggle field (para campos booleanos)
    toggleField(item: MenuCrudItem, field: string): void {
        const oldValue = field === 'visible' ? item.visible : !item.disable;
        let newValue: boolean;
        
        if (field === 'visible') {
            item.visible = !item.visible;
            newValue = item.visible;
        } else if (field === 'disable') {
            item.disable = !item.disable;
            newValue = !item.disable; // Invertimos porque mostramos "Habilitado"
        } else {
            return;
        }
        
        // Actualizar el item en el array local (simulando respuesta del backend)
        const itemIndex = this.menuItems.findIndex(i => i.id_menu === item.id_menu);
        if (itemIndex !== -1) {
            this.menuItems[itemIndex] = { ...this.menuItems[itemIndex] };
            console.log(`✅ Toggle ${field} actualizado:`, { 
                id: item.id_menu, 
                field, 
                oldValue, 
                newValue,
                item: this.menuItems[itemIndex]
            });
        }

        // Aquí harías la llamada real al backend para actualizar
        this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: `Campo ${field} ${newValue ? 'activado' : 'desactivado'}`
        });
    }

    // Abrir formulario
    openForm(item?: MenuCrudItem): void {
        this.isEditing = !!item;
        this.editingItemId = item?.id_menu || null;
        this.formTitle = this.isEditing ? 'Editar Item' : 'Nuevo Item';
        
        if (item) {
            this.menuForm.patchValue({
                label: item.label,
                icon: item.icon,
                routerLink: item.routerLink,
                nivel: item.nivel,
                id_padre: item.id_padre,
                swItenms: item.swItenms,
                visible: item.visible,
                disable: item.disable
            });
        } else {
            this.menuForm.reset({
                label: '',
                icon: '',
                routerLink: '',
                nivel: 1,
                id_padre: 0,
                swItenms: false,
                visible: true,
                disable: false
            });
        }
        
        this.showFormModal = true;
    }

    // Cerrar formulario
    closeForm(): void {
        this.showFormModal = false;
        this.menuForm.reset();
        this.isEditing = false;
        this.editingItemId = null;
    }

    // Guardar item
    saveNewItem(): void {
        if (this.menuForm.valid) {
            const formData: MenuFormItem = this.menuForm.value;
            
            console.log('💾 Guardando:', formData);
            
            if (this.isEditing && this.editingItemId) {
                // ACTUALIZAR ITEM EXISTENTE
                const itemIndex = this.menuItems.findIndex(i => i.id_menu === this.editingItemId);
                if (itemIndex !== -1) {
                    // Aplicar regla de negocio: si tiene hijos, no debe tener ruta
                    const routerLink = formData.swItenms ? '' : (formData.routerLink || this.menuItems[itemIndex].routerLink);
                    
                    // Mantener los campos requeridos del item original y solo actualizar los editables
                    this.menuItems[itemIndex] = {
                        ...this.menuItems[itemIndex],
                        nivel: formData.nivel || this.menuItems[itemIndex].nivel,
                        id_padre: formData.id_padre ?? this.menuItems[itemIndex].id_padre,
                        label: formData.label || this.menuItems[itemIndex].label,
                        icon: formData.icon || this.menuItems[itemIndex].icon,
                        swItenms: formData.swItenms ?? this.menuItems[itemIndex].swItenms,
                        routerLink: routerLink,
                        visible: formData.visible ?? this.menuItems[itemIndex].visible,
                        disable: formData.disable ?? this.menuItems[itemIndex].disable
                    };
                    console.log('✅ Item actualizado:', this.menuItems[itemIndex]);
                }
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Item actualizado correctamente'
                });
            } else {
                // CREAR NUEVO ITEM
                const newId = Math.max(...this.menuItems.map(i => i.id_menu)) + 1;
                
                // Aplicar regla de negocio: si tiene hijos, no debe tener ruta
                const routerLink = formData.swItenms ? '' : (formData.routerLink || '');
                
                const newItem: MenuCrudItem = {
                    id_menu: newId,
                    id_padre: formData.id_padre || 0,
                    orden: this.menuItems.length + 1,
                    nivel: formData.nivel || 1,
                    label: formData.label || '',
                    icon: formData.icon || '',
                    swItenms: formData.swItenms || false,
                    routerLink: routerLink,
                    visible: formData.visible ?? true,
                    disable: formData.disable ?? false,
                    tooltip: `${formData.label} - Agregado por formulario`,
                    separator: false,
                    fecha_m: new Date().toISOString(),
                    usu_a: 'ADMIN'
                };
                
                this.menuItems.push(newItem);
                console.log('✅ Nuevo item creado:', newItem);
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Creado',
                    detail: 'Item creado correctamente'
                });
            }
            
            this.closeForm();
        }
    }

    // Iniciar eliminación (abrir diálogo de confirmación)
    deleteItem(id: number): void {
        const item = this.menuItems.find(i => i.id_menu === id);
        if (item) {
            this.itemToDelete = item;
            this.showDeleteDialog = true;
            console.log('🗑️ Solicitando confirmación para eliminar:', item.label);
        }
    }

    // Cancelar eliminación
    cancelDelete(): void {
        this.showDeleteDialog = false;
        this.itemToDelete = null;
        console.log('❌ Eliminación cancelada');
    }

    // Confirmar eliminación
    confirmDelete(): void {
        if (!this.itemToDelete) return;

        const itemName = this.itemToDelete.label;
        const itemId = this.itemToDelete.id_menu;
        
        console.log(`🗑️ Confirmando eliminación de "${itemName}"`);
        
        // Eliminar del array local (simulando respuesta del backend)
        const initialLength = this.menuItems.length;
        this.menuItems = this.menuItems.filter(i => i.id_menu !== itemId);
        
        if (this.menuItems.length < initialLength) {
            console.log(`✅ Item "${itemName}" eliminado. Items restantes:`, this.menuItems.length);
            
            this.messageService.add({
                severity: 'warn',
                summary: 'Eliminado',
                detail: `Item "${itemName}" eliminado correctamente`
            });
        } else {
            console.log('❌ No se pudo eliminar el item');
            
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el item'
            });
        }

        // Cerrar diálogo
        this.showDeleteDialog = false;
        this.itemToDelete = null;
        
        // Aquí harías la llamada real al backend:
        // this.menuService.deleteItem(itemId).subscribe(...)
    }

    // Método para manejar cambios en swItems
    onSwItemsChange(): void {
        const swItems = this.menuForm.get('swItenms')?.value;
        const routerLinkControl = this.menuForm.get('routerLink');
        
        if (swItems) {
            // Si tiene hijos, limpiar y deshabilitar la ruta
            routerLinkControl?.setValue('');
            routerLinkControl?.disable();
            console.log('🚫 Item marcado como padre - ruta limpiada y deshabilitada');
        } else {
            // Si no tiene hijos, habilitar la ruta
            routerLinkControl?.enable();
            console.log('✅ Item sin hijos - ruta habilitada');
        }
    }

    // ========== MÉTODOS DE EDICIÓN INLINE ==========

    // Iniciar edición inline
    editInline(item: MenuCrudItem, field: keyof MenuCrudItem): void {
        // Cancelar edición anterior si existe
        if (this.editingCell) {
            this.cancelInlineEdit();
        }
        
        this.editingCell = item.id_menu + '_' + field;
        this.originalValue = item[field];
        
        console.log(`✏️ Editando ${field} del item ${item.id_menu}:`, this.originalValue);
    }

    // Guardar edición inline
    saveInlineEdit(item: MenuCrudItem, field: keyof MenuCrudItem): void {
        const newValue = item[field];
        
        // Validación básica
        if (field === 'label' && (!newValue || (newValue as string).trim() === '')) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El label no puede estar vacío'
            });
            // Restaurar valor original
            item[field] = this.originalValue;
            this.cancelInlineEdit();
            return;
        }

        // Validación para nivel (debe ser número positivo)
        if (field === 'nivel' && (newValue === null || newValue === undefined || Number(newValue) < 1)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El nivel debe ser un número mayor a 0'
            });
            // Restaurar valor original
            item[field] = this.originalValue;
            this.cancelInlineEdit();
            return;
        }

        // Si el valor no cambió, solo cancelar
        if (newValue === this.originalValue) {
            this.cancelInlineEdit();
            return;
        }

        // Simular llamada al backend y actualizar datos en memoria
        console.log(`💾 Guardando ${field}:`, {
            id: item.id_menu,
            field,
            oldValue: this.originalValue,
            newValue
        });

        // Actualizar el item en el array local (simulando respuesta del backend)
        const itemIndex = this.menuItems.findIndex(i => i.id_menu === item.id_menu);
        if (itemIndex !== -1) {
            this.menuItems[itemIndex] = { ...this.menuItems[itemIndex], [field]: newValue };
            console.log(`✅ Item actualizado en memoria:`, this.menuItems[itemIndex]);
        }

        // Aquí harías la llamada real al backend:
        // this.menuService.updateField(item.id_menu, field, newValue).subscribe(...)
        
        this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: `Campo ${field} actualizado correctamente`
        });

        // Limpiar estado de edición sin restaurar valor (ya fue guardado)
        this.editingCell = null;
        this.originalValue = null;
        console.log('✅ Edición completada exitosamente');
    }

    // Cancelar edición inline
    cancelInlineEdit(): void {
        if (this.editingCell && this.originalValue !== null) {
            // Encontrar el item y restaurar el valor original
            const [itemId, field] = this.editingCell.split('_');
            const item = this.menuItems.find(i => i.id_menu === Number(itemId));
            
            if (item && field) {
                (item as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;
        console.log('❌ Edición cancelada');
    }
}