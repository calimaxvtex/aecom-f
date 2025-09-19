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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Servicios y modelos del módulo proyectos
import { ProyService } from '@/features/proy/services/proy.service';
import { ProyItem, CreateProyRequest, UpdateProyRequest } from '@/features/proy/proy.interfaces';

@Component({
    selector: 'app-proy',
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
        ToggleSwitchModule,
        TooltipModule
    ],
    providers: [MessageService],
    template: `
        <div class="card">
            <p-toast></p-toast>

            <!-- Header -->
            <div class="mb-4">
                <h1 class="text-2xl font-bold mb-2">🏗️ Administración de Proyectos</h1>
                <p class="text-gray-600">Gestión de catálogos de proyectos del sistema</p>
            </div>

            <!-- Tabla de Proyectos -->
            <p-table
                #dtTable
                [value]="proyectos"
                [paginator]="true"
                [rows]="10"
                [showCurrentPageReport]="true"
                responsiveLayout="scroll"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proyectos"
                [rowsPerPageOptions]="[10, 25, 50]"
                [globalFilterFields]="['descripcion', 'usuario']"
                selectionMode="single"
                [(selection)]="proyectoSeleccionado"
                (onRowSelect)="onProyectoSelect($event)"
            >
                <ng-template #caption>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <input
                            pInputText
                            type="text"
                            (input)="onGlobalFilter(dtTable, $event)"
                            placeholder="Buscar proyectos..."
                            class="w-full sm:w-80"
                        />
                        <div class="flex gap-2">
                            <p-button
                                icon="pi pi-refresh"
                                (onClick)="cargarProyectos()"
                                [loading]="loadingProyectos"
                                styleClass="p-button-sm p-button-outlined"
                                pTooltip="Actualizar"
                            ></p-button>
                            <p-button
                                icon="pi pi-plus"
                                (onClick)="openProyectoForm()"
                                styleClass="p-button-sm p-button-outlined"
                                pTooltip="Agregar Proyecto"
                            ></p-button>
                        </div>
                    </div>
                </ng-template>

                <ng-template #header>
                    <tr>
                        <th pSortableColumn="id_proy" style="width: 80px">ID <p-sortIcon field="id_proy"></p-sortIcon></th>
                        <th pSortableColumn="descripcion" style="min-width: 200px">Nombre <p-sortIcon field="descripcion"></p-sortIcon></th>
                        <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                        <th style="width: 120px">Usuario</th>
                        <th style="width: 150px">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template #body let-proyecto>
                    <tr [class.bg-blue-50]="proyecto === proyectoSeleccionado">
                        <!-- ID - NO EDITABLE -->
                        <td>{{proyecto.id_proy}}</td>

                        <!-- Nombre (Descripción) - EDITABLE INLINE -->
                        <td>
                            <span
                                *ngIf="editingCell !== proyecto.id_proy + '_descripcion'"
                                (click)="editInlineProyecto(proyecto, 'descripcion'); $event.stopPropagation()"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{proyecto.descripcion}}
                            </span>
                            <input
                                *ngIf="editingCell === proyecto.id_proy + '_descripcion'"
                                pInputText
                                type="text"
                                [(ngModel)]="proyecto.descripcion"
                                (keyup.enter)="saveInlineEditProyecto(proyecto, 'descripcion')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                autofocus
                                placeholder="Nombre del proyecto"
                            />
                        </td>

                        <!-- Estado - TOGGLE BUTTON -->
                        <td>
                            <p-tag
                                [value]="getEstadoLabel(proyecto.estado)"
                                [severity]="getEstadoSeverity(proyecto.estado)"
                                (click)="toggleEstadoProyecto(proyecto); $event.stopPropagation()"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                            ></p-tag>
                        </td>

                        <!-- Usuario - SOLO LECTURA -->
                        <td>{{proyecto.usuario}}</td>

                        <!-- Acciones -->
                        <td>
                            <div class="flex gap-1">
                                <button
                                    pButton
                                    icon="pi pi-pencil"
                                    (click)="openProyectoForm(proyecto)"
                                    class="p-button-sm p-button-text p-button-warning"
                                    pTooltip="Editar Proyecto"
                                    tooltipPosition="top"
                                    tooltipStyleClass="tooltip-theme"
                                ></button>
                                <button
                                    pButton
                                    icon="pi pi-trash"
                                    (click)="eliminarProyecto(proyecto)"
                                    class="p-button-sm p-button-text p-button-danger"
                                    pTooltip="Eliminar Proyecto"
                                    tooltipPosition="top"
                                    tooltipStyleClass="tooltip-theme"
                                ></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Modal Formulario Proyecto -->
            <p-dialog
                [(visible)]="showProyectoModal"
                [header]="isEditingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'"
                [modal]="true"
                [style]="{width: '500px'}"
                [draggable]="false"
                [resizable]="false"
                [closable]="true"
            >
                <form [formGroup]="proyectoForm" (ngSubmit)="saveProyecto()">
                    <div class="space-y-4">
                        <!-- Nombre (Descripción) -->
                        <div>
                            <label class="block text-sm font-medium mb-1">Nombre *</label>
                            <input
                                pInputText
                                formControlName="descripcion"
                                placeholder="Nombre del proyecto"
                                class="w-full"
                            />
                            <small *ngIf="proyectoForm.get('descripcion')?.invalid && proyectoForm.get('descripcion')?.touched"
                                   class="text-red-500">
                                El nombre es obligatorio
                            </small>
                        </div>

                        <!-- Estado -->
                        <div>
                            <label class="block text-sm font-medium mb-2">Estado</label>
                            <p-tag
                                [value]="proyectoForm.get('estado')?.value === 'A' ? 'Activo' : 'Inactivo'"
                                [severity]="proyectoForm.get('estado')?.value === 'A' ? 'success' : 'danger'"
                                (click)="proyectoForm.patchValue({estado: proyectoForm.get('estado')?.value === 'A' ? 'I' : 'A'})"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                            ></p-tag>
                        </div>

                        <!-- Usuario y Fecha en el mismo renglón - SOLO LECTURA -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Usuario</label>
                                <span class="text-sm text-gray-700">{{proyectoForm.get('usuario')?.value || 'Sin usuario'}}</span>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Fecha</label>
                                <span class="text-sm text-gray-700">{{proyectoForm.get('fecha')?.value ? (proyectoForm.get('fecha')?.value | date:'shortDate') : 'Sin fecha'}}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                            pButton
                            type="button"
                            (click)="closeProyectoForm()"
                            label="Cancelar"
                            class="p-button-text"
                        ></button>
                        <button
                            pButton
                            type="submit"
                            [label]="isEditingProyecto ? 'Actualizar' : 'Crear'"
                            [disabled]="!proyectoForm.valid || savingProyecto"
                            [loading]="savingProyecto"
                            class="p-button-success"
                            raised
                        ></button>
                    </div>
                </form>
            </p-dialog>

            <!-- Modal de Confirmación -->
            <p-dialog
                header="Confirmar Eliminación"
                [(visible)]="showConfirmDialog"
                [modal]="true"
                [style]="{width: '450px'}"
                [closable]="true"
                (onHide)="cancelarConfirmacion()"
            >
                <div class="flex align-items-center gap-3 mb-3">
                    <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                    <span class="text-lg">¿Está seguro de que desea eliminar el proyecto "{{proyectoToDelete?.descripcion}}"?</span>
                </div>

                <div class="flex justify-content-end gap-2 mt-4">
                    <p-button
                        label="Cancelar"
                        icon="pi pi-times"
                        severity="secondary"
                        (onClick)="cancelarConfirmacion()"
                    ></p-button>
                    <p-button
                        label="Sí, Eliminar"
                        icon="pi pi-check"
                        severity="danger"
                        (onClick)="confirmarEliminacion()"
                    ></p-button>
                </div>
            </p-dialog>
        </div>
    `,
    styles: [`
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

        /* Ajustes adicionales para botones de acción */
        .p-button.p-button-text.p-button-sm:hover {
            background-color: rgba(0, 0, 0, 0.04) !important;
        }

        .p-button.p-button-text.p-button-warning:hover {
            background-color: rgba(255, 193, 7, 0.12) !important;
        }

        .p-button.p-button-text.p-button-danger:hover {
            background-color: rgba(220, 53, 69, 0.12) !important;
        }

        .bg-blue-50 {
            background-color: #eff6ff !important;
        }

        /* Tema personalizado para tooltips */
        :host ::ng-deep .tooltip-theme {
            background-color: #374151 !important;
            color: #ffffff !important;
            border-radius: 6px !important;
            font-size: 0.875rem !important;
            font-weight: 500 !important;
            padding: 0.5rem 0.75rem !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }

        :host ::ng-deep .tooltip-theme .p-tooltip-arrow {
            border-top-color: #374151 !important;
        }
    `]
})
export class ProyComponent implements OnInit {
    // Datos
    proyectos: ProyItem[] = [];
    proyectoSeleccionado: ProyItem | null = null;

