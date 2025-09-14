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
import { MenuService } from '../../../../core/services/menu/menu.service';
import { MenuCrudItem, MenuFormItem } from '../../../../core/models/menu.interface';
import { SessionService } from '../../../../core/services/session.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
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
        CardModule,
        SelectModule,
        IconField,
        InputIcon,
        IconSelectorAdvanced
    ],
    styles: [`
        /* Asegurar que el dropdown del nivel padre tenga z-index alto */
        ::ng-deep .p-select-overlay {
            z-index: 1200 !important;
        }
    `],
    template: `
    <div class="space-y-6">
        <!-- Header con botones -->
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Administración de Menú</h2>
                <p class="text-gray-600 mt-1">Gestiona los elementos del menú principal del sistema</p>
            </div>
            <div class="flex gap-3">
                <p-button
                    icon="pi pi-refresh"
                    (onClick)="refreshData()"
                    pTooltip="Recargar datos"
                    tooltipPosition="top"
                />
                <p-button
                    icon="pi pi-plus"
                    (onClick)="openForm()"
                    label="Agregar Item"
                    severity="success"
                />
            </div>
        </div>

        <!-- Tabla principal -->
        <p-table
            [value]="menuItems"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} items"
            [globalFilterFields]="['label', 'routerLink', 'icon']"
            responsiveLayout="scroll"
            class="shadow-sm"
        >
            <ng-template pTemplate="caption">
                <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold">Items del Menú</span>
                    <p-iconField iconPosition="left">
                        <p-inputIcon styleClass="pi pi-search" />
                        <input
                            pInputText
                            placeholder="Buscar..."
                            #globalFilter
                            (input)="onGlobalFilter($event)"
                        />
                    </p-iconField>
                </div>
            </ng-template>

            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="label" style="min-width: 200px">Label <p-sortIcon field="label"></p-sortIcon></th>
                    <th pSortableColumn="routerLink" style="min-width: 150px">Ruta <p-sortIcon field="routerLink"></p-sortIcon></th>
                    <th pSortableColumn="icon" style="min-width: 120px">Icono <p-sortIcon field="icon"></p-sortIcon></th>
                    <th pSortableColumn="nivel" style="min-width: 100px">Nivel <p-sortIcon field="nivel"></p-sortIcon></th>
                    <th pSortableColumn="orden" style="min-width: 100px">Orden <p-sortIcon field="orden"></p-sortIcon></th>
                    <th style="min-width: 150px">Estado</th>
                    <th style="min-width: 120px">Acciones</th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-item>
                <tr>
                    <!-- Label -->
                    <td>
                        <span class="font-medium">{{item.label}}</span>
                    </td>

                    <!-- Router Link -->
                    <td>
                        <span class="text-sm text-gray-600 font-mono">{{item.routerLink || 'Sin ruta'}}</span>
                    </td>

                    <!-- Icono -->
                    <td>
                        <div class="flex items-center gap-2">
                            <i *ngIf="item.icon" [class]="item.icon"></i>
                            <span class="text-sm">{{item.icon || 'Sin icono'}}</span>
                        </div>
                    </td>

                    <!-- Nivel -->
                    <td>
                        <span class="text-sm">{{item.nivel}}</span>
                    </td>

                    <!-- Orden -->
                    <td>
                        <span class="text-sm">{{item.orden}}</span>
                    </td>

                    <!-- Estado -->
                    <td>
                        <div class="flex gap-2">
                            <p-tag
                                [value]="item.visible ? 'Visible' : 'Oculto'"
                                [severity]="item.visible ? 'success' : 'danger'"
                            />
                            <p-tag
                                [value]="!item.disable ? 'Activo' : 'Inactivo'"
                                [severity]="!item.disable ? 'success' : 'warning'"
                            />
                        </div>
                    </td>

                    <!-- Acciones -->
                    <td>
                        <div class="flex gap-1">
                            <p-button
                                icon="pi pi-pencil"
                                (onClick)="openForm(item)"
                                size="small"
                                [text]="true"
                                pTooltip="Editar"
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

            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="7" class="text-center py-8 text-gray-500">
                        <i class="pi pi-info-circle text-2xl mb-2"></i>
                        <p>No se encontraron items del menú</p>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Modal del Formulario -->
        <p-dialog
            [header]="formTitle"
            [(visible)]="showFormModal"
            [modal]="true"
            [style]="{width: '600px', 'z-index': '1100'}"
            [closable]="true"
        >
            <form [formGroup]="menuForm" (ngSubmit)="saveNewItem()" class="space-y-6">
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

                <!-- Router Link (PRIMERO) -->
                <div>
                    <label class="flex items-center gap-2 text-sm font-medium mb-1">
                        Ruta
                        <span *ngIf="menuForm.get('swItenms')?.value" class="text-red-500 text-xs">(Deshabilitada - Item con hijos)</span>
                        <span *ngIf="menuForm.get('separator')?.value" class="text-red-500 text-xs">(No aplica para separadores)</span>
                    </label>
                            <input
                                pInputText
                                formControlName="routerLink"
                                placeholder="/ruta/ejemplo"
                                class="w-full"
                                [class.opacity-50]="menuForm.get('swItenms')?.value || menuForm.get('separator')?.value"
                            />
                    <small class="text-gray-500 text-xs mt-1">
                        Ingresa la ruta manualmente (ej: /dashboard, /admin/users)
                    </small>
                </div>

                <!-- Icono -->
                <div>
                    <label class="flex items-center gap-2 text-sm font-medium mb-1">
                        Icono
                        <span *ngIf="!menuForm.get('separator')?.value">*</span>
                        <span *ngIf="menuForm.get('separator')?.value" class="text-red-500 text-xs">(No aplica para separadores)</span>
                        <i class="pi pi-question-circle text-gray-400 cursor-help"
                           pTooltip="Usa el selector visual para encontrar el icono perfecto para tu menú."
                           tooltipPosition="top"
                           *ngIf="!menuForm.get('separator')?.value">
                        </i>
                    </label>
                    <app-icon-selector-advanced
                        formControlName="icon"
                        class="w-full"
                        [class.opacity-50]="menuForm.get('separator')?.value"
                        [style.pointer-events]="menuForm.get('separator')?.value ? 'none' : 'auto'"
                    />
                    <small class="text-red-500 text-xs mt-1" *ngIf="menuForm.get('separator')?.value">
                        🚫 Los separadores no requieren icono
                    </small>
                </div>

                <!-- Nivel (Automático) -->
                <div>
                    <label class="block text-sm font-medium mb-1">Nivel</label>
                    <input
                        pInputText
                        formControlName="nivel"
                        readonly
                        class="w-full bg-gray-50"
                    />
                    <small class="text-gray-500 text-xs mt-1">
                        Se calcula automáticamente basado en el padre seleccionado
                    </small>
                </div>

                <!-- Padre -->
                <div>
                    <label class="block text-sm font-medium mb-1">Nivel Padre</label>
                    <p-select
                        formControlName="id_padre"
                        [options]="availableParents"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Seleccionar padre (opcional)"
                        class="w-full"
                        appendTo="body"
                        [virtualScroll]="true"
                        [virtualScrollItemSize]="38"
                        scrollHeight="200px"
                    />
                </div>

                <!-- Orden -->
                <div>
                    <label class="block text-sm font-medium mb-1">Orden *</label>
                    <input
                        pInputText
                        type="number"
                        formControlName="orden"
                        placeholder="0"
                        class="w-full"
                    />
                </div>

                <!-- Opciones adicionales -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex items-center gap-2">
                        <p-checkbox formControlName="visible" inputId="visible" />
                        <label for="visible" class="text-sm">Visible</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-checkbox formControlName="disable" inputId="disable" />
                        <label for="disable" class="text-sm">Deshabilitado</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-checkbox formControlName="swItenms" inputId="swItenms" />
                        <label for="swItenms" class="text-sm">Tiene sub-items</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-checkbox formControlName="separator" inputId="separator" />
                        <label for="separator" class="text-sm">Es separador</label>
                    </div>
                </div>

                <!-- Botones del formulario -->
                <div class="flex justify-end gap-3 pt-4 border-t">
                    <p-button
                        type="button"
                        label="Cancelar"
                        severity="secondary"
                        (onClick)="closeForm()"
                    />
                    <p-button
                        type="submit"
                        label="Guardar"
                        severity="success"
                        [disabled]="!menuForm.valid"
                    />
                </div>
            </form>
        </p-dialog>

        <!-- Modal de eliminación -->
        <p-dialog
            header="Confirmar Eliminación"
            [(visible)]="showDeleteDialog"
            [modal]="true"
            [style]="{width: '400px'}"
        >
            <div *ngIf="selectedItemForDeletion" class="space-y-3">
                <div class="text-center">
                    <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
                    <p class="font-medium text-lg">¿Estás seguro?</p>
                    <p class="text-gray-600 mt-2">
                        Esta acción eliminará permanentemente el item del menú:
                    </p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p><strong>Label:</strong> {{selectedItemForDeletion.label}}</p>
                    <p><strong>Ruta:</strong> {{selectedItemForDeletion.routerLink || 'Sin ruta'}}</p>
                    <p><strong>Nivel:</strong> {{selectedItemForDeletion.nivel}}</p>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <div class="flex justify-end gap-3">
                    <p-button
                        label="Cancelar"
                        severity="secondary"
                        (onClick)="showDeleteDialog = false"
                    />
                    <p-button
                        label="Eliminar"
                        severity="danger"
                        (onClick)="confirmDelete()"
                    />
                </div>
            </ng-template>
        </p-dialog>
    </div>

    <!-- Toast para mensajes -->
    <p-toast />
    `
})
export class MenuAdminList implements OnInit {
    // Datos
    menuItems: MenuCrudItem[] = [];
    availableParents: any[] = [];

