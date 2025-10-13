import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
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
import { PaginaService, Pagina, CreatePaginaRequest, UpdatePaginaRequest } from '../../../features/paginas';

@Component({
    selector: 'app-paginas',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Default,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
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
        TooltipModule
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

    // Control de estado temporal del ToggleSwitch
    toggleStates: { [key: string]: boolean } = {};

    // Filtro por canal (estilo banners)
    canalFiltroSeleccionado: string = '';
    canalesOptions: { label: string; value: string }[] = [
        { label: 'Web', value: 'WEB' },
        { label: 'App', value: 'APP' }
    ];


    estados = [
        { label: 'Activo', value: 1 },
        { label: 'Inactivo', value: 0 }
    ];

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
        console.log('✏️ Iniciando edición inline:', campo, 'para página:', pagina.nombre);
        this.editingCell = pagina.id_pag + '-' + campo;
        this.originalValue = pagina[campo as keyof Pagina];
        this.hasChanges = false;
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
        this.editingCell = '';
        this.hasChanges = false;
        this.originalValue = null;
    }

    /**
     * Cancela edición inline al perder foco (blur)
     */
    cancelInlineEditByBlur(): void {
        // Solo cancelar si no hay cambios pendientes
        if (!this.hasChanges) {
            setTimeout(() => {
                this.cancelInlineEdit();
            }, 150); // Pequeño delay para permitir clicks en botones
        }
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
