import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RouteDiscoveryService, RouteInfo } from '../../../core/services/route/route-discovery.service';

@Component({
  selector: 'app-route-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    TooltipModule
  ],
  template: `
    <div class="p-4">
      <div class="mb-4">
        <h2 class="text-xl font-semibold mb-2">🔍 Explorador de Rutas</h2>
        <p class="text-gray-600">Explora todas las rutas disponibles en el proyecto</p>
      </div>

      <!-- Barra de búsqueda -->
      <div class="mb-4">
        <input
          pInputText
          type="text"
          [(ngModel)]="searchText"
          placeholder="Buscar rutas por nombre, descripción o categoría..."
          class="w-full"
          (input)="filterRoutes()"
        />
      </div>

      <!-- Filtros por categoría -->
      <div class="mb-4">
        <div class="flex flex-wrap gap-2">
          <p-button
            *ngFor="let category of categories"
            [label]="category"
            [severity]="selectedCategory === category ? 'primary' : 'secondary'"
            [outlined]="selectedCategory !== category"
            size="small"
            (onClick)="filterByCategory(category)"
          />
          <p-button
            label="Todas"
            severity="secondary"
            [outlined]="selectedCategory !== ''"
            size="small"
            (onClick)="filterByCategory('')"
          />
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div class="flex justify-between items-center text-sm">
          <span class="text-blue-700">
            <strong>{{filteredRoutes.length}}</strong> rutas encontradas
          </span>
          <span class="text-blue-600">
            Categoría: <strong>{{selectedCategory || 'Todas'}}</strong>
          </span>
        </div>
      </div>

      <!-- Lista de rutas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let route of filteredRoutes"
          class="route-card p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          (click)="selectRoute(route)"
          [class.selected]="selectedRoute?.path === route.path"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <i 
                *ngIf="route.icon" 
                [class]="route.icon" 
                class="text-2xl text-blue-600"
              ></i>
              <i 
                *ngIf="!route.icon" 
                class="pi pi-link text-2xl text-gray-400"
              ></i>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 truncate mb-1">
                {{route.label}}
              </h3>
              <p class="text-sm text-gray-600 font-mono mb-2 truncate">
                {{route.path}}
              </p>
              <p 
                *ngIf="route.description" 
                class="text-xs text-gray-500 mb-2 line-clamp-2"
              >
                {{route.description}}
              </p>
              <div class="flex items-center justify-between">
                <p-tag 
                  [value]="route.category" 
                  severity="info" 
                  class="text-xs"
                />
                <p-button
                  icon="pi pi-copy"
                  size="small"
                  [text]="true"
                  (onClick)="copyRoute(route.path, $event)"
                  pTooltip="Copiar ruta"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay resultados -->
      <div 
        *ngIf="filteredRoutes.length === 0" 
        class="text-center py-12"
      >
        <i class="pi pi-search text-4xl text-gray-300 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-500 mb-2">
          No se encontraron rutas
        </h3>
        <p class="text-gray-400">
          Intenta con otros términos de búsqueda o selecciona una categoría diferente
        </p>
      </div>

      <!-- Ruta seleccionada -->
      <div 
        *ngIf="selectedRoute" 
        class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
      >
        <h3 class="font-semibold text-green-800 mb-2">
          ✅ Ruta Seleccionada
        </h3>
        <div class="flex items-center gap-3">
          <i 
            *ngIf="selectedRoute.icon" 
            [class]="selectedRoute.icon" 
            class="text-xl text-green-600"
          ></i>
          <div class="flex-1">
            <p class="font-medium text-green-900">{{selectedRoute.label}}</p>
            <p class="text-sm text-green-700 font-mono">{{selectedRoute.path}}</p>
            <p 
              *ngIf="selectedRoute.description" 
              class="text-xs text-green-600 mt-1"
            >
              {{selectedRoute.description}}
            </p>
          </div>
          <p-tag [value]="selectedRoute.category" severity="success" />
        </div>
        <div class="mt-3 flex gap-2">
          <p-button
            label="Usar en Menú"
            icon="pi pi-plus"
            size="small"
            severity="success"
            (onClick)="useInMenu()"
          />
          <p-button
            label="Copiar Ruta"
            icon="pi pi-copy"
            size="small"
            [text]="true"
            (onClick)="copyRoute(selectedRoute.path)"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .route-card {
      transition: all 0.2s ease;
    }
    
    .route-card:hover {
      transform: translateY(-2px);
      border-color: #3b82f6;
    }
    
    .route-card.selected {
      background-color: #eff6ff;
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class RouteExplorer implements OnInit {
  allRoutes: RouteInfo[] = [];
  filteredRoutes: RouteInfo[] = [];
  categories: string[] = [];
  searchText = '';
  selectedCategory = '';
  selectedRoute: RouteInfo | null = null;

  constructor(private routeDiscoveryService: RouteDiscoveryService) {}

  ngOnInit() {
    this.allRoutes = this.routeDiscoveryService.getAvailableRoutes();
    this.categories = this.routeDiscoveryService.getRouteCategories();
    this.filteredRoutes = this.allRoutes;
  }

  filterRoutes(): void {
    this.applyFilters();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  private applyFilters(): void {
    let routes = this.allRoutes;

    // Filtrar por categoría
    if (this.selectedCategory) {
      routes = routes.filter(route => route.category === this.selectedCategory);
    }

    // Filtrar por texto de búsqueda
    if (this.searchText.trim()) {
      const searchText = this.searchText.toLowerCase();
      routes = routes.filter(route => 
        route.path.toLowerCase().includes(searchText) ||
        route.label.toLowerCase().includes(searchText) ||
        route.description?.toLowerCase().includes(searchText) ||
        route.category.toLowerCase().includes(searchText)
      );
    }

    this.filteredRoutes = routes;
  }

  selectRoute(route: RouteInfo): void {
    this.selectedRoute = route;
    console.log('Ruta seleccionada:', route);
  }

  copyRoute(path: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    navigator.clipboard.writeText(path).then(() => {
      console.log('Ruta copiada al portapapeles:', path);
      // Aquí podrías mostrar un toast de confirmación
    }).catch(err => {
      console.error('Error al copiar ruta:', err);
    });
  }

  useInMenu(): void {
    if (this.selectedRoute) {
      // Emitir evento o usar un servicio para comunicar con el componente padre
      console.log('Usar ruta en menú:', this.selectedRoute.path);
      // Aquí podrías implementar la lógica para abrir el formulario de menú
      // con la ruta pre-seleccionada
    }
  }
}
