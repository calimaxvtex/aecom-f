import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

// Servicios y modelos del módulo proyectos
import { ProyService } from '@/features/proy/services/proy.service';
import { ProyItem, CreateProyRequest, UpdateProyRequest, QueryProyRequest, ProyResponse } from '@/features/proy/proy.interfaces';

@Component({
    selector: 'app-proy-test',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        TableModule,
        ToastModule,
        TagModule,
        ProgressSpinnerModule
    ],
    providers: [MessageService],
    template: `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <!-- Panel de Pruebas -->
            <div class="lg:col-span-1 space-y-4">
                <p-card header="🧪 Pruebas del Servicio Proy">
                    <div class="space-y-4">

                        <!-- Test: Obtener Todos los Proyectos -->
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-3">📋 Obtener Todos los Proyectos</h3>
                            <p class="text-sm text-gray-600 mb-3">Prueba la funcionalidad de consulta general</p>
                            <p-button
                                label="🚀 Ejecutar Test"
                                icon="pi pi-play"
                                (onClick)="testGetAllProyectos()"
                                [loading]="loadingGetAll"
                                styleClass="p-button-primary w-full">
                            </p-button>
                        </div>

                        <!-- Test: Crear Proyecto -->
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-3">➕ Crear Proyecto de Prueba</h3>
                            <p class="text-sm text-gray-600 mb-3">Crea un proyecto de prueba para verificar la creación</p>
                            <p-button
                                label="🚀 Ejecutar Test"
                                icon="pi pi-plus"
                                (onClick)="testCreateProyecto()"
                                [loading]="loadingCreate"
                                styleClass="p-button-success w-full">
                            </p-button>
                        </div>

                        <!-- Test: Buscar Proyecto -->
                        <div class="border rounded-lg p-4">
                            <h3 class="text-lg font-semibold mb-3">🔍 Buscar Proyecto</h3>
                            <p class="text-sm text-gray-600 mb-3">Busca proyectos por descripción</p>
                            <input
                                pInputText
                                [(ngModel)]="searchQuery"
                                placeholder="Buscar por descripción..."
                                class="w-full mb-2"
                            />
                            <p-button
                                label="🔍 Buscar"
                                icon="pi pi-search"
                                (onClick)="testSearchProyectos()"
                                [loading]="loadingSearch"
                                [disabled]="!searchQuery.trim()"
                                styleClass="p-button-info w-full">
                            </p-button>
                        </div>

                        <!-- Test: Actualizar Proyecto -->
                        <div class="border rounded-lg p-4" *ngIf="proyectoParaActualizar">
                            <h3 class="text-lg font-semibold mb-3">✏️ Actualizar Proyecto</h3>
                            <p class="text-sm text-gray-600 mb-3">
                                Proyecto seleccionado: {{ proyectoParaActualizar.descripcion }}
                            </p>
                            <input
                                pInputText
                                [(ngModel)]="nuevaDescripcion"
                                placeholder="Nueva descripción..."
                                class="w-full mb-2"
                            />
                            <p-button
                                label="💾 Actualizar"
                                icon="pi pi-pencil"
                                (onClick)="testUpdateProyecto()"
                                [loading]="loadingUpdate"
                                [disabled]="!nuevaDescripcion.trim()"
                                styleClass="p-button-warning w-full">
                            </p-button>
                        </div>

                        <!-- Test: Eliminar Proyecto -->
                        <div class="border rounded-lg p-4" *ngIf="proyectoParaEliminar">
                            <h3 class="text-lg font-semibold mb-3">🗑️ Eliminar Proyecto</h3>
                            <p class="text-sm text-gray-600 mb-3 text-red-600">
                                ⚠️ ATENCIÓN: Esto eliminará el proyecto "{{ proyectoParaEliminar.descripcion }}"
                            </p>
                            <p-button
                                label="🗑️ Eliminar"
                                icon="pi pi-trash"
                                (onClick)="testDeleteProyecto()"
                                [loading]="loadingDelete"
                                styleClass="p-button-danger w-full">
                            </p-button>
                        </div>

                        <!-- Información del Endpoint -->
                        <div class="border rounded-lg p-4 bg-blue-50">
                            <h3 class="text-lg font-semibold mb-3">🔗 Información del Servicio</h3>
                            <div class="space-y-2 text-sm">
                                <div><strong>ID del Servicio:</strong> {{ serviceId }}</div>
                                <div><strong>Endpoint URL:</strong> {{ endpointUrl }}</div>
                                <div><strong>Estado del Servicio:</strong>
                                    <p-tag
                                        [value]="serviceStatus"
                                        [severity]="serviceStatus === 'Conectado' ? 'success' : 'danger'">
                                    </p-tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>

            <!-- Panel de Resultados -->
            <div class="lg:col-span-1">
                <p-card header="📊 Resultados de las Pruebas">
                    <!-- Información General -->
                    <div class="mb-4 flex items-center justify-between">
                        <div class="text-sm text-gray-600">
                            <strong>Total de Proyectos:</strong> {{ proyectos.length }}
                            <span *ngIf="ultimoTest" class="ml-2 text-blue-600">
                                | Último test: {{ ultimoTest }}
                            </span>
                        </div>
                        <p-button
                            icon="pi pi-refresh"
                            (onClick)="limpiarResultados()"
                            styleClass="p-button-sm p-button-outlined"
                            pTooltip="Limpiar resultados">
                        </p-button>
                    </div>

                    <!-- Loading -->
                    <div *ngIf="loadingGlobal" class="flex justify-center py-8">
                        <p-progressSpinner></p-progressSpinner>
                        <span class="ml-2">Ejecutando prueba...</span>
                    </div>

                    <!-- Tabla de Resultados -->
                    <p-table
                        *ngIf="!loadingGlobal && proyectos.length > 0"
                        [value]="proyectos"
                        [paginator]="true"
                        [rows]="5"
                        responsiveLayout="scroll"
                        selectionMode="single"
                        [(selection)]="proyectoSeleccionado"
                        (onRowSelect)="onProyectoSelect($event)"
                    >
                        <ng-template #header>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Estado</th>
                                <th>Usuario</th>
                                <th>Fecha</th>
                            </tr>
                        </ng-template>

                        <ng-template #body let-proyecto>
                            <tr [class.bg-blue-50]="proyecto === proyectoSeleccionado">
                                <td>{{proyecto.id_proy}}</td>
                                <td>{{proyecto.descripcion}}</td>
                                <td>
                                    <p-tag
                                        [value]="proyecto.estado === 'A' ? 'Activo' : 'Inactivo'"
                                        [severity]="proyecto.estado === 'A' ? 'success' : 'danger'">
                                    </p-tag>
                                </td>
                                <td>{{proyecto.usuario}}</td>
                                <td>{{proyecto.fecha | date:'shortDate'}}</td>
                            </tr>
                        </ng-template>
                    </p-table>

                    <!-- Mensaje cuando no hay resultados -->
                    <div *ngIf="!loadingGlobal && proyectos.length === 0" class="text-center py-8 text-gray-500">
                        <i class="pi pi-info-circle text-2xl mb-2 block"></i>
                        <div>No hay proyectos para mostrar</div>
                        <div class="text-sm">Ejecuta una prueba para ver resultados</div>
                    </div>

                    <!-- Detalles del Proyecto Seleccionado -->
                    <div *ngIf="proyectoSeleccionado" class="mt-4 p-4 bg-gray-50 rounded">
                        <h4 class="font-semibold mb-2">📋 Detalles del Proyecto Seleccionado</h4>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div><strong>ID:</strong> {{ proyectoSeleccionado.id_proy }}</div>
                            <div><strong>Nombre:</strong> {{ proyectoSeleccionado.descripcion }}</div>
                            <div><strong>Estado:</strong> {{ proyectoSeleccionado.estado }}</div>
                            <div><strong>Usuario:</strong> {{ proyectoSeleccionado.usuario }}</div>
                            <div><strong>Fecha:</strong> {{ proyectoSeleccionado.fecha }}</div>
                            <div><strong>Imagen:</strong> {{ proyectoSeleccionado.imagen }}</div>
                            <div><strong>Estado Alta:</strong> {{ proyectoSeleccionado.edo_Alta }}</div>
                        </div>
                    </div>
                </p-card>
            </div>
        </div>

        <p-toast></p-toast>
    `,
    styles: [`
        .p-card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
        }

        .p-card-body {
            padding: 1.5rem;
        }

        .bg-blue-50 {
            background-color: #eff6ff !important;
        }
    `]
})
export class ProyTestComponent implements OnInit {
    // Servicios
    private proyService = inject(ProyService);
    private messageService = inject(MessageService);