    // Estados de carga
    loadingProyectos = false;
    savingProyecto = false;

    // Estados de modales
    showProyectoModal = false;
    showConfirmDialog = false;

    // Estados del formulario
    proyectoForm!: FormGroup;
    isEditingProyecto = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Confirmación
    proyectoToDelete: ProyItem | null = null;

    constructor(
        private fb: FormBuilder,
        private proyService: ProyService,
        private messageService: MessageService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        console.log('🚀 ProyComponent inicializado');
        this.cargarProyectos();
    }

    // ========== MÉTODOS DE INICIALIZACIÓN ==========

    private initializeForm(): void {
        this.proyectoForm = this.fb.group({
            descripcion: ['', [Validators.required]],
            estado: ['A'],
            usuario: ['SYSTEM'], // Usuario por defecto
            fecha: [this.getCurrentDate()]
        });
    }

    private getCurrentDate(): string {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // ========== MÉTODOS DE DATOS ==========

    cargarProyectos(): void {
        this.loadingProyectos = true;

        this.proyService.getAllProyectos().subscribe({
            next: (response) => {
                console.log('✅ Proyectos cargados:', response);
                if (response && response.data) {
                    this.proyectos = response.data;
                    console.log('📊 Proyectos procesados:', this.proyectos.length, 'registros');
                } else {
                    this.proyectos = [];
                }
                this.loadingProyectos = false;
            },
            error: (error) => {
                console.error('❌ Error al cargar proyectos:', error);
                this.loadingProyectos = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los proyectos',
                    life: 5000
                });
            }
        });
    }

    // ========== MÉTODOS DE UI ==========

    onGlobalFilter(table: any, event: any): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onProyectoSelect(event: any): void {
        console.log('📋 Proyecto seleccionado:', event.data);
        this.proyectoSeleccionado = event.data;
    }

    // ========== FORMULARIO ==========

    openProyectoForm(proyecto?: ProyItem): void {
        this.isEditingProyecto = !!proyecto;

        if (proyecto) {
            console.log('✏️ Editando proyecto:', proyecto);
            this.proyectoForm.patchValue({
                descripcion: proyecto.descripcion,
                estado: proyecto.estado,
                usuario: proyecto.usuario,
                fecha: proyecto.fecha
            });
            this.proyectoSeleccionado = proyecto;
        } else {
            console.log('➕ Creando nuevo proyecto');
            this.proyectoForm.reset({
                descripcion: '',
                estado: 'A',
                usuario: 'SYSTEM', // Usuario por defecto para nuevos proyectos
                fecha: this.getCurrentDate()
            });
            this.proyectoSeleccionado = null;
        }

        this.showProyectoModal = true;
    }

    closeProyectoForm(): void {
        this.showProyectoModal = false;
        this.proyectoForm.reset();
        this.isEditingProyecto = false;
        this.proyectoSeleccionado = null;
    }

    saveProyecto(): void {
        if (this.proyectoForm.valid) {
            this.savingProyecto = true;
            const formData = this.proyectoForm.value;

            // Procesar datos del formulario
            const processedData = {
                ...formData
            };

            if (this.isEditingProyecto && this.proyectoSeleccionado) {
                // Actualizar - No modificar usuario y fecha (son de solo lectura)
                const payload: UpdateProyRequest = {
                    action: 'UP',
                    id_proy: this.proyectoSeleccionado.id_proy,
                    descripcion: processedData.descripcion,
                    estado: processedData.estado,
                    usr: this.proyectoSeleccionado.usuario || 'SYSTEM', // Usar valor original
                    id_session: 0
                };

                this.proyService.updateProyecto(payload).subscribe({
                    next: (response) => {
                        console.log('✅ Proyecto actualizado:', response);
                        this.handleSaveSuccess('Proyecto actualizado correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'actualizar')
                });
            } else {
                // Crear
                const payload: CreateProyRequest = {
                    action: 'IN',
                    descripcion: processedData.descripcion,
                    estado: processedData.estado,
                    usr: processedData.usuario || 'SYSTEM',
                    id_session: 0
                };

                this.proyService.createProyecto(payload).subscribe({
                    next: (response) => {
                        console.log('✅ Proyecto creado:', response);
                        this.handleSaveSuccess('Proyecto creado correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'crear')
                });
            }
        }
    }

    private handleSaveSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: message
        });

        this.closeProyectoForm();
        this.cargarProyectos();
        this.savingProyecto = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} proyecto:`, error);

        let errorMessage = `Error al ${operation} el proyecto`;
        if (error.error?.mensaje) {
            errorMessage = error.error.mensaje;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });

        this.savingProyecto = false;
    }

    // ========== EDICIÓN INLINE ==========

    editInlineProyecto(proyecto: ProyItem, field: string): void {
        this.editingCell = proyecto.id_proy + '_' + field;
        this.originalValue = (proyecto as any)[field];
    }

    saveInlineEditProyecto(proyecto: ProyItem, field: string): void {
        if ((proyecto as any)[field] === this.originalValue) {
            this.cancelInlineEdit();
            return;
        }

        const payload: UpdateProyRequest = {
            action: 'UP',
            id_proy: proyecto.id_proy,
            [field]: (proyecto as any)[field],
            usr: proyecto.usuario,
            id_session: 0
        };

        this.proyService.updateProyecto(payload).subscribe({
            next: (response) => {
                console.log('✅ Campo actualizado:', response);
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
                (proyecto as any)[field] = this.originalValue;
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

    cancelInlineEdit(): void {
        this.editingCell = null;
        this.originalValue = null;
    }

    private getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            descripcion: 'Nombre'
        };
        return labels[field] || field;
    }

    // ========== TOGGLE ESTADO ==========

    toggleEstadoProyecto(proyecto: ProyItem): void {
        const nuevoEstado = proyecto.estado === 'A' ? 'I' : 'A';

        if (nuevoEstado === 'I') {
            this.confirmMessage = `¿Está seguro de que desea desactivar el proyecto "${proyecto.descripcion}"?`;
            this.confirmHeader = 'Confirmar Desactivación';
            this.accionConfirmada = () => this.procesarCambioEstado(proyecto, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            this.procesarCambioEstado(proyecto, nuevoEstado);
        }
    }

    private procesarCambioEstado(proyecto: ProyItem, nuevoEstado: 'A' | 'I'): void {
        const estadoAnterior = proyecto.estado;
        proyecto.estado = nuevoEstado;

        const payload: UpdateProyRequest = {
            action: 'UP',
            id_proy: proyecto.id_proy,
            estado: nuevoEstado,
            usr: proyecto.usuario,
            id_session: 0
        };

        this.proyService.updateProyecto(payload).subscribe({
            next: (response) => {
                console.log('✅ Estado actualizado:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado Actualizado',
                    detail: `Proyecto ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local
                proyecto.estado = estadoAnterior;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado del proyecto',
                    life: 5000
                });
            }
        });
    }

    // ========== ELIMINACIÓN ==========

    eliminarProyecto(proyecto: ProyItem): void {
        this.proyectoToDelete = proyecto;
        this.showConfirmDialog = true;
    }

    confirmarEliminacion(): void {
        if (this.proyectoToDelete) {
            this.proyService.deleteProyecto(this.proyectoToDelete.id_proy).subscribe({
                next: (response) => {
                    console.log('✅ Proyecto eliminado:', response);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Proyecto eliminado correctamente'
                    });

                    this.cargarProyectos();
                    this.cancelarConfirmacion();
                },
                error: (error) => {
                    console.error('❌ Error al eliminar proyecto:', error);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al eliminar el proyecto',
                        life: 5000
                    });
                }
            });
        }
    }

    cancelarConfirmacion(): void {
        this.showConfirmDialog = false;
        this.proyectoToDelete = null;
    }

    // ========== UTILIDADES ==========

    getEstadoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: string): 'success' | 'danger' {
        return estado === 'A' ? 'success' : 'danger';
    }

    // Variables para confirmación
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;
}