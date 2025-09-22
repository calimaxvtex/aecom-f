import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { RolService } from '../../../features/usuarios/services/rol.service';
import { RolForm } from '../../../features/usuarios/models/rol.interface';

// Interfaces
interface RolMock {
    id_rol: number;
    nombre: string;
    estado: string;
    fecha_m: string;
}

@Component({
    selector: 'app-roles-tab',
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
        SelectModule
    ],
    providers: [MessageService],
    template: `
        <div class="mb-4">
            <h1 class="text-2xl font-bold mb-2">🛡️ Gestión de Roles</h1>
            <p class="text-gray-600 mb-4">Administra los roles del sistema</p>
        </div>

        <p-table
            #dtRoles
            [value]="roles"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            responsiveLayout="scroll"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['nombre']"
        >
            <ng-template #caption>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <input 
                        pInputText
                        type="text" 
                        (input)="onGlobalFilter(dtRoles, $event)" 
                        placeholder="Buscar roles..." 
                        class="w-full sm:w-80 order-1 sm:order-0"
                    />
                    <div class="flex gap-2 ml-auto">
                        <button 
                            (click)="cargarRoles()" 
                            pButton 
                            raised 
                            class="w-auto" 
                            icon="pi pi-refresh"
                            [loading]="loadingRoles"
                        ></button>
                        <button 
                            (click)="openRolForm()" 
                            pButton 
                            raised 
                            class="w-auto" 
                            icon="pi pi-plus"
                        ></button>
                    </div>
                </div>
            </ng-template>

            <ng-template #header>
                <tr>
                    <th style="width: 80px;">ID</th>
                    <th style="width: 200px;">Nombre</th>
                    <th style="width: 100px;">Estado</th>
                    <th style="width: 120px;">Fecha Modificación</th>
                    <th style="width: 100px;">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-rol let-rowIndex="rowIndex">
                <tr
                    (click)="onRowClick(rol)"
                    [class.bg-blue-50]="rolSeleccionado?.id_rol === rol.id_rol"
                    class="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <!-- ID -->
                    <td>{{rol.id_rol}}</td>
                    <!-- Nombre (editable inline) -->
                    <td>
                        <div *ngIf="editingCell !== 'nombre_' + rol.id_rol; else editNombre">
                            <span 
                                (click)="startInlineEdit(rol, 'nombre')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                pTooltip="Click para editar"
                            >
                                {{rol.nombre}}
                            </span>
                        </div>
                        <ng-template #editNombre>
                            <div class="inline-edit-container">
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="rol.nombre"
                                    (keyup.enter)="saveInlineEdit(rol, 'nombre')"
                                    (keyup.escape)="cancelInlineEditRol()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                    placeholder="Nombre del rol"
                                />
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEdit(rol, 'nombre')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    pButton
                                    icon="pi pi-undo"
                                    (click)="cancelInlineEditRol()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
                        </ng-template>
                    </td>

                    <!-- Estado (toggle) -->
                    <td>
                        <p-tag 
                            [value]="getEstadoLabel(rol.estado)" 
                            [severity]="getEstadoSeverity(rol.estado)"
                            (click)="toggleEstadoRol(rol)"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            pTooltip="Click para cambiar estado"
                        ></p-tag>
                    </td>

                    <!-- Fecha Modificación -->
                    <td>{{rol.fecha_m | date:'short'}}</td>

                    <!-- Acciones -->
                    <td>
                        <div class="flex gap-1">
                            <button 
                                (click)="editarRol(rol)" 
                                pButton 
                                class="p-button-sm p-button-text p-button-warning" 
                                icon="pi pi-pencil"
                                pTooltip="Editar"
                            ></button>
                            <button 
                                (click)="eliminarRol(rol)" 
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

        <!-- Modal de Rol -->
        <p-dialog 
            [(visible)]="showRolModal" 
            [header]="rolFormTitle"
            [modal]="true" 
            [style]="{width: '500px'}"
            [draggable]="false" 
            [resizable]="false"
            (onHide)="closeRolForm()"
        >
            <form [formGroup]="rolForm" (ngSubmit)="saveRol()">
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label for="nombre" class="block text-sm font-medium mb-2">Nombre *</label>
                        <input 
                            id="nombre"
                            formControlName="nombre"
                            pInputText 
                            class="w-full"
                            placeholder="Nombre del rol"
                        />
                        <small 
                            *ngIf="rolForm.get('nombre')?.invalid && rolForm.get('nombre')?.touched" 
                            class="text-red-500"
                        >
                            Nombre es requerido
                        </small>
                    </div>

                    <div>
                        <label for="estado" class="block text-sm font-medium mb-2">Estado *</label>
                        <p-select 
                            id="estado"
                            formControlName="estado"
                            [options]="estadoOptions"
                            optionLabel="label"
                            optionValue="value"
                            class="w-full"
                        ></p-select>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button 
                        type="button"
                        pButton 
                        label="Cancelar" 
                        class="p-button-text"
                        (click)="closeRolForm()"
                    ></button>
                    <button 
                        type="submit"
                        pButton 
                        [label]="isEditingRol ? 'Actualizar' : 'Crear'" 
                        class="p-button-primary"
                        [disabled]="!rolForm.valid"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de Confirmación para Rol -->
        <p-dialog 
            [(visible)]="showConfirmDeleteRol" 
            header="Confirmar Eliminación"
            [modal]="true" 
            [style]="{width: '400px'}"
            [draggable]="false" 
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Eliminar Rol?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas eliminar el rol 
                        <strong>"{{rolToDelete?.nombre}}"</strong>?
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
                    (click)="cancelDeleteRol()" 
                    label="Cancelar" 
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    type="button" 
                    (click)="confirmDeleteRol()" 
                    label="Eliminar" 
                    class="p-button-danger"
                ></button>
            </div>
        </p-dialog>
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

        /* Fila seleccionada */
        .bg-blue-50 {
            background-color: #eff6ff !important;
        }
    `]
})
export class RolesTabComponent implements OnInit {
    @Input() roles: RolMock[] = [];
    @Output() rolesChange = new EventEmitter<RolMock[]>();
    @Output() refreshRoles = new EventEmitter<void>();

