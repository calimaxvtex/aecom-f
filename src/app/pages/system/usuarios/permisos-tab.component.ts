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
import { RolUsuarioService } from '../../../features/usuarios/services/rol-usuario.service';
import { RolUsuario } from '../../../features/usuarios/models/rol-usuario.interface';
import { Usuario } from '../../../features/usuarios/models/usuario.interface';

interface RolMock {
    id_rol: number;
    nombre: string;
    estado: string;
    fecha_m: string;
}

@Component({
    selector: 'app-permisos-tab',
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
            <h1 class="text-2xl font-bold mb-2">🔑 Gestión de Permisos</h1>
            <p class="text-gray-600 mb-4">Administra los permisos de usuarios y roles</p>
        </div>

        <p-table
            #dtPermisos
            [value]="permisos"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            responsiveLayout="scroll"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} permisos"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['nombre_usuario', 'email_usuario', 'nombre_rol']"
        >
            <ng-template #caption>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <input 
                        pInputText
                        type="text" 
                        (input)="onGlobalFilter(dtPermisos, $event)" 
                        placeholder="Buscar permisos..." 
                        class="w-full sm:w-80 order-1 sm:order-0"
                    />
                    <div class="flex gap-2 ml-auto">
                        <button 
                            (click)="cargarPermisos()" 
                            pButton 
                            raised 
                            class="w-auto" 
                            icon="pi pi-refresh"
                            [loading]="loadingPermisos"
                        ></button>
                        <button 
                            (click)="openPermisoForm()" 
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
                    <th style="width: 200px;">Usuario</th>
                    <th style="width: 250px;">Email</th>
                    <th style="width: 200px;">Rol</th>
                    <th style="width: 100px;">Estado</th>
                    <th style="width: 120px;">Fecha Modificación</th>
                    <th style="width: 100px;">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-permiso let-rowIndex="rowIndex">
                <tr>
                    <!-- Usuario (editable inline) -->
                    <td>
                        <div *ngIf="editingCell !== 'usuario_' + permiso.id; else editUsuario">
                            <span 
                                (click)="startInlineEdit(permiso, 'usuario')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                pTooltip="Click para editar"
                            >
                                {{permiso.nombre_usuario}}
                            </span>
                        </div>
                        <ng-template #editUsuario>
                            <div class="flex items-center gap-1">
                                <p-select 
                                    [(ngModel)]="permiso.id_usu"
                                    [options]="usuarios"
                                    optionLabel="nombre"
                                    optionValue="id"
                                    (keyup.escape)="cancelInlineEditPermiso()"
                                    class="flex-1"
                                    placeholder="Seleccionar usuario"
                                    autofocus
                                ></p-select>
                                <button
                                    (click)="saveInlineEdit(permiso, 'usuario')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    (click)="cancelInlineEditPermiso()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
                        </ng-template>
                    </td>

                    <!-- Email -->
                    <td>{{permiso.email_usuario}}</td>

                    <!-- Rol (editable inline) -->
                    <td>
                        <div *ngIf="editingCell !== 'rol_' + permiso.id; else editRol">
                            <span 
                                (click)="startInlineEdit(permiso, 'rol')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                pTooltip="Click para editar"
                            >
                                {{permiso.nombre_rol}}
                            </span>
                        </div>
                        <ng-template #editRol>
                            <div class="flex items-center gap-1">
                                <p-select 
                                    [(ngModel)]="permiso.id_rol"
                                    [options]="roles"
                                    optionLabel="nombre"
                                    optionValue="id_rol"
                                    (keyup.escape)="cancelInlineEditPermiso()"
                                    class="flex-1"
                                    placeholder="Seleccionar rol"
                                    autofocus
                                ></p-select>
                                <button
                                    (click)="saveInlineEdit(permiso, 'rol')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    (click)="cancelInlineEditPermiso()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
                        </ng-template>
                    </td>

                    <!-- Estado (toggle) -->
                    <td>
                        <p-tag 
                            [value]="getEstadoLabel(permiso.estado)" 
                            [severity]="getEstadoSeverity(permiso.estado)"
                            (click)="toggleEstadoPermiso(permiso)"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            pTooltip="Click para cambiar estado"
                        ></p-tag>
                    </td>

                    <!-- Fecha Modificación -->
                    <td>{{permiso.fecha_m | date:'short'}}</td>

                    <!-- Acciones -->
                    <td>
                        <div class="flex gap-1">
                            <button 
                                (click)="editarPermiso(permiso)" 
                                pButton 
                                class="p-button-sm p-button-text p-button-warning" 
                                icon="pi pi-pencil"
                                pTooltip="Editar"
                            ></button>
                            <button 
                                (click)="eliminarPermiso(permiso)" 
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

        <!-- Modal de Permiso -->
        <p-dialog 
            [(visible)]="showPermisoModal" 
            [header]="permisoFormTitle"
            [modal]="true" 
            [style]="{width: '500px'}"
            [draggable]="false" 
            [resizable]="false"
            (onHide)="closePermisoForm()"
        >
            <form [formGroup]="permisoForm" (ngSubmit)="savePermiso()">
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label for="usuario" class="block text-sm font-medium mb-2">Usuario *</label>
                        <p-select 
                            id="usuario"
                            formControlName="id_usu"
                            [options]="usuarios"
                            optionLabel="nombre"
                            optionValue="id"
                            class="w-full"
                            placeholder="Seleccionar usuario"
                        ></p-select>
                        <small 
                            *ngIf="permisoForm.get('id_usu')?.invalid && permisoForm.get('id_usu')?.touched" 
                            class="text-red-500"
                        >
                            Usuario es requerido
                        </small>
                    </div>

                    <div>
                        <label for="rol" class="block text-sm font-medium mb-2">Rol *</label>
                        <p-select 
                            id="rol"
                            formControlName="id_rol"
                            [options]="roles"
                            optionLabel="nombre"
                            optionValue="id_rol"
                            class="w-full"
                            placeholder="Seleccionar rol"
                        ></p-select>
                        <small 
                            *ngIf="permisoForm.get('id_rol')?.invalid && permisoForm.get('id_rol')?.touched" 
                            class="text-red-500"
                        >
                            Rol es requerido
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
                        (click)="closePermisoForm()"
                    ></button>
                    <button 
                        type="submit"
                        pButton 
                        [label]="isEditingPermiso ? 'Actualizar' : 'Crear'" 
                        class="p-button-primary"
                        [disabled]="!permisoForm.valid"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de Confirmación para Permiso -->
        <p-dialog 
            [(visible)]="showConfirmDeletePermiso" 
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
                        ¿Estás seguro de que deseas eliminar el permiso de 
                        <strong>"{{permisoToDelete?.nombre_usuario}}"</strong> para el rol
                        <strong>"{{permisoToDelete?.nombre_rol}}"</strong>?
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
                    (click)="cancelDeletePermiso()" 
                    label="Cancelar" 
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    type="button" 
                    (click)="confirmDeletePermiso()" 
                    label="Eliminar" 
                    class="p-button-danger"
                ></button>
            </div>
        </p-dialog>

        <!-- Modal de Confirmación para Cambio de Estado -->
        <p-dialog
            [(visible)]="showConfirmToggleEstado"
            header="Confirmar Cambio de Estado"
            [modal]="true"
            [style]="{width: '400px'}"
            [draggable]="false"
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Cambiar Estado?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas
                        <strong>{{ permisoToToggle?.estado === 'A' ? 'desactivar' : 'activar' }}</strong>
                        el permiso de
                        <strong>"{{permisoToToggle?.nombre_usuario}}"</strong> para el rol
                        <strong>"{{permisoToToggle?.nombre_rol}}"</strong>?
                    </p>
                    <p class="text-sm text-blue-600 mt-2">
                        Estado actual: <strong>{{ getEstadoLabel(permisoToToggle?.estado || '') }}</strong>
                    </p>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                    pButton
                    type="button"
                    (click)="cancelToggleEstado()"
                    label="Cancelar"
                    class="p-button-text"
                ></button>
                <button
                    pButton
                    type="button"
                    (click)="confirmToggleEstado()"
                    [label]="permisoToToggle?.estado === 'A' ? 'Desactivar' : 'Activar'"
                    [class]="permisoToToggle?.estado === 'A' ? 'p-button-danger' : 'p-button-success'"
                ></button>
            </div>
        </p-dialog>

        <p-toast></p-toast>
    `
})
export class PermisosTabComponent implements OnInit {
    @Input() permisos: RolUsuario[] = [];
    @Input() usuarios: Usuario[] = [];
    @Input() roles: RolMock[] = [];
    @Output() permisosChange = new EventEmitter<RolUsuario[]>();
    @Output() refreshPermisos = new EventEmitter<void>();

    // Variables para formularios modales
    showPermisoModal = false;
    
    // Estados de modales de confirmación
    showConfirmDeletePermiso = false;
    showConfirmToggleEstado = false;
    permisoToDelete: RolUsuario | null = null;
    permisoToToggle: RolUsuario | null = null;
    
    permisoFormTitle = '';
    isEditingPermiso = false;
    editingPermisoId: number | null = null;

    // Formularios reactivos
    permisoForm!: FormGroup;

    // Variables para edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Variables para API
    loadingPermisos = false;

    // Opciones para select
    estadoOptions = [
        { label: 'Activo', value: 'A' },
        { label: 'Inactivo', value: 'I' }
    ];

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder,
        private rolUsuarioService: RolUsuarioService
    ) {}

    ngOnInit(): void {
        this.initializeForms();
    }

    // Inicializar formularios reactivos
    initializeForms(): void {
        this.permisoForm = this.fb.group({
            id_usu: ['', [Validators.required]],
            id_rol: ['', [Validators.required]],
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
    openPermisoForm(permiso?: RolUsuario): void {
        this.showPermisoModal = true;
        
        if (permiso) {
            this.permisoFormTitle = 'Editar Permiso';
            this.isEditingPermiso = true;
            this.editingPermisoId = permiso.id;
            
            this.permisoForm.patchValue({
                id_usu: permiso.id_usu,
                id_rol: permiso.id_rol,
                estado: permiso.estado
            });
        } else {
            this.permisoFormTitle = 'Nuevo Permiso';
            this.isEditingPermiso = false;
            this.editingPermisoId = null;
            this.permisoForm.reset();
            this.permisoForm.patchValue({ estado: 'A' });
        }
    }

    editarPermiso(permiso: RolUsuario): void {
        this.openPermisoForm(permiso);
    }

    closePermisoForm(): void {
        this.showPermisoModal = false;
        this.permisoForm.reset();
        this.isEditingPermiso = false;
        this.editingPermisoId = null;
    }

    // ========== CAMBIO DE ESTADO ==========

    toggleEstadoPermiso(permiso: RolUsuario): void {
        this.permisoToToggle = permiso;
        this.showConfirmToggleEstado = true;
    }

    confirmToggleEstado(): void {
        if (this.permisoToToggle) {
            const permisoActual = { ...this.permisoToToggle }; // Guardar referencia local
            const nuevoEstado = this.permisoToToggle.estado === 'A' ? 'I' : 'A';

            const updateData = {
                id: this.permisoToToggle.id,
                estado: nuevoEstado
            };

            this.rolUsuarioService.updateRelacionRolUsuarioAction(this.permisoToToggle.id, updateData).subscribe({
                next: (response) => {
                    if (response.statuscode === 200) {
                        // Actualizar localmente usando la referencia guardada
                        this.permisoToToggle!.estado = nuevoEstado;

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Estado actualizado',
                            detail: response.mensaje || `Permiso ${permisoActual.nombre_usuario} → ${permisoActual.nombre_rol} ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`
                        });

                        // Recargar datos para mantener consistencia
                        this.refreshPermisos.emit();

                        // Limpiar después de un pequeño delay para evitar conflictos
                        setTimeout(() => {
                            this.cancelToggleEstado();
                        }, 100);
                    } else {
                        console.error('❌ Error del backend cambiando estado:', response);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error al cambiar estado',
                            detail: response.mensaje || `Error del backend: ${response.statuscode}`
                        });
                        this.cancelToggleEstado();
                    }
                },
                error: (error) => {
                    console.error('❌ Error cambiando estado:', error);
                    let errorMessage = 'Error desconocido cambiando estado';

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
                        summary: 'Error al cambiar estado',
                        detail: errorMessage,
                        life: 5000
                    });

                    this.cancelToggleEstado();
                }
            });
        }
    }

    cancelToggleEstado(): void {
        this.showConfirmToggleEstado = false;
        this.permisoToToggle = null;
    }

    savePermiso(): void {
        if (this.permisoForm.valid) {
            const formData = this.permisoForm.value;
            
            if (this.isEditingPermiso && this.editingPermisoId) {
                this.updatePermiso(this.editingPermisoId, formData);
            } else {
                this.createPermiso(formData);
            }
        }
    }

    createPermiso(formData: any): void {
        const relacionData = {
            id_usu: formData.id_usu,
            id_rol: formData.id_rol,
            estado: formData.estado,
            usu_m: 'admin'
        };

        this.rolUsuarioService.insertRelacionRolUsuario(relacionData).subscribe({
            next: (response) => {
                if (response.statuscode === 200) {
                    // Respuesta exitosa del backend
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Permiso creado',
                        detail: response.mensaje || 'Permiso creado exitosamente'
                    });

                    // Recargar permisos para obtener los datos actualizados
                    this.cargarPermisos();
                    this.closePermisoForm();
                } else {
                    // Mostrar error del backend
                    console.error('❌ Error del backend creando permiso:', response);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al crear permiso',
                        detail: response.mensaje || `Error del backend: ${response.statuscode}`
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error creando permiso:', error);
                let errorMessage = 'Error desconocido creando permiso';

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
                    summary: 'Error al crear permiso',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    updatePermiso(permisoId: number, formData: any): void {
        const relacionData = {
            id_usu: formData.id_usu,
            id_rol: formData.id_rol,
            estado: formData.estado,
            usu_m: 'admin'
        };

        this.rolUsuarioService.updateRelacionRolUsuarioAction(permisoId, relacionData).subscribe({
            next: (response) => {
                if (response.statuscode === 200) {
                    // Respuesta exitosa del backend
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Permiso actualizado',
                        detail: response.mensaje || 'Permiso actualizado exitosamente'
                    });

                    // Recargar permisos para obtener los datos actualizados
                    this.cargarPermisos();
                    this.closePermisoForm();
                } else {
                    // Mostrar error del backend
                    console.error('❌ Error del backend actualizando permiso:', response);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al actualizar permiso',
                        detail: response.mensaje || `Error del backend: ${response.statuscode}`
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error actualizando permiso:', error);
                let errorMessage = 'Error desconocido actualizando permiso';

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
                    summary: 'Error al actualizar permiso',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    // Métodos de eliminación
    eliminarPermiso(permiso: RolUsuario): void {
        this.permisoToDelete = permiso;
        this.showConfirmDeletePermiso = true;
    }

    confirmDeletePermiso(): void {
        if (this.permisoToDelete) {
            const permisoActual = { ...this.permisoToDelete }; // Guardar referencia local

            this.rolUsuarioService.deleteRelacionRolUsuarioAction(this.permisoToDelete.id).subscribe({
                next: (response) => {
                    if (response.statuscode === 200) {
                        const index = this.permisos.findIndex(p => p.id === permisoActual.id);
                        if (index !== -1) {
                            this.permisos.splice(index, 1);
                            this.permisosChange.emit(this.permisos);
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Permiso eliminado',
                            detail: response.mensaje || `Permiso ${permisoActual.nombre_usuario} → ${permisoActual.nombre_rol} eliminado exitosamente`
                        });

                        // Limpiar después de un pequeño delay para evitar conflictos
                        setTimeout(() => {
                            this.cancelDeletePermiso();
                        }, 100);
                    } else {
                        console.error('❌ Error del backend eliminando permiso:', response);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error al eliminar permiso',
                            detail: response.mensaje || `Error del backend: ${response.statuscode}`
                        });
                        this.cancelDeletePermiso();
                    }
                },
                error: (error) => {
                    console.error('❌ Error eliminando permiso:', error);
                    let errorMessage = 'Error desconocido eliminando permiso';

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
                        summary: 'Error al eliminar permiso',
                        detail: errorMessage,
                        life: 5000
                    });

                    this.cancelDeletePermiso();
                }
            });
        }
    }

    cancelDeletePermiso(): void {
        this.showConfirmDeletePermiso = false;
        this.permisoToDelete = null;
    }

    // Métodos de edición inline
    startInlineEdit(permiso: RolUsuario, field: string): void {
        this.editingCell = `${field}_${permiso.id}`;
        this.originalValue = permiso[field as keyof RolUsuario];
    }

    saveInlineEdit(permiso: RolUsuario, field: string): void {
        const currentValue = permiso[field as keyof RolUsuario];

        if (currentValue === this.originalValue) {
            this.cancelInlineEditPermiso();
            return;
        }

        // Preparar datos de actualización según el campo editado
        let updateData: Partial<RolUsuario> = {};

        if (field === 'usuario') {
            // Buscar el ID del usuario seleccionado por nombre
            const usuario = this.usuarios.find(u => u.nombre === currentValue);
            if (usuario) {
                updateData.id_usu = usuario.id;
                updateData.nombre_usuario = usuario.nombre;
                updateData.email_usuario = usuario.email;
            }
        } else if (field === 'rol') {
            // Buscar el ID del rol seleccionado por nombre
            const rol = this.roles.find(r => r.nombre === currentValue);
            if (rol) {
                updateData.id_rol = rol.id_rol;
                updateData.nombre_rol = rol.nombre;
            }
        } else {
            // Para otros campos, enviar el valor directamente
            (updateData as any)[field] = currentValue;
        }

        updateData.usu_m = 'admin';

        this.rolUsuarioService.updateRelacionRolUsuarioAction(permiso.id, updateData).subscribe({
            next: (response) => {
                if (response.statuscode === 200) {
                    // Respuesta exitosa del backend
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Campo actualizado',
                        detail: response.mensaje || `${field} actualizado exitosamente`
                    });

                    // Recargar permisos para obtener los datos actualizados
                    this.cargarPermisos();

                    this.editingCell = null;
                    this.originalValue = null;
                }
            },
            error: (error) => {
                console.error('❌ Error actualizando campo inline:', error);

                // Revertir el cambio local
                (permiso as any)[field] = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;

                let errorMessage = 'Error desconocido al actualizar el campo';

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
                    summary: 'Error al actualizar',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    cancelInlineEditPermiso(): void {
        if (this.editingCell && this.originalValue !== null) {
            const [field, permisoId] = this.editingCell.split('_');
            const permiso = this.permisos.find(p => p.id.toString() === permisoId);
            if (permiso) {
                (permiso as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;
    }

    // Método para cargar permisos (emitir evento al componente padre)
    cargarPermisos(): void {
        this.refreshPermisos.emit();
    }
}
