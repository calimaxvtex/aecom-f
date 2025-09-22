import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules (standalone)
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

// Modelos y servicios
import { Articulo } from '@/features/productos/models/index';
import { ArticulosService } from '@/features/productos/services/articulos.service';

@Component({
    selector: 'app-productos-test-nuevo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        ButtonModule,
        AutoCompleteModule,
        CheckboxModule,
        InputGroupModule,
        InputTextModule,
        ToastModule,
        ProgressSpinnerModule,
        TagModule
    ],
    template: `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">

            <!-- Panel de Control -->
            <div class="space-y-6">

                <!-- Estado de Servicios -->
                <p-card header="Estado de Servicios">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="font-medium">Artículos:</span>
                            <p-tag
                                [value]="articulosService ? 'Inicializado' : 'No Inicializado'"
                                [severity]="articulosService ? 'success' : 'danger'"
                            ></p-tag>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-medium">Cache Artículos:</span>
                            <p-tag
                                [value]="articulosCacheStatus.isLoaded ? 'Cargado' : 'No Cargado'"
                                [severity]="articulosCacheStatus.isLoaded ? 'success' : 'warning'"
                            ></p-tag>
                        </div>
                        <div class="text-sm text-gray-600">
                            Artículos en cache: {{ articulosCacheStatus.count }}
                        </div>
                    </div>

                    <!-- Botones de Control -->
                    <ng-template pTemplate="footer">
                        <div class="flex gap-2">
                            <p-button
                                label="Limpiar Cache"
                                icon="pi pi-trash"
                                (onClick)="clearArticulosCache()"
                                [disabled]="!articulosService"
                                styleClass="p-button-sm p-button-danger"
                            ></p-button>
                        </div>
                    </ng-template>
                </p-card>

                <!-- Navegación entre secciones -->
                <p-card header="Navegación de Secciones">
                    <div class="flex gap-2 mb-4">
                        <p-button
                            [label]="seccionActiva === 'productos' ? '📦 Productos' : '📦 Productos'"
                            [outlined]="seccionActiva !== 'productos'"
                            (onClick)="cambiarSeccion('productos')"
                            styleClass="p-button-sm"
                        ></p-button>
                        <p-button
                            [label]="seccionActiva === 'futuro' ? '🔄 Próximamente' : '🔄 Próximamente'"
                            [outlined]="seccionActiva !== 'futuro'"
                            (onClick)="cambiarSeccion('futuro')"
                            styleClass="p-button-sm"
                        ></p-button>
                    </div>
                    <div class="text-sm text-gray-600">
                        <strong>Sección activa:</strong> {{ seccionActiva === 'productos' ? 'Productos' : 'Próximamente' }}
                    </div>
                </p-card>

                <!-- Contenido según sección activa -->
                <div *ngIf="seccionActiva === 'productos'">

                    <!-- Gestión de Artículos -->
                    <p-card header="Gestión de Artículos">
                                <div class="space-y-4">
                                    <div class="grid grid-cols-1 gap-4">
                                        <div class="p-4 bg-blue-50 rounded-lg">
                                            <div class="flex items-center justify-between mb-2">
                                                <h4 class="font-medium text-blue-800">📦 Cache de Artículos</h4>
                                                <p-tag
                                                    [value]="articulosCacheStatus.isLoaded ? 'CARGADO' : 'VACÍO'"
                                                    [severity]="articulosCacheStatus.isLoaded ? 'success' : 'info'"
                                                ></p-tag>
                                            </div>
                                            <p class="text-sm text-blue-700 mb-2">
                                                Artículos en cache: <strong>{{ articulosCacheStatus.count }}</strong>
                                            </p>
                                            <div class="text-xs text-blue-600">
                                                <p>Las consultas responden desde cache si está disponible</p>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Búsqueda de Artículos por Texto -->
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Buscar Artículos</label>
                                        <p-inputgroup>
                                            <p-button
                                                label="🔍 Buscar"
                                                icon="pi pi-search"
                                                (onClick)="buscarArticulosPorTexto()"
                                                [loading]="loadingBusqueda"
                                                [disabled]="!articulosService"
                                                styleClass="p-button-sm"
                                            ></p-button>
                                            <input
                                                pInputText
                                                [(ngModel)]="textoBusqueda"
                                                placeholder="Buscar por nombre, marca o código..."
                                                [disabled]="!articulosService"
                                                (keydown.enter)="buscarArticulosPorTexto()"
                                            />
                                        </p-inputgroup>
                                    </div>

                                    <!-- Parámetro Limit -->
                                    <div>
                                        <label class="block text-sm font-medium mb-2">Límite de Resultados</label>
                                        <input
                                            pInputText
                                            [(ngModel)]="limitBusqueda"
                                            type="number"
                                            placeholder="100"
                                            min="1"
                                            max="1000"
                                            class="w-full"
                                        />
                                        <p class="text-xs text-gray-500 mt-1">
                                            Número máximo de artículos a mostrar (1-1000)
                                        </p>
                                    </div>

                                    <!-- Resultados de Búsqueda en Texto -->
                                    <div *ngIf="resultadosBusquedaTexto" class="mt-4">
                                        <label class="block text-sm font-medium mb-2">📋 Resultados de Búsqueda</label>
                                        <textarea
                                            [value]="resultadosBusquedaTexto"
                                            readonly
                                            rows="12"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
                                            placeholder="Los resultados de búsqueda aparecerán aquí en formato texto..."
                                        ></textarea>
                                    </div>

                                    <!-- Configuración de Compresión -->
                                    <div class="p-3 bg-purple-50 rounded-lg">
                                        <div class="flex items-center space-x-2 mb-2">
                                            <p-checkbox
                                                name="usarCompresionArticulos"
                                                [(ngModel)]="usarCompresionArticulos"
                                                (onChange)="onCompresionArticulosChange($event)"
                                                label="Usar compresión">
                                            </p-checkbox>
                                            <p-tag
                                                [value]="usarCompresionArticulos ? 'COMPRIMIDO' : 'NORMAL'"
                                                [severity]="usarCompresionArticulos ? 'success' : 'info'"
                                            ></p-tag>
                                        </div>
                                        <p class="text-xs text-purple-600">
                                            Activa la compresión para reducir el tamaño de las respuestas HTTP
                                        </p>
                                    </div>

                                    <div class="grid grid-cols-1 gap-2">
                                        <p-button
                                            label="Load Completo (LGET)"
                                            icon="pi pi-download"
                                            (onClick)="cargarCatalogoCompletoArticulos()"
                                            [loading]="loadingArticulos"
                                            [disabled]="!articulosService"
                                            styleClass="p-button-sm p-button-success w-full"
                                            pTooltip="Carga todo el catálogo de artículos en cache"
                                        ></p-button>


                                        <p-button
                                            label="Probar Compresión"
                                            icon="pi pi-flask"
                                            (onClick)="probarCompresion()"
                                            styleClass="p-button-sm p-button-warning w-full"
                                            pTooltip="Probar formato de respuesta comprimida"
                                        ></p-button>
                                    </div>
                                </div>
                            </p-card>
                        </div>

                <!-- Contenido del segundo tab: Próximamente -->
                <div *ngIf="seccionActiva === 'futuro'">
                    <p-card header="🔄 Próximamente">
                        <div class="text-center py-12">
                            <i class="pi pi-clock text-4xl text-gray-400 mb-4"></i>
                            <h3 class="text-lg font-medium text-gray-600 mb-2">Funcionalidad Próxima</h3>
                            <p class="text-sm text-gray-500">
                                Este espacio está reservado para futuras funcionalidades de testing.
                            </p>
                        </div>
                    </p-card>
                </div>

            </div>

            <!-- Panel de Resultados -->
            <div class="space-y-6">

                <!-- Resultados de Artículos -->
                <p-card header="Resultado de Artículos">
                    <div *ngIf="articulos.length === 0 && !loadingArticulos" class="text-center py-8 text-gray-500">
                        <i class="pi pi-box text-3xl mb-2"></i>
                        <p>No hay artículos cargados</p>
                        <p class="text-xs mt-1">Use "Load Completo" o busque un artículo específico</p>
                    </div>

                    <div *ngIf="articulos.length > 0" class="space-y-2">
                        <div *ngFor="let art of articulos" class="flex items-center justify-between p-2 bg-green-50 rounded">
                            <div class="flex-1">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium">{{ art.nombre }}</span>
                                    <p-tag
                                        [value]="art.estado_articulo"
                                        [severity]="art.estado_articulo === 'A' ? 'success' : 'danger'"
                                        styleClass="text-xs"
                                    ></p-tag>
                                </div>
                                <div class="text-sm text-gray-500 mt-1">
                                    <span class="font-medium">{{ art.articulo }}</span> |
                                    {{ art.marca }} |
                                    Cat: {{ art.idcat }}, Sub: {{ art.idscat }}
                                </div>
                            </div>
                            <p-tag
                                [value]="articuloSeleccionado?.articulo === art.articulo ? 'Seleccionado' : 'Disponible'"
                                [severity]="articuloSeleccionado?.articulo === art.articulo ? 'success' : 'info'"
                            ></p-tag>
                        </div>
                    </div>

                    <div *ngIf="loadingArticulos" class="text-center py-4">
                        <p-progressSpinner [style]="{'width': '30px', 'height': '30px'}"></p-progressSpinner>
                        <p class="mt-2 text-sm text-gray-600">Cargando artículos...</p>
                    </div>
                </p-card>

                <!-- Visualización de Respuestas -->
                <p-card header="📊 Respuestas del Servicio">
                    <div class="space-y-4">
                        <!-- Información de respuesta -->
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div class="p-3 bg-green-50 rounded-lg">
                                <h5 class="font-medium text-green-800 mb-1">📦 Raw Response</h5>
                                <p class="text-sm text-green-700">{{ respuestaCruda.length || 0 }} chars</p>
                                <p class="text-xs text-green-600">Respuesta del servidor</p>
                            </div>
                            <div class="p-3 bg-blue-50 rounded-lg">
                                <h5 class="font-medium text-blue-800 mb-1">📋 Processed Data</h5>
                                <p class="text-sm text-blue-700">{{ respuestaProcesada.length || 0 }} chars</p>
                                <p class="text-xs text-blue-600">Datos procesados</p>
                            </div>
                            <div class="p-3 bg-purple-50 rounded-lg">
                                <h5 class="font-medium text-purple-800 mb-1">🗜️ Algorithm</h5>
                                <p class="text-sm text-purple-700">{{ algoritmoDetectado || 'N/A' }}</p>
                                <p class="text-xs text-purple-600">{{ metricasCompresion?.algoritmo || 'Sin comprimir' }}</p>
                            </div>
                            <div class="p-3 bg-orange-50 rounded-lg">
                                <h5 class="font-medium text-orange-800 mb-1">📊 Ratio</h5>
                                <p class="text-sm text-orange-700">{{ calcularRatioCompresion() }}%</p>
                                <p class="text-xs text-orange-600">
                                    {{ metricasCompresion ? 'Comprimido' : 'Sin compresión' }}
                                </p>
                            </div>
                        </div>

                        <!-- Área para respuesta cruda -->
                        <div>
                            <label class="block text-sm font-medium mb-2">🔍 Respuesta Cruda del Servidor:</label>
                            <textarea
                                [value]="respuestaCruda"
                                readonly
                                rows="6"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50"
                                placeholder="Aquí aparecerá la respuesta HTTP sin procesar...">
                            </textarea>
                        </div>

                        <!-- Área para respuesta procesada -->
                        <div>
                            <label class="block text-sm font-medium mb-2">✅ Datos Procesados:</label>
                            <textarea
                                [value]="respuestaProcesada"
                                readonly
                                rows="6"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-green-50"
                                placeholder="Aquí aparecerán los datos después de descompresión...">
                            </textarea>
                        </div>

                        <!-- Botones de prueba -->
                        <div class="grid grid-cols-1 gap-2 mt-2">
                            <p-button
                                label="🗑️ Limpiar Respuestas"
                                icon="pi pi-times"
                                (onClick)="limpiarRespuestas()"
                                styleClass="p-button-sm p-button-danger w-full"
                                pTooltip="Limpiar todas las respuestas"
                            ></p-button>
                        </div>
                    </div>
                </p-card>

            </div>

        </div>

        <!-- Toast para mensajes -->
        <p-toast></p-toast>
    `,
    styles: [`
        .p-card-header {
            font-weight: 600;
            color: #374151;
        }

        .p-autocomplete {
            width: 100%;
        }

        .p-autocomplete-input {
            width: 100% !important;
        }

        .p-tag {
            font-size: 0.75rem;
        }
    `]
})
export class ProductosTestNuevoComponent implements OnInit {

