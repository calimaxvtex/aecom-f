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
import { MenuService } from '../../../core/services/menu/menu.service';
import { MenuCrudItem, MenuFormItem } from '../../../core/models/menu.interface';
import { RouteSelector } from './route-selector';

@Component({
    selector: 'app-menu-admin-simple-test',
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

            <!-- Botones para cambiar vista -->
            <div class="mb-4 flex gap-2">
                <p-button 
                    label="Gestión de Menú" 
                    [severity]="activeView === 'menu' ? 'primary' : 'secondary'"
                    [outlined]="activeView !== 'menu'"
                    (onClick)="activeView = 'menu'"
                    icon="pi pi-list"
                />
                <p-button 
                    label="Explorar Rutas" 
                    [severity]="activeView === 'routes' ? 'primary' : 'secondary'"
                    [outlined]="activeView !== 'routes'"
                    (onClick)="activeView = 'routes'"
                    icon="pi pi-search"
                />
            </div>

            <!-- Vista de Gestión de Menú -->
            <div *ngIf="activeView === 'menu'">
                <div class="card">
                    <h2 class="text-lg font-semibold mb-4">📋 Items del Menú</h2>
                    
                    <div class="mb-4">
                        <p-button 
                            label="Agregar Item" 
                            icon="pi pi-plus" 
                            (onClick)="openForm()"
                            severity="success"
                        />
                    </div>

                    <p-table
                        [value]="menuItems"
                        [paginator]="true"
                        [rows]="10"
                        [showCurrentPageReport]="true"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} items"
                        [rowsPerPageOptions]="[10, 25, 50]"
                        [globalFilterFields]="['label', 'icon', 'routerLink']"
                    >
                        <ng-template pTemplate="header">
                            <tr>
                                <th pSortableColumn="nivel">Nivel <p-sortIcon field="nivel"></p-sortIcon></th>
                                <th pSortableColumn="label">Label <p-sortIcon field="label"></p-sortIcon></th>
                                <th pSortableColumn="icon">Icono <p-sortIcon field="icon"></p-sortIcon></th>
                                <th pSortableColumn="routerLink">Ruta <p-sortIcon field="routerLink"></p-sortIcon></th>
                                <th pSortableColumn="visible">Visible <p-sortIcon field="visible"></p-sortIcon></th>
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
                                        [value]="item.visible ? 'Sí' : 'No'" 
                                        [severity]="item.visible ? 'success' : 'danger'"
                                    />
                                </td>
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
                                <td colspan="6" class="text-center py-8">
                                    <i class="pi pi-info-circle text-2xl mb-2 text-gray-400"></i>
                                    <p class="text-gray-500 m-0">No se encontraron items del menú</p>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>

                <!-- Debug Info -->
                <div class="mt-6 p-3 bg-blue-100 border border-blue-300 rounded">
                    <strong>Debug Info:</strong><br>
                    Total items: {{menuItems.length}}<br>
                    Vista activa: {{activeView}}<br>
                    Formulario abierto: {{showFormModal}}<br>
                </div>
            </div>

            <!-- Vista de Explorar Rutas -->
            <div *ngIf="activeView === 'routes'">
                <div class="card">
                    <h2 class="text-lg font-semibold mb-4">🔍 Explorador de Rutas</h2>
                    <p class="text-gray-600 mb-4">Explora todas las rutas disponibles en el proyecto</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div class="p-4 border rounded-lg">
                            <div class="flex items-center gap-3 mb-2">
                                <i class="pi pi-home text-xl text-blue-600"></i>
                                <h3 class="font-semibold">Dashboard Analytics</h3>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">/dashboard/analytics</p>
                            <p class="text-xs text-gray-500 mb-3">Panel de análisis y métricas</p>
                            <p-tag value="Dashboard" severity="info" class="text-xs" />
                        </div>
                        
                        <div class="p-4 border rounded-lg">
                            <div class="flex items-center gap-3 mb-2">
                                <i class="pi pi-users text-xl text-green-600"></i>
                                <h3 class="font-semibold">Lista de Usuarios</h3>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">/usermanagement/userlist</p>
                            <p class="text-xs text-gray-500 mb-3">Gestión de usuarios del sistema</p>
                            <p-tag value="Gestión" severity="success" class="text-xs" />
                        </div>
                        
                        <div class="p-4 border rounded-lg">
                            <div class="flex items-center gap-3 mb-2">
                                <i class="pi pi-shopping-cart text-xl text-purple-600"></i>
                                <h3 class="font-semibold">E-commerce Shop</h3>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">/ecommerce/shop</p>
                            <p class="text-xs text-gray-500 mb-3">Tienda online principal</p>
                            <p-tag value="E-commerce" severity="warning" class="text-xs" />
                        </div>
                    </div>
                </div>
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

                        <!-- Ruta con Selector Avanzado -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium mb-1">Ruta</label>
                            <app-route-selector
                                formControlName="routerLink"
                                class="w-full"
                            ></app-route-selector>
                            <small class="text-gray-500 text-xs mt-1">
                                💡 Haz clic en el campo para abrir el selector de rutas disponibles
                            </small>
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
        </div>
    `
})
export class MenuAdminSimpleTest implements OnInit {
    // Datos
    menuItems: MenuCrudItem[] = [];
    activeView: 'menu' | 'routes' = 'menu';
    
    // Formulario
    menuForm!: FormGroup;
    showFormModal = false;
    formTitle = '';
    isEditing = false;
    editingItemId: number | null = null;

    constructor(
        private menuService: MenuService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        console.log('🚀 MenuAdminSimpleTest inicializado');
        this.initializeForm();
    }

    ngOnInit() {
        console.log('🔄 ngOnInit ejecutado');
        this.loadMenuItems();
    }

    initializeForm(): void {
        this.menuForm = this.fb.group({
            id_menu: [null],
            id_padre: [null],
            orden: [1, [Validators.required, Validators.min(1)]],
            nivel: [0, [Validators.min(0)]],
            label: ['', [Validators.required]],
            icon: ['', [Validators.required]],
            swItenms: [false],
            routerLink: [''],
            visible: [true],
            disable: [false],
            tooltip: [null],
            separator: [false]
        });
    }

    // Cargar items del menú
    loadMenuItems(): void {
        console.log('🔄 Cargando items del menú...');
        this.menuService.getMenuItems().subscribe({
            next: (response) => {
                console.log('✅ Datos recibidos:', response);
                this.menuItems = response.data;
                console.log('📋 Items cargados:', this.menuItems);
            },
            error: (error) => {
                console.error('❌ Error al cargar items:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los items del menú'
                });
            }
        });
    }

    // Abrir formulario
    openForm(item?: MenuCrudItem): void {
        this.isEditing = !!item;
        this.editingItemId = item?.id_menu || null;
        if (item) {
            this.formTitle = 'Editar Item';
            this.menuForm.patchValue(item);
        } else {
            this.formTitle = 'Agregar Item';
            this.menuForm.reset({
                orden: 1,
                nivel: 0,
                visible: true,
                disable: false,
                separator: false
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
            
            if (this.isEditing && this.editingItemId) {
                const itemIndex = this.menuItems.findIndex(i => i.id_menu === this.editingItemId);
                if (itemIndex !== -1) {
                    this.menuItems[itemIndex] = {
                        ...this.menuItems[itemIndex],
                        ...formData
                    } as MenuCrudItem;
                }
                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Item actualizado correctamente'
                });
            } else {
                const newId = Math.max(...this.menuItems.map(i => i.id_menu)) + 1;
                const newItem: MenuCrudItem = {
                    id_menu: newId,
                    id_padre: 0,
                    orden: this.menuItems.length + 1,
                    nivel: formData.nivel || 1,
                    label: formData.label || '',
                    icon: formData.icon || '',
                    swItenms: false,
                    routerLink: formData.routerLink || '',
                    visible: formData.visible ?? true,
                    disable: formData.disable ?? false,
                    tooltip: `${formData.label} - Agregado por formulario`,
                    separator: false,
                    fecha_m: new Date().toISOString(),
                    usu_a: 'ADMIN'
                };
                
                this.menuItems.push(newItem);
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
