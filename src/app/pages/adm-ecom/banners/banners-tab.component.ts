import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, inject } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

// Servicios y modelos
import { BannerService } from '../../../features/banner/services/banner.service';
import { Banner, CreateBannerRequest, UpdateBannerRequest } from '../../../features/banner/models/banner.interface';
import { Componente } from '../../../features/comp/models/comp.interface';
import { CatConceptosDetService } from '../../../features/catconceptos/services/catconceptosdet.service';
import { CollService } from '../../../features/coll/services/coll.service';
import { CatConceptoDet } from '../../../features/catconceptos/models/catconceptosdet.interface';

@Component({
    selector: 'app-banners-tab',
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
        TooltipModule,
        SelectModule,
        MultiSelectModule,
        CardModule
    ],
    providers: [MessageService],
    template: `
        <!-- Tabla CRUD de Banners -->
        <p-table
            #dtBanners
            [value]="banners"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            responsiveLayout="scroll"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} banners"
            [rowsPerPageOptions]="[10, 25, 50]"
            [globalFilterFields]="['nombre', 'call']"
            dataKey="id_mb"
            [sortMode]="'multiple'"
            [filterDelay]="300"
        >
            <!-- Caption con controles -->
            <ng-template #caption>
                <div class="flex flex-wrap gap-2 items-center justify-between">
                    <div class="flex items-center gap-2">
                        <input
                            pInputText
                            type="text"
                            (input)="onGlobalFilter(dtBanners, $event)"
                            placeholder="Buscar banners..."
                            class="w-full sm:w-80"
                        />
                        <p-tag
                            *ngIf="componenteSeleccionado"
                            [value]="componenteSeleccionado.nombre"
                            severity="info"
                            class="text-xs">
                        </p-tag>
                    </div>
                    <div class="flex gap-2">
                        <button
                            (click)="cargarBanners()"
                            pButton
                            raised
                            icon="pi pi-refresh"
                            [loading]="loadingBanners"
                            pTooltip="Actualizar"
                        ></button>
                        <button
                            (click)="openBannerForm()"
                            pButton
                            raised
                            icon="pi pi-plus"
                            pTooltip="Agregar Banner"
                            [disabled]="!componenteSeleccionado"
                        ></button>
                    </div>
                </div>
            </ng-template>

            <!-- Headers -->
            <ng-template #header>
                <tr>
                    <th style="width: 80px">ID</th>
                    <th style="min-width: 120px">URL Banner</th>
                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                    <th pSortableColumn="orden" style="width: 100px">Orden <p-sortIcon field="orden"></p-sortIcon></th>
                    <th style="width: 100px">Habilitado</th>
                    <th style="width: 150px">Acciones</th>
                </tr>
            </ng-template>

            <!-- Body -->
            <ng-template #body let-banner>
                <tr
                    class="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <!-- ID -->
                    <td class="text-center font-mono text-sm">{{ banner.id_mb }}</td>

                    <!-- URL Banner Preview -->
                    <td class="text-center">
                        <div class="relative inline-block">
                            <div class="w-16 h-10 bg-gray-100 border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                                <img
                                    *ngIf="banner.url_banner"
                                    [src]="banner.url_banner"
                                    [alt]="banner.nombre"
                                    class="w-full h-full object-cover"
                                    (error)="onImageError($event)"
                                />
                                <i *ngIf="!banner.url_banner" class="pi pi-image text-gray-400"></i>
                                <i class="pi pi-image text-gray-400 hidden"></i>
                            </div>
                        </div>
                    </td>

                    <!-- Nombre -->
                    <td>
                        <span
                            (click)="editInlineBanner(banner, 'nombre'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ banner.nombre }}
                        </span>
                        <div
                            *ngIf="editingCell === banner.id_mb + '_nombre'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="banner.nombre"
                                (keyup.enter)="saveInlineEditBanner(banner, 'nombre')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Nombre del banner"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditBanner(banner, 'nombre')"
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
                            (click)="editInlineBanner(banner, 'nombre'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ banner.nombre }}
                        </span>
                        <div
                            *ngIf="editingCell === banner.id_mb + '_nombre'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="banner.nombre"
                                (keyup.enter)="saveInlineEditBanner(banner, 'nombre')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Nombre del banner"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditBanner(banner, 'nombre')"
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

                    <!-- Tipo Call -->
                    <td>
                        <p-tag
                            [value]="banner.tipo_call"
                            [severity]="getTipoCallSeverity(banner.tipo_call)"
                        ></p-tag>
                    </td>

                    <!-- Call -->
                    <td>
                        <span
                            *ngIf="editingCell !== banner.id_mb + '_call'"
                            (click)="editInlineBanner(banner, 'call'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ banner.call || '—' }}
                        </span>
                        <div
                            *ngIf="editingCell === banner.id_mb + '_call'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="text"
                                [(ngModel)]="banner.call"
                                (keyup.enter)="saveInlineEditBanner(banner, 'call')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Texto de acción"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditBanner(banner, 'call')"
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

                    <!-- Fecha Inicio -->
                    <td>{{ banner.fecha_ini | date:'dd/MM/yyyy' }}</td>

                    <!-- Fecha Fin -->
                    <td>{{ banner.fecha_fin | date:'dd/MM/yyyy' }}</td>

                    <!-- Habilitado -->
                    <td class="text-center">
                        <p-tag
                            [value]="banner.swEnable ? 'Si' : 'No'"
                            [severity]="banner.swEnable ? 'success' : 'danger'"
                            (click)="toggleSwEnable(banner); $event.stopPropagation()"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            title="Clic para cambiar"
                        ></p-tag>
                    </td>

                    <!-- Programado -->
                    <td class="text-center">
                        <p-tag
                            [value]="banner.swsched ? 'Si' : 'No'"
                            [severity]="banner.swsched ? 'warning' : 'info'"
                        ></p-tag>
                    </td>

                    <!-- Acciones -->
                    <td (click)="$event.stopPropagation()">
                        <div class="flex gap-1">
                            <button
                                pButton
                                icon="pi pi-pencil"
                                (click)="openBannerForm(banner)"
                                class="p-button-sm p-button-text p-button-warning"
                                pTooltip="Editar Banner"
                            ></button>
                            <button
                                pButton
                                icon="pi pi-trash"
                                (click)="eliminarBanner(banner)"
                                class="p-button-sm p-button-text p-button-danger"
                                pTooltip="Eliminar Banner"
                            ></button>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <!-- Modal de formulario CRUD -->
        <p-dialog
            [(visible)]="showBannerModal"
            [header]="isEditingBanner ? 'Editar Banner' : 'Nuevo Banner'"
            [modal]="true"
            [style]="{width: '800px', maxWidth: '90vw'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
            styleClass="banner-form-dialog"
        >
            <form [formGroup]="bannerForm" (ngSubmit)="saveBanner()">
                <!-- Campos principales -->
                <div class="grid grid-cols-1 gap-4 mb-6">
                    <!-- Nombre -->
                    <div>
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                formControlName="nombre"
                                placeholder="Nombre descriptivo del banner"
                                class="w-full"
                                maxlength="100"
                            />
                            <label>Nombre *</label>
                        </p-floatLabel>
                    </div>

                    <!-- URL Banner con preview -->
                    <div>
                        <label class="text-sm font-medium text-gray-700 mb-2 block">URL del Banner</label>
                        <div class="flex gap-2">
                            <div class="flex-1">
                                <input
                                    pInputText
                                    formControlName="url_banner"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    class="w-full"
                                />
                            </div>
                            <button
                                pButton
                                type="button"
                                icon="pi pi-external-link"
                                (click)="validarUrl(bannerForm.get('url_banner')?.value)"
                                pTooltip="Validar URL"
                                class="p-button-secondary"
                            ></button>
                        </div>
                        <!-- Preview del banner -->
                        <div class="mt-3" *ngIf="bannerForm.get('url_banner')?.value">
                            <label class="text-sm font-medium text-gray-700 mb-2 block">Preview del Banner</label>
                            <div class="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                <div class="max-w-md mx-auto">
                                    <img
                                        [src]="bannerForm.get('url_banner')?.value"
                                        [alt]="bannerForm.get('nombre')?.value"
                                        class="w-full h-32 object-cover rounded border"
                                        (error)="onImageError($event)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tipo Call -->
                    <div>
                        <p-floatLabel variant="on">
                            <p-select
                                formControlName="tipo_call"
                                [options]="tipoCallOptions"
                                optionLabel="label"
                                optionValue="value"
                                (onChange)="onTipoCallChange($event)"
                                placeholder="Seleccionar tipo de acción"
                                class="w-full"
                            ></p-select>
                            <label>Tipo de Acción *</label>
                        </p-floatLabel>
                    </div>

                    <!-- Call (solo si valor1 es 1) -->
                    <div *ngIf="mostrarCampoCall">
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                formControlName="call"
                                [placeholder]="callLabel"
                                class="w-full"
                                maxlength="255"
                            />
                            <label>{{ callLabel }}</label>
                        </p-floatLabel>
                    </div>

                    <!-- URL Banner Call con preview -->
                    <div>
                        <label class="text-sm font-medium text-gray-700 mb-2 block">URL de Acción</label>
                        <div class="flex gap-2">
                            <div class="flex-1">
                                <input
                                    pInputText
                                    formControlName="url_banner_call"
                                    placeholder="https://ejemplo.com/destino"
                                    class="w-full"
                                />
                            </div>
                            <button
                                pButton
                                type="button"
                                icon="pi pi-external-link"
                                (click)="validarUrl(bannerForm.get('url_banner_call')?.value)"
                                pTooltip="Validar URL"
                                class="p-button-secondary"
                            ></button>
                            <button
                                pButton
                                type="button"
                                icon="pi pi-eye"
                                (click)="previewUrl(bannerForm.get('url_banner_call')?.value)"
                                pTooltip="Vista previa"
                                class="p-button-info"
                                [disabled]="!bannerForm.get('url_banner_call')?.value"
                            ></button>
                        </div>
                    </div>

                    <!-- Collection selector (solo si tipo_call es 'COLL') -->
                    <div *ngIf="mostrarCollectionSelector">
                        <p-floatLabel variant="on">
                            <p-select
                                formControlName="id_coll"
                                [options]="collectionsOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Seleccionar colección"
                                class="w-full"
                            ></p-select>
                            <label>Colección</label>
                        </p-floatLabel>
                    </div>

                    <!-- Sucursales (mockup) -->
                    <div>
                        <label class="text-sm font-medium text-gray-700 mb-2 block">Sucursales</label>
                        <p-multiSelect
                            formControlName="sucursales"
                            [options]="sucursalesOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar sucursales"
                            class="w-full"
                            [maxSelectedLabels]="3"
                        ></p-multiSelect>
                        <small class="text-gray-500 mt-1 block">Funcionalidad pendiente de implementación del servicio de sucursales</small>
                    </div>

                    <!-- Orden -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    type="number"
                                    formControlName="orden"
                                    placeholder="Orden de visualización"
                                    class="w-full"
                                    min="1"
                                />
                                <label>Orden *</label>
                            </p-floatLabel>
                        </div>

                        <!-- Programado -->
                        <div class="flex items-center gap-4">
                            <p-tag
                                [value]="bannerForm.get('swsched')?.value ? 'Programado' : 'Inmediato'"
                                [severity]="bannerForm.get('swsched')?.value ? 'warning' : 'info'"
                                (click)="toggleFormField('swsched')"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                pTooltip="Activar/desactivar programación"
                            ></p-tag>
                            <label class="text-sm text-gray-600">Programado</label>
                        </div>
                    </div>

                    <!-- Fechas (solo si está programado) -->
                    <div *ngIf="bannerForm.get('swsched')?.value" class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium text-gray-700 mb-2 block">Fecha Inicio</label>
                            <input
                                pInputText
                                type="date"
                                formControlName="fecha_ini"
                                placeholder="Seleccionar fecha inicio"
                                class="w-full"
                            />
                        </div>
                        <div>
                            <label class="text-sm font-medium text-gray-700 mb-2 block">Fecha Fin</label>
                            <input
                                pInputText
                                type="date"
                                formControlName="fecha_fin"
                                placeholder="Seleccionar fecha fin"
                                class="w-full"
                            />
                        </div>
                    </div>
                </div>

                <!-- Sección informativa -->
                <div *ngIf="isEditingBanner && bannerSeleccionado" class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="text-lg font-semibold mb-3">Información del Registro</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label class="font-medium text-gray-700">Creado por:</label>
                            <p class="text-gray-600">{{ bannerSeleccionado.usr_a }}</p>
                        </div>
                        <div>
                            <label class="font-medium text-gray-700">Fecha creación:</label>
                            <p class="text-gray-600">{{ bannerSeleccionado.fecha_a | date:'dd/MM/yyyy HH:mm' }}</p>
                        </div>
                        <div *ngIf="bannerSeleccionado.usr_m">
                            <label class="font-medium text-gray-700">Modificado por:</label>
                            <p class="text-gray-600">{{ bannerSeleccionado.usr_m }}</p>
                        </div>
                        <div *ngIf="bannerSeleccionado.fecha_m">
                            <label class="font-medium text-gray-700">Última modificación:</label>
                            <p class="text-gray-600">{{ bannerSeleccionado.fecha_m | date:'dd/MM/yyyy HH:mm' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
                    <button
                        pButton
                        type="button"
                        (click)="closeBannerForm()"
                        label="Cancelar"
                        class="p-button-text"
                    ></button>
                    <button
                        pButton
                        type="submit"
                        [label]="isEditingBanner ? 'Actualizar' : 'Crear'"
                        [disabled]="!bannerForm.valid || savingBanner"
                        [loading]="savingBanner"
                        class="p-button-success"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de confirmación de eliminación -->
        <p-dialog
            [(visible)]="showConfirmDeleteBanner"
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
                    <h4 class="font-semibold text-xl mb-1">¿Eliminar Banner?</h4>

                    <p class="text-sm text-red-600 mt-2 font-medium">
                         Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                    pButton
                    type="button"
                    (click)="cancelDeleteBanner()"
                    label="Cancelar"
                    class="p-button-text"
                ></button>
                <button
                    pButton
                    type="button"
                    (click)="confirmDeleteBanner()"
                    label="Eliminar"
                    class="p-button-danger"
                    [loading]="deletingBanner"
                ></button>
            </div>
        </p-dialog>

        <!-- Modal de preview URL -->
        <p-dialog
            [(visible)]="showUrlPreviewModal"
            header="Vista Previa de URL"
            [modal]="true"
            [style]="{width: '90vw', height: '80vh'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <div class="w-full h-full">
                <iframe
                    *ngIf="previewUrlValue"
                    [src]="previewUrlValue"
                    class="w-full h-full border-0 rounded"
                    title="Vista previa"
                ></iframe>
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
export class BannersTabComponent implements OnInit, OnChanges {
    // Input para recibir el componente seleccionado
    @Input() componenteSeleccionado: Componente | null = null;

    // Datos
    banners: Banner[] = [];

    // Estados
    loadingBanners = false;
    savingBanner = false;
    deletingBanner = false;

    // Modales
    showBannerModal = false;
    showConfirmDeleteBanner = false;

    // Formulario
    bannerForm!: FormGroup;
    isEditingBanner = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Confirmación
    bannerToDelete: Banner | null = null;

    // Opciones para dropdowns
    tipoCallOptions: { label: string; value: string; valor1?: number }[] = [];
    collectionsOptions: { label: string; value: number }[] = [];
    sucursalesOptions: { label: string; value: number }[] = [];

    // Estados condicionales del formulario
    mostrarCampoCall = false;
    mostrarCollectionSelector = false;
    callLabel = 'Texto Acción';

    // Modal de preview
    showUrlPreviewModal = false;
    previewUrlValue = '';

    // Banner seleccionado para edición
    bannerSeleccionado: Banner | null = null;

    // Servicios
    private bannerService = inject(BannerService);
    private catConceptosDetService = inject(CatConceptosDetService);
    private collService = inject(CollService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);

    // ViewChild para tabla
    @ViewChild('dtBanners') dtBanners!: Table;

    ngOnInit(): void {
        console.log('🎨 BannersTabComponent inicializado');
        this.initializeForms();
        this.cargarOpcionesCatalogo();
        this.cargarBanners();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Detectar cambios en el componente seleccionado y recargar banners
        if (changes['componenteSeleccionado']) {
            console.log('🔄 Componente seleccionado cambió:', this.componenteSeleccionado);
            this.cargarBanners();
        }
    }

    // ========== INICIALIZACIÓN ==========

    initializeForms(): void {
        // Fechas por defecto
        const fechaHoy = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 7);

        this.bannerForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.maxLength(100)]],
            url_banner: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            url_banner_call: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            tipo_call: ['NONE', [Validators.required]],
            call: [''],
            id_coll: [null],
            sucursales: [[]],
            swsched: [0],
            fecha_ini: [fechaHoy],
            fecha_fin: [fechaFin],
            orden: [1, [Validators.required, Validators.min(1)]],
            swEnable: [1]
        });
    }

    // ========== CARGA DE DATOS ==========

    cargarBanners(): void {
        if (!this.componenteSeleccionado) {
            console.log('ℹ️ No hay componente seleccionado, limpiando banners');
            this.banners = [];
            return;
        }

        this.loadingBanners = true;
        console.log('📊 Cargando banners para componente:', this.componenteSeleccionado.id_comp);

        this.bannerService.getBannersByComponente(this.componenteSeleccionado.id_comp).subscribe({
            next: (response) => {
                console.log('✅ Banners cargados:', response.data);
                this.banners = response.data;
                this.loadingBanners = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Datos Actualizados',
                    detail: `${this.banners.length} banners cargados`
                });
            },
            error: (error) => {
                console.error('❌ Error cargando banners:', error);
                this.loadingBanners = false;

                // Mostrar mensaje de error específico del backend
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar banners';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar banners',
                    detail: errorMessage,
                    life: 5000
                });
            }
        });
    }

    // ========== FORMULARIO CRUD ==========

    openBannerForm(banner?: Banner): void {
        this.isEditingBanner = !!banner;

        if (banner) {
            console.log('✏️ Editando banner:', banner);
            this.bannerForm.patchValue({
                nombre: banner.nombre,
                url_banner: banner.url_banner,
                url_banner_call: banner.url_banner_call,
                tipo_call: banner.tipo_call,
                call: banner.call,
                id_coll: banner.id_coll,
                sucursales: banner.sucursales || [],
                orden: banner.orden,
                swsched: banner.swsched,
                swEnable: banner.swEnable
            });

            // Agregar fechas si están programadas
            if (banner.swsched && banner.fecha_ini) {
                this.bannerForm.patchValue({
                    fecha_ini: new Date(banner.fecha_ini)
                });
            }
            if (banner.swsched && banner.fecha_fin) {
                this.bannerForm.patchValue({
                    fecha_fin: new Date(banner.fecha_fin)
                });
            }

            // Trigger change para actualizar campos condicionales
            this.onTipoCallChange({ value: banner.tipo_call });
        } else {
            console.log('➕ Creando nuevo banner');
            this.bannerForm.reset({
                tipo_call: 'NONE',
                fecha_ini: new Date(),
                fecha_fin: new Date(),
                orden: this.banners.length + 1,
                swsched: 0,
                swEnable: 1
            });
        }

        this.showBannerModal = true;
    }

    closeBannerForm(): void {
        this.showBannerModal = false;
        this.bannerForm.reset();
        this.isEditingBanner = false;
    }

    saveBanner(): void {
        if (this.bannerForm.valid && this.componenteSeleccionado) {
            this.savingBanner = true;
            const formData = this.bannerForm.value;

            // Preparar datos para el backend
            const processedData: any = {
                nombre: formData.nombre,
                id_comp: this.componenteSeleccionado.id_comp,
                tipo_call: formData.tipo_call,
                call: formData.call || '',
                url_banner: formData.url_banner || '',
                url_banner_call: formData.url_banner_call || '',
                orden: formData.orden,
                swsched: formData.swsched ? 1 : 0,
                swEnable: formData.swEnable ? 1 : 0
            };

            // Agregar fechas si está programado
            if (formData.swsched) {
                processedData.fecha_ini = this.formatDate(formData.fecha_ini);
                processedData.fecha_fin = this.formatDate(formData.fecha_fin);
            }

            // Agregar campos opcionales
            if (formData.id_coll) {
                processedData.id_coll = formData.id_coll;
            }
            if (formData.sucursales && formData.sucursales.length > 0) {
                processedData.sucursales = formData.sucursales;
            }

            if (this.isEditingBanner && this.bannerSeleccionado) {
                // Actualizar
                const updateData: UpdateBannerRequest = {
                    id_mb: this.bannerSeleccionado.id_mb,
                    ...processedData
                };

                this.bannerService.updateBanner(updateData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Banner actualizado correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'actualizar')
                });
            } else {
                // Crear
                this.bannerService.createBanner(processedData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Banner creado correctamente');
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

        this.closeBannerForm();
        this.cargarBanners();
        this.savingBanner = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} banner:`, error);

        let errorMessage = `Error al ${operation} el banner`;
        if (error && error.mensaje) {
            errorMessage = error.mensaje;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });

        this.savingBanner = false;
    }

    // ========== EDICIÓN INLINE ==========

    editInlineBanner(banner: Banner, field: string): void {
        this.editingCell = banner.id_mb + '_' + field;
        this.originalValue = (banner as any)[field];
        console.log('✏️ Editando inline:', field, 'Valor:', this.originalValue);
    }

    saveInlineEditBanner(banner: Banner, field: string): void {
        console.log('💾 Guardando inline:', field, 'Nuevo valor:', (banner as any)[field]);

        if ((banner as any)[field] === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando');
            this.cancelInlineEdit();
            return;
        }

        const updateData: UpdateBannerRequest = {
            id_mb: banner.id_mb,
            [field]: (banner as any)[field]
        };

        this.bannerService.updateBanner(updateData).subscribe({
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
                (banner as any)[field] = this.originalValue;
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

    toggleSwEnable(banner: Banner): void {
        const nuevoValor = banner.swEnable === 1 ? 0 : 1;
        const valorAnterior = banner.swEnable;

        banner.swEnable = nuevoValor;

        this.bannerService.toggleBannerStatus(banner.id_mb, nuevoValor === 1).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Campo Actualizado',
                    detail: `Campo "Habilitado" actualizado correctamente`
                });
            },
            error: (error) => {
                // Revertir cambio
                banner.swEnable = valorAnterior;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar campo "Habilitado"',
                    life: 5000
                });
            }
        });
    }

    // ========== ELIMINACIÓN ==========

    eliminarBanner(banner: Banner): void {
        this.bannerToDelete = banner;
        this.showConfirmDeleteBanner = true;
    }

    confirmDeleteBanner(): void {
        if (this.bannerToDelete) {
            this.deletingBanner = true;

            this.bannerService.deleteBanner(this.bannerToDelete.id_mb).subscribe({
                next: (response) => {
                    console.log('✅ Banner eliminado:', response);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Banner eliminado correctamente'
                    });

                    this.cancelDeleteBanner();
                    this.cargarBanners();
                },
                error: (error) => {
                    console.error('❌ Error al eliminar banner:', error);

                    // Mostrar mensaje de error específico del backend
                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al eliminar banner';

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al eliminar banner',
                        detail: errorMessage,
                        life: 5000
                    });

                    this.deletingBanner = false;
                }
            });
        }
    }

    cancelDeleteBanner(): void {
        this.showConfirmDeleteBanner = false;
        this.bannerToDelete = null;
        this.deletingBanner = false;
    }

    // ========== UTILIDADES ==========

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    toggleFormField(fieldName: string): void {
        const currentValue = this.bannerForm.get(fieldName)?.value;

        if (fieldName === 'visibles') {
            // Para visibles, alternar entre 0 y 5
            const newValue = currentValue > 0 ? 0 : 5;
            this.bannerForm.patchValue({ [fieldName]: newValue });
        } else {
            // Para otros campos booleanos
            const newValue = !currentValue;
            this.bannerForm.patchValue({ [fieldName]: newValue });
        }
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getTipoCallSeverity(tipo: string): 'success' | 'warning' | 'info' {
        switch (tipo) {
            case 'LINK': return 'success';
            case 'BUTTON': return 'warning';
            case 'NONE': return 'info';
            default: return 'info';
        }
    }

    private getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            'orden': 'Orden',
            'nombre': 'Nombre',
            'call': 'Texto Acción'
        };
        return labels[field] || field;
    }

    // ========== MÉTODOS DE CATÁLOGO ==========

    cargarOpcionesCatalogo(): void {
        console.log('📊 Cargando opciones de catálogo');
        this.cargarTipoCallOptions();
        this.cargarCollectionsOptions();
        this.cargarSucursalesOptions();
    }

    private cargarTipoCallOptions(): void {
        this.catConceptosDetService.queryDetalles({
            clave: 'TIPOCALL',
            swestado: 1
        }).subscribe({
            next: (response) => {
                this.tipoCallOptions = response.data.map(item => ({
                    label: item.descripcion,
                    value: item.valorcadena1 || item.descripcion,
                    valor1: item.valor1
                }));

                // Agregar opción por defecto
                this.tipoCallOptions.unshift({ label: 'Ninguno', value: 'NONE', valor1: 0 });

                console.log('📊 Opciones de tipo call cargadas:', this.tipoCallOptions);
            },
            error: (error) => {
                console.error('❌ Error cargando tipos de call:', error);
                this.tipoCallOptions = [{ label: 'Ninguno', value: 'NONE', valor1: 0 }];
            }
        });
    }

    private cargarCollectionsOptions(): void {
        // Mockup por ahora - implementar cuando esté disponible el servicio
        this.collectionsOptions = [
            { label: 'Colección Principal', value: 1 },
            { label: 'Colección Secundaria', value: 2 },
            { label: 'Colección Promocional', value: 3 }
        ];
        console.log('📊 Opciones de colecciones (mockup):', this.collectionsOptions);
    }

    private cargarSucursalesOptions(): void {
        // Mockup por ahora - implementar cuando esté disponible el servicio
        this.sucursalesOptions = [
            { label: 'Sucursal Centro', value: 1 },
            { label: 'Sucursal Norte', value: 2 },
            { label: 'Sucursal Sur', value: 3 },
            { label: 'Sucursal Este', value: 4 },
            { label: 'Sucursal Oeste', value: 5 }
        ];
        console.log('📊 Opciones de sucursales (mockup):', this.sucursalesOptions);
    }

    // ========== MANEJO DE FORMULARIO ==========

    onTipoCallChange(event: any): void {
        const selectedTipo = event.value;
        const tipoOption = this.tipoCallOptions.find(t => t.value === selectedTipo);

        // Mostrar/ocultar campo call basado en valor1
        this.mostrarCampoCall = tipoOption ? tipoOption.valor1 === 1 : false;

        // Actualizar label del campo call
        if (tipoOption) {
            this.callLabel = tipoOption.label;
        }

        // Mostrar/ocultar selector de colección
        this.mostrarCollectionSelector = selectedTipo === 'COLL';

        // Reset campos dependientes
        if (!this.mostrarCampoCall) {
            this.bannerForm.patchValue({ call: '' });
        }
        if (!this.mostrarCollectionSelector) {
            this.bannerForm.patchValue({ id_coll: null });
        }
    }

    // ========== PREVIEW DE URLs ==========

    validarUrl(url: string): void {
        if (!url) {
            this.messageService.add({
                severity: 'warn',
                summary: 'URL Vacía',
                detail: 'Por favor ingrese una URL para validar'
            });
            return;
        }

        if (!url.match(/^https?:\/\/.+/)) {
            this.messageService.add({
                severity: 'error',
                summary: 'URL Inválida',
                detail: 'La URL debe comenzar con http:// o https://'
            });
            return;
        }

        this.messageService.add({
            severity: 'success',
            summary: 'URL Válida',
            detail: 'La URL tiene un formato correcto'
        });
    }

    previewUrl(url: string): void {
        if (!url) {
            this.messageService.add({
                severity: 'warn',
                summary: 'URL Vacía',
                detail: 'Por favor ingrese una URL para preview'
            });
            return;
        }

        if (!url.match(/^https?:\/\/.+/)) {
            this.messageService.add({
                severity: 'error',
                summary: 'URL Inválida',
                detail: 'La URL debe comenzar con http:// o https://'
            });
            return;
        }

        this.previewUrlValue = url;
        this.showUrlPreviewModal = true;
    }

    onImageError(event: any): void {
        console.warn('Error cargando imagen del banner:', event);
        // El fallback ya está manejado en el template con los iconos alternativos
    }

    // ========== UTILIDADES ==========

    // ========== MÉTODO TOGGLE VISIBLE ==========
    // Nota: El campo "visibles" no existe en el modelo Banner actual
    // Se puede implementar cuando se actualice el modelo del backend

    toggleVisible(banner: Banner): void {
        // Implementación pendiente - requiere actualización del modelo Banner
        this.messageService.add({
            severity: 'info',
            summary: 'Funcionalidad Pendiente',
            detail: 'El campo "Visible" requiere actualización del modelo en el backend',
            life: 3000
        });
    }
}
