import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '@/environments/environment';
import { SessionService } from '@/core/services/session.service';

/**
 * Componente de herramientas de desarrollo
 * Solo se muestra en modo desarrollo para facilitar testing
 */
@Component({
  selector: 'app-dev-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="!environment.production" 
         class="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 z-50 shadow-lg max-w-sm">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-bold text-yellow-800 text-sm">🛠️ Dev Tools</h4>
        <button (click)="toggleCollapsed()" 
                class="text-yellow-600 hover:text-yellow-800 text-xs">
          {{ collapsed ? '▼' : '▲' }}
        </button>
      </div>
      
      <!-- Contenido colapsable -->
      <div *ngIf="!collapsed" class="space-y-3">
        
        <!-- Bypass Auth -->
        <label class="flex items-center gap-2">
          <input type="checkbox" 
                 [checked]="isBypassEnabled"
                 (change)="toggleBypass($event)"
                 class="rounded">
          <span class="text-sm text-yellow-800">Bypass Auth</span>
        </label>
        
        <!-- Mock Session -->
        <button (click)="createMockSession()" 
                class="w-full px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors">
          👤 Crear Mock Session
        </button>
        
        <!-- Clear Session -->
        <button (click)="clearSession()" 
                class="w-full px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors">
          🗑️ Limpiar Sesión
        </button>
        
        <!-- Environment Info -->
        <div class="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
          <div><strong>Env:</strong> {{ environment.production ? 'PROD' : 'DEV' }}</div>
          <div><strong>API:</strong> {{ environment.apiUrl }}</div>
          <div><strong>Bypass:</strong> {{ environment.bypassAuth ? 'ON' : 'OFF' }}</div>
        </div>
        
        <!-- Session Status -->
        <div class="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
          <div><strong>Sesión:</strong> {{ sessionStatus }}</div>
          <div *ngIf="currentUser"><strong>Usuario:</strong> {{ currentUser }}</div>
        </div>
        
        <!-- Quick Actions -->
        <div class="flex gap-1">
          <button (click)="goToLogin()" 
                  class="flex-1 px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs">
            🔐 Login
          </button>
          <button (click)="goToDashboard()" 
                  class="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs">
            📊 Dashboard
          </button>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .fixed {
      position: fixed;
    }
    .z-50 {
      z-index: 50;
    }
    .max-w-sm {
      max-width: 20rem;
    }
    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .transition-colors {
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
  `]
})
export class DevToolsComponent implements OnInit, OnDestroy {
  environment = environment;
  isBypassEnabled = false;
  collapsed = false;
  sessionStatus = 'No iniciada';
  currentUser = '';
  
  private sessionSubscription: any;

  constructor(private sessionService: SessionService) {}

  ngOnInit() {
    // Verificar estado inicial
    this.updateSessionStatus();
    
    // Verificar bypass desde localStorage
    this.isBypassEnabled = localStorage.getItem('dev-bypass-auth') === 'true';
    
    // Suscribirse a cambios de sesión
    this.sessionSubscription = this.sessionService.session$.subscribe(session => {
      this.updateSessionStatus();
    });
  }

  ngOnDestroy() {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }

  toggleBypass(event: any) {
    const enabled = event.target.checked;
    localStorage.setItem('dev-bypass-auth', enabled.toString());
    this.isBypassEnabled = enabled;
    
    if (enabled) {
      console.log('🔓 [DEV] Bypass de autenticación activado');
    } else {
      console.log('🔒 [DEV] Bypass de autenticación desactivado');
    }
    
    // Recargar página para aplicar cambios
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  createMockSession() {
    const mockUser = {
      usuario: 'dev_user',
      id_session: 999999,
      nombre: 'Usuario de Desarrollo',
      email: 'dev@calimax.com'
    };
    
    this.sessionService.setSession(mockUser);
    console.log('👤 [DEV] Sesión mock creada:', mockUser);
    
    // Mostrar mensaje de confirmación
    this.showNotification('Sesión mock creada', 'success');
  }

  clearSession() {
    this.sessionService.logout();
    console.log('🗑️ [DEV] Sesión limpiada');
    this.showNotification('Sesión limpiada', 'info');
  }

  goToLogin() {
    window.location.href = '/login';
  }

  goToDashboard() {
    window.location.href = '/dashboards';
  }

  private updateSessionStatus() {
    const session = this.sessionService.getSession();
    
    if (session && session.isLoggedIn) {
      this.sessionStatus = 'Activa';
      this.currentUser = session.nombre || session.usuario?.toString() || 'Usuario';
    } else {
      this.sessionStatus = 'No iniciada';
      this.currentUser = '';
    }
  }

  private showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 px-4 py-2 rounded text-white text-sm z-50 ${
      type === 'success' ? 'bg-green-500' :
      type === 'info' ? 'bg-blue-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-red-500'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}
