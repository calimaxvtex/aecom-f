import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios y modelos
import { CompService } from '../../../features/comp/services/comp.service';
import { Componente, CreateComponenteRequest, UpdateComponenteRequest } from '../../../features/comp/models/comp.interface';
import { CatConceptosDetService } from '../../../features/catconceptos/services/catconceptosdet.service';
import { CatConceptoDet } from '../../../features/catconceptos/models/catconceptosdet.interface';

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
        ConfirmDialogModule,
        ToastModule,
        TagModule,
        FloatLabelModule,
        TooltipModule,
        SelectModule,
        CardModule,
        ToggleSwitchModule
    ],
    providers: [MessageService, ConfirmationService],
    template: `
        <!-- Tabla CRUD -->
        <p-table
            #dtConceptos
            [value]="conceptos"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            responsiveLayout="scroll"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} componentes"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['id_comp', 'clave', 'nombre', 'descripcion', 'canal', 'tipo_comp']"
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
                        placeholder="Buscar componentes..."
                        class="w-full sm:w-80 order-1 sm:order-0"
                    />
                    <div class="flex gap-2 order-0 sm:order-1 items-end">
                        <!-- Botones de filtro por canal -->
                        <button
                            *ngFor="let canal of canalesOptions"
                            (click)="onCanalFiltroClick(canal.value)"
                            pButton
                            raised
                            [class]="canalFiltroSeleccionado === canal.value ? 'p-button-success compact-filter-button' : 'p-button-outlined compact-filter-button'"
                            [label]="canal.label"
                            pTooltip="Filtrar por {{ canal.label }}"
                        ></button>
                        
                        <!-- Separador visual -->
                        <div class="w-px bg-gray-300 mx-1"></div>
                        
                        <!-- Botones de acción -->
                        <button
                            (click)="cargarConceptos()"
                            pButton
                            raised
                            icon="pi pi-refresh"
                            [loading]="loadingConceptos"
                            pTooltip="Actualizar lista"
                        ></button>
                        <button
                            (click)="openConceptoForm()"
                            pButton
                            raised
                            icon="pi pi-plus"
                            pTooltip="Agregar componente"
                        ></button>
                    </div>
                </div>
            </ng-template>

            <!-- Headers -->
            <ng-template #header>
                <tr>
                    <th style="width: 80px">ID</th>
                    <th style="min-width: 120px">Clave</th>
                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                    <th pSortableColumn="descripcion" style="min-width: 200px">Descripción <p-sortIcon field="descripcion"></p-sortIcon></th>
                    <th style="min-width: 150px">Tipo Contenedor</th>
                    <th style="min-width: 120px">Canal</th>
                    <th style="width: 100px">Habilitado</th>
                    <th style="width: 150px">Acciones</th>
                </tr>
            </ng-template>

            <!-- Body -->
            <ng-template #body let-concepto>
                <tr
                    (click)="onRowClick(concepto)"
                    [class.bg-blue-50]="conceptoSeleccionado?.id_comp === concepto.id_comp"
                    [class.component-inactive]="concepto.swEnable === 0"
                    [class]="concepto.swEnable === 0 ? 'component-disabled hover:bg-gray-100' : 'cursor-pointer hover:bg-gray-50'"
                    class="transition-colors"
                >
                    <!-- ID -->
                    <td>{{ concepto.id_comp }}</td>

                    <!-- Clave -->
                    <td>
                        <span class="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                            {{ concepto.clave || '—' }}
                        </span>
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
                        <span
                            *ngIf="editingCell !== concepto.id_comp + '_tipo_comp'"
                            (click)="editInlineConcepto(concepto, 'tipo_comp'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ getTipoCompLabel(concepto.tipo_comp) }}
                        </span>
                        <div
                            *ngIf="editingCell === concepto.id_comp + '_tipo_comp'"
                            class="inline-edit-container"
                        >
                            <p-select
                                [(ngModel)]="concepto.tipo_comp"
                                [options]="tiposCompOptions"
                                optionLabel="label"
                                optionValue="value"
                                (onChange)="saveInlineEditConcepto(concepto, 'tipo_comp')"
                                class="flex-1"
                                style="min-width: 120px;"
                            ></p-select>
                            <button
                                pButton
                                icon="pi pi-undo"
                                (click)="cancelInlineEdit()"
                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                pTooltip="Deshacer (Escape)"
                            ></button>
                        </div>
                    </td>

                    <!-- Canal -->
                    <td class="text-center">
                        <p-tag
                            [value]="concepto.canal"
                            severity="info"
                        ></p-tag>
                    </td>


                    <!-- Habilitado -->
                    <td class="text-center">
                        <p-toggleSwitch
                            [ngModel]="getComponentToggleState(concepto)"
                            [ngModelOptions]="{standalone: true}"
                            onLabel="ACTIVO"
                            offLabel="DESACTIVADO"
                            inputId="{{concepto.id_comp}}_habilitado"
                            (ngModelChange)="onToggleSwitchChange($event, concepto)"
                            class="status-toggle"
                            pTooltip="Cambiar estado del componente"
                        ></p-toggleSwitch>
                    </td>


                    <!-- Acciones -->
                    <td (click)="$event.stopPropagation()">
                        <div class="flex gap-1">
                            <button
                                pButton
                                icon="pi pi-pencil"
                                (click)="openConceptoForm(concepto)"
                                class="p-button-sm p-button-text p-button-warning"
                                pTooltip="Editar componente"
                            ></button>
                            <button
                                pButton
                                icon="pi pi-trash"
                                (click)="eliminarConcepto(concepto)"
                                class="p-button-sm p-button-text p-button-danger"
                                pTooltip="Eliminar componente"
                            ></button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Modal de formulario CRUD -->
        <p-dialog
            [(visible)]="showConceptoModal"
            [header]="isEditingConcepto ? 'Editar Componente' : 'Nuevo Componente'"
            [modal]="true"
            [style]="{width: '700px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="conceptoForm" (ngSubmit)="saveConcepto()">
                <!-- Campos principales -->
                <div class="grid grid-cols-1 gap-4 mb-6">
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Clave -->
                        <div>
                         <div style="height: 0; margin-top: 1rem;"></div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    formControlName="clave"
                                    placeholder="Ej: BANNER, HEADER, FOOTER"
                                    class="w-full"
                                    maxlength="50"
                                    (input)="onClaveInput($event)"
                                />
                                <label>Clave </label>
                            </p-floatLabel>
                        </div>

                        <!-- Canal -->
                        <div>
                            <div style="height: 0; margin-top: 1rem;"></div>
                            <p-floatLabel variant="on">
                                <p-select
                                    formControlName="canal"
                                    [options]="canalesFormOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Seleccionar canal"
                                    class="w-full"
                                    appendTo="body"
                                    [style]="{'z-index': '9999'}"
                                ></p-select>
                            </p-floatLabel>
                        </div>
                    </div>

                    <!-- Nombre y Tipo Componente en el mismo renglón -->
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Nombre -->
                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    formControlName="nombre"
                                    placeholder="Nombre descriptivo del componente"
                                    class="w-full"
                                    maxlength="100"
                                    (input)="onNombreInput($event)"
                                />
                                <label>Nombre </label>
                            </p-floatLabel>
                        </div>

                        <!-- Tipo Componente -->
                        <div>
                            <p-floatLabel variant="on">
                                <p-select
                                    formControlName="tipo_comp"
                                    [options]="tiposCompOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Seleccionar tipo"
                                    class="w-full"
                                    appendTo="body"
                                    [style]="{'z-index': '9999'}"
                                ></p-select>
                            </p-floatLabel>
                        </div>
                    </div>

                    <!-- Descripción -->
                    <div>
                        <p-floatLabel variant="on">
                            <textarea
                                formControlName="descripcion"
                                placeholder="Descripción detallada del componente"
                                class="w-full p-inputtext"
                                rows="3"
                                maxlength="255"
                                style="resize: vertical; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                                (input)="onDescripcionInput($event)"
                            ></textarea>
                            <label>Descripción</label>
                        </p-floatLabel>
                    </div>
                </div>

                <!-- Botones de estado -->
                <div class="mb-6">
                    <div class="flex items-center justify-between">
                        <!-- Botón habilitado a la izquierda -->
                        <p-tag
                            [value]="conceptoForm.get('swEnable')?.value === 1 ? 'Habilitado' : 'Deshabilitado'"
                            [severity]="conceptoForm.get('swEnable')?.value === 1 ? 'success' : 'danger'"
                            (click)="toggleSwEnableWithConfirm()"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            pTooltip="Estado del componente"
                        ></p-tag>

                        <!-- Inputs justificados a la derecha -->
                        <div class="flex items-center gap-4">
                            <!-- Input para tiempo -->
                            <div class="flex flex-col items-center gap-1">
                                <label class="text-xs font-medium text-gray-600 text-center">Tiempo</label>
                                <input
                                    pInputText
                                    formControlName="tiempo"
                                    placeholder="T"
                                    class="w-20 h-8 text-center text-sm"
                                    maxlength="1"
                                    type="number"
                                    min="0"
                                    max="9"
                                />
                            </div>

                            <!-- Input para visibles -->
                            <div class="flex flex-col items-center gap-1">
                                <label class="text-xs font-medium text-gray-600 text-center">Visibles</label>
                                <input
                                    pInputText
                                    formControlName="visibles"
                                    placeholder="V"
                                    class="w-20 h-8 text-center text-sm"
                                    maxlength="1"
                                    type="number"
                                    min="0"
                                    max="9"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sección informativa -->
                <div *ngIf="isEditingConcepto && conceptoSeleccionado" class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="text-lg font-semibold mb-3">Información del Registro</h4>
                    <div class="text-sm">
                        <!-- Todo en el mismo renglón -->
                        <div class="flex flex-wrap gap-6">
                            <div class="flex-1 min-w-0">
                                <label class="font-medium text-gray-700">Creado por:</label>
                                <p class="text-gray-600">{{ conceptoSeleccionado.usr_a }}</p>
                            </div>
                            <div class="flex-1 min-w-0">
                                <label class="font-medium text-gray-700">Fecha creación:</label>
                                <p class="text-gray-600">{{ conceptoSeleccionado.fecha_a | date:'dd/MM/yyyy HH:mm' }}</p>
                            </div>
                            <div class="flex-1 min-w-0" *ngIf="conceptoSeleccionado.fecha_m">
                                <label class="font-medium text-gray-700">Última modificación:</label>
                                <p class="text-gray-600">{{ conceptoSeleccionado.fecha_m | date:'dd/MM/yyyy HH:mm' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
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
                        class="p-button-primary"
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
                    <h4 class="font-semibold text-xl mb-1">¿Eliminar Componente?</h4>
                  
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

        <!-- Modal de confirmación usando ConfirmationService -->
        <p-confirmDialog></p-confirmDialog>

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

        /* Estilos para botones de filtro compactos */
        :host ::ng-deep .compact-filter-button.p-button {
            padding: 0.25rem 0.5rem !important;
            min-height: 1.75rem !important;
            font-size: 0.75rem !important;
            line-height: 1.25 !important;
            border-radius: 0.25rem !important;
        }

        :host ::ng-deep .compact-filter-button.p-button .p-button-label {
            padding: 0 !important;
            margin: 0 !important;
        }

        :host ::ng-deep .compact-filter-button.p-button-success {
            background-color: #10b981 !important;
            border-color: #10b981 !important;
        }

        :host ::ng-deep .compact-filter-button.p-button-outlined {
            background-color: transparent !important;
            border-color: #d1d5db !important;
            color: #6b7280 !important;
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

        /* Estilos para el botón de estado con tamaño fijo */
        :host ::ng-deep .p-tag.status-tag {
            min-width: 110px;
            display: inline-block;
            text-align: center;
            font-weight: 600;
        }

        /* Estilos para componentes deshabilitados - gama de gris */
        .component-disabled {
            opacity: 0.75;
            background-color: rgba(156, 163, 175, 0.08);
            border-left: 3px solid #6b7280;
        }

        .component-disabled:hover {
            background-color: rgba(156, 163, 175, 0.12);
        }

        /* Estilos para filas inactivas */
        :host ::ng-deep tr.component-inactive {
            background-color: #f9fafb !important;
        }

        :host ::ng-deep tr.component-inactive:hover {
            background-color: #f3f4f6 !important;
        }

        :host ::ng-deep tr.component-inactive td {
            color: #6b7280 !important;
        }

        /* Estilos para ToggleSwitch */
   /*    :host ::ng-deep .status-toggle.p-toggleswitch {
            display: inline-block;
            vertical-align: middle;
        }
 
        :host ::ng-deep .status-toggle.p-toggleswitch:not(.p-toggleswitch-checked) .p-toggleswitch-slider {
            background-color: #e5e7eb !important;
            border-color: #d1d5db !important;
        }

        :host ::ng-deep .status-toggle.p-toggleswitch:not(.p-toggleswitch-checked) .p-toggleswitch-handle {
            background-color: #9ca3af !important;
        }
 
        :host ::ng-deep .status-toggle.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
            background-color: var(--p-primary-color) !important;
            border-color: var(--p-primary-600) !important;
        }

        :host ::ng-deep .status-toggle.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
            background-color: var(--p-primary-contrast-color) !important;
            left: 1.15rem !important;
        }*/
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
    togglingStatus = false;

    // Modales
    showConceptoModal = false;
    showConfirmDeleteConcepto = false;

    // Formulario
    conceptoForm!: FormGroup;
    isEditingConcepto = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Control de estado temporal del ToggleSwitch
    toggleStates: { [key: string]: boolean } = {};

    // Confirmación
    conceptoToDelete: Componente | null = null;


    // Filtro por canal
    canalFiltroSeleccionado: string = '';
    canalesOptions: { label: string; value: string }[] = [];
    canalesFormOptions: { label: string; value: string }[] = [];

    // Tipos de componente
    tiposCompOptions: { label: string; value: string }[] = [];

    // Control de doble click
    private lastClickTime: number = 0;
    private lastClickedConcepto: Componente | null = null;
    private readonly DOUBLE_CLICK_DELAY = 300; // ms

    // Servicios
    private componentsService = inject(CompService);
    private catConceptosDetService = inject(CatConceptosDetService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);

    // ViewChild para tabla
    @ViewChild('dtConceptos') dtConceptos!: Table;

    ngOnInit(): void {
        this.initializeForms();
        this.cargarOpcionesCatalogo();
        this.cargarConceptos();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Detectar cambios en el filtro de canal del padre y recargar componentes
        if (changes['canalFiltro']) {
            this.cargarConceptos();
        }
    }

    // ========== INICIALIZACIÓN ==========

    initializeForms(): void {
        this.conceptoForm = this.fb.group({
            clave: ['', [Validators.required, Validators.maxLength(50)]],
            nombre: ['', [Validators.required, Validators.maxLength(100)]],
            descripcion: ['', [Validators.maxLength(255)]],
            canal: ['', [Validators.required]],
            tipo_comp: ['', [Validators.required]],
            swEnable: [1],
            tiempo: [4, [Validators.required, Validators.min(0), Validators.max(9)]],
            visibles: [8, [Validators.required, Validators.min(0), Validators.max(9)]]
        });
    }

    // ========== CARGA DE DATOS ==========

    cargarConceptos(): void {
        this.loadingConceptos = true;

        // Aplicar filtro de canal si está seleccionado
        const filtros: any = {};
        if (this.canalFiltroSeleccionado) {
            filtros.canal = this.canalFiltroSeleccionado;
        }

        this.componentsService.getAllComponentes({ filters: filtros }).subscribe({
            next: (response) => {
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
        this.conceptoSeleccionado = concepto || null;

        if (concepto) {
            // Modo edición
            this.conceptoForm.patchValue({
                clave: concepto.clave,
                nombre: concepto.nombre,
                descripcion: concepto.descripcion,
                canal: concepto.canal,
                tipo_comp: concepto.tipo_comp,
                swEnable: concepto.swEnable,
                tiempo: Number(concepto.tiempo) || 4,
                visibles: Number(concepto.visibles) || 8
            });
        } else {
            // Modo creación
            this.conceptoForm.reset({
                swEnable: 1,
                tiempo: 4,
                visibles: 8
            });
        }

        this.showConceptoModal = true;
    }

    closeConceptoForm(): void {
        this.showConceptoModal = false;
        this.conceptoForm.reset();
        this.isEditingConcepto = false;
        this.conceptoSeleccionado = null;
    }

    saveConcepto(): void {
        if (this.conceptoForm.valid) {
            this.savingConcepto = true;
            const formData = this.conceptoForm.value;

            // Asegurar que tiempo y visibles sean números
            const processedData: CreateComponenteRequest = {
                ...formData,
                tiempo: Number(formData.tiempo) || 4,
                visibles: Number(formData.visibles) || 8
            };

            if (this.isEditingConcepto && this.conceptoSeleccionado) {
                // Actualizar componente existente
                const updateData: UpdateComponenteRequest = {
                    id_comp: this.conceptoSeleccionado.id_comp,
                    ...processedData
                };

                this.componentsService.updateComponente(updateData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Concepto actualizado correctamente');
                    },
                    error: (error) => {
                        this.handleSaveError(error, 'actualizar');
                    }
                });
            } else {
                // Crear nuevo componente
                this.componentsService.createComponente(processedData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Concepto creado correctamente');
                    },
                    error: (error) => {
                        this.handleSaveError(error, 'crear');
                    }
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
        console.log('🔄 RECARGANDO LISTA después del guardado exitoso...');
        this.cargarConceptos();
        this.savingConcepto = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} concepto:`, error);
        console.log('🔍 Detalles del error:', {
            error,
            message: error?.message,
            status: error?.status,
            statusText: error?.statusText,
            errorObject: error?.error,
            respuestaCompleta: (error as any)?.respuestaCompleta
        });

        // Si hay respuesta completa del backend, mostrarla
        if ((error as any)?.respuestaCompleta) {
            console.log('📋 === RESPUESTA COMPLETA DEL BACKEND ===');
            console.log('📋 Respuesta del backend:', JSON.stringify((error as any).respuestaCompleta, null, 2));
            console.log('📋 === FIN RESPUESTA COMPLETA ===');
        }

        let errorMessage = `Error al ${operation} el concepto`;

        // Manejar diferentes tipos de errores
        if ((error as any)?.mensaje) {
            // Error personalizado del servicio con propiedad mensaje
            errorMessage = (error as any).mensaje;
            console.log('🎯 Error detectado por propiedad .mensaje:', errorMessage);
        } else if ((error as any)?.statuscode) {
            // Error personalizado del servicio con statuscode
            errorMessage = (error as any).mensaje || `Error del servidor (${(error as any).statuscode})`;
            console.log('🎯 Error detectado por propiedad .statuscode:', errorMessage);
        } else if (error?.message) {
            // Error de JavaScript estándar
            errorMessage = error.message;
            console.log('🎯 Error detectado por .message estándar:', errorMessage);
        } else if (error?.error?.mensaje) {
            // Error del backend en error.error.mensaje (HTTP error)
            errorMessage = error.error.mensaje;
            console.log('🎯 Error detectado por error.error.mensaje:', errorMessage);
        } else if (error?.mensaje) {
            // Error directo del backend
            errorMessage = error.mensaje;
            console.log('🎯 Error detectado por .mensaje directo:', errorMessage);
        } else if (error?.status && error?.status !== 200) {
            // Error HTTP con status code
            errorMessage = `Error del servidor (${error.status}): ${error.statusText || 'Sin detalles'}`;
            console.log('🎯 Error detectado por status HTTP:', errorMessage);
        } else {
            // Error desconocido
            errorMessage = 'Error desconocido al procesar la solicitud';
            console.log('🎯 Error desconocido:', error);
        }

        console.log('📢 Mensaje de error que se mostrará:', errorMessage);

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

        // Aplicar formateo según el campo
        let formattedValue = (concepto as any)[field];
        if (field === 'nombre' || field === 'descripcion') {
            formattedValue = this.toPascalCase(formattedValue);
            (concepto as any)[field] = formattedValue;
        }

        // Convertir a número para campos numéricos
        if (field === 'tiempo' || field === 'visibles') {
            formattedValue = Number(formattedValue) || (field === 'tiempo' ? 4 : 8);
            (concepto as any)[field] = formattedValue;
        }

        const updateData: UpdateComponenteRequest = {
            id_comp: concepto.id_comp,
            [field]: formattedValue
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


    onComponentStatusClick(componente: Componente, event: Event): void {
        console.log('🖱️ onComponentStatusClick - Evento clic detectado');
        console.log('🖱️ onComponentStatusClick - Componente:', componente);
        console.log('🖱️ onComponentStatusClick - swEnable:', componente.swEnable);

        event.stopPropagation();
        // Simular el cambio del ToggleSwitch para mostrar confirmación
        const nuevoValor = componente.swEnable === 1 ? false : true;
        this.onToggleSwitchChange(nuevoValor, componente);
    }

    getComponentToggleState(componente: Componente): boolean {
        // Usar el estado temporal si existe, sino usar el estado real
        const tempState = this.toggleStates[componente.id_comp];
        return tempState !== undefined ? tempState : componente.swEnable === 1;
    }

    onToggleSwitchChange(isChecked: boolean, componente: Componente): void {
        console.log('🔄 onToggleSwitchChange - Componente:', componente);
        console.log('🔄 onToggleSwitchChange - isChecked:', isChecked);
        console.log('🔄 onToggleSwitchChange - Estado actual:', componente.swEnable);

        const valorActual = componente.swEnable;
        const nuevoValor = isChecked ? 1 : 0;

        // Si el valor no cambió, no hacer nada
        if (nuevoValor === valorActual) {
            return;
        }

        // Para activación (pasar de 0 a 1), hacer el cambio directamente
        if (nuevoValor === 1) {
            this.procesarCambioEstadoDirecto(componente, 1);
            return;
        }

        // Para desactivación (pasar de 1 a 0), mostrar confirmación
        // Establecer estado temporal para mostrar el cambio visual
        this.toggleStates[componente.id_comp] = false;

        this.confirmationService.confirm({
            message: `¿Está seguro de que desea deshabilitar el componente "${componente.nombre}"?`,
            header: 'Confirmar Desactivación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Deshabilitar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                // Limpiar estado temporal y procesar el cambio
                delete this.toggleStates[componente.id_comp];
                this.procesarCambioEstadoDirecto(componente, 0);
            },
            reject: () => {
                // Revertir el estado temporal al estado original
                delete this.toggleStates[componente.id_comp];
                console.log('❌ Usuario canceló la desactivación');
            }
        });
    }

    private procesarCambioEstadoDirecto(componente: Componente, nuevoValor: number): void {
        const valorAnterior = componente.swEnable;

        // Aplicar el cambio optimista
        componente.swEnable = nuevoValor;

        // Mostrar loading state
        this.togglingStatus = true;

        this.componentsService.updateComponente({
            id_comp: componente.id_comp,
            swEnable: nuevoValor
        }).subscribe({
            next: (response) => {
                this.togglingStatus = false;
                console.log('✅ Estado actualizado exitosamente:', response);

                const estadoTexto = nuevoValor === 1 ? 'ACTIVO' : 'DESACTIVADO';
                const icono = nuevoValor === 1 ? '✅' : '🚫';

                this.messageService.add({
                    severity: nuevoValor === 1 ? 'success' : 'warn',
                    summary: `Componente ${estadoTexto}`,
                    detail: `${icono} El componente "${componente.nombre}" ha sido ${estadoTexto.toLowerCase()} correctamente`,
                    life: 4000
                });
            },
            error: (error) => {
                this.togglingStatus = false;
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local en caso de error
                componente.swEnable = valorAnterior;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cambiar estado',
                    detail: `No se pudo cambiar el estado del componente "${componente.nombre}". Se revirtió el cambio.`,
                    life: 6000
                });
            }
        });
    }



    /**
     * Verificación robusta del estado del componente
     */
    private isComponentActive(swEnable: any): boolean {
        // Manejar diferentes tipos de valores
        if (typeof swEnable === 'boolean') {
            return swEnable;
        }
        if (typeof swEnable === 'string') {
            return swEnable === '1' || swEnable.toLowerCase() === 'true';
        }
        if (typeof swEnable === 'number') {
            return swEnable === 1;
        }
        // Valor por defecto: considerar inactivo
        console.warn('⚠️ isComponentActive - Valor swEnable desconocido:', swEnable, typeof swEnable);
        return false;
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
        const newValue = currentValue === 1 ? 0 : 1;
        this.conceptoForm.patchValue({ [fieldName]: newValue });
    }

    toggleSwEnableWithConfirm(): void {
        const currentValue = this.conceptoForm.get('swEnable')?.value;
        const newValue = currentValue === 1 ? 0 : 1;

        // Si se está activando (de 0 a 1), hacer el cambio directamente
        if (newValue === 1) {
            this.toggleFormField('swEnable');
            return;
        }

        // Si se está desactivando (de 1 a 0), mostrar confirmación
        this.confirmationService.confirm({
            message: `¿Está seguro de que desea deshabilitar este componente?`,
            header: 'Confirmar Desactivación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Deshabilitar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                // Solo aquí se ejecuta el cambio después de la confirmación
                this.toggleFormField('swEnable');
            },
            reject: () => {
                console.log('❌ Usuario canceló la desactivación del componente');
            }
        });
    }

    // ========== MÉTODOS DE CATÁLOGO ==========

    cargarOpcionesCatalogo(): void {
        console.log('📊 Cargando opciones de catálogo');
        this.cargarCanalesOptions();
        this.cargarTiposCompOptions();
    }

    private cargarCanalesOptions(): void {
        this.catConceptosDetService.queryDetalles({
            clave: 'TIPOCANAL',
            swestado: 1
        }).subscribe({
            next: (response) => {
                const options = response.data.map(item => ({
                    label: item.descripcion,
                    value: item.valorcadena1 || item.descripcion
                }));

                this.canalesOptions = options;
                this.canalesFormOptions = options;

                // Buscar la opción de "app" para establecerla como filtro por defecto
                const appOption = this.canalesOptions.find(option => 
                    option.label.toLowerCase().includes('app') || 
                    option.value.toLowerCase().includes('app')
                );
                
                if (appOption) {
                    // Establecer app como filtro por defecto
                    this.canalFiltroSeleccionado = appOption.value;
                    console.log('🎯 Filtro de canal por defecto establecido:', appOption.label, 'con valor:', appOption.value);
                    console.log('🎯 canalFiltroSeleccionado establecido como:', this.canalFiltroSeleccionado);
                }

                console.log('📊 Opciones de canal cargadas:', this.canalesOptions);
                
                // Cargar conceptos con el filtro por defecto aplicado
                this.cargarConceptos();
            },
            error: (error) => {
                console.error('❌ Error cargando opciones de canal:', error);
                this.canalesOptions = [];
                this.canalesFormOptions = [];
            }
        });
    }

    private cargarTiposCompOptions(): void {
        this.catConceptosDetService.queryDetalles({
            clave: 'TIPOCOMP',
            swestado: 1
        }).subscribe({
            next: (response) => {
                this.tiposCompOptions = response.data.map(item => ({
                    label: item.descripcion,
                    value: item.valorcadena1 || item.descripcion
                }));
                console.log('📊 Opciones de tipos de componente cargadas:', this.tiposCompOptions);
            },
            error: (error) => {
                console.error('❌ Error cargando tipos de componente:', error);
                this.tiposCompOptions = [];
            }
        });
    }

    // ========== FILTRO DE CANAL ==========

    onCanalFiltroClick(canalValue: string): void {
        console.log('🔄 Filtro de canal cambió:', canalValue);
        // Si ya está seleccionado, deseleccionar (mostrar todos)
        if (this.canalFiltroSeleccionado === canalValue) {
            this.canalFiltroSeleccionado = '';
        } else {
            this.canalFiltroSeleccionado = canalValue;
        }
        this.cargarConceptos();
    }


    // ========== UTILIDADES ==========

    onClaveInput(event: any): void {
        const input = event.target;
        const upperValue = input.value.toUpperCase();
        input.value = upperValue;
        this.conceptoForm.patchValue({ clave: upperValue });
    }

    onNombreInput(event: any): void {
        const input = event.target;
        const pascalCaseValue = this.toPascalCase(input.value);
        input.value = pascalCaseValue;
        this.conceptoForm.patchValue({ nombre: pascalCaseValue });
    }

    onDescripcionInput(event: any): void {
        const input = event.target;
        const pascalCaseValue = this.toPascalCase(input.value);
        input.value = pascalCaseValue;
        this.conceptoForm.patchValue({ descripcion: pascalCaseValue });
    }

    private toPascalCase(text: string): string {
        if (!text || typeof text !== 'string') {
            return '';
        }

        // Separar por espacios, guiones o guiones bajos
        const words = text.split(/[\s\-_]+/);

        // Convertir cada palabra: primera letra mayúscula, resto minúscula
        const pascalCaseWords = words.map(word => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });

        return pascalCaseWords.join(' ');
    }

    getTipoCompLabel(tipoComp: string): string {
        const tipo = this.tiposCompOptions.find(t => t.value === tipoComp);
        return tipo ? tipo.label : tipoComp;
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

    // ========== MÉTODOS DE DIAGNÓSTICO ==========

    /**
     * Método de diagnóstico para verificar el estado del componente
     * Se puede llamar desde la consola del navegador
     */
    public diagnosticComponentesUpdate(): void {
        console.log('🔍 === DIAGNÓSTICO DE COMPONENTES UPDATE ===');
        console.log('📊 isEditingConcepto:', this.isEditingConcepto);
        console.log('📊 conceptoSeleccionado:', this.conceptoSeleccionado);
        console.log('📊 conceptoSeleccionado?.id_comp:', this.conceptoSeleccionado?.id_comp);
        console.log('📊 conceptoSeleccionado?.id_comp tipo:', typeof this.conceptoSeleccionado?.id_comp);
        console.log('📊 Formulario válido:', this.conceptoForm?.valid);
        console.log('📊 Formulario valor:', this.conceptoForm?.value);
        console.log('📊 showConceptoModal:', this.showConceptoModal);
        console.log('📊 savingConcepto:', this.savingConcepto);
        console.log('🔍 === FIN DIAGNÓSTICO ===');
    }
}