    // Estados de carga
    loadingGetAll = false;
    loadingCreate = false;
    loadingSearch = false;
    loadingUpdate = false;
    loadingDelete = false;
    loadingGlobal = false;

    // Datos
    proyectos: ProyItem[] = [];
    proyectoSeleccionado: ProyItem | null = null;
    proyectoParaActualizar: ProyItem | null = null;
    proyectoParaEliminar: ProyItem | null = null;

    // Información del servicio
    serviceId = 14;
    endpointUrl = '';
    serviceStatus = 'Desconocido';
    ultimoTest = '';

    // Formularios de prueba
    searchQuery = '';
    nuevaDescripcion = '';

    ngOnInit(): void {
        console.log('🚀 ProyTestComponent inicializado');
        this.verificarServicio();
    }

    // ========== VERIFICACIÓN DEL SERVICIO ==========

    private verificarServicio(): void {
        try {
            // Intentar obtener la URL del endpoint
            this.endpointUrl = this.proyService['getProyEndpoint']();
            this.serviceStatus = 'Conectado';
            console.log('✅ Servicio verificado correctamente');
        } catch (error) {
            console.error('❌ Error al verificar servicio:', error);
            this.serviceStatus = 'Error';
        }
    }

    // ========== TESTS DE FUNCIONALIDAD ==========

