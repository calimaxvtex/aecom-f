import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios específicos del dominio
import {
    PaginaService,
    Pagina,
    CreatePaginaRequest,
    UpdatePaginaRequest,
    PaginaStats
} from '../../../features/paginas';

// Componentes locales
import { PaginasDetComponent } from './paginas-det.component';

@Component({
    selector: 'app-paginas',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TabsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        ToggleSwitchModule,
        CardModule,
        SkeletonModule,
        TooltipModule,
        // Componentes locales
        PaginasDetComponent
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './paginas.component.html',
    styleUrls: ['./paginas.component.scss']
})

export class PaginasComponent implements OnInit, OnDestroy {
    // Servicios inyectados
    private paginaService = inject(PaginaService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private cdr = inject(ChangeDetectorRef);

    // Datos
    paginas: Pagina[] = [];
    paginaParaEliminar: Pagina | null = null;

    // Estados de carga
    loadingPaginas = false;
    guardando = false;
    eliminando = false;

    // Estados de modales
    mostrarModal = false;
    mostrarConfirmDelete = false;

    // Formularios
    paginaForm!: FormGroup;

    // Filtros
    filtroEstado: number | null = null;
    filtroBusqueda: string = '';

    // Edición inline
    editingCell: string = '';
    hasChanges: boolean = false;
    originalValue: any = null;
    isTransitioningFields = false;

    // Control de estado temporal del ToggleSwitch
    toggleStates: { [key: string]: boolean } = {};

    // ===== PROPIEDADES PARA SISTEMA DE TABS =====
    activeTabIndex = 0; // Tab activo por defecto
    paginaSeleccionada: Pagina | null = null; // Página seleccionada para filtrado de componentes

    estadisticas: PaginaStats = {
        total: 0,
        activas: 0,
        inactivas: 0,
        porCanal: { WEB: 0, APP: 0 }
    };

    // Filtro por canal (estilo banners) - Fijado en APP por defecto
    canalFiltroSeleccionado: string = 'APP';
    canalesOptions: { label: string; value: string }[] = [
        { label: 'App', value: 'APP' },
        { label: 'Web', value: 'WEB' }
    ];


    estados = [
        { label: 'Activo', value: 1 },
        { label: 'Inactivo', value: 0 }
    ];

    // Método para manejar clics fuera de los campos editables inline
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        // Solo procesar si estamos editando algún campo inline
        if (this.editingCell && (this.editingCell.includes('-nombre') || this.editingCell.includes('-canal'))) {
            const target = event.target as HTMLElement;

            // Verificar si el clic fue dentro del contenedor de edición o elementos relacionados con p-select
            const editContainer = target.closest('.inline-edit-container');
            const pSelectPanel = target.closest('.p-select-panel'); // Panel del dropdown de p-select
            const pSelect = target.closest('.p-select'); // El propio p-select

            // Si el clic no fue dentro del contenedor de edición, ni en el p-select, ni en su panel, cancelar edición
            if (!editContainer && !pSelect && !pSelectPanel) {
                console.log('🔄 Clic fuera del contenedor de edición - cancelando edición');
                this.cancelInlineEdit();
            }
        }
    }

    constructor() {
        console.log('📄 PaginasComponent inicializado');
        this.inicializarFormulario();
    }

    ngOnInit(): void {
        console.log('🚀 Cargando página de páginas');
        this.cargarPaginas();
    }

    ngOnDestroy(): void {
        console.log('🗑️ PaginasComponent destruido');
    }

    // ========== MÉTODOS DE CARGA ==========