    // Servicios
    articulosService = inject(ArticulosService);
    private messageService = inject(MessageService);

    // Estados de carga
    loadingArticulos = false;

    // Datos
    articulos: Articulo[] = [];

    // Selecciones
    articuloSeleccionado: Articulo | null = null;

    // Para autocomplete (mantenido por compatibilidad)
    articulosFiltrados: Articulo[] = [];

    // Para búsqueda por texto
    textoBusqueda: string = '';
    limitBusqueda: number = 100;
    resultadosBusquedaTexto: string = '';
    loadingBusqueda: boolean = false;

    // Estado del cache
    articulosCacheStatus = { isLoaded: false, count: 0 };

    // Configuración de compresión
    usarCompresionArticulos: boolean = false;
    respuestaCruda: string = '';
    respuestaProcesada: string = '';
    algoritmoDetectado: string = '';
    metricasCompresion: {
        algoritmo: string;
        ratio: number;
        tiempoProcesamiento: number;
        tamanoOriginal: number;
        tamanoDescomprimido: number;
    } | null = null;

    // Navegación entre secciones
    seccionActiva: 'productos' | 'futuro' = 'productos';

    ngOnInit(): void {
        console.log('🚀 ProductosTestNuevoComponent inicializado');
        this.actualizarEstadoCache();

        // Configurar callback para capturar respuestas crudas
        this.articulosService.setRespuestaCrudaCallback((respuesta) => {
            this.mostrarRespuestaCruda(respuesta);
        });
    }

