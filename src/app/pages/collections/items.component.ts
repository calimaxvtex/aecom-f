import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importar xlsx para exportación a Excel
import * as XLSX from 'xlsx';

// Importar módulos tradicionales de PrimeNG (compatibles con v20)
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonGroupModule } from 'primeng/buttongroup';

// Importar módulos adicionales para funcionalidad de reordenamiento
import { DragDropModule } from 'primeng/dragdrop';

import { Item } from '@/features/productos/models/items.interface';
import { Categoria } from '@/features/productos/models/categoria.interface';
import { Subcategoria } from '@/features/productos/models/subcategoria.interface';
import { Marca } from '@/features/productos/models/marca.interface';
import { ItemsService } from '@/features/productos/services/items.service';
import { CategoriasService } from '@/features/productos/services/categorias.service';
import { SubcategoriasService } from '@/features/productos/services/subcategorias.service';
import { MarcasService } from '@/features/productos/services/marcas.service';
import { ColldService } from '@/features/coll/services/colld.service';

@Component({
    selector: 'app-items',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        TableModule,
        CheckboxModule,
        InputTextModule,
        InputNumberModule,
        AutoCompleteModule,
        ToastModule,
        ProgressSpinnerModule,
        TagModule,
        ToggleSwitchModule,
        TooltipModule,
        FloatLabelModule,
        InputGroupModule,
        InputGroupAddonModule,
        ButtonGroupModule,
        DragDropModule
    ],
    template: `
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
            <!-- Panel de Filtros -->
            <div class="xl:col-span-1 space-y-4">
             

                <p-card header="🔍 Buscar">
                    <div class="mb-3">
                        <p-floatLabel variant="on">
                            <input pInputText [(ngModel)]="filtroNombre"  class="w-full" />
                            <label>Nombre del Artículo</label>
                        </p-floatLabel>
                    </div>

                  <!-- Categoría con opciones nativas (dropdown + showClear) -->
<div class="mb-3">
  <p-floatLabel variant="on">
    <p-autoComplete
        [(ngModel)]="categoriaSeleccionada"
        [suggestions]="categoriasFiltradas"
        (completeMethod)="filtrarCategorias($event)"
        (onSelect)="onCategoriaSelect($event)"
        (onClear)="onCategoriaClear()"
        field="nombre"
        optionLabel="nombre"
        [dropdown]="true"
        [showClear]="true"
        [style]="{'width':'100%'}"
        [showEmptyMessage]="true"
        emptyMessage="No se encontraron categorías"
        [dataKey]="'idcat'">
    </p-autoComplete>
    <label>Categoría</label>
  </p-floatLabel>
</div>


                 <!-- Subcategoría con opciones nativas (dropdown + showClear) -->
<div class="mb-3" *ngIf="categoriaSeleccionada">
  <p-floatLabel variant="on">
    <p-autoComplete
        [(ngModel)]="subcategoriaSeleccionada"
        [suggestions]="subcategoriasFiltradas"
        (completeMethod)="filtrarSubcategorias($event)"
        (onClear)="onSubcategoriaClear()"
        field="nombre"
        optionLabel="nombre"
     
        [dropdown]="true"
        [showClear]="true"
        [style]="{'width':'100%'}"
        [showEmptyMessage]="true"
        emptyMessage="No se encontraron subcategorías"
        [dataKey]="'idscat'">
    </p-autoComplete>
    <label>Subcategoría</label>
  </p-floatLabel>
</div>


               <!-- Marca con opciones nativas (dropdown + showClear) -->
<div class="mb-3">
  <p-floatLabel >
    <p-autoComplete
        [(ngModel)]="marcaSeleccionada"
        [suggestions]="marcasFiltradas"
        (completeMethod)="filtrarMarcas($event)"
        (onSelect)="onMarcaSelect($event)"
        (onClear)="onMarcaClear()"
        field="marca"
        optionLabel="marca"
        [dropdown]="true"
        [showClear]="true"
        [style]="{'width':'100%'}"
        [showEmptyMessage]="true"
        emptyMessage="No se encontraron marcas"
        scrollHeight="200px"
        [minLength]="1"
        [delay]="300">
    </p-autoComplete>
    <label>Marca</label>
  </p-floatLabel>
</div>


                    <!-- Sección Avanzada Expandible -->
                    <div class="mb-4">
                        <p-button [label]="seccionAvanzadaExpandida ? 'Ocultar Opciones Avanzadas' : 'Mostrar Opciones Avanzadas'"
                            icon="pi pi-chevron-down" [iconPos]="seccionAvanzadaExpandida ? 'right' : 'right'"
                            styleClass="p-button-text p-button-sm w-full" (onClick)="seccionAvanzadaExpandida = !seccionAvanzadaExpandida">
                        </p-button>

                        <div *ngIf="seccionAvanzadaExpandida" class="mt-4 space-y-4 border-t pt-4">
                        <div class="flex items-center justify-between mb-4">
                            <!-- Toggle para mostrar/ocultar columna de imagen -->
                            <div class="flex items-center items-center gap-2">
                                <label class="text-sm font-medium">Mostrar img</label>
                                <p-toggleSwitch
                                    [(ngModel)]="mostrarColumnaImagen"
                                    inputId="mostrarImagen"
                                    onLabel="Sí"
                                    offLabel="No"
                                    pTooltip="Activar/desactivar la columna de imagen en la tabla"
                                    tooltipPosition="top">
                                </p-toggleSwitch>
                            </div>

                            <!-- Toggle para mostrar/ocultar todas las columnas -->
                            <div class="flex items-center items-center gap-2">
                                <label class="text-sm font-medium">Mostrar todo</label>
                                <p-toggleSwitch
                                    [(ngModel)]="mostrarTodasLasColumnas"
                                    inputId="mostrarTodo"
                                    onLabel="Sí"
                                    offLabel="No"
                                    pTooltip="Mostrar todas las columnas adicionales (marca, categoría, etc.)"
                                    tooltipPosition="top">
                                </p-toggleSwitch>
                            </div>
                            </div>                            

                            <!-- Limit -->
<div class="mb-4">
  <p-floatLabel variant="on">
    <p-inputNumber
      inputId="filtroLimit"
      [(ngModel)]="filtroLimit"
      [min]="1"
      [max]="1000"
      [step]="10"
      placeholder="20"
      [style]="{'width':'100%'}">
    </p-inputNumber>
    <label>Límite de resultados</label>
  </p-floatLabel>
</div>

                        </div>
                    </div>

                    <!-- Botones -->
                    <div class="mt-6">
                        <p-button label="🔍 Buscar Items" icon="pi pi-search" (onClick)="buscarItems()" [loading]="loading"
                            [disabled]="!puedeBuscar()" styleClass="p-button-primary w-full"></p-button>
                    </div>
                    <div class="mt-2">
                        <p-button label="🗑️ Limpiar Filtros" icon="pi pi-filter-slash" (onClick)="limpiarFiltros()"
                            styleClass="p-button-secondary w-full p-button-sm"></p-button>
                    </div>
                </p-card>
            </div>

            <!-- Tabla de Items -->
            <div class="xl:col-span-3">
                <p-card header="📦 📝 Resultados de Catalogo">
                    <!-- Información de resultados -->
                    <div class="mb-4 flex items-center justify-between">
                        <div class="text-sm text-gray-600">
                            <strong>Resultados:</strong> {{ items.length }}
                            <span *ngIf="selectedItems.length > 0" class="ml-2 text-blue-600">| Seleccionados: {{ selectedItems.length }}</span>
                        </div>
                        <!-- Grupo de Botones de Acción -->
                        <p-buttonGroup>
                            <!-- Botón de búsqueda global -->
                            <p-button
                                icon="pi pi-search"
                                pTooltip="Buscar en resultados"
                                tooltipPosition="top"
                                styleClass="p-button-raised"
                                (onClick)="toggleFiltroGlobal()">
                            </p-button>

                            <!-- Botón Cargar Excel -->
                            <p-button pTooltip="Cargar archivo Excel con lista de artículos a consultar" tooltipPosition="top"
                                (onClick)="abrirSelectorArchivo()" styleClass="excel-gray-soft p-button-raised">
                                <i class="pi pi-file-excel"></i>
                                <i class="pi pi-arrow-up subtle-arrow" pTooltip="Subir archivo" tooltipPosition="bottom"></i>
                            </p-button>

                            <!-- Botón Exportar Excel -->
                            <p-button
                                *ngIf="items.length > 0"
                                pTooltip="Descargar resultados actuales en formato Excel"
                                tooltipPosition="top"
                                (onClick)="exportarExcel()"
                                styleClass="excel-gray-dark p-button-raised"
                            >
                                <i class="pi pi-file-excel"></i>
                                <i class="pi pi-arrow-down subtle-arrow" pTooltip="Descargar archivo" tooltipPosition="bottom"></i>
                            </p-button>

                            <!-- Botón Add (solo cuando hay items seleccionados) -->
                            <p-button *ngIf="selectedItems.length > 0" icon="pi pi-plus"
                                pTooltip="Agregar {{ selectedItems.length }} item(s) a la colección seleccionada"
                                tooltipPosition="top" (onClick)="agregarSeleccionados()" styleClass="p-button-success p-button-raised">
                            </p-button>
                        </p-buttonGroup>
                    </div>

                    <!-- Filtro Global de Tabla -->
                    <div *ngIf="mostrarFiltroGlobal" class="mb-4">
                        <p-inputGroup>
                            <p-inputGroupAddon>
                                <i class="pi pi-search"></i>
                            </p-inputGroupAddon>
                            <input
                                pInputText
                                [(ngModel)]="globalFilterValue"
                                placeholder="Buscar en nombre, artículo..."
                                class="w-full"
                                (input)="filtrarTablaGlobal()" />
                            <p-inputGroupAddon *ngIf="globalFilterValue" class="cursor-pointer" (click)="limpiarFiltroGlobal()">
                                <i class="pi pi-times text-gray-500"></i>
                            </p-inputGroupAddon>
                        </p-inputGroup>
                    </div>

                    <!-- Área de Carga Excel -->
                    <div *ngIf="mostrarAreaCargaExcel" class="mb-4 flex justify-center">
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors max-w-md w-full relative"
                             (dragover)="onDragOver($event)"
                             (dragleave)="onDragLeave($event)"
                             (drop)="onDrop($event)"
                             [class.border-green-400]="isDragOver"
                             [class.bg-green-50]="isDragOver">

                            <!-- Botón de cerrar/cancelar -->
                            <button type="button"
                                    class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    pTooltip="Cancelar carga"
                                    tooltipPosition="top"
                                    (click)="cancelarCargaExcel()">
                                <i class="pi pi-times text-gray-500 hover:text-gray-700"></i>
                            </button>

                            <div class="flex flex-col items-center">
                                <i class="pi pi-file-excel text-4xl text-green-600 mb-2"></i>
                                <p class="text-lg font-medium text-gray-700 mb-2">
                                    Arrastra tu archivo Excel aquí
                                </p>
                                <p class="text-sm text-gray-500 mb-4">
                                    O <button type="button" class="text-green-600 hover:text-green-800 underline" (click)="abrirSelectorArchivo()">haz clic para seleccionar</button>
                                </p>
                                <p class="text-xs text-gray-400 mb-4">
                                    El archivo debe contener una columna llamada "articulo"
                                </p>

                                <!-- Botón adicional de cancelar al final -->
                                <button type="button"
                                        class="mt-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                        (click)="cancelarCargaExcel()">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Input file oculto -->
                    <input #fileInput type="file" accept=".xlsx,.xls" (change)="onFileSelected($event)" class="hidden">

                    <!-- Loading -->
                    <div *ngIf="loading" class="flex justify-center py-8">
                        <p-progressSpinner></p-progressSpinner>
                    </div>

                    <!-- Tabla -->
                    <p-table *ngIf="!loading"
                        #dt
                        [value]="filteredItems.length > 0 || globalFilterValue ? filteredItems : items"
                        [(selection)]="selectedItems"
                        [paginator]="true" [rows]="10"
                        [rowsPerPageOptions]="[5, 10, 25, 50]"
                        [showCurrentPageReport]="true"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} items"
                        responsiveLayout="scroll"
                        dataKey="articulo"
                        selectionMode="multiple"
                        [metaKeySelection]="false"
                        [pDroppable]="true"
                        [pDroppableType]="'item'"
                        [dropEffect]="'move'"
                        (onDrop)="onRowDrop($event)"
                        (selectionChange)="onSelectionChange($event)"
                        (onSort)="onSort($event)"
                        >

                        <!-- Header con checkbox para seleccionar todos -->
                        <ng-template pTemplate="header">
                            <tr>
                                <th style="width: 50px">
                                    <p-checkbox [(ngModel)]="selectAll" [binary]="true" (onChange)="toggleSelectAll()" label=""></p-checkbox>
                                </th>
                                <th style="width: 50px">Orden</th>
                                <th *ngIf="mostrarColumnaImagen" style="width: 80px">Imagen</th>
                                <th pSortableColumn="nombre">
                                    Nombre
                                    <p-sortIcon field="nombre"></p-sortIcon>
                                </th>
                                <th pSortableColumn="articulo" style="width: 100px">
                                    Artículo
                                    <p-sortIcon field="articulo"></p-sortIcon>
                                </th>
                                <!-- Columnas adicionales (solo visibles si mostrarTodasLasColumnas = true) -->
                                <th *ngIf="mostrarTodasLasColumnas" pSortableColumn="marca" style="width: 100px">
                                    Marca
                                    <p-sortIcon field="marca"></p-sortIcon>
                                </th>
                                <th *ngIf="mostrarTodasLasColumnas" pSortableColumn="catNombre" style="width: 120px">
                                    Categoría
                                    <p-sortIcon field="catNombre"></p-sortIcon>
                                </th>
                                <th *ngIf="mostrarTodasLasColumnas" pSortableColumn="scatNombre" style="width: 120px">
                                    Subcategoría
                                    <p-sortIcon field="scatNombre"></p-sortIcon>
                                </th>
                                <th *ngIf="mostrarTodasLasColumnas" pSortableColumn="segNombre" style="width: 100px">
                                    Segmento
                                    <p-sortIcon field="segNombre"></p-sortIcon>
                                </th>
                                <th *ngIf="mostrarTodasLasColumnas" pSortableColumn="estado_articulo" style="width: 100px">
                                    Estado
                                    <p-sortIcon field="estado_articulo"></p-sortIcon>
                                </th>
                            </tr>
                        </ng-template>

                        <!-- Body de la tabla -->
                        <ng-template pTemplate="body" let-item let-index="rowIndex">
                            <tr [class.bg-blue-50]="selectedItems.includes(item)"
                                [pDraggable]="item"
                                [pDraggableType]="'item'"
                                [dragEffect]="'move'"
                                (onDragStart)="onDragStart($event, index)"
                                (onDragEnd)="onDragEnd($event)">
                                <td>
                                    <p-checkbox [(ngModel)]="selectedItemsMap[item.articulo]" [binary]="true" (onChange)="onItemSelectionChange(item)"></p-checkbox>
                                </td>
                                <td>
                                    <i class="pi pi-bars text-gray-400 cursor-move"
                                       [pDraggable]="item"
                                       [pDraggableType]="'item'"
                                       [dragEffect]="'move'"></i>
                                </td>
                                <td *ngIf="mostrarColumnaImagen">
                                    <div class="flex justify-center">
                                        <img [src]="item.url_img || '/images/avatar/avatar-1.png'" [alt]="item.nombre"
                                            class="w-12 h-12 object-cover rounded border" (error)="onImageError($event)" />
                                    </div>
                                </td>
                                <td><div class="font-medium">{{ item.nombre }}</div></td>
                                <td class="text-center">
                                    <span class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{{ item.articulo }}</span>
                                </td>
                                <!-- Celdas adicionales (solo visibles si mostrarTodasLasColumnas = true) -->
                                <td *ngIf="mostrarTodasLasColumnas" class="text-center">
                                    <span class="bg-blue-50 px-2 py-1 rounded text-xs font-medium text-blue-700">{{ item.marca }}</span>
                                </td>
                                <td *ngIf="mostrarTodasLasColumnas">
                                    <div class="text-sm">{{ item.catNombre }}</div>
                                    <div class="text-xs text-gray-500">ID: {{ item.idcat }}</div>
                                </td>
                                <td *ngIf="mostrarTodasLasColumnas">
                                    <div class="text-sm">{{ item.scatNombre }}</div>
                                    <div class="text-xs text-gray-500">ID: {{ item.idscat }}</div>
                                </td>
                                <td *ngIf="mostrarTodasLasColumnas">
                                    <div class="text-sm">{{ item.segNombre }}</div>
                                    <div class="text-xs text-gray-500">ID: {{ item.idseg }}</div>
                                </td>
                                <td *ngIf="mostrarTodasLasColumnas" class="text-center">
                                    <span [class]="item.estado_articulo === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        + ' px-2 py-1 rounded-full text-xs font-medium'">
                                        {{ item.estado_articulo === 'A' ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                            </tr>
                        </ng-template>

                        <!-- Empty state -->
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td [attr.colspan]="calcularColspanTotal()" class="text-center py-8">
                                    <div class="text-gray-500">
                                        <i class="pi pi-search text-2xl mb-2 block"></i>
                                        <div>No se encontraron items</div>
                                        <div class="text-sm">Utilice los filtros para buscar items específicos</div>
                                    </div>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>

                <!-- Items Agregados -->
                <p-card header="✅ Items Agregados" class="mt-4" *ngIf="itemsAgregados.length > 0">
                    <div class="space-y-2">
                        <div *ngFor="let item of itemsAgregados" class="flex items-center justify-between bg-green-50 p-3 rounded">
                            <div class="flex items-center gap-3">
                                <img [src]="item.url_img || '/images/avatar/avatar-1.png'" [alt]="item.nombre"
                                    class="w-8 h-8 object-cover rounded border" (error)="onImageError($event)" />
                                <div>
                                    <div class="font-medium text-sm">{{ item.nombre }}</div>
                                    <div class="text-xs text-gray-500">ID: {{ item.articulo }}</div>
                                </div>
                            </div>
                            <p-button icon="pi pi-times" size="small" styleClass="p-button-danger p-button-sm" (onClick)="removerItemAgregado(item)"></p-button>
                        </div>
                    </div>

                    <ng-template pTemplate="footer">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">Total agregados: {{ itemsAgregados.length }}</span>
                            <div class="flex gap-2">
                                <p-button label="Limpiar Todos" icon="pi pi-trash" styleClass="p-button-danger p-button-sm" (onClick)="limpiarItemsAgregados()"></p-button>
                                <p-button label="Procesar Items" icon="pi pi-check" styleClass="p-button-primary p-button-sm" (onClick)="procesarItemsAgregados()"></p-button>
                            </div>
                        </div>
                    </ng-template>
                </p-card>
            </div>
        </div>

        <!-- Caja de texto temporal para mostrar resultado del reordenamiento -->
        <div *ngIf="reorderResult" class="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg reorder-result-box">
            <h3 class="text-lg font-semibold mb-2">🔄 Resultado del Reordenamiento:</h3>
            <textarea
                [value]="reorderResult"
                readonly
                rows="10"
                class="w-full p-3 border border-gray-300 rounded font-mono text-sm bg-white"
                placeholder="Aquí aparecerá el array reordenado después de arrastrar las filas..."
            ></textarea>
            <div class="mt-2 flex gap-2">
                <p-button
                    label="Limpiar"
                    icon="pi pi-times"
                    styleClass="p-button-sm p-button-secondary"
                    (onClick)="reorderResult = ''"
                ></p-button>
                <p-button
                    label="Copiar al Portapapeles"
                    icon="pi pi-copy"
                    styleClass="p-button-sm p-button-primary"
                    (onClick)="copyReorderResult()"
                ></p-button>
            </div>
        </div>

        <p-toast></p-toast>
    `,
    styles: [`
        :host ::ng-deep .p-card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
        }

        :host ::ng-deep .p-card-body {
            padding: 1.5rem;
        }

        :host ::ng-deep .p-checkbox-label {
            display: none;
        }

        :host ::ng-deep .p-table .p-checkbox {
            margin: 0 auto;
        }

        :host ::ng-deep .p-table .p-datatable-tbody > tr > td {
            padding: 0.5rem;
        }

        :host ::ng-deep .p-table .p-datatable-thead > tr > th {
            padding: 0.75rem 0.5rem;
            font-weight: 600;
            background: #f8fafc;
            border-bottom: 2px solid #e2e8f0;
        }

        :host ::ng-deep .p-table .p-datatable-tbody > tr:hover {
            background: #f1f5f9;
        }

        :host ::ng-deep .no-border-dropdown .p-dropdown-panel {
            border: none;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .input-with-clear {
            position: relative;
            display: inline-block;
            width: 100%;
        }

        .input-with-clear .p-autocomplete {
            width: 100%;
        }

        .input-with-clear .clear-inside-btn {
            position: absolute;
            right: 2.5rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #dc2626;
            font-size: 0.875rem;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
            z-index: 10;
        }

        .input-with-clear .clear-inside-btn:hover {
            background: rgba(220, 38, 38, 0.1);
        }

        .input-with-clear .p-autocomplete .p-autocomplete-input {
            padding-right: 3rem !important;
        }

        /* Flechas sutiles para botones Excel */
        .subtle-arrow {
            font-size: 0.7em;
            opacity: 0.6;
            margin-left: 2px;
            position: relative;
            top: -1px;
        }

        /* Tono gris más suave para botón cargar Excel */
        .excel-gray-soft {
            background-color: #f3f4f6 !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
        }

        .excel-gray-soft:hover {
            background-color: #e5e7eb !important;
            border-color: #9ca3af !important;
        }

        .excel-gray-soft:focus {
            box-shadow: 0 0 0 0.2rem rgba(209, 213, 219, 0.5) !important;
        }

        /* Tono gris más oscuro para botón exportar Excel */
        .excel-gray-dark {
            background-color: #6b7280 !important;
            border-color: #6b7280 !important;
            color: white !important;
        }

        .excel-gray-dark:hover {
            background-color: #4b5563 !important;
            border-color: #4b5563 !important;
        }

        .excel-gray-dark:focus {
            box-shadow: 0 0 0 0.2rem rgba(107, 114, 128, 0.5) !important;
        }

        /* Mejorar apariencia de los iconos de ordenamiento */
        :host ::ng-deep .p-sortable-column .p-sortable-column-icon {
            color: rgba(0, 0, 0, 0.6) !important;
            margin-left: 0.25rem !important;
        }

        :host ::ng-deep .p-sortable-column.p-highlight .p-sortable-column-icon {
            color: rgb(55, 65, 81) !important; /* Gris oscuro para consistencia */
        }

        /* Estilos para múltiples criterios de ordenamiento */
        :host ::ng-deep .p-sortable-column-badge {
            background-color: rgb(55, 65, 81) !important;
            color: white !important;
            font-size: 0.75rem !important;
            font-weight: bold !important;
            min-width: 1.25rem !important;
            height: 1.25rem !important;
        }

        :host ::ng-deep .p-card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
        }

        :host ::ng-deep .p-card-body {
            padding: 1.5rem;
        }

        /* Header de tabla con color gris suave */
        :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
            background-color: #f9fafb !important;
            border-bottom: 2px solid #e5e7eb !important;
            color: #374151 !important;
            font-weight: 600 !important;
            padding: 0.75rem 0.5rem !important;
        }

        /* Hover en headers ordenables */
        :host ::ng-deep .p-datatable .p-sortable-column:hover {
            background-color: #f3f4f6 !important;
        }

        /* Header activo (ordenando) */
        :host ::ng-deep .p-datatable .p-sortable-column.p-highlight {
            background-color: #e5e7eb !important;
            color: #1f2937 !important;
        }

        /* Estilos para el handle de reordenamiento */
        :host ::ng-deep .pi-bars {
            font-size: 1rem !important;
            color: #6b7280 !important;
            transition: color 0.2s ease !important;
        }

        :host ::ng-deep .pi-bars:hover {
            color: #374151 !important;
        }

        :host ::ng-deep tr[pDraggable] {
            cursor: move !important;
        }

        :host ::ng-deep tr[pDraggable]:hover {
            background-color: #f9fafb !important;
        }

        /* Estilos para elementos arrastrables */
        :host ::ng-deep [pDraggable] {
            cursor: move !important;
        }

        :host ::ng-deep [pDraggable]:hover {
            opacity: 0.8 !important;
        }

        /* Estilos para zonas de soltar */
        :host ::ng-deep [pDroppable] {
            transition: background-color 0.2s ease !important;
        }

        :host ::ng-deep [pDroppable].p-draggable-enter {
            background-color: #e0f2fe !important;
            border: 2px dashed #0ea5e9 !important;
        }

        /* Estilos para la caja de resultado del reordenamiento */
        .reorder-result-box {
            max-height: 400px;
            overflow-y: auto;
        }

        .reorder-result-box textarea {
            resize: vertical;
            min-height: 200px;
        }
    `]
})
export class ItemsComponent implements OnInit {

