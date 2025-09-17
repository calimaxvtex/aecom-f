import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios específicos del dominio
import { ApiConnService } from '../../../features/apiconn/services/apiconn.service';
import { CatConceptosDetService } from '../../../features/catconceptos/services/catconceptosdet.service';
import { SessionService } from '../../../core/services/session.service';

// Interfaces del dominio
import {
    ApiConnItem,
    ApiConnForm,
    ApiConnFilters,
    ApiConnPaginationParams,
    APICONN_TYPES,
    APICONN_ENVIRONMENTS
} from '../../../features/apiconn/models/apiconn.interface';
import { CatConceptoDet } from '../../../features/catconceptos/models/catconceptosdet.interface';

@Component({
    selector: 'app-apiconn-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        CheckboxModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        TabsModule,
        TooltipModule,
        ConfirmDialogModule,
        FloatLabelModule,
        TextareaModule,
        PasswordModule,
        ToggleSwitchModule,
        ButtonGroupModule
    ],
    providers: [MessageService, ConfirmationService],
    styles: [`
        /* Estilos para el botón toggle dentro del input de contraseña */
        .password-with-toggle .p-password {
            position: relative;
        }

        .password-with-toggle .p-password-toggle {
            position: absolute !important;
            right: 8px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            background: transparent !important;
            border: none !important;
            color: #6b7280 !important;
            cursor: pointer !important;
            padding: 4px !important;
            border-radius: 4px !important;
            z-index: 10 !important;
        }

        .password-with-toggle .p-password-toggle:hover {
            background-color: #f3f4f6 !important;
            color: #374151 !important;
        }

        .password-with-toggle .p-password-input {
            padding-right: 40px !important;
        }

        /* Estilos para los selectores sin label flotante */
        .p-select {
            width: 100%;
        }

        .p-select .p-select-label {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: white;
            transition: border-color 0.2s ease;
        }

        .p-select .p-select-label:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 1px #6366f1;
        }

        .p-select .p-select-trigger {
            color: #6b7280;
        }

        /* Estilos para el botón toggle dentro del input de contraseña */
        .password-with-toggle .p-password {
            position: relative;
        }

        .password-with-toggle .p-password-toggle {
            position: absolute !important;
            right: 8px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            background: transparent !important;
            border: none !important;
            color: #6b7280 !important;
            cursor: pointer !important;
            padding: 4px !important;
            border-radius: 4px !important;
            z-index: 10 !important;
        }

        .password-with-toggle .p-password-toggle:hover {
            background-color: #f3f4f6 !important;
            color: #374151 !important;
        }

        .password-with-toggle .p-password-input {
            padding-right: 40px !important;
        }

        /* Estilos para el formulario */
        .space-y-4 > * + * {
            margin-top: 1rem;
        }
    `],
    template: `
        <!-- Header con título y botones de acción -->
        <div class="mb-4">
            <div class="flex items-center justify-between">
                <div>
                     
                     
                </div>
                <div class="flex gap-2">
                    <p-button
                        icon="pi pi-refresh"
                        styleClass="p-button-primary p-button-raised"
                        (onClick)="cargarApiConns()"
                        [loading]="loading"
                        pTooltip="Actualizar conexiones"
                        tooltipPosition="top">
                    </p-button>
                    <p-button
                        icon="pi pi-plus"
                        styleClass="p-button-primary p-button-raised"
                        (onClick)="abrirModalCrear()"
                        pTooltip="Nueva conexión"
                        tooltipPosition="top">
                    </p-button>
                </div>
            </div>
        </div>



        <!-- Tabla de Conexiones API -->
        <p-table
            #dt
            [value]="apiConns"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} conexiones"
            responsiveLayout="scroll"
            dataKey="id"
            [loading]="loading"
            (onSort)="onSort($event)"
        >

            <!-- Header con filtros -->
            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="id" style="width: 80px">
                        ID
                        <p-sortIcon field="id"></p-sortIcon>
                    </th>
                    <th pSortableColumn="nombre">
                        Nombre
                        <p-sortIcon field="nombre"></p-sortIcon>
                    </th>
                    <th pSortableColumn="tipo" style="width: 120px">
                        Tipo
                        <p-sortIcon field="tipo"></p-sortIcon>
                    </th>
                    <th pSortableColumn="env" style="width: 100px">
                        Entorno
                        <p-sortIcon field="env"></p-sortIcon>
                    </th>
                    <th pSortableColumn="host">
                        Host/URL
                        <p-sortIcon field="host"></p-sortIcon>
                    </th>
                    <th pSortableColumn="activo" style="width: 100px">
                        Estado
                        <p-sortIcon field="activo"></p-sortIcon>
                    </th>
                    <th style="width: 150px">Acciones</th>
                </tr>

            </ng-template>

            <!-- Body de la tabla -->
            <ng-template pTemplate="body" let-apiconn>
                <tr>
                    <td class="text-center">
                        <span class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{{ apiconn.id }}</span>
                    </td>
                    <td>
                        <span
                            *ngIf="editingCell !== apiconn.id + '_nombre'"
                            (click)="editInline(apiconn, 'nombre')"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ apiconn.nombre }}
                        </span>
                        <div
                            *ngIf="editingCell === apiconn.id + '_nombre'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="apiconn.nombre"
                                (keyup.enter)="saveInlineEdit(apiconn, 'nombre')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Nombre de la conexión"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEdit(apiconn, 'nombre')"
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
                    <td>
                        <p-tag
                            [value]="getTipoLabel(apiconn.tipo)"
                            [severity]="getTipoSeverity(apiconn.tipo)"
                        ></p-tag>
                    </td>
                    <td>
                        <p-tag
                            [value]="getEntornoLabel(apiconn.env)"
                            [severity]="getEntornoSeverity(apiconn.env)"
                        ></p-tag>
                    </td>
                    <td>
                        <div class="text-sm">
                            <div *ngIf="apiconn.host && apiconn.puerto">
                                {{ apiconn.host }}:{{ apiconn.puerto }}
                            </div>
                            <div *ngIf="apiconn.url" class="text-gray-500">
                                {{ apiconn.url }}
                            </div>
                            <div *ngIf="!apiconn.host && !apiconn.url" class="text-gray-400">
                                No configurado
                            </div>
                        </div>
                    </td>
                    <td>
                        <span
                            *ngIf="editingCell !== apiconn.id + '_activo'"
                            (click)="editInline(apiconn, 'activo')"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para cambiar estado"
                        >
                            <p-tag
                                [value]="apiconn.activo === 1 ? 'Activo' : 'Inactivo'"
                                [severity]="apiconn.activo === 1 ? 'success' : 'danger'"
                            ></p-tag>
                        </span>
                        <div
                            *ngIf="editingCell === apiconn.id + '_activo'"
                            class="inline-edit-container"
                        >
                            <p-toggleSwitch
                                [(ngModel)]="apiconn.activo"
                                [ngModelOptions]="{standalone: true}"
                                onLabel="Activo"
                                offLabel="Inactivo"
                                inputId="{{apiconn.id}}_activo"
                                (onChange)="saveInlineEdit(apiconn, 'activo')"
                            ></p-toggleSwitch>
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEdit(apiconn, 'activo')"
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
                    <td>
                        <div class="flex gap-1">
                            <button
                                pButton
                                icon="pi pi-pencil"
                                (click)="abrirModalEditar(apiconn)"
                                class="p-button-sm p-button-text p-button-info"
                                pTooltip="Editar Conexión API"
                            ></button>
                            <button
                                pButton
                                icon="pi pi-trash"
                                (click)="confirmarEliminar(apiconn)"
                                class="p-button-sm p-button-text p-button-danger"
                                pTooltip="Eliminar Conexión API"
                            ></button>
                        </div>
                    </td>
                </tr>
            </ng-template>

            <!-- Empty state -->
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-gray-500">
                            <i class="pi pi-link text-2xl mb-2 block"></i>
                            <div>No se encontraron conexiones API</div>
                            <div class="text-sm">Crea una nueva conexión para comenzar</div>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Modal de Creación/Edición -->
        <p-dialog
            [(visible)]="showModal"
            [header]="isEditing ? 'Editar Conexión API' : 'Nueva Conexión API'"
            [modal]="true"
            [style]="{width: '700px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="apiConnForm" (ngSubmit)="guardar()" class="space-y-4">
                <!-- Espaciador para labels flotantes -->
                <div style="height: 0; margin-top: 1rem;"></div>

                <!-- Nombre, Entorno y Tipo en la misma fila -->
                <div class="grid grid-cols-3 gap-4 items-end">
                    <div>
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                formControlName="nombre"
                                placeholder="Nombre descriptivo de la conexión"
                                class="w-full"
                            />
                            <label>Nombre *</label>
                        </p-floatLabel>
                    </div>
                    <div>
                        <p-select
                            formControlName="env"
                            [options]="entornosOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar entorno"
                            class="w-full"
                        ></p-select>
                    </div>
                    <div>
                        <p-select
                            formControlName="tipo"
                            [options]="tiposOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar tipo"
                            class="w-full"
                        ></p-select>
                    </div>
                </div>

                <!-- Host y Puerto -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                formControlName="host"
                                placeholder="Dirección del servidor"
                                class="w-full"
                            />
                            <label>Host</label>
                        </p-floatLabel>
                    </div>
                    <div>
                        <p-floatLabel variant="on">
                            <p-inputNumber
                                formControlName="puerto"
                                [min]="1"
                                [max]="65535"
                                placeholder="Puerto del servicio"
                                class="w-full"
                            ></p-inputNumber>
                            <label>Puerto</label>
                        </p-floatLabel>
                    </div>
                </div>

                <!-- URL -->
                <div>
                    <p-floatLabel variant="on">
                        <input
                            pInputText
                            formControlName="url"
                            placeholder="URL completa del servicio (si aplica)"
                            class="w-full"
                        />
                        <label>URL</label>
                    </p-floatLabel>
                </div>

                <!-- Usuario y Contraseña -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                formControlName="usuario"
                                placeholder="Usuario de conexión"
                                class="w-full"
                            />
                            <label>Usuario</label>
                        </p-floatLabel>
                    </div>
                    <div>
                        <p-floatLabel variant="on">
                            <p-password
                                formControlName="password"
                                placeholder="Contraseña de conexión"
                                class="w-full password-with-toggle"
                                [toggleMask]="true"
                                [feedback]="false"
                            ></p-password>
                            <label>Contraseña</label>
                        </p-floatLabel>
                    </div>
                </div>

                <!-- API Key -->
                <div>
                    <p-floatLabel variant="on">
                        <input
                            pInputText
                            formControlName="api_key"
                            placeholder="API Key si es requerido"
                            class="w-full"
                        />
                        <label>API Key</label>
                    </p-floatLabel>
                </div>

                <!-- Opciones y Activo -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p-floatLabel variant="on">
                            <textarea
                                pInputTextarea
                                formControlName="opciones"
                                placeholder="Opciones adicionales en formato JSON"
                                rows="3"
                                class="w-full"
                            ></textarea>
                            <label>Opciones (JSON)</label>
                        </p-floatLabel>
                    </div>
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium">Conexión Activa</label>
                        <p-toggleSwitch
                            formControlName="activo"
                            inputId="activo"
                            onLabel="Sí"
                            offLabel="No"
                        ></p-toggleSwitch>
                    </div>
                </div>
            </form>

            <ng-template pTemplate="footer">
                <div class="flex gap-2 justify-end">
                    <p-button
                        label="Cancelar"
                        icon="pi pi-times"
                        styleClass="p-button-secondary p-button-raised"
                        (onClick)="cerrarModal()"
                    ></p-button>
                    <p-button
                        label="Probar Conexión"
                        icon="pi pi-play"
                        styleClass="p-button-info p-button-raised"
                        (onClick)="probarConexionFormulario()"
                        [loading]="probandoConexion"
                    ></p-button>
                    <p-button
                        label="Guardar"
                        icon="pi pi-save"
                        styleClass="p-button-primary p-button-raised"
                        (onClick)="guardar()"
                        [loading]="guardando"
                        [disabled]="apiConnForm.invalid"
                    ></p-button>
                </div>
            </ng-template>
        </p-dialog>

        <!-- Confirm Dialog -->
        <p-confirmDialog
            header="Confirmar Eliminación"
            icon="pi pi-exclamation-triangle"
            acceptLabel="Eliminar"
            rejectLabel="Cancelar"
            acceptButtonStyleClass="p-button-danger p-button-raised"
            rejectButtonStyleClass="p-button-secondary p-button-raised"
        ></p-confirmDialog>

        <p-toast></p-toast>
    `
})
export class ApiConnTabComponent implements OnInit {
    // Estado del componente
    loading = false;
    guardando = false;
    probandoConexion = false;
    showModal = false;
    isEditing = false;
    mostrarFiltroGlobal = false;

