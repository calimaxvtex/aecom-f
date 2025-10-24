import { Component, OnInit, OnChanges, SimpleChanges, Input, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios y modelos
import { BannerService } from '../../../features/banner/services/banner.service';
import { Banner, CreateBannerRequest, UpdateBannerRequest } from '../../../features/banner/models/banner.interface';
import { Componente } from '../../../features/comp/models/comp.interface';
import { CatConceptosDetService } from '../../../features/catconceptos/services/catconceptosdet.service';
import { CollService } from '../../../features/coll/services/coll.service';
import { CatConceptoDet } from '../../../features/catconceptos/models/catconceptosdet.interface';
import { SucService } from '../../../features/suc/services/suc.service';

// Servicio de carga de imágenes
import { ImageUploadService, ImageUploadResponse, ImageFile } from '../../../core/services/img/';

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
        ConfirmDialogModule,
        ToastModule,
        TagModule,
        FloatLabelModule,
        TooltipModule,
        SelectModule,
        MultiSelectModule,
        CardModule,
        ToggleButtonModule,
        ToggleSwitchModule
    ],
    providers: [MessageService, ConfirmationService, ImageUploadService],
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
            [globalFilterFields]="['nombre', 'url_banner']"
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
                    </div>
                    <div class="flex gap-2">
                        <button
                            (click)="cargarBanners()"
                            pButton
                            raised
                            icon="pi pi-refresh"
                            [loading]="loadingBanners"
                            [disabled]="loadingBanners"
                            [pTooltip]="getRefreshTooltip()"
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
                    class="cursor-pointer transition-colors"
                    [class.banner-inactive]="banner.swEnable === 0"
                    [class]="banner.swEnable === 0 ? 'banner-disabled hover:bg-red-50/30' : 'hover:bg-gray-50 bg-white'"
                >
                    <!-- ID -->
                    <td class="text-center font-mono text-sm">{{ banner.id_mb }}</td>

                    <!-- URL Banner Preview -->
                    <td class="text-center">
                        <div class="relative inline-block">
                            <div class="w-38 h-24 bg-gray-100 border border-gray-300 rounded flex items-center justify-center overflow-hidden">
                                <img
                                    *ngIf="banner.url_banner"
                                    [src]="banner.url_banner"
                                    [alt]="banner.nombre"
                                    [style]="{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }"
                                    (error)="onImageError($event)"
                                />
                                <i *ngIf="!banner.url_banner" class="pi pi-image text-gray-400 text-2xl"></i>
                            </div>
                        </div>
                    </td>


                    <!-- Nombre -->
                    <td>
                        <!-- Vista normal -->
                        <span
                            *ngIf="editingCell !== banner.id_mb + '_nombre'"
                            (click)="editInlineBanner(banner, 'nombre'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ banner.nombre }}
                        </span>

                        <!-- Vista edición -->
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
                                class="p-inputtext-sm"
                                style="width: 150px; max-width: 150px;"
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

                    <!-- Orden -->
                    <td class="text-center">
                        <!-- Vista normal -->
                        <span
                            *ngIf="editingCell !== banner.id_mb + '_orden'"
                            (click)="editInlineBanner(banner, 'orden'); $event.stopPropagation()"
                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                            title="Clic para editar"
                        >
                            {{ banner.orden }}
                        </span>

                        <!-- Vista edición -->
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
                                class="p-inputtext-sm"
                                style="width: 60px; max-width: 60px;"
                                #input
                                (focus)="input.select()"
                                autofocus
                                placeholder="Orden"
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

                    <!-- Habilitado -->
                    <td class="text-center">
                        <p-toggleSwitch
                            [ngModel]="getBannerToggleState(banner)"
                            [ngModelOptions]="{standalone: true}"
                            onLabel="ACTIVO"
                            offLabel="DESACTIVADO"
                            inputId="{{banner.id_mb}}_habilitado"
                            (ngModelChange)="onToggleSwitchChange($event, banner)"
                            class="status-toggle"
                            pTooltip="Cambiar estado del banner"
                        ></p-toggleSwitch>
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
                    <!-- Nombre y Slug -->
                    <div>
                        <div style="height: 0; margin-top: 1rem;"></div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <!-- Nombre -->
                            <div class="md:col-span-1">
                                <p-floatLabel variant="on">
                                    <input
                                        pInputText
                                        formControlName="nombre"
                                        placeholder="Nombre descriptivo del banner"
                                        class="w-full"
                                        maxlength="100"
                                        (input)="onNombreInput($event)"
                                    />
                                    <label>Nombre *</label>
                                </p-floatLabel>
                            </div>

                            <!-- ToggleButton swSlug -->
                            <div class="md:col-span-1 flex flex-col items-center gap-2">
                                <label class="text-sm font-medium text-gray-700 text-center">swSlug</label>
                                <p-togglebutton
                                    formControlName="swslug"
                                    (onChange)="onSwSlugChange($event)"
                                    onLabel="ON"
                                    offLabel="OFF"
                                    onIcon="pi pi-check"
                                    offIcon="pi pi-times"
                                    styleClass="w-full"
                                    inputId="swslug"
                                ></p-togglebutton>
                            </div>

                            <!-- Input Slug -->
                            <div class="md:col-span-1">
                                <p-floatLabel variant="on">
                                    <input
                                        pInputText
                                        formControlName="slug"
                                        placeholder="slug-generado-automaticamente"
                                        class="w-full"
                                        maxlength="255"
                                        (input)="onSlugInput($event)"
                                    />
                                    <label>Slug</label>
                                </p-floatLabel>
                            </div>
                        </div>
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
                                    (input)="onUrlBannerChange($event)"
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
                            <button
                                pButton
                                type="button"
                                icon="pi pi-upload"
                                (click)="triggerFileInput()"
                                [loading]="uploadingImage"
                                pTooltip="Cargar imagen desde archivo"
                                class="p-button-success"
                            ></button>
                            <button
                                pButton
                                type="button"
                                [icon]="imagePreviewCollapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"
                                (click)="toggleImagePreview()"
                                pTooltip="Mostrar/ocultar preview"
                                class="p-button-text"
                                [disabled]="!bannerForm.get('url_banner')?.value || uploadingImage"
                            ></button>
                            <!-- Input file oculto -->
                            <input
                                #fileInput
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                (change)="onFileSelected($event)"
                                style="display: none;"
                            />
                        </div>
                        <!-- Estado de carga de imagen -->
                        <div class="mt-3" *ngIf="uploadingImage">
                            <div class="border border-blue-300 rounded-lg p-4 bg-blue-50">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-spin pi-spinner text-blue-600"></i>
                                    <div>
                                        <div class="font-medium text-blue-800">Subiendo imagen...</div>
                                        <div class="text-sm text-blue-600" *ngIf="selectedImageFile">
                                            {{ selectedImageFile.name }} ({{ formatFileSize(selectedImageFile.size) }})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Preview del banner colapsable -->
                        <div class="mt-3" *ngIf="bannerForm.get('url_banner')?.value && !uploadingImage && !imagePreviewCollapsed">
                            <div class="border border-green-300 rounded-lg p-4 bg-green-50">
                                <div class="max-w-2xl mx-auto">
                                    <div class="relative overflow-hidden rounded-lg">
                                        <img
                                            [src]="bannerForm.get('url_banner')?.value"
                                            [alt]="bannerForm.get('nombre')?.value"
                                            class="w-full max-h-96 object-contain rounded border"
                                            (error)="onImageError($event)"
                                        />
                                        <div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                            <i class="pi pi-check"></i>
                                            Cargado
                                        </div>
                                    </div>
                                    <div class="mt-2 text-xs text-gray-600 text-center">
                                        URL_IMG obtenida automáticamente
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- URL Landing -->
                    <div>
                        <label class="text-sm font-medium text-gray-700 mb-2 block">URL Landing</label>
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
                                icon="pi pi-upload"
                                (click)="triggerLandingFileInput()"
                                [loading]="uploadingLandingImage"
                                pTooltip="Subir imagen de destino"
                                class="p-button-success"
                            ></button>
                            <button
                                pButton
                                type="button"
                                [icon]="landingPreviewCollapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"
                                (click)="toggleLandingPreview()"
                                pTooltip="Mostrar/ocultar preview"
                                class="p-button-text"
                                [disabled]="!bannerForm.get('url_banner_call')?.value || uploadingLandingImage"
                            ></button>
                            <!-- Input file oculto para landing -->
                            <input
                                #landingFileInput
                                type="file"
                                accept="image/jpeg,image/png,image/gif"
                                (change)="onLandingFileSelected($event)"
                                style="display: none;"
                            />
                        </div>

                        <!-- Estado de carga de imagen landing -->
                        <div class="mt-2" *ngIf="uploadingLandingImage">
                            <div class="border border-blue-300 rounded-lg p-3 bg-blue-50">
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-spin pi-spinner text-blue-600"></i>
                                    <div class="text-sm text-blue-800">Subiendo imagen de destino...</div>
                                </div>
                            </div>
                        </div>

                        <!-- Preview del landing colapsable -->
                        <div class="mt-3" *ngIf="bannerForm.get('url_banner_call')?.value && !uploadingLandingImage && !landingPreviewCollapsed">
                            <div class="border border-green-300 rounded-lg p-4 bg-green-50">
                                <div class="max-w-2xl mx-auto">
                                    <div class="relative overflow-hidden rounded-lg">
                                        <img
                                            [src]="bannerForm.get('url_banner_call')?.value"
                                            [alt]="bannerForm.get('nombre')?.value"
                                            class="w-full max-h-96 object-contain rounded border"
                                            (error)="onImageError($event)"
                                        />
                                        <div class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                            <i class="pi pi-check"></i>
                                            Cargado
                                        </div>
                                    </div>
                                    <div class="mt-2 text-xs text-gray-600 text-center">
                                        URL_IMG obtenida automáticamente
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tipo Redireccionamiento, Sucursales y Orden en el mismo renglón -->
                    <div class="grid grid-cols-3 gap-4">
                        <!-- Tipo Redireccionamiento -->
                        <div>
                            <p-floatLabel variant="on">
                                <p-select
                                    formControlName="tipo_call"
                                    [options]="tipoCallOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    (onChange)="onTipoCallChange($event)"
                                    class="w-full"
                                    appendTo="body"
                                    [style]="{'z-index': '9999'}"
                                ></p-select>
                                <label>Tipo Redireccionamiento *</label>
                            </p-floatLabel>
                        </div>

                        <!-- Sucursales -->
                        <div>
                            <p-floatLabel variant="on">
                                <p-multiSelect
                                    formControlName="sucursales"
                                    [options]="sucursalesOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Seleccionar sucursales"
                                    class="w-full"
                                    [maxSelectedLabels]="3"
                                    appendTo="body"
                                    [style]="{'z-index': '9999'}"
                                ></p-multiSelect>
                                <label>Sucursales</label>
                            </p-floatLabel>
                        </div>

                        <!-- Orden -->
                        <div>
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    type="number"
                                    formControlName="orden"
                                    placeholder="Orden"
                                    class="w-20"
                                    min="1"
                                />
                                <label>Orden *</label>
                            </p-floatLabel>
                        </div>
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
                                appendTo="body"
                                [style]="{'z-index': '9999'}"
                            ></p-select>
                            <label>Colección</label>
                        </p-floatLabel>
                    </div>

                    <!-- Programado con fechas en el mismo renglón -->
                    <div class="flex items-center gap-4">
                        <p-tag
                            [value]="bannerForm.get('swsched')?.value ? 'Programado' : 'Permanente'"
                            [severity]="bannerForm.get('swsched')?.value ? 'warning' : 'info'"
                            (click)="toggleFormField('swsched')"
                            class="cursor-pointer hover:opacity-80 transition-opacity"
                            pTooltip="Click para activar/desactivar programación. Si está programado, se mostrarán campos de fecha inicio y fin."
                        ></p-tag>

                        <!-- Fechas en el mismo renglón (solo si está programado) -->
                        <div *ngIf="bannerForm.get('swsched')?.value" class="flex items-center gap-4 ml-4">
                            <div class="flex items-center gap-2">
                                <label class="text-sm font-medium text-gray-700">Inicio:</label>
                                <input
                                    pInputText
                                    type="date"
                                    formControlName="fecha_ini"
                                    placeholder="Seleccionar fecha inicio"
                                    class="w-40"
                                />
                            </div>
                            <div class="flex items-center gap-2">
                                <label class="text-sm font-medium text-gray-700">Fin:</label>
                                <input
                                    pInputText
                                    type="date"
                                    formControlName="fecha_fin"
                                    placeholder="Seleccionar fecha fin"
                                    class="w-40"
                                />
                            </div>
                        </div>
                    </div>

                <!-- Sección informativa -->
                <div *ngIf="isEditingBanner && bannerSeleccionado" class="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 class="text-lg font-semibold mb-3">Información del Registro</h4>
                    <div class="flex flex-wrap gap-6 text-sm">
                        <div class="flex-1 min-w-0">
                            <label class="font-medium text-gray-700">Creado por:</label>
                            <p class="text-gray-600">{{ bannerSeleccionado.usr_a }}</p>
                        </div>
                        <div class="flex-1 min-w-0">
                            <label class="font-medium text-gray-700">Fecha creación:</label>
                            <p class="text-gray-600">{{ bannerSeleccionado.fecha_a | date:'dd/MM/yyyy HH:mm' }}</p>
                        </div>
                        <div *ngIf="bannerSeleccionado.usr_m" class="flex-1 min-w-0">
                            <label class="font-medium text-gray-700">Modificado por:</label>
                            <p class="text-gray-600">{{ bannerSeleccionado.usr_m }}</p>
                        </div>
                        <div *ngIf="bannerSeleccionado.fecha_m" class="flex-1 min-w-0">
                            <label class="font-medium text-gray-700">Última modificación:</label>
                            <p class="text-gray-600">{{ bannerSeleccionado.fecha_m | date:'dd/MM/yyyy HH:mm' }}</p>
                        </div>
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
                        [attr.data-debug]="isEditingBanner ? 'modo-editar' : 'modo-crear'"
                        [disabled]="!bannerForm.valid || savingBanner"
                        [loading]="savingBanner"
                        class="p-button-primary"
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

        <!-- Modal de confirmación usando ConfirmationService -->
        <p-confirmDialog></p-confirmDialog>

        <!-- Modal de preview URL -->
        <p-dialog
            [(visible)]="showUrlPreviewModal"
            header="Vista Previa de URL"
            [modal]="true"
            [style]="{width: '90vw', height: '80vh'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
            (onHide)="onPreviewModalClose()"
        >
            <div class="w-full h-full">
                <iframe
                    *ngIf="sanitizedPreviewUrl"
                    [src]="sanitizedPreviewUrl"
                    class="w-full h-full border-0 rounded"
                    title="Vista previa"
                ></iframe>
                <div *ngIf="!sanitizedPreviewUrl && previewUrlValue" class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <i class="pi pi-exclamation-triangle text-3xl text-yellow-500 mb-2"></i>
                        <p class="text-gray-600">Cargando vista previa...</p>
                    </div>
                </div>
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

        /* Estilos para el botón de estado con tamaño fijo */
        :host ::ng-deep .p-tag.status-tag {
            min-width: 100px;
            display: inline-block;
            text-align: center;
            font-weight: 600;
        }

        /* Estilos para banners deshabilitados - gama gris */
        .banner-disabled {
            opacity: 0.75;
            background-color: rgba(156, 163, 175, 0.08);
            border-left: 3px solid #6b7280;
        }

        .banner-disabled:hover {
            background-color: rgba(156, 163, 175, 0.12);
        }
    
        /* Estilos para ToggleButton personalizado */
        :host ::ng-deep .p-togglebutton {
            width: 100%;
            height: 2.5rem;
        }
    
        :host ::ng-deep .p-togglebutton .p-button {
            width: 100%;
            height: 100%;
            border-radius: 0.375rem;
            font-weight: 600;
            transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
        }
    
        /* Estado OFF - Gris */
        :host ::ng-deep .p-togglebutton .p-button:not(.p-highlight) {
            background-color: #f3f4f6 !important;
            border-color: #d1d5db !important;
            color: #6b7280 !important;
        }

        :host ::ng-deep .p-togglebutton .p-button:not(.p-highlight):hover {
            background-color: #e5e7eb !important;
            border-color: #9ca3af !important;
        }

        /* Estado ON - Verde Ultra Brillante - Múltiples selectores para máxima compatibilidad */
        :host ::ng-deep .p-togglebutton.p-togglebutton-checked .p-button,
        :host ::ng-deep .p-togglebutton .p-button.p-highlight,
        :host ::ng-deep p-togglebutton.p-togglebutton-checked .p-button,
        :host ::ng-deep p-togglebutton .p-button.p-highlight,
        /* Selector específico por ID para máxima especificidad */
        :host ::ng-deep p-togglebutton[inputId="swslug"].p-togglebutton-checked .p-button,
        :host ::ng-deep p-togglebutton[inputId="swslug"] .p-button.p-highlight {
            background: #22c55e !important; /* Verde sólido primero para probar */
            background: linear-gradient(135deg, #00ff88 0%, #22c55e 50%, #16a34a 100%) !important;
            border-color: #22c55e !important;
            color: white !important;
            box-shadow: 0 4px 8px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.3) !important;
            font-weight: 700 !important;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        }

        :host ::ng-deep .p-togglebutton.p-togglebutton-checked .p-button:hover,
        :host ::ng-deep .p-togglebutton .p-button.p-highlight:hover,
        :host ::ng-deep p-togglebutton.p-togglebutton-checked .p-button:hover,
        :host ::ng-deep p-togglebutton .p-button.p-highlight:hover,
        /* Selector específico por ID para máxima especificidad */
        :host ::ng-deep p-togglebutton[inputId="swslug"].p-togglebutton-checked .p-button:hover,
        :host ::ng-deep p-togglebutton[inputId="swslug"] .p-button.p-highlight:hover {
            background: #16a34a !important; /* Verde sólido hover primero para probar */
            background: linear-gradient(135deg, #00dd77 0%, #16a34a 50%, #15803d 100%) !important;
            border-color: #16a34a !important;
            box-shadow: 0 6px 12px rgba(34, 197, 94, 0.7), 0 0 30px rgba(34, 197, 94, 0.4) !important;
            transform: translateY(-2px) scale(1.02) !important;
        }
    
        /* Iconos del ToggleButton */
        :host ::ng-deep .p-togglebutton .p-button .p-button-icon {
            margin-right: 0.5rem;
        }

        /* Estilos para filas inactivas */
        :host ::ng-deep tr.banner-inactive {
            background-color: #f9fafb !important;
        }

        :host ::ng-deep tr.banner-inactive:hover {
            background-color: #f3f4f6 !important;
        }

        :host ::ng-deep tr.banner-inactive td {
            color: #6b7280 !important;
        }

        /* Estilos para ToggleSwitch */
/*        :host ::ng-deep .status-toggle.p-toggleswitch {
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
        }
*/

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
    togglingStatus = false;

    // Estados para carga de imágenes
    uploadingImage = false;
    selectedImageFile: File | null = null;

    // Estados para previews colapsables
    imagePreviewCollapsed = true; // Inicia colapsado
    landingPreviewCollapsed = true; // Inicia colapsado
    uploadingLandingImage = false;
    selectedLandingFile: File | null = null;

    // Modales
    showBannerModal = false;
    showConfirmDeleteBanner = false;

    // Formulario
    bannerForm!: FormGroup;
    isEditingBanner = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Control de estado temporal del ToggleSwitch
    toggleStates: { [key: string]: boolean } = {};

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
    sanitizedPreviewUrl: SafeResourceUrl | null = null;

    // Banner seleccionado para edición
    bannerSeleccionado: Banner | null = null;

    // Servicios
    private bannerService = inject(BannerService);
    private catConceptosDetService = inject(CatConceptosDetService);
    private collService = inject(CollService);
    private sucService = inject(SucService);
    private imageUploadService = inject(ImageUploadService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    public sanitizer = inject(DomSanitizer);

    // Método público para acceder al servicio desde el template
    public formatFileSize(bytes: number): string {
        return this.imageUploadService.formatFileSize(bytes);
    }

    // ViewChild para tabla y file inputs
    @ViewChild('dtBanners') dtBanners!: Table;
    @ViewChild('fileInput') fileInput!: any;
    @ViewChild('landingFileInput') landingFileInput!: any;

    ngOnInit(): void {
        this.initializeForms();
        this.cargarOpcionesCatalogo();
        this.cargarBanners();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Detectar cambios en el componente seleccionado y recargar banners
        if (changes['componenteSeleccionado']) {
            this.cargarBanners();
        }
    }

    // ========== INICIALIZACIÓN ==========

    initializeForms(): void {
        // Fechas por defecto como strings
        const fechaHoy = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 7);
        
        const fechaHoyStr = this.formatDate(fechaHoy);
        const fechaFinStr = this.formatDate(fechaFin);

        this.bannerForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.maxLength(100)]],
            url_banner: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
            url_banner_call: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            tipo_call: ['NONE', [Validators.required]],
            call: [''],
            id_coll: [null],
            sucursales: [[]],
            swsched: [0],
            fecha_ini: [fechaHoyStr],
            fecha_fin: [fechaFinStr],
            orden: [1, [Validators.required, Validators.min(1)]],
            swEnable: [1],
            swslug: [0],
            slug: [{value: '', disabled: true}] // Slug deshabilitado inicialmente
        });
    }

    // ========== CARGA DE DATOS ==========

    /**
     * Retorna el tooltip apropiado para el botón de refresh
     */
    getRefreshTooltip(): string {
        if (this.loadingBanners) {
            return 'Cargando...';
        }
        if (!this.componenteSeleccionado) {
            return 'Seleccione un contenedor del tab "Contenedores" para ver sus banners';
        }
        return `Actualizar banners de "${this.componenteSeleccionado.nombre}"`;
    }

    /**
     * Carga los banners del componente seleccionado
     * Si no hay componente seleccionado, muestra mensaje informativo
     */
    cargarBanners(): void {
        // Si no hay componente seleccionado, intentar cargar todos los banners o mostrar mensaje
        if (!this.componenteSeleccionado) {
            // Opción 1: Limpiar lista y mostrar mensaje
            this.banners = [];
            this.loadingBanners = false;

            this.messageService.add({
                severity: 'info',
                summary: 'Seleccione un Contenedor',
                detail: 'Seleccione un contenedor del tab "Contenedores" para ver sus banners',
                life: 3000
            });
            return;

            // Opción 2: Si quieres cargar TODOS los banners sin filtro (descomenta si lo prefieres):
            /*
            this.loadingBanners = true;
            console.log('📊 Cargando TODOS los banners (sin filtro de componente)');

            this.bannerService.getAllBanners().subscribe({
                next: (response) => {
                    console.log('✅ Todos los banners cargados:', response.data);
                    this.banners = response.data;
                    this.loadingBanners = false;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Datos Actualizados',
                        detail: `${this.banners.length} banners cargados (todos)`
                    });
                },
                error: (error) => {
                    console.error('❌ Error cargando todos los banners:', error);
                    this.loadingBanners = false;

                    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar banners';

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al cargar banners',
                        detail: errorMessage,
                        life: 5000
                    });
                }
            });
            return;
            */
        }

        this.loadingBanners = true;

        this.bannerService.getBannersByComponente(this.componenteSeleccionado.id_comp).subscribe({
            next: (response) => {
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
            // Modo edición
            this.bannerSeleccionado = banner;

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
                swEnable: banner.swEnable,
                swslug: banner.swslug,
                slug: banner.slug
            });

            // Configurar el estado del campo slug según swslug
            if (banner.swslug && banner.swslug === 1) {
                this.bannerForm.get('slug')?.enable();
            } else {
                this.bannerForm.get('slug')?.disable();
            }

            // Agregar fechas si están programadas
            if (banner.swsched && banner.fecha_ini) {
                this.bannerForm.patchValue({
                    fecha_ini: this.formatDate(new Date(banner.fecha_ini))
                });
            }
            if (banner.swsched && banner.fecha_fin) {
                this.bannerForm.patchValue({
                    fecha_fin: this.formatDate(new Date(banner.fecha_fin))
                });
            }

            // Trigger change para actualizar campos condicionales
            this.onTipoCallChange({ value: banner.tipo_call });
        } else {
            // Modo creación
            this.bannerSeleccionado = null;

            const fechaHoy = new Date();
            const fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + 7);

            this.bannerForm.reset({
                tipo_call: 'NONE',
                fecha_ini: this.formatDate(fechaHoy),
                fecha_fin: this.formatDate(fechaFin),
                orden: this.banners.length + 1,
                swsched: 0,
                swEnable: 1,
                swslug: 0,
                slug: ''
            });

            // Asegurar que el campo slug esté deshabilitado para nuevos banners
            this.bannerForm.get('slug')?.disable();
        }

        this.showBannerModal = true;
    }

    closeBannerForm(): void {
        this.showBannerModal = false;
        this.bannerForm.reset();
        // Asegurar que el campo slug esté deshabilitado al cerrar el formulario
        this.bannerForm.get('slug')?.disable();
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
                swEnable: formData.swEnable ? 1 : 0,
                swslug: formData.swslug ? 1 : 0,
                slug: formData.slug || ''
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
                // Validar que el ID sea válido
                if (!this.bannerSeleccionado.id_mb || isNaN(Number(this.bannerSeleccionado.id_mb))) {
                    console.error('❌ ID del banner no es válido:', this.bannerSeleccionado.id_mb);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de Validación',
                        detail: 'El ID del banner no es válido para actualizar',
                        life: 5000
                    });
                    this.savingBanner = false;
                    return;
                }

                // Actualizar
                const updateData: UpdateBannerRequest = {
                    id_mb: this.bannerSeleccionado.id_mb,
                    ...processedData
                };

                this.bannerService.updateBanner(updateData).subscribe({
                    next: (response) => {
                        this.handleSaveSuccess('Banner actualizado correctamente');
                    },
                    error: (error) => {
                        this.handleSaveError(error, 'actualizar');
                    }
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

        // Intentar extraer mensaje del error de diferentes formas
        if (error) {
            // Forma 1: error.mensaje (como viene del backend)
            if (error.mensaje) {
                errorMessage = error.mensaje;
            }
            // Forma 2: error.message (Error estándar)
            else if (error.message) {
                errorMessage = error.message;
            }
            // Forma 3: error.error?.mensaje (respuesta HTTP anidada)
            else if (error.error && error.error.mensaje) {
                errorMessage = error.error.mensaje;
            }
            // Forma 4: error.error?.message
            else if (error.error && error.error.message) {
                errorMessage = error.error.message;
            }
            // Forma 5: string directo
            else if (typeof error === 'string') {
                errorMessage = error;
            }
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
    }

    saveInlineEditBanner(banner: Banner, field: string): void {
        if ((banner as any)[field] === this.originalValue) {
            this.cancelInlineEdit();
            return;
        }

        // Aplicar formateo según el campo
        let formattedValue = (banner as any)[field];
        if (field === 'nombre') {
            formattedValue = this.toPascalCase(formattedValue);
            (banner as any)[field] = formattedValue;
        }

        const updateData: UpdateBannerRequest = {
            id_mb: banner.id_mb,
            [field]: formattedValue
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

                // Revertir el cambio local
                (banner as any)[field] = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;

                // Mostrar mensaje de error al usuario
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido al actualizar';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al actualizar',
                    detail: `${this.getFieldLabel(field)}: ${errorMessage}`,
                    life: 5000
                });
            }
        });
    }

    cancelInlineEdit(): void {
        this.editingCell = null;
        this.originalValue = null;
    }

    // ========== TOGGLE DE CAMPOS ==========

    onBannerStatusClick(banner: Banner, event: Event): void {
        event.stopPropagation();
        // Simular el cambio del ToggleSwitch para mostrar confirmación
        const nuevoValor = banner.swEnable === 1 ? false : true;
        this.onToggleSwitchChange(nuevoValor, banner);
    }

    getBannerToggleState(banner: Banner): boolean {
        // Usar el estado temporal si existe, sino usar el estado real
        const tempState = this.toggleStates[banner.id_mb];
        return tempState !== undefined ? tempState : banner.swEnable === 1;
    }

    onToggleSwitchChange(isChecked: boolean, banner: Banner): void {
        const valorActual = banner.swEnable;
        const nuevoValor = isChecked ? 1 : 0;

        // Si el valor no cambió, no hacer nada
        if (nuevoValor === valorActual) {
            return;
        }

        // Para activación, hacer el cambio directamente
        if (nuevoValor === 1) {
            this.procesarCambioEstadoDirecto(banner, 1);
            return;
        }

        // Para desactivación, mostrar confirmación
        // Establecer estado temporal para mostrar el cambio visual
        this.toggleStates[banner.id_mb] = false;

        this.confirmationService.confirm({
            message: `¿Está seguro de que desea deshabilitar el banner "${banner.nombre}"?`,
            header: 'Confirmar Desactivación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Deshabilitar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                // Limpiar estado temporal y procesar el cambio
                delete this.toggleStates[banner.id_mb];
                this.procesarCambioEstadoDirecto(banner, 0);
            },
            reject: () => {
                // Revertir el estado temporal al estado original
                delete this.toggleStates[banner.id_mb];
            }
        });
    }

    private procesarCambioEstadoDirecto(banner: Banner, nuevoValor: number): void {
        const valorAnterior = banner.swEnable;

        // Aplicar el cambio optimista
        banner.swEnable = nuevoValor;

        // Mostrar loading state
        this.togglingStatus = true;

        this.bannerService.toggleBannerStatus(banner.id_mb, nuevoValor === 1).subscribe({
            next: (response) => {
                this.togglingStatus = false;

                const estadoTexto = nuevoValor === 1 ? 'ACTIVO' : 'DESACTIVADO';
                const icono = nuevoValor === 1 ? '✅' : '🚫';

                this.messageService.add({
                    severity: nuevoValor === 1 ? 'success' : 'warn',
                    summary: `Banner ${estadoTexto}`,
                    detail: `${icono} El banner "${banner.nombre}" ha sido ${estadoTexto.toLowerCase()} correctamente`,
                    life: 4000
                });
            },
            error: (error) => {
                this.togglingStatus = false;
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local en caso de error
                banner.swEnable = valorAnterior;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cambiar estado',
                    detail: `No se pudo cambiar el estado del banner "${banner.nombre}". Se revirtió el cambio.`,
                    life: 6000
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
        const newValue = currentValue === 1 ? 0 : 1;
        this.bannerForm.patchValue({ [fieldName]: newValue });
    }

    private formatDate(date: Date | string | null | undefined): string {
        if (!date) {
            return '';
        }

        let dateObj: Date;

        if (typeof date === 'string') {
            // Si es un string, intentar convertirlo a Date
            dateObj = new Date(date);
            // Verificar si la conversión fue exitosa
            if (isNaN(dateObj.getTime())) {
                console.error('❌ Fecha inválida recibida en formatDate:', date);
                return '';
            }
        } else if (date instanceof Date) {
            dateObj = date;
        } else {
            console.error('❌ Tipo de dato inválido recibido en formatDate:', typeof date, date);
            return '';
        }

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
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
            },
            error: (error) => {
                console.error('❌ Error cargando tipos de call:', error);
                this.tipoCallOptions = [{ label: 'Ninguno', value: 'NONE', valor1: 0 }];
            }
        });
    }

    private cargarCollectionsOptions(): void {
        // Cargar colecciones desde el servicio
        this.collService.getAllCollections().subscribe({
            next: (response) => {
                if (response && response.data) {
                    this.collectionsOptions = response.data.map(coll => ({
                        label: coll.nombre || `Colección ${coll.id_coll}`,
                        value: coll.id_coll
                    }));
                } else {
                    // Fallback a mockup si no hay datos
                    this.collectionsOptions = [
                        { label: 'Colección Principal', value: 1 },
                        { label: 'Colección Secundaria', value: 2 },
                        { label: 'Colección Promocional', value: 3 }
                    ];
                }
            },
            error: (error) => {
                console.error('❌ Error cargando colecciones:', error);
                // Fallback a mockup en caso de error
                this.collectionsOptions = [
                    { label: 'Colección Principal', value: 1 },
                    { label: 'Colección Secundaria', value: 2 },
                    { label: 'Colección Promocional', value: 3 }
                ];
                console.log('📊 Opciones de colecciones (fallback por error):', this.collectionsOptions);
            }
        });
    }

    private cargarSucursalesOptions(): void {

        // Verificar que el servicio esté disponible antes de usarlo
        if (!this.sucService) {
            console.error('❌ SucService no está disponible');
            return;
        }

        this.sucService.getAllSucursales({
            filters: {
                id_proy: 2,
                estado: 'A'
            }
        }).subscribe({
            next: (response) => {
                if (response && response.data) {
                    // Filtrar adicionalmente por id_proy = 2 y estado = 'A' por si acaso
                    const sucursalesFiltradas = response.data.filter(suc =>
                        suc.id_proy === 2 && suc.estado === 'A'
                    );

                    this.sucursalesOptions = sucursalesFiltradas.map(suc => ({
                        label: suc.tienda,
                        value: suc.sucursal
                    }));

                } else {
                    this.sucursalesOptions = [];
                }
            },
            error: (error) => {
                console.error('❌ Error cargando sucursales:', error);

                // Fallback a opciones mockup para desarrollo/testing
                this.sucursalesOptions = [
                    {
                        label: '🏪 [MOCKUP] Sucursal Centro - Tijuana',
                        value: 1
                    },
                    {
                        label: '🏪 [MOCKUP] Sucursal Norte - Tijuana',
                        value: 2
                    },
                    {
                        label: '🏪 [MOCKUP] Sucursal Sur - Tijuana',
                        value: 3
                    }
                ];

                console.log('📊 Usando sucursales mockup por error del backend:', this.sucursalesOptions);

                // Mostrar mensaje de error específico del backend
                const errorTitle = error.titulo || 'Error al cargar sucursales';
                const errorMessage = error.mensaje || 'No se pudieron cargar las sucursales disponibles. Se muestran datos de ejemplo.';

                this.messageService.add({
                    severity: 'warn', // Cambiado a 'warn' porque hay fallback
                    summary: errorTitle,
                    detail: errorMessage,
                    life: 8000 // Más tiempo para leer sobre el fallback
                });

                // También mostrar información sobre el mockup
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Datos de ejemplo',
                        detail: 'Se están mostrando sucursales de ejemplo porque el servicio backend no está disponible.',
                        life: 5000
                    });
                }, 1000);
            }
        });
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
        this.mostrarCollectionSelector = selectedTipo?.toLowerCase() === 'coll';

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

        // ✅ Sanitizar la URL para uso seguro en iframe
        this.previewUrlValue = url;
        this.sanitizedPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.showUrlPreviewModal = true;
    }

    onImageError(event: any): void {
        console.warn('Error cargando imagen del banner:', event);
        // El fallback ya está manejado en el template con los iconos alternativos
    }

    // ========== UTILIDADES ==========

    onUrlBannerChange(event: any): void {
        const urlBanner = event.target.value;
        // Replicar la URL del banner en la URL Landing si está vacía
        if (urlBanner && !this.bannerForm.get('url_banner_call')?.value) {
            this.bannerForm.patchValue({ url_banner_call: urlBanner });
        }
    }

    // ========== CARGA DE IMÁGENES ==========

    /**
     * Activa el input file oculto cuando se hace click en el botón
     */
    triggerFileInput(): void {
        if (this.fileInput) {
            this.fileInput.nativeElement.click();
        }
    }

    /**
     * Maneja la selección de archivos
     */
    onFileSelected(event: any): void {
        const file = event.target.files[0] as File;
        if (file) {
            // Validar archivo
            const validation = this.imageUploadService.validateFiles([file]);
            if (!validation.isValid) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Archivo Inválido',
                    detail: validation.errors.join('. '),
                    life: 5000
                });
                return;
            }

            // Mostrar warnings si existen
            if (validation.warnings.length > 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: validation.warnings.join('. '),
                    life: 3000
                });
            }

            // Guardar archivo y proceder con la carga
            this.selectedImageFile = file;
            this.uploadImage(file);
        }
    }

    /**
     * Sube la imagen y actualiza el campo URL_BANNER automáticamente
     */
    uploadImage(file: File): void {
        this.uploadingImage = true;

        this.imageUploadService.uploadSingleBannerImage(file).subscribe({
            next: (response) => {
                this.uploadingImage = false;

                if (response.images && response.images.length > 0) {
                    const imageData = response.images[0];
                    const urlImg = imageData.img;

                    // Actualizar automáticamente el campo URL_BANNER
                    this.bannerForm.patchValue({
                        url_banner: urlImg
                    });

                    // Actualizar también URL Landing si está vacía
                    if (!this.bannerForm.get('url_banner_call')?.value) {
                        this.bannerForm.patchValue({
                            url_banner_call: urlImg
                        });
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Imagen Cargada',
                        detail: `La imagen "${imageData.name}" se ha subido correctamente`,
                        life: 3000
                    });

                    // Limpiar archivo seleccionado
                    this.selectedImageFile = null;

                    // Resetear el input file
                    if (this.fileInput) {
                        this.fileInput.nativeElement.value = '';
                    }
                }
            },
            error: (error) => {
                this.uploadingImage = false;
                console.error('❌ Error al subir imagen:', error);

                const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir la imagen';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al Subir Imagen',
                    detail: errorMessage,
                    life: 5000
                });

                // Limpiar archivo seleccionado en caso de error
                this.selectedImageFile = null;
            }
        });
    }

    /**
     * Maneja el cierre del modal de preview
     */
    onPreviewModalClose(): void {
        this.clearPreviewData();
    }

    /**
     * Toggle para mostrar/ocultar preview de imagen
     */
    toggleImagePreview(): void {
        this.imagePreviewCollapsed = !this.imagePreviewCollapsed;
    }

    /**
     * Toggle para mostrar/ocultar preview de URL landing
     */
    toggleLandingPreview(): void {
        this.landingPreviewCollapsed = !this.landingPreviewCollapsed;
    }

    /**
     * Activa el input file para landing
     */
    triggerLandingFileInput(): void {
        if (this.landingFileInput) {
            this.landingFileInput.nativeElement.click();
        }
    }

    /**
     * Maneja la selección de archivos para landing
     */
    onLandingFileSelected(event: any): void {
        const file = event.target.files[0] as File;
        if (file) {

            // Validar archivo
            const validation = this.imageUploadService.validateFiles([file]);
            if (!validation.isValid) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Archivo Inválido',
                    detail: validation.errors.join('. '),
                    life: 5000
                });
                return;
            }

            // Mostrar warnings si existen
            if (validation.warnings.length > 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: validation.warnings.join('. '),
                    life: 3000
                });
            }

            // Guardar archivo y proceder con la carga
            this.selectedLandingFile = file;
            this.uploadLandingImage(file);
        }
    }

    /**
     * Sube la imagen de landing
     */
    uploadLandingImage(file: File): void {
        this.uploadingLandingImage = true;

        this.imageUploadService.uploadSingleBannerImage(file).subscribe({
            next: (response) => {
                this.uploadingLandingImage = false;

                if (response.images && response.images.length > 0) {
                    const imageData = response.images[0];
                    const urlImg = imageData.img;

                    // Actualizar el campo URL_BANNER_CALL con la nueva URL
                    this.bannerForm.patchValue({
                        url_banner_call: urlImg
                    });

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Imagen de Destino Cargada',
                        detail: `La imagen "${imageData.name}" se ha subido correctamente`,
                        life: 3000
                    });

                    // Limpiar archivo seleccionado
                    this.selectedLandingFile = null;

                    // Resetear el input file
                    if (this.landingFileInput) {
                        this.landingFileInput.nativeElement.value = '';
                    }
                }
            },
            error: (error) => {
                this.uploadingLandingImage = false;
                console.error('❌ Error al subir imagen landing:', error);

                const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir la imagen';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al Subir Imagen de Destino',
                    detail: errorMessage,
                    life: 5000
                });

                // Limpiar archivo seleccionado en caso de error
                this.selectedLandingFile = null;
            }
        });
    }

    /**
     * Limpia las URLs del preview cuando se cierra el modal
     */
    clearPreviewData(): void {
        this.previewUrlValue = '';
        this.sanitizedPreviewUrl = null;
    }

    // ========== FORMATEO DE TEXTO ==========

    onNombreInput(event: any): void {
        const input = event.target;
        const pascalCaseValue = this.toPascalCase(input.value);
        input.value = pascalCaseValue;
        this.bannerForm.patchValue({ nombre: pascalCaseValue });

        // Generar slug automáticamente si swSlug está activado y el campo slug está habilitado
        if (this.bannerForm.get('swslug')?.value && this.bannerForm.get('slug')?.enabled) {
            const slug = this.generateSlug(pascalCaseValue);
            this.bannerForm.patchValue({ slug: slug });
        }
    }

    onSwSlugChange(event: any): void {
        // Obtener el valor correcto del ToggleButton
        let swSlugValue: number;

        if (event && typeof event.checked === 'boolean') {
            // ToggleButton devuelve boolean directamente
            swSlugValue = event.checked ? 1 : 0;
        } else if (event && typeof event === 'boolean') {
            // En algunos casos el evento es directamente un boolean
            swSlugValue = event ? 1 : 0;
        } else {
            // Fallback: obtener el valor actual del form control
            const currentValue = this.bannerForm.get('swslug')?.value;
            swSlugValue = currentValue ? 0 : 1; // Toggle del valor actual
        }

        // Actualizar el form control
        this.bannerForm.patchValue({ swslug: swSlugValue });

        if (swSlugValue) {
            // Si se activa el botón, generar slug desde el nombre actual
            const nombre = this.bannerForm.get('nombre')?.value || '';
            const slug = this.generateSlug(nombre);
            this.bannerForm.patchValue({ slug: slug });
            // Habilitar el campo slug
            this.bannerForm.get('slug')?.enable();
        } else {
            // Si se desactiva, limpiar el slug y deshabilitar el campo
            this.bannerForm.patchValue({ slug: '' });
            this.bannerForm.get('slug')?.disable();
        }
    }

    onSlugInput(event: any): void {
        // Permitir edición manual del slug cuando swSlug está activado y el campo está habilitado
        if (this.bannerForm.get('swslug')?.value && this.bannerForm.get('slug')?.enabled) {
            const slugValue = this.sanitizeSlug(event.target.value);
            this.bannerForm.patchValue({ slug: slugValue });
        }
    }

    private generateSlug(text: string): string {
        if (!text || typeof text !== 'string') {
            return '';
        }

        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
            .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos con guiones
            .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
    }

    private sanitizeSlug(slug: string): string {
        if (!slug || typeof slug !== 'string') {
            return '';
        }

        return slug
            .toLowerCase()
            .trim()
            .replace(/[^\w-]/g, '') // Solo letras, números, guiones
            .replace(/-+/g, '-') // Evitar múltiples guiones consecutivos
            .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
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
