import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiConfigService } from '../../core/services/api/api-config.service';
import { ApiEndpoint } from '../../core/models/api-config.interface';

@Component({
    selector: 'app-test-endpoints',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-6">
            <h1 class="text-2xl font-bold mb-6">🔍 Test de Endpoints</h1>

            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h2 class="text-lg font-semibold mb-2">Estado de Carga:</h2>
                <p class="mb-2">
                    <span class="font-medium">Endpoints cargados:</span>
                    <span class="ml-2 px-2 py-1 rounded text-sm"
                          [class.bg-green-100]="hasEndpoints"
                          [class.text-green-800]="hasEndpoints"
                          [class.bg-red-100]="!hasEndpoints"
                          [class.text-red-800]="!hasEndpoints">
                        {{ hasEndpoints ? '✅ SÍ' : '❌ NO' }}
                    </span>
                </p>
                <p class="mb-2">
                    <span class="font-medium">Cantidad de endpoints:</span>
                    <span class="ml-2">{{ endpoints.length }}</span>
                </p>
            </div>

            <div class="bg-white p-4 rounded-lg shadow" *ngIf="endpoints.length > 0">
                <h2 class="text-lg font-semibold mb-4">Lista de Endpoints:</h2>
                <div class="grid gap-2">
                    <div *ngFor="let endpoint of endpoints"
                         class="p-3 border rounded bg-gray-50">
                        <div class="flex justify-between">
                            <span class="font-medium">{{ endpoint.name }}</span>
                            <span class="text-sm text-gray-600">{{ endpoint.url }}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                            ID: {{ endpoint.id }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-yellow-100 p-4 rounded-lg shadow mt-6" *ngIf="!hasEndpoints">
                <h3 class="font-semibold text-yellow-800">⚠️ Endpoints no disponibles</h3>
                <p class="text-yellow-700 mt-1">
                    Si los endpoints no se están cargando, verifica:
                </p>
                <ul class="text-yellow-700 mt-2 list-disc list-inside">
                    <li>Que la API en http://localhost:3000 esté ejecutándose</li>
                    <li>Que el endpoint /apic/config esté disponible</li>
                    <li>Que no haya errores en la consola del navegador</li>
                </ul>
            </div>
        </div>
    `
})
export class TestEndpoints implements OnInit {
    endpoints: ApiEndpoint[] = [];
    hasEndpoints = false;

    private apiConfigService = inject(ApiConfigService);

    ngOnInit() {
        console.log('🔍 TestEndpoints: Verificando estado de endpoints...');

        // Verificar estado inicial
        this.checkEndpointsStatus();

        // Suscribirse a cambios por si se cargan después
        this.apiConfigService.getEndpointsLoaded$().subscribe((loaded: boolean) => {
            if (loaded) {
                console.log('✅ TestEndpoints: Endpoints cargados dinámicamente');
                this.checkEndpointsStatus();
            }
        });
    }

    private checkEndpointsStatus() {
        this.hasEndpoints = this.apiConfigService.hasEndpoints();
        this.endpoints = this.apiConfigService.getAllEndpoints();

        console.log('🔍 TestEndpoints: Estado actual:', {
            hasEndpoints: this.hasEndpoints,
            count: this.endpoints.length,
            endpoints: this.endpoints
        });
    }
}
