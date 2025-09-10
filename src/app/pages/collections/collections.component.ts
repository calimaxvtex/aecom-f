import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputMaskModule } from 'primeng/inputmask';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';


// Modelos y servicios
import { CollItem, CollTypeItem, ColldItem, CreateColldRequest, UpdateColldRequest } from '@/features/coll/models/coll.interface';
import { CollService } from '@/features/coll/services/coll.service';
import { ColldService } from '@/features/coll/services/colld.service';
import { SessionService } from '@/core/services/session.service';

// Import del ItemsComponent
import { ItemsComponent } from './items.component';

@Component({
    selector: 'app-collections',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TabsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        SelectButtonModule,
        InputMaskModule,
        ToggleSwitchModule,
        SplitButtonModule,
        CardModule,  // Para las tarjetas de información
        TooltipModule,  // Para tooltips
        // Import del ItemsComponent
        ItemsComponent
    ],
    providers: [MessageService],
    template: `
        <div class="card">
            <p-toast></p-toast>




            <!-- Pestañas principales -->
            <p-tabs [value]="activeTabIndex.toString()">
                <!-- Contenedor flex: tabs a la izquierda, indicador de colección a la derecha -->
                <div class="flex items-center justify-between">
                    <p-tablist>
                        <p-tab value="0">
                            <i class="pi pi-folder mr-2"></i>
                            Colecciones
                        </p-tab>
                        <p-tab value="1" (click)="onTabClick(1)">
                            <i class="pi pi-list mr-2"></i>
                            Items
                        </p-tab>
                        <p-tab value="2">
                            <i class="pi pi-plus mr-2"></i>
                            Add Items
                        </p-tab>
                    </p-tablist>

                    <!-- Indicador sutil de colección seleccionada -->
                    <div *ngIf="collectionSeleccionada"
                         class="flex items-center text-sm text-gray-500 ml-6 px-2 py-1">
                        <i class="pi pi-folder text-blue-400 mr-1.5 text-xs"></i>
                        <span class="font-medium text-gray-700 truncate max-w-32 sm:max-w-48"
                              title="{{collectionSeleccionada.nombre}}">
                            {{ collectionSeleccionada.nombre }}
                        </span>
                        <!-- Badge discreto con cantidad de items (solo si hay items) -->
                        <span *ngIf="colldItems.length > 0"
                              class="ml-1.5 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {{ colldItems.length }}
                        </span>
                    </div>
                </div>

                <p-tabpanels>
                    <!-- Panel 1: Colecciones CRUD -->
                    <p-tabpanel value="0">
                        <div class="mb-4">
                            <h1 class="text-2xl font-bold mb-2">🗂️ Administración de Colecciones</h1>
                             
                        </div>


                        <p-table
                            #dtTable
                            [value]="filteredCollections"
                            [paginator]="true"
                            [rows]="10"
                            [showCurrentPageReport]="true"
                            responsiveLayout="scroll"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} colecciones"
                            [rowsPerPageOptions]="[10, 25, 50]"
                            [globalFilterFields]="['nombre', 'descripcion']"
                            selectionMode="single"
                            [(selection)]="collectionSeleccionada"
                            (onRowSelect)="onCollectionSelect($event)"
                        >
                            <ng-template #caption>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <input
                                        pInputText
                                        type="text"
                                        (input)="onGlobalFilter(dtTable, $event)"
                                        placeholder="Buscar colecciones..."
                                        class="w-full sm:w-80 order-1 sm:order-0"
                                    />
                                    <div class="flex gap-2 order-0 sm:order-1 items-center">
                                        <!-- SplitButton para filtros -->
                                        <p-splitButton
                                            label="Filtrar"
                                            icon="pi pi-filter"
                                            (onClick)="clearFilters()"
                                            [model]="filterMenuItems"
                                            styleClass="p-button-sm"
                                        ></p-splitButton>

                                        <!-- Botones solo con iconos justificados a la derecha -->
                                        <div class="flex gap-1">
                                            <p-button
                                                icon="pi pi-refresh"
                                                (onClick)="cargarCollections()"
                                                [loading]="loadingCollections"
                                                styleClass="p-button-sm p-button-outlined"
                                                pTooltip="Actualizar"
                                                tooltipPosition="top"
                                                tooltipStyleClass="custom-tooltip"
                                            ></p-button>
                                            <p-button
                                                icon="pi pi-plus"
                                                (onClick)="openCollectionForm()"
                                                styleClass="p-button-sm p-button-outlined"
                                                pTooltip="Agregar Colección"
                                            ></p-button>
                                        </div>
                                    </div>
                                </div>
                            </ng-template>

                            <ng-template #header>
                                <tr>
                                    <th pSortableColumn="id_coll" style="width: 80px">ID <p-sortIcon field="id_coll"></p-sortIcon></th>
                                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                                    <th pSortableColumn="products" style="width: 100px">Products</th>
                                    <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                                    <th style="width: 100px">Banner</th>
                                    <th style="width: 150px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-collection>
                                <tr
                                    [class.bg-blue-50]="collection === collectionSeleccionada"
                                    class="cursor-pointer hover:bg-gray-50 transition-colors"
                                    (click)="onCollectionSelect({data: collection})"
                                    (dblclick)="onCollectionDoubleClick(collection)"
                                >
                                    <!-- ID - NO EDITABLE -->
                                    <td>{{collection.id_coll}}</td>

                                    <!-- Nombre - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== collection.id_coll + '_nombre'"
                                            (click)="editInlineCollection(collection, 'nombre'); $event.stopPropagation()"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{collection.nombre}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === collection.id_coll + '_nombre'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="collection.nombre"
                                                (keyup.enter)="saveInlineEditCollection(collection, 'nombre')"
                                                (keyup.escape)="cancelInlineEdit()"
                                                class="p-inputtext-sm flex-1"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Nombre de la colección"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditCollection(collection, 'nombre')"
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

                                    <!-- Products - SOLO LECTURA -->
                                    <td>{{collection.products}}</td>

                                    <!-- Estado - TOGGLE BUTTON -->
                                    <td>
                            <span (click)="toggleEstado(collection); $event.stopPropagation()">
  <p-tag
    [value]="getEstadoLabel(collection.estado)"
    [severity]="getEstadoSeverity(collection.estado)"
    class="cursor-pointer hover:opacity-80 transition-opacity">
  </p-tag>
</span>

                                    </td>

                                    <!-- Banner Preview Button -->
                                    <td>
                                        <div class="flex justify-center">
                                            <p-button
                                                icon="pi pi-eye"
                                                styleClass="p-button-sm p-button-text p-button-info"
                                                [disabled]="!collection.url_banner"
                                                (onClick)="previewBanner(collection.url_banner, collection.nombre); $event.stopPropagation()"
                                                [pTooltip]="collection.url_banner ? 'Ver banner completo' : 'No hay banner disponible'"
                                                tooltipPosition="top"
                                                tooltipStyleClass="custom-tooltip"
                                            ></p-button>
                                        </div>
                                    </td>

                                    <!-- Acciones -->
                                    <td (click)="$event.stopPropagation()">
                                        <div class="flex gap-1">
                                            <button
                                                pButton
                                                icon="pi pi-pencil"
                                                (click)="openCollectionForm(collection)"
                                                class="p-button-sm p-button-text p-button-warning"
                                                pTooltip="Editar Colección"
                                            ></button>
                                            <button
  #delBtn
  pButton
  icon="pi pi-trash"
  (click)="eliminarCollection(collection)"
  class="p-button-sm p-button-text p-button-danger"
  pTooltip="Eliminar Colección">
</button>

                                        </div>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-tabpanel>

                    <!-- Panel 2: Detalles de la Coleccion -->
                    <p-tabpanel value="1">
                        <div class="mb-4">
                            <h1 class="text-lg font-semibold mb-1">📋 Detalles de la Colección</h1>

                        </div>

                        <p-table
                            #dtTableColld
                            [value]="filteredColldItems"
                            [paginator]="true"
                            [rows]="10"
                            [showCurrentPageReport]="true"
                            responsiveLayout="scroll"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} detalles"
                            [rowsPerPageOptions]="[10, 25, 50]"
                            [globalFilterFields]="['idref', 'nombre']"
                            [loading]="loadingColld"
                        >
                            <ng-template #caption>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <input
                                        pInputText
                                        type="text"
                                        (input)="onGlobalFilter(dtTableColld, $event)"
                                        placeholder="Buscar detalles..."
                                        class="w-full sm:w-80"
                                    />
                                    <div class="flex gap-1">
                                        <p-button
                                            icon="pi pi-refresh"
                                            (onClick)="refreshColldData()"
                                            [loading]="loadingColld"
                                            styleClass="p-button-sm p-button-raised"
                                            pTooltip="Forzar recarga de datos"
                                            tooltipPosition="top"
                                            tooltipStyleClass="custom-tooltip"
                                        ></p-button>
                                        <p-button
                                            icon="pi pi-plus"
                                            (onClick)="openColldForm()"
                                            styleClass="p-button-sm p-button-raised"
                                            pTooltip="Agregar Detalle"
                                        ></p-button>
                                    </div>
                                </div>
                            </ng-template>

                            <ng-template #header>
                                <tr>
                                    <th pSortableColumn="refid" style="width: 100px">Ref ID <p-sortIcon field="refid"></p-sortIcon></th>
                                    <th pSortableColumn="url_img" style="width: 150px">Imagen</th>
                                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                                    <th pSortableColumn="orden" style="width: 120px">Orden</th>
                                    <th style="width: 150px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-colld>
                                <tr [class.bg-blue-50]="colld === collectionSeleccionada">
                                    <!-- Ref ID - SOLO LECTURA -->
                                    <td>{{colld.idref}}</td>

                                    <!-- URL Item - IMAGEN -->
                                    <td>
                                        <img
                                            [src]="colld.url_img"
                                            [alt]="colld.nombre"
                                            class="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyNEM0MS45NDExIDI0IDUwIDMyLjA1ODkgNTAgNDJDNTAgNTEuOTQxMSA0MS45NDExIDYwIDMyIDYwQzIyLjA1ODkgNjAgMTQgNTEuOTQxMSAxNCA0MkMxNCAzMi4wNTg5IDIyLjA1ODkgMjQgMzIgMjRaIiBmaWxsPSIjOTg5OEE5Ii8+CjxwYXRoIGQ9Ik0zMiAzNkMzNS4zMTM3IDM2IDM4IDMzLjMxMzcgMzggMzBDMzggMjYuNjg2MyAzNS4zMTM3IDI0IDMyIDI0QzI4LjY4NjMgMjQgMjYgMjYuNjg2MyAyNiAzMEMyNiAzMy4zMTM3IDI4LjY4NjMgMzYgMzIgMzZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'"
                                        />
                                    </td>

                                    <!-- Nombre - SOLO LECTURA -->
                                    <td>{{colld.nombre}}</td>

                                    <!-- Orden - EDICIÓN INLINE CON BOTONES -->
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <span class="font-medium">{{colld.orden}}</span>
                                            <div class="flex flex-col gap-1">
                                                <button
                                                    pButton
                                                    icon="pi pi-chevron-up"
                                                    (click)="moveOrderUp(colld)"
                                                    class="p-button-sm p-button-text p-button-secondary"
                                                    pTooltip="Mover arriba"
                                                    [disabled]="colld.orden === 1"
                                                ></button>
                                                <button
                                                    pButton
                                                    icon="pi pi-chevron-down"
                                                    (click)="moveOrderDown(colld)"
                                                    class="p-button-sm p-button-text p-button-secondary"
                                                    pTooltip="Mover abajo"
                                                    [disabled]="getMaxOrder() === colld.orden"
                                                ></button>
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Acciones - SOLO ELIMINAR -->
                                    <td>
                                        <button
                                            pButton
                                            icon="pi pi-trash"
                                            (click)="eliminarColld(colld)"
                                            class="p-button-sm p-button-text p-button-danger"
                                            pTooltip="Eliminar detalle"
                                        ></button>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-tabpanel>

                    <!-- Panel 3: Add Items -->
                    <p-tabpanel value="2">
 
 

                        <app-items [selectedCollectionId]="selectedCollectionId"></app-items>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>


        <!-- Modal Colección -->
        <p-dialog
            [(visible)]="showCollectionModal"
            [header]="isEditingCollection ? 'Editar Colección' : 'Nueva Colección'"
            [modal]="true"
            [style]="{width: '600px', maxHeight: '70vh'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="collectionForm" (ngSubmit)="saveCollection()">
                <div class="space-y-3" style="max-height: 50vh; overflow-y: auto;">
                    <!-- Nombre -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Nombre *</label>
                        <input
                            pInputText
                            formControlName="nombre"
                            placeholder="tag-Collection"
                            class="w-full"
                        />
                        <small *ngIf="collectionForm.get('nombre')?.invalid && collectionForm.get('nombre')?.touched"
                               class="text-red-500">
                            El nombre es obligatorio
                        </small>
                    </div>

                    <!-- Descripción -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                            pInputText
                            formControlName="descripcion"
                            placeholder="Descripción de la colección (opcional)"
                            class="w-full"
                            rows="2"
                        ></textarea>
                    </div>

                    <!-- URL Banner -->
                    <div>
                        <label class="block text-sm font-medium mb-1">URL Banner</label>
                        <input
                            pInputText
                            formControlName="url_banner"
                            placeholder="https://imagenes.calimaxjs.com/banner.jpg"
                            class="w-full"
                        />
                    </div>

                    <!-- Tipo de Colección (más pequeño) -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Tipo de Colección *</label>
                        <p-select
                            formControlName="id_tipoc"
                            [options]="tipoCollOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar tipo"
                            styleClass="w-full text-sm"
                        ></p-select>
                    </div>

                    <!-- Fecha Inicio -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Fecha Inicio</label>
                        <p-inputMask
                            formControlName="fecha_ini"
                            mask="99/99/9999"
                            placeholder="mm/dd/yyyy"
                            class="w-full"
                        ></p-inputMask>
                    </div>

                    <!-- SWSCHED entre las fechas -->
                    <div class="flex justify-center py-2">
                        <div class="flex flex-col items-center">
                            <label class="block text-xs font-medium mb-1">Sched</label>
                            <p-toggleSwitch
                                formControlName="swsched"
                                (onChange)="onSwschedChange($event)"
                            ></p-toggleSwitch>
                        </div>
                    </div>

                    <!-- Fecha Fin (solo si swsched está activo) -->
                    <div *ngIf="collectionForm.get('swsched')?.value">
                        <label class="block text-sm font-medium mb-1">Fecha Fin</label>
                        <p-inputMask
                            formControlName="fecha_fin"
                            mask="99/99/9999"
                            placeholder="mm/dd/yyyy"
                            class="w-full"
                        ></p-inputMask>
                    </div>

                    <!-- Toggle Switches: swtag, swsrc y Estado en la misma fila -->
                    <div class="grid grid-cols-3 gap-4 items-end">
                        <div>
                            <label class="block text-sm font-medium mb-2">
                                {{collectionForm.get('swtag')?.value ? 'Tag ON' : 'Tag OFF'}}
                            </label>
                            <p-toggleSwitch
                                formControlName="swtag"
                            ></p-toggleSwitch>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">
                                {{collectionForm.get('swsrc')?.value ? 'Modo búsqueda ON' : 'Modo búsqueda OFF'}}
                            </label>
                            <p-toggleSwitch
                                formControlName="swsrc"
                            ></p-toggleSwitch>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Estado</label>
                            <p-tag
                                [value]="collectionForm.get('estado')?.value ? 'Activo' : 'Inactivo'"
                                [severity]="collectionForm.get('estado')?.value ? 'success' : 'danger'"
                                (click)="collectionForm.patchValue({estado: !collectionForm.get('estado')?.value})"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                            ></p-tag>
                        </div>
                    </div>

                    <!-- Información de solo lectura -->
                    <div *ngIf="isEditingCollection" class="border-t pt-3 grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium mb-1">Última Modificación</label>
                            <input
                                pInputText
                                [value]="collectionSeleccionada?.fecha_mod | date:'short'"
                                readonly
                                class="w-full bg-gray-100 text-xs"
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1">Usuario</label>
                            <input
                                pInputText
                                [value]="collectionSeleccionada?.usr_m"
                                readonly
                                class="w-full bg-gray-100 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                        pButton
                        type="button"
                        (click)="closeCollectionForm()"
                        label="Cancelar"
                        class="p-button-text"
                    ></button>
                    <button
                        pButton
                        type="submit"
                        [label]="isEditingCollection ? 'Actualizar' : 'Crear'"
                        [disabled]="!collectionForm.valid || savingCollection"
                        [loading]="savingCollection"
                        class="p-button-success"
                        raised
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal para previsualizar banner -->
        <p-dialog
            [(visible)]="showBannerModal"
            [header]="bannerPreviewTitle"
            [modal]="true"
            [style]="{width: '80vw', maxWidth: '800px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <div class="text-center">
                <img
                    [src]="bannerPreviewSrc"
                    [alt]="bannerPreviewTitle"
                    class="max-w-full h-auto rounded-lg shadow-lg"
                />
            </div>
        </p-dialog>

        <!-- Modal COLLD -->
        <p-dialog
            [(visible)]="showColldModal"
            [header]="isEditingColld ? 'Editar Detalle' : 'Nuevo Detalle'"
            [modal]="true"
            [style]="{width: '500px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
            appendTo="body"
            styleClass="custom-modal"
        >
            <form [formGroup]="colldForm" (ngSubmit)="saveColld()">
                <div class="space-y-4">
                    <!-- ID Ref -->
                    <div>
                        <label class="block text-sm font-medium mb-1">ID Ref *</label>
                        <input
                            pInputText
                            formControlName="idref"
                            placeholder="Ingrese elArticulo"
                            class="w-full"
                        />
                        <small *ngIf="colldForm.get('idref')?.invalid && colldForm.get('idref')?.touched"
                               class="text-red-500">
                            El Articulo es obligatorio
                        </small>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
                    <button
                        pButton
                        type="button"
                        (click)="closeColldForm()"
                        label="Cancelar"
                        class="p-button-text"
                    ></button>
                    <button
                        pButton
                        type="button"
                        (click)="saveColld()"
                        [label]="isEditingColld ? 'Actualizar' : 'Crear'"
                        [disabled]="!colldForm.valid || savingColld"
                        [loading]="savingColld"
                        class="p-button-success"
                        raised
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Diálogo de confirmación personalizado -->
        <p-dialog
            header="{{confirmHeader}}"
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
                    label="Sí, Confirmar"
                    icon="pi pi-check"
                    severity="danger"
                    (onClick)="confirmarAccion()"
                ></p-button>
            </div>
        </p-dialog>

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

        /* Scroll personalizado para formularios */
        .grid::-webkit-scrollbar {
            width: 8px;
        }

        .grid::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .grid::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        .grid::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }

        /* Estilos para el modal personalizado */
        :host ::ng-deep .custom-modal .p-dialog {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            border-radius: 0.5rem !important;
            overflow: hidden !important;
        }

        :host ::ng-deep .custom-modal .p-dialog-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border-bottom: none !important;
            padding: 1rem 1.5rem !important;
        }

        :host ::ng-deep .custom-modal .p-dialog-content {
            padding: 1.5rem !important;
            background: white !important;
        }

        :host ::ng-deep .custom-modal .p-dialog-footer {
            border-top: 1px solid #e5e7eb !important;
            padding: 1rem 1.5rem !important;
            background: #f9fafb !important;
        }

        /* Evitar fondo negro al abrir el modal */
        :host ::ng-deep .p-dialog-mask {
            background-color: rgba(0, 0, 0, 0.5) !important;
            transition: opacity 0.2s ease-in-out !important;
        }

        :host ::ng-deep .p-dialog-mask.p-dialog-mask-leave {
            opacity: 0 !important;
        }

        /* Asegurar que el modal aparezca correctamente */
        :host ::ng-deep .custom-modal .p-dialog {
            opacity: 1 !important;
            transform: scale(1) !important;
            transition: all 0.2s ease-in-out !important;
        }

        /* Estilos para tooltips */
        :host ::ng-deep .p-tooltip {
            background-color: #374151 !important;
            color: white !important;
            border-radius: 0.375rem !important;
            font-size: 0.875rem !important;
            padding: 0.5rem 0.75rem !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            z-index: 10000 !important;
            opacity: 1 !important;
        }

        /* Evitar parpadeo en botones con loading */
        :host ::ng-deep .p-button.p-button-loading {
            opacity: 1 !important;
            pointer-events: none !important;
        }

        :host ::ng-deep .p-button .p-button-loading-icon {
            animation: p-button-spin 1s linear infinite !important;
        }

        /* Estilos específicos para botones refresh */
        :host ::ng-deep .p-button[ptooltip] {
            transition: none !important;
        }

        :host ::ng-deep .p-button[ptooltip]:hover {
            transform: none !important;
        }

        /* Prevenir parpadeo de tooltips */
        :host ::ng-deep .p-tooltip.p-tooltip-hide {
            opacity: 0 !important;
            visibility: hidden !important;
        }

        :host ::ng-deep .p-tooltip.p-tooltip-show {
            opacity: 1 !important;
            visibility: visible !important;
        }

        :host ::ng-deep .p-tooltip .p-tooltip-arrow {
            color: #374151 !important;
        }

        :host ::ng-deep .p-tooltip.p-tooltip-top .p-tooltip-arrow {
            border-top-color: #374151 !important;
        }

        :host ::ng-deep .p-tooltip.p-tooltip-bottom .p-tooltip-arrow {
            border-bottom-color: #374151 !important;
        }

        :host ::ng-deep .p-tooltip.p-tooltip-left .p-tooltip-arrow {
            border-left-color: #374151 !important;
        }

        :host ::ng-deep .p-tooltip.p-tooltip-right .p-tooltip-arrow {
            border-right-color: #374151 !important;
        }

        /* Estilos específicos para tooltips personalizados */
        :host ::ng-deep .custom-tooltip {
            background-color: #374151 !important;
            color: white !important;
            border-radius: 0.375rem !important;
            font-size: 0.875rem !important;
            padding: 0.5rem 0.75rem !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            z-index: 10001 !important;
            opacity: 1 !important;
            transition: opacity 0.2s ease-in-out !important;
            pointer-events: none !important;
        }

        :host ::ng-deep .custom-tooltip .p-tooltip-arrow {
            color: #374151 !important;
            border-color: #374151 !important;
        }

        /* Prevenir cualquier transformación o animación en botones con tooltip */
        :host ::ng-deep .p-button[tooltipStyleClass="custom-tooltip"] {
            transition: none !important;
            transform: none !important;
        }

        :host ::ng-deep .p-button[tooltipStyleClass="custom-tooltip"]:hover {
            transform: none !important;
            box-shadow: none !important;
        }

        :host ::ng-deep .p-button[tooltipStyleClass="custom-tooltip"]:focus {
            box-shadow: none !important;
        }

        /* Eliminar completamente cualquier animación en botones refresh */
        :host ::ng-deep .p-button[icon="pi pi-refresh"] {
            transition: none !important;
            animation: none !important;
        }

        :host ::ng-deep .p-button[icon="pi pi-refresh"]:hover {
            transform: none !important;
            animation: none !important;
        }

        :host ::ng-deep .p-button[icon="pi pi-refresh"]:active {
            transform: none !important;
            animation: none !important;
        }

        /* Asegurar que el loading spinner no cause parpadeo */
        :host ::ng-deep .p-button[icon="pi pi-refresh"] .p-button-loading-icon {
            animation: p-button-spin 1s linear infinite !important;
        }

        /* Eliminar cualquier efecto visual en el contenedor del botón */
        :host ::ng-deep .p-button[icon="pi pi-refresh"] .p-button-icon {
            transition: none !important;
        }

        /* Estilos para el botón de banner preview */
        :host ::ng-deep .p-button[icon="pi pi-eye"] {
            transition: none !important;
            animation: none !important;
            min-width: 2rem !important;
            width: 2rem !important;
            height: 2rem !important;
        }

        :host ::ng-deep .p-button[icon="pi pi-eye"]:hover {
            transform: none !important;
            animation: none !important;
        }

        :host ::ng-deep .p-button[icon="pi pi-eye"]:active {
            transform: none !important;
            animation: none !important;
        }

        :host ::ng-deep .p-button[icon="pi pi-eye"] .p-button-icon {
            transition: none !important;
            font-size: 0.875rem !important;
        }

        /* Estilos para botón de banner deshabilitado */
        :host ::ng-deep .p-button[icon="pi pi-eye"]:disabled {
            opacity: 0.5 !important;
            cursor: not-allowed !important;
        }

        :host ::ng-deep .p-button[icon="pi pi-eye"]:disabled .p-button-icon {
            color: #9ca3af !important;
        }

        :host ::ng-deep .p-button[icon="pi pi-eye"]:disabled:hover {
            background-color: transparent !important;
            box-shadow: none !important;
        }

    `]
})
export class CollectionsComponent implements OnInit {
    // Datos
    collections: CollItem[] = [];
    filteredCollections: CollItem[] = [];
    tipoCollOptions: any[] = [];
    collectionSeleccionada: CollItem | null = null;

