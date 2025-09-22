import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RolDetalleService } from '../../../features/usuarios/services/rol-detalle.service';
import { RolDetalle } from '../../../features/usuarios/models/rol-detalle.interface';
import { Rol } from '../../../features/usuarios/models/rol.interface';

interface MenuMock {
    id_menu: number;
    nombre: string;
    descripcion: string;
}

@Component({
    selector: 'app-rol-detalle-tab',
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
        SelectModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <div class="mb-4">
            <h1 class="text-2xl font-bold mb-2">📋 Detalles de Rol</h1>
            <p class="text-gray-600 mb-4">
                Gestiona los permisos y menús asociados al rol
                <strong *ngIf="rolSeleccionado">{{ rolSeleccionado.nombre }}</strong>
            </p>
        </div>

        <p-table
            #dtRolDetalles
            [value]="rolDetalles"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            responsiveLayout="scroll"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} detalles"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['descripcion', 'valorcadena1', 'nombre_menu']"
            dataKey="id_rold"
            [sortMode]="'multiple'"
            [sortField]="'ren'"
            [sortOrder]="1"
            [filterDelay]="300"
        >
            <ng-template #caption>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <div class="flex gap-2 ml-auto items-center">
                        <input
                            pInputText
                            type="text"
                            (input)="onGlobalFilter(dtRolDetalles, $event)"
                            placeholder="Buscar detalles..."
                            class="w-full sm:w-80"
                        />
                        <button
                            (click)="cargarRolDetalles()"
                            pButton
                            raised
                            icon="pi pi-refresh"
                            [loading]="loadingRolDetalle"
                            [disabled]="!rolSeleccionado"
                            pTooltip="Selecciona un rol primero"
                        ></button>
                        <button
                            (click)="openRolDetalleForm()"
                            pButton
                            raised
                            icon="pi pi-plus"
                            [disabled]="!rolSeleccionado"
                            pTooltip="Selecciona un rol primero"
                        ></button>
                    </div>
                </div>
            </ng-template>

            <ng-template #header>
                <tr>
                    <th style="width: 60px;">ID</th>
                    <th style="width: 70px;">ID Menú</th>
                    <th style="width: 70px;">Orden</th>
                    <th style="width: 160px;">Menú</th>
                    <th style="width: 100px;">Bloqueo</th>
                    <th style="width: 120px;">Fecha Modificación</th>
                    <th style="width: 100px;">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-detalle>
                <tr>
                    <!-- ID -->
                    <td class="text-center font-mono text-sm">{{detalle.id_rold}}</td>

                    <!-- ID Menú -->
                    <td class="text-center font-mono text-sm">{{detalle.id_menu}}</td>

                    <!-- Orden (editable inline) -->
                    <td>
                        <div *ngIf="editingCell !== 'ren_' + detalle.id_rold; else editOrden">
                            <span
                                (click)="startInlineEdit(detalle, 'ren')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                pTooltip="Click para editar"
                            >
                                {{detalle.ren}}
                            </span>
                        </div>
                        <ng-template #editOrden>
                            <div class="flex items-center gap-1">
                                <input
                                    [(ngModel)]="detalle.ren"
                                    (keyup.enter)="saveInlineEdit(detalle, 'ren')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                    placeholder="Orden"
                                    type="number"
                                />
                                <button
                                    (click)="saveInlineEdit(detalle, 'ren')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    (click)="cancelInlineEdit()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
                        </ng-template>
                    </td>

                    <!-- Menú (editable inline) -->
                    <td>
                        <div *ngIf="editingCell !== 'menu_' + detalle.id_rold; else editMenu">
                            <span
                                (click)="startInlineEdit(detalle, 'menu')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                pTooltip="Click para editar"
                            >
                                {{detalle.nombre_menu || 'Sin menú'}}
                            </span>
                        </div>
                        <ng-template #editMenu>
                            <div class="flex items-center gap-1">
                                <p-select
                                    [(ngModel)]="detalle.id_menu"
                                    [options]="menusDisponibles"
                                    optionLabel="nombre"
                                    optionValue="id_menu"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="flex-1"
                                    placeholder="Seleccionar menú"
                                    autofocus
                                    appendTo="body"
                                ></p-select>
                                <button
                                    (click)="saveInlineEdit(detalle, 'menu')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    (click)="cancelInlineEdit()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
                        </ng-template>
                    </td>

                    <!-- Bloqueo -->
                    <td>
                        <p-tag
                            [value]="getLockLabel(detalle.swlock)"
                            [severity]="getLockSeverity(detalle.swlock)"
                            (click)="toggleLockDetalle(detalle); $event.stopPropagation()"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            pTooltip="Click para cambiar bloqueo"
                        ></p-tag>
                    </td>

                    <!-- Fecha Modificación -->
                    <td>{{detalle.fecha_m | date:'short'}}</td>

                    <!-- Acciones -->
                    <td>
                        <div class="flex gap-1">
                            <button
                                (click)="editarRolDetalle(detalle)"
                                pButton
                                class="p-button-sm p-button-text p-button-warning"
                                icon="pi pi-pencil"
                                pTooltip="Editar"
                            ></button>
                            <button
                                (click)="eliminarRolDetalle(detalle)"
                                pButton
                                class="p-button-sm p-button-text p-button-danger"
                                icon="pi pi-trash"
                                pTooltip="Eliminar"
                            ></button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Modal de Rol Detalle -->
        <p-dialog
            [(visible)]="showRolDetalleModal"
            [header]="rolDetalleFormTitle"
            [modal]="true"
            [style]="{width: '500px'}"
            [draggable]="false"
            [resizable]="false"
            (onHide)="closeRolDetalleForm()"
        >
            <form [formGroup]="rolDetalleForm" (ngSubmit)="saveRolDetalle()">
                <div class="grid grid-cols-1 gap-4">
                    <!-- Información del rol padre -->
                    <div class="p-3 bg-blue-50 rounded">
                        <label class="block text-sm font-medium mb-1">Rol Seleccionado:</label>
                        <div class="flex items-center gap-2">
                            <span class="font-medium">{{ rolSeleccionado?.nombre }}</span>
                        </div>
                    </div>

                    <!-- Menú -->
                    <div>
                        <label for="menu" class="block text-sm font-medium mb-2">Menú *</label>
                        <p-select
                            id="menu"
                            formControlName="id_menu"
                            [options]="menusDisponibles"
                            optionLabel="nombre"
                            optionValue="id_menu"
                            class="w-full"
                            placeholder="Seleccionar menú"
                            appendTo="body"
                        ></p-select>
                        <small
                            *ngIf="rolDetalleForm.get('id_menu')?.invalid && rolDetalleForm.get('id_menu')?.touched"
                            class="text-red-500"
                        >
                            Menú es requerido
                        </small>
                    </div>

                    <!-- Orden -->
                    <div>
                        <label for="orden" class="block text-sm font-medium mb-2">Orden *</label>
                        <input
                            id="orden"
                            formControlName="ren"
                            pInputText
                            type="number"
                            class="w-full"
                            placeholder="Orden de aparición"
                        />
                        <small
                            *ngIf="rolDetalleForm.get('ren')?.invalid && rolDetalleForm.get('ren')?.touched"
                            class="text-red-500"
                        >
                            Orden es requerido
                        </small>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button
                        type="button"
                        pButton
                        label="Cancelar"
                        class="p-button-text"
                        (click)="closeRolDetalleForm()"
                    ></button>
                    <button
                        type="submit"
                        pButton
                        [label]="isEditingRolDetalle ? 'Actualizar' : 'Crear'"
                        class="p-button-primary"
                        [disabled]="!rolDetalleForm.valid"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de Confirmación para Eliminación -->
        <p-dialog
            [(visible)]="showConfirmDeleteRolDetalle"
            header="Confirmar Eliminación"
            [modal]="true"
            [style]="{width: '400px'}"
            [draggable]="false"
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Eliminar Permiso?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas eliminar el permiso
                        <strong>"{{rolDetalleToDelete?.nombre_menu}}"</strong> del rol
                        <strong>"{{rolDetalleToDelete?.nombre_rol}}"</strong>?
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
                    (click)="cancelDeleteRolDetalle()"
                    label="Cancelar"
                    class="p-button-text"
                ></button>
                <button
                    pButton
                    type="button"
                    (click)="confirmDeleteRolDetalle()"
                    label="Eliminar"
                    class="p-button-danger"
                ></button>
            </div>
        </p-dialog>

        <!-- Modal de Confirmación para Cambio de Bloqueo -->
        <p-dialog
            [(visible)]="showConfirmToggleLock"
            header="Confirmar Cambio de Bloqueo"
            [modal]="true"
            [style]="{width: '400px'}"
            [draggable]="false"
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-lock text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Cambiar Bloqueo?</h4>
                    <p class="text-sm text-gray-600">
                        ¿Deseas <strong>{{ rolDetalleToLock?.swlock === 1 ? 'desbloquear' : 'bloquear' }}</strong>
                        el detalle de rol
                        <strong>"{{rolDetalleToLock?.nombre_menu}}"</strong>?
                    </p>
                    <p class="text-sm text-blue-600 mt-2">
                        Estado actual: <strong>{{ getLockLabel(rolDetalleToLock?.swlock || 0) }}</strong>
                    </p>
                </div>
            </div>
            <div class="flex justify-end gap-2">
                <p-button
                    label="Cancelar"
                    icon="pi pi-times"
                    class="p-button-secondary"
                    (click)="cancelToggleLock()"
                ></p-button>
                <p-button
                    pButton
                    type="button"
                    (click)="confirmToggleLock()"
                    [label]="rolDetalleToLock?.swlock === 1 ? 'Desbloquear' : 'Bloquear'"
                    [class]="rolDetalleToLock?.swlock === 1 ? 'p-button-success' : 'p-button-warning'"
                ></p-button>
            </div>
        </p-dialog>

        <p-toast></p-toast>
    `,
    styles: [`
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

        /* Contener dropdown del p-select dentro del modal */
        .p-dialog .p-select-panel {
            position: absolute !important;
            z-index: 1000 !important;
            max-height: 200px !important;
            overflow-y: auto !important;
        }

        /* Asegurar que el modal tenga posición relativa para el dropdown */
        .p-dialog {
            position: relative !important;
        }

        /* Estilos para el overlay del select */
        .p-select-overlay {
            position: absolute !important;
            z-index: 1000 !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }

        /* Asegurar que el dropdown del select no se salga del viewport */
        .p-select-panel {
            max-height: 200px !important;
            overflow-y: auto !important;
        }

        /* Estilos específicos para el modal */
        .p-dialog .p-select {
            width: 100% !important;
        }
    `]
})
export class RolDetalleTabComponent implements OnInit, OnChanges {
    @Input() rolSeleccionado: Rol | null = null;
    @Input() menusDisponibles: MenuMock[] = [];
    @Output() rolDetallesChange = new EventEmitter<RolDetalle[]>();

    // Datos
    rolDetalles: RolDetalle[] = [];

    // Estados de modales
    showRolDetalleModal = false;
    showConfirmDeleteRolDetalle = false;
    showConfirmToggleLock = false;

    // Variables de formulario
    rolDetalleForm!: FormGroup;
    rolDetalleFormTitle = '';
    isEditingRolDetalle = false;
    editingRolDetalleId: number | null = null;

    // Variables para edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Variables para eliminación
    rolDetalleToDelete: RolDetalle | null = null;

    // Variables para cambio de bloqueo
    rolDetalleToLock: RolDetalle | null = null;

    // Variables de carga
    loadingRolDetalle = false;

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder,
        private rolDetalleService: RolDetalleService
    ) {}

    ngOnInit(): void {
        this.initializeForms();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['rolSeleccionado']) {
            if (this.rolSeleccionado) {
                this.cargarRolDetalles();
            } else {
                // Limpiar detalles cuando no hay selección
                this.rolDetalles = [];
            }
        }
    }

    // ========== INICIALIZACIÓN ==========

    initializeForms(): void {
        this.rolDetalleForm = this.fb.group({
            id_rol: ['', [Validators.required]],
            id_menu: ['', [Validators.required]],
            ren: [1, [Validators.required]],
            swestado: [1],  // Por defecto activo
            swlock: [0]     // Por defecto desbloqueado
        });
    }

    // ========== CARGA DE DATOS ==========

    cargarRolDetalles(): void {
        if (!this.rolSeleccionado) {
            console.log('ℹ️ No hay rol seleccionado, no se cargan detalles');
            this.rolDetalles = [];
            return;
        }

        this.loadingRolDetalle = true;

        this.rolDetalleService.consultarDetalleRol({ id_rol: this.rolSeleccionado.id_rol }).subscribe({
            next: (response) => {
                this.rolDetalles = response || [];
                this.loadingRolDetalle = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Detalles Actualizados',
                    detail: `${this.rolDetalles.length} detalles cargados para ${this.rolSeleccionado?.nombre}`
                });
            },
            error: (error) => {
                console.error('❌ Error consultando detalles:', error);
                this.loadingRolDetalle = false;

                let errorMessage = 'Error desconocido al cargar detalles';

                // Intentar extraer el mensaje específico del backend
                if (error && error.message) {
                    errorMessage = error.message;
                } else if (error && error.originalError && error.originalError.message) {
                    errorMessage = error.originalError.message;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar detalles',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    // ========== FORMULARIO CRUD ==========

    openRolDetalleForm(rolDetalle?: RolDetalle): void {
        if (!this.rolSeleccionado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Selección requerida',
                detail: 'Por favor selecciona un rol primero'
            });
            return;
        }

        this.showRolDetalleModal = true;

        if (rolDetalle) {
            this.rolDetalleFormTitle = 'Editar Permiso de Rol';
            this.isEditingRolDetalle = true;
            this.editingRolDetalleId = rolDetalle.id_rold;

            this.rolDetalleForm.patchValue({
                id_rol: rolDetalle.id_rol,
                id_menu: rolDetalle.id_menu,
                ren: rolDetalle.ren,
                swestado: rolDetalle.swestado
            });
        } else {
            this.rolDetalleFormTitle = 'Nuevo Permiso de Rol';
            this.isEditingRolDetalle = false;
            this.editingRolDetalleId = null;

            this.rolDetalleForm.reset();
            this.rolDetalleForm.patchValue({
                id_rol: this.rolSeleccionado.id_rol,
                ren: 1,
                swestado: 1  // Por defecto activo
            });
        }
    }

    closeRolDetalleForm(): void {
        this.showRolDetalleModal = false;
        this.rolDetalleForm.reset();
        this.isEditingRolDetalle = false;
        this.editingRolDetalleId = null;
    }

    saveRolDetalle(): void {
        if (this.rolDetalleForm.valid && this.rolSeleccionado) {
            const formData = this.rolDetalleForm.value;

            // Asegurar que swestado y swlock tengan valores por defecto
            const processedData = {
                ...formData,
                swestado: formData.swestado !== undefined ? formData.swestado : 1,
                swlock: formData.swlock !== undefined ? formData.swlock : 0
            };

            if (this.isEditingRolDetalle && this.editingRolDetalleId) {
                this.updateRolDetalle(this.editingRolDetalleId, processedData);
            } else {
                this.createRolDetalle(processedData);
            }
        }
    }

    createRolDetalle(formData: any): void {
        const rolDetalleData = {
            id_rol: formData.id_rol,
            id_menu: formData.id_menu,
            ren: formData.ren,
            swestado: formData.swestado,
            swlock: formData.swlock
        };

        this.rolDetalleService.insertDetalleRol(rolDetalleData).subscribe({
            next: (response) => {

                // Si el backend devuelve el objeto creado con el ID real, usarlo
                if (response.data && response.data.length > 0) {
                    const rolDetalleCreado = response.data[0];
                    this.rolDetalles.push(rolDetalleCreado);
                } else {
                    // Fallback: crear objeto local si el backend no devuelve data completa
                    const menu = this.menusDisponibles.find(m => m.id_menu === formData.id_menu);
                    const newRolDetalle: RolDetalle = {
                        id_rold: Date.now(), // ID temporal (último recurso)
                        id_rol: formData.id_rol,
                        id_menu: formData.id_menu,
                        ren: formData.ren,
                        swestado: formData.swestado || 1,  // Por defecto activo
                        swlock: formData.swlock || 0,      // Por defecto desbloqueado
                        fecha_m: new Date().toISOString(),
                        nombre_rol: this.rolSeleccionado?.nombre || '',
                        nombre_menu: menu?.nombre || null
                    };
                    this.rolDetalles.push(newRolDetalle);
                }

                this.rolDetallesChange.emit(this.rolDetalles);

                const menuNombre = this.menusDisponibles.find(m => m.id_menu === formData.id_menu)?.nombre || 'Menú';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Permiso creado',
                    detail: `Permiso ${menuNombre} agregado al rol ${this.rolSeleccionado?.nombre}`
                });

                this.closeRolDetalleForm();
            },
            error: (error) => {
                console.error('❌ Error creando detalle de rol:', error);
                let errorMessage = 'Error desconocido creando detalle de rol';

                // Intentar extraer el mensaje específico del backend
                if (error && error.message) {
                    errorMessage = error.message;
                } else if (error && error.originalError && error.originalError.message) {
                    errorMessage = error.originalError.message;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al crear detalle de rol',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    updateRolDetalle(detalleId: number, formData: any): void {
        const rolDetalleData = {
            id_rol: formData.id_rol,
            id_menu: formData.id_menu,
            ren: formData.ren,
            swestado: formData.swestado,
            swlock: formData.swlock
        };

        this.rolDetalleService.updateDetalleRolAction(detalleId, rolDetalleData).subscribe({
            next: (response) => {

                // Actualizar objeto local
                const index = this.rolDetalles.findIndex(d => d.id_rold === detalleId);
                if (index !== -1) {
                    const menu = this.menusDisponibles.find(m => m.id_menu === formData.id_menu);
                    this.rolDetalles[index] = {
                        ...this.rolDetalles[index],
                        id_rol: formData.id_rol,
                        id_menu: formData.id_menu,
                        ren: formData.ren,
                        nombre_rol: this.rolSeleccionado?.nombre || '',
                        nombre_menu: menu?.nombre || null
                    };
                    this.rolDetallesChange.emit(this.rolDetalles);
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Permiso actualizado',
                    detail: `Permiso actualizado exitosamente`
                });

                this.closeRolDetalleForm();
            },
            error: (error) => {
                console.error('❌ Error actualizando detalle de rol:', error);
                let errorMessage = 'Error desconocido actualizando detalle de rol';

                // Intentar extraer el mensaje específico del backend
                if (error && error.message) {
                    errorMessage = error.message;
                } else if (error && error.originalError && error.originalError.message) {
                    errorMessage = error.originalError.message;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al actualizar detalle de rol',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    editarRolDetalle(rolDetalle: RolDetalle): void {
        this.openRolDetalleForm(rolDetalle);
    }

    // ========== ELIMINACIÓN ==========

    eliminarRolDetalle(rolDetalle: RolDetalle): void {
        this.rolDetalleToDelete = rolDetalle;
        this.showConfirmDeleteRolDetalle = true;
    }

    confirmDeleteRolDetalle(): void {
        if (this.rolDetalleToDelete) {
            const rolDetalleActual = { ...this.rolDetalleToDelete }; // Guardar referencia local

            this.rolDetalleService.deleteDetalleRolAction(this.rolDetalleToDelete.id_rold).subscribe({
                next: (response) => {

                    const index = this.rolDetalles.findIndex(d => d.id_rold === rolDetalleActual.id_rold);
                    if (index !== -1) {
                        this.rolDetalles.splice(index, 1);
                        this.rolDetallesChange.emit(this.rolDetalles);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Permiso eliminado',
                        detail: response.mensaje || `Permiso ${rolDetalleActual.nombre_menu} eliminado exitosamente`
                    });

                    // Limpiar después de un pequeño delay para evitar conflictos
                    setTimeout(() => {
                        this.cancelDeleteRolDetalle();
                    }, 100);
                },
                error: (error) => {
                    console.error('❌ Error eliminando detalle de rol:', error);
                    let errorMessage = 'Error desconocido eliminando detalle de rol';

                    // Intentar extraer el mensaje específico del backend
                    if (error && error.message) {
                        errorMessage = error.message;
                    } else if (error && error.originalError && error.originalError.message) {
                        errorMessage = error.originalError.message;
                    } else if (typeof error === 'string') {
                        errorMessage = error;
                    }

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al eliminar detalle de rol',
                        detail: errorMessage,
                        life: 5000
                    });

                    this.cancelDeleteRolDetalle();
                }
            });
        }
    }

    cancelDeleteRolDetalle(): void {
        this.showConfirmDeleteRolDetalle = false;
        this.rolDetalleToDelete = null;
    }

    // ========== EDICIÓN INLINE ==========

    startInlineEdit(detalle: RolDetalle, field: string): void {
        this.editingCell = `${field}_${detalle.id_rold}`;
        this.originalValue = detalle[field as keyof RolDetalle];
    }

    saveInlineEdit(detalle: RolDetalle, field: string): void {
        const currentValue = detalle[field as keyof RolDetalle];

        // Actualizar nombre del menú si se cambió
        if (field === 'menu') {
            const menu = this.menusDisponibles.find(m => m.id_menu === detalle.id_menu);
            if (menu) {
                detalle.nombre_menu = menu.nombre;
            }
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Campo actualizado',
            detail: `${field} actualizado exitosamente`
        });

        this.editingCell = null;
        this.originalValue = null;
    }

    cancelInlineEdit(): void {
        if (this.editingCell && this.originalValue !== null) {
            const [field, detalleId] = this.editingCell.split('_');
            const detalle = this.rolDetalles.find(d => d.id_rold.toString() === detalleId);
            if (detalle) {
                (detalle as any)[field] = this.originalValue;
            }
        }

        this.editingCell = null;
        this.originalValue = null;
    }

    // ========== CAMBIO DE BLOQUEO ==========

    toggleLockDetalle(detalle: RolDetalle): void {
        this.rolDetalleToLock = detalle;
        this.showConfirmToggleLock = true;
    }

    confirmToggleLock(): void {
        if (this.rolDetalleToLock) {
            const rolDetalleActual = { ...this.rolDetalleToLock }; // Guardar referencia local
            const nuevoLock = this.rolDetalleToLock.swlock === 1 ? 0 : 1;

            const updateData = {
                id_rold: this.rolDetalleToLock.id_rold,
                swlock: nuevoLock
            };

            this.rolDetalleService.updateDetalleRolAction(this.rolDetalleToLock.id_rold, updateData).subscribe({
                next: (response) => {
                    if (response.statuscode === 200) {
                        // Actualizar localmente usando la referencia guardada
                        this.rolDetalleToLock!.swlock = nuevoLock;

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Bloqueo actualizado',
                            detail: `Detalle ${rolDetalleActual.nombre_menu} ${nuevoLock === 1 ? 'bloqueado' : 'desbloqueado'} correctamente`
                        });

                        // Recargar datos para mantener consistencia
                        this.cargarRolDetalles();

                        // Limpiar después de un pequeño delay para evitar conflictos
                        setTimeout(() => {
                            this.cancelToggleLock();
                        }, 100);
                    } else {
                        console.error('❌ Error del backend cambiando bloqueo:', response);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error al cambiar bloqueo',
                            detail: response.mensaje || `Error del backend: ${response.statuscode}`
                        });
                        this.cancelToggleLock();
                    }
                },
                error: (error) => {
                    console.error('❌ Error cambiando bloqueo:', error);
                    let errorMessage = 'Error desconocido cambiando bloqueo';

                    // Intentar extraer el mensaje específico del backend
                    if (error && error.message) {
                        errorMessage = error.message;
                    } else if (error && error.originalError && error.originalError.message) {
                        errorMessage = error.originalError.message;
                    } else if (typeof error === 'string') {
                        errorMessage = error;
                    }

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al cambiar bloqueo',
                        detail: errorMessage,
                        life: 5000
                    });

                    this.cancelToggleLock();
                }
            });
        }
    }

    cancelToggleLock(): void {
        this.showConfirmToggleLock = false;
        this.rolDetalleToLock = null;
    }

    // ========== UTILIDADES ==========

    onGlobalFilter(table: Table, event: Event): void {
        const target = event.target as HTMLInputElement;
        table.filterGlobal(target.value, 'contains');
    }

    getLockLabel(lock: number): string {
        return lock === 1 ? 'Bloqueado' : 'Desbloqueado';
    }

    getLockSeverity(lock: number): 'warning' | 'info' {
        return lock === 1 ? 'warning' : 'info';
    }
}