    // Formulario
    menuForm: FormGroup;
    showFormModal = false;
    formTitle = '';

    // Eliminación
    selectedItemForDeletion: MenuCrudItem | null = null;
    showDeleteDialog = false;

    // Filtro global
    globalFilterValue = '';

    constructor(
        private menuService: MenuService,
        private messageService: MessageService,
        private sessionService: SessionService,
        private fb: FormBuilder
    ) {
        this.menuForm = this.fb.group({
            label: ['', Validators.required],
            routerLink: [''],
            icon: [''],
            nivel: [{value: 1, disabled: true}],
            id_padre: [null],
            orden: [0, Validators.required],
            visible: [true],
            disable: [false],
            swItenms: [false],
            separator: [false]
        });
    }

    ngOnInit() {
        this.loadMenuItems();
        this.loadAvailableParents();
        this.setupFormSubscriptions();
    }

    // Configurar suscripciones para manejar estados dinámicos del formulario
    setupFormSubscriptions(): void {
        // Manejar el estado del campo routerLink basado en swItenms y separator
        const swItenmsControl = this.menuForm.get('swItenms');
        const separatorControl = this.menuForm.get('separator');
        const routerLinkControl = this.menuForm.get('routerLink');

        if (swItenmsControl && separatorControl && routerLinkControl) {
            // Combinar los cambios de ambos controles
            swItenmsControl.valueChanges.subscribe(() => this.updateRouterLinkState());
            separatorControl.valueChanges.subscribe(() => this.updateRouterLinkState());

            // Estado inicial
            this.updateRouterLinkState();
        }
    }

