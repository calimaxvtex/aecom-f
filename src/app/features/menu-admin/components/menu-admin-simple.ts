import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouteSelector } from './route-selector';

// Interfaces simplificadas
interface MenuItem {
    id_menu: number;
    label: string;
    icon: string;
    routerLink: string | null;
    nivel: number;
    orden: number;
    visible: boolean;
    disable: boolean;
    swItenms: boolean;
}

@Component({
    selector: 'app-menu-admin-simple',
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
        RouteSelector
    ],
    providers: [MessageService],
    template: `
        <div class="p-4">
            <div class="mb-4">
                <h1 class="text-2xl font-bold mb-2">✅ Administración de Menú</h1>
                <p class="text-gray-600">Gestiona los items del menú de la aplicación</p>
            </div>

            <!-- Tabla de items -->
            <div class="card">
                <p-table
                    [value]="menuItems"
                    [paginator]="true"
                    [rows]="10"
                    [showCurrentPageReport]="true"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} items"
                    [rowsPerPageOptions]="[10, 25, 50]"
                    [globalFilterFields]="['label', 'icon', 'routerLink']"
                >
                    <ng-template pTemplate="caption">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-medium text-gray-900 m-0">Items del Menú</h3>
                            <button 
                                pButton 
                                label="Agregar Item" 
                                icon="pi pi-plus" 
                                (click)="openForm()"
                                class="p-button-success"
                            />
                        </div>
                    </ng-template>

                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="nivel">Nivel <p-sortIcon field="nivel"></p-sortIcon></th>
                            <th pSortableColumn="label">Label <p-sortIcon field="label"></p-sortIcon></th>
                            <th pSortableColumn="icon">Icono <p-sortIcon field="icon"></p-sortIcon></th>
                            <th pSortableColumn="routerLink">Ruta <p-sortIcon field="routerLink"></p-sortIcon></th>
                            <th pSortableColumn="swItenms">Sub Items <p-sortIcon field="swItenms"></p-sortIcon></th>
                            <th pSortableColumn="visible">Visible <p-sortIcon field="visible"></p-sortIcon></th>
                            <th pSortableColumn="disable">Habilitado <p-sortIcon field="disable"></p-sortIcon></th>
                            <th pSortableColumn="orden">Orden <p-sortIcon field="orden"></p-sortIcon></th>
                            <th>Acciones</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-item>
                        <tr>
                            <td>{{ item.nivel }}</td>
                            <td>{{ item.label }}</td>
                            <td>
                                <div class="flex items-center gap-2">
                                    <i *ngIf="item.icon" [class]="item.icon" class="text-lg"></i>
                                    <span class="text-sm">{{ getIconName(item.icon) }}</span>
                                </div>
                            </td>
                            <td>{{ item.routerLink || 'Sin ruta' }}</td>
                            <td>
                                <p-tag 
                                    [value]="item.swItenms ? 'Sí' : 'No'" 
                                    [severity]="item.swItenms ? 'info' : 'secondary'"
                                />
                            </td>
                            <td>
                                <p-tag 
                                    [value]="item.visible ? 'Sí' : 'No'" 
                                    [severity]="item.visible ? 'success' : 'danger'"
                                />
                            </td>
                            <td>
                                <p-tag 
                                    [value]="!item.disable ? 'Sí' : 'No'" 
                                    [severity]="!item.disable ? 'success' : 'warning'"
                                />
                            </td>
                            <td>{{ item.orden }}</td>
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
                            <td colspan="9" class="text-center py-8">
                                <i class="pi pi-info-circle text-2xl mb-2 text-gray-400"></i>
                                <p class="text-gray-500 m-0">No se encontraron items del menú</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- Modal del Formulario -->
            <p-dialog 
                [header]="formTitle" 
                [(visible)]="showFormModal"
                [modal]="true"
                [style]="{width: '600px'}"
                [closable]="true"
                [draggable]="false"
                [resizable]="false"
                (onHide)="closeForm()"
            >
                <form [formGroup]="menuForm" (ngSubmit)="saveNewItem()">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Label -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium mb-1">Label *</label>
                            <input 
                                pInputText 
                                formControlName="label"
                                placeholder="Nombre del menú"
                                class="w-full"
                            />
                        </div>

                        <!-- Icono -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium mb-1">Icono *</label>
                            <input 
                                pInputText 
                                formControlName="icon"
                                placeholder="pi pi-home"
                                class="w-full"
                            />
                        </div>

                        <!-- Ruta con Selector -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium mb-1">Ruta</label>
                            <app-route-selector
                                formControlName="routerLink"
                                class="w-full"
                            ></app-route-selector>
                        </div>

                        <!-- Orden -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Orden *</label>
                            <input 
                                pInputText 
                                type="number"
                                formControlName="orden"
                                placeholder="1"
                                class="w-full"
                            />
                        </div>

                        <!-- Nivel -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Nivel</label>
                            <input 
                                pInputText 
                                type="number"
                                formControlName="nivel"
                                placeholder="0"
                                class="w-full"
                            />
                        </div>
                    </div>

                    <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <p-button
                            label="Cancelar"
                            icon="pi pi-times"
                            (onClick)="closeForm()"
                            [text]="true"
                            severity="secondary"
                        />
                        <p-button
                            [label]="isEditing ? 'Actualizar' : 'Guardar'"
                            icon="pi pi-check"
                            type="submit"
                            severity="success"
                        />
                    </div>
                </form>
            </p-dialog>

            <!-- Toast para notificaciones -->
            <p-toast />

            <!-- Debug Info -->
            <div class="mt-6 p-3 bg-blue-100 border border-blue-300 rounded">
                <strong>Debug Info:</strong><br>
                Total items: {{menuItems.length}}<br>
                Formulario abierto: {{showFormModal}}<br>
                <br>
                <strong>Selector de Rutas:</strong> ✅ Funcionando<br>
                <strong>Formulario:</strong> ✅ Funcionando<br>
                <strong>Tabla:</strong> ✅ Funcionando
            </div>
        </div>
    `
})
export class MenuAdminSimple implements OnInit {
    // Datos
    menuItems: MenuItem[] = [];
    