    // Estados de carga
    loadingCollections = false;
    savingCollection = false;
    deletingCollection = false;

    // Estados de modales
    showCollectionModal = false;
    showBannerModal = false;

    // Estados del formulario
    collectionForm!: FormGroup;
    isEditingCollection = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;


    // Filtros
    selectedTipoFilter: number[] = [];
    filterMenuItems: any[] = [];

    // Banner preview
    bannerPreviewSrc = '';
    bannerPreviewTitle = '';

    // Tabs
    activeTabIndex = 0;

    // ========== PROPIEDADES PARA ITEMS COMPONENT ==========

    // ID de colección seleccionada para pasar al ItemsComponent
    selectedCollectionId: number | null = null;

    // ========== PROPIEDADES COLLD ==========

    // Datos COLLD
    colldItems: ColldItem[] = [];
    filteredColldItems: ColldItem[] = [];

    // Estados de carga COLLD
    loadingColld = false;
    savingColld = false;
    deletingColld = false;
    colldDataLoaded = false; // Indica si los datos COLLD ya están cargados

    // Estados de modales COLLD
    showColldModal = false;
    showConfirmDialog = false;

    // Estados del formulario COLLD
    colldForm!: FormGroup;
    isEditingColld = false;


    // Confirmaciones COLLD
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;



