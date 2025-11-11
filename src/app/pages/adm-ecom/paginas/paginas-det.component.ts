import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

// Servicios para obtener componentes disponibles
import { CompService } from '../../../features/comp/services/comp.service';
import { Componente } from '../../../features/comp/models/comp.interface';

// Servicios para detalles de página (componentes asociados)
import { PaginaDetService } from '../../../features/paginas/services/pagina-det.service';
import { PaginaDet } from '../../../features/paginas/models/pagina-det.interface';

// Interfaces para comunicación padre-hijo
import { Pagina } from '../../../features/paginas';

@Component({
    selector: 'app-paginas-det',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        TagModule,
        CardModule,
        TooltipModule,
        DialogModule,
        SelectModule
    ],
    providers: [MessageService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './paginas-det.component.html',
    styleUrls: ['./paginas-det.component.scss']
})

export class PaginasDetComponent implements OnInit, OnDestroy, OnChanges {
    // Input para comunicación padre-hijo (PATRÓN TAB_PADRE_HIJO)
    @Input() paginaSeleccionada: Pagina | null = null;

    // Servicios inyectados
    private paginaDetService = inject(PaginaDetService);
    private compService = inject(CompService);
    private messageService = inject(MessageService);

    // Datos - COMPONENTES ASOCIADOS A LA PÁGINA SELECCIONADA
    componentes: PaginaDet[] = [];

    // Estados de carga
    loadingComponentes = false;
    guardando = false;

    // Estados de modales
    mostrarModalAgregar = false;

    // Datos para el modal de agregar componente
    componentesDisponibles: Componente[] = [];
    nuevoComponente: { tipo_comp: string; id_ref: number } = { tipo_comp: '', id_ref: 0 };

    // Opciones para los selects
    tiposComponenteOptions: { label: string; value: string }[] = [
        { label: 'Carrusel', value: 'carrusel' },
        { label: 'Categorías', value: 'categoria' },
        { label: 'Vitrina', value: 'vitrina' }
    ];

    // Filtro por canal
    canalFiltroSeleccionado: string = '';
    canalesOptions: { label: string; value: string }[] = [
        { label: 'Web', value: 'WEB' },
        { label: 'App', value: 'APP' }
    ];

    constructor() {
        console.log('🏗️ PaginasDetComponent inicializado');
    }

    ngOnInit(): void {
        console.log('🚀 Cargando página de componentes');
        // No cargar nada inicialmente - esperar selección de página
    }

    ngOnDestroy(): void {
        console.log('🗑️ PaginasDetComponent destruido');
    }

    // ========== CICLO DE VIDA: CAMBIOS EN INPUTS ==========