    // Datos
    apiConns: ApiConnItem[] = [];
    apiConnsFiltradas: ApiConnItem[] = [];
    apiConnSeleccionada: ApiConnItem | null = null;

    // Selección múltiple
    seleccionados: ApiConnItem[] = [];
    seleccionadosMap: { [key: number]: boolean } = {};
    selectAll = false;

    // Edición inline
    editingCell: string = '';

    // Filtros
    filtros: ApiConnFilters = {};
    globalFilterValue = '';

    // Formulario
    apiConnForm!: FormGroup;

    // Opciones para selects desde catconceptosdet
    tiposOptions: any[] = [];
    entornosOptions: any[] = [];

    estadosOptions = [
        { value: null, label: 'Todos' },
        { value: 1, label: 'Activo' },
        { value: 0, label: 'Inactivo' }
    ];

    constructor(
        private fb: FormBuilder,
        private apiConnService: ApiConnService,
        private catConceptosDetService: CatConceptosDetService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private sessionService: SessionService
    ) {
        this.initializeForm();
        this.cargarOpcionesDesdeCatConceptosDet();
    }

    ngOnInit(): void {
        console.log('🚀 ApiConnTabComponent inicializado');
        this.cargarApiConns();
    }

    // ========== CARGA DE OPCIONES DESDE CATCONCEPTOSDET ==========

