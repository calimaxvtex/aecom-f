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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios para obtener componentes disponibles
import { CompService } from '../../../features/comp/services/comp.service';
import { Componente } from '../../../features/comp/models/comp.interface';

// Servicios para detalles de página (componentes asociados)
import { PaginaDetService } from '../../../features/paginas/services/pagina-det.service';
import { PaginaDet } from '../../../features/paginas/models/pagina-det.interface';

// Interfaz para componentes disponibles por tipo
interface ComponenteSimple {
    id: number;
    nombre: string;
}

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
        SelectModule,
        ConfirmDialogModule
    ],
    providers: [MessageService, ConfirmationService],
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
    private confirmationService = inject(ConfirmationService);
    private paginaDetServiceModal = inject(PaginaDetService); // Para consultas del modal

    // Datos - COMPONENTES ASOCIADOS A LA PÁGINA SELECCIONADA
    componentes: PaginaDet[] = [];

    // Estados de carga
    loadingComponentes = false;
    guardando = false;
    eliminando = false;

    // Estados de modales
    mostrarModalAgregar = false;
    showConfirmDeleteComponente = false;

    // Componente seleccionado para eliminación
    componenteToDelete: PaginaDet | null = null;

    // Datos para el modal de agregar componente
    componentesDisponibles: ComponenteSimple[] = [];
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


    // ========== FUNCIONALIDAD MODAL AGREGAR COMPONENTE ==========

    /**
     * Método legacy - ya no se usa. Los componentes se cargan dinámicamente al seleccionar tipo.
     */
    private cargarComponentesDisponibles(): void {
        // Este método ya no se utiliza - los componentes se cargan dinámicamente
        // en onTipoComponenteChange() cuando el usuario selecciona un tipo
        console.log('⚠️ cargarComponentesDisponibles() - método legacy, no utilizado');
    }

    /**
     * Maneja el cambio de selección del tipo de componente en el modal
     * Consulta el servicio con el payload dinámico según el tipo seleccionado
     */
    onTipoComponenteChange(): void {
        const tipoSeleccionado = this.nuevoComponente.tipo_comp;

        if (!tipoSeleccionado) {
            console.log('📋 Tipo de componente no seleccionado - limpiando lista');
            this.componentesDisponibles = [];
            this.nuevoComponente.id_ref = 0;
            return;
        }

        console.log('🔄 Usuario cambió tipo de componente a:', tipoSeleccionado);

        // Limpiar selección anterior
        this.nuevoComponente.id_ref = 0;

        // Consultar servicio con payload dinámico
        this.paginaDetServiceModal.getComponentesPorTipo(tipoSeleccionado).subscribe({
            next: (response) => {
                console.log('✅ Componentes obtenidos para tipo', tipoSeleccionado + ':', response.data?.length || 0, 'componentes');
                this.componentesDisponibles = response.data || [];
            },
            error: (error) => {
                console.error('❌ Error al obtener componentes para tipo', tipoSeleccionado + ':', error);
                this.componentesDisponibles = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Error al cargar componentes de tipo ${tipoSeleccionado}`
                });
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

    // ========== FUNCIONALIDAD ELIMINAR COMPONENTE ==========

    /**
     * Inicia el proceso de eliminación mostrando el modal de confirmación
     */
    eliminarComponente(componente: PaginaDet): void {
        this.componenteToDelete = componente;
        this.showConfirmDeleteComponente = true;
    }

    /**
     * Confirma la eliminación del componente
     */
    confirmDeleteComponente(): void {
        if (this.componenteToDelete && this.paginaSeleccionada) {
            this.eliminando = true;

            console.log('🗑️ Eliminando componente:', this.componenteToDelete.nombre_ref, 'de página:', this.paginaSeleccionada.nombre);

            this.paginaDetService.deletePaginaDet(this.componenteToDelete.id_pagd, this.paginaSeleccionada.id_pag)
                .subscribe({
                    next: (response) => {
                        console.log('✅ Componente eliminado exitosamente:', response);

                        // Mostrar mensaje de éxito
                        const mensaje = response.mensaje || 'Componente eliminado de la página';
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: mensaje,
                            life: 5000
                        });

                        // Cerrar modal y recargar lista
                        this.cancelDeleteComponente();
                        this.filtrarComponentesPorPagina();
                    },
                    error: (error) => {
                        console.error('❌ Error al eliminar componente:', error);

                        // Mostrar mensaje de error
                        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el componente';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error al eliminar',
                            detail: errorMessage,
                            life: 5000
                        });

                        this.eliminando = false;
                    }
                });
        }
    }

    /**
     * Cancela la eliminación del componente
     */
    cancelDeleteComponente(): void {
        this.showConfirmDeleteComponente = false;
        this.componenteToDelete = null;
        this.eliminando = false;
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