    // ========== AUTOCOMPLETE ARTÍCULOS ==========

    filtrarArticulos(event: any): void {
        const query = event.query.toLowerCase();
        if (!query) {
            this.articulosFiltrados = [...this.articulos];
            return;
        }

        this.articulosFiltrados = this.articulos.filter(art =>
            art.nombre.toLowerCase().includes(query) ||
            art.marca.toLowerCase().includes(query) ||
            art.articulo.toString().includes(query)
        );

        console.log(`🔍 Filtrando artículos: "${query}" → ${this.articulosFiltrados.length} resultados`);
    }

    onArticuloSelect(event: any): void {
        console.log('🎯 Artículo seleccionado:', event);
        this.articuloSeleccionado = event;
    }

    onArticuloClear(): void {
        console.log('🧹 Artículo limpiado');
        this.articuloSeleccionado = null;
        this.articulosFiltrados = [];
    }

    // ========== COMPRESIÓN ==========

    onCompresionArticulosChange(event: any): void {
        this.usarCompresionArticulos = event.checked;
        console.log('🔧 Compresión Artículos:', this.usarCompresionArticulos ? 'ACTIVADA' : 'DESACTIVADA');
    }

    mostrarRespuestaCruda(respuesta: any): void {
        this.respuestaCruda = JSON.stringify(respuesta, null, 2);

        if (respuesta.swcomp === 1) {
            this.algoritmoDetectado = 'GZIP (DETECTADO)';

            const tamanoCrudo = this.respuestaCruda.length;
            this.metricasCompresion = {
                algoritmo: 'GZIP',
                ratio: 0,
                tiempoProcesamiento: 0,
                tamanoOriginal: tamanoCrudo,
                tamanoDescomprimido: 0
            };
        } else {
            this.algoritmoDetectado = 'SIN COMPRESIÓN';
            this.metricasCompresion = null;
        }
    }