    // Formulario
    menuForm!: FormGroup;
    showFormModal = false;
    formTitle = '';
    isEditing = false;
    editingItemId: number | null = null;

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        console.log('🚀 MenuAdminSimple inicializado');
        this.initializeForm();
    }

    ngOnInit() {
        console.log('🔄 ngOnInit ejecutado');
        this.loadMenuItems();
    }

    initializeForm(): void {
        this.menuForm = this.fb.group({
            id_menu: [null],
            label: ['', [Validators.required]],
            icon: ['', [Validators.required]],
            routerLink: [''],
            orden: [1, [Validators.required, Validators.min(1)]],
            nivel: [0, [Validators.min(0)]],
            visible: [true],
            disable: [false],
            swItenms: [false]
        });
    }

    // Cargar items del menú (datos mock)
    loadMenuItems(): void {
        console.log('🔄 Cargando items del menú...');
        this.menuItems = [
            {
                id_menu: 1,
                label: 'Dashboard',
                icon: 'pi pi-home',
                routerLink: '/dashboard/analytics',
                nivel: 1,
                orden: 1,
                visible: true,
                disable: false,
                swItenms: false
            },
            {
                id_menu: 2,
                label: 'Usuarios',
                icon: 'pi pi-users',
                routerLink: '/usermanagement/userlist',
                nivel: 1,
                orden: 2,
                visible: true,
                disable: false,
                swItenms: false
            },
            {
                id_menu: 3,
                label: 'E-commerce',
                icon: 'pi pi-shopping-cart',
                routerLink: '/ecommerce/shop',
                nivel: 1,
                orden: 3,
                visible: true,
                disable: false,
                swItenms: true
            },
            {
                id_menu: 4,
                label: 'UI Kit',
                icon: 'pi pi-palette',
                routerLink: '/uikit/button',
                nivel: 1,
                orden: 4,
                visible: true,
                disable: false,
                swItenms: true
            }
        ];
        console.log('📋 Items cargados:', this.menuItems);
    }

    // Abrir formulario
    openForm(item?: MenuItem): void {
        this.isEditing = !!item;
        this.editingItemId = item?.id_menu || null;
        if (item) {
            this.formTitle = 'Editar Item';
            this.menuForm.patchValue({
                id_menu: item.id_menu,
                label: item.label,
                icon: item.icon,
                routerLink: item.routerLink,
                orden: item.orden,
                nivel: item.nivel,
                visible: item.visible,
                disable: item.disable,
                swItenms: item.swItenms
            });
        } else {
            this.formTitle = 'Agregar Item';
            this.menuForm.reset({
                orden: 1,
                nivel: 0,
                visible: true,
                disable: false,
                swItenms: false
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
            const formData = this.menuForm.value;
            
            console.log('💾 Guardando:', formData);
            
            if (this.isEditing && this.editingItemId) {
                // ACTUALIZAR ITEM EXISTENTE
                const itemIndex = this.menuItems.findIndex(i => i.id_menu === this.editingItemId);
                if (itemIndex !== -1) {
                    this.menuItems[itemIndex] = {
                        ...this.menuItems[itemIndex],
                        ...formData
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
                const newItem: MenuItem = {
                    id_menu: newId,
                    ...formData
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

    // Eliminar item
    deleteItem(id: number): void {
        const item = this.menuItems.find(i => i.id_menu === id);
        if (item) {
            this.menuItems = this.menuItems.filter(i => i.id_menu !== id);
            console.log(`✅ Item "${item.label}" eliminado`);
            
            this.messageService.add({
                severity: 'warn',
                summary: 'Eliminado',
                detail: `Item "${item.label}" eliminado correctamente`
            });
        }
    }

    // Obtener nombre del icono (sin prefijo)
    getIconName(icon: string): string {
        if (!icon) return 'Sin icono';
        return icon.replace('pi pi-', '').replace(/-/g, ' ');
    }
}