    testGetAllProyectos(): void {
        console.log('🧪 Ejecutando test: Obtener todos los proyectos');
        this.loadingGetAll = true;
        this.loadingGlobal = true;
        this.ultimoTest = 'Obtener Todos';

        this.proyService.getAllProyectos().subscribe({
            next: (response) => {
                console.log('✅ Test exitoso - Proyectos obtenidos:', response);
                this.proyectos = response.data || [];
                this.loadingGetAll = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Test Exitoso',
                    detail: `Se obtuvieron ${this.proyectos.length} proyectos`,
                    life: 3000
                });

                // Si hay proyectos, seleccionar el primero para actualizar/eliminar
                if (this.proyectos.length > 0) {
                    this.proyectoParaActualizar = this.proyectos[0];
                    this.proyectoParaEliminar = this.proyectos[this.proyectos.length - 1];
                    this.nuevaDescripcion = this.proyectoParaActualizar.descripcion + ' (MODIFICADO)';
                }
            },
            error: (error) => {
                console.error('❌ Test fallido - Error al obtener proyectos:', error);
                this.loadingGetAll = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Test Fallido',
                    detail: 'Error al obtener proyectos: ' + (error.message || 'Error desconocido'),
                    life: 5000
                });
            }
        });
    }

    testCreateProyecto(): void {
        console.log('🧪 Ejecutando test: Crear proyecto de prueba');
        this.loadingCreate = true;
        this.loadingGlobal = true;
        this.ultimoTest = 'Crear Proyecto';

        const fechaActual = new Date().toISOString().split('T')[0];
        const proyectoPrueba: CreateProyRequest = {
            action: 'IN',
            descripcion: `Proyecto de Prueba - ${new Date().toLocaleTimeString()}`,
            estado: 'A',
            usr: 'TEST_USER',
            id_session: 999,
            fecha: fechaActual,
            imagen: 0,
            edo_Alta: 1
        };

        console.log('📤 Enviando proyecto de prueba:', proyectoPrueba);

        this.proyService.createProyecto(proyectoPrueba).subscribe({
            next: (response) => {
                console.log('✅ Test exitoso - Proyecto creado:', response);
                this.loadingCreate = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Test Exitoso',
                    detail: 'Proyecto de prueba creado correctamente',
                    life: 3000
                });

                // Actualizar la lista de proyectos
                this.testGetAllProyectos();
            },
            error: (error) => {
                console.error('❌ Test fallido - Error al crear proyecto:', error);
                this.loadingCreate = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Test Fallido',
                    detail: 'Error al crear proyecto: ' + (error.message || 'Error desconocido'),
                    life: 5000
                });
            }
        });
    }

    testSearchProyectos(): void {
        if (!this.searchQuery.trim()) return;

        console.log('🧪 Ejecutando test: Buscar proyectos');
        this.loadingSearch = true;
        this.loadingGlobal = true;
        this.ultimoTest = 'Buscar Proyectos';

        this.proyService.searchProyectos(this.searchQuery).subscribe({
            next: (response) => {
                console.log('✅ Test exitoso - Búsqueda completada:', response);
                this.proyectos = response.data || [];
                this.loadingSearch = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Test Exitoso',
                    detail: `Búsqueda completada: ${this.proyectos.length} resultados`,
                    life: 3000
                });
            },
            error: (error) => {
                console.error('❌ Test fallido - Error en búsqueda:', error);
                this.loadingSearch = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Test Fallido',
                    detail: 'Error en búsqueda: ' + (error.message || 'Error desconocido'),
                    life: 5000
                });
            }
        });
    }

    testUpdateProyecto(): void {
        if (!this.proyectoParaActualizar || !this.nuevaDescripcion.trim()) return;

        console.log('🧪 Ejecutando test: Actualizar proyecto');
        this.loadingUpdate = true;
        this.loadingGlobal = true;
        this.ultimoTest = 'Actualizar Proyecto';

        const proyectoActualizado: UpdateProyRequest = {
            action: 'UP',
            id_proy: this.proyectoParaActualizar.id_proy,
            descripcion: this.nuevaDescripcion,
            usr: this.proyectoParaActualizar.usuario,
            id_session: 0
        };

        console.log('📤 Actualizando proyecto:', proyectoActualizado);

        this.proyService.updateProyecto(proyectoActualizado).subscribe({
            next: (response) => {
                console.log('✅ Test exitoso - Proyecto actualizado:', response);
                this.loadingUpdate = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Test Exitoso',
                    detail: 'Proyecto actualizado correctamente',
                    life: 3000
                });

                // Actualizar la lista de proyectos
                this.testGetAllProyectos();
            },
            error: (error) => {
                console.error('❌ Test fallido - Error al actualizar proyecto:', error);
                this.loadingUpdate = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Test Fallido',
                    detail: 'Error al actualizar proyecto: ' + (error.message || 'Error desconocido'),
                    life: 5000
                });
            }
        });
    }

    testDeleteProyecto(): void {
        if (!this.proyectoParaEliminar) return;

        console.log('🧪 Ejecutando test: Eliminar proyecto');
        this.loadingDelete = true;
        this.loadingGlobal = true;
        this.ultimoTest = 'Eliminar Proyecto';

        this.proyService.deleteProyecto(this.proyectoParaEliminar.id_proy).subscribe({
            next: (response) => {
                console.log('✅ Test exitoso - Proyecto eliminado:', response);
                this.loadingDelete = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Test Exitoso',
                    detail: 'Proyecto eliminado correctamente',
                    life: 3000
                });

                // Limpiar selecciones
                this.proyectoParaActualizar = null;
                this.proyectoParaEliminar = null;

                // Actualizar la lista de proyectos
                this.testGetAllProyectos();
            },
            error: (error) => {
                console.error('❌ Test fallido - Error al eliminar proyecto:', error);
                this.loadingDelete = false;
                this.loadingGlobal = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Test Fallido',
                    detail: 'Error al eliminar proyecto: ' + (error.message || 'Error desconocido'),
                    life: 5000
                });
            }
        });
    }

    // ========== UTILIDADES ==========

    onProyectoSelect(event: any): void {
        console.log('📋 Proyecto seleccionado:', event.data);
        this.proyectoSeleccionado = event.data;
    }

    limpiarResultados(): void {
        this.proyectos = [];
        this.proyectoSeleccionado = null;
        this.proyectoParaActualizar = null;
        this.proyectoParaEliminar = null;
        this.searchQuery = '';
        this.nuevaDescripcion = '';
        this.ultimoTest = '';
    }
}
