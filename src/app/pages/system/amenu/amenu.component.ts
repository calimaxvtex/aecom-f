import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of, map, catchError } from 'rxjs';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';

// Servicios y modelos
import { MenuService } from '@/core/services/menu/menu.service';
import { MenuLoaderService } from '@/core/services/menu/menu-loader.service';
import { MenuCrudItem, MenuFormItem } from '@/core/models/menu.interface';
import { RouteService } from '@/core/services/route/route.service';
import { IconSelectorImproved } from '@/pages/system/menu-admin/components/icon-selector-improved';

@Component({
  selector: 'app-amenu',
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
    SelectModule,
    ToggleButtonModule,
    TooltipModule,
    TagModule,
    FloatLabelModule,
    IconSelectorImproved
  ],
  providers: [MessageService],
  template: `
    <style>
      .cursor-context-menu {
        cursor: context-menu;
        position: relative;
      }
      .cursor-context-menu:hover {
        background-color: rgba(59, 130, 246, 0.05);
      }
      .column-filter-overlay .p-overlaypanel-content {
        padding: 0 !important;
      }
    </style>
    <div class="card">
      <p-toast></p-toast>

      <p-table
        #dt
        [value]="items"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10,25,50]"
        [loading]="loading"
        responsiveLayout="scroll"
        selectionMode="single"
        [(selection)]="selectedItem"
        dataKey="id_menu"
        [sortMode]="'multiple'"
        [globalFilterFields]="['id_menu','label','routerLink','tooltip']"
        [filterDelay]="300"
      >
        <ng-template #caption>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <input 
              pInputText
              type="text" 
              (input)="onGlobalFilter(dt, $event)" 
              placeholder="Buscar menús..." 
              class="w-full sm:w-60 order-1 sm:order-0"
            />
            <div class="flex gap-2 order-0 sm:order-1">
              <button
                (click)="refresh()"
                pButton
                raised
                icon="pi pi-refresh"
                [loading]="loading"
                pTooltip="Actualizar lista de menús"
              ></button>
              <button
                (click)="reloadDynamicMenu()"
                pButton
                raised
                icon="pi pi-sync"
                severity="success"
                [loading]="reloadingMenu"
                pTooltip="Recargar menú dinámico"
              ></button>
              <button
                (click)="openForm()"
                pButton
                raised
                icon="pi pi-plus"
                pTooltip="Agregar Menú"
              ></button>
            </div>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th 
              style="width:90px" 
              pSortableColumn="id_menu"
              (contextmenu)="openColumnFilter($event, 'id_menu')"
              class="cursor-context-menu"
              title="Click derecho para filtrar"
            >
              ID <p-sortIcon field="id_menu"></p-sortIcon>
            </th>
            <th 
              style="width:140px" 
              pSortableColumn="id_padre"
              (contextmenu)="openColumnFilter($event, 'id_padre')"
              class="cursor-context-menu"
              title="Click derecho para filtrar"
            >
              Id Padre <p-sortIcon field="id_padre"></p-sortIcon>
            </th>
            <th 
              style="width:120px" 
              pSortableColumn="orden"
              (contextmenu)="openColumnFilter($event, 'orden')"
              class="cursor-context-menu"
              title="Click derecho para filtrar"
            >
              Orden <p-sortIcon field="orden"></p-sortIcon>
            </th>
            <th 
              pSortableColumn="label"
              (contextmenu)="openColumnFilter($event, 'label')"
              class="cursor-context-menu"
              title="Click derecho para filtrar"
            >
              Label <p-sortIcon field="label"></p-sortIcon>
            </th>
            <th 
              pSortableColumn="routerLink"
              (contextmenu)="openColumnFilter($event, 'routerLink')"
              class="cursor-context-menu"
              title="Click derecho para filtrar"
            >
              RouterLink <p-sortIcon field="routerLink"></p-sortIcon>
            </th>
            <th style="width:80px">Icono</th>
            <th 
              style="width:120px" 
              pSortableColumn="swItenms"
              (contextmenu)="openColumnFilter($event, 'swItenms')"
              class="cursor-context-menu"
              title="Click derecho para filtrar"
            >
              swItems <p-sortIcon field="swItenms"></p-sortIcon>
            </th>
            <th 
              style="width:120px" 
              pSortableColumn="visible"
              (contextmenu)="openColumnFilter($event, 'visible')"
              class="cursor-context-menu"
              title="Click derecho para filtrar"
            >
              Visible <p-sortIcon field="visible"></p-sortIcon>
            </th>
            <th style="width:140px">Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-row>
          <tr [class.bg-blue-50]="row === selectedItem">
            <!-- 1) id_menu solo lectura -->
            <td>{{ row.id_menu }}</td>

            <!-- 2) id_padre editable inline -->
            <td>
              <span
                *ngIf="editingCell !== row.id_menu + '_id_padre'"
                (click)="startEdit(row, 'id_padre'); $event.stopPropagation()"
                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                title="Clic para editar"
              >
                {{ row.id_padre }}
              </span>
              <div
                *ngIf="editingCell === row.id_menu + '_id_padre'"
                class="inline-edit-container"
              >
                <input
                  pInputText
                  type="number"
                  [(ngModel)]="row.id_padre"
                  (keyup.enter)="saveInline(row, 'id_padre')"
                  (keyup.escape)="cancelEdit()"
                  class="p-inputtext-sm flex-1"
                  #input
                  (focus)="input.select()"
                  autofocus
                  placeholder="ID Padre"
                />
                <button
                  pButton
                  icon="pi pi-check"
                  (click)="saveInline(row, 'id_padre')"
                  class="p-button-sm p-button-success p-button-text inline-action-btn"
                  pTooltip="Guardar (Enter)"
                ></button>
                <button
                  pButton
                  icon="pi pi-undo"
                  (click)="cancelEdit()"
                  class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                  pTooltip="Deshacer (Escape)"
                ></button>
              </div>
            </td>

            <!-- 3) orden editable inline -->
            <td>
              <span
                *ngIf="editingCell !== row.id_menu + '_orden'"
                (click)="startEdit(row, 'orden'); $event.stopPropagation()"
                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                title="Clic para editar"
              >
                {{ row.orden }}
              </span>
              <div
                *ngIf="editingCell === row.id_menu + '_orden'"
                class="inline-edit-container"
              >
                <input
                  pInputText
                  type="number"
                  [(ngModel)]="row.orden"
                  (keyup.enter)="saveInline(row, 'orden')"
                  (keyup.escape)="cancelEdit()"
                  class="p-inputtext-sm flex-1"
                  #input
                  (focus)="input.select()"
                  autofocus
                  placeholder="Orden"
                />
                <button
                  pButton
                  icon="pi pi-check"
                  (click)="saveInline(row, 'orden')"
                  class="p-button-sm p-button-success p-button-text inline-action-btn"
                  pTooltip="Guardar (Enter)"
                ></button>
                <button
                  pButton
                  icon="pi pi-undo"
                  (click)="cancelEdit()"
                  class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                  pTooltip="Deshacer (Escape)"
                ></button>
              </div>
            </td>

            <!-- 4) label editable inline -->
            <td>
              <span
                *ngIf="editingCell !== row.id_menu + '_label'"
                (click)="startEdit(row, 'label'); $event.stopPropagation()"
                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                title="Clic para editar"
              >
                {{ row.label }}
              </span>
              <div
                *ngIf="editingCell === row.id_menu + '_label'"
                class="inline-edit-container"
              >
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="row.label"
                  (keyup.enter)="saveInline(row, 'label')"
                  (keyup.escape)="cancelEdit()"
                  class="p-inputtext-sm flex-1"
                  #input
                  (focus)="input.select()"
                  autofocus
                  placeholder="Etiqueta del menú"
                />
                <button
                  pButton
                  icon="pi pi-check"
                  (click)="saveInline(row, 'label')"
                  class="p-button-sm p-button-success p-button-text inline-action-btn"
                  pTooltip="Guardar (Enter)"
                ></button>
                <button
                  pButton
                  icon="pi pi-undo"
                  (click)="cancelEdit()"
                  class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                  pTooltip="Deshacer (Escape)"
                ></button>
              </div>
            </td>

            <!-- 5) routerLink editable inline -->
            <td>
              <span
                *ngIf="editingCell !== row.id_menu + '_routerLink'"
                (click)="startEdit(row, 'routerLink'); $event.stopPropagation()"
                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                title="Clic para editar"
              >
                {{ row.routerLink || '—' }}
              </span>
              <div
                *ngIf="editingCell === row.id_menu + '_routerLink'"
                class="inline-edit-container"
              >
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="row.routerLink"
                  (keyup.enter)="saveInline(row, 'routerLink')"
                  (keyup.escape)="cancelEdit()"
                  class="p-inputtext-sm flex-1"
                  #input
                  (focus)="input.select()"
                  autofocus
                  placeholder="Ruta del router"
                />
                <button
                  pButton
                  icon="pi pi-check"
                  (click)="saveInline(row, 'routerLink')"
                  class="p-button-sm p-button-success p-button-text inline-action-btn"
                  pTooltip="Guardar (Enter)"
                ></button>
                <button
                  pButton
                  icon="pi pi-undo"
                  (click)="cancelEdit()"
                  class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                  pTooltip="Deshacer (Escape)"
                ></button>
              </div>
            </td>

            <!-- 6) Icono (solo lectura) -->
            <td class="text-center">
              <i [class]="row.icon || 'pi pi-question-circle'" class="text-lg text-gray-600" [title]="row.icon || 'Sin icono'"></i>
            </td>

            <!-- 7) swItems con p-tag clickeable -->
            <td>
              <p-tag 
                [value]="getSwItemsLabel(row.swItenms)" 
                [severity]="getSwItemsSeverity(row.swItenms)"
                (click)="toggleSwItems(row); $event.stopPropagation()"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                title="Clic para cambiar"
              ></p-tag>
            </td>

            <!-- 8) visible con p-tag clickeable -->
            <td>
              <p-tag 
                [value]="getVisibleLabel(row.visible)" 
                [severity]="getVisibleSeverity(row.visible)"
                (click)="toggleVisible(row); $event.stopPropagation()"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                title="Clic para cambiar"
              ></p-tag>
            </td>

            <!-- 9) actions: editar, borrar -->
            <td (click)="$event.stopPropagation()">
              <div class="flex gap-1">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="openForm(row)"
                  class="p-button-sm p-button-text p-button-warning"
                  pTooltip="Editar Menú"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  (click)="eliminarMenu(row)"
                  class="p-button-sm p-button-text p-button-danger"
                  pTooltip="Eliminar Menú"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Dialog para Filtros Contextuales -->
      <p-dialog 
        [(visible)]="showColumnFilter" 
        [modal]="true" 
        [draggable]="false" 
        [style]="{width: '300px'}" 
        [closable]="true" 
        [dismissableMask]="true" 
        [resizable]="false" 
        [header]="'Filtrar ' + getColumnDisplayName(activeColumn)"
      >
        <div class="filter-content">
          <!-- Input para campos de texto -->
          <div *ngIf="getFilterType(activeColumn) === 'text'" class="mb-3">
            <p-floatLabel variant="on">
              <input
                pInputText
                [(ngModel)]="activeFilterValue"
                (input)="applyColumnFilter()"
                [placeholder]="'Buscar en ' + getColumnDisplayName(activeColumn) + '...'"
                class="w-full"
                autofocus
              />
              <label>Buscar texto</label>
            </p-floatLabel>
          </div>
          
          <!-- Input para campos numéricos -->
          <div *ngIf="getFilterType(activeColumn) === 'number'" class="mb-3">
            <p-floatLabel variant="on">
              <input
                pInputText
                type="number"
                [(ngModel)]="activeFilterValue"
                (input)="applyColumnFilter()"
                placeholder="Ingresa un número..."
                class="w-full"
                autofocus
              />
              <label>Buscar número</label>
            </p-floatLabel>
          </div>
          
          <!-- Tags para campos booleanos (igual que en la tabla) -->
          <div *ngIf="getFilterType(activeColumn) === 'boolean'" class="mb-3">
            <label class="block text-sm font-medium mb-1">Seleccionar valor</label>
            <div class="flex gap-2">
              <p-tag
                value="Todos"
                [severity]="activeFilterValue === '' ? 'info' : 'secondary'"
                (click)="setBooleanFilter('')"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                title="Mostrar todos"
              ></p-tag>
              <p-tag
                value="Sí"
                [severity]="activeFilterValue === true ? 'success' : 'secondary'"
                (click)="setBooleanFilter(true)"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                title="Solo elementos activos/visibles"
              ></p-tag>
              <p-tag
                value="No"
                [severity]="activeFilterValue === false ? 'danger' : 'secondary'"
                (click)="setBooleanFilter(false)"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                title="Solo elementos inactivos/ocultos"
              ></p-tag>
            </div>
          </div>
          
          <!-- Botones de acción -->
          <div class="flex gap-2 justify-end mt-4">
            <button 
              pButton 
              label="Limpiar" 
              icon="pi pi-times"
              size="small" 
              severity="secondary"
              outlined
              (click)="clearColumnFilter()"
            ></button>
            <button 
              pButton 
              label="Cerrar" 
              icon="pi pi-check"
              size="small" 
              (click)="closeColumnFilter()"
            ></button>
          </div>
        </div>
      </p-dialog>

      <!-- Formulario modal -->
      <p-dialog [(visible)]="showForm" [modal]="true" [draggable]="false" [style]="{width: '760px'}" [closable]="true" [dismissableMask]="true" [resizable]="false" [header]="isEditing ? 'Editar Menú' : 'Nuevo Menú'">
        <form [formGroup]="form" (ngSubmit)="submitForm()">
          <div class="grid grid-cols-1 gap-4">
            <!-- 1) Padre (movido al inicio) -->
            <div>
              <p-floatLabel variant="on">
                <p-select
                  formControlName="id_padre"
                  [options]="parentOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Sin padre (menú principal)"
                  class="w-full"
                  appendTo="body"
                  [style]="{'z-index': '9999'}"
                ></p-select>
                <label>Menú Padre</label>
              </p-floatLabel>
            </div>

            <!-- 2) routerLink como listbox desde RouteService -->
            <div>
              <p-floatLabel variant="on">
                <p-select
                  formControlName="routerLink"
                  [options]="routeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccionar ruta"
                  class="w-full"
                  appendTo="body"
                  [style]="{'z-index': '9999'}"
                  (onChange)="onRouteChange($event)"
                ></p-select>
                <label>RouterLink</label>
              </p-floatLabel>
            </div>

            <!-- 3) label y tooltip en el mismo renglón -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p-floatLabel variant="on">
                  <input
                    pInputText
                    formControlName="label"
                    placeholder="Etiqueta de menú"
                    class="w-full"
                    (blur)="formatLabelOnBlur()"
                  />
                  <label>Label *</label>
                </p-floatLabel>
              </div>
              <div>
                <p-floatLabel variant="on">
                  <input pInputText formControlName="tooltip" placeholder="Ayuda contextual" class="w-full" />
                  <label>Tooltip</label>
                </p-floatLabel>
              </div>
            </div>

            <!-- 4) icon con IconSelector -->
            <div>
              <div class="flex items-center gap-2">
                <i [class]="iconModel || 'pi pi-question-circle'" class="text-lg"></i>
                <span class="text-sm text-gray-600">{{ iconModel || 'Sin icono' }}</span>
                <button pButton type="button" icon="pi pi-chevron-down" class="p-button-text p-button-sm" (click)="toggleIconSelector()" pTooltip="Seleccionar icono"></button>
              </div>
              <div *ngIf="showIconSelector" class="mt-2 border rounded-lg p-2">
                <app-icon-selector
                  [(ngModel)]="iconModel"
                  (selectedIconChange)="onIconSelected($event)"
                  [currentLabel]="form.get('label')?.value || ''"
                  [ngModelOptions]="{standalone: true}"
                ></app-icon-selector>
              </div>
            </div>

            <!-- 5) swItenms -->
            <div class="flex items-center gap-2">
              <p-tag 
                [value]="toggleModel.swItenms ? 'Si' : 'No'" 
                [severity]="toggleModel.swItenms ? 'success' : 'danger'"
                (click)="toggleFormField('swItenms')"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                title="Clic para cambiar"
              ></p-tag>
              <span>¿Tiene sub-items?</span>
            </div>

            <!-- 6) visible / disable / separator -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div class="flex items-center gap-2">
                <p-tag 
                  [value]="toggleModel.visible ? 'Si' : 'No'" 
                  [severity]="toggleModel.visible ? 'success' : 'danger'"
                  (click)="toggleFormField('visible')"
                  class="cursor-pointer hover:opacity-80 transition-opacity"
                  title="Clic para cambiar"
                ></p-tag>
                <span>Visible</span>
              </div>
              <div class="flex items-center gap-2">
                <p-tag 
                  [value]="toggleModel.disable ? 'Si' : 'No'" 
                  [severity]="toggleModel.disable ? 'danger' : 'success'"
                  (click)="toggleFormField('disable')"
                  class="cursor-pointer hover:opacity-80 transition-opacity"
                  title="Clic para cambiar"
                ></p-tag>
                <span>Disable</span>
              </div>
              <div class="flex items-center gap-2">
                <p-tag 
                  [value]="toggleModel.separator ? 'Si' : 'No'" 
                  [severity]="toggleModel.separator ? 'success' : 'danger'"
                  (click)="toggleFormField('separator')"
                  class="cursor-pointer hover:opacity-80 transition-opacity"
                  title="Clic para cambiar"
                ></p-tag>
                <span>Separator</span>
              </div>
            </div>

          </div>

          <div class="flex justify-end gap-2 mt-5">
            <button pButton type="button" label="Cancelar" class="p-button-text" (click)="closeForm()"></button>
            <button pButton type="submit" [label]="isEditing ? 'Actualizar' : 'Guardar'" [loading]="saving" [disabled]="form.invalid"></button>
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

      <!-- Modal de Confirmación para Eliminar -->
      <p-dialog 
        [(visible)]="showConfirmDeleteMenu" 
        header="Confirmar Eliminación"
        [modal]="true" 
        [style]="{width: '400px', minHeight: '200px'}"
        [draggable]="false" 
        [resizable]="false"
        [closable]="true"
        [maximizable]="false"
      >
        <div class="flex items-center gap-4 mb-4">
          <span class="text-8xl animate-bounce">⚠️</span>
          <div>
            <h4 class="font-semibold text-xl mb-1">¿Eliminar Menú?</h4>
            <p class="text-gray-700 text-lg">
              ¿Estás seguro de que deseas eliminar el menú
              <strong>"{{menuToDelete?.label}}"</strong>?
            </p>
            <p class="text-sm text-red-600 mt-2 font-medium">
              ⚠️ Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        
        <!-- Botones -->
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
          <button 
            pButton 
            type="button" 
            (click)="cancelDeleteMenu()" 
            label="Cancelar" 
            class="p-button-text"
          ></button>
          <button 
            pButton 
            type="button" 
            (click)="confirmDeleteMenu()" 
            label="Eliminar" 
            class="p-button-danger"
            [loading]="deletingMenu"
          ></button>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
    .inline-edit-container { display: flex; align-items: center; gap: .25rem; }
    .inline-action-btn { padding: .25rem; min-width: 2rem; }
    .editable-cell { display: block; min-height: 1.5rem; }
    .p-datatable .p-datatable-tbody > tr > td { padding: .5rem; vertical-align: middle; }
    .p-datatable .p-datatable-tbody > tr:hover { background-color: #f8fafc; }
    .p-button.p-button-text.p-button-sm { width: 2rem !important; height: 2rem !important; min-width: 2rem !important; padding: 0 !important; border-radius: .25rem !important; }
    .p-button.p-button-text.p-button-sm .p-button-icon { font-size: .875rem !important; }
    .bg-blue-50 { background-color: #eff6ff !important; }
  `]
})
export class AmenuComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  
  private fb = inject(FormBuilder);
  private menuService = inject(MenuService);
  private menuLoaderService = inject(MenuLoaderService);
  private routeService = inject(RouteService);
  private messageService = inject(MessageService);

  // Datos
  items: MenuCrudItem[] = [];
  selectedItem: MenuCrudItem | null = null;
  
  // Opciones para filtros booleanos
  booleanFilterOptions = [
    { label: 'Sí', value: true },
    { label: 'No', value: false }
  ];

  // Estado de filtros contextuales
  showColumnFilter = false;
  activeColumn = '';
  activeFilterValue: any = '';

  // Estados de carga
  loading = false;
  saving = false;
  deletingMenu = false;
  reloadingMenu = false;

  // Estados de modales
  showForm = false;
  showConfirmDeleteMenu = false;
  showConfirmDialog = false;

  // Formularios
  form!: FormGroup;
  isEditing = false;

  // Edición inline
  editingCell: string | null = null;
  originalValue: any = null;

  // Confirmaciones
  menuToDelete: MenuCrudItem | null = null;
  confirmMessage = '';
  confirmHeader = '';
  accionConfirmada: (() => void) | null = null;

  // Form específico
  iconModel: string | null = null;
  showIconSelector = false;
  toggleModel: { swItenms: boolean; visible: boolean; disable: boolean; separator: boolean } = {
    swItenms: false,
    visible: true,
    disable: false,
    separator: false
  };

  // Options
  routeOptions: { label: string; value: string }[] = [];
  parentOptions: { label: string; value: number | null }[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadRoutesOptions();
    this.loadItems();
  }

  private initForm(): void {
    this.form = this.fb.group({
      id_menu: [null],
      id_padre: [null],
      orden: [0, [Validators.required]],
      nivel: [null],
      label: ['', [Validators.required]],
      icon: [null],
      swItenms: [false],
      routerLink: [null],
      visible: [true],
      disable: [false],
      tooltip: [null],
      separator: [false]
    });
  }

  private loadRoutesOptions(): void {
    this.routeService.refresh();
    this.routeService.getProyRoutes$().subscribe({
      next: routes => {
        this.routeOptions = routes.map(r => ({
          label: r.data?.breadcrumb ? `${r.fullPath} · ${r.data.breadcrumb}` : r.fullPath,
          value: '/' + r.fullPath.replace(/^\//, '')
        }));
      },
      error: () => {}
    });
  }

  private loadItems(): void {
    this.loading = true;
    this.menuService.getMenuItems().subscribe({
      next: res => {
        this.items = res.data || [];
        this.parentOptions = [
          { label: 'Sin padre', value: null },
          ...this.items
            .filter(i => !i.routerLink || i.routerLink.trim() === '')
            .map(i => ({ label: `${i.label} (#${i.id_menu})`, value: i.id_menu }))
        ];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los menús' });
      }
    });
  }

  refresh(): void {
    this.loadItems();
  }

  async reloadDynamicMenu(): Promise<void> {
    this.reloadingMenu = true;

    try {
      await this.menuLoaderService.reloadMenu();
      this.messageService.add({
        severity: 'success',
        summary: 'Menú actualizado',
        detail: 'El menú dinámico ha sido recargado exitosamente'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error al recargar menú',
        detail: 'No se pudo recargar el menú dinámico. Intente nuevamente.',
        life: 5000
      });
    } finally {
      this.reloadingMenu = false;
    }
  }

  onGlobalFilter(table: any, event: any): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // ========== FILTROS CONTEXTUALES ==========

  /**
   * Muestra el filtro contextual para una columna específica
   */
  openColumnFilter(event: MouseEvent, column: string): void {
    event.preventDefault(); // Prevenir menú contextual del browser
    
    this.activeColumn = column;
    this.activeFilterValue = this.getCurrentFilterValue(column);
    this.showColumnFilter = true;
    
    console.log('🔍 Abriendo filtro contextual para:', column);
  }

  /**
   * Aplica el filtro a la columna activa
   */
  applyColumnFilter(): void {
    if (!this.activeColumn || !this.dt) return;

    const filterMode = this.getFilterType(this.activeColumn) === 'boolean' ? 'equals' : 'contains';
    
    // Para filtros booleanos, si el valor es string vacío, limpiar el filtro
    const filterValue = (this.getFilterType(this.activeColumn) === 'boolean' && this.activeFilterValue === '') 
      ? null 
      : this.activeFilterValue;
    
    if (filterValue === null) {
      this.dt.filter('', this.activeColumn, 'contains'); // Limpiar filtro
      console.log('🧹 Filtro limpiado para columna:', this.activeColumn);
    } else {
      this.dt.filter(filterValue, this.activeColumn, filterMode);
      console.log('🔍 Filtro aplicado con ViewChild:', {
        columna: this.activeColumn,
        valorOriginal: this.activeFilterValue,
        valorFiltro: filterValue,
        tipoValor: typeof filterValue,
        modo: filterMode,
        esBoleano: this.getFilterType(this.activeColumn) === 'boolean',
        tablaDisponible: !!this.dt
      });
      
      // Debug adicional para filtros booleanos
      if (this.getFilterType(this.activeColumn) === 'boolean') {
        console.log('🔍 Debug filtro booleano:', {
          datosTabla: this.items.map(item => ({ 
            id: item.id_menu, 
            valor: (item as any)[this.activeColumn],
            tipo: typeof (item as any)[this.activeColumn]
          })).slice(0, 3), // Solo primeros 3 para no saturar consola
          valorBuscado: filterValue,
          tipoBuscado: typeof filterValue
        });
      }
    }
  }

  /**
   * Limpia el filtro de la columna activa
   */
  clearColumnFilter(): void {
    if (!this.activeColumn || !this.dt) return;

    this.dt.filter('', this.activeColumn, 'contains');
    this.activeFilterValue = '';
    
    console.log('🧹 Filtro limpiado para columna con ViewChild:', this.activeColumn);
    
    // Cerrar dialog
    this.showColumnFilter = false;
    
    this.messageService.add({
      severity: 'info',
      summary: 'Filtro Eliminado',
      detail: `Filtro de ${this.getColumnDisplayName(this.activeColumn)} eliminado`,
      life: 2000
    });
  }

  /**
   * Obtiene el tipo de filtro según la columna
   */
  getFilterType(column: string): 'text' | 'boolean' | 'number' {
    const booleanColumns = ['visible', 'swItenms'];  // ✅ Corregido: swItenms (como está en el modelo)
    const numberColumns = ['id_menu', 'orden', 'id_padre'];
    
    if (booleanColumns.includes(column)) return 'boolean';
    if (numberColumns.includes(column)) return 'number';
    return 'text';
  }

  /**
   * Obtiene el nombre amigable de la columna
   */
  getColumnDisplayName(column: string): string {
    const displayNames: { [key: string]: string } = {
      'id_menu': 'ID',
      'id_padre': 'ID Padre',
      'orden': 'Orden',
      'label': 'Label',
      'routerLink': 'RouterLink',
      'swItenms': 'swItems',  // ✅ Corregido: clave swItenms, valor display swItems
      'visible': 'Visible'
    };
    
    return displayNames[column] || column;
  }

  /**
   * Obtiene el valor actual del filtro para una columna
   */
  getCurrentFilterValue(column: string): any {
    if (!this.dt) return this.getFilterType(column) === 'boolean' ? '' : '';
    
    const filters = (this.dt as any).filters;
    if (filters && filters[column]) {
      const filter = filters[column];
      const value = Array.isArray(filter) ? filter[0]?.value : filter.value;
      
      // Para filtros booleanos, manejar valores null/undefined como string vacío
      if (this.getFilterType(column) === 'boolean') {
        return value === null || value === undefined ? '' : value;
      }
      
      return value || '';
    }
    
    // Valor por defecto según el tipo
    return this.getFilterType(column) === 'boolean' ? '' : '';
  }

  /**
   * Establece un filtro booleano usando p-tags
   */
  setBooleanFilter(value: boolean | string): void {
    this.activeFilterValue = value;
    this.applyColumnFilter();
    
    console.log('🔘 Filtro booleano establecido:', {
      columna: this.activeColumn,
      valor: value,
      tipo: typeof value
    });
  }

  /**
   * Cierra el dialog de filtro contextual
   */
  closeColumnFilter(): void {
    this.showColumnFilter = false;
    console.log('🔍 Dialog de filtro cerrado');
  }

  // Inline Edit
  startEdit(row: MenuCrudItem, field: keyof MenuCrudItem): void {
    this.editingCell = row.id_menu + '_' + String(field);
    this.originalValue = (row as any)[field];
    console.log('✏️ Editando inline:', field, 'Valor:', this.originalValue);
  }

  cancelEdit(): void {
    this.editingCell = null;
    this.originalValue = null;
  }

  saveInline(row: MenuCrudItem, field: keyof MenuCrudItem): void {
    console.log('💾 Guardando inline:', field, 'Nuevo valor:', (row as any)[field]);
    
    const newValue = (row as any)[field];
    if (newValue === this.originalValue) {
      console.log('ℹ️ Valor no cambió, cancelando');
      this.cancelEdit();
      return;
    }

    // Formateo automático para label
    if (field === 'label' && newValue && typeof newValue === 'string') {
      const formattedLabel = this.formatLabel(newValue);
      (row as any)[field] = formattedLabel;
      console.log('✨ Label formateado:', { original: newValue, formateado: formattedLabel });
    }

    // Validación especial para routerLink
    if (field === 'routerLink' && newValue && newValue.trim() !== '') {
      const routeExists = this.routeService.routeExists(newValue.trim());
      if (!routeExists) {
        console.log('❌ Ruta no válida en edición inline:', newValue);
        (row as any)[field] = this.originalValue;
        this.cancelEdit();
        
        this.messageService.add({
          severity: 'warn',
          summary: 'Ruta No Válida',
          detail: `La ruta "${newValue}" no existe en el sistema. Usa el selector para elegir una ruta válida.`,
          life: 6000
        });
        return;
      } else {
        console.log('✅ Ruta válida en edición inline:', newValue);
      }
    }

    this.menuService.patchItem(row.id_menu, { [field]: newValue } as any).subscribe({
      next: (response) => {
        console.log('✅ Campo actualizado:', response);
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Campo Actualizado', 
          detail: `${this.getFieldLabel(String(field))} actualizado correctamente` 
        });
        this.cancelEdit();
      },
      error: (error) => {
        console.error('❌ Error al actualizar campo:', error);
        (row as any)[field] = this.originalValue;
        this.cancelEdit();
        
        // Extraer mensaje específico del backend
        const errorMessage = error?.message || error?.error?.mensaje || error?.error?.message || `Error al actualizar ${this.getFieldLabel(String(field))}`;
        
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error de Actualización', 
          detail: errorMessage,
          life: 5000 
        });
      }
    });
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      id_padre: 'ID Padre',
      orden: 'Orden',
      label: 'Etiqueta',
      routerLink: 'Ruta del Router'
    };
    return labels[field] || field;
  }

  // ========== TOGGLE SWITEMS CON CONFIRMACIÓN ==========

  toggleSwItems(item: MenuCrudItem): void {
    const nuevoSwItems = !item.swItenms;
    
    if (!nuevoSwItems) {
      // Confirmar desactivación
      this.confirmMessage = `¿Está seguro de que desea desactivar los sub-items del menú "${item.label}"?`;
      this.confirmHeader = 'Confirmar Desactivación de Sub-Items';
      this.accionConfirmada = () => this.procesarCambioSwItems(item, nuevoSwItems);
      this.showConfirmDialog = true;
    } else {
      // Activar directamente
      this.procesarCambioSwItems(item, nuevoSwItems);
    }
  }

  private procesarCambioSwItems(item: MenuCrudItem, nuevoSwItems: boolean): void {
    const swItemsAnterior = item.swItenms;
    item.swItenms = nuevoSwItems;
    
    this.menuService.patchItem(item.id_menu, { swItenms: nuevoSwItems } as any).subscribe({
      next: (response) => {
        console.log('✅ SwItems actualizado:', response);

        this.messageService.add({
          severity: 'success',
          summary: 'Sub-Items Actualizado',
          detail: `Sub-items ${nuevoSwItems ? 'activados' : 'desactivados'} correctamente`
        });
      },
      error: (error) => {
        console.error('❌ Error al cambiar swItems:', error);
        
        // Revertir cambio local
        item.swItenms = swItemsAnterior;

        // Extraer mensaje específico del backend
        const errorMessage = error?.message || error?.error?.mensaje || error?.error?.message || 'Error al cambiar los sub-items del menú';

        this.messageService.add({
          severity: 'error',
          summary: 'Error Sub-Items',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  getSwItemsLabel(swItems: boolean): string {
    return swItems ? 'Si' : 'No';
  }

  getSwItemsSeverity(swItems: boolean): 'success' | 'danger' {
    return swItems ? 'success' : 'danger';
  }

  // ========== TOGGLE VISIBLE CON CONFIRMACIÓN ==========

  toggleVisible(item: MenuCrudItem): void {
    const nuevoVisible = !item.visible;
    
    if (!nuevoVisible) {
      // Confirmar desactivación
      this.confirmMessage = `¿Está seguro de que desea ocultar el menú "${item.label}"?`;
      this.confirmHeader = 'Confirmar Ocultación';
      this.accionConfirmada = () => this.procesarCambioVisible(item, nuevoVisible);
      this.showConfirmDialog = true;
    } else {
      // Activar directamente
      this.procesarCambioVisible(item, nuevoVisible);
    }
  }

  private procesarCambioVisible(item: MenuCrudItem, nuevoVisible: boolean): void {
    const visibleAnterior = item.visible;
    item.visible = nuevoVisible;
    
    this.menuService.patchItem(item.id_menu, { visible: nuevoVisible } as any).subscribe({
      next: (response) => {
        console.log('✅ Visibilidad actualizada:', response);

        this.messageService.add({
          severity: 'success',
          summary: 'Visibilidad Actualizada',
          detail: `Menú ${nuevoVisible ? 'mostrado' : 'ocultado'} correctamente`
        });
      },
      error: (error) => {
        console.error('❌ Error al cambiar visibilidad:', error);
        
        // Revertir cambio local
        item.visible = visibleAnterior;

        // Extraer mensaje específico del backend
        const errorMessage = error?.message || error?.error?.mensaje || error?.error?.message || 'Error al cambiar la visibilidad del menú';

        this.messageService.add({
          severity: 'error',
          summary: 'Error Visibilidad',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  getVisibleLabel(visible: boolean): string {
    return visible ? 'Si' : 'No';
  }

  getVisibleSeverity(visible: boolean): 'success' | 'danger' {
    return visible ? 'success' : 'danger';
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

  // Form
  openForm(row?: MenuCrudItem): void {
    this.isEditing = !!row;
    if (row) {
      this.form.patchValue({
        id_menu: row.id_menu,
        id_padre: row.id_padre ?? null,
        orden: row.orden ?? 0,
        nivel: row.nivel ?? null,
        label: row.label ?? '',
        icon: row.icon ?? null,
        swItenms: !!row.swItenms,
        routerLink: row.routerLink ?? null,
        visible: !!row.visible,
        disable: !!row.disable,
        tooltip: row.tooltip ?? null,
        separator: !!row.separator
      });
      this.iconModel = row.icon ?? null;
      this.toggleModel = {
        swItenms: !!row.swItenms,
        visible: !!row.visible,
        disable: !!row.disable,
        separator: !!row.separator
      };
    } else {
      this.form.reset({
        id_menu: null,
        id_padre: null,
        orden: 0,
        nivel: null,
        label: '',
        icon: null,
        swItenms: false,
        routerLink: null,
        visible: true,
        disable: false,
        tooltip: null,
        separator: false
      });
      this.iconModel = null;
      this.toggleModel = { swItenms: false, visible: true, disable: false, separator: false };
    }
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  submitForm(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const formValue = this.form.value as MenuFormItem;
    const payload: MenuFormItem = {
      ...(this.isEditing ? formValue : { ...formValue, id_menu: undefined }), // No incluir id_menu al crear
      label: this.formatLabel(formValue.label), // ✨ Formatear label automáticamente
      icon: this.iconModel ?? this.form.value.icon,
      swItenms: this.toggleModel.swItenms,
      visible: this.toggleModel.visible,
      disable: this.toggleModel.disable,
      separator: this.toggleModel.separator
    };

    console.log('📝 Payload para enviar:', { isEditing: this.isEditing, payload, labelOriginal: formValue.label, labelFormateado: payload.label });

    const obs = this.isEditing && payload.id_menu
      ? this.menuService.updateItem(payload.id_menu, payload)
      : this.menuService.saveItem(payload);

    obs.subscribe({
      next: (response) => {
        console.log('✅ Respuesta recibida en componente:', response);
        console.log('📊 Detalles de respuesta:', {
          statuscode: response?.statuscode,
          mensaje: response?.mensaje,
          data: response?.data,
          isEditing: this.isEditing
        });
        
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Éxito', 
          detail: response?.mensaje || (this.isEditing ? 'Menú actualizado correctamente' : 'Menú creado correctamente')
        });
        
        this.saving = false;
        this.showForm = false;
        this.loadItems();
      },
      error: (error) => {
        console.error('❌ Error completo recibido en componente:', error);
        console.log('🔍 Analizando estructura del error:', {
          message: error?.message,
          errorMessage: error?.error?.mensaje,
          errorMessage2: error?.error?.message,
          originalError: error?.originalError,
          fullError: error
        });
        
        this.saving = false;
        
        // Extraer mensaje específico del backend
        const errorMessage = error?.message || error?.error?.mensaje || error?.error?.message || 'No se pudo guardar el menú';
        console.log('📤 Mensaje final mostrado al usuario:', errorMessage);
        
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error al Guardar', 
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  onIconSelected(icon: string): void {
    this.iconModel = icon;
    this.showIconSelector = false; // Cerrar automáticamente al seleccionar
  }

  toggleFormField(field: 'swItenms' | 'visible' | 'disable' | 'separator'): void {
    this.toggleModel[field] = !this.toggleModel[field];
  }

  toggleIconSelector(): void {
    this.showIconSelector = !this.showIconSelector;
  }

  // ========== ELIMINACIÓN ==========

  eliminarMenu(item: MenuCrudItem): void {
    this.menuToDelete = item;
    this.showConfirmDeleteMenu = true;
  }

  confirmDeleteMenu(): void {
    if (this.menuToDelete) {
      this.deletingMenu = true;
      
      console.log('🗑️ Eliminando menú:', this.menuToDelete);
      
      this.menuService.deleteItem(this.menuToDelete.id_menu).subscribe({
        next: (response) => {
          console.log('✅ Menú eliminado:', response);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Eliminado',
            detail: 'Menú eliminado correctamente'
          });
          
          // Si el menú eliminado estaba seleccionado, deseleccionar
          if (this.selectedItem?.id_menu === this.menuToDelete?.id_menu) {
            this.selectedItem = null;
          }
          
          this.cancelDeleteMenu();
          this.loadItems();
        },
        error: (error) => {
          console.error('❌ Error al eliminar menú:', error);
          
          // Extraer mensaje específico del backend
          const errorMessage = error?.message || error?.error?.mensaje || error?.error?.message || 'Error al eliminar el menú';
          
          this.messageService.add({
            severity: 'error',
            summary: 'Error al Eliminar',
            detail: errorMessage,
            life: 5000
          });
          
          this.deletingMenu = false;
        }
      });
    }
  }

  cancelDeleteMenu(): void {
    this.showConfirmDeleteMenu = false;
    this.menuToDelete = null;
    this.deletingMenu = false;
  }

  // ========== VALIDACIÓN DE RUTAS ==========
  // (Las validaciones de ruta fueron removidas ya que solo se permite selección desde dropdown, no escritura manual)


  // ========== FORMATEO DE TEXTO ==========

  /**
   * Formatea el label: Primera letra mayúscula, resto minúsculas
   * @param label - Texto a formatear
   * @returns Texto formateado
   */
  private formatLabel(label: string | null | undefined): string {
    if (!label || typeof label !== 'string') {
      return '';
    }

    const trimmed = label.trim();
    if (trimmed.length === 0) {
      return '';
    }

    // Primera letra mayúscula, resto minúsculas
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    
    console.log('🔤 Formateando label:', { original: label, resultado: formatted });
    
    return formatted;
  }

  /**
   * Formatea el label en tiempo real cuando el usuario sale del campo
   */
  formatLabelOnBlur(): void {
    const labelControl = this.form.get('label');
    if (labelControl && labelControl.value) {
      const formatted = this.formatLabel(labelControl.value);
      if (formatted !== labelControl.value) {
        labelControl.setValue(formatted);
        console.log('🔤 Label formateado en tiempo real:', { original: labelControl.value, formateado: formatted });
      }
    }
  }

  // ========== SUGERENCIAS AUTOMÁTICAS ==========

  /**
   * Se ejecuta cuando el usuario selecciona una ruta
   * Sugiere automáticamente label e icono basado en la ruta
   */
  onRouteChange(event: any): void {
    const selectedRoute = event.value;
    if (!selectedRoute) return;

    console.log('🛤️ Ruta seleccionada:', selectedRoute);

    // Solo sugerir si el label está vacío o es el mismo que la sugerencia anterior
    const currentLabel = this.form.get('label')?.value;
    const currentTooltip = this.form.get('tooltip')?.value;
    const shouldSuggestLabel = !currentLabel || this.isGeneratedLabel(currentLabel);
    const shouldSuggestTooltip = !currentTooltip || this.isGeneratedLabel(currentTooltip);

    if (shouldSuggestLabel || shouldSuggestTooltip) {
      const suggestions = this.generateSuggestionsFromRoute(selectedRoute);
      
      if (shouldSuggestLabel && suggestions.label) {
        this.form.get('label')?.setValue(suggestions.label);
        console.log('💡 Label sugerido:', { ruta: selectedRoute, label: suggestions.label });
      }
      
      if (shouldSuggestTooltip && suggestions.tooltip) {
        this.form.get('tooltip')?.setValue(suggestions.tooltip);
        console.log('💬 Tooltip sugerido:', { ruta: selectedRoute, tooltip: suggestions.tooltip });
      }
    }

    // Sugerir icono solo si no hay uno seleccionado
    const currentIcon = this.iconModel;
    if (!currentIcon || currentIcon === 'pi pi-question-circle') {
      const suggestedIcon = this.generateIconFromRoute(selectedRoute);
      if (suggestedIcon) {
        this.iconModel = suggestedIcon;
        console.log('🎯 Icono sugerido:', { ruta: selectedRoute, icono: suggestedIcon });
      }
    }
  }

  /**
   * Genera sugerencias de label y tooltip basado en la ruta seleccionada
   */
  private generateSuggestionsFromRoute(route: string): { label: string; tooltip: string } {
    if (!route) return { label: '', tooltip: '' };

    // Obtener la última parte de la ruta
    const segments = route.split('/').filter(segment => segment.length > 0);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment) return { label: '', tooltip: '' };

    // Mapeo de rutas conocidas a labels cortos y tooltips largos
    const routeToSuggestionsMap: { [key: string]: { label: string; tooltip: string } } = {
      // Administración
      'amenu': { label: 'Menú', tooltip: 'Administración de menú del sistema' },
      'tabadm': { label: 'Tabloides', tooltip: 'Administración de tabloides publicitarios' },
      'usuarios': { label: 'Usuarios', tooltip: 'Gestión de usuarios del sistema' },
      'spconfig': { label: 'Configuración', tooltip: 'Configuración general del sistema' },
      'menu': { label: 'Menú', tooltip: 'Administración del menú de navegación' },
      
      // Comercio
      'collections': { label: 'Colecciones', tooltip: 'Administración de colecciones de productos' },
      'productos': { label: 'Productos', tooltip: 'Gestión del catálogo de productos' },
      'ventas': { label: 'Ventas', tooltip: 'Gestión de ventas y transacciones' },
      'clientes': { label: 'Clientes', tooltip: 'Gestión de clientes y contactos' },
      'orders': { label: 'Pedidos', tooltip: 'Gestión de pedidos y órdenes' },
      
      // Sistema
      'dashboard': { label: 'Dashboard', tooltip: 'Panel principal de control' },
      'home': { label: 'Inicio', tooltip: 'Página principal del sistema' },
      'profile': { label: 'Perfil', tooltip: 'Gestión del perfil de usuario' },
      'settings': { label: 'Ajustes', tooltip: 'Configuración y preferencias' },
      'reports': { label: 'Reportes', tooltip: 'Generación y visualización de reportes' },
      'analytics': { label: 'Análisis', tooltip: 'Análisis y métricas del sistema' },
      'config': { label: 'Configuración', tooltip: 'Configuración avanzada del sistema' },
      
      // Contenido
      'files': { label: 'Archivos', tooltip: 'Gestión de archivos y documentos' },
      'images': { label: 'Imágenes', tooltip: 'Gestión de imágenes y multimedia' },
      'videos': { label: 'Videos', tooltip: 'Gestión de contenido audiovisual' },
      'documents': { label: 'Documentos', tooltip: 'Gestión de documentos y archivos PDF' },
      
      // Comunicación
      'messages': { label: 'Mensajes', tooltip: 'Sistema de mensajería interna' },
      'chat': { label: 'Chat', tooltip: 'Chat en tiempo real' },
      'notifications': { label: 'Notificaciones', tooltip: 'Centro de notificaciones del sistema' },
      
      // Test
      'test': { label: 'Pruebas', tooltip: 'Página de pruebas y desarrollo' },
      'route-service': { label: 'Rutas', tooltip: 'Prueba del servicio de rutas' }
    };

    // Buscar mapeo exacto
    if (routeToSuggestionsMap[lastSegment]) {
      const suggestions = routeToSuggestionsMap[lastSegment];
      return {
        label: this.formatLabel(suggestions.label),
        tooltip: suggestions.tooltip
      };
    }

    // Si no hay mapeo, convertir el segmento a formato amigable
    const friendlyLabel = this.convertSegmentToLabel(lastSegment);
    return {
      label: this.formatLabel(friendlyLabel),
      tooltip: `Gestión de ${friendlyLabel.toLowerCase()}`
    };
  }

  /**
   * Convierte un segmento de ruta a un label amigable
   */
  private convertSegmentToLabel(segment: string): string {
    // Reemplazar guiones y underscores con espacios
    let label = segment.replace(/[-_]/g, ' ');
    
    // Separar palabras en camelCase
    label = label.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Limpiar y formatear
    return label.trim();
  }

  /**
   * Genera un icono sugerido basado en la ruta seleccionada
   */
  private generateIconFromRoute(route: string): string | null {
    if (!route) return null;

    // Obtener la última parte de la ruta
    const segments = route.split('/').filter(segment => segment.length > 0);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment) return null;

    // Mapeo de rutas conocidas a iconos
    const routeToIconMap: { [key: string]: string } = {
      // Administración
      'amenu': 'pi pi-bars',
      'tabadm': 'pi pi-file',
      'usuarios': 'pi pi-users',
      'spconfig': 'pi pi-cog',
      'menu': 'pi pi-bars',
      
      // Comercio
      'collections': 'pi pi-folder',
      'productos': 'pi pi-shopping-cart',
      'ventas': 'pi pi-dollar',
      'clientes': 'pi pi-user',
      'orders': 'pi pi-shopping-bag',
      
      // Sistema
      'dashboard': 'pi pi-th-large',
      'home': 'pi pi-home',
      'profile': 'pi pi-user',
      'settings': 'pi pi-cog',
      'reports': 'pi pi-file-pdf',
      'analytics': 'pi pi-chart-bar',
      'config': 'pi pi-wrench',
      
      // Contenido
      'files': 'pi pi-file',
      'images': 'pi pi-image',
      'videos': 'pi pi-video',
      'documents': 'pi pi-file-pdf',
      
      // Comunicación
      'messages': 'pi pi-envelope',
      'chat': 'pi pi-comment',
      'notifications': 'pi pi-bell',
      
      // Test
      'test': 'pi pi-wrench',
      'route-service': 'pi pi-compass'
    };

    // Buscar mapeo exacto
    if (routeToIconMap[lastSegment]) {
      return routeToIconMap[lastSegment];
    }

    // Buscar por palabras clave en el segmento
    const segment = lastSegment.toLowerCase();
    
    if (segment.includes('user') || segment.includes('usuario')) return 'pi pi-user';
    if (segment.includes('admin') || segment.includes('config')) return 'pi pi-cog';
    if (segment.includes('product') || segment.includes('producto')) return 'pi pi-shopping-cart';
    if (segment.includes('file') || segment.includes('archivo')) return 'pi pi-file';
    if (segment.includes('report') || segment.includes('reporte')) return 'pi pi-file-pdf';
    if (segment.includes('message') || segment.includes('mensaje')) return 'pi pi-envelope';
    if (segment.includes('chart') || segment.includes('grafico')) return 'pi pi-chart-bar';
    if (segment.includes('calendar') || segment.includes('fecha')) return 'pi pi-calendar';
    if (segment.includes('search') || segment.includes('buscar')) return 'pi pi-search';
    if (segment.includes('help') || segment.includes('ayuda')) return 'pi pi-question-circle';

    // Icono por defecto para rutas no reconocidas
    return 'pi pi-circle';
  }

  /**
   * Verifica si un label parece haber sido generado automáticamente
   */
  private isGeneratedLabel(label: string): boolean {
    if (!label) return true;
    
    // Lista de labels que probablemente fueron generados
    const generatedPatterns = [
      /^[A-Z][a-z\s]+$/,  // Formato capitalizado típico
      /administración/i,
      /gestión/i,
      /configuración/i,
      /página de/i
    ];

    return generatedPatterns.some(pattern => pattern.test(label));
  }
}


