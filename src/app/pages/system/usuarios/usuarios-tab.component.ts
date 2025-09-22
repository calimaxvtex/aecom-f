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
import { UsuarioService } from '../../../features/usuarios/services/usuario.service';
import { Usuario } from '../../../features/usuarios/models/usuario.interface';

@Component({
    selector: 'app-usuarios-tab',
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
            <h1 class="text-2xl font-bold mb-2">👥 Gestión de Usuarios</h1>
            <p class="text-gray-600 mb-4">Administra los usuarios del sistema</p>
        </div>

        <p-table
            #dtUsuarios
            [value]="usuarios"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            responsiveLayout="scroll"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['nombre', 'email', 'usuario']"
        >
            <ng-template #caption>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <input 
                        pInputText
                        type="text" 
                        (input)="onGlobalFilter(dtUsuarios, $event)" 
                        placeholder="Buscar usuarios..." 
                        class="w-full sm:w-80 order-1 sm:order-0"
                    />
                    <div class="flex gap-2 ml-auto">
                        <button 
                            (click)="cargarUsuarios()" 
                            pButton 
                            raised 
                            class="w-auto" 
                            icon="pi pi-refresh"
                            [loading]="loadingUsuarios"
                        ></button>
                        <button 
                            (click)="openUsuarioForm()" 
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
                    <th style="width: 80px;">Usuario</th>
                    <th style="width: 200px;">Nombre</th>
                    <th style="width: 250px;">Email</th>
                    <th style="width: 100px;">Estado</th>
                    <th style="width: 80px;">Logins</th>
                    <th style="width: 80px;">Intentos</th>
                    <th style="width: 120px;">Último Login</th>
                    <th style="width: 120px;">Último Intento</th>
                    <th style="width: 100px;">Acciones</th>
                </tr>
            </ng-template>

            <ng-template #body let-usuario let-rowIndex="rowIndex">
                <tr>
                    <!-- Usuario (editable inline) -->
                    <td>
                        <div *ngIf="editingCell !== 'usuario_' + usuario.id; else editUsuario">
                            <span 
                                (click)="startInlineEdit(usuario, 'usuario')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                pTooltip="Click para editar"
                            >
                                {{usuario.usuario}}
                            </span>
                        </div>
                        <ng-template #editUsuario>
                            <div class="inline-edit-container">
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="usuario.usuario"
                                    (keyup.enter)="saveInlineEdit(usuario, 'usuario')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                    placeholder="Código usuario"
                                />
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEdit(usuario, 'usuario')"
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
                        </ng-template>
                    </td>

                    <!-- Nombre (editable inline) -->
                    <td>
                        <div *ngIf="editingCell !== 'nombre_' + usuario.id; else editNombre">
                            <span 
                                (click)="startInlineEdit(usuario, 'nombre')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                pTooltip="Click para editar"
                            >
                                {{usuario.nombre}}
                            </span>
                        </div>
                        <ng-template #editNombre>
                            <div class="inline-edit-container">
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="usuario.nombre"
                                    (keyup.enter)="saveInlineEdit(usuario, 'nombre')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                    placeholder="Nombre completo"
                                />
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEdit(usuario, 'nombre')"
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
                        </ng-template>
                    </td>

                    <!-- Email (editable inline) -->
                    <td>
                        <div *ngIf="editingCell !== 'email_' + usuario.id; else editEmail">
                            <span 
                                (click)="startInlineEdit(usuario, 'email')"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                pTooltip="Click para editar"
                            >
                                {{usuario.email}}
                            </span>
                        </div>
                        <ng-template #editEmail>
                            <div class="inline-edit-container">
                                <input
                                    pInputText
                                    type="email"
                                    [(ngModel)]="usuario.email"
                                    (keyup.enter)="saveInlineEdit(usuario, 'email')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                    placeholder="correo@ejemplo.com"
                                />
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEdit(usuario, 'email')"
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
                        </ng-template>
                    </td>

                    <!-- Estado (toggle) -->
                    <td>
                        <p-tag 
                            [value]="getEstadoLabel(usuario.estado)" 
                            [severity]="getEstadoSeverity(usuario.estado)"
                            (click)="toggleEstadoUsuario(usuario)"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            pTooltip="Click para cambiar estado"
                        ></p-tag>
                    </td>

                    <!-- Logins -->
                    <td>{{usuario.logins}}</td>

                    <!-- Intentos -->
                    <td>{{usuario.intentos}}</td>

                    <!-- Último Login -->
                    <td>
                        <span *ngIf="usuario.fecha_login; else noLogin">
                            {{usuario.fecha_login | date:'short'}}
                        </span>
                        <ng-template #noLogin>
                            <span class="text-gray-400">Nunca</span>
                        </ng-template>
                    </td>

                    <!-- Último Intento -->
                    <td>
                        <span *ngIf="usuario.fecha_intento; else noIntento">
                            {{usuario.fecha_intento | date:'short'}}
                        </span>
                        <ng-template #noIntento>
                            <span class="text-gray-400">Nunca</span>
                        </ng-template>
                    </td>

                    <!-- Acciones -->
                    <td>
                        <div class="flex gap-1">
                            <button 
                                (click)="verUsuario(usuario)" 
                                pButton 
                                class="p-button-sm p-button-text p-button-info" 
                                icon="pi pi-eye"
                                pTooltip="Ver detalles"
                            ></button>
                            <button 
                                (click)="editarUsuario(usuario)" 
                                pButton 
                                class="p-button-sm p-button-text p-button-warning" 
                                icon="pi pi-pencil"
                                pTooltip="Editar"
                            ></button>
                            <button 
                                (click)="eliminarUsuario(usuario)" 
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

        <!-- Modal de Usuario -->
        <p-dialog 
            [(visible)]="showUsuarioModal" 
            [header]="usuarioFormTitle"
            [modal]="true" 
            [style]="{width: '500px'}"
            [draggable]="false" 
            [resizable]="false"
            (onHide)="closeUsuarioForm()"
        >
            <form [formGroup]="usuarioForm" (ngSubmit)="saveUsuario()">
                <div class="grid grid-cols-1 gap-4">
                    <div>
                        <label for="usuario" class="block text-sm font-medium mb-2">Usuario *</label>
                        <input 
                            id="usuario"
                            formControlName="usuario"
                            pInputText 
                            class="w-full"
                            placeholder="Número de usuario"
                        />
                        <small 
                            *ngIf="usuarioForm.get('usuario')?.invalid && usuarioForm.get('usuario')?.touched" 
                            class="text-red-500"
                        >
                            Usuario es requerido y debe ser numérico
                        </small>
                    </div>

                    <div>
                        <label for="nombre" class="block text-sm font-medium mb-2">Nombre *</label>
                        <input 
                            id="nombre"
                            formControlName="nombre"
                            pInputText 
                            class="w-full"
                            placeholder="Nombre completo"
                        />
                        <small 
                            *ngIf="usuarioForm.get('nombre')?.invalid && usuarioForm.get('nombre')?.touched" 
                            class="text-red-500"
                        >
                            Nombre es requerido y solo debe contener letras
                        </small>
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium mb-2">Email *</label>
                        <input 
                            id="email"
                            formControlName="email"
                            pInputText 
                            class="w-full"
                            placeholder="usuario@calimax.com.mx"
                        />
                        <small 
                            *ngIf="usuarioForm.get('email')?.invalid && usuarioForm.get('email')?.touched" 
                            class="text-red-500"
                        >
                            <span *ngIf="usuarioForm.get('email')?.errors?.['required']">Email es requerido</span>
                            <span *ngIf="usuarioForm.get('email')?.errors?.['calimaxEmail']">Debe ser un email @calimax.com.mx</span>
                        </small>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium mb-2">
                            Contraseña
                            <span *ngIf="!isEditingUsuario" class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <input
                                id="password"
                                formControlName="password"
                                [type]="showPassword ? 'text' : 'password'"
                                pInputText
                                class="w-full pr-10"
                                [placeholder]="isEditingUsuario ? 'Dejar vacío para mantener contraseña actual' : 'Mínimo 6 caracteres'"
                            />
                            <button
                                type="button"
                                class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                                (click)="togglePasswordVisibility()"
                                pTooltip="Mostrar/Ocultar contraseña"
                            >
                                <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                            </button>
                        </div>
                        <small
                            *ngIf="usuarioForm.get('password')?.invalid && usuarioForm.get('password')?.touched"
                            class="text-red-500"
                        >
                            <span *ngIf="usuarioForm.get('password')?.errors?.['required']">Contraseña es requerida</span>
                            <span *ngIf="usuarioForm.get('password')?.errors?.['minlength']">Mínimo 6 caracteres</span>
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
                        (click)="closeUsuarioForm()"
                    ></button>
                    <button
                        type="submit"
                        pButton
                        [label]="isEditingUsuario ? 'Actualizar' : 'Crear'"
                        class="p-button-primary"
                        [disabled]="!isFormValidAndChanged()"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de Confirmación para Usuario -->
        <p-dialog 
            [(visible)]="showConfirmDeleteUsuario" 
            header="Confirmar Eliminación"
            [modal]="true" 
            [style]="{width: '400px'}"
            [draggable]="false" 
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Eliminar Usuario?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas eliminar al usuario 
                        <strong>"{{usuarioToDelete?.nombre}}"</strong>?
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
                    (click)="cancelDeleteUsuario()" 
                    label="Cancelar" 
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    type="button" 
                    (click)="confirmDeleteUsuario()" 
                    label="Eliminar" 
                    class="p-button-danger"
                ></button>
            </div>
        </p-dialog>
    `
})
export class UsuariosTabComponent implements OnInit {
    @Input() usuarios: Usuario[] = [];
    @Output() usuariosChange = new EventEmitter<Usuario[]>();
    @Output() refreshUsuarios = new EventEmitter<void>();

    // Variables para formularios modales
    showUsuarioModal = false;
    showPassword = false;

    // Estados de modales de confirmación
    showConfirmDeleteUsuario = false;
    usuarioToDelete: Usuario | null = null;

    usuarioFormTitle = '';
    isEditingUsuario = false;
    editingUsuarioId: number | null = null;
    originalFormData: any = null; // Para rastrear cambios

    // Formularios reactivos
    usuarioForm!: FormGroup;

    // Variables para edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Variables para API
    loadingUsuarios = false;

    // Opciones para select
    estadoOptions = [
        { label: 'Activo', value: 1 },
        { label: 'Inactivo', value: 0 }
    ];

    constructor(
        private messageService: MessageService,
        private fb: FormBuilder,
        private usuarioService: UsuarioService
    ) {}

    ngOnInit(): void {
        this.initializeForms();
    }

    // Inicializar formularios reactivos
    initializeForms(): void {
        this.usuarioForm = this.fb.group({
            usuario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
            nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
            email: ['', [Validators.required, this.calimaxEmailValidator]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            estado: [1, [Validators.required]]
        });
    }

    // Validador personalizado para email @calimax.com.mx
    calimaxEmailValidator(control: any) {
        const email = control.value;
        if (!email) return null;
        
        const validEmailPattern = /^[a-zA-Z0-9._%+-]+@calimax\.com\.mx$/;
        if (validEmailPattern.test(email)) {
            return null;
        } else {
            return { calimaxEmail: true };
        }
    }

    // Métodos de filtrado y búsqueda
    onGlobalFilter(table: Table, event: Event): void {
        const target = event.target as HTMLInputElement;
        table.filterGlobal(target.value, 'contains');
    }

    // Métodos de estado
    getEstadoLabel(estado: number): string {
        switch (estado) {
            case 1: return 'Activo';
            case 0: return 'Inactivo';
            default: return 'Desconocido';
        }
    }

    getEstadoSeverity(estado: number): string {
        switch (estado) {
            case 1: return 'success';
            case 0: return 'danger';
            default: return 'info';
        }
    }

    // Métodos de formulario modal
    openUsuarioForm(usuario?: Usuario): void {
        this.showUsuarioModal = true;

        if (usuario) {
            this.usuarioFormTitle = 'Editar Usuario';
            this.isEditingUsuario = true;
            this.editingUsuarioId = usuario.id || null;

            // En edición, quitar la validación requerida del password
            this.usuarioForm.get('password')?.clearValidators();
            this.usuarioForm.get('password')?.setValidators([Validators.minLength(6)]);
            this.usuarioForm.get('password')?.updateValueAndValidity();

            this.usuarioForm.patchValue({
                usuario: usuario.usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                password: '', // No mostrar contraseña actual
                estado: usuario.estado
            });

            // Guardar datos originales para comparar cambios
            this.originalFormData = {
                usuario: usuario.usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                password: '',
                estado: usuario.estado
            };
        } else {
            this.usuarioFormTitle = 'Nuevo Usuario';
            this.isEditingUsuario = false;
            this.editingUsuarioId = null;

            // En creación, el password es requerido
            this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.usuarioForm.get('password')?.updateValueAndValidity();

            this.usuarioForm.reset();
            this.usuarioForm.patchValue({ estado: 1 });

            // Guardar datos originales para comparar cambios
            this.originalFormData = {
                usuario: '',
                nombre: '',
                email: '',
                password: '',
                estado: 1
            };
        }
    }

    verUsuario(usuario: Usuario): void {
        this.openUsuarioForm(usuario);
        // Deshabilitar campos para solo lectura
        this.usuarioForm.disable();
    }

    editarUsuario(usuario: Usuario): void {
        this.openUsuarioForm(usuario);
    }

    closeUsuarioForm(): void {
        this.showUsuarioModal = false;
        this.usuarioForm.reset();
        this.isEditingUsuario = false;
        this.editingUsuarioId = null;
        this.showPassword = false;
        this.originalFormData = null;
    }

    // Verificar si el formulario tiene cambios y es válido para habilitar el botón
    isFormValidAndChanged(): boolean {
        if (!this.originalFormData) return false;

        const currentData = this.usuarioForm.value;
        const hasChanged = JSON.stringify(currentData) !== JSON.stringify(this.originalFormData);

        // Para edición: verificar campos requeridos y que haya cambios
        if (this.isEditingUsuario) {
            return hasChanged && !!this.usuarioForm.get('usuario')?.valid &&
                   !!this.usuarioForm.get('nombre')?.valid &&
                   !!this.usuarioForm.get('email')?.valid &&
                   !!this.usuarioForm.get('estado')?.valid &&
                   (this.usuarioForm.get('password')?.value === '' ||
                    !!this.usuarioForm.get('password')?.valid);
        }

        // Para creación: verificar que todos los campos requeridos sean válidos
        return this.usuarioForm.valid;
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleEstadoUsuario(usuario: Usuario): void {
        const newValue = usuario.estado === 1 ? 0 : 1;
        usuario.estado = newValue;
        
        // Aquí se podría llamar a la API para actualizar
        this.messageService.add({
            severity: 'success',
            summary: 'Estado actualizado',
            detail: `Usuario ${usuario.nombre} ahora está ${newValue === 1 ? 'activo' : 'inactivo'}`
        });
    }

    saveUsuario(): void {
        if (this.usuarioForm.valid) {
            const formData = this.usuarioForm.value;
            
            if (this.isEditingUsuario && this.editingUsuarioId) {
                // Actualizar usuario existente
                this.updateUsuario(this.editingUsuarioId, formData);
            } else {
                // Crear nuevo usuario
                this.createUsuario(formData);
            }
        }
    }

    createUsuario(formData: any): void {
        const usuarioData = {
            usuario: formData.usuario,
            nombre: formData.nombre,
            email: formData.email,
            estado: formData.estado
        };

        this.usuarioService.insertUsuario(usuarioData).subscribe({
            next: (response) => {
                if (response.statuscode === 200 && response.data && response.data.length > 0) {
                    const newUsuario = response.data[0];
                    this.usuarios.push(newUsuario);
                    this.usuariosChange.emit(this.usuarios);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Usuario creado',
                        detail: `Usuario ${newUsuario.nombre} creado exitosamente`
                    });

                    this.closeUsuarioForm();
                } else {
                    // Mostrar error del backend
                    console.error('❌ Error del backend creando usuario:', response);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al crear usuario',
                        detail: response.mensaje || `Error del backend: ${response.statuscode}`
                    });
                }
            },
            error: (error) => {
                // Error de red o cliente
                console.error('❌ Error de conexión creando usuario:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de conexión',
                    detail: 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
                });
            }
        });
    }

    updateUsuario(userId: number, formData: any): void {
        const usuarioData: any = {
            usuario: formData.usuario,
            nombre: formData.nombre,
            email: formData.email,
            estado: formData.estado
        };

        // Solo incluir password si se ha modificado (no está vacío)
        if (formData.password && formData.password.trim() !== '') {
            usuarioData.password = formData.password;
        }

        this.usuarioService.updateUsuarioAction(userId, usuarioData).subscribe({
            next: (response) => {
                if (response.statuscode === 200 && response.data && response.data.length > 0) {
                    const updatedUsuario = response.data[0];
                    const index = this.usuarios.findIndex(u => u.id === userId);
                    if (index !== -1) {
                        this.usuarios[index] = updatedUsuario;
                        this.usuariosChange.emit(this.usuarios);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Usuario actualizado',
                        detail: `Usuario ${updatedUsuario.nombre} actualizado exitosamente`
                    });

                    this.closeUsuarioForm();
                } else {
                    // Mostrar error del backend
                    console.error('❌ Error del backend actualizando usuario:', response);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al actualizar usuario',
                        detail: response.mensaje || `Error del backend: ${response.statuscode}`
                    });
                }
            },
            error: (error) => {
                // Error de red o cliente
                console.error('❌ Error de conexión actualizando usuario:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de conexión',
                    detail: 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
                });
            }
        });
    }

    // Métodos de eliminación
    eliminarUsuario(usuario: Usuario): void {
        this.usuarioToDelete = usuario;
        this.showConfirmDeleteUsuario = true;
    }

    confirmDeleteUsuario(): void {
        if (this.usuarioToDelete) {
            this.usuarioService.deleteUsuarioAction(this.usuarioToDelete.id!).subscribe({
                next: (response) => {
                    if (response.statuscode === 200) {
                        const index = this.usuarios.findIndex(u => u.id === this.usuarioToDelete!.id);
                        if (index !== -1) {
                            this.usuarios.splice(index, 1);
                            this.usuariosChange.emit(this.usuarios);
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usuario eliminado',
                            detail: `Usuario ${this.usuarioToDelete?.nombre} eliminado exitosamente`
                        });
                    } else {
                        // Mostrar error del backend
                        console.error('❌ Error del backend eliminando usuario:', response);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error al eliminar usuario',
                            detail: response.mensaje || `Error del backend: ${response.statuscode}`
                        });
                    }
                },
                error: (error) => {
                    // Error de red o cliente
                    console.error('❌ Error de conexión eliminando usuario:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de conexión',
                        detail: 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
                    });
                }
            });
        }

        this.cancelDeleteUsuario();
    }

    cancelDeleteUsuario(): void {
        this.showConfirmDeleteUsuario = false;
        this.usuarioToDelete = null;
    }

    // Métodos de edición inline
    startInlineEdit(usuario: Usuario, field: string): void {
        this.editingCell = `${field}_${usuario.id}`;
        this.originalValue = usuario[field as keyof Usuario];
    }

    saveInlineEdit(usuario: Usuario, field: string): void {
        const currentValue = usuario[field as keyof Usuario];
        
        // Aquí se podría llamar a la API para actualizar
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
            const [field, userId] = this.editingCell.split('_');
            const usuario = this.usuarios.find(u => u.id?.toString() === userId);
            if (usuario) {
                (usuario as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;
    }

    // Método para cargar usuarios (emitir evento al componente padre)
    cargarUsuarios(): void {
        this.refreshUsuarios.emit();
    }
}
