import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Servicios y modelos
import { CatConceptosDetService } from '../../../features/catconceptos/services/catconceptosdet.service';
import { CatConceptosService } from '../../../features/catconceptos/services/catconceptos.service';
import {
    CatConceptoDet,
    CreateCatConceptoDetRequest,
    UpdateCatConceptoDetRequest,
    CatConceptoDetQueryParams
} from '../../../features/catconceptos/models/catconceptosdet.interface';
import { CatConcepto } from '../../../features/catconceptos/models/catconceptos.interface';

@Component({
    selector: 'app-catconceptosdet-tab',
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
        FloatLabelModule,
        TooltipModule
    ],
    providers: [MessageService],
    template: `
        <!-- Tabla con consulta unificada -->
        <p-table
            #dtDetalles
            [value]="detalles"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            responsiveLayout="scroll"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} detalles"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['descripcion', 'valorcadena1', 'nombre_concepto']"
            selectionMode="single"
            [(selection)]="detalleSeleccionado"
            (onRowSelect)="onDetalleSelect($event)"
            [dataKey]="'clave_concepto'"
            [sortMode]="'multiple'"
            [filterDelay]="300"
        >
            <!-- Caption con controles -->
            <ng-template #caption>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <input
                        pInputText
                        type="text"
                        (input)="onGlobalFilter(dtDetalles, $event)"
                        placeholder="Buscar detalles..."
                        class="w-full sm:w-80 order-1 sm:order-0"
                    />
                    <div class="flex gap-2 order-0 sm:order-1">
                        <button
                            (click)="cargarDetalles()"
                            pButton
                            raised
                            icon="pi pi-refresh"
                            [loading]="loadingDetalles"
                            pTooltip="Actualizar"
                        ></button>
                        <button
                            (click)="openDetalleForm()"
                            pButton
                            raised
                            icon="pi pi-plus"
                            pTooltip="Agregar Detalle"
                            [disabled]="!conceptoSeleccionado || savingDetalle"
                        ></button>
                    </div>
                </div>
            </ng-template>

            <!-- Headers -->
            <ng-template #header>
                <tr>
                    <th pSortableColumn="concepto" style="width: 100px">N° <p-sortIcon field="concepto"></p-sortIcon></th>
                    <th pSortableColumn="descripcion" style="min-width: 200px">Descripción <p-sortIcon field="descripcion"></p-sortIcon></th>
                    <th pSortableColumn="valorcadena1" style="min-width: 150px">Valor Cadena <p-sortIcon field="valorcadena1"></p-sortIcon></th>
                    <th pSortableColumn="folio" style="width: 80px">Folio <p-sortIcon field="folio"></p-sortIcon></th>
                    <th pSortableColumn="valor1" style="width: 100px">Valor 1 <p-sortIcon field="valor1"></p-sortIcon></th>
                    <th pSortableColumn="swestado" style="width: 100px">Estado <p-sortIcon field="swestado"></p-sortIcon></th>
                    <th style="width: 150px">Acciones</th>
                </tr>
            </ng-template>

            <!-- Body -->
            <ng-template #body let-detalle>
                <tr>
                    <!-- Número de Concepto -->
                    <td class="text-center font-mono">{{ detalle.concepto }}</td>

                    <!-- Descripción -->
                    <td>
                        <span
                            *ngIf="editingCell !== detalle.clave + '_' + detalle.concepto + '_descripcion'"
                            (click)="editInlineDetalle(detalle, 'descripcion'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ detalle.descripcion }}
                        </span>
                        <div
                            *ngIf="editingCell === detalle.clave + '_' + detalle.concepto + '_descripcion'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="detalle.descripcion"
                                (keyup.enter)="saveInlineEditDetalle(detalle, 'descripcion')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Descripción del detalle"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditDetalle(detalle, 'descripcion')"
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

                    <!-- Valor Cadena -->
                    <td>
                        <span
                            *ngIf="editingCell !== detalle.clave + '_' + detalle.concepto + '_valorcadena1'"
                            (click)="editInlineDetalle(detalle, 'valorcadena1'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ detalle.valorcadena1 || '—' }}
                        </span>
                        <div
                            *ngIf="editingCell === detalle.clave + '_' + detalle.concepto + '_valorcadena1'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="detalle.valorcadena1"
                                (keyup.enter)="saveInlineEditDetalle(detalle, 'valorcadena1')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Valor cadena del detalle"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditDetalle(detalle, 'valorcadena1')"
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

                    <!-- Folio -->
                    <td class="text-center">{{ detalle.folio }}</td>

                    <!-- Valor 1 -->
                    <td class="text-center">{{ detalle.valor1 }}</td>

                    <!-- Estado -->
                    <td>
                        <p-tag
                            [value]="getEstadoLabel(detalle.swestado)"
                            [severity]="getEstadoSeverity(detalle.swestado)"
                            (click)="toggleEstadoDetalle(detalle); $event.stopPropagation()"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            title="Clic para cambiar"
                        ></p-tag>
                    </td>

                    <!-- Acciones -->
                    <td (click)="$event.stopPropagation()">
                        <div class="flex gap-1">
                            <button
                                pButton
                                icon="pi pi-pencil"
                                (click)="openDetalleForm(detalle)"
                                class="p-button-sm p-button-text p-button-warning"
                                pTooltip="Editar Detalle"
                            ></button>
                            <button
                                pButton
                                icon="pi pi-trash"
                                (click)="eliminarDetalle(detalle)"
                                class="p-button-sm p-button-text p-button-danger"
                                pTooltip="Eliminar Detalle"
                            ></button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Modal de formulario CRUD -->
        <p-dialog
            [(visible)]="showDetalleModal"
            [header]="isEditingDetalle ? 'Editar Detalle' : 'Nuevo Detalle'"
            [modal]="true"
            [style]="{width: '700px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="detalleForm" (ngSubmit)="saveDetalle()">
                <div class="grid grid-cols-1 gap-4">
                    <!-- Información del concepto padre (siempre mostrar) -->
                    <div class="p-3 bg-blue-50 rounded">
                        <label class="block text-sm font-medium mb-1">Concepto Padre:</label>
                        <div class="flex items-center gap-2">
                            <span class="font-medium">{{ conceptoSeleccionado?.clave }}</span>
                            <span class="text-sm text-gray-600">({{ conceptoSeleccionado?.nombre }})</span>
                        </div>
                    </div>

                    <!-- Concepto (opcional - customizable) -->
                    <div>
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                id="concepto"
                                formControlName="concepto"
                                placeholder="Dejar vacío para auto-asignar"
                                class="w-full"
                                type="number"
                                min="1"
                            />
                            <label for="concepto">Concepto (opcional)</label>
                        </p-floatLabel>
                        <small class="text-gray-500 text-xs mt-1 block">
                            Si está vacío, el sistema asignará automáticamente el siguiente número
                        </small>
                    </div>

                    <!-- Descripción -->
                    <div>
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                id="descripcion"
                                formControlName="descripcion"
                                class="w-full"
                                maxlength="255"
                            />
                            <label for="descripcion">Descripción *</label>
                        </p-floatLabel>
                    </div>

                    <!-- Campos adicionales en fila -->
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    id="folio"
                                    formControlName="folio"
                                    class="w-full"
                                    type="number"
                                />
                                <label for="folio">Folio</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    id="valor1"
                                    formControlName="valor1"
                                    class="w-full"
                                    type="number"
                                />
                                <label for="valor1">Valor 1</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    id="valorcadena1"
                                    formControlName="valorcadena1"
                                    class="w-full"
                                    maxlength="100"
                                />
                                <label for="valorcadena1">Valor Cadena</label>
                            </p-floatLabel>
                        </div>
                    </div>

                    <!-- Campo booleano -->
                    <div class="flex items-center gap-2">
                        <p-tag
                            [value]="detalleForm.get('swestado')?.value ? 'Sí' : 'No'"
                            [severity]="detalleForm.get('swestado')?.value ? 'success' : 'danger'"
                            (click)="toggleFormField('swestado')"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            title="Clic para cambiar">
                        </p-tag>
                        <span>¿Activo?</span>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
                    <button
                        pButton
                        type="button"
                        (click)="closeDetalleForm()"
                        label="Cancelar"
                        class="p-button-text"
                    ></button>
                    <button
                        pButton
                        type="submit"
                        [label]="isEditingDetalle ? 'Actualizar' : 'Crear'"
                        [disabled]="!detalleForm.valid || savingDetalle"
                        [loading]="savingDetalle"
                        class="p-button-success"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de confirmación de eliminación -->
        <p-dialog
            [(visible)]="showConfirmDeleteDetalle"
            header="Confirmar Eliminación"
            [modal]="true"
            [style]="{width: '400px', minHeight: '200px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <div class="flex items-center gap-4 mb-4">
                <span class="text-8xl animate-bounce">⚠️</span>
                <div>
                    <h4 class="font-semibold text-xl mb-1">¿Eliminar Detalle?</h4>
                    <p class="text-gray-700 text-lg">
                        ¿Estás seguro de que deseas eliminar el detalle
                        <strong>"{{detalleToDelete?.descripcion}}"</strong>?
                    </p>
                    <p class="text-sm text-red-600 mt-2 font-medium">
                        ⚠️ Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                    pButton
                    type="button"
                    (click)="cancelDeleteDetalle()"
                    label="Cancelar"
                    class="p-button-text"
                ></button>
                <button
                    pButton
                    type="button"
                    (click)="confirmDeleteDetalle()"
                    label="Eliminar"
                    class="p-button-danger"
                    [loading]="deletingDetalle"
                ></button>
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

        /* Fila seleccionada */
        .bg-blue-50 {
            background-color: #eff6ff !important;
        }

        /* Estilos para labels flotantes */
        :host ::ng-deep .p-floatlabel {
            width: 100%;
            margin-top: 1rem; /* Más espacio superior para labels */
            min-height: 3rem; /* Altura mínima para evitar cortes */
        }

        :host ::ng-deep .p-floatlabel label {
            background: white;
            padding: 0 4px;
            font-size: 0.875rem;
            top: -0.75rem; /* Posición más alta para evitar cortes */
            left: 0.75rem; /* Pequeño offset para alineación */
            z-index: 1;
        }

        :host ::ng-deep .p-floatlabel input {
            padding-top: 1rem; /* Espacio superior para el label */
            padding-bottom: 0.5rem;
        }

        :host ::ng-deep .p-floatlabel input:focus + label,
        :host ::ng-deep .p-floatlabel input:not(:placeholder-shown) + label {
            color: #6366f1; /* Indigo */
        }

        /* Asegurar que el modal tenga suficiente altura */
        :host ::ng-deep .p-dialog .p-dialog-content {
            padding-top: 1.5rem !important;
        }

        /* Estilos para campos booleanos */
        :host ::ng-deep .p-tag {
            font-size: 0.875rem;
            padding: 0.25rem 0.5rem;
            font-weight: 500;
        }
    `]
})
export class CatconceptosdetTabComponent implements OnInit, OnChanges {
    // Datos
    detalles: CatConceptoDet[] = [];
    detalleSeleccionado: CatConceptoDet | null = null;