    // Input para recibir el ID de colección seleccionada
    @Input() selectedCollectionId: number | null = null;

    private itemsService = inject(ItemsService);
    private categoriasService = inject(CategoriasService);
    private subcategoriasService = inject(SubcategoriasService);
    private marcasService = inject(MarcasService);
    private colldService = inject(ColldService);
    private messageService = inject(MessageService);

    // Estado
    loading = false;
    items: Item[] = [];
    selectedItems: Item[] = [];
    itemsAgregados: Item[] = [];
    selectAll = false;
    selectedItemsMap: { [key: number]: boolean } = {};

    // Reordenamiento
    reorderResult = '';

    // Filtros
    filtroNombre = '';
    filtroLimit = 10;
    categoriaSeleccionada: Categoria | null = null;
    subcategoriaSeleccionada: Subcategoria | null = null;

    // Filtro global de tabla
    globalFilterValue = '';
    mostrarFiltroGlobal = false;
    filteredItems: Item[] = [];
    marcaSeleccionada: Marca | null = null;

    // UI
    mostrarColumnaImagen = false;
    seccionAvanzadaExpandida = false;
    mostrarAreaCargaExcel = false;
    mostrarTodasLasColumnas = false;
    isDragOver = false;

    // Autocomplete
    categorias: Categoria[] = [];
    categoriasFiltradas: Categoria[] = [];
    subcategorias: Subcategoria[] = [];
    subcategoriasFiltradas: Subcategoria[] = [];
    marcas: Marca[] = [];
    marcasFiltradas: Marca[] = [];