    // Actualizar el estado del campo routerLink
    updateRouterLinkState(): void {
        const swItenms = this.menuForm.get('swItenms')?.value;
        const separator = this.menuForm.get('separator')?.value;
        const routerLinkControl = this.menuForm.get('routerLink');

        if (swItenms || separator) {
            routerLinkControl?.disable();
        } else {
            routerLinkControl?.enable();
        }
    }

    // Cargar datos
    loadMenuItems() {
        console.log('📋', 'Cargando items del menú...');

        this.menuService.getMenuItems().subscribe({
            next: (response) => {
                console.log('✅', 'Items del menú cargados exitosamente');

                // Manejar respuesta flexible según reglas del proyecto
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
                    this.menuItems = dataToProcess;
                    console.log('📊', 'Menú cargado:', this.menuItems.length, 'items');
                } else {
                    this.menuItems = [];
                    console.log('📊', 'No se encontraron items del menú');
                }
            },
            error: (error) => {
                console.error('❌', 'Error al cargar items del menú:', error);
                this.handleServiceError(error, 'Error al cargar items del menú');
                this.menuItems = []; // Asegurar array vacío en caso de error
            }
        });
    }

    loadAvailableParents() {
        this.availableParents = [
            { label: 'Ninguno (Nivel 1)', value: null },
            ...this.menuItems
                .filter(item => !item.disable && item.swItenms)
                .map(item => ({
                    label: `${'  '.repeat(item.nivel - 1)}📁 ${item.label} (Nivel ${item.nivel})`,
                    value: item.id_menu
                }))
        ];
    }

    // Formulario
    openForm(item?: MenuCrudItem) {
        if (item) {
            this.formTitle = 'Editar Item';
            this.menuForm.patchValue({
                ...item,
                id_padre: item.id_padre || null
            });
        } else {
            this.formTitle = 'Agregar Nuevo Item';
            this.menuForm.reset({
                label: '',
                routerLink: '',
                icon: '',
                nivel: 1,
                id_padre: null,
                orden: 0,
                visible: true,
                disable: false,
                swItenms: false,
                separator: false
            });
        }
        // Actualizar el estado del routerLink después de configurar los valores
        this.updateRouterLinkState();
        this.showFormModal = true;
    }

    closeForm() {
        this.showFormModal = false;
        this.menuForm.reset();
    }

    saveNewItem() {
        if (this.menuForm.valid) {
            const formData = this.menuForm.value;
            const itemData: MenuFormItem = {
                ...formData,
                nivel: formData.id_padre ? 2 : 1 // Nivel automático
            };

            console.log('💾', 'Guardando item:', itemData);

            this.menuService.saveItem(itemData).subscribe({
                next: (response) => {
                    console.log('✅', 'Item guardado exitosamente');

                    // Manejar respuesta flexible según reglas del proyecto
                    let successMessage = 'Item guardado correctamente';
                    if (Array.isArray(response) && response.length > 0) {
                        const firstItem = response[0];
                        if (firstItem.mensaje) successMessage = firstItem.mensaje;
                    } else if (response.mensaje) {
                        successMessage = response.mensaje;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: successMessage,
                        life: 3000
                    });
                    this.closeForm();
                    this.loadMenuItems();
                },
                error: (error) => {
                    console.error('❌', 'Error al guardar item:', error);
                    this.handleServiceError(error, 'Error al guardar el item');
                }
            });
        } else {
            console.log('⚠️', 'Formulario inválido - mostrando validaciones');
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario inválido',
                detail: 'Por favor complete todos los campos requeridos',
                life: 4000
            });
        }
    }

    // Eliminación
    deleteItem(id: number) {
        this.selectedItemForDeletion = this.menuItems.find(item => item.id_menu === id) || null;
        if (this.selectedItemForDeletion) {
            this.showDeleteDialog = true;
        }
    }

    confirmDelete() {
        if (this.selectedItemForDeletion) {
            console.log('🗑️', 'Eliminando item:', this.selectedItemForDeletion.id_menu);

            this.menuService.deleteItem(this.selectedItemForDeletion.id_menu).subscribe({
                next: (response) => {
                    console.log('✅', 'Item eliminado exitosamente');

                    // Manejar respuesta flexible según reglas del proyecto
                    let successMessage = 'Item eliminado correctamente';
                    if (Array.isArray(response) && response.length > 0) {
                        const firstItem = response[0];
                        if (firstItem.mensaje) successMessage = firstItem.mensaje;
                    } else if (response.mensaje) {
                        successMessage = response.mensaje;
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: successMessage,
                        life: 3000
                    });
                    this.showDeleteDialog = false;
                    this.selectedItemForDeletion = null;
                    this.loadMenuItems();
                },
                error: (error) => {
                    console.error('❌', 'Error al eliminar item:', error);
                    this.handleServiceError(error, 'Error al eliminar el item');
                }
            });
        }
    }

    // Utilidades
    refreshData() {
        this.loadMenuItems();
        this.loadAvailableParents();
        this.messageService.add({
            severity: 'info',
            summary: 'Actualizado',
            detail: 'Datos recargados correctamente'
        });
    }

    onGlobalFilter(event: any) {
        this.globalFilterValue = event.target.value;
    }

    // Manejo centralizado de errores de servicios según reglas del proyecto
    private handleServiceError(error: any, defaultMessage: string): void {
        console.error('❌', 'Error de servicio:', error);

        let errorMessage = defaultMessage;

        // Manejo flexible de errores según reglas del proyecto
        if (error.error?.mensaje) {
            errorMessage = error.error.mensaje;
        } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor';
        } else if (error.status === 0) {
            errorMessage = 'Error de conexión - Verifique su conexión a internet';
        } else if (error.status === 401) {
            errorMessage = 'Sesión expirada - Por favor inicie sesión nuevamente';
        } else if (error.status === 403) {
            errorMessage = 'Acceso denegado - No tiene permisos para esta operación';
        } else if (error.status === 404) {
            errorMessage = 'Recurso no encontrado';
        } else if (error.message) {
            errorMessage = error.message;
        }

        this.messageService.add({
            severity: 'error',
            summary: `Error ${error.status || 'Desconocido'}`,
            detail: errorMessage,
            life: 5000
        });
    }

    // Validación del formulario
    getFormErrors() {
        const errors: any = {};
        Object.keys(this.menuForm.controls).forEach(key => {
            const control = this.menuForm.get(key);
            if (control && control.errors) {
                errors[key] = control.errors;
            }
        });
        return errors;
    }
}