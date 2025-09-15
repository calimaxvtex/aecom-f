import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input, Output, EventEmitter, inject } from '@angular/core';
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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Servicios y modelos
import { CompService } from '../../../features/comp/services/comp.service';
import { Componente, CreateComponenteRequest, UpdateComponenteRequest } from '../../../features/comp/models/comp.interface';

@Component({
    selector: 'app-banners-components-tab',
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
        <!-- Tabla CRUD -->
        <p-table
            #dtConceptos
            [value]="conceptos"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            responsiveLayout="scroll"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} components"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['clave', 'nombre']"
            dataKey="id_comp"
            [sortMode]="'multiple'"
            [filterDelay]="300"
        >
            <!-- Caption con controles -->
            <ng-template #caption>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <input
                        pInputText
                        type="text"
                        (input)="onGlobalFilter(dtConceptos, $event)"
                        placeholder="Buscar conceptos..."
                        class="w-full sm:w-80 order-1 sm:order-0"
                    />
                    <div class="flex gap-2 order-0 sm:order-1">
                        <button
                            (click)="cargarConceptos()"
                            pButton
                            raised
                            icon="pi pi-refresh"
                            [loading]="loadingConceptos"
                            pTooltip="Actualizar"
                        ></button>
                        <button
                            (click)="openConceptoForm()"
                            pButton
                            raised
                            icon="pi pi-plus"
                            pTooltip="Agregar Concepto"
                        ></button>
                    </div>
                </div>
            </ng-template>

            <!-- Headers -->
            <ng-template #header>
                <tr>
                    <th pSortableColumn="id_comp" style="width: 80px">ID <p-sortIcon field="id_comp"></p-sortIcon></th>
                    <th pSortableColumn="clave" style="min-width: 150px">Clave <p-sortIcon field="clave"></p-sortIcon></th>
                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                    <th pSortableColumn="descripcion" style="min-width: 200px">Descripción <p-sortIcon field="descripcion"></p-sortIcon></th>
                    <th pSortableColumn="tipo_comp" style="min-width: 150px">Tipo Componente <p-sortIcon field="tipo_comp"></p-sortIcon></th>
                    <th style="width: 100px">Único</th>
                    <th style="width: 100px">Habilitado</th>
                    <th style="width: 150px">Acciones</th>
                </tr>
            </ng-template>

            <!-- Body -->
            <ng-template #body let-concepto>
                <tr
                    (click)="onRowClick(concepto)"
                    [class.bg-blue-50]="conceptoSeleccionado?.id_comp === concepto.id_comp"
                    class="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <!-- ID -->
                    <td>{{ concepto.id_comp }}</td>

                    <!-- Clave -->
                    <td>
                        <span
                            *ngIf="editingCell !== concepto.id_comp + '_clave'"
                            (click)="editInlineConcepto(concepto, 'clave'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ concepto.clave }}
                        </span>
                        <div
                            *ngIf="editingCell === concepto.id_comp + '_clave'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="concepto.clave"
                                (keyup.enter)="saveInlineEditConcepto(concepto, 'clave')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Clave del concepto"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditConcepto(concepto, 'clave')"
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

                    <!-- Nombre -->
                    <td>
                        <span
                            *ngIf="editingCell !== concepto.id_comp + '_nombre'"
                            (click)="editInlineConcepto(concepto, 'nombre'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ concepto.nombre }}
                        </span>
                        <div
                            *ngIf="editingCell === concepto.id_comp + '_nombre'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="concepto.nombre"
                                (keyup.enter)="saveInlineEditConcepto(concepto, 'nombre')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Nombre del concepto"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditConcepto(concepto, 'nombre')"
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

                    <!-- Descripción -->
                    <td>
                        <span
                            *ngIf="editingCell !== concepto.id_comp + '_descripcion'"
                            (click)="editInlineConcepto(concepto, 'descripcion'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ concepto.descripcion || '—' }}
                        </span>
                        <div
                            *ngIf="editingCell === concepto.id_comp + '_descripcion'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="concepto.descripcion"
                                (keyup.enter)="saveInlineEditConcepto(concepto, 'descripcion')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Descripción del componente"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditConcepto(concepto, 'descripcion')"
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

                    <!-- Tipo Componente -->
                    <td class="text-center">
                        {{ concepto.tipo_comp }}
                    </td>

                    <!-- Único -->
                    <td class="text-center">
                        <p-tag
                            [value]="concepto.isUnico ? 'Si' : 'No'"
                            [severity]="concepto.isUnico ? 'success' : 'danger'"
                            (click)="toggleIsUnico(concepto); $event.stopPropagation()"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            title="Clic para cambiar"
                        ></p-tag>
                    </td>

                    <!-- Habilitado -->
                    <td class="text-center">
                        <p-tag
                            [value]="concepto.swEnable ? 'Si' : 'No'"
                            [severity]="concepto.swEnable ? 'success' : 'danger'"
                            (click)="toggleSwEnable(concepto); $event.stopPropagation()"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            title="Clic para cambiar"
                        ></p-tag>
                    </td>

                    <!-- Estado -->
                    <td>
                        <p-tag
                            [value]="getEstadoLabel(concepto.swestado)"
                            [severity]="getEstadoSeverity(concepto.swestado)"
                            (click)="toggleEstadoConcepto(concepto); $event.stopPropagation()"
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
                                (click)="openConceptoForm(concepto)"
                                class="p-button-sm p-button-text p-button-warning"
                                pTooltip="Editar Concepto"
                            ></button>
                            <button
                                pButton
                                icon="pi pi-trash"
                                (click)="eliminarConcepto(concepto)"
                                class="p-button-sm p-button-text p-button-danger"
                                pTooltip="Eliminar Concepto"
                            ></button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Modal de formulario CRUD -->
        <p-dialog
            [(visible)]="showConceptoModal"
            [header]="isEditingConcepto ? 'Editar Concepto' : 'Nuevo Concepto'"
            [modal]="true"
            [style]="{width: '600px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="conceptoForm" (ngSubmit)="saveConcepto()">
                <div class="grid grid-cols-1 gap-4">
                    <!-- Campos del formulario con labels flotantes -->
                    <div>
                        <p-floatLabel variant="in">
                            <input
                                pInputText
                                formControlName="clave"
                                placeholder="Ej: CIUDAD, ESTADO, PAIS"
                                class="w-full"
                                maxlength="50"
                            />
                            <label>Clave *</label>
                        </p-floatLabel>
                    </div>

                    <div>
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                formControlName="nombre"
                                placeholder="Nombre descriptivo del concepto"
                                class="w-full"
                                maxlength="100"
                            />
                            <label>Nombre *</label>
                        </p-floatLabel>
                    </div>

                    <!-- Campo booleano -->
                    <div class="flex items-center gap-2">
                        <p-tag
                            [value]="conceptoForm.get('swestado')?.value ? 'Sí' : 'No'"
                            [severity]="conceptoForm.get('swestado')?.value ? 'success' : 'danger'"
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
                        (click)="closeConceptoForm()"
                        label="Cancelar"
                        class="p-button-text"
                    ></button>
                    <button
                        pButton
                        type="submit"
                        [label]="isEditingConcepto ? 'Actualizar' : 'Crear'"
                        [disabled]="!conceptoForm.valid || savingConcepto"
                        [loading]="savingConcepto"
                        class="p-button-success"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de confirmación de eliminación -->
        <p-dialog
            [(visible)]="showConfirmDeleteConcepto"
            header="Confirmar Eliminación"
            [modal]="true"
            [style]="{width: '400px', minHeight: '200px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <div class="flex items-center gap-4 mb-4">
                <span class="text-4xl animate-bounce">⚠️</span>
                 

                <div>
                    <h4 class="font-semibold text-xl mb-1">¿Eliminar Concepto?</h4>
                  
                    <p class="text-sm text-red-600 mt-2 font-medium">
                         Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                    pButton
                    type="button"
                    (click)="cancelDeleteConcepto()"
                    label="Cancelar"
                    class="p-button-text"
                ></button>
                <button
                    pButton
                    type="button"
                    (click)="confirmDeleteConcepto()"
                    label="Eliminar"
                    class="p-button-danger"
                    [loading]="deletingConcepto"
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
        }

        :host ::ng-deep .p-floatlabel label {
            background: white;
            padding: 0 4px;
            font-size: 0.875rem;
        }

        :host ::ng-deep .p-floatlabel input:focus + label,
        :host ::ng-deep .p-floatlabel input:not(:placeholder-shown) + label {
            color: #6366f1; /* Indigo */
        }

        /* Estilos para campos booleanos */
        :host ::ng-deep .p-tag {
            font-size: 0.875rem;
            padding: 0.25rem 0.5rem;
            font-weight: 500;
        }
    `]
})
export class BannersComponentsTabComponent implements OnInit, OnChanges {
    // Input para recibir el filtro de canal
    @Input() canalFiltro: string = '';

    // Output para comunicar la selección al componente padre
    @Output() conceptoSeleccionadoChange = new EventEmitter<Componente | null>();
    @Output() conceptoClick = new EventEmitter<Componente>();
    @Output() conceptoDobleClick = new EventEmitter<Componente>();

    // Datos
    conceptos: Componente[] = [];
    conceptoSeleccionado: Componente | null = null;

    // Estados
    loadingConceptos = false;
    savingConcepto = false;
    deletingConcepto = false;

    // Modales
    showConceptoModal = false;
    showConfirmDeleteConcepto = false;

    // Formulario
    conceptoForm!: FormGroup;
    isEditingConcepto = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Confirmación
    conceptoToDelete: Componente | null = null;

    // Control de doble click
    private lastClickTime: number = 0;
    private lastClickedConcepto: Componente | null = null;
    private readonly DOUBLE_CLICK_DELAY = 300; // ms

    // Servicios
    private componentsService = inject(CompService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);

    // ViewChild para tabla
    @ViewChild('dtConceptos') dtConceptos!: Table;

    ngOnInit(): void {
        console.log('🏷️ CatconceptosTabComponent inicializado');
        this.initializeForms();
        this.cargarConceptos();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Detectar cambios en el filtro de canal y recargar conceptos
        if (changes['canalFiltro']) {
            console.log('🔄 Filtro de canal cambió:', this.canalFiltro);
            this.cargarConceptos();
        }
    }

    // ========== INICIALIZACIÓN ==========

    initializeForms(): void {
        this.conceptoForm = this.fb.group({
            clave: ['', [Validators.required, Validators.maxLength(50)]],
            nombre: ['', [Validators.required, Validators.maxLength(100)]],
            swestado: [true]
        });
    }

    // ========== CARGA DE DATOS ==========

    cargarConceptos(): void {
        this.loadingConceptos = true;
        console.log('📊 Cargando conceptos con filtro de canal:', this.canalFiltro);

        // Si hay filtro de canal, aplicar filtro
        const filtros: any = {};
        if (this.canalFiltro) {
            filtros.canal = this.canalFiltro;
        }

        this.componentsService.getAllComponentes({ filters: filtros }).subscribe({
            next: (response) => {
                console.log('✅ Conceptos cargados:', response.data);
                this.conceptos = response.data;
                this.loadingConceptos = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Datos Actualizados',
                    detail: `${this.conceptos.length} conceptos cargados`
                });
            },
            error: (error) => {
                console.error('❌ Error cargando conceptos:', error);
                this.loadingConceptos = false;

                // Mostrar mensaje de error específico del backend
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar conceptos';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar conceptos',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    // ========== FORMULARIO CRUD ==========

    openConceptoForm(concepto?: Componente): void {
        this.isEditingConcepto = !!concepto;

        if (concepto) {
            console.log('✏️ Editando concepto:', concepto);
            this.conceptoForm.patchValue({
                clave: concepto.clave,
                nombre: concepto.nombre,
                swestado: concepto.swEnable === 1
            });
        } else {
            console.log('➕ Creando nuevo concepto');
            this.conceptoForm.reset({
                swestado: true
            });
        }

        this.showConceptoModal = true;
    }

    closeConceptoForm(): void {
        this.showConceptoModal = false;
        this.conceptoForm.reset();
        this.isEditingConcepto = false;
    }

    saveConcepto(): void {
        if (this.conceptoForm.valid) {
            this.savingConcepto = true;
            const formData = this.conceptoForm.value;

            // Convertir valores booleanos
            const processedData: CreateComponenteRequest = {
                ...formData,
                swestado: formData.swestado ? 1 : 0
            };

            if (this.isEditingConcepto && this.conceptoSeleccionado) {
                // Actualizar
                const updateData: UpdateComponenteRequest = {
                    id_comp: this.conceptoSeleccionado.id_comp,
                    ...processedData
                };

                this.componentsService.updateComponente(updateData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Concepto actualizado correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'actualizar')
                });
            } else {
                // Crear
                this.componentsService.createComponente(processedData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Concepto creado correctamente');
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

        this.closeConceptoForm();
        this.cargarConceptos();
        this.savingConcepto = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} concepto:`, error);

        let errorMessage = `Error al ${operation} el concepto`;
        if (error && error.mensaje) {
            errorMessage = error.mensaje;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });

        this.savingConcepto = false;
    }

    // ========== EDICIÓN INLINE ==========

    editInlineConcepto(concepto: Componente, field: string): void {
        this.editingCell = concepto.id_comp + '_' + field;
        this.originalValue = (concepto as any)[field];
        console.log('✏️ Editando inline:', field, 'Valor:', this.originalValue);
    }

    saveInlineEditConcepto(concepto: Componente, field: string): void {
        console.log('💾 Guardando inline:', field, 'Nuevo valor:', (concepto as any)[field]);

        if ((concepto as any)[field] === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando');
            this.cancelInlineEdit();
            return;
        }

        const updateData: UpdateComponenteRequest = {
            id_comp: concepto.id_comp,
            [field]: (concepto as any)[field]
        };

        this.componentsService.updateComponente(updateData).subscribe({
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
                console.log('🚨 ERROR HANDLER EJECUTADO - Mostrando mensaje de error');

                // Revertir el cambio local
                (concepto as any)[field] = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;

                // Mostrar mensaje de error al usuario
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar';
                console.log('📢 Mostrando mensaje de error:', errorMessage);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al actualizar',
                    detail: `${this.getFieldLabel(field)}: ${errorMessage}`,
                    life: 5000
                });

                console.log('✅ Mensaje de error enviado al MessageService');
            }
        });
    }

    cancelInlineEdit(): void {
        this.editingCell = null;
        this.originalValue = null;
    }

    // ========== TOGGLE DE CAMPOS ==========

    toggleIsUnico(componente: Componente): void {
        const nuevoValor = componente.isUnico === 1 ? 0 : 1;
        const valorAnterior = componente.isUnico;

        componente.isUnico = nuevoValor;

        this.componentsService.updateComponente({
            id_comp: componente.id_comp,
            isUnico: nuevoValor
        }).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Campo Actualizado',
                    detail: `Campo "Único" actualizado correctamente`
                });
            },
            error: (error) => {
                // Revertir cambio
                componente.isUnico = valorAnterior;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar campo "Único"',
                    life: 5000
                });
            }
        });
    }

    toggleSwEnable(componente: Componente): void {
        const nuevoValor = componente.swEnable === 1 ? 0 : 1;
        const valorAnterior = componente.swEnable;

        componente.swEnable = nuevoValor;

        this.componentsService.updateComponente({
            id_comp: componente.id_comp,
            swEnable: nuevoValor
        }).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Campo Actualizado',
                    detail: `Campo "Habilitado" actualizado correctamente`
                });
            },
            error: (error) => {
                // Revertir cambio
                componente.swEnable = valorAnterior;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar campo "Habilitado"',
                    life: 5000
                });
            }
        });
    }

    // ========== TOGGLE DE ESTADO ==========

    toggleEstadoConcepto(concepto: Componente): void {
        const nuevoEstado = concepto.swEnable === 1 ? 0 : 1;

        if (nuevoEstado === 0) {
            // Confirmar desactivación
            this.conceptoToDelete = concepto;
            this.showConfirmDeleteConcepto = true;
        } else {
            // Activar directamente
            this.procesarCambioEstado(concepto, nuevoEstado);
        }
    }

    private procesarCambioEstado(concepto: Componente, nuevoEstado: number): void {
        const estadoAnterior = concepto.swEnable;
        concepto.swEnable = nuevoEstado;

        const updateData: UpdateComponenteRequest = {
            id_comp: concepto.id_comp,
            swEnable: nuevoEstado
        };

        this.componentsService.updateComponente(updateData).subscribe({
            next: (response) => {
                console.log('✅ Estado actualizado:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado Actualizado',
                    detail: `Concepto ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local
                concepto.swEnable = estadoAnterior;

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

    eliminarConcepto(concepto: Componente): void {
        this.conceptoToDelete = concepto;
        this.showConfirmDeleteConcepto = true;
    }

    confirmDeleteConcepto(): void {
        if (this.conceptoToDelete) {
            this.deletingConcepto = true;

            this.componentsService.deleteComponente(this.conceptoToDelete.id_comp).subscribe({
                next: (response) => {
                    console.log('✅ Concepto eliminado:', response);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Concepto eliminado correctamente'
                    });

                    this.cancelDeleteConcepto();
                    this.cargarConceptos();
                },
                error: (error) => {
                    console.error('❌ Error al eliminar concepto:', error);

                    // Mostrar mensaje de error específico del backend
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar concepto';

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al eliminar concepto',
                        detail: errorMessage,
                        life: 5000
                    });

                    this.deletingConcepto = false;
                }
            });
        }
    }

    cancelDeleteConcepto(): void {
        this.showConfirmDeleteConcepto = false;
        this.conceptoToDelete = null;
        this.deletingConcepto = false;
    }

    // ========== UTILIDADES ==========


    onRowClick(concepto: Componente): void {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastClickTime;

        console.log('👆 Click en concepto:', concepto, 'timeDiff:', timeDiff);

        // Verificar si es un doble click
        if (timeDiff < this.DOUBLE_CLICK_DELAY && this.lastClickedConcepto?.id_comp === concepto.id_comp) {
            console.log('🎯 Doble click detectado!');
            this.handleDoubleClick(concepto);
        } else {
            // Click simple - seleccionar el concepto
            console.log('👆 Click simple - seleccionando concepto');
            this.conceptoSeleccionado = concepto;
            this.conceptoSeleccionadoChange.emit(concepto);
            this.conceptoClick.emit(concepto); // Nuevo evento para click simple
        }

        // Actualizar timestamps para el próximo click
        this.lastClickTime = currentTime;
        this.lastClickedConcepto = concepto;
    }

    private handleDoubleClick(concepto: Componente): void {
        console.log('🚀 Procesando doble click para concepto:', concepto);
        // Seleccionar el concepto
        this.conceptoSeleccionado = concepto;
        this.conceptoSeleccionadoChange.emit(concepto);
        // Emitir evento de doble click
        console.log('🚀 Emitiendo evento conceptoDobleClick');
        this.conceptoDobleClick.emit(concepto);
    }


    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    toggleFormField(fieldName: string): void {
        const currentValue = this.conceptoForm.get(fieldName)?.value;
        const newValue = !currentValue;
        this.conceptoForm.patchValue({ [fieldName]: newValue });
    }

    getEstadoLabel(estado: number): string {
        return estado === 1 ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: number): 'success' | 'danger' {
        return estado === 1 ? 'success' : 'danger';
    }

    private getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            'clave': 'Clave',
            'nombre': 'Nombre'
        };
        return labels[field] || field;
    }
}