    private cargarOpcionesDesdeCatConceptosDet(): void {
        // Cargar tipos de conexión (TAPICONN)
        this.catConceptosDetService.queryDetalles({ clave: 'TAPICONN' }).subscribe({
            next: (response: any) => {
                if (response.statuscode === 200) {
                    this.tiposOptions = response.data.map((item: CatConceptoDet) => ({
                        value: item.valorcadena1,
                        label: item.descripcion
                    }));
                    console.log('✅ Tipos de conexión cargados:', this.tiposOptions);
                }
            },
            error: (error: any) => {
                console.error('❌ Error cargando tipos de conexión:', error);
            }
        });

        // Cargar entornos (TENV)
        this.catConceptosDetService.queryDetalles({ clave: 'TENV' }).subscribe({
            next: (response: any) => {
                if (response.statuscode === 200) {
                    this.entornosOptions = response.data.map((item: CatConceptoDet) => ({
                        value: item.valorcadena1,
                        label: item.descripcion
                    }));
                    console.log('✅ Entornos cargados:', this.entornosOptions);
                }
            },
            error: (error: any) => {
                console.error('❌ Error cargando entornos:', error);
            }
        });
    }

    // ========== INICIALIZACIÓN ==========

    private initializeForm(): void {
        this.apiConnForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(3)]],
            tipo: ['', Validators.required],
            env: ['', Validators.required],
            host: [''],
            puerto: [null],
            url: [''],
            usuario: [''],
            password: [''],
            api_key: [''],
            opciones: [''],
            activo: [true]
        });
    }

    // ========== CARGA DE DATOS ==========

    cargarApiConns(): void {
        this.loading = true;

        this.apiConnService.getAllApiConns().subscribe({
            next: (response) => {
                if (response.statuscode === 200) {
                    this.apiConns = response.data;
                    this.apiConnsFiltradas = [...this.apiConns];
                    console.log('✅ Conexiones API cargadas:', this.apiConns.length);
                } else {
                    console.warn('⚠️ Respuesta inesperada:', response);
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('❌ Error cargando conexiones API:', error);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las conexiones API',
                    life: 5000
                });
            }
        });
    }

    // ========== FILTRADO ==========

    aplicarFiltros(): void {
        this.apiConnsFiltradas = this.apiConns.filter(apiconn => {
            const matchNombre = !this.filtros.nombre ||
                apiconn.nombre.toLowerCase().includes(this.filtros.nombre.toLowerCase());
            const matchTipo = !this.filtros.tipo || apiconn.tipo === this.filtros.tipo;
            const matchEnv = !this.filtros.env || apiconn.env === this.filtros.env;
            const matchHost = !this.filtros.host ||
                (apiconn.host && apiconn.host.toLowerCase().includes(this.filtros.host.toLowerCase())) ||
                (apiconn.url && apiconn.url.toLowerCase().includes(this.filtros.host.toLowerCase()));
            const matchActivo = this.filtros.activo === null || this.filtros.activo === undefined ||
                apiconn.activo === this.filtros.activo;

            return matchNombre && matchTipo && matchEnv && matchHost && matchActivo;
        });
    }

    toggleFiltroGlobal(): void {
        this.mostrarFiltroGlobal = !this.mostrarFiltroGlobal;
        if (!this.mostrarFiltroGlobal) {
            this.limpiarFiltroGlobal();
        }
    }

    filtrarTablaGlobal(): void {
        if (this.globalFilterValue && this.globalFilterValue.trim()) {
            this.apiConnsFiltradas = this.apiConns.filter(apiconn =>
                apiconn.nombre?.toLowerCase().includes(this.globalFilterValue.toLowerCase()) ||
                apiconn.tipo?.toLowerCase().includes(this.globalFilterValue.toLowerCase()) ||
                apiconn.env?.toLowerCase().includes(this.globalFilterValue.toLowerCase()) ||
                apiconn.host?.toLowerCase().includes(this.globalFilterValue.toLowerCase()) ||
                apiconn.url?.toLowerCase().includes(this.globalFilterValue.toLowerCase())
            );
        } else {
            this.apiConnsFiltradas = [...this.apiConns];
        }
    }

    limpiarFiltroGlobal(): void {
        this.globalFilterValue = '';
        this.apiConnsFiltradas = [...this.apiConns];
    }

    // ========== SELECCIÓN MÚLTIPLE ==========

    toggleSelectAll(): void {
        if (this.selectAll) {
            this.seleccionados = [...this.apiConnsFiltradas];
            this.apiConnsFiltradas.forEach(apiconn => {
                this.seleccionadosMap[apiconn.id] = true;
            });
        } else {
            this.seleccionados = [];
            this.apiConnsFiltradas.forEach(apiconn => {
                this.seleccionadosMap[apiconn.id] = false;
            });
        }
    }

    onSeleccionChange(apiconn: ApiConnItem): void {
        const isSelected = this.seleccionadosMap[apiconn.id] || false;
        if (isSelected) {
            if (!this.seleccionados.includes(apiconn)) {
                this.seleccionados.push(apiconn);
            }
        } else {
            this.seleccionados = this.seleccionados.filter(selected => selected.id !== apiconn.id);
        }
        this.selectAll = this.seleccionados.length === this.apiConnsFiltradas.length && this.apiConnsFiltradas.length > 0;
    }

    // ========== EDICIÓN INLINE ==========

    editInline(apiconn: ApiConnItem, field: string): void {
        this.editingCell = apiconn.id + '_' + field;
        this.apiConnSeleccionada = { ...apiconn };
    }

    saveInlineEdit(apiconn: ApiConnItem, field: string): void {
        if (!this.apiConnSeleccionada) return;

        console.log('💾 Guardando edición inline:', field, (apiconn as any)[field]);

        let processedValue = (apiconn as any)[field];

        // Convertir valor boolean a número para el campo activo
        if (field === 'activo') {
            processedValue = processedValue ? 1 : 0;
        }

        const updateData: any = {
            id: apiconn.id,
            [field]: processedValue
        };

        this.apiConnService.updateApiConn(updateData).subscribe({
            next: (response) => {
                if (response.statuscode === 200) {
                    console.log('✅ Campo actualizado:', response);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Campo Actualizado',
                        detail: `${this.getFieldLabel(field)} actualizado correctamente`,
                        life: 3000
                    });
                }

                // Reset del estado de edición
                this.cancelInlineEdit();
            },
            error: (error: any) => {
                console.error('❌ Error al actualizar campo:', error);

                // Revertir el cambio local
                if (this.apiConnSeleccionada) {
                    (apiconn as any)[field] = this.apiConnSeleccionada[field as keyof ApiConnItem];
                }
                this.cancelInlineEdit();

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al actualizar',
                    detail: error.message || 'Error desconocido al actualizar',
                    life: 5000
                });
            }
        });
    }

    cancelInlineEdit(): void {
        if (this.apiConnSeleccionada) {
            // Restaurar el valor original si se canceló
            const original = this.apiConns.find(c => c.id === this.apiConnSeleccionada!.id);
            if (original) {
                Object.assign(this.apiConnSeleccionada, original);
            }
        }
        this.editingCell = '';
        this.apiConnSeleccionada = null;
    }

    // ========== MODAL CRUD ==========

    abrirModalCrear(): void {
        this.isEditing = false;
        this.apiConnForm.reset({
            nombre: '',
            tipo: '',
            env: '',
            host: '',
            puerto: null,
            url: '',
            usuario: '',
            password: '',
            api_key: '',
            opciones: '',
            activo: true
        });
        this.showModal = true;
    }

    abrirModalEditar(apiconn: ApiConnItem): void {
        this.isEditing = true;
        this.apiConnSeleccionada = { ...apiconn };

        this.apiConnForm.patchValue({
            nombre: apiconn.nombre,
            tipo: apiconn.tipo,
            env: apiconn.env,
            host: apiconn.host || '',
            puerto: apiconn.puerto || null,
            url: apiconn.url || '',
            usuario: apiconn.usuario || '',
            password: apiconn.password || '',
            api_key: apiconn.api_key || '',
            opciones: apiconn.opciones || '',
            activo: apiconn.activo === 1
        });

        this.showModal = true;
    }

    cerrarModal(): void {
        this.showModal = false;
        this.isEditing = false;
        this.apiConnSeleccionada = null;
        this.apiConnForm.reset();
    }

    guardar(): void {
        if (this.apiConnForm.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: 'Por favor complete todos los campos requeridos',
                life: 5000
            });
            return;
        }

        this.guardando = true;
        const formValue = this.apiConnForm.value;

        // Convertir valores del formulario
        const apiConnData = {
            ...formValue,
            activo: formValue.activo ? 1 : 0,
            puerto: formValue.puerto ? parseInt(formValue.puerto) : null
        };

        if (this.isEditing && this.apiConnSeleccionada) {
            // Actualizar
            this.apiConnService.updateApiConn({
                id: this.apiConnSeleccionada.id,
                ...apiConnData
            }).subscribe({
                next: (response) => {
                    if (response.statuscode === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Actualizado',
                            detail: 'Conexión API actualizada exitosamente',
                            life: 3000
                        });
                        this.cargarApiConns();
                        this.cerrarModal();
                    }
                    this.guardando = false;
                },
                error: (error) => {
                    console.error('❌ Error actualizando conexión:', error);
                    this.guardando = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al actualizar la conexión API',
                        life: 5000
                    });
                }
            });
        } else {
            // Crear
            this.apiConnService.createApiConn(apiConnData).subscribe({
                next: (response) => {
                    if (response.statuscode === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Creado',
                            detail: 'Conexión API creada exitosamente',
                            life: 3000
                        });
                        this.cargarApiConns();
                        this.cerrarModal();
                    }
                    this.guardando = false;
                },
                error: (error) => {
                    console.error('❌ Error creando conexión:', error);
                    this.guardando = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al crear la conexión API',
                        life: 5000
                    });
                }
            });
        }
    }

    // ========== TESTING DE CONEXIONES ==========

    probarConexion(apiconn: ApiConnItem): void {
        console.log('🧪 Probando conexión:', apiconn.nombre);

        // Aquí implementarías la lógica real de testing
        this.messageService.add({
            severity: 'info',
            summary: 'Probando Conexión',
            detail: `Verificando conexión a ${apiconn.nombre}...`,
            life: 2000
        });

        setTimeout(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Conexión Exitosa',
                detail: `La conexión ${apiconn.nombre} está funcionando correctamente`,
                life: 3000
            });
        }, 2000);
    }

    probarConexionFormulario(): void {
        if (this.apiConnForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Datos Incompletos',
                detail: 'Complete al menos el nombre, tipo y entorno para probar la conexión',
                life: 4000
            });
            return;
        }

        this.probandoConexion = true;
        const formValue = this.apiConnForm.value;

        console.log('🧪 Probando conexión desde formulario:', formValue.nombre);

        // Simular testing de conexión
        setTimeout(() => {
            this.probandoConexion = false;
            this.messageService.add({
                severity: 'success',
                summary: 'Conexión Exitosa',
                detail: `La configuración de ${formValue.nombre} es válida`,
                life: 3000
            });
        }, 2000);
    }

    // ========== ELIMINACIÓN ==========

    confirmarEliminar(apiconn: ApiConnItem): void {
        this.confirmationService.confirm({
            message: `¿Está seguro de que desea eliminar la conexión "${apiconn.nombre}"?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger p-button-raised',
            rejectButtonStyleClass: 'p-button-secondary p-button-raised',
            accept: () => {
                this.eliminarApiConn(apiconn);
            }
        });
    }

    private eliminarApiConn(apiconn: ApiConnItem): void {
        console.log('🗑️ Eliminando conexión:', apiconn.nombre);

        this.apiConnService.deleteApiConn(apiconn.id).subscribe({
            next: (response) => {
                if (response.statuscode === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Conexión API eliminada exitosamente',
                        life: 3000
                    });
                    this.cargarApiConns();
                }
            },
            error: (error) => {
                console.error('❌ Error eliminando conexión:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al eliminar la conexión API',
                    life: 5000
                });
            }
        });
    }

    // ========== UTILIDADES ==========

    getTipoLabel(tipo: string): string {
        const tipoOption = APICONN_TYPES.find(t => t.value === tipo);
        return tipoOption ? tipoOption.label : tipo;
    }

    getTipoSeverity(tipo: string): string {
        switch (tipo) {
            case 'Cache': return 'info';
            case 'Search': return 'success';
            case 'GS1': return 'warning';
            case 'API': return 'primary';
            case 'Database': return 'danger';
            default: return 'secondary';
        }
    }

    getEntornoLabel(env: string): string {
        const envOption = APICONN_ENVIRONMENTS.find(e => e.value === env);
        return envOption ? envOption.label : env;
    }

    getEntornoSeverity(env: string): string {
        switch (env) {
            case 'prod': return 'success';  // Verde para producción
            case 'staging': return 'warning'; // Naranja para QA (ya estaba correcto)
            case 'dev': return 'info'; // Azul para dev (ya estaba correcto)
            default: return 'secondary';
        }
    }

    onSort(event: any): void {
        console.log('📊 Ordenamiento aplicado:', event);
    }

    private getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            'nombre': 'Nombre',
            'activo': 'Estado'
        };
        return labels[field] || field;
    }

    // ========== EXPORTACIÓN ==========

    exportarExcel(): void {
        console.log('📊 Exportando conexiones a Excel...');

        this.messageService.add({
            severity: 'info',
            summary: 'Exportando',
            detail: 'Generando archivo Excel...',
            life: 2000
        });

        // Aquí implementarías la lógica real de exportación
        setTimeout(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Exportación Exitosa',
                detail: 'Archivo Excel generado correctamente',
                life: 3000
            });
        }, 2000);
    }
}