    ngOnInit() {
        this.cargarMarcas();
        this.cargarCategorias();
        this.cargarSubcategoriasCacheInicial();
    }

    private cargarMarcas() {
        // ✅ El servicio ahora maneja automáticamente el cache local (7 días)
        console.log('🚀 Cargando marcas con cache local automático');
        this.marcasService.loadAllMarcas().subscribe({
            next: (marcas) => {
                this.marcas = marcas;
                this.marcasFiltradas = marcas;
                console.log(`📦 Marcas cargadas: ${marcas.length}`);
            },
            error: (error) => {
                console.error('❌ Error cargando marcas:', error);
                this.marcas = [];
                this.marcasFiltradas = [];
            }
        });
    }


    private cargarCategorias() {
        this.categoriasService.getCategorias().subscribe({
            next: (categorias: Categoria[]) => {
                this.categorias = categorias;
                this.categoriasFiltradas = [...categorias];
            }
        });
    }

    private cargarSubcategoriasCacheInicial() {
        console.log('🚀 Cargando subcategorías con cache local automático (7 días)');
        this.subcategoriasService.loadAllSubcategorias().subscribe({
            next: (subcategorias) => {
                console.log(`📦 Subcategorías cargadas: ${subcategorias.length} registros`);

                // Mostrar información del cache usado
                const cacheInfo = this.getSubcategoriasCacheInfo();
                const fuente = cacheInfo ? 'localStorage' : 'servidor';

                this.messageService.add({
                    severity: 'success',
                    summary: 'Subcategorías Cargadas',
                    detail: `${subcategorias.length} registros desde ${fuente}`,
                    life: 3000
                });
            },
            error: (error) => {
                console.error('❌ Error cargando subcategorías:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error en Subcategorías',
                    detail: 'No se pudieron cargar las subcategorías',
                    life: 4000
                });
            }
        });
    }

    buscarItems() {
        if (!this.puedeBuscar()) return;

        this.loading = true;
        this.items = [];
        this.selectedItems = [];
        this.selectedItemsMap = {};
        this.selectAll = false;

        const params: any = { limit: this.filtroLimit };
        if (this.filtroNombre.trim()) params.nombre = this.filtroNombre.trim();
        if (this.categoriaSeleccionada) params.idcat = this.categoriaSeleccionada.idcat;
        if (this.subcategoriaSeleccionada) params.idscat = this.subcategoriaSeleccionada.idscat;
        if (this.marcaSeleccionada) params.marca = this.marcaSeleccionada.marca;
        // Incluir el ID de colección seleccionada si existe
        if (this.selectedCollectionId) params.id_coll = this.selectedCollectionId;

        this.itemsService.getItems(params).subscribe({
            next: (response) => {
                this.items = response.data || [];
                this.filteredItems = [...this.items];
                this.filteredItems = [...this.items];
                this.loading = false;
                this.items.forEach(item => {
                    this.selectedItemsMap[item.articulo] = false;
                });
            },
            error: (error) => {
                console.error('❌ Error en búsqueda de items:', error);
                this.loading = false;

                // Limpiar estado del componente en caso de error
                this.items = [];
                this.selectedItems = [];
                this.selectedItemsMap = {};
                this.selectAll = false;

                // Mostrar mensaje de error al usuario
                if (error.message && error.message.includes('Debe especificar')) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Parámetros requeridos',
                        detail: error.message,
                        life: 5000
                    });
                } else {
                    // Intentar obtener el mensaje real del servicio
                    let mensajeError = 'Error al consultar items';

                    // Verificar si hay mensaje del backend
                    if (error.error?.mensaje) {
                        mensajeError = error.error.mensaje;
                    } else if (error.error?.message) {
                        mensajeError = error.error.message;
                    } else if (error.message) {
                        mensajeError = error.message;
                    } else if (error.status === 500) {
                        mensajeError = 'Error interno del servidor (500). Intente nuevamente.';
                    } else if (error.status === 0) {
                        mensajeError = 'No se pudo conectar al servidor. Verifique su conexión.';
                    }

                    // Determinar severidad basada en el código de estado
                    const severity = error.status === 400 || error.status === 422 ? 'warn' : 'error';
                    const summary = error.status === 400 || error.status === 422 ? 'Datos inválidos' : 'Error';

                    this.messageService.add({
                        severity: severity,
                        summary: summary,
                        detail: mensajeError,
                        life: 5000
                    });
                }
            }
        });
    }

    puedeBuscar(): boolean {
        return !!(this.filtroNombre.trim() || this.categoriaSeleccionada || this.marcaSeleccionada);
    }

    limpiarFiltros() {
        this.filtroNombre = '';
        this.filtroLimit = 10;
        this.categoriaSeleccionada = null;
        this.subcategoriaSeleccionada = null;
        this.marcaSeleccionada = null;
        this.subcategorias = [];
        this.subcategoriasFiltradas = [];
        this.items = [];
        this.filteredItems = [];  // ← Agregar esta línea
        this.selectedItems = [];
        this.selectedItemsMap = {};
        this.selectAll = false;
        this.globalFilterValue = '';  // ← Agregar esta línea
    }

    toggleSelectAll() {
        if (this.selectAll) {
            this.selectedItems = [...this.items];
            this.items.forEach(item => {
                this.selectedItemsMap[item.articulo] = true;
            });
        } else {
            this.selectedItems = [];
            this.items.forEach(item => {
                this.selectedItemsMap[item.articulo] = false;
            });
        }
    }

    onSelectionChange(selectedItems: Item[]) {
        this.selectedItems = selectedItems;
        this.selectAll = selectedItems.length === this.items.length && this.items.length > 0;
    }

    onItemSelectionChange(item: Item) {
        const isSelected = this.selectedItemsMap[item.articulo] || false;
        if (isSelected) {
            if (!this.selectedItems.includes(item)) {
                this.selectedItems.push(item);
            }
        } else {
            this.selectedItems = this.selectedItems.filter(selected => selected.articulo !== item.articulo);
        }
        this.selectAll = this.selectedItems.length === this.items.length && this.items.length > 0;
    }

    agregarSeleccionados() {
        // ✅ VALIDACIÓN: Verificar que haya colección seleccionada
        if (!this.selectedCollectionId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Colección requerida',
                detail: 'Debe seleccionar una colección primero para agregar items',
                life: 5000
            });
            return;
        }

        if (this.selectedItems.length === 0) {
            console.log('❌ No hay items seleccionados');
            return;
        }

        this.loading = true;

        // ✅ PREPARAR PAYLOAD CON FORMATO CORRECTO
        const payload = {
            id_coll: this.selectedCollectionId,
            items: this.selectedItems.map(item => ({
                articulo: item.articulo  // Solo envía los IDs de los items seleccionados
            }))
        };

        console.log('📦 Payload preparado:', payload);

        // ✅ LLAMADA AL SERVICIO createColld con payload completo
        console.log('🚀 Iniciando llamada al servicio createColld...');

        this.colldService.createColld(payload).subscribe({
            next: (response) => {
                console.log('✅ Items agregados exitosamente:', response);

                // ✅ MENSAJE DE ÉXITO
                this.messageService.add({
                    severity: 'success',
                    summary: 'Items agregados',
                    detail: `${this.selectedItems.length} items agregados a la colección correctamente`,
                    life: 3000
                });

                // ✅ LIMPIAR SELECCIÓN
                this.selectedItems = [];
                this.selectedItemsMap = {};
                this.selectAll = false;

                this.loading = false;
            },
            error: (error: any) => {
                console.error('❌ ===== ERROR DETECTADO =====');
                console.error('❌ Error completo:', error);
                console.error('❌ Tipo de error:', typeof error);
                console.error('❌ Error status:', error?.status);
                console.error('❌ Error message:', error?.message);
                console.error('❌ Error body:', error?.error);

                // Verificar si el error tiene la estructura esperada
                if (error && typeof error === 'object') {
                    console.error('❌ Propiedades del error:', Object.keys(error));
                }

                // ✅ MANEJO DE ERRORES MÁS DETALLADO
                let errorMessage = 'Ocurrió un error al agregar los items a la colección';
                let errorSummary = 'Error al agregar items';

                try {
                    // ✅ PRIORIDAD 1: Mensaje directo del error (errores del backend convertidos)
                    if (error?.message && error?.status) {
                        errorMessage = error.message;
                        console.log('✅ Mensaje directo del error del backend:', errorMessage);

                        // Determinar el tipo de error basado en el status del backend
                        if (error.status === 400) {
                            errorSummary = 'Datos requeridos faltantes';
                        } else if (error.status === 422) {
                            errorSummary = 'Error de validación';
                        } else if (error.status === 500) {
                            errorSummary = 'Error del servidor';
                        } else {
                            errorSummary = `Error ${error.status}`;
                        }
                    }
                    // ✅ PRIORIDAD 2: Mensajes anidados en error.error
                    else if (error?.error?.mensaje) {
                        errorMessage = error.error.mensaje;
                        console.log('✅ Mensaje encontrado en error.error.mensaje:', errorMessage);
                        errorSummary = error.error.statuscode === 400 ? 'Datos requeridos faltantes' : 'Error del backend';
                    } else if (error?.error?.message) {
                        errorMessage = error.error.message;
                        console.log('✅ Mensaje encontrado en error.error.message:', errorMessage);
                        errorSummary = 'Error del backend';
                    }
                    // ✅ PRIORIDAD 3: Mensaje directo del error
                    else if (error?.message) {
                        errorMessage = error.message;
                        console.log('✅ Mensaje encontrado en error.message:', errorMessage);
                        errorSummary = 'Error';
                    }
                    // ✅ PRIORIDAD 4: Códigos HTTP estándar
                    else if (error?.status === 500) {
                        errorMessage = 'Error interno del servidor (500). Intente nuevamente.';
                        errorSummary = 'Error del servidor';
                    } else if (error?.status === 400) {
                        errorMessage = 'Datos inválidos. Verifique la información enviada.';
                        errorSummary = 'Datos inválidos';
                    } else if (error?.status === 422) {
                        errorMessage = 'Error de validación. Verifique los datos de los items.';
                        errorSummary = 'Error de validación';
                    } else if (error?.status === 0) {
                        errorMessage = 'No se pudo conectar al servidor. Verifique su conexión.';
                        errorSummary = 'Error de conexión';
                    } else if (error?.status) {
                        errorMessage = `Error HTTP ${error.status}: ${error.statusText || 'Desconocido'}`;
                        errorSummary = `Error ${error.status}`;
                    }

                    console.log('✅ Error final preparado:', { summary: errorSummary, message: errorMessage, status: error?.status });

                } catch (parseError) {
                    console.error('❌ Error al procesar el mensaje de error:', parseError);
                    errorMessage = 'Error desconocido al procesar la respuesta del servidor';
                }

                // ✅ MOSTRAR ERROR AL USUARIO CON MÚLTIPLE INTENTO
                try {
                    const toastConfig = {
                        severity: 'error' as const,
                        summary: errorSummary,
                        detail: errorMessage,
                        life: 8000, // Más tiempo para debugging
                        sticky: true // Mantener visible hasta que el usuario lo cierre
                    };

                    console.log('📤 Enviando toast al MessageService:', toastConfig);
                    this.messageService.add(toastConfig);

                    // Verificar si el MessageService está disponible
                    if (this.messageService) {
                        console.log('✅ MessageService disponible');
                    } else {
                        console.error('❌ MessageService NO disponible');
                        alert(`Error: ${errorSummary} - ${errorMessage}`); // Fallback
                    }

                } catch (toastError) {
                    console.error('❌ Error al mostrar toast:', toastError);
                    alert(`Error crítico: ${errorSummary} - ${errorMessage}`); // Fallback de emergencia
                }

                this.loading = false;
            }
        });
    }

    // ========== EXPORTACIÓN A EXCEL ==========

    exportarExcel() {
        if (this.items.length === 0) {
            console.log('❌ No hay items para exportar');
            return;
        }

        console.log('📊 Iniciando exportación a Excel...');

        try {
            // Preparar datos para Excel - solo los datos de la tabla
            const datosExcel = this.items.map(item => ({
                'Artículo': item.articulo,
                'Nombre': item.nombre,
                'Marca': item.marca,
                'Categoría': item.catNombre || '',
                'Subcategoría': item.scatNombre || '',
                'Segmento': item.segNombre || '',
                'Estado': item.estado_articulo,
                'URL Imagen': item.url_img || ''
            }));

            // Crear workbook
            const wb = XLSX.utils.book_new();

            // Crear worksheet
            const ws = XLSX.utils.json_to_sheet(datosExcel);

            // Auto-ajustar columnas
            const colWidths = [
                { wch: 10 }, // Artículo
                { wch: 40 }, // Nombre
                { wch: 15 }, // Marca
                { wch: 15 }, // Categoría
                { wch: 15 }, // Subcategoría
                { wch: 15 }, // Segmento
                { wch: 8 },  // Estado
                { wch: 50 }  // URL Imagen
            ];
            ws['!cols'] = colWidths;

            // Agregar worksheet al workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Items');

            // Generar nombre de archivo con timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const fileName = `items_export_${timestamp}.xlsx`;

            // Descargar archivo
            XLSX.writeFile(wb, fileName);

            console.log(`✅ Exportación completada: ${fileName}`);
            console.log(`📊 Total de registros exportados: ${this.items.length}`);

            // Mostrar mensaje de éxito
            this.messageService.add({
                severity: 'success',
                summary: 'Exportación exitosa',
                detail: `Se exportaron ${this.items.length} registros a Excel`,
                life: 3000
            });

        } catch (error) {
            console.error('❌ Error en la exportación:', error);

            this.messageService.add({
                severity: 'error',
                summary: 'Error en exportación',
                detail: 'No se pudo exportar el archivo Excel',
                life: 4000
            });
        }
    }

    removerItemAgregado(item: Item) {
        this.itemsAgregados = this.itemsAgregados.filter(agregado => agregado.articulo !== item.articulo);
    }

    limpiarItemsAgregados() {
        this.itemsAgregados = [];
    }

    procesarItemsAgregados() {
        if (this.itemsAgregados.length === 0) return;
        console.log('⚙️ Procesando items agregados:', this.itemsAgregados);
    }

    filtrarCategorias(event: any) {
        const query = event.query.toLowerCase();
        this.categoriasFiltradas = this.categorias.filter(cat =>
            cat.nombre.toLowerCase().includes(query)
        );
    }

    onCategoriaSelect(event: any) {
        this.subcategoriaSeleccionada = null;
        this.cargarSubcategoriasDeCategoria();
    }

    onCategoriaClear() {
        this.categoriaSeleccionada = null;
        this.subcategoriaSeleccionada = null;
        this.subcategorias = [];
        this.subcategoriasFiltradas = [];
    }

    private cargarSubcategoriasDeCategoria() {
        if (!this.categoriaSeleccionada) return;

        this.subcategoriasService.getSubcategorias(this.categoriaSeleccionada.idcat).subscribe({
            next: (subcategorias) => {
                this.subcategorias = subcategorias;
                this.subcategoriasFiltradas = [...subcategorias];
            }
        });
    }

    filtrarSubcategorias(event: any) {
        const query = event.query.toLowerCase();
        this.subcategoriasFiltradas = this.subcategorias.filter(sub =>
            sub.nombre.toLowerCase().includes(query)
        );
    }

    onSubcategoriaClear() {
        this.subcategoriaSeleccionada = null;
    }

    filtrarMarcas(event: any) {
        const query = event.query ? event.query.toLowerCase().trim() : '';

        if (!query) {
            this.marcasFiltradas = [...this.marcas].sort((a, b) => 
                a.marca.localeCompare(b.marca)
            ).slice(0, 50);
            
        } else {
            this.marcasFiltradas = this.marcas
                .filter(marca => marca && marca.marca && marca.marca.toLowerCase().includes(query))
                .sort((a, b) => a.marca.localeCompare(b.marca)) // Orden alfabético
                .slice(0, 50);
        }
    }

    onMarcaClear() {
        this.marcaSeleccionada = null;
    }

    onMarcaSelect(event: any) {
        // En PrimeNG p-autoComplete, el valor seleccionado viene en event.value
        if (event && event.value && event.value.marca) {
            this.marcaSeleccionada = event.value;
        } else {
            console.warn('⚠️ Evento onSelect inválido:', event);
        }
    }

    // ========== FUNCIONALIDAD DE ORDENAMIENTO ==========

    onSort(event: any) {
        console.log('📊 Ordenamiento aplicado:', event);
        // El ordenamiento se maneja automáticamente por PrimeNG
        // Este método es para logging/debugging si es necesario
    }


    limpiarCategoria() {
        this.categoriaSeleccionada = null;
        this.subcategoriaSeleccionada = null;
        this.subcategorias = [];
        this.subcategoriasFiltradas = [];
    }

    limpiarSubcategoria() {
        this.subcategoriaSeleccionada = null;
    }

    limpiarMarca() {
        this.marcaSeleccionada = null;
    }

    // ========== FUNCIONALIDAD CARGA EXCEL ==========

    abrirSelectorArchivo() {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
        this.mostrarAreaCargaExcel = true;
    }

    cancelarCargaExcel() {
        this.mostrarAreaCargaExcel = false;
        this.isDragOver = false;
        console.log('Carga de Excel cancelada por el usuario');
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.procesarArchivoExcel(files[0]);
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.procesarArchivoExcel(file);
        }
        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        event.target.value = '';
    }

    procesarArchivoExcel(file: File) {
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            this.messageService.add({
                severity: 'error',
                summary: 'Archivo inválido',
                detail: 'Solo se permiten archivos Excel (.xlsx, .xls)',
                life: 5000
            });
            return;
        }

        console.log('📊 Procesando archivo Excel:', file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Tomar la primera hoja
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convertir a JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length === 0) {
                    throw new Error('El archivo Excel está vacío');
                }

                // Procesar los datos
                this.procesarDatosExcel(jsonData);

            } catch (error) {
                console.error('❌ Error procesando Excel:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error procesando Excel',
                    detail: 'No se pudo leer el archivo Excel. Verifique el formato.',
                    life: 5000
                });
            }
        };

        reader.readAsArrayBuffer(file);
    }

    procesarDatosExcel(jsonData: any[]) {
        try {
            // La primera fila son los headers
            const headers = jsonData[0] as string[];
            const dataRows = jsonData.slice(1);

            console.log('📋 Headers encontrados:', headers);
            console.log('📊 Filas de datos:', dataRows.length);

            // Buscar la columna "articulo" (case insensitive)
            const articuloIndex = headers.findIndex(header =>
                header && header.toString().toLowerCase().trim() === 'articulo'
            );

            if (articuloIndex === -1) {
                throw new Error('No se encontró la columna "articulo" en el archivo Excel');
            }

            console.log(`✅ Columna "articulo" encontrada en índice: ${articuloIndex}`);

            // Extraer los artículos de cada fila
            const articulos: number[] = [];
            dataRows.forEach((row, index) => {
                const articulo = row[articuloIndex];
                if (articulo !== null && articulo !== undefined && articulo !== '') {
                    // Convertir a número si es necesario
                    const articuloNum = typeof articulo === 'number' ? articulo : parseInt(articulo.toString());
                    if (!isNaN(articuloNum)) {
                        articulos.push(articuloNum);
                    } else {
                        console.warn(`⚠️ Fila ${index + 2}: Artículo inválido "${articulo}"`);
                    }
                }
            });

            if (articulos.length === 0) {
                throw new Error('No se encontraron artículos válidos en el archivo');
            }

            console.log(`📦 Artículos extraídos del Excel: ${articulos.length}`, articulos);

            // Crear la estructura de datos igual que selectedItems
            const itemsDesdeExcel = articulos.map(articulo => ({
                articulo: articulo
            }));

            // Llamar al método de búsqueda igual que agregarSeleccionados
            this.buscarDesdeExcel(itemsDesdeExcel);

            // Ocultar el área de carga
            this.mostrarAreaCargaExcel = false;

            this.messageService.add({
                severity: 'success',
                summary: 'Excel procesado',
                detail: `Se encontraron ${articulos.length} artículos para buscar`,
                life: 3000
            });

        } catch (error: any) {
            console.error('❌ Error procesando datos del Excel:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error en datos del Excel',
                detail: error.message || 'Error procesando los datos del archivo Excel',
                life: 5000
            });
        }
    }

    buscarDesdeExcel(itemsDesdeExcel: { articulo: number }[]) {
        console.log('🔍 Buscando artículos desde Excel:', itemsDesdeExcel.length);

        // Preparar consulta al API con los items del Excel
        const apiParams: any = {
            items: itemsDesdeExcel
        };

        // Incluir el ID de colección seleccionada si existe
        if (this.selectedCollectionId) apiParams.id_coll = this.selectedCollectionId;

        // Ejecutar consulta al servicio
        this.itemsService.getItems(apiParams).subscribe({
            next: (response) => {
                // Actualizar la tabla con los resultados (igual que búsqueda normal)
                this.items = response.data || [];
                this.filteredItems = [...this.items];
                this.selectedItems = [];
                this.selectedItemsMap = {};
                this.selectAll = false;

                // Inicializar checkboxes para los nuevos items
                this.items.forEach(item => {
                    this.selectedItemsMap[item.articulo] = false;
                });

                console.log(`✅ Búsqueda desde Excel completada - ${response.data?.length || 0} registros encontrados`);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Búsqueda completada',
                    detail: `${response.data?.length || 0} artículos encontrados en el sistema`,
                    life: 3000
                });
            },
            error: (error) => {
                console.error('❌ Error en búsqueda desde Excel:', error);

                // Limpiar tabla en caso de error (igual que búsqueda normal)
                this.items = [];
                this.selectedItems = [];
                this.selectedItemsMap = {};
                this.selectAll = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error en búsqueda',
                    detail: 'Error consultando los artículos del Excel',
                    life: 5000
                });
            }
        });
    }

    // ========== FUNCIONALIDAD IMÁGENES ==========

    // ========== UTILIDADES ==========

    calcularColspanTotal(): number {
        let totalColumnas = 3; // Columnas base: checkbox, nombre, artículo

        if (this.mostrarColumnaImagen) {
            totalColumnas += 1; // Columna de imagen
        }

        if (this.mostrarTodasLasColumnas) {
            totalColumnas += 5; // 5 columnas adicionales: marca, categoría, subcategoría, segmento, estado
        }

        return totalColumnas;
    }

    // ========== FUNCIONALIDAD IMÁGENES ==========

    onImageError(event: any) {
        // Evitar ciclo infinito: si ya es el avatar placeholder, no cambiar
        if (event.target.src.includes('avatar-1.png')) {
            // Ya es el placeholder, no hacer nada más
            event.target.src = '/images/avatar/avatar-1.png'; // Asegurar que se mantenga
            return;
        }

        // Cambiar a placeholder solo si no lo es ya
        event.target.src = '/images/avatar/avatar-1.png';
    }

    // ========== FILTRO GLOBAL DE TABLA ==========

    toggleFiltroGlobal() {
        this.mostrarFiltroGlobal = !this.mostrarFiltroGlobal;
        if (!this.mostrarFiltroGlobal) {
            this.limpiarFiltroGlobal();
        }
    }

    filtrarTablaGlobal() {
        // Aplicar filtro global usando el método filter de PrimeNG
        if (this.globalFilterValue && this.globalFilterValue.trim()) {
            // Filtrar manualmente los items por nombre y artículo
            const filteredItems = this.items.filter(item =>
                item.nombre?.toLowerCase().includes(this.globalFilterValue.toLowerCase()) ||
                item.articulo?.toString().toLowerCase().includes(this.globalFilterValue.toLowerCase())
            );
            // Actualizar la tabla con los items filtrados
            this.filteredItems = filteredItems;
        } else {
            // Si no hay filtro, mostrar todos los items
            this.filteredItems = [...this.items];
        }
        console.log('Filtrando tabla con valor:', this.globalFilterValue);
    }

    limpiarFiltroGlobal() {
        this.globalFilterValue = '';
        this.filteredItems = [...this.items];
    }

    // ========== FUNCIONALIDAD DE REORDENAMIENTO ==========

    draggedItem: any = null;
    draggedItemIndex: number = -1;

    onDragStart(event: any, index: number) {
        console.log('🚀 Inicio de arrastre:', event, 'índice:', index);
        this.draggedItem = event;
        this.draggedItemIndex = index;
    }

    onDragEnd(event: any) {
        console.log('🏁 Fin de arrastre:', event);
    }

    onRowDrop(event: any) {
        console.log('📦 Elemento soltado:', event);

        if (this.draggedItem && this.draggedItemIndex !== -1) {
            const draggedIndex = this.draggedItemIndex;
            const dropIndex = event.index || 0;

            // Reordenar el array
            const items = [...this.items];
            const draggedItem = items.splice(draggedIndex, 1)[0];
            items.splice(dropIndex, 0, draggedItem);

            // Actualizar arrays
            this.items = items;
            this.filteredItems = [...this.items];

            // Mostrar el array reordenado en la caja de texto temporal
            this.reorderResult = JSON.stringify(this.items, null, 2);

            // Actualizar los checkboxes
            this.updateSelectionMap();

            console.log('✅ Items reordenados:', this.items);
        }

        // Limpiar variables de arrastre
        this.draggedItem = null;
        this.draggedItemIndex = -1;
    }

    updateSelectionMap() {
        // Actualizar el mapa de selección después del reordenamiento
        this.items.forEach(item => {
            if (!(item.articulo in this.selectedItemsMap)) {
                this.selectedItemsMap[item.articulo] = false;
            }
        });
    }

    copyReorderResult() {
        navigator.clipboard.writeText(this.reorderResult).then(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Copiado',
                detail: 'Resultado del reordenamiento copiado al portapapeles',
                life: 2000
            });
        }).catch(() => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo copiar al portapapeles',
                life: 3000
            });
        });
    }

    // ========== MÉTODOS DE GESTIÓN DE CACHE ==========

    /**
     * Obtener información del cache de marcas
     */
    getMarcasCacheInfo() {
        return this.marcasService.getCacheInfo();
    }

    /**
     * Obtener información del cache de subcategorías
     */
    getSubcategoriasCacheInfo() {
        return this.subcategoriasService.getCacheInfo();
    }

    /**
     * Limpiar cache de marcas
     */
    clearMarcasCache() {
        this.marcasService.clearCache();
        console.log('🗑️ Cache de marcas limpiado desde componente');
        // Recargar marcas
        this.cargarMarcas();
    }

    /**
     * Limpiar cache de subcategorías
     */
    clearSubcategoriasCache() {
        this.subcategoriasService.clearCache();
        console.log('🗑️ Cache de subcategorías limpiado desde componente');
        // Recargar subcategorías
        this.cargarSubcategoriasCacheInicial();
    }

    /**
     * Limpiar todo el cache del componente
     */
    clearAllCache() {
        console.log('🗑️ Limpiando todo el cache del componente...');
        this.clearMarcasCache();
        this.clearSubcategoriasCache();
        this.messageService.add({
            severity: 'info',
            summary: 'Cache Limpiado',
            detail: 'Todo el cache ha sido limpiado y se está recargando',
            life: 3000
        });
    }

    /**
     * Mostrar información del cache en consola
     */
    logCacheInfo() {
        const marcasInfo = this.getMarcasCacheInfo();
        const subcategoriasInfo = this.getSubcategoriasCacheInfo();

        console.log('📊 INFORMACIÓN DEL CACHE:', {
            marcas: marcasInfo,
            subcategorias: subcategoriasInfo,
            timestamp: new Date().toISOString()
        });
    }
}