    /**
     * Carga todas las páginas desde el servicio
     */
    cargarPaginas(): void {
        console.log('📋 Cargando páginas...');
        this.loadingPaginas = true;

        // Preparar filtros
        const filtros: any = {};
        if (this.canalFiltroSeleccionado) {
            filtros.canal = this.canalFiltroSeleccionado;
        }

        this.paginaService.getAllPaginas(filtros).subscribe({
            next: (response) => {
                console.log('✅ Páginas cargadas:', response.data.length);
                this.paginas = [...response.data]; // Crear nueva referencia
                this.loadingPaginas = false;
            },
            error: (error) => {
                console.error('❌ Error al cargar páginas:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las páginas'
                });
                this.loadingPaginas = false;
            }
        });
    }

    // ========== MÉTODOS DE FORMULARIO ==========

    /**
     * Inicializa el formulario reactivo
     */
    private inicializarFormulario(): void {
        this.paginaForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            canal: ['WEB', [Validators.required]] // Canal requerido con valor por defecto WEB
        });
    }

    /**
     * Abre modal para crear nueva página
     */
    abrirModalCrear(): void {
        console.log('➕ Abriendo modal para crear página');

        this.paginaForm.reset({
            nombre: '',
            canal: 'WEB' // Valor por defecto para canal
        });

        this.mostrarModal = true;
    }


    /**
     * Cierra el modal y resetea el formulario
     */
    cerrarModal(): void {
        console.log('❌ Cerrando modal');
        this.mostrarModal = false;
        this.paginaForm.reset();
    }

    // ========== MÉTODOS CRUD ==========

    /**
     * Crea una nueva página
     */
    guardar(): void {
        if (this.paginaForm.invalid) {
            console.log('⚠️ Formulario inválido');
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario incompleto',
                detail: 'Por favor complete todos los campos requeridos'
            });
            return;
        }

        this.guardando = true;
        const formValue = this.paginaForm.value;

        console.log('💾 Creando página:', formValue);

        // Crear nueva página
        this.crearPagina(formValue);
    }

    /**
     * Crea una nueva página
     */
    private crearPagina(formValue: any): void {
        const paginaData: CreatePaginaRequest = {
            nombre: formValue.nombre,
            canal: formValue.canal
        };

        console.log('📝 Creando nueva página:', paginaData);

        this.paginaService.createPagina(paginaData).subscribe({
            next: (response) => {
                console.log('✅ Página creada:', response.data);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Página creada correctamente'
                });
                this.cerrarModal();
                this.cargarPaginas();
            },
            error: (error) => {
                console.error('❌ Error al crear página:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al crear la página'
                });
            }
        }).add(() => this.guardando = false);
    }

    /**
     * Actualiza una página existente
     */
    private actualizarPagina(idPag: number, formValue: any): void {
        const paginaData: UpdatePaginaRequest = {
            id_pag: idPag,
            nombre: formValue.nombre,
            canal: formValue.canal
        };

        console.log('🔄 Actualizando página:', paginaData);

        this.paginaService.updatePagina(paginaData).subscribe({
            next: (response) => {
                console.log('✅ Página actualizada:', response.data);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Página actualizada correctamente'
                });
                this.cerrarModal();
                this.cargarPaginas();
            },
            error: (error) => {
                console.error('❌ Error al actualizar página:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar la página'
                });
            }
        }).add(() => this.guardando = false);
    }

    confirmDeletePagina(): void {
        if (!this.paginaParaEliminar) return;

        this.eliminando = true;
        console.log('🗑️ Eliminando página:', this.paginaParaEliminar.nombre);

        this.paginaService.deletePagina(this.paginaParaEliminar.id_pag).subscribe({
            next: (response: any) => {
                console.log('✅ Página eliminada:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Página eliminada correctamente'
                });

                this.cargarPaginas();
                this.paginaParaEliminar = null;
                this.mostrarConfirmDelete = false;
            },
            error: (error: any) => {
                console.error('❌ Error al eliminar página:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar la página'
                });
            },
            complete: () => {
                this.eliminando = false;
            }
        });
    }

    /**
     * Muestra el modal de confirmación de eliminación
     */
    eliminarPagina(pagina: Pagina): void {
        console.log('⚠️ Mostrando modal de eliminación para página:', pagina.nombre);
        this.paginaParaEliminar = pagina;
        this.mostrarConfirmDelete = true;
    }



    /**
     * Cancela eliminación de página
     */
    onCancelDelete(): void {
        console.log('❌ Cancelando eliminación de página');
        this.mostrarConfirmDelete = false;
        this.paginaParaEliminar = null;
    }

    // ========== MÉTODOS DE EDICIÓN INLINE ==========

    /**
     * Inicia edición inline en el campo nombre
     */
    editarInline(pagina: Pagina, campo: string): void {
        const newEditingCell = pagina.id_pag + '-' + campo;

        // Si ya estamos editando otro campo y hay cambios pendientes
        if (this.editingCell && this.hasChanges && this.editingCell !== newEditingCell) {
            console.warn('⚠️ Cambiando de campo con cambios pendientes - cancelando edición anterior');
            this.cancelInlineEdit(); // Cancelar la edición anterior
        }

        // Marcar que estamos cambiando de campo
        this.isTransitioningFields = true;

        // Iniciar nueva edición
        this.editingCell = newEditingCell;
        this.originalValue = pagina[campo as keyof Pagina];
        this.hasChanges = false;
        console.log(`✏️ Iniciando edición ${campo}:`, {
            originalValue: this.originalValue,
            originalType: typeof this.originalValue,
            paginaValue: pagina[campo as keyof Pagina]
        });

        // Programáticamente enfocamos y posicionamos el cursor al final del texto
        // Usar setTimeout con mayor delay para asegurar que PrimeNG renderice completamente
        setTimeout(() => {
            let element: HTMLElement | null = null;

            if (campo === 'canal') {
                // Para p-select de canal, buscar el input dentro del contenedor de edición
                const editContainer = document.querySelector(`[aria-label="canal-${pagina.id_pag}"]`);
                if (editContainer) {
                    // Buscar el input dentro del p-select (estructura de PrimeNG)
                    element = editContainer.querySelector('input') as HTMLInputElement;
                }
            } else {
                // Para otros campos (input normales)
                const inputElement = document.querySelector(`input[aria-label="${campo}-${pagina.id_pag}"]`) as HTMLInputElement;
                element = inputElement;
            }

            if (element) {
                element.focus();
                console.log('🎯 Elemento enfocado:', campo, 'para página:', pagina.id_pag);
            } else {
                console.warn('⚠️ No se encontró elemento para enfocar:', campo, 'página:', pagina.id_pag);
            }

            // Resetear el flag de transición después de un breve delay
            setTimeout(() => {
                this.isTransitioningFields = false;
                console.log('🔄 Flag de transición reseteado');
            }, 100);
        }, 50);
    }

    /**
     * Detecta cambios en el input durante edición inline
     */
    onInputChange(pagina: Pagina, campo: string): void {
        const currentValue = pagina[campo as keyof Pagina];
        this.hasChanges = currentValue !== this.originalValue;
        console.log('📝 Cambio detectado en', campo, ':', currentValue);
    }

    /**
     * Guarda cambios de edición inline
     */
    saveInlineEdit(pagina: Pagina, campo: string): void {
        if (!this.hasChanges) {
            console.log('ℹ️ No hay cambios para guardar');
            this.cancelInlineEdit();
            return;
        }

        console.log('💾 Guardando edición inline:', campo, 'valor:', pagina[campo as keyof Pagina]);

        // Crear objeto con solo el campo modificado
        const updateData: any = {
            id_pag: pagina.id_pag
        };

        // Agregar el campo modificado
        if (campo === 'nombre') {
            updateData.nombre = pagina.nombre;
        } else if (campo === 'canal') {
            updateData.canal = pagina.canal;
        }

        this.paginaService.updatePagina(updateData).subscribe({
            next: (response) => {
                console.log('✅ Edición inline guardada:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${campo.charAt(0).toUpperCase() + campo.slice(1)} actualizado correctamente`
                });
                this.cancelInlineEdit();
                this.cargarPaginas(); // Recargar para asegurar consistencia
            },
            error: (error) => {
                console.error('❌ Error en edición inline:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar el campo'
                });
                // Revertir cambios en caso de error
                (pagina as any)[campo] = this.originalValue;
                this.cancelInlineEdit();
            }
        });
    }

    /**
     * Cancela edición inline
     */
    cancelInlineEdit(): void {
        console.log('❌ Cancelando edición inline');
        if (this.editingCell && this.hasChanges) {
            const [paginaId, field] = this.editingCell.split('-');

            const pagina = this.paginas.find(p => p.id_pag === parseInt(paginaId));
            if (pagina) {
                (pagina as any)[field] = this.originalValue;

                // Para campos que usan select, forzar actualización visual
                if (field === 'canal') {
                    this.cdr.detectChanges();
                    setTimeout(() => this.cdr.detectChanges(), 0);
                    setTimeout(() => this.cdr.detectChanges(), 10);
                } else {
                    this.cdr.detectChanges();
                }
            }
        }

        this.editingCell = '';
        this.hasChanges = false;
        this.originalValue = null;
        this.isTransitioningFields = false;
    }

    /**
     * Cancela edición inline al perder foco (blur)
     */
    cancelInlineEditByBlur(): void {
        console.log('editing >', this.editingCell, ' hasChanges >', this.hasChanges, ' transitioning >', this.isTransitioningFields);

        // Usar setTimeout para permitir que los eventos de click se ejecuten primero
        setTimeout(() => {
            // Si estamos en transición entre campos, no cancelar
            if (this.isTransitioningFields) {
                console.log('🔄 Blur durante transición - ignorando');
                return;
            }

            // Verificar si aún estamos en modo edición (puede haber sido cancelado por un click)
            if (this.editingCell) {
                console.log('🔄 Ejecutando blur - restaurando valor original');

                // Siempre restaurar el valor original cuando se pierde el foco
                const [paginaId, field] = this.editingCell.split('-');
                const pagina = this.paginas.find(p => p.id_pag === parseInt(paginaId));
                if (pagina) {
                    const valorAntes = (pagina as any)[field];
                    console.log(`🔄 Blur: Restaurando ${field} - Antes: ${valorAntes}, Original: ${this.originalValue}`);

                    // Restaurar el valor original
                    (pagina as any)[field] = this.originalValue;

                    // Para campos que usan select HTML, necesitamos forzar la actualización visual
                    if (field === 'canal') {
                        console.log('🎯 Blur: Campo select detectado - forzando actualización visual');

                        // Crear una nueva referencia del objeto para forzar la actualización del binding
                        const index = this.paginas.findIndex(p => p.id_pag === pagina.id_pag);
                        if (index !== -1) {
                            this.paginas[index] = { ...this.paginas[index] };
                        }

                        // Múltiples detecciones de cambios para asegurar la actualización
                        this.cdr.detectChanges();
                        setTimeout(() => this.cdr.detectChanges(), 0);
                        setTimeout(() => this.cdr.detectChanges(), 10);
                    } else {
                        this.cdr.detectChanges();
                    }

                    console.log('🔄 Valor restaurado por blur:', field, 'Valor final:', (pagina as any)[field]);
                }

                this.editingCell = '';
                this.originalValue = null;
                this.hasChanges = false;
                this.isTransitioningFields = false; // Resetear flag de transición
            }
        }, 150); // Pequeño delay para permitir que los clicks se ejecuten primero
    }

    // ========== SISTEMA DE TABS ==========

    /**
     * Maneja el cambio de tab
     */
    onTabClick(tabIndex: number): void {
        console.log('🔄 Cambiando a tab:', tabIndex);
        this.activeTabIndex = tabIndex;

        // Cargar datos específicos según la tab
        if (tabIndex === 1) {
            this.calcularEstadisticas();
        }
    }

    // ========== COMUNICACIÓN PADRE-HIJO (PATRÓN TAB_PADRE_HIJO) ==========

    // Variables para detección de doble click (PATRÓN ESTABLECIDO)
    private lastClickTime: number = 0;
    private lastClickedPagina: Pagina | null = null;
    private readonly DOUBLE_CLICK_DELAY = 300; // ms

    /**
     * Maneja clicks en filas de la tabla de páginas
     */
    onRowClick(pagina: Pagina): void {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastClickTime;

        console.log('👆 Click en página:', pagina.nombre, 'timeDiff:', timeDiff);

        // Detectar doble click
        if (timeDiff < this.DOUBLE_CLICK_DELAY && this.lastClickedPagina?.id_pag === pagina.id_pag) {
            console.log('🎯 Doble click detectado!');
            this.onPaginaDobleClick(pagina);
        } else {
            // Click simple - seleccionar página
            console.log('👆 Click simple - seleccionando página');
            this.onPaginaSeleccionada(pagina);
        }

        // Actualizar timestamps para el próximo click
        this.lastClickTime = currentTime;
        this.lastClickedPagina = pagina;
    }

    /**
     * Maneja la selección de una página desde el tab padre
     */
    onPaginaSeleccionada(pagina: Pagina | null): void {
        console.log('📄 Página seleccionada:', pagina);
        this.paginaSeleccionada = pagina;
    }

    /**
     * Maneja el doble click en una página - selección + navegación automática
     */
    onPaginaDobleClick(pagina: Pagina): void {
        console.log('🎯 Doble click en página:', pagina.nombre);

        // Forzar cambio de estado para asegurar detección de cambios
        this.activeTabIndex = 0;
        setTimeout(() => {
            this.paginaSeleccionada = { ...pagina }; // Clon para change detection
            this.activeTabIndex = 1; // Cambiar automáticamente al tab de componentes
        }, 0);
    }

    /**
     * Calcula estadísticas de las páginas
     */
    private calcularEstadisticas(): void {
        console.log('📊 Calculando estadísticas de páginas...');

        this.estadisticas = {
            total: this.paginas.length,
            activas: this.paginas.filter(p => p.estado === 1).length,
            inactivas: this.paginas.filter(p => p.estado === 0).length,
            porCanal: {
                WEB: this.paginas.filter(p => p.canal === 'WEB').length,
                APP: this.paginas.filter(p => p.canal === 'APP').length
            }
        };

        console.log('📊 Estadísticas calculadas:', this.estadisticas);
    }


    // ========== FILTRO POR CANAL (ESTILO BANNERS) ==========

    /**
     * Maneja el click en los botones de filtro de canal
     */
    onCanalFiltroClick(canalValue: string): void {
        console.log('🔄 Filtro de canal cambió:', canalValue);
        // Si ya está seleccionado, deseleccionar (mostrar todos)
        if (this.canalFiltroSeleccionado === canalValue) {
            this.canalFiltroSeleccionado = '';
        } else {
            this.canalFiltroSeleccionado = canalValue;
        }
        this.cargarPaginas();
    }

    // ========== TOGGLE SWITCH PARA ESTADO ==========

    /**
     * Obtiene el estado del ToggleSwitch considerando estados temporales
     */
    getPaginaToggleState(pagina: Pagina): boolean {
        // Usar el estado temporal si existe, sino usar el estado real
        const tempState = this.toggleStates[pagina.id_pag];

        // Convertir estado a número si viene como string, y verificar si es 1
        const estadoNumerico = typeof pagina.estado === 'string' ? parseInt(pagina.estado) : pagina.estado;
        return tempState !== undefined ? tempState : estadoNumerico === 1;
    }

    /**
     * Maneja el cambio del ToggleSwitch
     */
    onToggleSwitchChange(isChecked: boolean, pagina: Pagina): void {
        console.log('🔄 onToggleSwitchChange - Página:', pagina);
        console.log('🔄 onToggleSwitchChange - isChecked:', isChecked);
        console.log('🔄 onToggleSwitchChange - Estado actual:', pagina.estado);

        // Convertir estado a número si viene como string
        const valorActual = typeof pagina.estado === 'string' ? parseInt(pagina.estado) : pagina.estado;
        const nuevoValor = isChecked ? 1 : 0;

        // Si el valor no cambió, no hacer nada
        if (nuevoValor === valorActual) {
            return;
        }

        // Para activación (pasar de 0 a 1), hacer el cambio directamente
        if (nuevoValor === 1) {
            this.procesarCambioEstadoDirecto(pagina, 1);
            return;
        }

        // Para desactivación (pasar de 1 a 0), mostrar confirmación
        // Establecer estado temporal para mostrar el cambio visual
        this.toggleStates[pagina.id_pag] = false;
        // Forzar detección de cambios
        this.cdr.detectChanges();

        this.confirmationService.confirm({
            message: `¿Está seguro de que desea desactivar la página "${pagina.nombre}"?`,
            header: 'Confirmar Desactivación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Desactivar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text',
            accept: () => {
                // Limpiar estado temporal y procesar el cambio
                delete this.toggleStates[pagina.id_pag];
                // Forzar detección de cambios
                this.cdr.detectChanges();
                this.procesarCambioEstadoDirecto(pagina, 0);
            },
            reject: () => {
                // Revertir el estado temporal al estado original
                delete this.toggleStates[pagina.id_pag];
                // Forzar detección de cambios
                this.cdr.detectChanges();
                console.log('❌ Usuario canceló la desactivación');
            }
        });
    }

    /**
     * Procesa el cambio de estado directamente
     */
    private procesarCambioEstadoDirecto(pagina: Pagina, nuevoValor: number): void {
        const valorAnterior = pagina.estado;

        // Aplicar el cambio optimista
        pagina.estado = nuevoValor;

        // Mostrar loading state
        this.guardando = true;

        const updateData: UpdatePaginaRequest = {
            id_pag: pagina.id_pag,
            estado: nuevoValor
        };

        this.paginaService.updatePagina(updateData).subscribe({
            next: (response) => {
                this.guardando = false;
                console.log('✅ Estado actualizado exitosamente:', response);

                const estadoTexto = nuevoValor === 1 ? 'ACTIVADA' : 'DESACTIVADA';
                const icono = nuevoValor === 1 ? '✅' : '🚫';

                this.messageService.add({
                    severity: nuevoValor === 1 ? 'success' : 'warn',
                    summary: `Página ${estadoTexto}`,
                    detail: `${icono} La página "${pagina.nombre}" ha sido ${estadoTexto.toLowerCase()} correctamente`,
                    life: 4000
                });

                // Forzar detección de cambios para actualizar el ToggleSwitch
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.guardando = false;
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local en caso de error
                pagina.estado = valorAnterior;

                // Forzar detección de cambios para actualizar el ToggleSwitch
                this.cdr.detectChanges();

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cambiar estado',
                    detail: `No se pudo cambiar el estado de la página "${pagina.nombre}". Se revirtió el cambio.`,
                    life: 6000
                });
            }
        });
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Aplica filtros a la lista de páginas
     */
    aplicarFiltros(): void {
        console.log('🔍 Aplicando filtros:', {
            canal: this.canalFiltroSeleccionado,
            estado: this.filtroEstado,
            busqueda: this.filtroBusqueda
        });

        // Aquí iría la lógica de filtrado si se implementa filtrado local
        // Por ahora, simplemente recargamos las páginas
        this.cargarPaginas();
    }

    /**
     * Obtiene la etiqueta del estado
     */
    getEstadoLabel(estado: number): string {
        return estado === 1 ? 'Activo' : 'Inactivo';
    }

    /**
     * Obtiene la severidad del tag según el estado
     */
    getEstadoSeverity(estado: number): string {
        return estado === 1 ? 'success' : 'danger';
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
