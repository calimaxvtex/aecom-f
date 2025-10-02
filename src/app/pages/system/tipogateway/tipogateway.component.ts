import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Servicios y modelos del módulo tipo gateway
import { TipoGatewayService } from '@/features/tipogateway/services/tipogateway.service';
import { 
    TipoGatewayItem, 
    TipoGatewayFormItem 
} from '@/features/tipogateway/models/tipogateway.interface';

@Component({
    selector: 'app-tipogateway',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
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
                <h1 class="text-2xl font-bold mb-2">💳 Administración de Tipos de Gateway</h1>
                <p class="text-gray-600">Gestión de catálogo de gateways de pagos del sistema</p>
            </div>

            <!-- Tabla de Tipos de Gateway -->
            <p-table
                #dtTable
                [value]="tiposGateway"
                [paginator]="true"
                [rows]="10"
                [showCurrentPageReport]="true"
                responsiveLayout="scroll"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos de gateway"
                [rowsPerPageOptions]="[10, 25, 50]"
                [globalFilterFields]="['nombre', 'clave', 'estado']"
                selectionMode="single"
                [(selection)]="tipoGatewaySeleccionado"
                (onRowSelect)="onTipoGatewaySelect($event)"
            >
                <ng-template #caption>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <input
                            pInputText
                            type="text"
                            (input)="onGlobalFilter(dtTable, $event)"
                            placeholder="Buscar tipos de gateway..."
                            class="w-full sm:w-80"
                        />
                        <div class="flex gap-2">
                            <p-button
                                icon="pi pi-refresh"
                                (onClick)="cargarTiposGateway()"
                                [loading]="loadingTiposGateway"
                                styleClass="p-button-sm p-button-outlined"
                                pTooltip="Actualizar"
                            ></p-button>
                            <p-button
                                icon="pi pi-plus"
                                (onClick)="openTipoGatewayForm()"
                                severity="primary"
                                raised
                                styleClass="p-button-sm"
                                pTooltip="Agregar Tipo de Gateway"
                            ></p-button>
                        </div>
                    </div>
                </ng-template>

                <ng-template #header>
                    <tr>
                        <th pSortableColumn="id" style="width: 80px">ID <p-sortIcon field="id"></p-sortIcon></th>
                        <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                        <th pSortableColumn="clave" style="width: 120px">Clave <p-sortIcon field="clave"></p-sortIcon></th>
                        <th pSortableColumn="tipo_deposito" style="width: 140px">Tipo Depósito <p-sortIcon field="tipo_deposito"></p-sortIcon></th>
                        <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                        <th pSortableColumn="swActivo" style="width: 100px">Activo <p-sortIcon field="swActivo"></p-sortIcon></th>
                        <th style="width: 150px">Fecha Mov.</th>
                        <th style="width: 150px">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template #body let-tipoGateway>
                    <tr [class.bg-blue-50]="tipoGateway === tipoGatewaySeleccionado">
                        <!-- ID - NO EDITABLE -->
                        <td>{{tipoGateway.id}}</td>

                        <!-- Nombre - EDITABLE INLINE -->
                        <td>
                            <span
                                *ngIf="editingCell !== tipoGateway.id + '_nombre'"
                                (click)="editInlineTipoGateway(tipoGateway, 'nombre'); $event.stopPropagation()"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{tipoGateway.nombre}}
                            </span>
                            <div
                                *ngIf="editingCell === tipoGateway.id + '_nombre'"
                                class="inline-edit-container"
                            >
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="tipoGateway.nombre"
                                    (keyup.enter)="saveInlineEditTipoGateway(tipoGateway, 'nombre')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                    placeholder="Nombre del gateway"
                                />
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEditTipoGateway(tipoGateway, 'nombre')"
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
                        </td>

                        <!-- Clave - EDITABLE INLINE -->
                        <td>
                            <span
                                *ngIf="editingCell !== tipoGateway.id + '_clave'"
                                (click)="editInlineTipoGateway(tipoGateway, 'clave'); $event.stopPropagation()"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{tipoGateway.clave}}
                            </span>
                            <div
                                *ngIf="editingCell === tipoGateway.id + '_clave'"
                                class="inline-edit-container"
                            >
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="tipoGateway.clave"
                                    (keyup.enter)="saveInlineEditTipoGateway(tipoGateway, 'clave')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #inputClave
                                    (focus)="inputClave.select()"
                                    autofocus
                                    placeholder="Clave del gateway"
                                />
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEditTipoGateway(tipoGateway, 'clave')"
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
                        </td>

                        <!-- Tipo Depósito - EDITABLE INLINE -->
                        <td>
                            <span
                                *ngIf="editingCell !== tipoGateway.id + '_tipo_deposito'"
                                (click)="editInlineTipoGateway(tipoGateway, 'tipo_deposito'); $event.stopPropagation()"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{tipoGateway.tipo_deposito}}
                            </span>
                            <div
                                *ngIf="editingCell === tipoGateway.id + '_tipo_deposito'"
                                class="inline-edit-container"
                            >
                                <p-inputNumber
                                    [(ngModel)]="tipoGateway.tipo_deposito"
                                    (keyup.enter)="saveInlineEditTipoGateway(tipoGateway, 'tipo_deposito')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    [showButtons]="false"
                                    [min]="0"
                                    [max]="999"
                                    class="flex-1"
                                    size="small"
                                    placeholder="Tipo de depósito"
                                ></p-inputNumber>
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEditTipoGateway(tipoGateway, 'tipo_deposito')"
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
                        </td>

                        <!-- Estado - TOGGLE SWITCH -->
                        <td>
                            <p-toggleSwitch
                                [ngModel]="getTipoGatewayToggleState(tipoGateway)"
                                [ngModelOptions]="{standalone: true}"
                                onLabel="ACTIVO"
                                offLabel="INACTIVO"
                                inputId="{{tipoGateway.id}}_habilitado"
                                (ngModelChange)="onToggleSwitchChange($event, tipoGateway)"
                                class="status-toggle"
                                pTooltip="Cambiar estado del tipo de gateway"
                            ></p-toggleSwitch>
                        </td>

                        <!-- Switch Activo - TOGGLE SWITCH -->
                        <td>
                            <p-toggleSwitch
                                [ngModel]="getTipoGatewaySwActivoToggleState(tipoGateway)"
                                [ngModelOptions]="{standalone: true}"
                                onLabel="HABILITADO"
                                offLabel="DESHABILITADO"
                                inputId="{{tipoGateway.id}}_swActivo"
                                (ngModelChange)="onToggleSwActivoChange($event, tipoGateway)"
                                class="status-toggle"
                                pTooltip="Cambiar estado activo del tipo de gateway"
                            ></p-toggleSwitch>
                        </td>

                        <!-- Fecha Movimiento - SOLO LECTURA -->
                        <td>{{tipoGateway.fecha_mov | date:'short'}}</td>

                        <!-- Acciones -->
                        <td>
                            <div class="flex gap-1">
                                <button
                                    pButton
                                    icon="pi pi-pencil"
                                    (click)="openTipoGatewayForm(tipoGateway)"
                                    class="p-button-sm p-button-text p-button-warning"
                                    pTooltip="Editar Tipo Gateway"
                                    tooltipPosition="top"
                                    tooltipStyleClass="tooltip-theme"
                                ></button>
                                <button
                                    pButton
                                    icon="pi pi-trash"
                                    (click)="eliminarTipoGateway(tipoGateway)"
                                    class="p-button-sm p-button-text p-button-danger"
                                    pTooltip="Eliminar Tipo Gateway"
                                    tooltipPosition="top"
                                    tooltipStyleClass="tooltip-theme"
                                ></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Modal Formulario Tipo Gateway -->
            <p-dialog
                [(visible)]="showTipoGatewayModal"
                [header]="isEditingTipoGateway ? 'Editar Tipo de Gateway' : 'Nuevo Tipo de Gateway'"
                [modal]="true"
                [style]="{width: '600px'}"
                [draggable]="false"
                [resizable]="false"
                [closable]="true"
            >
                <form [formGroup]="tipoGatewayForm" (ngSubmit)="saveTipoGateway()">
                    <div class="space-y-4">
                        <!-- Primera fila: Nombre y Clave -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Nombre *</label>
                                <input
                                    pInputText
                                    formControlName="nombre"
                                    placeholder="Nombre del gateway"
                                    class="w-full"
                                />
                                <small *ngIf="tipoGatewayForm.get('nombre')?.invalid && tipoGatewayForm.get('nombre')?.touched"
                                       class="text-red-500">
                                    El nombre es obligatorio
                                </small>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Clave *</label>
                                <input
                                    pInputText
                                    formControlName="clave"
                                    placeholder="Clave identificadora"
                                    class="w-full"
                                />
                                <small *ngIf="tipoGatewayForm.get('clave')?.invalid && tipoGatewayForm.get('clave')?.touched"
                                       class="text-red-500">
                                    La clave es obligatoria
                                </small>
                            </div>
                        </div>

                        <!-- Segunda fila: Tipo Depósito y Estado -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Tipo Depósito *</label>
                                <p-inputNumber
                                    formControlName="tipo_deposito"
                                    [showButtons]="false"
                                    [min]="0"
                                    [max]="999"
                                    placeholder="Tipo de depósito"
                                    class="w-full"
                                ></p-inputNumber>
                                <small *ngIf="tipoGatewayForm.get('tipo_deposito')?.invalid && tipoGatewayForm.get('tipo_deposito')?.touched"
                                       class="text-red-500">
                                    El tipo de depósito es obligatorio
                                </small>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Estado</label>
                                <p-tag
                                    [value]="tipoGatewayForm.get('estado')?.value === 'A' ? 'Activo' : 'Inactivo'"
                                    [severity]="tipoGatewayForm.get('estado')?.value === 'A' ? 'success' : 'danger'"
                                    (click)="tipoGatewayForm.patchValue({estado: tipoGatewayForm.get('estado')?.value === 'A' ? 'I' : 'A'})"
                                    class="cursor-pointer hover:opacity-80 transition-opacity"
                                ></p-tag>
                            </div>
                        </div>

                        <!-- Tercera fila: Switch Activo -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Activo</label>
                                <p-toggleSwitch
                                    [ngModel]="tipoGatewayForm.get('swActivo')?.value === 1"
                                    [ngModelOptions]="{standalone: true}"
                                    onLabel="HABILITADO"
                                    offLabel="DESHABILITADO"
                                    (ngModelChange)="tipoGatewayForm.patchValue({swActivo: $event ? 1 : 0})"
                                    class="status-toggle"
                                ></p-toggleSwitch>
                            </div>
                            <div>
                                <!-- Espacio vacío para mantener el layout -->
                            </div>
                        </div>

                        <!-- Campos opcionales -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">IDJ (Opcional)</label>
                                <p-inputNumber
                                    formControlName="idj"
                                    [showButtons]="false"
                                    placeholder="ID adicional"
                                    class="w-full"
                                ></p-inputNumber>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">SW (Opcional)</label>
                                <input
                                    pInputText
                                    formControlName="sw"
                                    placeholder="Switch adicional"
                                    class="w-full"
                                />
                            </div>
                        </div>

                        <!-- Información de solo lectura -->
                        <div *ngIf="isEditingTipoGateway" class="border-t pt-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-1">ID</label>
                                    <span class="text-sm text-gray-700">{{tipoGatewayForm.get('id')?.value || 'N/A'}}</span>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-1">Fecha Movimiento</label>
                                    <span class="text-sm text-gray-700">{{tipoGatewayForm.get('fecha_mov')?.value ? (tipoGatewayForm.get('fecha_mov')?.value | date:'short') : 'N/A'}}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                            pButton
                            type="button"
                            (click)="closeTipoGatewayForm()"
                            label="Cancelar"
                            class="p-button-text"
                        ></button>
                        <button
                            pButton
                            type="submit"
                            [label]="isEditingTipoGateway ? 'Actualizar' : 'Crear'"
                            [disabled]="!tipoGatewayForm.valid || savingTipoGateway"
                            [loading]="savingTipoGateway"
                            severity="primary"
                            raised
                        ></button>
                    </div>
                </form>
            </p-dialog>

            <!-- Modal de Confirmación Genérico -->
            <p-dialog
                [header]="confirmHeader"
                [(visible)]="showConfirmDialog"
                [modal]="true"
                [style]="{width: '450px'}"
                [closable]="true"
                (onHide)="cancelarConfirmacion()"
            >
                <div class="flex align-items-center gap-3 mb-3">
                    <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                    <span class="text-lg">{{confirmMessage}}</span>
                </div>

                <div class="flex justify-content-end gap-2 mt-4">
                    <p-button
                        label="Cancelar"
                        icon="pi pi-times"
                        severity="secondary"
                        (onClick)="cancelarConfirmacion()"
                    ></p-button>
                    <p-button
                        [label]="confirmButtonLabel"
                        icon="pi pi-check"
                        severity="danger"
                        raised
                        (onClick)="ejecutarAccionConfirmada()"
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

        /* Estilos para edición inline */
        .inline-edit-container {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .inline-action-btn {
            padding: 0.25rem;
            min-width: 2rem;
            height: 2rem;
        }

        /* Estilos para p-inputNumber en inline edit */
        :host ::ng-deep .inline-edit-container .p-inputnumber {
            flex: 1;
        }

        :host ::ng-deep .inline-edit-container .p-inputnumber .p-inputtext {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
        }

        /* Estilos para toggle switches */
        :host ::ng-deep .status-toggle .p-toggleswitch {
            width: 3.5rem !important;
            height: 1.5rem !important;
        }

        :host ::ng-deep .status-toggle .p-toggleswitch .p-toggleswitch-slider {
            font-size: 0.75rem !important;
            padding: 0.125rem 0.25rem !important;
        }

        :host ::ng-deep .status-toggle .p-toggleswitch .p-toggleswitch-handle {
            width: 1.25rem !important;
            height: 1.25rem !important;
        }
    `]
})
export class TipoGatewayComponent implements OnInit {
    // Datos
    tiposGateway: TipoGatewayItem[] = [];
    tipoGatewaySeleccionado: TipoGatewayItem | null = null;

    // Estados de carga
    loadingTiposGateway = false;
    savingTipoGateway = false;

    // Estados de modales
    showTipoGatewayModal = false;
    showConfirmDialog = false;

    // Estados del formulario
    tipoGatewayForm!: FormGroup;
    isEditingTipoGateway = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Estados temporales para toggle switches
    toggleStates: { [key: number]: boolean } = {};
    toggleSwActivoStates: { [key: number]: boolean } = {};

    // Confirmación
    tipoGatewayToDelete: TipoGatewayItem | null = null;

    constructor(
        private fb: FormBuilder,
        private tipoGatewayService: TipoGatewayService,
        private messageService: MessageService
    ) {
        this.initializeForm();
    }

    ngOnInit(): void {
        console.log('🚀 TipoGatewayComponent inicializado');
        this.cargarTiposGateway();
    }

    // ========== MÉTODOS DE INICIALIZACIÓN ==========

    private initializeForm(): void {
        this.tipoGatewayForm = this.fb.group({
            id: [null],
            nombre: ['', [Validators.required]],
            clave: ['', [Validators.required]],
            tipo_deposito: [0, [Validators.required, Validators.min(0)]],
            estado: ['A'],
            swActivo: [1],
            idj: [null],
            sw: [''],
            fecha_mov: [null]
        });
    }

    // ========== MÉTODOS DE DATOS ==========

    cargarTiposGateway(): void {
        this.loadingTiposGateway = true;

        this.tipoGatewayService.getTipoGateways().subscribe({
            next: (response) => {
                console.log('✅ Tipos de gateway cargados:', response);
                if (response && response.data) {
                    this.tiposGateway = response.data;
                    console.log('📊 Tipos de gateway procesados:', this.tiposGateway.length, 'registros');
                } else {
                    this.tiposGateway = [];
                }
                this.loadingTiposGateway = false;
            },
            error: (error) => {
                console.error('❌ Error al cargar tipos de gateway:', error);
                this.loadingTiposGateway = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los tipos de gateway',
                    life: 5000
                });
            }
        });
    }

    // ========== MÉTODOS DE UI ==========

    onGlobalFilter(table: any, event: any): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onTipoGatewaySelect(event: any): void {
        console.log('📋 Tipo de gateway seleccionado:', event.data);
        this.tipoGatewaySeleccionado = event.data;
    }

    // ========== FORMULARIO ==========

    openTipoGatewayForm(tipoGateway?: TipoGatewayItem): void {
        this.isEditingTipoGateway = !!tipoGateway;

        if (tipoGateway) {
            console.log('✏️ Editando tipo de gateway:', tipoGateway);
            this.tipoGatewayForm.patchValue({
                id: tipoGateway.id,
                nombre: tipoGateway.nombre,
                clave: tipoGateway.clave,
                tipo_deposito: tipoGateway.tipo_deposito,
                estado: tipoGateway.estado,
                swActivo: tipoGateway.swActivo,
                idj: tipoGateway.idj,
                sw: tipoGateway.sw,
                fecha_mov: tipoGateway.fecha_mov
            });
            this.tipoGatewaySeleccionado = tipoGateway;
        } else {
            console.log('➕ Creando nuevo tipo de gateway');
            this.tipoGatewayForm.reset({
                id: null,
                nombre: '',
                clave: '',
                tipo_deposito: 0,
                estado: 'A',
                swActivo: 1,
                idj: null,
                sw: '',
                fecha_mov: null
            });
            this.tipoGatewaySeleccionado = null;
        }

        this.showTipoGatewayModal = true;
    }

    closeTipoGatewayForm(): void {
        this.showTipoGatewayModal = false;
        this.tipoGatewayForm.reset();
        this.isEditingTipoGateway = false;
        this.tipoGatewaySeleccionado = null;
    }

    saveTipoGateway(): void {
        if (this.tipoGatewayForm.valid) {
            this.savingTipoGateway = true;
            const formData = this.tipoGatewayForm.value;

            // Preparar datos para el servicio
            const tipoGatewayData: TipoGatewayFormItem = {
                id: this.isEditingTipoGateway ? formData.id : null,
                nombre: formData.nombre,
                clave: formData.clave,
                tipo_deposito: formData.tipo_deposito,
                estado: formData.estado,
                swActivo: formData.swActivo,
                idj: formData.idj || null,
                sw: formData.sw || null
            };

            console.log('💾 Guardando tipo de gateway:', tipoGatewayData);

            this.tipoGatewayService.saveTipoGateway(tipoGatewayData).subscribe({
                next: (response) => {
                    console.log('✅ Tipo de gateway guardado:', response);
                    const action = this.isEditingTipoGateway ? 'actualizado' : 'creado';
                    this.handleSaveSuccess(`Tipo de gateway ${action} correctamente`);
                },
                error: (error) => this.handleSaveError(error, this.isEditingTipoGateway ? 'actualizar' : 'crear')
            });
        }
    }

    private handleSaveSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: message
        });

        this.closeTipoGatewayForm();
        this.cargarTiposGateway();
        this.savingTipoGateway = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} tipo de gateway:`, error);

        let errorMessage = `Error al ${operation} el tipo de gateway`;
        if (error.error?.mensaje) {
            errorMessage = error.error.mensaje;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });

        this.savingTipoGateway = false;
    }

    // ========== EDICIÓN INLINE ==========

    editInlineTipoGateway(tipoGateway: TipoGatewayItem, field: string): void {
        this.editingCell = tipoGateway.id + '_' + field;
        this.originalValue = (tipoGateway as any)[field];
    }

    saveInlineEditTipoGateway(tipoGateway: TipoGatewayItem, field: string): void {
        if ((tipoGateway as any)[field] === this.originalValue) {
            this.cancelInlineEdit();
            return;
        }

        const tipoGatewayData: TipoGatewayFormItem = {
            id: tipoGateway.id,
            nombre: tipoGateway.nombre,
            clave: tipoGateway.clave,
            tipo_deposito: tipoGateway.tipo_deposito,
            estado: tipoGateway.estado,
            swActivo: tipoGateway.swActivo,
            idj: tipoGateway.idj,
            sw: tipoGateway.sw
        };

        this.tipoGatewayService.updateTipoGateway(tipoGatewayData).subscribe({
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
                (tipoGateway as any)[field] = this.originalValue;
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
            nombre: 'Nombre',
            clave: 'Clave',
            tipo_deposito: 'Tipo Depósito'
        };
        return labels[field] || field;
    }

    // ========== TOGGLE ESTADO ==========

    getTipoGatewayToggleState(tipoGateway: TipoGatewayItem): boolean {
        // Usar el estado temporal si existe, sino usar el estado real
        const tempState = this.toggleStates[tipoGateway.id];
        return tempState !== undefined ? tempState : tipoGateway.estado === 'A';
    }

    onToggleSwitchChange(isChecked: boolean, tipoGateway: TipoGatewayItem): void {
        const valorActual = tipoGateway.estado;
        const nuevoEstado = isChecked ? 'A' : 'I';

        // Actualizar estado temporal para feedback visual inmediato
        this.toggleStates[tipoGateway.id] = isChecked;

        if (nuevoEstado === 'I') {
            // Confirmar desactivación
            this.confirmMessage = `¿Está seguro de que desea desactivar el tipo de gateway "${tipoGateway.nombre}"?`;
            this.confirmHeader = 'Confirmar Desactivación';
            this.confirmButtonLabel = 'Desactivar';
            this.accionConfirmada = () => this.procesarCambioEstado(tipoGateway, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            // Activar directamente
            this.procesarCambioEstado(tipoGateway, nuevoEstado);
        }
    }

    getTipoGatewaySwActivoToggleState(tipoGateway: TipoGatewayItem): boolean {
        // Usar el estado temporal si existe, sino usar el estado real
        const tempState = this.toggleSwActivoStates[tipoGateway.id];
        return tempState !== undefined ? tempState : tipoGateway.swActivo === 1;
    }

    onToggleSwActivoChange(isChecked: boolean, tipoGateway: TipoGatewayItem): void {
        const valorActual = tipoGateway.swActivo;
        const nuevoSwActivo = isChecked ? 1 : 0;

        // Actualizar estado temporal para feedback visual inmediato
        this.toggleSwActivoStates[tipoGateway.id] = isChecked;

        if (!isChecked) {
            // Confirmar deshabilitación
            this.confirmMessage = `¿Está seguro de que desea deshabilitar el tipo de gateway "${tipoGateway.nombre}"?`;
            this.confirmHeader = 'Confirmar Deshabilitación';
            this.confirmButtonLabel = 'Deshabilitar';
            this.accionConfirmada = () => this.procesarCambioSwActivo(tipoGateway, nuevoSwActivo);
            this.showConfirmDialog = true;
        } else {
            // Habilitar directamente
            this.procesarCambioSwActivo(tipoGateway, nuevoSwActivo);
        }
    }

    toggleEstadoTipoGateway(tipoGateway: TipoGatewayItem): void {
        const nuevoEstado = tipoGateway.estado === 'A' ? 'I' : 'A';

        if (nuevoEstado === 'I') {
            this.confirmMessage = `¿Está seguro de que desea desactivar el tipo de gateway "${tipoGateway.nombre}"?`;
            this.confirmHeader = 'Confirmar Desactivación';
            this.confirmButtonLabel = 'Desactivar';
            this.accionConfirmada = () => this.procesarCambioEstado(tipoGateway, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            this.procesarCambioEstado(tipoGateway, nuevoEstado);
        }
    }

    private procesarCambioEstado(tipoGateway: TipoGatewayItem, nuevoEstado: 'A' | 'I'): void {
        const estadoAnterior = tipoGateway.estado;
        tipoGateway.estado = nuevoEstado;

        // Limpiar estado temporal ya que la operación se está procesando
        delete this.toggleStates[tipoGateway.id];

        const tipoGatewayData: TipoGatewayFormItem = {
            id: tipoGateway.id,
            nombre: tipoGateway.nombre,
            clave: tipoGateway.clave,
            tipo_deposito: tipoGateway.tipo_deposito,
            estado: nuevoEstado,
            swActivo: tipoGateway.swActivo,
            idj: tipoGateway.idj,
            sw: tipoGateway.sw
        };

        this.tipoGatewayService.updateTipoGateway(tipoGatewayData).subscribe({
            next: (response) => {
                console.log('✅ Estado actualizado:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado Actualizado',
                    detail: `Tipo de gateway ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local
                tipoGateway.estado = estadoAnterior;

                // Revertir estado temporal también
                this.toggleStates[tipoGateway.id] = estadoAnterior === 'A';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado del tipo de gateway',
                    life: 5000
                });
            }
        });
    }

    private procesarCambioSwActivo(tipoGateway: TipoGatewayItem, nuevoSwActivo: number): void {
        const swActivoAnterior = tipoGateway.swActivo;
        tipoGateway.swActivo = nuevoSwActivo;

        // Limpiar estado temporal ya que la operación se está procesando
        delete this.toggleSwActivoStates[tipoGateway.id];

        const tipoGatewayData: TipoGatewayFormItem = {
            id: tipoGateway.id,
            nombre: tipoGateway.nombre,
            clave: tipoGateway.clave,
            tipo_deposito: tipoGateway.tipo_deposito,
            estado: tipoGateway.estado,
            swActivo: nuevoSwActivo,
            idj: tipoGateway.idj,
            sw: tipoGateway.sw
        };

        this.tipoGatewayService.updateTipoGateway(tipoGatewayData).subscribe({
            next: (response) => {
                console.log('✅ Switch activo actualizado:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Switch Actualizado',
                    detail: `Tipo de gateway ${nuevoSwActivo === 1 ? 'habilitado' : 'deshabilitado'} correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al cambiar switch activo:', error);

                // Revertir cambio local
                tipoGateway.swActivo = swActivoAnterior;

                // Revertir estado temporal también
                this.toggleSwActivoStates[tipoGateway.id] = swActivoAnterior === 1;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el switch del tipo de gateway',
                    life: 5000
                });
            }
        });
    }

    // ========== TOGGLE SWITCH ACTIVO ==========

    toggleSwActivoTipoGateway(tipoGateway: TipoGatewayItem): void {
        const nuevoSwActivo = tipoGateway.swActivo === 1 ? 0 : 1;

        if (nuevoSwActivo === 0) {
            // Confirmar deshabilitación
            this.confirmMessage = `¿Está seguro de que desea deshabilitar el tipo de gateway "${tipoGateway.nombre}"?`;
            this.confirmHeader = 'Confirmar Deshabilitación';
            this.confirmButtonLabel = 'Deshabilitar';
            this.accionConfirmada = () => this.procesarCambioSwActivo(tipoGateway, nuevoSwActivo);
            this.showConfirmDialog = true;
        } else {
            // Habilitar directamente
            this.procesarCambioSwActivo(tipoGateway, nuevoSwActivo);
        }
    }

    // ========== ELIMINACIÓN ==========

    eliminarTipoGateway(tipoGateway: TipoGatewayItem): void {
        this.tipoGatewayToDelete = tipoGateway;
        this.confirmMessage = `¿Está seguro de que desea eliminar el tipo de gateway "${tipoGateway.nombre}"?`;
        this.confirmHeader = 'Confirmar Eliminación';
        this.confirmButtonLabel = 'Eliminar';
        this.accionConfirmada = () => this.confirmarEliminacion();
        this.showConfirmDialog = true;
    }

    confirmarEliminacion(): void {
        if (this.tipoGatewayToDelete) {
            this.tipoGatewayService.deleteTipoGateway(this.tipoGatewayToDelete.id).subscribe({
                next: (response) => {
                    console.log('✅ Tipo de gateway eliminado:', response);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Tipo de gateway eliminado correctamente'
                    });

                    this.cargarTiposGateway();
                    this.cancelarConfirmacion();
                },
                error: (error) => {
                    console.error('❌ Error al eliminar tipo de gateway:', error);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al eliminar el tipo de gateway',
                        life: 5000
                    });
                }
            });
        }
    }

    cancelarConfirmacion(): void {
        this.showConfirmDialog = false;
        this.tipoGatewayToDelete = null;
        this.accionConfirmada = null;
        this.confirmMessage = '';
        this.confirmHeader = '';
        this.confirmButtonLabel = 'Confirmar';
    }

    ejecutarAccionConfirmada(): void {
        if (this.accionConfirmada) {
            this.accionConfirmada();
            this.cancelarConfirmacion();
        }
    }

    // ========== UTILIDADES ==========

    getEstadoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: string): 'success' | 'danger' {
        return estado === 'A' ? 'success' : 'danger';
    }

    getSwActivoLabel(swActivo: number): string {
        return swActivo === 1 ? 'Habilitado' : 'Deshabilitado';
    }

    getSwActivoSeverity(swActivo: number): 'success' | 'danger' {
        return swActivo === 1 ? 'success' : 'danger';
    }

    // Variables para confirmación
    confirmMessage = '';
    confirmHeader = '';
    confirmButtonLabel = 'Confirmar';
    accionConfirmada: (() => void) | null = null;
}