    // Output para comunicar la selección al componente padre
    @Output() rolSeleccionadoChange = new EventEmitter<RolMock | null>();
    @Output() rolClick = new EventEmitter<RolMock>();
    @Output() rolDobleClick = new EventEmitter<RolMock>();

    // Estado de selección
    rolSeleccionado: RolMock | null = null;

    // Variables para formularios modales
    showRolModal = false;
    
    // Estados de modales de confirmación
    showConfirmDeleteRol = false;
    rolToDelete: RolMock | null = null;
    
    rolFormTitle = '';
    isEditingRol = false;
    editingRolId: number | null = null;

    // Formularios reactivos
    rolForm!: FormGroup;

    // Variables para edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Variables para API
    loadingRoles = false;

    // Opciones para select
    estadoOptions = [
        { label: 'Activo', value: 'A' },
        { label: 'Inactivo', value: 'I' }
    ];

    // Control de doble click
    private lastClickTime: number = 0;
    private lastClickedRol: RolMock | null = null;
    private readonly DOUBLE_CLICK_DELAY = 300; // ms

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder,
        private rolService: RolService
    ) {}

    ngOnInit(): void {
        this.initializeForms();
    }

    // Inicializar formularios reactivos
    initializeForms(): void {
        this.rolForm = this.fb.group({
            nombre: ['', [Validators.required]],
            estado: ['A', [Validators.required]]
        });
    }

    // Métodos de filtrado y búsqueda
    onGlobalFilter(table: Table, event: Event): void {
        const target = event.target as HTMLInputElement;
        table.filterGlobal(target.value, 'contains');
    }

    // Métodos de estado
    getEstadoLabel(estado: string): string {
        switch (estado) {
            case 'A': return 'Activo';
            case 'I': return 'Inactivo';
            default: return 'Desconocido';
        }
    }

    getEstadoSeverity(estado: string): string {
        switch (estado) {
            case 'A': return 'success';
            case 'I': return 'danger';
            default: return 'info';
        }
    }

    // Métodos de formulario modal
    openRolForm(rol?: RolMock): void {
        this.showRolModal = true;
        
        if (rol) {
            this.rolFormTitle = 'Editar Rol';
            this.isEditingRol = true;
            this.editingRolId = rol.id_rol;
            
            this.rolForm.patchValue({
                nombre: rol.nombre,
                estado: rol.estado
            });
        } else {
            this.rolFormTitle = 'Nuevo Rol';
            this.isEditingRol = false;
            this.editingRolId = null;
            this.rolForm.reset();
            this.rolForm.patchValue({ estado: 'A' });
        }
    }

    editarRol(rol: RolMock): void {
        this.openRolForm(rol);
    }

    closeRolForm(): void {
        this.showRolModal = false;
        this.rolForm.reset();
        this.isEditingRol = false;
        this.editingRolId = null;
    }

    toggleEstadoRol(rol: RolMock): void {
        const newValue = rol.estado === 'A' ? 'I' : 'A';

        this.rolService.updateRolAction(rol.id_rol, { estado: newValue }).subscribe({
            next: (response) => {
                if (response.statuscode === 200 && response.data && response.data.length > 0) {
                    const updatedRol = response.data[0];
                    const index = this.roles.findIndex(r => r.id_rol === rol.id_rol);
                    if (index !== -1) {
                        this.roles[index] = updatedRol;
                        this.rolesChange.emit(this.roles);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Estado actualizado',
                        detail: `Rol ${updatedRol.nombre} ahora está ${newValue === 'A' ? 'activo' : 'inactivo'}`
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error cambiando estado del rol:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cambiar estado',
                    detail: error.message || 'Error desconocido al cambiar el estado del rol'
                });
            }
        });
    }

    saveRol(): void {
        if (this.rolForm.valid) {
            const formData = this.rolForm.value;
            
            if (this.isEditingRol && this.editingRolId) {
                this.updateRol(this.editingRolId, formData);
            } else {
                this.createRol(formData);
            }
        }
    }

    createRol(formData: any): void {
        const rolData = {
            nombre: formData.nombre,
            estado: formData.estado
        };

        this.rolService.insertRol(rolData).subscribe({
            next: (response) => {
                if (response.statuscode === 200 && response.data && response.data.length > 0) {
                    const newRol = response.data[0];
                    this.roles.push(newRol);
                    this.rolesChange.emit(this.roles);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Rol creado',
                        detail: `Rol ${newRol.nombre} creado exitosamente`
                    });

                    this.closeRolForm();
                } else {
                    // Mostrar error del backend
                    console.error('❌ Error del backend creando rol:', response);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al crear rol',
                        detail: response.mensaje || `Error del backend: ${response.statuscode}`
                    });
                }
            },
            error: (error) => {
                // Error de red o cliente
                console.error('❌ Error de conexión creando rol:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de conexión',
                    detail: 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
                });
            }
        });
    }

    updateRol(rolId: number, formData: any): void {
        const rolData = {
            nombre: formData.nombre,
            estado: formData.estado
        };

        this.rolService.updateRolAction(rolId, rolData).subscribe({
            next: (response) => {
                if (response.statuscode === 200 && response.data && response.data.length > 0) {
                    const updatedRol = response.data[0];
                    const index = this.roles.findIndex(r => r.id_rol === rolId);
                    if (index !== -1) {
                        this.roles[index] = updatedRol;
                        this.rolesChange.emit(this.roles);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Rol actualizado',
                        detail: `Rol ${updatedRol.nombre} actualizado exitosamente`
                    });

                    this.closeRolForm();
                } else {
                    // Mostrar error del backend
                    console.error('❌ Error del backend actualizando rol:', response);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al actualizar rol',
                        detail: response.mensaje || `Error del backend: ${response.statuscode}`
                    });
                }
            },
            error: (error) => {
                // Error de red o cliente
                console.error('❌ Error de conexión actualizando rol:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de conexión',
                    detail: 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
                });
            }
        });
    }

    // Métodos de eliminación
    eliminarRol(rol: RolMock): void {
        this.rolToDelete = rol;
        this.showConfirmDeleteRol = true;
    }

    confirmDeleteRol(): void {
        if (this.rolToDelete) {
            const rolActual = { ...this.rolToDelete }; // Guardar referencia local

            this.rolService.deleteRolAction(this.rolToDelete.id_rol).subscribe({
                next: (response) => {
                    if (response.statuscode === 200) {
                        const index = this.roles.findIndex(r => r.id_rol === rolActual.id_rol);
                        if (index !== -1) {
                            this.roles.splice(index, 1);
                            this.rolesChange.emit(this.roles);
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Rol eliminado',
                            detail: response.mensaje || `Rol ${rolActual.nombre} eliminado exitosamente`
                        });

                        // Limpiar después de un pequeño delay para evitar conflictos
                        setTimeout(() => {
                            this.cancelDeleteRol();
                        }, 100);
                    } else {
                        // Mostrar error del backend
                        console.error('❌ Error del backend eliminando rol:', response);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error al eliminar rol',
                            detail: response.mensaje || `Error del backend: ${response.statuscode}`
                        });
                        this.cancelDeleteRol();
                    }
                },
                error: (error) => {
                    console.error('❌ Error eliminando rol:', error);
                    let errorMessage = 'Error desconocido eliminando rol';

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
                        summary: 'Error al eliminar rol',
                        detail: errorMessage,
                        life: 5000
                    });

                    this.cancelDeleteRol();
                }
            });
        }
    }

    cancelDeleteRol(): void {
        this.showConfirmDeleteRol = false;
        this.rolToDelete = null;
    }

    // Métodos de edición inline
    startInlineEdit(rol: RolMock, field: string): void {
        this.editingCell = `${field}_${rol.id_rol}`;
        this.originalValue = rol[field as keyof RolMock];
    }

    saveInlineEdit(rol: RolMock, field: string): void {
        const currentValue = rol[field as keyof RolMock];

        if (currentValue === this.originalValue) {
            this.cancelInlineEditRol();
            return;
        }

        const updateData: Partial<RolForm> = {
            [field]: currentValue
        };

        this.rolService.updateRolAction(rol.id_rol, updateData).subscribe({
            next: (response) => {
                if (response.statuscode === 200 && response.data && response.data.length > 0) {
                    const updatedRol = response.data[0];
                    const index = this.roles.findIndex(r => r.id_rol === rol.id_rol);
                    if (index !== -1) {
                        this.roles[index] = updatedRol;
                        this.rolesChange.emit(this.roles);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Campo actualizado',
                        detail: `${field} actualizado exitosamente`
                    });

                    this.editingCell = null;
                    this.originalValue = null;
                }
            },
            error: (error) => {
                console.error('❌ Error actualizando campo inline:', error);

                // Revertir el cambio local
                (rol as any)[field] = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al actualizar',
                    detail: error.message || 'Error desconocido al actualizar el campo'
                });
            }
        });
    }

    cancelInlineEditRol(): void {
        if (this.editingCell && this.originalValue !== null) {
            const [field, rolId] = this.editingCell.split('_');
            const rol = this.roles.find(r => r.id_rol.toString() === rolId);
            if (rol) {
                (rol as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;
    }

    // ========== FUNCIONALIDAD PADRE-HIJO ==========

    onRowClick(rol: RolMock): void {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastClickTime;


        // Verificar si es un doble click
        if (timeDiff < this.DOUBLE_CLICK_DELAY && this.lastClickedRol?.id_rol === rol.id_rol) {
            this.handleDoubleClick(rol);
        } else {
            // Click simple - seleccionar el rol
            this.rolSeleccionado = rol;
            this.rolSeleccionadoChange.emit(rol);
            this.rolClick.emit(rol); // Nuevo evento para click simple
        }

        // Actualizar timestamps para el próximo click
        this.lastClickTime = currentTime;
        this.lastClickedRol = rol;
    }

    private handleDoubleClick(rol: RolMock): void {
        // Seleccionar el rol
        this.rolSeleccionado = rol;
        this.rolSeleccionadoChange.emit(rol);
        // Emitir evento de doble click
        this.rolDobleClick.emit(rol);
    }

    // Método para cargar roles (emitir evento al componente padre)
    cargarRoles(): void {
        this.rolService.getRoles().subscribe({
            next: (roles) => {
                this.roles = roles;
                this.rolesChange.emit(this.roles);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Roles cargados',
                    detail: 'Roles actualizados con éxito'
                });
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar roles',
                    detail: error.message
                });
            }
        });
    }
}
