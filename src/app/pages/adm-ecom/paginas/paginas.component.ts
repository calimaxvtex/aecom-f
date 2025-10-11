import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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

    // Datos
    paginas: Pagina[] = [];
    paginaSeleccionada: Pagina | null = null;

    // Estados de carga
    loadingPaginas = false;
    guardando = false;
    eliminando = false;

    // Estados de modales
    mostrarModal = false;
    mostrarConfirmDelete = false;

    // Formularios
    paginaForm!: FormGroup;
    esEdicion = false;

    // Filtros
    filtroEstado: number | null = null;
    filtroBusqueda: string = '';

    // Edición inline
    editingCell: string = '';
    hasChanges: boolean = false;
    originalValue: any = null;


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

        this.paginaService.getAllPaginas().subscribe({
            next: (response) => {
                console.log('✅ Páginas cargadas:', response.data.length);
                this.paginas = response.data;
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
            estado: [true] // ToggleSwitch usa boolean, luego se convierte
        });
    }

    /**
     * Abre modal para crear nueva página
     */
    abrirModalCrear(): void {
        console.log('➕ Abriendo modal para crear página');
        this.esEdicion = false;
        this.paginaSeleccionada = null;

        this.paginaForm.reset({
            nombre: '',
            estado: true
        });

        this.mostrarModal = true;
    }

    /**
     * Abre modal para editar página existente
     */
    editarPagina(pagina: Pagina): void {
        console.log('✏️ Abriendo modal para editar página:', pagina.nombre);
        this.esEdicion = true;
        this.paginaSeleccionada = pagina;

        this.paginaForm.patchValue({
            nombre: pagina.nombre,
            estado: pagina.estado === 1 // Convertir number a boolean para toggle
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
        this.paginaSeleccionada = null;
        this.esEdicion = false;
    }

    // ========== MÉTODOS CRUD ==========

    /**
     * Guarda la página (crear o actualizar)
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

        console.log('💾 Guardando página:', formValue);

        if (this.esEdicion && this.paginaSeleccionada) {
            // Actualizar página existente
            this.actualizarPagina(this.paginaSeleccionada.id_pag, formValue);
        } else {
            // Crear nueva página
            this.crearPagina(formValue);
        }
    }

    /**
     * Crea una nueva página
     */
    private crearPagina(formValue: any): void {
        const paginaData: CreatePaginaRequest = {
            nombre: formValue.nombre
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
            nombre: formValue.nombre
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

    /**
     * Confirma eliminación de página
     */
    confirmarEliminar(pagina: Pagina): void {
        console.log('⚠️ Confirmando eliminación de página:', pagina.nombre);
        this.paginaSeleccionada = pagina;

        this.confirmationService.confirm({
            message: `¿Está seguro de eliminar la página "${pagina.nombre}"?`,
            header: 'Confirmar Eliminación',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            accept: () => this.eliminarPagina(pagina)
        });
    }

    /**
     * Elimina una página
     */
    eliminarPagina(pagina: Pagina): void {
        console.log('🗑️ Eliminando página:', pagina.nombre);
        this.eliminando = true;

        this.paginaService.deletePagina(pagina.id_pag).subscribe({
            next: (response) => {
                console.log('✅ Página eliminada:', response.data);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Página eliminada correctamente'
                });
                this.cargarPaginas();
            },
            error: (error) => {
                console.error('❌ Error al eliminar página:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar la página'
                });
            }
        }).add(() => this.eliminando = false);
    }

    // ========== MÉTODOS DE EDICIÓN INLINE ==========

    /**
     * Inicia edición inline en una celda específica
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
        } else if (campo === 'estado') {
            updateData.estado = pagina.estado;
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

    /**
     * Cancela eliminación de página
     */
    onCancelDelete(): void {
        console.log('❌ Cancelando eliminación de página');
        this.mostrarConfirmDelete = false;
        this.paginaSeleccionada = null;
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    /**
     * Aplica filtros a la lista de páginas
     */
    aplicarFiltros(): void {
        console.log('🔍 Aplicando filtros:', {
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