    /**
     * Detecta cambios en la página seleccionada y filtra componentes automáticamente
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['paginaSeleccionada']) {
            console.log('🔄 Cambió página seleccionada:', this.paginaSeleccionada);
            this.filtrarComponentesPorPagina();
            // También cargar componentes disponibles para el modal de agregar
            if (this.paginaSeleccionada) {
                this.cargarComponentesDisponibles();
            }
        }
    }

    // ========== MÉTODOS DE CARGA ==========

    /**
     * Obtiene componentes asociados a la página seleccionada
     * Según especificación: consulta con payload { action: "SL", id_pag, usr, id_session }
     */
    filtrarComponentesPorPagina(): void {
        if (this.paginaSeleccionada) {
            console.log('🎯 Consultando componentes asociados a página:', this.paginaSeleccionada.nombre);
            console.log('📊 ID de página:', this.paginaSeleccionada.id_pag);
            console.log('📊 Canal de la página:', this.paginaSeleccionada.canal);

            // ✅ Usar el nuevo servicio con el payload especificado
            this.loadingComponentes = true;

            this.paginaDetService.getComponentesByPagina(this.paginaSeleccionada.id_pag)
                .subscribe({
                    next: (response) => {
                        console.log('✅ Componentes asociados obtenidos:', response.data?.length || 0);
                        console.log('📋 Datos de ejemplo esperado:');
                        console.log('📋 id_pagd, id_pag, orden, tipo_comp, id_ref, nomPagina, canal, nombre_ref');

                        this.componentes = response.data || [];
                        this.loadingComponentes = false;
                    },
                    error: (error) => {
                        console.error('❌ Error al obtener componentes de la página:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al cargar componentes asociados a la página'
                        });
                        this.componentes = [];
                        this.loadingComponentes = false;
                    }
                });
        } else {
            console.log('📋 Sin página seleccionada - lista vacía');
            this.componentes = []; // Lista vacía cuando no hay página seleccionada
        }
    }

    // ========== MÉTODOS DE UTILIDAD PARA UI ==========

    /**
     * Obtiene el color CSS para el tipo de componente
     */
    getTipoColor(tipoComp: string): string {
        const colores: { [key: string]: string } = {
            'carrusel': 'text-blue-600',
            'categoria': 'text-orange-600',
            'vitrina': 'text-purple-600'
        };
        return colores[tipoComp] || 'text-gray-500';
    }

    /**
     * Acción para ver detalles del componente
     */
    verDetalleComponente(componente: PaginaDet): void {
        console.log('👁️ Ver detalles del componente:', componente);
        // TODO: Implementar navegación o modal de detalles
        this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: `Ver detalles del componente: ${componente.nombre_ref}`
        });
    }

    /**
     * Acción para ir al componente (navegación)
     */
    irAComponente(componente: PaginaDet): void {
        console.log('🔗 Ir al componente:', componente);
        // TODO: Implementar navegación al módulo de componentes
        this.messageService.add({
            severity: 'info',
            summary: 'Navegación',
            detail: `Ir al componente ID: ${componente.id_ref}`
        });
    }

    // ========== FUNCIONALIDAD MODAL AGREGAR COMPONENTE ==========

    /**
     * Carga los componentes disponibles para agregar a la página
     */
    private cargarComponentesDisponibles(): void {
        if (!this.paginaSeleccionada) return;

        console.log('📋 Cargando componentes disponibles para canal:', this.paginaSeleccionada.canal);

        this.compService.getComponentesByCanal(this.paginaSeleccionada.canal).subscribe({
            next: (response) => {
                this.componentesDisponibles = response.data || [];
                console.log('✅ Componentes disponibles cargados:', this.componentesDisponibles.length);
            },
            error: (error) => {
                console.error('❌ Error al cargar componentes disponibles:', error);
                this.componentesDisponibles = [];
            }
        });
    }

    /**
     * Abre el modal para agregar un componente a la página
     */
    abrirModalAgregarComponente(): void {
        if (!this.paginaSeleccionada) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debe seleccionar una página primero'
            });
            return;
        }

        console.log('📝 Abriendo modal para agregar componente a página:', this.paginaSeleccionada.nombre);

        // Resetear el formulario
        this.nuevoComponente = { tipo_comp: '', id_ref: 0 };
        this.mostrarModalAgregar = true;
    }

    /**
     * Cierra el modal de agregar componente
     */
    cerrarModalAgregar(): void {
        console.log('❌ Cerrando modal de agregar componente');
        this.mostrarModalAgregar = false;
        this.nuevoComponente = { tipo_comp: '', id_ref: 0 };
    }

    /**
     * Agrega el componente seleccionado a la página
     */
    agregarComponente(): void {
        if (!this.paginaSeleccionada || !this.nuevoComponente.tipo_comp || !this.nuevoComponente.id_ref) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Datos incompletos',
                detail: 'Por favor complete todos los campos requeridos'
            });
            return;
        }

        this.guardando = true;

        const componenteAAgregar = {
            id_pag: this.paginaSeleccionada.id_pag,
            tipo_comp: this.nuevoComponente.tipo_comp,
            id_ref: this.nuevoComponente.id_ref
        };

        console.log('➕ Agregando componente a página:', componenteAAgregar);

        this.paginaDetService.agregarComponenteAPagina(componenteAAgregar).subscribe({
            next: (response) => {
                console.log('✅ Componente agregado exitosamente:', response);

                // Mostrar mensaje de éxito con el id_pagd
                const mensaje = response.mensaje || 'Componente agregado exitosamente';
                const idPagd = response.data?.id_pagd;
                const mensajeCompleto = idPagd ? `${mensaje} (ID: ${idPagd})` : mensaje;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: mensajeCompleto,
                    life: 5000
                });

                // Cerrar modal y recargar la lista
                this.cerrarModalAgregar();
                this.filtrarComponentesPorPagina();
            },
            error: (error) => {
                console.error('❌ Error al agregar componente:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al agregar el componente a la página'
                });
            },
            complete: () => {
                this.guardando = false;
            }
        });
    }

    /**
     * Formatea la fecha para display
     */
    formatDate(dateString: string): string {
        try {
            return new Date(dateString).toLocaleDateString('es-ES');
        } catch {
            return dateString;
        }
    }
}
