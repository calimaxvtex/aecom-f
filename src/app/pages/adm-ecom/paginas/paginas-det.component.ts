import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, inject, Input, HostListener, ChangeDetectorRef } from '@angular/core';
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
    private cdr = inject(ChangeDetectorRef);

    // Datos - COMPONENTES ASOCIADOS A LA PÁGINA SELECCIONADA
    componentes: PaginaDet[] = [];
    componentesOriginal: PaginaDet[] = [];

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

    // ========== PROPIEDADES PARA REORDENAMIENTO ==========

    // Estados de reordenamiento
    reordenando = false;

    // ========== PROPIEDADES PARA EDICIÓN INLINE ==========

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;
    hasChanges: boolean = false;
    isTransitioningFields = false;
    componentesDisponiblesInline: ComponenteSimple[] = []; // Componentes disponibles para edición inline

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

                        // ✅ FILTRAR: Solo componentes de la página seleccionada (medida de seguridad)
                        const idPaginaSeleccionada = this.paginaSeleccionada?.id_pag;
                        const componentesFiltrados = (response.data || []).filter(
                            componente => componente.id_pag === idPaginaSeleccionada
                        );

                        console.log(`🔍 Componentes filtrados por id_pag=${idPaginaSeleccionada}:`, componentesFiltrados.length, 'de', response.data?.length || 0);

                        // Ordenar componentes por el campo 'orden' antes de asignar
                        const componentesOrdenados = componentesFiltrados.sort((a, b) => a.orden - b.orden);
                        this.componentes = componentesOrdenados;
                        this.componentesOriginal = this.componentes;

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
     * Consulta el servicio de componentes (CompService) para obtener componentes disponibles por tipo
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

        // ✅ Limpiar lista ANTES de cargar nuevos datos
        this.componentesDisponibles = [];
        this.nuevoComponente.id_ref = 0;

        // ✅ Usar PaginaDetService para obtener componentes disponibles por tipo
        // Este servicio usa el endpoint correcto (paginas_det) con el payload especificado
        this.paginaDetService.getComponentesPorTipo(tipoSeleccionado).subscribe({
            next: (response) => {
                console.log('✅ Componentes obtenidos para tipo', tipoSeleccionado + ':', response.data?.length || 0, 'componentes');
                console.log('📋 Estructura de respuesta:', response);

                // La respuesta del endpoint paginas_det puede tener diferentes estructuras
                // Verificar y mapear según la estructura recibida
                let componentesData: any[] = [];

                if (response.data && Array.isArray(response.data)) {
                    componentesData = response.data;
                } else if (response.data) {
                    componentesData = [response.data];
                }

                // Mapear a ComponenteSimple[] según la estructura recibida
                // Puede venir con id_comp/nombre o id_ref/nombre_ref
                this.componentesDisponibles = componentesData.map((item: any) => {
                    // Intentar diferentes estructuras posibles
                    if (item.id_comp && item.nombre) {
                        return { id: item.id_comp, nombre: item.nombre };
                    } else if (item.id_ref && item.nombre_ref) {
                        return { id: item.id_ref, nombre: item.nombre_ref };
                    } else if (item.id && item.nombre) {
                        return { id: item.id, nombre: item.nombre };
                    } else {
                        console.warn('⚠️ Estructura de componente desconocida:', item);
                        return { id: item.id || 0, nombre: item.nombre || item.nombre_ref || 'Sin nombre' };
                    }
                }).filter(item => item.id > 0); // Filtrar items inválidos

                console.log('📋 Componentes mapeados:', this.componentesDisponibles.length, 'componentes disponibles');
                console.log('📋 Lista de componentes:', this.componentesDisponibles);
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

    // ========== REORDENAMIENTO CON DRAG & DROP ==========

    /**
     * Maneja el reordenamiento de filas mediante drag & drop
     */
    onRowReorder(event: any): void {
        const dragIndex = event.dragIndex;
        const dropIndex = event.dropIndex;

        if (dragIndex !== undefined && dropIndex !== undefined) {
            const componentes = [...this.componentes];

            const draggedItem = componentes.splice(dropIndex, 1)[0];

            const newOrder = dropIndex + 1;
            const idPagd = draggedItem.id_pagd;

            this.updateComponenteOrderInServer(idPagd, newOrder);

            componentes.splice(dropIndex, 0, draggedItem);

            componentes.map((item, index) => {
                item.orden = index + 1;
            });
        }
    }

    /**
     * Actualiza el orden de un componente individual en el servidor
     * Usa action: 'UPO' según especificación del backend
     */
    private updateComponenteOrderInServer(idPagd: number, orden: number): void {
        if (!this.paginaSeleccionada) {
            return;
        }

        this.reordenando = true;

        this.paginaDetService.updateComponenteOrder(
            this.paginaSeleccionada.id_pag,
            idPagd,
            orden
        ).subscribe({
            next: (response) => {
                this.reordenando = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Orden actualizado',
                    detail: 'Orden del componente actualizado correctamente',
                    life: 3000
                });
            },
            error: (error) => {
                console.error('❌ Error al actualizar orden:', error);
                this.reordenando = false;

                // Recargar datos para revertir cambios visuales
                this.filtrarComponentesPorPagina();

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar el orden del componente',
                    life: 5000
                });
            }
        });
    }

    /**
     * Actualiza el orden de múltiples componentes en el servidor (para reordenamiento grupal)
     * @deprecated Usar updateComponenteOrderInServer para actualizaciones individuales
     */
    private updateComponentesOrderInServer(itemsPayload: { id_pagd: number, orden: number }[]): void {
        if (!this.paginaSeleccionada || itemsPayload.length === 0) {
            return;
        }

        this.reordenando = true;

        this.paginaDetService.updateComponentesOrder(
            this.paginaSeleccionada.id_pag,
            itemsPayload
        ).subscribe({
            next: (response) => {
                this.reordenando = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Orden actualizado',
                    detail: `Orden de ${itemsPayload.length} componente(s) actualizado correctamente`,
                    life: 3000
                });
            },
            error: (error) => {
                console.error('❌ Error al actualizar orden:', error);
                this.reordenando = false;

                // Recargar datos para revertir cambios visuales
                this.filtrarComponentesPorPagina();

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar el orden de los componentes',
                    life: 5000
                });
            }
        });
    }

    // ========== CONTROLES DE ORDEN INDIVIDUAL ==========

    /**
     * Mueve un componente hacia arriba (reduce su orden)
     */
    moveOrderUp(componente: PaginaDet): void {
        if (componente.orden > 1) {
            const newOrder = componente.orden - 1;
            this.updateComponenteOrder(componente, newOrder);
        }
    }

    /**
     * Mueve un componente hacia abajo (aumenta su orden)
     */
    moveOrderDown(componente: PaginaDet): void {
        const maxOrder = Math.max(...this.componentes.map(item => item.orden));
        if (componente.orden < maxOrder) {
            const newOrder = componente.orden + 1;
            this.updateComponenteOrder(componente, newOrder);
        }
    }

    /**
     * Actualiza el orden de un componente individual
     * Recalcula todos los órdenes localmente y envía solo el componente movido al servidor
     */
    private updateComponenteOrder(componente: PaginaDet, newOrder: number): void {
        console.log('🔄 ENTRA updateComponenteOrder');
        // Crear copia del array ordenado
        const reorderedItems = [...this.componentes].sort((a, b) => a.orden - b.orden);

        // Encontrar índices
        const currentIndex = reorderedItems.findIndex(item => item.id_pagd === componente.id_pagd);
        const targetIndex = newOrder - 1; // Convertir orden (base 1) a índice (base 0)

        if (currentIndex === -1 || targetIndex < 0 || targetIndex >= reorderedItems.length) {
            return;
        }

        // Mover el elemento a la nueva posición
        const [movedItem] = reorderedItems.splice(currentIndex, 1);
        reorderedItems.splice(targetIndex, 0, movedItem);

        // Recalcular todos los órdenes secuencialmente (solo localmente)
        reorderedItems.forEach((item, index) => {
            item.orden = index + 1;
        });

        // Actualizar array local
        this.componentes = reorderedItems;

        // ✅ Enviar solo el componente movido con action: 'UPO'
        this.updateComponenteOrderInServer(movedItem.id_pagd, newOrder);
    }

    // ========== EDICIÓN INLINE ==========

    /**
     * Maneja clics fuera del contenedor de edición inline para cancelar
     */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        if (this.editingCell && this.editingCell.includes('-id_ref')) {
            const target = event.target as HTMLElement;
            const editContainer = target.closest('.inline-edit-container');

            if (!editContainer) {
                console.log('🔄 Clic fuera del contenedor de edición - cancelando edición');
                this.cancelInlineEditByBlur();
            }
        }
    }

    /**
     * Inicia la edición inline del campo nombre componente (id_ref)
     */
    editInlineComponente(componente: PaginaDet): void {
        const newEditingCell = componente.id_pagd + '-id_ref';

        // Si ya estamos editando otro campo y hay cambios pendientes
        if (this.editingCell && this.hasChanges && this.editingCell !== newEditingCell) {
            console.warn('⚠️ Cambiando de campo con cambios pendientes - cancelando edición anterior');
            this.cancelInlineEdit();
        }

        this.isTransitioningFields = true;
        this.editingCell = newEditingCell;
        this.originalValue = componente.id_ref;
        this.hasChanges = false;

        console.log(`✏️ Iniciando edición inline de componente:`, {
            id_pagd: componente.id_pagd,
            tipo_comp: componente.tipo_comp,
            id_ref_original: this.originalValue
        });

        // Cargar componentes disponibles según el tipo
        this.componentesDisponiblesInline = [];
        this.paginaDetService.getComponentesPorTipo(componente.tipo_comp).subscribe({
            next: (response) => {
                console.log('✅ Componentes obtenidos para edición inline:', response.data?.length || 0);

                // Mapear la respuesta a ComponenteSimple[]
                this.componentesDisponiblesInline = (response.data || []).map((item: any) => {
                    if (item.id_comp && item.nombre) {
                        return { id: item.id_comp, nombre: item.nombre };
                    } else if (item.id_ref && item.nombre_ref) {
                        return { id: item.id_ref, nombre: item.nombre_ref };
                    } else if (item.id && item.nombre) {
                        return { id: item.id, nombre: item.nombre };
                    }
                    return { id: 0, nombre: 'Desconocido' };
                }).filter((item: ComponenteSimple) => item.id !== 0);

                console.log('📋 Componentes disponibles para edición inline:', this.componentesDisponiblesInline.length);

                // Enfocar el select después de cargar los datos
                setTimeout(() => {
                    const selectElement = document.querySelector(`[aria-label="id_ref-${componente.id_pagd}"]`) as HTMLElement;
                    if (selectElement) {
                        const inputElement = selectElement.querySelector('input') as HTMLInputElement;
                        if (inputElement) {
                            inputElement.focus();
                        }
                    }
                    this.isTransitioningFields = false;
                }, 100);
            },
            error: (error) => {
                console.error('❌ Error al obtener componentes para edición inline:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar componentes disponibles'
                });
                this.cancelInlineEdit();
            }
        });
    }

    /**
     * Detecta cambios en el select durante la edición inline
     */
    onInputChange(componente: PaginaDet): void {
        this.hasChanges = componente.id_ref !== this.originalValue;
    }

    /**
     * Guarda la edición inline del componente
     */
    saveInlineEditComponente(componente: PaginaDet): void {
        console.log('💾 Guardando edición inline de componente:', {
            id_pagd: componente.id_pagd,
            id_ref_nuevo: componente.id_ref,
            id_ref_original: this.originalValue
        });

        if (componente.id_ref === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando');
            this.cancelInlineEdit();
            return;
        }

        this.guardando = true;

        this.paginaDetService.updateComponenteRef(componente.id_pagd, componente.id_ref).subscribe({
            next: (response) => {
                console.log('✅ Componente actualizado:', response);

                // Actualizar el nombre del componente en el objeto local
                if (response.data) {
                    const componenteActualizado = response.data;
                    const index = this.componentes.findIndex(c => c.id_pagd === componente.id_pagd);
                    if (index !== -1) {
                        this.componentes[index].id_ref = componenteActualizado.id_ref;
                        this.componentes[index].nombre_ref = componenteActualizado.nombre_ref;
                    }
                }

                this.editingCell = null;
                this.originalValue = null;
                this.hasChanges = false;
                this.isTransitioningFields = false;
                this.guardando = false;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Componente Actualizado',
                    detail: 'El componente referenciado ha sido actualizado correctamente'
                });
            },
            error: (error: any) => {
                console.error('❌ Error al actualizar componente:', error);

                // Revertir el cambio local
                componente.id_ref = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;
                this.hasChanges = false;
                this.guardando = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al actualizar el componente referenciado',
                    life: 5000
                });
            }
        });
    }

    /**
     * Cancela la edición inline por blur (clic fuera)
     */
    cancelInlineEditByBlur(): void {
        setTimeout(() => {
            if (this.isTransitioningFields) {
                console.log('🔄 Blur durante transición - ignorando');
                return;
            }

            if (this.editingCell) {
                console.log('🔄 Ejecutando blur - restaurando valor original');

                const [idPagd, field] = this.editingCell.split('-');
                const componente = this.componentes.find(c => c.id_pagd === parseInt(idPagd));

                if (componente && field === 'id_ref') {
                    componente.id_ref = this.originalValue;
                    this.cdr.detectChanges();
                    setTimeout(() => this.cdr.detectChanges(), 0);
                    setTimeout(() => this.cdr.detectChanges(), 10);
                }

                this.editingCell = null;
                this.originalValue = null;
                this.hasChanges = false;
                this.isTransitioningFields = false;
                this.componentesDisponiblesInline = [];
            }
        }, 150);
    }

    /**
     * Cancela la edición inline
     */
    cancelInlineEdit(): void {
        console.log('🔄 Cancelando edición inline:', this.editingCell, 'hasChanges:', this.hasChanges);

        if (this.editingCell && this.hasChanges) {
            const [idPagd, field] = this.editingCell.split('-');
            const componente = this.componentes.find(c => c.id_pagd === parseInt(idPagd));

            if (componente && field === 'id_ref') {
                componente.id_ref = this.originalValue;
                this.cdr.detectChanges();
                setTimeout(() => this.cdr.detectChanges(), 0);
                setTimeout(() => this.cdr.detectChanges(), 10);
            }
        }

        this.editingCell = null;
        this.originalValue = null;
        this.hasChanges = false;
        this.isTransitioningFields = false;
        this.componentesDisponiblesInline = [];
    }

}
