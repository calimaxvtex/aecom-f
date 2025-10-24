import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dev-tools',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dev-tools-panel" *ngIf="showDevTools">
      <div class="dev-tools-header">
        <h3>🛠️ Dev Tools</h3>
        <button (click)="togglePanel()" class="close-btn">×</button>
      </div>
      
      <div class="dev-tools-content">
        <div class="environment-info">
          <h4>🌍 Environment</h4>
          <p><strong>Mode:</strong> {{ environment.mode || 'development' }}</p>
          <p><strong>Production:</strong> {{ environment.production }}</p>
          <p><strong>API URL:</strong> {{ environment.apiUrl }}</p>
          <p><strong>Bypass Auth:</strong> {{ environment.bypassAuth }}</p>
        </div>
        
        <div class="debug-actions">
          <h4>🔧 Debug Actions</h4>
          <button (click)="clearStorage()" class="debug-btn">Clear Storage</button>
          <button (click)="reloadPage()" class="debug-btn">Reload Page</button>
          <button (click)="showConsoleInfo()" class="debug-btn">Console Info</button>
        </div>
        
        <div class="performance-info">
          <h4>⚡ Performance</h4>
          <p><strong>Load Time:</strong> {{ loadTime }}ms</p>
          <p><strong>Memory:</strong> {{ memoryUsage }}</p>
        </div>
      </div>
    </div>
    
    <button 
      *ngIf="!showDevTools && environment.debugMode" 
      (click)="togglePanel()" 
      class="dev-tools-toggle"
      title="Open Dev Tools"
    >
      🛠️
    </button>
  `,
  styles: [`
    .dev-tools-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      background: #1a1a1a;
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 9999;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }
    
    .dev-tools-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      background: #2a2a2a;
      border-radius: 8px 8px 0 0;
    }
    
    .dev-tools-header h3 {
      margin: 0;
      font-size: 14px;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
    }
    
    .dev-tools-content {
      padding: 15px;
    }
    
    .dev-tools-content h4 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #4CAF50;
    }
    
    .dev-tools-content p {
      margin: 4px 0;
      font-size: 11px;
    }
    
    .debug-actions {
      margin: 15px 0;
    }
    
    .debug-btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 5px 10px;
      margin: 2px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 10px;
    }
    
    .debug-btn:hover {
      background: #45a049;
    }
    
    .dev-tools-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #4CAF50;
      color: white;
      border: none;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 9998;
    }
    
    .dev-tools-toggle:hover {
      background: #45a049;
    }
  `]
})
export class DevToolsComponent {
  showDevTools = false;
  loadTime = 0;
  memoryUsage = 'N/A';
  
  constructor() {
    this.loadTime = performance.now();
    this.updateMemoryUsage();
  }
  
  togglePanel() {
    this.showDevTools = !this.showDevTools;
  }
  
  clearStorage() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('🧹 Storage cleared');
  }
  
  reloadPage() {
    window.location.reload();
  }
  
  showConsoleInfo() {
    console.log('🔧 Dev Tools Info:', {
      environment: environment,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }
  
  updateMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryUsage = `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`;
    }
  }
}