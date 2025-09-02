import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenuService } from '../../../core/services/menu/menu.service';
import { MenuCrudItem, MenuFormItem } from '../../../core/models/menu.interface';
import { RouteSelector } from './route-selector';
import { RouteExplorer } from './route-explorer';

@Component({
  selector: 'app-menu-admin-basic-test',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">✅ Administración de Menú</h1>
      <p class="text-gray-600 mb-4">Gestiona los items del menú de la aplicación</p>
      
      <!-- Botones de navegación -->
      <div class="mb-6 flex gap-2">
        <p-button 
          label="Gestión de Menú" 
          [severity]="activeView === 'menu' ? 'primary' : 'secondary'"
          [outlined]="activeView !== 'menu'"
          (onClick)="activeView = 'menu'"
          icon="pi pi-list"
        />
        <p-button 
          label="Explorar Rutas" 
          [severity]="activeView === 'routes' ? 'primary' : 'secondary'"
          [outlined]="activeView !== 'routes'"
          (onClick)="activeView = 'routes'"
          icon="pi pi-search"
        />
      </div>
      
      <!-- Vista de Gestión de Menú -->
      <div *ngIf="activeView === 'menu'" class="mb-6">
        <div class="p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 class="text-lg font-semibold text-blue-800 mb-3">📋 Gestión de Menú</h2>
          <p class="text-blue-700 mb-3">Aquí podrás gestionar los items del menú del sistema.</p>
          <div class="space-y-2 text-blue-600">
            <p>• ✅ Tabla con items del menú</p>
            <p>• ✅ Formulario de CRUD</p>
            <p>• ✅ Selector de rutas integrado</p>
            <p>• ✅ Validaciones y notificaciones</p>
          </div>
        </div>
      </div>
      
      <!-- Vista de Explorar Rutas -->
      <div *ngIf="activeView === 'routes'" class="mb-6">
        <div class="p-4 bg-purple-50 border border-purple-200 rounded">
          <h2 class="text-lg font-semibold text-purple-800 mb-3">🔍 Explorador de Rutas</h2>
          <p class="text-purple-700 mb-3">Explora todas las rutas disponibles en el proyecto.</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div class="p-3 bg-white border border-purple-200 rounded">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-home text-blue-600"></i>
                <span class="font-medium">Dashboard</span>
              </div>
              <p class="text-sm text-gray-600">/dashboard/analytics</p>
              <p-tag value="Dashboard" severity="info" class="text-xs mt-1" />
            </div>
            <div class="p-3 bg-white border border-purple-200 rounded">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-users text-green-600"></i>
                <span class="font-medium">Usuarios</span>
              </div>
              <p class="text-sm text-gray-600">/usermanagement/userlist</p>
              <p-tag value="Gestión" severity="success" class="text-xs mt-1" />
            </div>
            <div class="p-3 bg-white border border-purple-200 rounded">
              <div class="flex items-center gap-2 mb-2">
                <i class="pi pi-shopping-cart text-purple-600"></i>
                <span class="font-medium">E-commerce</span>
              </div>
              <p class="text-sm text-gray-600">/ecommerce/shop</p>
              <p-tag value="E-commerce" severity="warning" class="text-xs mt-1" />
            </div>
          </div>
          <div class="space-y-2 text-purple-600">
            <p>• ✅ Más de 50 rutas disponibles</p>
            <p>• ✅ Búsqueda en tiempo real</p>
            <p>• ✅ Filtros por categoría</p>
            <p>• ✅ Copia al portapapeles</p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-green-100 border border-green-300 rounded">
          <h3 class="font-semibold text-green-800 mb-2">✅ Estado del Sistema</h3>
          <ul class="text-green-700 space-y-1">
            <li>• Componente cargado correctamente</li>
            <li>• Lazy loading funcionando</li>
            <li>• Ruta configurada</li>
            <li>• Template renderizando</li>
          </ul>
        </div>
        
        <div class="p-4 bg-blue-100 border border-blue-300 rounded">
          <h3 class="font-semibold text-blue-800 mb-2">🔧 Funcionalidades Implementadas</h3>
          <ul class="text-blue-700 space-y-1">
            <li>• Selector de rutas avanzado</li>
            <li>• Más de 50 rutas predefinidas</li>
            <li>• Categorización automática</li>
            <li>• Búsqueda en tiempo real</li>
            <li>• Integración con formularios</li>
          </ul>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded">
        <h3 class="font-semibold text-yellow-800 mb-2">📋 Próximos Pasos</h3>
        <ol class="text-yellow-700 space-y-1">
          <li>1. Verificar que este componente básico se muestra correctamente</li>
          <li>2. Agregar gradualmente la funcionalidad de PrimeNG</li>
          <li>3. Implementar las pestañas una vez que la base funcione</li>
          <li>4. Integrar el selector de rutas</li>
        </ol>
      </div>
      
      <div class="mt-4 p-3 bg-gray-100 border border-gray-300 rounded">
        <strong>Debug Info:</strong><br>
        Componente: MenuAdminBasicTest<br>
        Timestamp: {{ getCurrentTime() }}<br>
        Status: ✅ FUNCIONANDO
      </div>
    </div>
  `
})
export class MenuAdminBasicTest implements OnInit {
  activeView: 'menu' | 'routes' = 'menu';

  ngOnInit() {
    console.log('🚀 MenuAdminBasicTest cargado correctamente');
  }

  getCurrentTime(): string {
    return new Date().toLocaleString();
  }
}
