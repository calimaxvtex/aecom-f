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
// import { CalendarModule } from 'primeng/calendar';
// import { DropdownModule } from 'primeng/dropdown';
// import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';

// Servicios y modelos
import { BannerService } from '../../../features/banner/services/banner.service';
import { Banner, CreateBannerRequest, UpdateBannerRequest } from '../../../features/banner/models/banner.interface';
import { Componente } from '../../../features/comp/models/comp.interface';

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
        TooltipModule
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
                    <th pSortableColumn="id_mb" style="width: 80px">ID <p-sortIcon field="id_mb"></p-sortIcon></th>
                    <th pSortableColumn="orden" style="width: 100px">Orden <p-sortIcon field="orden"></p-sortIcon></th>
                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                    <th pSortableColumn="tipo_call" style="min-width: 120px">Tipo Acción <p-sortIcon field="tipo_call"></p-sortIcon></th>
                    <th pSortableColumn="call" style="min-width: 150px">Texto Acción <p-sortIcon field="call"></p-sortIcon></th>
                    <th pSortableColumn="fecha_ini" style="min-width: 120px">Fecha Inicio <p-sortIcon field="fecha_ini"></p-sortIcon></th>
                    <th pSortableColumn="fecha_fin" style="min-width: 120px">Fecha Fin <p-sortIcon field="fecha_fin"></p-sortIcon></th>
                    <th style="width: 100px">Habilitado</th>
                    <th style="width: 100px">Programado</th>
                    <th style="width: 150px">Acciones</th>
                </tr>
            </ng-template>

            <!-- Body -->
            <ng-template #body let-banner>
                <tr
                    class="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <!-- ID -->
                    <td>{{ banner.id_mb }}</td>

                    <!-- Orden -->
                    <td>
                        <span
                            (click)="editInlineBanner(banner, 'orden'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ banner.orden }}
                        </span>
                        <div
                            *ngIf="editingCell === banner.id_mb + '_orden'"
                            class="inline-edit-container"
                        >
                            <input
                                pInputText
                                type="number"
                                [(ngModel)]="banner.orden"
                                (keyup.enter)="saveInlineEditBanner(banner, 'orden')"
                                (keyup.escape)="cancelInlineEdit()"
                                class="p-inputtext-sm flex-1"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Orden"
                                min="1"
                            />
                            <button
                                pButton
                                icon="pi pi-check"
                                (click)="saveInlineEditBanner(banner, 'orden')"
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
            [style]="{width: '700px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="bannerForm" (ngSubmit)="saveBanner()">
                <div class="grid grid-cols-1 gap-4">
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

                    <!-- Tipo Call -->
                    <div>
                        <p-floatLabel variant="on">
                            <select
                                formControlName="tipo_call"
                                class="p-inputtext w-full"
                                style="padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
                            >
                                <option value="NONE">Ninguno</option>
                                <option value="LINK">Enlace</option>
                                <option value="BUTTON">Botón</option>
                            </select>
                            <label>Tipo de Acción *</label>
                        </p-floatLabel>
                    </div>

                    <!-- Call -->
                    <div>
                        <p-floatLabel variant="on">
                            <input
                                pInputText
                                formControlName="call"
                                placeholder="Texto para el botón o enlace"
                                class="w-full"
                                maxlength="255"
                            />
                            <label>Texto Acción</label>
                        </p-floatLabel>
                    </div>

                    <!-- Fechas -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    type="date"
                                    formControlName="fecha_ini"
                                    placeholder="Fecha de inicio"
                                    class="w-full"
                                />
                                <label>Fecha Inicio *</label>
                            </p-floatLabel>
                        </div>
                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    type="date"
                                    formControlName="fecha_fin"
                                    placeholder="Fecha de fin"
                                    class="w-full"
                                />
                                <label>Fecha Fin *</label>
                            </p-floatLabel>
                        </div>
                    </div>

                    <!-- URLs -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    formControlName="url_banner"
                                    placeholder="URL de la imagen del banner"
                                    class="w-full"
                                />
                                <label>URL Banner</label>
                            </p-floatLabel>
                        </div>
                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    formControlName="url_banner_call"
                                    placeholder="URL de destino de la acción"
                                    class="w-full"
                                />
                                <label>URL Acción</label>
                            </p-floatLabel>
                        </div>
                    </div>

                    <!-- Orden -->
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

                    <!-- Campos booleanos -->
                    <div class="flex items-center gap-6">
                        <div class="flex items-center gap-2">
                            <p-tag
                                [value]="bannerForm.get('swsched')?.value ? 'Sí' : 'No'"
                                [severity]="bannerForm.get('swsched')?.value ? 'warning' : 'info'"
                                (click)="toggleFormField('swsched')"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                title="Clic para cambiar">
                            </p-tag>
                            <span>¿Programado?</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <p-tag
                                [value]="bannerForm.get('swEnable')?.value ? 'Sí' : 'No'"
                                [severity]="bannerForm.get('swEnable')?.value ? 'success' : 'danger'"
                                (click)="toggleFormField('swEnable')"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                title="Clic para cambiar">
                            </p-tag>
                            <span>¿Habilitado?</span>
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
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
    tipoCallOptions = [
        { label: 'Enlace', value: 'LINK' },
        { label: 'Botón', value: 'BUTTON' },
        { label: 'Ninguno', value: 'NONE' }
    ];

    // Servicios
    private bannerService = inject(BannerService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);

    // ViewChild para tabla
    @ViewChild('dtBanners') dtBanners!: Table;

    ngOnInit(): void {
        console.log('🎨 BannersTabComponent inicializado');
        this.initializeForms();
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
        this.bannerForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.maxLength(100)]],
            tipo_call: ['NONE', [Validators.required]],
            call: [''],
            fecha_ini: [new Date(), [Validators.required]],
            fecha_fin: [new Date(), [Validators.required]],
            url_banner: [''],
            url_banner_call: [''],
            orden: [1, [Validators.required, Validators.min(1)]],
            swsched: [0],
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
                tipo_call: banner.tipo_call,
                call: banner.call,
                fecha_ini: new Date(banner.fecha_ini),
                fecha_fin: new Date(banner.fecha_fin),
                url_banner: banner.url_banner,
                url_banner_call: banner.url_banner_call,
                orden: banner.orden,
                swsched: banner.swsched,
                swEnable: banner.swEnable
            });
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

            // Convertir fechas a formato string
            const processedData: CreateBannerRequest = {
                ...formData,
                id_comp: this.componenteSeleccionado.id_comp,
                fecha_ini: this.formatDate(formData.fecha_ini),
                fecha_fin: this.formatDate(formData.fecha_fin),
                swsched: formData.swsched ? 1 : 0,
                swEnable: formData.swEnable ? 1 : 0
            };

            if (this.isEditingBanner && this.bannerToDelete) {
                // Actualizar
                const updateData: UpdateBannerRequest = {
                    id_mb: this.bannerToDelete.id_mb,
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
        const newValue = !currentValue;
        this.bannerForm.patchValue({ [fieldName]: newValue });
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
}