    constructor(
        private fb: FormBuilder,
        private collService: CollService,
        private colldService: ColldService,
        private sessionService: SessionService,
        private messageService: MessageService,
    ) {
        this.initializeForms();
        this.initializeFilterMenu();
        this.initializeColldForms();
    }

    ngOnInit(): void {
        console.log('🚀 CollectionsComponent inicializado');
        this.cargarCollections();
        this.cargarTipoCollOptions();
    }

    // ========== MÉTODOS DE INICIALIZACIÓN ==========

    initializeForms(): void {
        const currentDate = this.getCurrentDate();
        this.collectionForm = this.fb.group({
            nombre: ['', [Validators.required]],
            descripcion: [''],
            url_banner: [''],
            swtag: [false],
            swsrc: [false],
            estado: [true],
            id_tipoc: [null, [Validators.required]],
            fecha_ini: [currentDate],
            swsched: [false],
            fecha_fin: [currentDate]
        });
    }

    initializeFilterMenu(): void {
        this.filterMenuItems = [
            {
                label: 'Limpiar filtros',
                icon: 'pi pi-filter-slash',
                command: () => this.clearFilters()
            },
            {
                label: 'Todos los tipos',
                icon: 'pi pi-list',
                command: () => this.showAllTypes()
            },
            { separator: true }
        ];

        // Agregar tipos de colección dinámicamente
        this.tipoCollOptions.forEach(tipo => {
            this.filterMenuItems.push({
                label: `- ${tipo.label}`,
                icon: 'pi pi-filter',
                command: () => this.filterByType(tipo.value)
            });
        });
    }