    // ========== OPERACIONES ==========

    cargarCatalogoCompletoArticulos(): void {
        console.log('📦 Cargando catálogo completo de artículos...');
        this.loadingArticulos = true;

        const params: { swcomp?: 0 | 1 } = this.usarCompresionArticulos ? { swcomp: 1 as const } : { swcomp: 0 as const };

        this.articulosService.loadAllArticulos(params).subscribe({
            next: (articulos) => {
                this.loadingArticulos = false;
                this.actualizarEstadoCache();

                const source = this.usarCompresionArticulos ? 'SERVIDOR (COMPRIMIDO)' : 'SERVIDOR';
                this.respuestaProcesada = JSON.stringify(articulos, null, 2);

                // Actualizar métricas si hay compresión
                if (this.metricasCompresion) {
                    this.metricasCompresion.tamanoDescomprimido = this.respuestaProcesada.length;
                    this.metricasCompresion.ratio = this.calcularRatioCompresion();
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Catálogo Cargado',
                    detail: `${articulos.length} artículos cargados desde ${source}`,
                    life: 3000
                });
            },
            error: (error) => {
                this.loadingArticulos = false;
                console.error('❌ Error cargando catálogo de artículos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar el catálogo de artículos',
                    life: 3000
                });
            }
        });
    }

    cargarArticuloEspecifico(): void {
        if (!this.articuloSeleccionado) return;

        console.log('🎯 Cargando artículo específico:', this.articuloSeleccionado.articulo);
        this.loadingArticulos = true;

        this.articulosService.getArticulos({
            action: 'GET',
            id: this.articuloSeleccionado.articulo
        }).subscribe({
            next: (articulos) => {
                this.loadingArticulos = false;
                const articulo = articulos.find(a => a.articulo === this.articuloSeleccionado?.articulo);

                if (articulo) {
                    this.articulos = [articulo]; // Mostrar solo el artículo específico
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Artículo Cargado',
                        detail: `${articulo.nombre} (${articulo.articulo})`,
                        life: 3000
                    });
                }
            },
            error: (error) => {
                this.loadingArticulos = false;
                console.error('❌ Error cargando artículo específico:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cargar el artículo',
                    life: 3000
                });
            }
        });
    }

    // ========== BÚSQUEDA POR TEXTO ==========

    buscarArticulosPorTexto(): void {
        if (!this.textoBusqueda || this.textoBusqueda.trim().length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Búsqueda Vacía',
                detail: 'Por favor ingrese un término de búsqueda',
                life: 3000
            });
            return;
        }

        console.log(`🔍 Buscando artículos con texto: "${this.textoBusqueda}", limit: ${this.limitBusqueda}`);
        this.loadingBusqueda = true;
        this.resultadosBusquedaTexto = '';

        // Configurar callback para capturar respuesta cruda
        this.articulosService.setRespuestaCrudaCallback((respuesta) => {
            this.mostrarRespuestaCruda(respuesta);
        });

        // Usar action 'SL' para búsqueda
        const compressionParams: { swcomp?: 0 | 1 } = this.usarCompresionArticulos ? { swcomp: 1 as const } : { swcomp: 0 as const };

        this.articulosService.getArticulos({
            action: 'SL',
            nombre: this.textoBusqueda,
            marca: this.textoBusqueda,
            limit: this.limitBusqueda
        }, compressionParams).subscribe({
            next: (articulos) => {
                this.loadingBusqueda = false;

                // Mostrar resultados en formato texto
                if (articulos.length === 0) {
                    this.resultadosBusquedaTexto = `❌ No se encontraron artículos para: "${this.textoBusqueda}"\n\n`;
                    this.resultadosBusquedaTexto += `Parámetros de búsqueda:\n`;
                    this.resultadosBusquedaTexto += `- Texto: ${this.textoBusqueda}\n`;
                    this.resultadosBusquedaTexto += `- Límite: ${this.limitBusqueda}\n`;
                    this.resultadosBusquedaTexto += `- Action: SL\n`;
                    this.resultadosBusquedaTexto += `- Compresión: ${this.usarCompresionArticulos ? 'SÍ' : 'NO'}`;
                } else {
                    this.resultadosBusquedaTexto = `✅ BÚSQUEDA EXITOSA\n\n`;
                    this.resultadosBusquedaTexto += `📊 Resultados encontrados: ${articulos.length}\n`;
                    this.resultadosBusquedaTexto += `🔍 Texto buscado: "${this.textoBusqueda}"\n`;
                    this.resultadosBusquedaTexto += `📏 Límite aplicado: ${this.limitBusqueda}\n`;
                    this.resultadosBusquedaTexto += `🗜️ Compresión: ${this.usarCompresionArticulos ? 'ACTIVADA' : 'DESACTIVADA'}\n\n`;

                    this.resultadosBusquedaTexto += `📋 DETALLE DE ARTÍCULOS:\n`;
                    this.resultadosBusquedaTexto += `═`.repeat(80) + `\n`;

                    articulos.forEach((art, index) => {
                        this.resultadosBusquedaTexto += `${index + 1}. ${art.nombre}\n`;
                        this.resultadosBusquedaTexto += `   📦 Código: ${art.articulo}\n`;
                        this.resultadosBusquedaTexto += `   🏷️  Marca: ${art.marca}\n`;
                        this.resultadosBusquedaTexto += `   📂 Categoría: ${art.idcat}\n`;
                        this.resultadosBusquedaTexto += `   📂 Subcategoría: ${art.idscat}\n`;
                        this.resultadosBusquedaTexto += `   📂 Segmento: ${art.idseg}\n`;
                        this.resultadosBusquedaTexto += `   🔴 Estado: ${art.estado_articulo}\n`;
                        this.resultadosBusquedaTexto += `   ═`.repeat(40) + `\n`;
                    });

                    // Almacenar en la variable articulos para compatibilidad
                    this.articulos = articulos;
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Búsqueda Completada',
                    detail: `${articulos.length} artículos encontrados`,
                    life: 3000
                });
            },
            error: (error) => {
                this.loadingBusqueda = false;
                console.error('❌ Error en búsqueda por texto:', error);

                this.resultadosBusquedaTexto = `❌ ERROR EN LA BÚSQUEDA\n\n`;
                this.resultadosBusquedaTexto += `Texto buscado: "${this.textoBusqueda}"\n`;
                this.resultadosBusquedaTexto += `Error: ${error.message || 'Error desconocido'}\n\n`;
                this.resultadosBusquedaTexto += `Por favor revise la consola para más detalles.`;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error en Búsqueda',
                    detail: 'No se pudo completar la búsqueda',
                    life: 3000
                });
            }
        });
    }

    probarCompresion(): void {
        console.log('🧪 Probando compresión...');
        // Aquí puedes agregar lógica para probar compresión con datos de ejemplo
        this.messageService.add({
            severity: 'info',
            summary: 'Función Próxima',
            detail: 'Esta funcionalidad estará disponible próximamente',
            life: 3000
        });
    }

    clearArticulosCache(): void {
        console.log('🗑️ Limpiando cache de artículos...');
        this.articulosService.clearCache();
        this.actualizarEstadoCache();

        this.messageService.add({
            severity: 'info',
            summary: 'Cache Limpiado',
            detail: 'El catálogo de artículos ha sido limpiado',
            life: 3000
        });
    }

    limpiarRespuestas(): void {
        this.respuestaCruda = '';
        this.respuestaProcesada = '';
        this.algoritmoDetectado = '';
        this.metricasCompresion = null;
        console.log('🧹 Respuestas limpiadas');
    }

    actualizarEstadoCache(): void {
        this.articulosCacheStatus = this.articulosService.getCacheStatus();
        console.log('📊 Estado del cache actualizado:', this.articulosCacheStatus);
    }

    // ========== NAVEGACIÓN ==========

    cambiarSeccion(seccion: 'productos' | 'futuro'): void {
        this.seccionActiva = seccion;
        console.log(`🔄 Sección cambiada a: ${seccion}`);
    }

    calcularRatioCompresion(): number {
        if (!this.respuestaCruda || !this.respuestaProcesada) return 0;
        const ratio = ((this.respuestaCruda.length - this.respuestaProcesada.length) / this.respuestaCruda.length * 100);
        return Math.round(ratio * 100) / 100;
    }
}
