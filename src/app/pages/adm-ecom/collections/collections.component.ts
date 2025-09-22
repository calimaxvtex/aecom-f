import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
// import { RowReorderModule } from 'primeng/rowreorder'; // Comentado temporalmente
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox'; // Para checkboxes de selección múltiple
// import { SplitButtonModule } from 'primeng/splitbutton'; // Ya no se usa, filtros ahora son botones
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


// Modelos y servicios
import { CollItem, CollTypeItem, ColldItem, CreateColldRequest, UpdateColldRequest } from '@/features/coll/models/coll.interface';
import { CollService } from '@/features/coll/services/coll.service';
import { ColldService } from '@/features/coll/services/colld.service';
import { CatConceptosDetService } from '@/features/catconceptos/services/catconceptosdet.service';
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
        // RowReorderModule,  // Para funcionalidades de reordenamiento - comentado temporalmente
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        SelectButtonModule,
        InputMaskModule,
        DatePickerModule,
        ToggleSwitchModule,
        FloatLabelModule,
        CheckboxModule, // Para checkboxes de selección múltiple
        // SplitButtonModule, // Ya no se usa, filtros ahora son botones
        CardModule,  // Para las tarjetas de información
        TooltipModule,  // Para tooltips
        ConfirmDialogModule,  // Para confirmación de cambios
        // Import del ItemsComponent
        ItemsComponent
    ],
    providers: [MessageService],
    template: `
        <div class="card">
            <p-toast></p-toast>
            <p-confirmDialog></p-confirmDialog>



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
                            <span class="flex items-center gap-2">
                                <i class="pi pi-list"></i>
                                Items
                                <p-tag
                                    *ngIf="collectionSeleccionada"
                                    [value]="collectionSeleccionada.nombre"
                                    severity="info"
                                    class="text-xs ml-2">
                                </p-tag>
                            </span>
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
                                    <div class="flex gap-2 order-0 sm:order-1 items-end">
                                        <!-- Botones de filtro por tipo colección -->
                                        <button
                                            *ngFor="let tipo of tipoCollOptions"
                                            (click)="onTipoFiltroClick(tipo.value)"
                                            pButton
                                            raised
                                            [class]="tipoFiltroSeleccionado === tipo.value ? 'p-button-success compact-filter-button' : 'p-button-outlined compact-filter-button'"
                                            [label]="tipo.label"
                                            pTooltip="Filtrar por {{ tipo.label }}"
                                            tooltipPosition="top"
                                            styleClass="p-button-sm"
                                        ></button>


                                        <!-- Botones solo con iconos justificados a la derecha -->
                                        <div class="flex gap-1">
                                            <p-button
                                                icon="pi pi-refresh"
                                                (onClick)="cargarCollections()"
                                                [loading]="loadingCollections"
                                                styleClass="p-button-sm p-button-primary p-button-raised"
                                                pTooltip="Actualizar"
                                                tooltipPosition="top"
                                                tooltipStyleClass="custom-tooltip"
                                            ></p-button>
                                            <p-button
                                                icon="pi pi-plus"
                                                (onClick)="openCollectionForm()"
                                                styleClass="p-button-sm p-button-primary p-button-raised"
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
                                    <th style="width: 120px">Tipo</th>
                                    <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                                    <th style="width: 150px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-collection>
                                <tr
                                    [class.bg-blue-50]="collection === collectionSeleccionada"
                                    [class.collection-inactive]="collection.estado === 'I'"
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

                                    <!-- Tipo Colección - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== collection.id_coll + '_tipo'"
                                            (click)="editInlineCollection(collection, 'tipo'); $event.stopPropagation()"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{getTipoCollectionLabel(collection.id_tipoc)}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === collection.id_coll + '_tipo'"
                                            class="inline-edit-container"
                                        >
                                            <p-select
                                                [(ngModel)]="collection.id_tipoc"
                                                [options]="tipoCollOptions"
                                                optionLabel="label"
                                                optionValue="value"
                                                placeholder="Seleccionar tipo"
                                                styleClass="text-sm inline-select"
                                                appendTo="body"
                                                [style]="{'z-index': '9999', 'height': '2rem', 'min-width': '120px'}"
                                            ></p-select>
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditCollection(collection, 'tipo')"
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
                            [ngModel]="getCollectionToggleState(collection)"
                            [ngModelOptions]="{standalone: true}"
                            onLabel="ACTIVO"
                            offLabel="INACTIVO"
                            inputId="{{collection.id_coll}}_habilitado"
                            (ngModelChange)="onToggleSwitchChange($event, collection)"
                            class="status-toggle"
                            pTooltip="Cambiar estado de la colección"
                        ></p-toggleSwitch>
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
  (click)="eliminarCollection(collection); $event.stopPropagation()"
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
                            <div class="text-sm text-gray-500">
                                Items cargados: {{filteredColldItems.length}} | Reordenamiento: {{filteredColldItems.length > 1 ? 'Disponible' : 'Necesita al menos 2 items'}}
                            </div>
                        </div>

                        <p-table
                            #dtTableColld
                            [value]="filteredColldItems"
                            (onRowReorder)="onRowReorder($event)"
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
                                            [icon]="multiSelectMode ? 'pi pi-times' : 'pi pi-check-square'"
                                            (onClick)="toggleMultiSelectMode()"
                                            styleClass="p-button-sm p-button-primary p-button-raised"
                                            [pTooltip]="multiSelectMode ? 'Cancelar selección múltiple' : 'Activar selección múltiple'"
                                            tooltipPosition="top"
                                        ></p-button>
                                        <p-button
                                            icon="pi pi-refresh"
                                            (onClick)="refreshColldData()"
                                            [loading]="loadingColld"
                                            styleClass="p-button-sm p-button-primary p-button-raised"
                                            pTooltip="Forzar recarga de datos"
                                            tooltipPosition="top"
                                            tooltipStyleClass="custom-tooltip"
                                        ></p-button>
                                        <p-button
                                            *ngIf="selectedColldItems.length > 0"
                                            icon="pi pi-trash"
                                            (onClick)="deleteSelectedColldItems()"
                                            [loading]="deletingColld"
                                            styleClass="p-button-sm p-button-danger p-button-raised"
                                            pTooltip="Eliminar items seleccionados"
                                            tooltipPosition="top"
                                        ></p-button>
                                        <p-button
                                            icon="pi pi-plus"
                                            (onClick)="openColldForm()"
                                            styleClass="p-button-sm p-button-primary p-button-raised"
                                            pTooltip="Agregar Detalle"
                                        ></p-button>
                                    </div>
                                </div>
                            </ng-template>

                            <ng-template pTemplate="header">
                                <tr>
                                    <th style="width: 40px">
                                        <p-checkbox
                                            *ngIf="multiSelectMode"
                                            [(ngModel)]="selectAllColld"
                                            [binary]="true"
                                            (onChange)="toggleSelectAllColld()"
                                            label=""
                                        ></p-checkbox>
                                    </th> <!-- Columna para checkboxes o handle de arrastre -->
                                    <th pSortableColumn="refid" style="width: 100px">Ref ID <p-sortIcon field="refid"></p-sortIcon></th>
                                    <th pSortableColumn="url_img" style="width: 150px">Imagen</th>
                                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                                    <th pSortableColumn="orden" style="width: 120px">Orden</th>
                                    <th style="width: 150px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template pTemplate="body" let-colld let-rowIndex="rowIndex">
                                <tr [pReorderableRow]="rowIndex" [class.bg-blue-50]="colld === collectionSeleccionada">

                                    <!-- Columna del checkbox o handle de arrastre -->
                                    <td class="text-center">
                                        <div *ngIf="multiSelectMode" class="flex justify-center">
                                            <p-checkbox
                                                [(ngModel)]="selectedColldItemsMap[colld.id_colld]"
                                                [binary]="true"
                                                (onChange)="onColldItemSelectionChange(colld)"
                                            ></p-checkbox>
                                        </div>
                                        <div *ngIf="!multiSelectMode" class="drag-handle-container">
                                            <span
                                                pReorderableRowHandle
                                                class="pi pi-bars drag-handle"
                                                pTooltip="Arrastrar para reordenar"
                                                (mousedown)="onHandleMouseDown()"
                                                (dragstart)="onDragStart()"
                                            ></span>
                                        </div>
                                    </td>
                                    
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

                                    <!-- Orden - MOSTRAR ORDEN ACTUAL -->
                                    <td>
                                        <span class="font-medium text-blue-600">{{rowIndex + 1}}</span>
                                    </td>

                                    <!-- Acciones - SOLO ELIMINAR -->
                                    <td>
                                        <button
                                            pButton
                                            icon="pi pi-trash"
                                            (click)="eliminarColld(colld); $event.stopPropagation()"
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
            [style]="{width: '700px', height: '75vh', minHeight: '650px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="collectionForm" (ngSubmit)="saveCollection()">
                <div class="grid grid-cols-1 gap-4" style="max-height: 65vh; overflow-y: auto; padding: 0 8px 8px 0;">
                    <div style="height: 0; margin-top: 1rem;"></div>
                    <!-- Nombre y Estado en el mismo renglón -->
                    <div class="flex gap-4" style="align-items: flex-start;">
                        <!-- Nombre -->
                        <div class="flex-1">
                            <p-floatLabel variant="on">
                                <input
                                    pInputText
                                    formControlName="nombre"
                                    placeholder="Ingrese el nombre de la colección"
                                    class="w-full"
                                    maxlength="100"
                                    style="height: 2.5rem;"
                                    (input)="onNombreInput($event)"
                                />
                                <label>Nombre *</label>
                            </p-floatLabel>
                            <small *ngIf="collectionForm.get('nombre')?.invalid && collectionForm.get('nombre')?.touched"
                                   class="text-red-500 text-xs mt-1">
                                El nombre es obligatorio
                            </small>
                        </div>

                        <!-- Estado (Activo) y sw_fijo (Permanente) -->
                        <div class="flex items-center gap-2 pt-1">
                            <p-tag
                                [value]="collectionForm.get('estado')?.value ? 'Activo' : 'Inactivo'"
                                [severity]="collectionForm.get('estado')?.value ? 'success' : 'danger'"
                                (click)="toggleFormField('estado')"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                title="Clic para cambiar">
                            </p-tag>
                            <p-tag
                                [value]="collectionForm.get('sw_fijo')?.value ? 'Lock' : 'Unlock'"
                                [severity]="collectionForm.get('sw_fijo')?.value ? 'warning' : ''"
                                (click)="toggleSwFijo()"
                                class="cursor-pointer hover:opacity-80 transition-opacity min-w-20 flex items-center gap-1"
                                title="Clic para cambiar">
                                <i [class]="collectionForm.get('sw_fijo')?.value ? 'pi pi-lock' : 'pi pi-lock-open'"
                                   class="text-sm"></i>
                            </p-tag>
                        </div>
                    </div>

                    <!-- Descripción -->
                    <div>
                        <p-floatLabel variant="on">
                            <textarea
                                pInputTextarea
                                formControlName="descripcion"
                                placeholder="Descripción detallada de la colección"
                                class="w-full p-inputtext"
                                rows="3"
                                maxlength="255"
                                style="resize: vertical; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; min-height: 5rem;"
                            ></textarea>
                            <label>Descripción</label>
                        </p-floatLabel>
                    </div>


                    <!-- Tipo de Colección -->
                    <div>
                        <p-select
                        formControlName="id_tipoc"
                        [options]="tipoCollOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Seleccionar tipo de colección"
                        styleClass="w-full text-sm"
                        appendTo="body"
                        [style]="{'z-index': '9999', 'height': '2.5rem'}"
                    ></p-select>
                    </div>

                    <!-- SWSCHED con fechas dependientes -->
                    <div class="flex items-end gap-4">
                        <!-- Botón SWSCHED a la izquierda -->
                        <div class="flex-shrink-0">
                            <div class="flex flex-col items-center gap-1">
                                <p-tag
                                    [value]="collectionForm.get('swsched')?.value ? 'Programado' : 'Permanente'"
                                    [severity]="collectionForm.get('swsched')?.value ? 'info' : 'success'"
                                    (click)="toggleSwsched()"
                                    class="cursor-pointer hover:opacity-80 transition-opacity min-w-16"
                                    title="Clic para cambiar">
                                </p-tag>
                            </div>
                        </div>

                        <!-- Fechas a la derecha (solo si swsched está activo) -->
                        <div *ngIf="collectionForm.get('swsched')?.value" class="flex-1 grid grid-cols-2 gap-4">
                            <!-- Fecha Inicio -->
                            <div>
                                <p-datepicker
                                    formControlName="fecha_ini"
                                    placeholder="Seleccionar fecha"
                                    dateFormat="mm/dd/yy"
                                    [showIcon]="true"
                                    [appendTo]="'body'"
                                    [style]="{'width': '100%'}"
                                    inputStyleClass="h-10"
                                    panelStyleClass="small-calendar"
                                ></p-datepicker>
                            </div>

                            <!-- Fecha Fin -->
                            <div>
                                <p-datepicker
                                    formControlName="fecha_fin"
                                    placeholder="Seleccionar fecha"
                                    dateFormat="mm/dd/yy"
                                    [showIcon]="true"
                                    [appendTo]="'body'"
                                    [style]="{'width': '100%'}"
                                    inputStyleClass="h-10"
                                    panelStyleClass="small-calendar"
                                ></p-datepicker>
                            </div>
                        </div>

                        <!-- Placeholder cuando swsched está inactivo -->
                        <ng-template #fechaFinPlaceholder>
                            <div *ngIf="!collectionForm.get('swsched')?.value" class="flex-1 flex items-center justify-center">
                                <span class="text-xs text-gray-400">Activar programado para mostrar fechas</span>
                            </div>
                        </ng-template>
                    </div>

                    <!-- Campos booleanos -->
                    <div class="grid grid-cols-3 gap-3">
                        <div class="flex items-center gap-2">
                            <p-tag
                                [value]="collectionForm.get('swtag')?.value ? 'Tag' : 'No Tag'"
                                [severity]="collectionForm.get('swtag')?.value ? 'success' : 'info'"
                                (click)="toggleFormField('swtag')"
                                class="cursor-pointer hover:opacity-80 transition-opacity min-w-16"
                                title="Clic para cambiar">
                            </p-tag>
                            <!-- Input para tag (solo cuando swtag está activado) -->
                            <input
                                *ngIf="collectionForm.get('swtag')?.value"
                                pInputText
                                formControlName="tag"
                                placeholder="Etiqueta de la colección"
                                class="ml-2 w-40 text-sm"
                                maxlength="50"
                            />
                        </div>

                    </div>

                    <!-- Campos slug -->
                    <div class="grid grid-cols-3 gap-3 mt-2">
                        <div class="flex items-center gap-2">
                            <p-tag
                                [value]="collectionForm.get('swslug')?.value ? 'Slug' : 'No Slug'"
                                [severity]="collectionForm.get('swslug')?.value ? 'success' : 'info'"
                                (click)="toggleSwSlug()"
                                class="cursor-pointer hover:opacity-80 transition-opacity min-w-16"
                                title="Clic para cambiar">
                            </p-tag>
                            <!-- Input para slug (solo cuando swslug está activado) -->
                            <input
                                *ngIf="collectionForm.get('swslug')?.value"
                                pInputText
                                formControlName="slug"
                                placeholder="slug-generado-automaticamente"
                                class="ml-2 w-40 text-sm"
                                maxlength="100"
                                (input)="onSlugInput($event)"
                            />
                        </div>
                    </div>

                    <!-- Información de solo lectura -->
                    <div *ngIf="isEditingCollection" class="border-t pt-3 grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium mb-1">Última Modificación</label>
                            <p class="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                                {{ collectionSeleccionada?.fecha_mod | date:'short' }}
                            </p>
                        </div>
                        <div>
                            <label class="block text-xs font-medium mb-1">Usuario</label>
                            <p class="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                                {{ collectionSeleccionada?.usr_m }}
                            </p>
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
                        class="p-button-primary"
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
        .compact-filter-button.p-button {
            padding: 0.25rem 0.5rem !important;
            min-height: 1.75rem !important;
            font-size: 0.75rem !important;
            line-height: 1.25 !important;
            border-radius: 0.25rem !important;
        }

        .compact-filter-button.p-button .p-button-label {
            padding: 0 !important;
            margin: 0 !important;
        }

        /* Estilos para select en edición inline */
        .inline-select .p-select {
            height: 2rem !important;
            min-height: 2rem !important;
            vertical-align: middle !important;
            display: inline-block !important;
        }

        .inline-select .p-select .p-select-label {
            font-size: 0.875rem !important;
            line-height: 1.5 !important;
            padding: 0.125rem 0.5rem !important;
            vertical-align: middle !important;
            height: 1.5rem !important;
            display: flex !important;
            align-items: center !important;
        }

        .inline-select .p-select .p-select-dropdown {
            width: 1.5rem !important;
            height: 1.5rem !important;
            vertical-align: middle !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        /* Estilos para el panel del dropdown */
        .inline-select .p-select-panel {
            min-width: 120px !important;
            max-width: 200px !important;
        }

        /* Ajuste adicional para el contenedor inline */
        .inline-edit-container {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            gap: 0.25rem;
            padding: 0.125rem 0;
            vertical-align: middle !important;
            height: 100% !important;
            min-height: 2rem;
            position: relative !important;
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

        /* Estilos mejorados para el handle de arrastre */
        .drag-handle-container {
            padding: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 40px;
        }

        .drag-handle {
            cursor: move !important;
            color: #6b7280 !important;
            font-size: 16px !important;
            padding: 8px !important;
            border-radius: 4px !important;
            transition: all 0.2s ease !important;
            display: inline-block !important;
            min-width: 20px !important;
            text-align: center !important;
        }

        .drag-handle:hover {
            color: #3b82f6 !important;
            background-color: #f3f4f6 !important;
            transform: scale(1.1) !important;
        }

        /* Estilo para la fila mientras se arrastra */
        .p-datatable .p-datatable-tbody > tr.p-highlight {
            background-color: #dbeafe !important;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
        }

        /* Mejorar la altura de las filas para mejor precisión */
        .p-datatable .p-datatable-tbody > tr > td {
            padding: 12px 8px !important;
            vertical-align: middle !important;
            min-height: 50px !important;
        }

        /* Indicadores visuales durante el drag */
        .p-datatable .p-datatable-tbody > tr.p-row-dragging {
            opacity: 0.7 !important;
            background-color: #e0f2fe !important;
        }

        /* Estilos para el modal personalizado */
        :host ::ng-deep .custom-modal .p-dialog {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            border-radius: 0.5rem !important;
            overflow: hidden !important;
        }

        :host ::ng-deep .custom-modal .p-dialog-header {
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

        /* Estilos para botones de tabla */
        .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.5rem;
            vertical-align: middle;
        }

        .p-datatable .p-datatable-tbody > tr:hover {
            background-color: #f8fafc;
        }

        /* Estilos para botones */
        :host ::ng-deep .p-button.p-button-text.p-button-sm {
            width: 2rem !important;
            height: 2rem !important;
            min-width: 2rem !important;
            padding: 0 !important;
            border-radius: 0.25rem !important;
        }

        :host ::ng-deep .p-button.p-button-text.p-button-sm .p-button-icon {
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
        :host ::ng-deep .p-dialog {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            border-radius: 0.5rem !important;
            overflow: hidden !important;
        }

        :host ::ng-deep .p-dialog-header {
            color: #374151 !important;
            background: #f9fafb !important;
            border-bottom: 1px solid #e5e7eb !important;
            padding: 1rem 1.5rem !important;
        }

        :host ::ng-deep .p-dialog-content {
            padding: 1.5rem !important;
            background: white !important;
        }

        :host ::ng-deep .p-dialog-footer {
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
        :host ::ng-deep .p-dialog {
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

        /* Estilos específicos para botones con tooltip */
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

        /* Estilos para tooltips personalizados */
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

        /* Estilos para labels flotantes */
        :host ::ng-deep .p-floatlabel {
            width: 100%;
            position: relative;
        }

        :host ::ng-deep .p-floatlabel label {
            background: white;
            padding: 0 4px;
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            transition: all 0.2s ease;
            pointer-events: none;
            position: absolute;
            top: 50%;
            left: 0.75rem;
            transform: translateY(-50%);
            z-index: 1;
        }

        :host ::ng-deep .p-floatlabel input:focus + label,
        :host ::ng-deep .p-floatlabel input:not(:placeholder-shown) + label,
        :host ::ng-deep .p-floatlabel textarea:focus + label,
        :host ::ng-deep .p-floatlabel textarea:not(:placeholder-shown) + label,
        :host ::ng-deep .p-floatlabel .p-inputmask:focus + label,
        :host ::ng-deep .p-floatlabel .p-inputmask:not(.p-inputmask-empty) + label,
        :host ::ng-deep .p-floatlabel .p-select:focus + label,
        :host ::ng-deep .p-floatlabel .p-select:not(.p-select-empty) + label {
            top: 0;
            left: 0.75rem;
            transform: translateY(-50%) scale(0.85);
            color: #6366f1; /* Indigo */
            font-weight: 600;
        }

        :host ::ng-deep .p-floatlabel input,
        :host ::ng-deep .p-floatlabel textarea,
        :host ::ng-deep .p-floatlabel .p-inputmask input,
        :host ::ng-deep .p-floatlabel .p-select {
            padding-top: 1rem;
            padding-bottom: 0.5rem;
        }

        /* Estilos para campos booleanos */
        :host ::ng-deep .p-tag {
            font-size: 0.875rem;
            padding: 0.25rem 0.5rem;
            font-weight: 500;
        }

        /* Mejorar apariencia de textarea */
        :host ::ng-deep .p-floatlabel textarea {
            min-height: 80px;
            resize: vertical;
        }

        /* Estilos para botones tag personalizados */
        :host ::ng-deep .p-tag {
            font-size: 0.875rem;
            padding: 0.25rem 0.75rem;
            border-radius: 0.375rem;
            font-weight: 600;
            min-width: 4rem;
            text-align: center;
            transition: all 0.2s ease-in-out;
        }

        /* Estado hover para tags */
        :host ::ng-deep .p-tag.cursor-pointer:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Altura estándar para inputs de tag y slug */
        :host ::ng-deep input[formControlName="tag"],
        :host ::ng-deep input[formControlName="slug"] {
            height: 2.5rem !important;
        }

        /* Estilos para filas inactivas */
        :host ::ng-deep tr.collection-inactive {
            background-color: #f9fafb !important;
        }

        :host ::ng-deep tr.collection-inactive:hover {
            background-color: #f3f4f6 !important;
        }

        :host ::ng-deep tr.collection-inactive td {
            color: #6b7280 !important;
        }

        /* Estilos para calendario pequeño y posicionado */
        :host ::ng-deep .small-calendar {
            width: 280px !important;
            max-width: 280px !important;
            font-size: 0.875rem !important;
        }

        :host ::ng-deep .small-calendar .p-datepicker-calendar {
            width: 100% !important;
        }

        :host ::ng-deep .small-calendar .p-datepicker-header {
            padding: 0.5rem !important;
        }

        :host ::ng-deep .small-calendar .p-datepicker-calendar table {
            font-size: 0.8rem !important;
        }

        :host ::ng-deep .small-calendar .p-datepicker-calendar .p-datepicker-weekday {
            padding: 0.25rem !important;
        }

        :host ::ng-deep .small-calendar .p-datepicker-calendar .p-datepicker-other-month {
            color: #9ca3af !important;
        }

        /* Asegurar que el calendario se muestre por encima de otros elementos */
        :host ::ng-deep .small-calendar {
            z-index: 9999 !important;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        /* Estilos para ToggleSwitch */
        :host ::ng-deep .status-toggle.p-toggleswitch {
            display: inline-block;
            vertical-align: middle;
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

    // Control de estado temporal del ToggleSwitch
    toggleStates: { [key: string]: boolean } = {};

    // Filtros
    selectedTipoFilter: number[] = [];
    tipoFiltroSeleccionado: string = '';

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

    // Selección múltiple
    multiSelectMode = false;
    selectedColldItems: ColldItem[] = [];
    selectedColldItemsMap: { [key: number]: boolean } = {};
    selectAllColld = false;

    // Estados de modales COLLD
    showColldModal = false;
    showConfirmDialog = false;

    // Estados del formulario COLLD
    colldForm!: FormGroup;
    isEditingColld = false;


    // Confirmaciones COLLD
    confirmMessage = '';
    confirmHeader = '';
    confirmButtonLabel = 'Confirmar';
    accionConfirmada: (() => void) | null = null;
    accionCancelada: (() => void) | null = null;



    constructor(
        private fb: FormBuilder,
        private collService: CollService,
        private colldService: ColldService,
        private catConceptosDetService: CatConceptosDetService,
        private sessionService: SessionService,
        private messageService: MessageService,
    ) {
        this.initializeForms();
        this.initializeColldForms();
    }

    ngOnInit(): void {
        // Cargar tipos primero, luego colecciones para asegurar que los labels estén disponibles
        this.cargarTipoCollOptions();
    }

    // ========== MÉTODOS DE INICIALIZACIÓN ==========

    initializeForms(): void {
        const currentDate = this.getCurrentDate();
        this.collectionForm = this.fb.group({
            nombre: ['', [Validators.required]],
            descripcion: [''],
            swtag: [false],
            tag: [{value: '', disabled: true}],
            swslug: [false],
            slug: [{value: '', disabled: true}],
            estado: [true],
            id_tipoc: [null, [Validators.required]],
            fecha_ini: [new Date()],
            sw_fijo: [false],
            swsched: [false],
            fecha_fin: [new Date()]
        });
    }


    clearFilters(): void {
        this.selectedTipoFilter = [];
        this.tipoFiltroSeleccionado = '';
        this.cargarCollections(); // Cargar todas las colecciones sin filtro
        console.log('Filtros limpiados - recargando datos desde API');
    }

    onTipoFiltroClick(tipoValue: string): void {
        if (this.tipoFiltroSeleccionado === tipoValue) {
            // Si se hace clic en el mismo filtro, se desactiva (cargar todas)
            this.tipoFiltroSeleccionado = '';
            this.cargarCollections(); // Cargar todas las colecciones sin filtro
        } else {
            // Activar el filtro seleccionado
            this.tipoFiltroSeleccionado = tipoValue;
            this.cargarCollections({ id_tipoc: parseInt(tipoValue) }); // Cargar con filtro aplicado
        }
    }

    showAllTypes(): void {
        this.selectedTipoFilter = this.tipoCollOptions.map(option => option.value);
        this.onTipoFilterChange({ value: this.selectedTipoFilter });
    }

    filterByType(tipoId: number): void {
        this.selectedTipoFilter = [tipoId];
        this.onTipoFilterChange({ value: this.selectedTipoFilter });
    }

    getCurrentDate(): Date {
        return new Date();
    }

    initializeColldForms(): void {
        this.colldForm = this.fb.group({
            idref: [null, [Validators.required]]
        });
    }

    // ========== MÉTODOS DE DATOS ==========

    cargarCollections(filtros?: { id_tipoc?: number }): void {
        this.loadingCollections = true;

        // Preparar parámetros con filtros si se proporcionan
        const params: any = {};
        if (filtros?.id_tipoc) {
            params.filters = { id_tipoc: filtros.id_tipoc };
        }

        this.collService.getAllCollections(params).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200 && responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
                    // El servicio ya procesó los datos, responseData.data ya es el array directo
                    this.collections = responseData.data;
                    this.filteredCollections = [...this.collections]; // Ahora filteredCollections contiene los datos filtrados desde el API
                } else {
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
        this.catConceptosDetService.queryDetalles({
            clave: 'TIPOCOLL'
        }).subscribe({
            next: (response) => {
                if (response && response.statuscode === 200 && response.data) {
                    this.tipoCollOptions = response.data.map((tipo: any) => ({
                        label: tipo.descripcion || tipo.nombre || `Tipo ${tipo.concepto}`,
                        value: tipo.valor1 // Usar valor1 como el valor a setear
                    }));

                    // Después de cargar los tipos, cargar las colecciones para que los labels estén disponibles
                    this.cargarCollections();
                } else {
                    this.tipoCollOptions = [];
                }
            },
            error: (error) => {
                console.error('❌ Error al cargar tipos de colección desde catconceptosdet:', error.message || error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los tipos de colección disponibles',
                    life: 5000
                });
                this.tipoCollOptions = [];

                // Aún así cargar las colecciones, aunque sin tipos disponibles
                this.cargarCollections();
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
                this.loadingColld = false;

                // ✅ Marcar como cargado para evitar reintentos infinitos
                this.colldDataLoaded = true;

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
        if (this.collectionSeleccionada) {
            this.loadingColld = true; // ✅ Establecer estado de loading consistente
            this.colldDataLoaded = false; // Forzar recarga

            // Resetear selección múltiple
            this.multiSelectMode = false;
            this.selectedColldItems = [];
            this.selectedColldItemsMap = {};
            this.selectAllColld = false;

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

    // ========== REORDENAMIENTO CON DRAG & DROP ==========

    onHandleMouseDown(): void {
        // Handle mousedown event
    }

    onDragStart(): void {
        // Drag start event
    }

    onRowReorder(event: any): void {
        // ✅ En PrimeNG V20, el evento tiene dragIndex y dropIndex, no 'value'
        const dragIndex = event.dragIndex;
        const dropIndex = event.dropIndex;

        if (dragIndex !== undefined && dropIndex !== undefined) {
            // ✅ 1. Reordenar manualmente el array local
            const reorderedItems = [...this.filteredColldItems];
            const draggedItem = reorderedItems.splice(dragIndex, 1)[0];
            reorderedItems.splice(dropIndex, 0, draggedItem);

            // ✅ 2. Crear payload limpio DIRECTAMENTE del array reordenado
            const payloadItems = reorderedItems.map((item, index) => {
                const newOrder = index + 1;
                
                // Sincronizar orden local
                item.orden = newOrder;
                
                // Payload limpio
                return {
                    id_colld: item.id_colld,
                    orden: newOrder
                };
            });

            // ✅ 3. Actualizar arrays locales DESPUÉS de crear el payload
            this.filteredColldItems = reorderedItems;

            // ✅ 4. Sincronizar colldItems: encontrar y actualizar los items correspondientes
            reorderedItems.forEach((item, index) => {
                const colldIndex = this.colldItems.findIndex(colldItem => colldItem.id_colld === item.id_colld);
                if (colldIndex !== -1) {
                    this.colldItems[colldIndex].orden = index + 1;
                }
            });

            // ✅ 5. Enviar al servidor
            this.updateItemsOrderInServer(payloadItems);
        } else {
            console.error('❌ Error en reordenamiento: índices no definidos');
        }
    }

    private updateItemsOrderInServer(itemsPayload: {id_colld: number, orden: number}[]): void {
        if (!this.collectionSeleccionada || itemsPayload.length === 0) {
            return;
        }

        this.colldService.updateItemsOrder(
            this.collectionSeleccionada.id_coll,
            itemsPayload  // Solo id_colld y orden
        ).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Orden actualizado',
                    detail: `Orden de ${itemsPayload.length} items actualizado correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al actualizar orden:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar el orden de los items',
                    life: 5000
                });
                
                // Recargar datos para revertir cambios visuales
                this.refreshColldData();
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
        // Ejecutar callback de cancelación si existe
        if (this.accionCancelada) {
            this.accionCancelada();
        }

        this.showConfirmDialog = false;
        this.confirmMessage = '';
        this.confirmHeader = '';
        this.confirmButtonLabel = 'Confirmar';
        this.accionConfirmada = null;
        this.accionCancelada = null;
    }

    getMaxOrder(): number {
        return this.filteredColldItems.length > 0 ? Math.max(...this.filteredColldItems.map(item => item.orden)) : 0;
    }

    onTipoFilterChange(event: any): void {
        // Esta función ya no se usa para filtrado local,
        // ahora los filtros se aplican en la llamada al API
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

            // Resetear selección múltiple
            this.multiSelectMode = false;
            this.selectedColldItems = [];
            this.selectedColldItemsMap = {};
            this.selectAllColld = false;
        }
    }

    onCollectionDoubleClick(collection: CollItem): void {
        const coleccionCambiada = this.collectionSeleccionada?.id_coll !== collection.id_coll;

        this.collectionSeleccionada = collection;
        this.selectedCollectionId = collection.id_coll;

        // ✅ Si cambió la colección, resetear el estado de carga COLLD
        if (coleccionCambiada) {
            this.colldDataLoaded = false;
            this.colldItems = [];
            this.filteredColldItems = [];

            // Resetear selección múltiple
            this.multiSelectMode = false;
            this.selectedColldItems = [];
            this.selectedColldItemsMap = {};
            this.selectAllColld = false;
        }

        // Cambiar al tab de Items
        this.activeTabIndex = 1;

        // Forzar carga inmediata si es necesario
        if (!this.colldDataLoaded || coleccionCambiada) {
            this.cargarColldItems();
        }
    }

    toggleFormField(fieldName: string): void {
        const currentValue = this.collectionForm.get(fieldName)?.value;
        const newValue = !currentValue;

        // Cambiar el valor del formulario
        this.collectionForm.patchValue({ [fieldName]: newValue });

        // Manejar campos dependientes
        if (fieldName === 'swsched' && !newValue) {
            this.collectionForm.patchValue({ fecha_fin: this.getCurrentDate() });
        }

        // Manejar swtag - habilitar/deshabilitar campo tag
        if (fieldName === 'swtag') {
            if (newValue) {
                this.collectionForm.get('tag')?.enable();
            } else {
                this.collectionForm.patchValue({ tag: '' });
                this.collectionForm.get('tag')?.disable();
            }
        }
    }

    toggleSwsched(): void {
        this.toggleFormField('swsched');
    }

    toggleSwFijo(): void {
        this.toggleFormField('sw_fijo');
    }

    toggleSwSlug(): void {
        const currentValue = this.collectionForm.get('swslug')?.value;
        const newValue = !currentValue;

        // Cambiar el valor del formulario
        this.collectionForm.patchValue({ swslug: newValue });

        if (newValue) {
            // Si se activa el slug, generar desde el nombre actual
            const nombre = this.collectionForm.get('nombre')?.value || '';
            const slug = this.generateSlug(nombre);
            this.collectionForm.patchValue({ slug: slug });
            // Habilitar el campo slug
            this.collectionForm.get('slug')?.enable();
        } else {
            // Si se desactiva, limpiar el slug y deshabilitar el campo
            this.collectionForm.patchValue({ slug: '' });
            this.collectionForm.get('slug')?.disable();
        }
    }

    onSwschedChange(event: any): void {
        // Método legacy para compatibilidad
        this.toggleSwsched();
    }


    onSlugInput(event: any): void {
        // Permitir edición manual del slug cuando swslug está activado y el campo está habilitado
        if (this.collectionForm.get('swslug')?.value && this.collectionForm.get('slug')?.enabled) {
            const slugValue = this.sanitizeSlug(event.target.value);
            this.collectionForm.patchValue({ slug: slugValue });
        }
    }

    onNombreInput(event: any): void {
        const input = event.target;
        const pascalCaseValue = this.toPascalCase(input.value);
        input.value = pascalCaseValue;
        this.collectionForm.patchValue({ nombre: pascalCaseValue });

        // Generar slug automáticamente si swslug está activado y el campo slug está habilitado
        if (this.collectionForm.get('swslug')?.value && this.collectionForm.get('slug')?.enabled) {
            const slug = this.generateSlug(pascalCaseValue);
            this.collectionForm.patchValue({ slug: slug });
        }
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

    // ========== MÉTODOS DE FORMULARIO ==========

    openCollectionForm(collection?: CollItem): void {
        this.isEditingCollection = !!collection;

        if (collection) {
            this.collectionForm.patchValue({
                nombre: collection.nombre,
                descripcion: collection.descripcion || '',
                swtag: collection.swtag === 1,
                tag: collection.tag || '',
                swslug: collection.swslug === 1,
                slug: collection.slug || '',
                swsrc: collection.swsrc === 1,
                estado: collection.estado === 'A',
                id_tipoc: collection.id_tipoc,
                fecha_ini: this.formatDateForInput(collection.fecha_ini),
                sw_fijo: collection.sw_fijo === 1,
                swsched: collection.swsched === 1,
                fecha_fin: this.formatDateForInput(collection.fecha_fin)
            });

            // Configurar estado de los campos dependientes
            if (collection.swtag === 1) {
                this.collectionForm.get('tag')?.enable();
            } else {
                this.collectionForm.get('tag')?.disable();
            }

            if (collection.swslug === 1) {
                this.collectionForm.get('slug')?.enable();
            } else {
                this.collectionForm.get('slug')?.disable();
            }

            this.collectionSeleccionada = collection;
        } else {
            const currentDate = this.getCurrentDate();
            this.collectionForm.reset({
                estado: true,
                swtag: false,
                tag: '',
                swslug: false,
                slug: '',
                swsched: false,
                fecha_ini: new Date(),
                fecha_fin: new Date()
            });

            // Asegurar que los campos estén deshabilitados para nuevos registros
            this.collectionForm.get('tag')?.disable();
            this.collectionForm.get('slug')?.disable();
            this.collectionSeleccionada = null;
        }

        this.showCollectionModal = true;

        // Forzar actualización del valor de fecha después de que el modal se abra
        setTimeout(() => {
            const fechaIniValue = this.collectionForm.get('fecha_ini')?.value;
            if (fechaIniValue) {
                this.collectionForm.patchValue({
                    fecha_ini: fechaIniValue
                });
            }
        }, 100);
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
                swslug: formData.swslug ? 1 : 0,
                estado: formData.estado ? 'A' : 'I',
                sw_fijo: formData.sw_fijo ? 1 : 0,
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
        // Validar si la colección está bloqueada (sw_fijo = 1)
        if (this.validarColeccionBloqueada(collection, 'cambiar estado')) {
            return;
        }

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

    onToggleSwitchChange(isChecked: boolean, collection: CollItem): void {
        // Validar si la colección está bloqueada (sw_fijo = 1)
        if (this.validarColeccionBloqueada(collection, 'cambiar estado')) {
            return;
        }

        const valorActual = collection.estado;
        const nuevoEstado = isChecked ? 'A' : 'I';

        // Si el valor no cambió, no hacer nada
        if ((nuevoEstado === 'A' && valorActual === 'A') || (nuevoEstado === 'I' && valorActual === 'I')) {
            return;
        }

        // Para activación, hacer el cambio directamente
        if (nuevoEstado === 'A') {
            this.procesarCambioEstado(collection, 'A');
            return;
        }

        // Para desactivación, mostrar confirmación
        // Establecer estado temporal para mostrar el cambio visual
        this.toggleStates[collection.id_coll] = false;

        // Usar el sistema de confirmación del proyecto
        this.confirmMessage = `¿Está seguro de que desea desactivar la colección "${collection.nombre}"?`;
        this.confirmHeader = 'Confirmar Desactivación';
        this.accionConfirmada = () => {
            // Limpiar estado temporal y procesar el cambio
            delete this.toggleStates[collection.id_coll];
            this.procesarCambioEstado(collection, 'I');
        };
        this.accionCancelada = () => {
            // Revertir el estado temporal al estado original
            delete this.toggleStates[collection.id_coll];
        };
        this.showConfirmDialog = true;
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
        // Validar si la colección está bloqueada (sw_fijo = 1)
        if (this.validarColeccionBloqueada(collection, 'eliminar')) {
            return;
        }

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

    // Validar si la colección está bloqueada y mostrar mensaje
    private validarColeccionBloqueada(collection: CollItem, operacion: string): boolean {
        if (collection.sw_fijo === 1) {
            const mensajeOperacion = operacion === 'eliminar' ? 'eliminar' : 'cambiar el estado de';
            const severidad = operacion === 'eliminar' ? 'error' : 'warn';

            this.messageService.add({
                severity: severidad as 'error' | 'warn',
                summary: 'Operación no permitida',
                detail: `No se puede ${mensajeOperacion} una colección bloqueada (Lock). Desbloquee primero la colección.`,
                life: 6000
            });
            return true; // Está bloqueada
        }
        return false; // No está bloqueada
    }

    // Función para desbloquear colección
    desbloquearColeccion(collection: CollItem): void {
        this.confirmMessage = `¿Está seguro de que desea desbloquear la colección "${collection.nombre}"?`;
        this.confirmHeader = 'Confirmar Desbloqueo';
        this.confirmButtonLabel = 'Desbloquear';
        this.accionConfirmada = () => this.procesarDesbloqueo(collection);
        this.showConfirmDialog = true;
    }

    private procesarDesbloqueo(collection: CollItem): void {
        const estadoAnterior = collection.sw_fijo;
        collection.sw_fijo = 0;

        const payload: any = {
            action: 'UP',
            id_coll: collection.id_coll,
            sw_fijo: 0
        };

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.collService.updateCollection({ ...payload, ...sessionBase }).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Colección desbloqueada',
                        detail: `La colección "${collection.nombre}" ha sido desbloqueada exitosamente.`,
                        life: 4000
                    });
                } else {
                    // Revertir el cambio si falló
                    collection.sw_fijo = estadoAnterior;
                    throw new Error('Error al desbloquear la colección');
                }
            },
            error: (error) => {
                console.error('❌ Error al desbloquear colección:', error);
                // Revertir el cambio
                collection.sw_fijo = estadoAnterior;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al desbloquear la colección',
                    life: 5000
                });
            }
        });
    }

    getEstadoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: string): 'success' | 'danger' {
        return estado === 'A' ? 'success' : 'danger';
    }

    getCollectionToggleState(collection: CollItem): boolean {
        // Usar el estado temporal si existe, sino usar el estado real
        const tempState = this.toggleStates[collection.id_coll];
        return tempState !== undefined ? tempState : collection.estado === 'A';
    }

    getTipoCollectionLabel(idTipoc: any): string {
        if (!idTipoc || !this.tipoCollOptions.length) {
            return 'Cargando...';
        }

        // Buscar por valor exacto (comparar como string para evitar problemas de tipos)
        const tipo = this.tipoCollOptions.find(option => String(option.value) === String(idTipoc));

        if (tipo && tipo.label) {
            return tipo.label;
        }

        // Si no encuentra por valor, devolver un valor por defecto
        return 'Sin tipo';
    }

    private formatDateForInput(dateString: string): Date {
        if (!dateString) return this.getCurrentDate();
        return new Date(dateString);
    }

    private convertDateToISO(date: Date): string {
        if (!date) return new Date().toISOString();
        return date.toISOString();
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

    // ========== SELECCIÓN MÚLTIPLE ==========

    toggleMultiSelectMode(): void {
        this.multiSelectMode = !this.multiSelectMode;

        // Limpiar selecciones cuando se desactiva el modo
        if (!this.multiSelectMode) {
            this.selectedColldItems = [];
            this.selectedColldItemsMap = {};
            this.selectAllColld = false;
        } else {
            // Inicializar el mapa de selecciones
            this.filteredColldItems.forEach(item => {
                if (!this.selectedColldItemsMap[item.id_colld]) {
                    this.selectedColldItemsMap[item.id_colld] = false;
                }
            });
        }
    }

    toggleSelectAllColld(): void {
        if (this.selectAllColld) {
            // Seleccionar todos
            this.selectedColldItems = [...this.filteredColldItems];
            this.filteredColldItems.forEach(item => {
                this.selectedColldItemsMap[item.id_colld] = true;
            });
        } else {
            // Deseleccionar todos
            this.selectedColldItems = [];
            this.filteredColldItems.forEach(item => {
                this.selectedColldItemsMap[item.id_colld] = false;
            });
        }
    }

    onColldItemSelectionChange(item: ColldItem): void {
        const isSelected = this.selectedColldItemsMap[item.id_colld] || false;

        if (isSelected) {
            if (!this.selectedColldItems.includes(item)) {
                this.selectedColldItems.push(item);
            }
        } else {
            this.selectedColldItems = this.selectedColldItems.filter(selected => selected.id_colld !== item.id_colld);
        }

        // Actualizar el estado del "seleccionar todos"
        this.selectAllColld = this.selectedColldItems.length === this.filteredColldItems.length && this.filteredColldItems.length > 0;
    }

    deleteSelectedColldItems(): void {
        if (this.selectedColldItems.length === 0) {
            return;
        }

        // Usar el sistema de confirmación del proyecto
        this.confirmMessage = `¿Está seguro de eliminar ${this.selectedColldItems.length} item(s) de la colección? Esta acción no se puede deshacer.`;
        this.confirmHeader = 'Confirmar Eliminación Múltiple';
        this.accionConfirmada = () => this.procesarEliminacionMultiple();
        this.showConfirmDialog = true;
    }

    /**
     * Procesa la eliminación múltiple después de la confirmación
     */
    private procesarEliminacionMultiple(): void {
        // Preparar los IDs para eliminar
        const idsToDelete = this.selectedColldItems.map(item => item.id_colld);

        // Llamar al servicio de eliminación (sin id_coll)
        this.colldService.deleteColldItems(idsToDelete).subscribe({
            next: (response) => {
                // Actualizar las listas locales
                this.colldItems = this.colldItems.filter(item => !idsToDelete.includes(item.id_colld));
                this.filteredColldItems = this.filteredColldItems.filter(item => !idsToDelete.includes(item.id_colld));

                // Limpiar selecciones
                this.selectedColldItems = [];
                this.selectedColldItemsMap = {};
                this.selectAllColld = false;
                this.multiSelectMode = false;

                this.deletingColld = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Items eliminados',
                    detail: `${idsToDelete.length} item(s) eliminado(s) correctamente`
                });
            },
            error: (error) => {
                console.error('Error eliminando items:', error);
                this.deletingColld = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al eliminar',
                    detail: 'No se pudieron eliminar los items seleccionados',
                    life: 5000
                });
            }
        });
    }
}
