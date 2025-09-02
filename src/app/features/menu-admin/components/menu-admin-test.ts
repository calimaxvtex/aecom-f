import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-admin-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">✅ Test de Administración de Menú</h1>
      <p class="text-gray-600">Este es un componente de prueba para verificar que el lazy loading funciona correctamente.</p>
      
      <div class="mt-4 p-4 bg-green-100 border border-green-300 rounded">
        <h3 class="font-semibold text-green-800">Estado del Sistema:</h3>
        <ul class="mt-2 text-green-700">
          <li>✅ Lazy loading funcionando</li>
          <li>✅ Componente cargado correctamente</li>
          <li>✅ Rutas configuradas</li>
        </ul>
      </div>
    </div>
  `
})
export class MenuAdminTest {
  constructor() {
    console.log('🚀 MenuAdminTest component loaded successfully!');
  }
}
