import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollService } from './services/coll.service';
import { CollItem, CollResponse, ParsedCollTypesResponse } from './models/coll.interface';

// Interfaces del monitor
interface ApiCall {
    id: string;
    timestamp: Date;
    tipo: 'in' | 'out';
    servidor: string;
    ruta: string;
    url: string;
    parametros: any;
    body: any;
    respuesta: any;
    statusCode: number;
    mensaje: string;
    duracion?: number;
    method?: string;
}

interface MonitorConfig {
    enabled: boolean;
    maxRecords: number;
    autoCleanup: boolean;
    cleanupDays: number;
}

@Component({
    selector: 'app-test-coll',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="p-6 max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold mb-6 text-center">🧪 Test CollService</h1>

            <!-- Estado de carga -->
            <div class="bg-blue-100 p-4 rounded-lg mb-6">
                <h2 class="text-lg font-semibold mb-2">Estado del Servicio:</h2>
                <p class="text-blue-800">
                    <span class="font-medium">Cargando:</span>
                    <span class="ml-2" [class.text-green-600]="!loading" [class.text-red-600]="loading">
                        {{ loading ? '⏳ Cargando...' : '✅ Listo' }}
                    </span>
                </p>
            </div>

            <!-- Botones de prueba -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <button
                    (click)="testGetAllCollections()"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    [disabled]="loading">
                    📋 Obtener Todas
                </button>

                <button
                    (click)="testGetCollectionById(12)"
                    class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    [disabled]="loading">
                    🔍 Obtener por ID
                </button>

                <button
                    (click)="testSearchCollections('receta')"
                    class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                    [disabled]="loading">
                    🔎 Buscar
                </button>

                <button
                    (click)="testGetCollTypes()"
                    class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                    [disabled]="loading">
                    📋 Tipos
                </button>

                <button
                    (click)="testCreateCollection()"
                    class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
                    [disabled]="loading">
                    ➕ Crear Nueva
                </button>

                <button
                    (click)="clearResults()"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                    🧹 Limpiar
                </button>
            </div>

            <!-- Resultados -->
            <div class="bg-white p-4 rounded-lg shadow" *ngIf="lastResponse">
                <h2 class="text-lg font-semibold mb-4">📊 Última Respuesta:</h2>
                <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ lastResponse | json }}</pre>
            </div>

            <!-- Lista de colecciones -->
            <div class="bg-white p-4 rounded-lg shadow mt-6" *ngIf="collections.length > 0">
                <h2 class="text-lg font-semibold mb-4">📋 Colecciones ({{ collections.length }}):</h2>
                <div class="grid gap-4">
                    <div *ngFor="let coll of collections"
                         class="border rounded p-4 bg-gray-50">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-semibold text-lg">{{ coll.nombre }}</h3>
                            <span class="px-2 py-1 rounded text-sm"
                                  [class.bg-green-100]="coll.estado === 'A'"
                                  [class.text-green-800]="coll.estado === 'A'"
                                  [class.bg-red-100]="coll.estado !== 'A'"
                                  [class.text-red-800]="coll.estado !== 'A'">
                                {{ coll.estado }}
                            </span>
                        </div>
                        <p class="text-gray-600 mb-2">{{ coll.descripcion }}</p>
                        <div class="text-sm text-gray-500">
                            <p>ID: {{ coll.id_coll }} | Tipo: {{ coll.id_tipoc }}</p>
                            <p>Productos: {{ coll.products }} | Creado: {{ coll.fecha_a | date:'short' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mensajes de error -->
            <div class="bg-red-100 p-4 rounded-lg mt-6" *ngIf="errorMessage">
                <h3 class="font-semibold text-red-800">❌ Error:</h3>
                <p class="text-red-700 mt-1">{{ errorMessage }}</p>
            </div>

            <!-- Monitor de APIs -->
            <div class="bg-purple-50 p-6 rounded-lg mt-6 border border-purple-200">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-purple-800">👁️ Monitor de APIs</h2>
                    <div class="flex gap-2">
                        <button
                            (click)="refreshMonitorData()"
                            class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm">
                            🔄 Refrescar
                        </button>
                        <button
                            (click)="clearMonitorData()"
                            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm">
                            🧹 Limpiar
                        </button>
                    </div>
                </div>

                <!-- Configuración del Monitor -->
                <div class="mb-4 p-3 bg-white rounded border" *ngIf="monitorConfig">
                    <h3 class="font-semibold text-purple-700 mb-2">⚙️ Configuración:</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                            <span class="font-medium">Estado:</span>
                            <span class="ml-1" [class.text-green-600]="monitorConfig.enabled" [class.text-red-600]="!monitorConfig.enabled">
                                {{ monitorConfig.enabled ? '✅ Activo' : '❌ Inactivo' }}
                            </span>
                        </div>
                        <div>
                            <span class="font-medium">Máx. Registros:</span>
                            <span class="ml-1">{{ monitorConfig.maxRecords }}</span>
                        </div>
                        <div>
                            <span class="font-medium">Limpieza Auto:</span>
                            <span class="ml-1">{{ monitorConfig.autoCleanup ? 'Sí' : 'No' }}</span>
                        </div>
                        <div>
                            <span class="font-medium">Días:</span>
                            <span class="ml-1">{{ monitorConfig.cleanupDays }}</span>
                        </div>
                    </div>
                </div>

                <!-- Llamadas Capturadas -->
                <div class="bg-white rounded border">
                    <div class="p-3 border-b bg-gray-50">
                        <h3 class="font-semibold text-purple-700">
                            📡 Llamadas Capturadas ({{ apiCalls.length }})
                        </h3>
                    </div>

                    <div class="max-h-96 overflow-y-auto">
                        <div *ngIf="apiCalls.length === 0" class="p-4 text-center text-gray-500">
                            <p>📭 No hay llamadas capturadas aún</p>
                            <p class="text-sm mt-1">Haz clic en algún botón arriba para generar llamadas HTTP</p>
                        </div>

                        <div *ngFor="let call of apiCalls; let i = index"
                             class="border-b border-gray-100 p-3 hover:bg-gray-50">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="px-2 py-1 rounded text-xs font-medium"
                                          [class.bg-blue-100]="call.tipo === 'out'"
                                          [class.text-blue-800]="call.tipo === 'out'"
                                          [class.bg-green-100]="call.tipo === 'in'"
                                          [class.text-green-800]="call.tipo === 'in'">
                                        {{ call.tipo.toUpperCase() }}
                                    </span>
                                    <span class="text-sm font-medium text-gray-700">{{ call.method || 'GET' }}</span>
                                    <span class="text-sm text-gray-600">{{ call.servidor }}</span>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-medium"
                                         [class.text-green-600]="call.statusCode >= 200 && call.statusCode < 300"
                                         [class.text-red-600]="call.statusCode >= 400"
                                         [class.text-yellow-600]="call.statusCode >= 300 && call.statusCode < 400">
                                        {{ call.statusCode }}
                                    </div>
                                    <div class="text-xs text-gray-500" *ngIf="call.duracion">
                                        {{ call.duracion }}ms
                                    </div>
                                </div>
                            </div>

                            <div class="text-sm text-gray-700 mb-1">
                                <strong>Ruta:</strong> {{ call.ruta }}
                            </div>

                            <div class="text-xs text-gray-500">
                                {{ call.timestamp | date:'short' }}
                            </div>

                            <!-- Detalles expandibles -->
                            <details class="mt-2">
                                <summary class="text-xs text-purple-600 cursor-pointer hover:text-purple-800">
                                    Ver detalles completos
                                </summary>
                                <div class="mt-2 p-2 bg-gray-50 rounded text-xs">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                            <strong>URL:</strong>
                                            <div class="break-all">{{ call.url }}</div>
                                        </div>
                                        <div *ngIf="call.parametros">
                                            <strong>Parámetros:</strong>
                                            <pre class="whitespace-pre-wrap">{{ call.parametros | json }}</pre>
                                        </div>
                                        <div *ngIf="call.body">
                                            <strong>Body:</strong>
                                            <pre class="whitespace-pre-wrap">{{ call.body | json }}</pre>
                                        </div>
                                        <div *ngIf="call.respuesta">
                                            <strong>Respuesta:</strong>
                                            <pre class="whitespace-pre-wrap">{{ call.respuesta | json }}</pre>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TestCollComponent implements OnInit, OnDestroy {
    private collService = inject(CollService);

    loading = false;
    collections: CollItem[] = [];
    lastResponse: any = null;
    errorMessage = '';

    // Propiedades del monitor
    monitorConfig: MonitorConfig | null = null;
    apiCalls: ApiCall[] = [];

    ngOnInit() {
        console.log('🧪 TestCollComponent inicializado');
        this.loadMonitorData();
        this.setupMonitorListener();
    }

    ngOnDestroy() {
        // Limpiar el listener de eventos
        window.removeEventListener('apiCallCaptured', this.handleApiCallCaptured.bind(this));
    }

    private loadMonitorData() {
        // Cargar configuración del monitor
        const monitorConfigStr = localStorage.getItem('monitorConfig');
        if (monitorConfigStr) {
            this.monitorConfig = JSON.parse(monitorConfigStr);
        }

        // Cargar llamadas capturadas
        const apiMonitorStr = localStorage.getItem('apiMonitor');
        if (apiMonitorStr) {
            this.apiCalls = JSON.parse(apiMonitorStr).map((call: any) => ({
                ...call,
                timestamp: new Date(call.timestamp)
            }));
        }

        console.log('🔍 Monitor data loaded:', {
            config: this.monitorConfig,
            calls: this.apiCalls.length
        });
    }

    private setupMonitorListener() {
        // Escuchar eventos del interceptor
        window.addEventListener('apiCallCaptured', this.handleApiCallCaptured.bind(this));
        console.log('👂 Monitor listener configurado');
    }

    private handleApiCallCaptured(event: any) {
        console.log('🎯 Evento del interceptor recibido:', event.detail);
        const apiCall: ApiCall = {
            ...event.detail,
            timestamp: new Date()
        };

        // Agregar al array local
        this.apiCalls.unshift(apiCall);

        // Limitar el número de registros mostrados
        if (this.apiCalls.length > 10) {
            this.apiCalls = this.apiCalls.slice(0, 10);
        }

        // Forzar actualización de la vista
        this.apiCalls = [...this.apiCalls];

        console.log('✅ Llamada agregada al monitor local:', apiCall);
    }

    testGetAllCollections() {
        console.log('🧪 Probando getAllCollections...');
        this.loading = true;
        this.errorMessage = '';
        this.lastResponse = null;

        this.collService.getAllCollections().subscribe({
            next: (response: CollResponse) => {
                console.log('✅ Respuesta getAllCollections:', response);
                this.loading = false;
                this.lastResponse = response;

                if (response.statuscode === 200 && response.data) {
                    this.collections = response.data;
                    console.log(`📋 Se cargaron ${response.data.length} colecciones`);
                } else {
                    this.errorMessage = `Respuesta inesperada: ${response.mensaje}`;
                }
            },
            error: (error) => {
                console.error('❌ Error en getAllCollections:', error);
                this.loading = false;
                this.errorMessage = error.message || 'Error desconocido';
            }
        });
    }

    testGetCollectionById(id: number) {
        console.log(`🧪 Probando getCollectionById(${id})...`);
        this.loading = true;
        this.errorMessage = '';
        this.lastResponse = null;

        this.collService.getCollectionById(id).subscribe({
            next: (response) => {
                console.log('✅ Respuesta getCollectionById:', response);
                this.loading = false;
                this.lastResponse = response;

                if (response.statuscode === 200 && response.data) {
                    this.collections = [response.data];
                    console.log(`🔍 Se cargó la colección ${response.data.nombre}`);
                } else {
                    this.errorMessage = `Respuesta inesperada: ${response.mensaje}`;
                }
            },
            error: (error) => {
                console.error('❌ Error en getCollectionById:', error);
                this.loading = false;
                this.errorMessage = error.message || 'Error desconocido';
            }
        });
    }

    testSearchCollections(query: string) {
        console.log(`🧪 Probando searchCollections("${query}")...`);
        this.loading = true;
        this.errorMessage = '';
        this.lastResponse = null;

        this.collService.searchCollections(query).subscribe({
            next: (response: CollResponse) => {
                console.log('✅ Respuesta searchCollections:', response);
                this.loading = false;
                this.lastResponse = response;

                if (response.statuscode === 200 && response.data) {
                    this.collections = response.data;
                    console.log(`🔎 Se encontraron ${response.data.length} colecciones`);
                } else {
                    this.errorMessage = `Respuesta inesperada: ${response.mensaje}`;
                }
            },
            error: (error) => {
                console.error('❌ Error en searchCollections:', error);
                this.loading = false;
                this.errorMessage = error.message || 'Error desconocido';
            }
        });
    }

    testCreateCollection() {
        console.log('🧪 Probando createCollection...');
        this.loading = true;
        this.errorMessage = '';
        this.lastResponse = null;

        const newCollection = {
            nombre: 'Test Collection',
            descripcion: 'Colección de prueba creada desde Angular',
            id_tipoc: 1
        };

        this.collService.createCollection(newCollection).subscribe({
            next: (response) => {
                console.log('✅ Respuesta createCollection:', response);
                this.loading = false;
                this.lastResponse = response;

                if (response.statuscode === 200 || response.statuscode === 201) {
                    console.log('➕ Nueva colección creada exitosamente');
                    // Recargar la lista
                    this.testGetAllCollections();
                } else {
                    this.errorMessage = `Error al crear: ${response.mensaje}`;
                }
            },
            error: (error) => {
                console.error('❌ Error en createCollection:', error);
                this.loading = false;
                this.errorMessage = error.message || 'Error desconocido';
            }
        });
    }

    testGetCollTypes() {
        console.log('🧪 Probando getCollTypes...');
        console.log('🔍 Interceptor debería capturar esta llamada HTTP');
        this.loading = true;
        this.errorMessage = '';
        this.lastResponse = null;

        this.collService.getCollTypes().subscribe({
            next: (response: ParsedCollTypesResponse) => {
                console.log('✅ Respuesta getCollTypes:', response);
                this.loading = false;
                this.lastResponse = response;

                if (response.statuscode === 200 && response.data) {
                    console.log(`📋 Se cargaron ${response.data.length} tipos de colección`);
                    // Mostrar los tipos en la consola para debugging
                    response.data.forEach((tipo, index) => {
                        console.log(`${index + 1}. ${tipo.nomTipo} (ID: ${tipo.id_tipoc})`);
                    });
                } else {
                    this.errorMessage = `Respuesta inesperada: ${response.mensaje}`;
                }
            },
            error: (error) => {
                console.error('❌ Error en getCollTypes:', error);
                this.loading = false;
                this.errorMessage = error.message || 'Error desconocido';
            }
        });
    }

    clearResults() {
        this.collections = [];
        this.lastResponse = null;
        this.errorMessage = '';
        console.log('🧹 Resultados limpiados');
    }

    refreshMonitorData() {
        console.log('🔄 Refrescando datos del monitor...');
        this.loadMonitorData();
    }

    clearMonitorData() {
        this.apiCalls = [];
        localStorage.removeItem('apiMonitor');
        // Forzar actualización de la vista
        this.apiCalls = [...this.apiCalls];
        console.log('🧹 Datos del monitor limpiados');
    }
}
