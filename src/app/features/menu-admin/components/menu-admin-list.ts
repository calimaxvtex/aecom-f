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
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { MenuService } from '../../../core/services/menu/menu.service';
import { MenuCrudItem, MenuFormItem } from '../../../core/models/menu.interface';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { RouteSelector } from './route-selector';
import { RouteExplorer } from './route-explorer';
import { IconExplorer } from './icon-explorer';
import { IconSelectorAdvanced } from './icon-selector-advanced';
import { ApiConfig } from './api-config';

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
        CardModule,
        SelectModule,
        IconField,
        InputIcon,
        RouteSelector,
        RouteExplorer,
        IconExplorer,
        IconSelectorAdvanced,
        ApiConfig
    ],
    providers: [MessageService],
    template: `
        <div class="card">
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
                    <p-tab value="3">
                        <i class="pi pi-cog mr-2"></i>
                        Configuración API
                    </p-tab>
                </p-tablist>
                <p-tabpanels>
                    <!-- Panel 1: Gestión de Menú -->
                    <p-tabpanel value="0">
                        <div class="mb-4">
                            <h1 class="text-2xl font-bold mb-2">✅ Administración de Menú</h1>
                            <p class="text-gray-600 mb-4">Gestiona los items del menú de la aplicación</p>
                        </div>
            
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

                        <!-- Tooltip -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium mb-1">
                                Tooltip
                                <i class="pi pi-question-circle text-gray-400 cursor-help" 
                                   pTooltip="Texto que aparece al pasar el mouse sobre el item del menú. Opcional."
                                   tooltipPosition="top">
                                </i>
                            </label>
                            <input 
                                pInputText 
                                formControlName="tooltip"
                                placeholder="Descripción que aparece al pasar el mouse"
                                class="w-full"
                            />
                        </div>

                        <!-- Icono con Selector Avanzado -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium mb-1">
                                Icono 
                                <span *ngIf="!menuForm.get('separator')?.value">*</span>
                                <span *ngIf="menuForm.get('separator')?.value" class="text-red-500 text-xs">(No aplica para separadores)</span>
                                <i class="pi pi-question-circle text-gray-400 cursor-help" 
                                   pTooltip="Usa el selector visual para encontrar el icono perfecto. Los separadores no requieren icono."
                                   tooltipPosition="top"
                                   *ngIf="!menuForm.get('separator')?.value">
                                </i>
                            </label>
                            <app-icon-selector-advanced
                                formControlName="icon"
                                class="w-full"
                                [class.opacity-50]="menuForm.get('separator')?.value"
                                [style.pointer-events]="menuForm.get('separator')?.value ? 'none' : 'auto'"
                            ></app-icon-selector-advanced>
                            <small class="text-red-500 text-xs mt-1" *ngIf="menuForm.get('separator')?.value">
                                🚫 Los separadores no requieren icono
                            </small>
                        </div>

                        <!-- Router Link -->
                        <div class="md:col-span-2">
                            <label class="flex items-center gap-2 text-sm font-medium mb-1">
                                Ruta 
                                <span *ngIf="menuForm.get('swItenms')?.value" class="text-red-500 text-xs">(Deshabilitada - Item con hijos)</span>
                                <span *ngIf="menuForm.get('separator')?.value" class="text-red-500 text-xs">(No aplica para separadores)</span>
                                <i class="pi pi-question-circle text-gray-400 cursor-help" 
                                   pTooltip="Haz clic en el campo para abrir el selector de rutas disponibles. Los items con hijos y los separadores no pueden tener ruta."
                                   tooltipPosition="top"
                                   *ngIf="!menuForm.get('swItenms')?.value && !menuForm.get('separator')?.value">
                                </i>
                            </label>
                            <app-route-selector
                                formControlName="routerLink"
                                class="w-full"
                                [class.opacity-50]="menuForm.get('swItenms')?.value || menuForm.get('separator')?.value"
                                [style.pointer-events]="(menuForm.get('swItenms')?.value || menuForm.get('separator')?.value) ? 'none' : 'auto'"
                            ></app-route-selector>
                            <small class="text-red-500 text-xs mt-1" *ngIf="menuForm.get('swItenms')?.value">
                                🚫 Los items con sub-items no pueden tener ruta asignada
                            </small>
                            <small class="text-red-500 text-xs mt-1" *ngIf="menuForm.get('separator')?.value">
                                🚫 Los separadores no tienen ruta asignada
                            </small>
                        </div>

                        <!-- Nivel (Automático) -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium mb-1">
                                Nivel (Automático)
                                <i class="pi pi-question-circle text-gray-400 cursor-help" 
                                   pTooltip="Se calcula automáticamente según el padre seleccionado. Raíz = 1, hijos del raíz = 2, etc."
                                   tooltipPosition="top">
                                </i>
                            </label>
                            <input 
                                pInputText 
                                type="number"
                                formControlName="nivel"
                                placeholder="Se calculará automáticamente"
                                class="w-full bg-gray-50"
                                readonly
                            />
                        </div>

                        <!-- Nivel Padre -->
                        <div>
                            <label class="flex items-center gap-2 text-sm font-medium mb-1">
                                Nivel Padre
                                <i class="pi pi-question-circle text-gray-400 cursor-help" 
                                   pTooltip="Solo se muestran items existentes que pueden ser padres. Selecciona 'Raíz' para items principales."
                                   tooltipPosition="top">
                                </i>
                            </label>
                            <p-select
                                formControlName="id_padre"
                                [options]="availableParents"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Seleccionar padre..."
                                class="w-full"
                                (onChange)="onParentChange()"
                            />
                        </div>

                        <!-- Es Separador -->
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <p-checkbox 
                                    formControlName="separator" 
                                    [binary]="true"
                                    inputId="separator"
                                    (onChange)="onSeparatorChange()"
                                />
                                <label for="separator" class="flex items-center gap-2 text-sm font-medium">
                                    Es un separador visual
                                    <i class="pi pi-question-circle text-gray-400 cursor-help" 
                                       pTooltip="Los separadores son líneas divisorias en el menú. No tienen ruta, icono ni sub-items."
                                       tooltipPosition="top">
                                    </i>
                                </label>
                            </div>
                        </div>

                        <!-- Tiene hijos (swItems) -->
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <p-checkbox 
                                    formControlName="swItenms" 
                                    [binary]="true"
                                    inputId="swItems"
                                    (onChange)="onSwItemsChange()"
                                />
                                <label for="swItems" class="flex items-center gap-2 text-sm font-medium">
                                    Este item tiene sub-items (hijos)
                                    <i class="pi pi-question-circle text-gray-400 cursor-help" 
                                       pTooltip="Los items con hijos actúan como contenedores y no pueden tener ruta asignada."
                                       tooltipPosition="top">
                                    </i>
                                </label>
                            </div>
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


                    </p-tabpanel>

                    <!-- Panel 2: Explorar Rutas -->
                    <p-tabpanel value="1">
                        <app-route-explorer></app-route-explorer>
                    </p-tabpanel>

                    <!-- Panel 3: Explorar Iconos -->
                    <p-tabpanel value="2">
                        <app-icon-explorer></app-icon-explorer>
                    </p-tabpanel>

                    <!-- Panel 4: Configuración API -->
                    <p-tabpanel value="3">
                        <app-api-config></app-api-config>
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
    availableParents: any[] = [];
    
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
            icon: [''],
            routerLink: [''],
            tooltip: [''],
            nivel: [1],
            id_padre: [0],
            swItenms: [false],
            separator: [false],
            visible: [true],
            disable: [false]
        });
    }

    ngOnInit(): void {
        this.loadMenuItems();
    }

    // Cargar padres disponibles
    loadAvailableParents(): void {
        this.availableParents = [
            { label: '🏠 Raíz (sin padre)', value: 0 }
        ];

        // Agregar items existentes que pueden ser padres
        this.menuItems
            .filter(item => !item.separator) // Los separadores no pueden ser padres
            .sort((a, b) => a.nivel - b.nivel || a.orden - b.orden)
            .forEach(item => {
                const indent = '  '.repeat(item.nivel);
                const icon = item.icon ? `${item.icon.replace('pi pi-', '')} ` : '';
                this.availableParents.push({
                    label: `${indent}${icon}${item.label} (Nivel ${item.nivel})`,
                    value: item.id_menu
                });
            });

        console.log('📋 Padres disponibles:', this.availableParents);
    }

    // Cargar datos
    loadMenuItems(): void {
        this.menuService.getMenuItems().subscribe({
            next: (response) => {
                this.menuItems = response.data;
                this.loadAvailableParents(); // Cargar padres después de obtener los datos
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
        
        // Recargar padres disponibles
        this.loadAvailableParents();
        
        if (item) {
            this.menuForm.patchValue({
                label: item.label,
                tooltip: item.tooltip,
                icon: item.icon,
                routerLink: item.routerLink,
                nivel: item.nivel,
                id_padre: item.id_padre,
                swItenms: item.swItenms,
                separator: item.separator,
                visible: item.visible,
                disable: item.disable
            });
            
            // Configurar estado de controles según las reglas
            if (item.separator) {
                this.menuForm.get('swItenms')?.disable();
            } else {
                this.menuForm.get('swItenms')?.enable();
            }
        } else {
            this.menuForm.reset({
                label: '',
                tooltip: '',
                icon: '',
                routerLink: '',
                nivel: 1,
                id_padre: 0,
                swItenms: false,
                separator: false,
                visible: true,
                disable: false
            });
            
            // Asegurar que todos los controles estén habilitados para nuevo item
            this.menuForm.get('swItenms')?.enable();
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
                    // Aplicar reglas de negocio
                    let routerLink = formData.routerLink || this.menuItems[itemIndex].routerLink;
                    let icon = formData.icon || this.menuItems[itemIndex].icon;
                    
                    // Si es separador: no ruta, no icono, no hijos
                    if (formData.separator) {
                        routerLink = '';
                        icon = '';
                        formData.swItenms = false;
                    }
                    // Si tiene hijos: no ruta
                    else if (formData.swItenms) {
                        routerLink = '';
                    }
                    
                    // Mantener los campos requeridos del item original y solo actualizar los editables
                    this.menuItems[itemIndex] = {
                        ...this.menuItems[itemIndex],
                        nivel: formData.nivel || this.menuItems[itemIndex].nivel,
                        id_padre: formData.id_padre ?? this.menuItems[itemIndex].id_padre,
                        label: formData.label || this.menuItems[itemIndex].label,
                        tooltip: formData.tooltip || this.menuItems[itemIndex].tooltip,
                        icon: icon,
                        swItenms: formData.swItenms ?? this.menuItems[itemIndex].swItenms,
                        separator: formData.separator ?? this.menuItems[itemIndex].separator,
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
                
                // Aplicar reglas de negocio
                let routerLink = formData.routerLink || '';
                let icon = formData.icon || '';
                
                // Si es separador: no ruta, no icono, no hijos
                if (formData.separator) {
                    routerLink = '';
                    icon = '';
                    formData.swItenms = false;
                }
                // Si tiene hijos: no ruta
                else if (formData.swItenms) {
                    routerLink = '';
                }
                
                const newItem: MenuCrudItem = {
                    id_menu: newId,
                    id_padre: formData.id_padre || 0,
                    orden: this.menuItems.length + 1,
                    nivel: formData.nivel || 1,
                    label: formData.label || '',
                    tooltip: formData.tooltip || null,
                    icon: icon,
                    swItenms: formData.swItenms || false,
                    separator: formData.separator || false,
                    routerLink: routerLink,
                    visible: formData.visible ?? true,
                    disable: formData.disable ?? false,
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

    // Método para manejar cambios en separador
    onSeparatorChange(): void {
        const isSeparator = this.menuForm.get('separator')?.value;
        const iconControl = this.menuForm.get('icon');
        const routerLinkControl = this.menuForm.get('routerLink');
        const swItemsControl = this.menuForm.get('swItenms');
        
        if (isSeparator) {
            // Si es separador, limpiar campos y deshabilitar swItems
            iconControl?.setValue('');
            routerLinkControl?.setValue('');
            swItemsControl?.setValue(false);
            swItemsControl?.disable();
            console.log('📏 Item marcado como separador - campos limpiados y swItems deshabilitado');
        } else {
            // Si no es separador, habilitar swItems
            swItemsControl?.enable();
            console.log('✅ Item no es separador - swItems habilitado');
        }
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
            // Si no tiene hijos, habilitar la ruta (si no es separador)
            const isSeparator = this.menuForm.get('separator')?.value;
            if (!isSeparator) {
                routerLinkControl?.enable();
            }
            console.log('✅ Item sin hijos - ruta habilitada');
        }
    }

    // Método para manejar cambios en padre
    onParentChange(): void {
        const parentId = this.menuForm.get('id_padre')?.value;
        let newLevel = 1; // Nivel por defecto para raíz
        
        if (parentId && parentId !== 0) {
            // Buscar el item padre para obtener su nivel
            const parentItem = this.menuItems.find(item => item.id_menu === parentId);
            if (parentItem) {
                newLevel = parentItem.nivel + 1;
                console.log(`📊 Padre seleccionado: ${parentItem.label} (Nivel ${parentItem.nivel}) -> Nuevo nivel: ${newLevel}`);
            }
        } else {
            console.log('🏠 Item raíz seleccionado -> Nivel: 1');
        }
        
        // Actualizar el nivel automáticamente
        this.menuForm.get('nivel')?.setValue(newLevel);
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