    // @Input desde el tab 1
    @Input() conceptoSeleccionado: CatConcepto | null = null;

    // Estados
    loadingDetalles = false;
    savingDetalle = false;
    deletingDetalle = false;

    // Modales
    showDetalleModal = false;
    showConfirmDeleteDetalle = false;

    // Formulario
    detalleForm!: FormGroup;
    isEditingDetalle = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Consulta unificada
    queryParams: CatConceptoDetQueryParams = {};

    // Confirmación
    detalleToDelete: CatConceptoDet | null = null;

    // Servicios
    private catConceptosDetService = inject(CatConceptosDetService);
    private catConceptosService = inject(CatConceptosService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);

    // ViewChild para tabla
    @ViewChild('dtDetalles') dtDetalles!: Table;

    ngOnInit(): void {
        console.log('📋 CatconceptosdetTabComponent inicializado');
        this.initializeForms();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['conceptoSeleccionado']) {
            console.log('🔄 Concepto seleccionado cambió:', this.conceptoSeleccionado);
            if (this.conceptoSeleccionado) {
                this.queryParams.clave = this.conceptoSeleccionado.clave;
                this.cargarDetalles();
            } else {
                // Limpiar detalles cuando no hay selección
                this.detalles = [];
                this.queryParams = {};
            }
        }
    }

    // ========== INICIALIZACIÓN ==========

    initializeForms(): void {
        this.detalleForm = this.fb.group({
            concepto: [''], // Opcional - backend lo asigna automáticamente si está vacío
            descripcion: ['', [Validators.required, Validators.maxLength(255)]],
            folio: [0],
            valor1: [0],
            valorcadena1: ['', [Validators.maxLength(100)]],
            swestado: [true]
        });
    }

    // ========== CARGA DE DATOS ==========

    cargarDetalles(): void {
        if (!this.conceptoSeleccionado) {
            console.log('ℹ️ No hay concepto seleccionado, no se cargan detalles');
            this.detalles = [];
            return;
        }

        this.loadingDetalles = true;
        console.log('📊 Consultando detalles con parámetros:', this.queryParams);

        this.catConceptosDetService.queryDetalles(this.queryParams).subscribe({
            next: (response) => {
                console.log('✅ Detalles cargados:', response.data);
                this.detalles = response.data;
                this.loadingDetalles = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Datos Actualizados',
                    detail: `${this.detalles.length} detalles cargados para ${this.conceptoSeleccionado?.clave}`
                });
            },
            error: (error) => {
                console.error('❌ Error consultando detalles:', error);
                this.loadingDetalles = false;

                // Mostrar mensaje de error específico del backend
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar detalles';

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

    openDetalleForm(detalle?: CatConceptoDet): void {
        // Solo permitir crear si hay un concepto seleccionado
        if (!detalle && !this.conceptoSeleccionado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Selección requerida',
                detail: 'Debes seleccionar un concepto primero para crear detalles'
            });
            return;
        }

        this.isEditingDetalle = !!detalle;

        if (detalle) {
            console.log('✏️ Editando detalle:', detalle);
            this.detalleSeleccionado = detalle;
            this.detalleForm.patchValue({
                concepto: detalle.concepto, // Mostrar el concepto actual en edición
                descripcion: detalle.descripcion,
                folio: detalle.folio,
                valor1: detalle.valor1,
                valorcadena1: detalle.valorcadena1,
                swestado: detalle.swestado === 1
            });
        } else {
            console.log('➕ Creando nuevo detalle para:', this.conceptoSeleccionado?.clave);
            this.detalleForm.reset({
                concepto: '', // Vacío para auto-asignación
                descripcion: '',
                folio: 0,
                valor1: 0,
                valorcadena1: '',
                swestado: true
            });
            this.detalleSeleccionado = null;
        }

        this.showDetalleModal = true;
    }

    closeDetalleForm(): void {
        this.showDetalleModal = false;
        this.detalleForm.reset();
        this.isEditingDetalle = false;
        this.detalleSeleccionado = null;
    }

    saveDetalle(): void {
        if (this.detalleForm.valid && this.conceptoSeleccionado) {
            this.savingDetalle = true;
            const formData = this.detalleForm.value;

            // Convertir valores booleanos
            const processedData: CreateCatConceptoDetRequest = {
                clave: this.conceptoSeleccionado.clave, // Usar la clave del concepto seleccionado
                ...(formData.concepto && { concepto: Number(formData.concepto) }), // Incluir solo si tiene valor
                descripcion: formData.descripcion,
                folio: formData.folio || 0,
                valor1: formData.valor1 || 0,
                valorcadena1: formData.valorcadena1 || '',
                swestado: formData.swestado ? 1 : 0
            };

            if (this.isEditingDetalle && this.detalleSeleccionado) {
                // Actualizar - usar clave y concepto (puede haber cambiado)
                const updateData: UpdateCatConceptoDetRequest = {
                    clave: this.detalleSeleccionado.clave,
                    concepto: formData.concepto ? Number(formData.concepto) : this.detalleSeleccionado.concepto,
                    descripcion: processedData.descripcion,
                    folio: processedData.folio,
                    valor1: processedData.valor1,
                    valorcadena1: processedData.valorcadena1,
                    swestado: processedData.swestado
                };

                this.catConceptosDetService.updateDetalle(updateData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Detalle actualizado correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'actualizar')
                });
            } else {
                // Crear - usar la clave del concepto seleccionado
                this.catConceptosDetService.createDetalle(processedData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Detalle creado correctamente');
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

        this.closeDetalleForm();
        this.cargarDetalles();
        this.savingDetalle = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} detalle:`, error);

        let errorMessage = `Error al ${operation} el detalle`;

        // Extraer mensaje de error del backend con diferentes formatos posibles
        if (error) {
            // Formato directo del backend
            if (error.mensaje) {
                errorMessage = error.mensaje;
            }
            // Formato de error HTTP
            else if (error.error && error.error.mensaje) {
                errorMessage = error.error.mensaje;
            }
            // Formato alternativo de error HTTP
            else if (error.error && error.error.message) {
                errorMessage = error.error.message;
            }
            // Formato de error de Angular HttpClient
            else if (error.message) {
                errorMessage = error.message;
            }
            // Último recurso: convertir a string
            else if (typeof error === 'string') {
                errorMessage = error;
            }
        }

        console.log('📤 Mensaje de error final:', errorMessage);

        this.messageService.add({
            severity: 'error',
            summary: `Error al ${operation}`,
            detail: errorMessage,
            life: 5000
        });

        this.savingDetalle = false;
    }

    // ========== EDICIÓN INLINE ==========

    editInlineDetalle(detalle: CatConceptoDet, field: string): void {
        this.editingCell = detalle.clave + '_' + detalle.concepto + '_' + field;
        this.originalValue = (detalle as any)[field];
        console.log('✏️ Editando inline:', field, 'Valor:', this.originalValue);
    }

    saveInlineEditDetalle(detalle: CatConceptoDet, field: string): void {
        console.log('💾 Guardando inline:', field, 'Nuevo valor:', (detalle as any)[field]);

        if ((detalle as any)[field] === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando');
            this.cancelInlineEdit();
            return;
        }

        const updateData: UpdateCatConceptoDetRequest = {
            clave: detalle.clave,
            concepto: detalle.concepto,
            [field]: (detalle as any)[field]
        };

        this.catConceptosDetService.updateDetalle(updateData).subscribe({
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
                (detalle as any)[field] = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;

                // Extraer mensaje de error del backend
                let errorMessage = `Error al actualizar ${this.getFieldLabel(field)}`;
                if (error) {
                    if (error.mensaje) {
                        errorMessage = error.mensaje;
                    } else if (error.error && error.error.mensaje) {
                        errorMessage = error.error.mensaje;
                    } else if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
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

    cancelInlineEdit(): void {
        this.editingCell = null;
        this.originalValue = null;
    }

    // ========== TOGGLE DE ESTADO ==========

    toggleEstadoDetalle(detalle: CatConceptoDet): void {
        const nuevoEstado = detalle.swestado === 1 ? 0 : 1;

        if (nuevoEstado === 0) {
            // Confirmar desactivación
            this.detalleToDelete = detalle;
            this.showConfirmDeleteDetalle = true;
        } else {
            // Activar directamente
            this.procesarCambioEstado(detalle, nuevoEstado);
        }
    }

    private procesarCambioEstado(detalle: CatConceptoDet, nuevoEstado: number): void {
        const estadoAnterior = detalle.swestado;
        detalle.swestado = nuevoEstado;

        const updateData: UpdateCatConceptoDetRequest = {
            clave: detalle.clave,
            concepto: detalle.concepto,
            swestado: nuevoEstado
        };

        this.catConceptosDetService.updateDetalle(updateData).subscribe({
            next: (response) => {
                console.log('✅ Estado actualizado:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado Actualizado',
                    detail: `Detalle ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local
                detalle.swestado = estadoAnterior;

                // Mostrar mensaje de error específico del backend
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cambiar estado';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cambiar estado',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    // ========== ELIMINACIÓN ==========

    eliminarDetalle(detalle: CatConceptoDet): void {
        this.detalleToDelete = detalle;
        this.showConfirmDeleteDetalle = true;
    }

    confirmDeleteDetalle(): void {
        if (this.detalleToDelete) {
            this.deletingDetalle = true;

            this.catConceptosDetService.deleteDetalle(
                this.detalleToDelete.clave,
                this.detalleToDelete.concepto
            ).subscribe({
                next: (response) => {
                    console.log('✅ Detalle eliminado:', response);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Detalle eliminado correctamente'
                    });

                    this.cancelDeleteDetalle();
                    this.cargarDetalles();
                },
                error: (error) => {
                    console.error('❌ Error al eliminar detalle:', error);

                    // Mostrar mensaje de error específico del backend
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar detalle';

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al eliminar detalle',
                        detail: errorMessage,
                        life: 5000
                    });

                    this.deletingDetalle = false;
                }
            });
        }
    }

    cancelDeleteDetalle(): void {
        this.showConfirmDeleteDetalle = false;
        this.detalleToDelete = null;
        this.deletingDetalle = false;
    }

    // ========== UTILIDADES ==========

    onDetalleSelect(event: any): void {
        console.log('📋 Detalle seleccionado:', event.data);
        this.detalleSeleccionado = event.data;
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    toggleFormField(fieldName: string): void {
        const currentValue = this.detalleForm.get(fieldName)?.value;
        const newValue = !currentValue;
        this.detalleForm.patchValue({ [fieldName]: newValue });
    }

    getEstadoLabel(estado: number): string {
        return estado === 1 ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: number): 'success' | 'danger' {
        return estado === 1 ? 'success' : 'danger';
    }

    private getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            'descripcion': 'Descripción',
            'folio': 'Folio',
            'valor1': 'Valor 1',
            'valorcadena1': 'Valor Cadena'
        };
        return labels[field] || field;
    }
}