    clearFilters(): void {
        this.selectedTipoFilter = [];
        this.filteredCollections = [...this.collections];
        console.log('Filtros limpiados');
    }

    showAllTypes(): void {
        this.selectedTipoFilter = this.tipoCollOptions.map(option => option.value);
        this.onTipoFilterChange({ value: this.selectedTipoFilter });
        console.log('Mostrando todos los tipos');
    }

    filterByType(tipoId: number): void {
        this.selectedTipoFilter = [tipoId];
        this.onTipoFilterChange({ value: this.selectedTipoFilter });
        console.log('Filtrando por tipo:', tipoId);
    }

    getCurrentDate(): string {
        const today = new Date();
        return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    }

    initializeColldForms(): void {
        this.colldForm = this.fb.group({
            idref: [null, [Validators.required]]
        });
    }

    // ========== MÉTODOS DE DATOS ==========

    cargarCollections(): void {
        this.loadingCollections = true;

        this.collService.getAllCollections().subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200 && responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                    // El servicio ya procesó los datos, responseData.data ya es el array directo
                    console.log('✅ Asignando datos al componente:', responseData.data.length, 'colecciones');
                    this.collections = responseData.data;
                    this.filteredCollections = [...this.collections];
                    console.log('📊 Colecciones asignadas:', this.collections);
                } else {
                    console.warn('⚠️ No hay datos válidos para asignar');
                    this.collections = [];
                    this.filteredCollections = [];
                }
                this.loadingCollections = false;
            },
            error: (error) => {
                console.error('Error al cargar colecciones:', error.message || error);
                this.loadingCollections = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las colecciones',
                    life: 5000
                });
            }
        });
    }

    cargarTipoCollOptions(): void {
        this.collService.getCollTypes().subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200 && responseData.data) {
                    this.tipoCollOptions = responseData.data.map((tipo: CollTypeItem) => ({
                        label: tipo.nomTipo,
                        value: tipo.id_tipoc
                    }));
                    this.initializeFilterMenu();
                } else {
                    this.tipoCollOptions = [];
                }
            },
            error: (error) => {
                console.error('Error al cargar tipos:', error.message || error);
                this.tipoCollOptions = [];
            }
        });
    }

    // ========== MÉTODOS DE UI ==========


    // ✅ MÉTODO PARA CLICK DIRECTO EN TAB
    onTabClick(tabIndex: number): void {
        this.activeTabIndex = tabIndex;

        // Si es el tab 1 (Items) y no están cargados los datos, cargarlos
        if (tabIndex === 1 && !this.colldDataLoaded && this.collectionSeleccionada) {
            console.log('🔄 Cargando datos COLLD desde click en tab...');
            this.cargarColldItems();
        }
    }

    onGlobalFilter(table: any, event: any): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // ========== MÉTODOS COLLD ==========

    cargarColldItems(): void {
        if (!this.collectionSeleccionada) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin selección',
                detail: 'Selecciona una colección primero para ver sus detalles',
                life: 3000
            });
            return;
        }

        // ✅ Establecer loading solo si no está ya establecido
        if (!this.loadingColld) {
            this.loadingColld = true;
        }
        this.colldDataLoaded = false;

        // Usar el método específico para obtener detalles de una colección específica
        this.colldService.getColldByCollId(this.collectionSeleccionada.id_coll).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200 && responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                    this.colldItems = responseData.data;
                    this.filteredColldItems = [...this.colldItems];
                    this.colldDataLoaded = true;
                } else {
                    this.colldItems = [];
                    this.filteredColldItems = [];
                    this.colldDataLoaded = true;
                }

                this.loadingColld = false;
            },
            error: (error) => {
                console.error('❌ Error al cargar detalles:', error.message || error);
                console.error('❌ Error completo:', error);
                this.loadingColld = false;
                console.log('⏹️ loadingColld establecido en false por error');

                // ✅ Marcar como cargado para evitar reintentos infinitos
                this.colldDataLoaded = true;
                console.log('✅ colldDataLoaded establecido en true (con error)');

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar datos',
                    detail: `Error al cargar los detalles de la colección "${this.collectionSeleccionada?.nombre || 'N/A'}". ${error?.message || 'Error desconocido'}`,
                    life: 5000
                });
            }
        });
    }

    // ✅ MÉTODO PÚBLICO PARA FORZAR RECARGA MANUAL
    refreshColldData(): void {
        console.log('🔄 Forzando recarga manual de datos COLLD');
        if (this.collectionSeleccionada) {
            this.loadingColld = true; // ✅ Establecer estado de loading consistente
            this.colldDataLoaded = false; // Forzar recarga
            this.cargarColldItems();
        } else {
            console.warn('⚠️ No hay colección seleccionada para refrescar');
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin selección',
                detail: 'Selecciona una colección primero para refrescar sus detalles',
                life: 3000
            });
        }
    }


    // ========== FORMULARIO COLLD ==========

    openColldForm(): void {
        if (!this.collectionSeleccionada) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Seleccione una colección',
                detail: 'Debe seleccionar una colección antes de agregar detalles'
            });
            return;
        }

        this.isEditingColld = false;
        this.colldForm.reset();
        this.showColldModal = true;
    }

    closeColldForm(): void {
        this.showColldModal = false;
        this.colldForm.reset();
        this.isEditingColld = false;
    }

    saveColld(): void {
        if (this.colldForm.valid) {
            this.savingColld = true;
            const formData = this.colldForm.value;

            const sessionBase = this.sessionService.getApiPayloadBase();

            if (this.isEditingColld) {
                // TODO: Implementar edición de COLLD existente
                // Por ahora, mostrar mensaje de que la edición no está implementada
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Función no implementada',
                    detail: 'La edición de detalles de colección no está implementada aún'
                });
                this.savingColld = false;
                return;

            } else {
                // Crear
                const maxOrder = this.colldItems.length > 0 ? Math.max(...this.colldItems.map(item => item.orden)) : 0;
                const payload: any = {
                    action: 'IN' as const,
                    id_coll: this.collectionSeleccionada?.id_coll || 0,
                    ren: 1, // Valor por defecto
                    orden: maxOrder + 1,
                    idref: formData.idref,
                    nombre: `Detalle ${formData.idref}` // Valor por defecto
                };


                this.collService.createColld(payload).subscribe({
                    next: (response) => {
                        const responseData = Array.isArray(response) ? response[0] : response;

                        if (responseData && responseData.statuscode === 200) {
                            this.handleColldSaveSuccess('Detalle creado correctamente');
                        } else {
                            this.handleColldSaveError(responseData || { statuscode: 500, mensaje: 'Error desconocido' }, 'crear');
                        }
                    },
                    error: (error) => this.handleColldSaveError(error, 'crear')
                });
            }
        }
    }

    private handleColldSaveSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: message
        });

        this.closeColldForm();
        this.cargarColldItems();
        this.savingColld = false;
    }

    private handleColldSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} detalle:`, error);

        // Si es una respuesta del servicio con statuscode y mensaje
        let errorMessage = `Error al ${operation} el detalle`;
        if (error && error.mensaje) {
            errorMessage = error.mensaje;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });

        this.savingColld = false;
    }

    // ========== EDICIÓN INLINE COLLD ==========

    editInlineColld(colld: ColldItem, field: string): void {
        this.editingCell = colld.id_colld + '_' + field;
        this.originalValue = (colld as any)[field];
    }

    saveInlineEditColld(colld: ColldItem, field: string): void {
        if ((colld as any)[field] === this.originalValue) {
            this.cancelInlineEdit();
            return;
        }

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.collService.updateColld({
            action: 'UP' as const,
            id_colld: colld.id_colld,
            [field]: (colld as any)[field],
            ...sessionBase
        } as any).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200) {
                    this.editingCell = null;
                    this.originalValue = null;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Campo Actualizado',
                        detail: `${this.getFieldLabel(field)} actualizado correctamente`
                    });
                } else {
                    // Revertir el cambio local
                    (colld as any)[field] = this.originalValue;
                    this.editingCell = null;
                    this.originalValue = null;

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: (responseData && responseData.mensaje) || `Error al actualizar ${this.getFieldLabel(field)}`,
                        life: 5000
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error al actualizar campo:', error);

                // Revertir el cambio local
                (colld as any)[field] = this.originalValue;
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

    // ========== CONTROLES DE ORDEN ==========

    moveOrderUp(colld: ColldItem): void {
        if (colld.orden > 1) {
            const newOrder = colld.orden - 1;
            this.updateColldOrder(colld, newOrder);
        }
    }

    moveOrderDown(colld: ColldItem): void {
        const maxOrder = Math.max(...this.colldItems.map(item => item.orden));
        if (colld.orden < maxOrder) {
            const newOrder = colld.orden + 1;
            this.updateColldOrder(colld, newOrder);
        }
    }

    private updateColldOrder(colld: ColldItem, newOrder: number): void {
        const oldOrder = colld.orden;
        colld.orden = newOrder;

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.collService.updateColldOrder(colld.id_colld, newOrder, sessionBase).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200) {
                    this.colldItems.sort((a, b) => a.orden - b.orden);
                    this.filteredColldItems = [...this.colldItems];

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Orden Actualizado',
                        detail: 'Orden actualizado correctamente'
                    });
                } else {
                    // Revertir cambio local
                    colld.orden = oldOrder;

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: (responseData && responseData.mensaje) || 'Error al actualizar el orden',
                        life: 5000
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error al actualizar orden:', error);

                // Revertir cambio local
                colld.orden = oldOrder;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar el orden',
                    life: 5000
                });
            }
        });
    }

    // ========== ELIMINACIÓN COLLD ==========

    eliminarColld(colld: ColldItem): void {
        this.confirmMessage = `¿Está seguro de que desea eliminar el detalle "${colld.nombre}"?`;
        this.confirmHeader = 'Confirmar Eliminación';
        this.accionConfirmada = () => this.procesarEliminacionColld(colld);
        this.showConfirmDialog = true;
    }

    private procesarEliminacionColld(colld: ColldItem): void {
        this.deletingColld = true;

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.collService.deleteColld(colld.id_colld, sessionBase).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Detalle eliminado correctamente'
                    });

                    this.cargarColldItems();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: (responseData && responseData.mensaje) || 'Error al eliminar el detalle',
                        life: 5000
                    });
                }

                this.deletingColld = false;
            },
            error: (error) => {
                console.error('❌ Error al eliminar detalle:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar el detalle',
                    life: 5000
                });

                this.deletingColld = false;
            }
        });
    }

    // ========== CONFIRMACIONES ==========

    confirmarAccion(): void {
        if (this.accionConfirmada) {
            this.accionConfirmada();
        }
        this.cancelarConfirmacion();
    }

    cancelarConfirmacion(): void {
        this.showConfirmDialog = false;
        this.confirmMessage = '';
        this.confirmHeader = '';
        this.accionConfirmada = null;
    }

    getMaxOrder(): number {
        return this.filteredColldItems.length > 0 ? Math.max(...this.filteredColldItems.map(item => item.orden)) : 0;
    }

    onTipoFilterChange(event: any): void {
        if (event.value && event.value.length > 0) {
            this.filteredCollections = this.collections.filter(coll =>
                event.value.includes(coll.id_tipoc)
            );
        } else {
            this.filteredCollections = [...this.collections];
        }
    }

    onCollectionSelect(event: any): void {
        const nuevaColeccion = event.data;
        const coleccionCambiada = this.collectionSeleccionada?.id_coll !== nuevaColeccion?.id_coll;

        this.collectionSeleccionada = nuevaColeccion;
        this.selectedCollectionId = nuevaColeccion?.id_coll || null;

        // ✅ Si cambió la colección, resetear el estado de carga COLLD
        if (coleccionCambiada) {
            this.colldDataLoaded = false;
            this.colldItems = [];
            this.filteredColldItems = [];
        }
    }

    onCollectionDoubleClick(collection: CollItem): void {
        const coleccionCambiada = this.collectionSeleccionada?.id_coll !== collection.id_coll;

        this.collectionSeleccionada = collection;
        this.selectedCollectionId = collection.id_coll;

        // ✅ Si cambió la colección, resetear el estado de carga COLLD
        if (coleccionCambiada) {
            this.colldDataLoaded = false;
        }

        // Cambiar al tab de Items
        this.activeTabIndex = 1;

        // Forzar carga inmediata si es necesario
        if (!this.colldDataLoaded || coleccionCambiada) {
            this.cargarColldItems();
        }
    }

    onSwschedChange(event: any): void {
        // Si se desactiva swsched, resetear fecha_fin
        if (!event.checked) {
            this.collectionForm.patchValue({ fecha_fin: this.getCurrentDate() });
        }
    }

    // ========== MÉTODOS DE FORMULARIO ==========

    openCollectionForm(collection?: CollItem): void {
        this.isEditingCollection = !!collection;

        if (collection) {
            this.collectionForm.patchValue({
                nombre: collection.nombre,
                descripcion: collection.descripcion || '',
                url_banner: collection.url_banner || '',
                swtag: collection.swtag === 1,
                swsrc: collection.swsrc === 1,
                estado: collection.estado === 'A',
                id_tipoc: collection.id_tipoc,
                fecha_ini: this.formatDateForInput(collection.fecha_ini),
                swsched: collection.sw_fijo === 1,
                fecha_fin: this.formatDateForInput(collection.fecha_fin)
            });
            this.collectionSeleccionada = collection;
        } else {
            const currentDate = this.getCurrentDate();
            this.collectionForm.reset({
                estado: true,
                swtag: false,
                swsrc: false,
                swsched: false,
                fecha_ini: currentDate,
                fecha_fin: currentDate
            });
            this.collectionSeleccionada = null;
        }

        this.showCollectionModal = true;
    }

    closeCollectionForm(): void {
        this.showCollectionModal = false;
        this.collectionForm.reset();
        this.isEditingCollection = false;
        this.collectionSeleccionada = null;
    }

    saveCollection(): void {
        if (this.collectionForm.valid) {
            this.savingCollection = true;
            const formData = this.collectionForm.value;

            // Convertir valores booleanos a números
            const processedData = {
                ...formData,
                swtag: formData.swtag ? 1 : 0,
                swsrc: formData.swsrc ? 1 : 0,
                estado: formData.estado ? 'A' : 'I',
                swsched: formData.swsched ? 1 : 0,
                fecha_ini: this.convertDateToISO(formData.fecha_ini),
                fecha_fin: this.convertDateToISO(formData.fecha_fin)
            };

            // Obtener datos de sesión
            const sessionBase = this.sessionService.getApiPayloadBase();

            if (this.isEditingCollection && this.collectionSeleccionada) {
                // Actualizar
                const payload = {
                    action: 'UP' as const,
                    id_coll: this.collectionSeleccionada.id_coll,
                    ...processedData,
                    ...sessionBase
                };

                this.collService.updateCollection(payload).subscribe({
                    next: (response) => {
                        const responseData = Array.isArray(response) ? response[0] : response;

                        if (responseData && responseData.statuscode === 200) {
                            this.handleSaveSuccess('Colección actualizada correctamente');
                        } else {
                            this.handleSaveError(responseData || { statuscode: 500, mensaje: 'Error desconocido' }, 'actualizar');
                        }
                    },
                    error: (error) => this.handleSaveError(error, 'actualizar')
                });
            } else {
                // Crear
                const payload = {
                    action: 'IN' as const,
                    ...processedData,
                    ...sessionBase
                };

                this.collService.createCollection(payload).subscribe({
                    next: (response) => {
                        const responseData = Array.isArray(response) ? response[0] : response;

                        if (responseData && responseData.statuscode === 200) {
                            this.handleSaveSuccess('Colección creada correctamente');
                        } else {
                            this.handleSaveError(responseData || { statuscode: 500, mensaje: 'Error desconocido' }, 'crear');
                        }
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

        this.closeCollectionForm();
        this.cargarCollections();
        this.savingCollection = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} colección:`, error);

        // Si es una respuesta del servicio con statuscode y mensaje
        let errorMessage = `Error al ${operation} la colección`;
        if (error && error.mensaje) {
            errorMessage = error.mensaje;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });

        this.savingCollection = false;
    }

    // ========== EDICIÓN INLINE ==========

    editInlineCollection(collection: CollItem, field: string): void {
        this.editingCell = collection.id_coll + '_' + field;
        this.originalValue = (collection as any)[field];
    }

    saveInlineEditCollection(collection: CollItem, field: string): void {
        if ((collection as any)[field] === this.originalValue) {
            this.cancelInlineEdit();
            return;
        }

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.collService.updateCollection({
            id_coll: collection.id_coll,
            [field]: (collection as any)[field],
            ...sessionBase
        }).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200) {
                    // Actualizar fecha de modificación local
                    collection.fecha_mod = new Date().toISOString();
                    collection.usr_m = String(sessionBase.usr || collection.usr_m);

                    this.editingCell = null;
                    this.originalValue = null;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Campo Actualizado',
                        detail: `${this.getFieldLabel(field)} actualizado correctamente`
                    });
                } else {
                    // Revertir el cambio local
                    (collection as any)[field] = this.originalValue;
                    this.editingCell = null;
                    this.originalValue = null;

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: (responseData && responseData.mensaje) || `Error al actualizar ${this.getFieldLabel(field)}`,
                        life: 5000
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error al actualizar campo:', error);

                // Revertir el cambio local
                (collection as any)[field] = this.originalValue;
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
            descripcion: 'Descripción',
            url_banner: 'URL Banner'
        };
        return labels[field] || field;
    }

    // ========== TOGGLE ESTADO ==========

    toggleEstado(collection: CollItem) {
        const nuevoEstado = collection.estado === 'A' ? 'I' : 'A';
        if (nuevoEstado === 'I') {
            // Confirmar desactivación
            this.confirmMessage = `¿Está seguro de que desea desactivar la colección "${collection.nombre}"?`;
            this.confirmHeader = 'Confirmar Desactivación';
            this.accionConfirmada = () => this.procesarCambioEstado(collection, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            // Activar directamente
            this.procesarCambioEstado(collection, nuevoEstado);
        }
    }
      

    private procesarCambioEstado(collection: CollItem, nuevoEstado: string): void {
        const estadoAnterior = collection.estado;
        collection.estado = nuevoEstado;

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.collService.updateCollection({
            id_coll: collection.id_coll,
            estado: nuevoEstado,
            ...sessionBase
        }).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200) {
                    collection.fecha_mod = new Date().toISOString();
                    collection.usr_m = String(sessionBase.usr || collection.usr_m);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Estado Actualizado',
                        detail: `Colección ${nuevoEstado === 'A' ? 'activada' : 'desactivada'} correctamente`
                    });
                } else {
                    // Revertir cambio local
                    collection.estado = estadoAnterior;

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: (responseData && responseData.mensaje) || 'Error al cambiar el estado de la colección',
                        life: 5000
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local
                collection.estado = estadoAnterior;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado de la colección',
                    life: 5000
                });
            }
        });
    }

    // ========== ELIMINACIÓN ==========

    eliminarCollection(collection: CollItem) {
        this.confirmMessage = `¿Está seguro de que desea eliminar la colección "${collection.nombre}"?`;
        this.confirmHeader = 'Confirmar Eliminación';
        this.accionConfirmada = () => this.confirmDeleteCollection(collection);
        this.showConfirmDialog = true;
    }
      

    confirmDeleteCollection(collection: CollItem): void {
        this.deletingCollection = true;

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.collService.deleteCollection(collection.id_coll, sessionBase).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminada',
                        detail: 'Colección eliminada correctamente'
                    });

                    // Si la colección eliminada estaba seleccionada, deseleccionar
                    if (this.collectionSeleccionada?.id_coll === collection.id_coll) {
                        this.collectionSeleccionada = null;
                    }

                    this.cargarCollections();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: (responseData && responseData.mensaje) || 'Error al eliminar la colección',
                        life: 5000
                    });
                }

                this.deletingCollection = false;
            },
            error: (error) => {
                console.error('❌ Error al eliminar colección:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar la colección',
                    life: 5000
                });

                this.deletingCollection = false;
            }
        });
    }



    // ========== MÉTODOS DE UTILIDAD ==========

    getEstadoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: string): 'success' | 'danger' {
        return estado === 'A' ? 'success' : 'danger';
    }

    private formatDateForInput(dateString: string): string {
        if (!dateString) return this.getCurrentDate();
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }

    private convertDateToISO(dateString: string): string {
        if (!dateString) return new Date().toISOString();
        const [month, day, year] = dateString.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
    }

    // ========== BANNER PREVIEW ==========

    previewBanner(bannerUrl: string, collectionName: string): void {
        this.bannerPreviewSrc = bannerUrl;
        this.bannerPreviewTitle = `Banner de ${collectionName}`;
        this.showBannerModal = true;
    }

    previewImage(imageUrl: string, title: string): void {
        this.bannerPreviewSrc = imageUrl;
        this.bannerPreviewTitle = `Imagen de ${title}`;
        this.showBannerModal = true;
    }
}
