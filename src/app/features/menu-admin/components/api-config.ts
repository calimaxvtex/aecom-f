import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenuService } from '../../../core/services/menu/menu.service';
import { ApiConfigService } from '../../../core/services/api/api-config.service';

@Component({
    selector: 'app-api-config',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        CheckboxModule,
        CardModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <div class="p-4">
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-2">⚙️ Configuración de API</h2>
                <p class="text-gray-600">Configura la conexión con el backend y el modo de datos</p>
            </div>

            <!-- Estado Actual -->
            <p-card header="📊 Estado Actual" class="mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-blue-600 font-medium">Modo de Datos</p>
                                <p class="text-xl font-bold" [class]="isUsingMockData ? 'text-orange-800' : 'text-green-800'">
                                    {{ isUsingMockData ? '🧪 Mock Data' : '🌐 API Real' }}
                                </p>
                            </div>
                            <i [class]="isUsingMockData ? 'pi pi-database text-orange-500' : 'pi pi-globe text-green-500'" class="text-2xl"></i>
                        </div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm text-green-600 font-medium">URL Base</p>
                                <p class="text-lg font-bold text-green-800 break-all">{{ currentBaseUrl }}</p>
                            </div>
                            <i class="pi pi-link text-green-500 text-2xl"></i>
                        </div>
                    </div>
                </div>
            </p-card>

            <!-- Configuración -->
            <p-card header="🔧 Configuración" class="mb-6">
                <div class="space-y-4">
                    <!-- URL del Backend -->
                    <div>
                        <label class="block text-sm font-medium mb-2">URL del Backend</label>
                        <input 
                            pInputText 
                            [(ngModel)]="newBaseUrl" 
                            placeholder="http://localhost:8080" 
                            class="w-full"
                        />
                        <small class="text-gray-500 text-xs mt-1">
                            💡 Ejemplo: http://localhost:8080, https://api.tudominio.com
                        </small>
                    </div>

                    <!-- Modo de Datos -->
                    <div>
                        <div class="flex items-center gap-2">
                            <p-checkbox 
                                [(ngModel)]="useMockData" 
                                [binary]="true" 
                                inputId="mockMode"
                            />
                            <label for="mockMode" class="text-sm font-medium">
                                Usar datos simulados (Mock Data)
                            </label>
                        </div>
                        <small class="text-gray-500 text-xs mt-1">
                            🧪 Activa esta opción para usar datos de prueba sin conectar al backend
                        </small>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div class="flex gap-2 mt-6 pt-4 border-t">
                    <p-button
                        label="Aplicar Configuración"
                        icon="pi pi-check"
                        (onClick)="applyConfiguration()"
                        severity="success"
                    />
                    <p-button
                        label="Probar Conexión"
                        icon="pi pi-wifi"
                        (onClick)="testConnection()"
                        [outlined]="true"
                        severity="info"
                    />
                    <p-button
                        label="Restablecer"
                        icon="pi pi-refresh"
                        (onClick)="resetConfiguration()"
                        [outlined]="true"
                        severity="secondary"
                    />
                </div>
            </p-card>

            <!-- Información de Endpoints -->
            <p-card header="📍 Endpoints Disponibles">
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <span class="font-medium">GET</span>
                            <span class="ml-2 text-gray-600">{{ currentBaseUrl }}/api/menu/v1</span>
                        </div>
                        <span class="text-xs text-gray-500">Obtener todos los menús</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <span class="font-medium">GET</span>
                            <span class="ml-2 text-gray-600">{{ currentBaseUrl }}/api/menu/v1/:id</span>
                        </div>
                        <span class="text-xs text-gray-500">Obtener menú específico</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <span class="font-medium">POST</span>
                            <span class="ml-2 text-gray-600">{{ currentBaseUrl }}/api/menu/v1</span>
                        </div>
                        <span class="text-xs text-gray-500">Crear/Actualizar con action</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <span class="font-medium">PATCH</span>
                            <span class="ml-2 text-gray-600">{{ currentBaseUrl }}/api/menu/v1/:id</span>
                        </div>
                        <span class="text-xs text-gray-500">Update parcial</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <span class="font-medium">PUT</span>
                            <span class="ml-2 text-gray-600">{{ currentBaseUrl }}/api/menu/v1/:id</span>
                        </div>
                        <span class="text-xs text-gray-500">Update completo</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                            <span class="font-medium">DELETE</span>
                            <span class="ml-2 text-gray-600">{{ currentBaseUrl }}/api/menu/v1/:id</span>
                        </div>
                        <span class="text-xs text-gray-500">Eliminar menú</span>
                    </div>
                </div>
            </p-card>
        </div>

        <!-- Toast para notificaciones -->
        <p-toast />
    `
})
export class ApiConfig implements OnInit {
    // Estado actual
    isUsingMockData = true;
    currentBaseUrl = '';
    
    // Configuración editable
    newBaseUrl = '';
    useMockData = true;

    constructor(
        private menuService: MenuService,
        private apiConfigService: ApiConfigService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadCurrentConfiguration();
    }

    loadCurrentConfiguration(): void {
        this.isUsingMockData = this.menuService.isUsingMockData();
        this.currentBaseUrl = this.apiConfigService.getBaseUrl();
        this.newBaseUrl = this.currentBaseUrl;
        this.useMockData = this.isUsingMockData;
        
        console.log('📊 Configuración actual cargada:', {
            mockData: this.isUsingMockData,
            baseUrl: this.currentBaseUrl
        });
    }

    applyConfiguration(): void {
        try {
            // Validar URL si no está usando mock data
            if (!this.useMockData && !this.newBaseUrl.trim()) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Debes proporcionar una URL válida para usar API real'
                });
                return;
            }

            // Aplicar configuración de URL
            if (this.newBaseUrl.trim() && this.newBaseUrl !== this.currentBaseUrl) {
                this.apiConfigService.setBaseUrl(this.newBaseUrl.trim());
                this.currentBaseUrl = this.newBaseUrl.trim();
                console.log('🔄 URL base actualizada a:', this.currentBaseUrl);
            }

            // Aplicar configuración de mock data
            this.menuService.setUseMockData(this.useMockData);
            this.isUsingMockData = this.useMockData;

            this.messageService.add({
                severity: 'success',
                summary: 'Configuración Aplicada',
                detail: `Modo: ${this.useMockData ? 'Mock Data' : 'API Real'} | URL: ${this.currentBaseUrl}`
            });

        } catch (error) {
            console.error('Error aplicando configuración:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al aplicar la configuración'
            });
        }
    }

    testConnection(): void {
        if (this.useMockData) {
            this.messageService.add({
                severity: 'info',
                summary: 'Modo Mock',
                detail: 'Estás en modo Mock Data. No se requiere conexión al backend.'
            });
            return;
        }

        this.messageService.add({
            severity: 'info',
            summary: 'Probando Conexión',
            detail: 'Intentando conectar con el backend...'
        });

        // Probar conexión haciendo una llamada real
        this.menuService.getMenuItems().subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Conexión Exitosa',
                    detail: `Conectado a ${this.currentBaseUrl}. Items recibidos: ${response.data?.length || 0}`
                });
                console.log('✅ Conexión exitosa:', response);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de Conexión',
                    detail: `No se pudo conectar a ${this.currentBaseUrl}. ${error.message}`
                });
                console.error('❌ Error de conexión:', error);
            }
        });
    }

    resetConfiguration(): void {
        this.newBaseUrl = 'http://localhost:3000';
        this.useMockData = true;
        
        this.messageService.add({
            severity: 'info',
            summary: 'Configuración Restablecida',
            detail: 'URL: http://localhost:3000 | Modo: Mock Data'
        });
    }
}
