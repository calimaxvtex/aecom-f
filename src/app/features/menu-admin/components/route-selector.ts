import { Component, Input, Output, EventEmitter, OnInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { RouteDiscoveryService, RouteInfo } from '../../../core/services/route/route-discovery.service';

@Component({
  selector: 'app-route-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TabsModule,
    TooltipModule,
    TagModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RouteSelector),
      multi: true
    }
  ],
  template: `
    <div class="flex items-center gap-2">
      <i *ngIf="selectedRoute?.icon" [class]="selectedRoute?.icon" class="text-lg"></i>
      <input
        pInputText
        [value]="selectedRoute?.path || ''"
        (focus)="openDialog()"
        placeholder="Seleccionar ruta..."
        class="flex-1 cursor-pointer"
        readonly
      />
      <p-button
        icon="pi pi-search"
        (onClick)="openDialog()"
        [text]="true"
        size="small"
        pTooltip="Buscar ruta"
      />
    </div>

    <p-dialog
      header="Seleccionar Ruta"
      [(visible)]="showDialog"
      [modal]="true"
      [style]="{ width: '80vw', 'max-width': '1000px' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeDialog()"
      contentStyleClass="p-0"
    >
      <div class="flex flex-col h-full">
        <!-- Barra de búsqueda -->
        <div class="p-4 border-b">
          <input
            pInputText
            type="text"
            [(ngModel)]="searchText"
            placeholder="Buscar ruta por nombre, descripción o categoría..."
            class="w-full"
            (input)="filterRoutes()"
          />
        </div>

        <!-- Tabs de categorías -->
        <div class="flex-1 overflow-hidden">
          <p-tabs [value]="activeTabIndex" (onTabChange)="onTabChange($event)">
            <p-tablist>
              <p-tab *ngFor="let category of categories; let i = index" [value]="i.toString()">
                {{category}}
                <p-tag 
                  [value]="getRoutesByCategory(category).length.toString()" 
                  severity="secondary" 
                  class="ml-2"
                />
              </p-tab>
            </p-tablist>
            <p-tabpanels>
              <p-tabpanel *ngFor="let category of categories; let i = index" [value]="i.toString()">
                <div class="route-grid-container h-80 overflow-y-auto">
                  <div class="grid grid-cols-1 gap-2 p-4">
                    <div
                      *ngFor="let route of getFilteredRoutesByCategory(category)"
                      class="route-item flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      [class.selected]="selectedRoute?.path === route.path"
                      (click)="selectRoute(route)"
                    >
                      <div class="flex-shrink-0">
                        <i *ngIf="route.icon" [class]="route.icon" class="text-xl text-blue-600"></i>
                        <i *ngIf="!route.icon" class="pi pi-link text-xl text-gray-400"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-gray-900 truncate">{{route.label}}</div>
                        <div class="text-sm text-gray-600 truncate">{{route.path}}</div>
                        <div *ngIf="route.description" class="text-xs text-gray-500 truncate">
                          {{route.description}}
                        </div>
                      </div>
                      <div class="flex-shrink-0">
                        <p-tag 
                          [value]="route.category" 
                          severity="info" 
                          class="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div *ngIf="getFilteredRoutesByCategory(category).length === 0" class="text-center py-8 text-gray-500">
                    <i class="pi pi-info-circle text-2xl mb-2"></i>
                    <p>No se encontraron rutas en esta categoría</p>
                  </div>
                </div>
              </p-tabpanel>
            </p-tabpanels>
          </p-tabs>
        </div>

        <!-- Información de la ruta seleccionada -->
        <div *ngIf="selectedRoute" class="p-4 border-t bg-gray-50">
          <div class="flex items-center gap-3">
            <i *ngIf="selectedRoute.icon" [class]="selectedRoute.icon" class="text-lg text-blue-600"></i>
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{selectedRoute.label}}</div>
              <div class="text-sm text-gray-600">{{selectedRoute.path}}</div>
              <div *ngIf="selectedRoute.description" class="text-xs text-gray-500">
                {{selectedRoute.description}}
              </div>
            </div>
            <p-tag [value]="selectedRoute.category" severity="info" />
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t">
          <p-button
            label="Limpiar"
            icon="pi pi-times"
            (onClick)="clearSelection()"
            [text]="true"
            severity="secondary"
          />
          <p-button
            label="Cancelar"
            icon="pi pi-ban"
            (onClick)="closeDialog()"
            [text]="true"
            severity="danger"
          />
          <p-button
            label="Seleccionar"
            icon="pi pi-check"
            (onClick)="confirmSelection()"
            severity="success"
            [disabled]="!selectedRoute"
          />
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .route-grid-container {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .route-item.selected {
      background-color: var(--primary-color);
      color: var(--primary-color-text);
      border-color: var(--primary-color);
    }
    
    .route-item.selected .text-gray-900,
    .route-item.selected .text-gray-600,
    .route-item.selected .text-gray-500 {
      color: var(--primary-color-text) !important;
    }
    
    .p-dialog-content {
      padding: 0 !important;
    }
  `]
})
export class RouteSelector implements OnInit, ControlValueAccessor {
  selectedRoute: RouteInfo | null = null;
  showDialog = false;
  searchText = '';
  activeTabIndex = '0';
  categories: string[] = [];
  allRoutes: RouteInfo[] = [];

  // ControlValueAccessor implementation
  _value: string = '';
  private _onChange = (value: string) => {};
  private _onTouched = () => {};
  disabled = false;

  constructor(private routeDiscoveryService: RouteDiscoveryService) {}

  ngOnInit() {
    this.allRoutes = this.routeDiscoveryService.getAvailableRoutes();
    this.categories = this.routeDiscoveryService.getRouteCategories();
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this._value = value || '';
    this.selectedRoute = this.allRoutes.find(route => route.path === this._value) || null;
  }

  registerOnChange(fn: (value: string) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openDialog(): void {
    this.showDialog = true;
    this.searchText = '';
    this.activeTabIndex = '0';
  }

  closeDialog(): void {
    this.showDialog = false;
    this.searchText = '';
  }

  selectRoute(route: RouteInfo): void {
    this.selectedRoute = route;
  }

  clearSelection(): void {
    this.selectedRoute = null;
  }

  confirmSelection(): void {
    if (this.selectedRoute) {
      this._value = this.selectedRoute.path;
      this._onChange(this.selectedRoute.path);
      this._onTouched();
      this.closeDialog();
    }
  }

  filterRoutes(): void {
    // El filtrado se maneja en getFilteredRoutesByCategory
  }

  onTabChange(event: any): void {
    this.activeTabIndex = event.index.toString();
  }

  getRoutesByCategory(category: string): RouteInfo[] {
    return this.routeDiscoveryService.getRoutesByCategory(category);
  }

  getFilteredRoutesByCategory(category: string): RouteInfo[] {
    let routes = this.getRoutesByCategory(category);
    
    if (this.searchText.trim()) {
      const searchText = this.searchText.toLowerCase();
      routes = routes.filter(route => 
        route.path.toLowerCase().includes(searchText) ||
        route.label.toLowerCase().includes(searchText) ||
        route.description?.toLowerCase().includes(searchText)
      );
    }
    
    return routes;
  }
}
