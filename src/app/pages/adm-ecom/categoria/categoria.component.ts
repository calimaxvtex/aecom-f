import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Servicios y modelos
import { CategoriaService } from '@/features/categoria/services/categoria.service';
import { ProyectoService, Proyecto } from '@/features/proy/services/proyecto.service';
import { SessionService } from '@/core/services/session.service';
import { Categoria, CreateCategoriaRequest, UpdateCategoriaRequest } from '@/features/categoria/models/categoria.interface';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';


@Component({
    selector: 'app-categoria',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        FloatLabelModule,
        TabsModule,
        CardModule,
        TooltipModule,
        BadgeModule,OverlayBadgeModule
    ],
    providers: [MessageService],
    templateUrl: './categoria.component.html',
    styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent implements OnInit {
    // ========== DATOS PRINCIPALES ==========
    categorias: Categoria[] = []; // Datos filtrados que se muestran en la tabla
    categoriasTodas: Categoria[] = []; // Todos los datos sin filtrar
    categoriasNivel2: Categoria[] = []; // Datos filtrados para Nivel 2
    categoriasNivel2Todas: Categoria[] = []; // Todos los datos sin filtrar para Nivel 2
    categoriasPadre: Categoria[] = []; // Categorías padre disponibles para Nivel 2
    proyectos: Proyecto[] = [];

    // ========== ESTADOS DE SELECCIÓN ==========
    proyectoSeleccionado: Proyecto | null = null;
    proyectoSeleccionadoId: number | null = null;
    categoriaPadreSeleccionada: Categoria | null = null;
    categoriaPadreSeleccionadaId: number | null = null;
    activeTabIndex: string | number = '0'; // 0 = Nivel 1, 1 = Nivel 2

    // ========== FILTROS ==========
    estadoFiltro: string = 'A'; // Por defecto mostrar Activas
    estadoFiltroSeleccionado: string = 'A'; // Para los botones compactos
    estadoOptions: { label: string; value: string }[] = [
        { label: 'Activos', value: 'A' },
        { label: 'Inactivos', value: 'R' },
        { label: 'Todos', value: '' }
    ];

    nivelOptions: { label: string; value: number }[] = [
        { label: 'Nivel 1 (Principal)', value: 1 },
        { label: 'Nivel 2 (Subcategoría)', value: 2 }
    ];

    // ========== ESTADOS DE CARGA ==========
    loadingProyectos = false;
    loadingCategorias = false;
    loadingCategoriasNivel2 = false;
    savingCategoria = false;

    // ========== ESTADOS DE UI ==========
    showCategoriaModal = false;

    // ========== FORMULARIO ==========
    isEditingCategoria = false;
    categoriaForm: any = {
        nombre: '',
        estado: 'A',
        nivel: 1,
        id_cat_padre: null,
        url_img_web: '',
        url_img_app: '',
        url_min_web: '',
        url_min_app: ''
    };
    categoriaSeleccionada: Categoria | null = null;

    // ========== FORMULARIO MODAL ==========
    categoriasPadreDisponibles: Categoria[] = []; // Para el selector en el modal
    loadingCategoriasPadre: boolean = false; // Para controlar el estado de carga

    // ========== EDICIÓN INLINE ==========
    editingCell: string | null = null;
    originalValue: any = null;

    constructor(
        private categoriaService: CategoriaService,
        private proyectoService: ProyectoService,
        private sessionService: SessionService,
        public messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        console.log('🏷️ CategoriaComponent inicializado');
        console.log('📊 activeTabIndex inicial:', this.activeTabIndex);
        this.cargarProyectos();
    }

    // ========== MÉTODOS DE CARGA DE DATOS ==========

    cargarProyectos(): void {
        this.loadingProyectos = true;
        console.log('📊 Cargando proyectos...');

        this.proyectoService.getAllProyectos().subscribe({
            next: (response: any) => {
                if (response.data && Array.isArray(response.data)) {
                    this.proyectos = response.data;
                    console.log('✅ Proyectos cargados:', this.proyectos.length);

                    // NO preseleccionar proyecto por defecto - dejar el select vacío
                    // El usuario debe seleccionar manualmente el proyecto deseado
                    console.log('📋 Proyectos disponibles para selección manual:', this.proyectos.map(p => ({ id: p.id_proy, nombre: p.nombre || p.descripcion })));
                }
                this.loadingProyectos = false;
            },
            error: (error) => {
                console.error('❌ Error cargando proyectos:', error);
                this.loadingProyectos = false;
                this.mostrarError('Error al cargar proyectos', error);
            }
        });
    }

    cargarCategorias(): void {
        if (!this.proyectoSeleccionado) {
            return;
        }

        // Evitar múltiples cargas simultáneas
        if (this.loadingCategorias) {
            return;
        }

        this.loadingCategorias = true;

        // Payload especificado por el usuario
        const payload = {
            action: 'SL',
            id_proy: this.proyectoSeleccionado.id_proy,
            nivel: 1 as const
        };

        this.categoriaService.getAllCategorias(payload).subscribe({
            next: (response: any) => {

                if (response?.data && Array.isArray(response.data)) {
                    // Almacenar TODOS los datos sin filtrar
                    this.categoriasTodas = response.data;

                    // Automáticamente asignar las categorías ACTIVAS de nivel 1 como categorías padre para el tab 2
                    // Esto asegura que el select esté listo cuando el usuario vaya al tab 2
                    // Solo categorías activas pueden tener subcategorías
                    this.categoriasPadre = this.categoriasTodas.filter(categoria => categoria.estado === 'A');
                    this.filtrarCategoriasPorEstado();

                    // Mensaje de carga exitosa
                    const estadoTexto = this.estadoFiltro === 'A' ? 'activas' : this.estadoFiltro === 'R' ? 'inactivas' : 'todas';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Datos Cargados',
                        detail: `${this.categoriasTodas.length} categorías totales, mostrando ${this.categorias.length} ${estadoTexto}`,
                        life: 3000
                    });
                } else {
                    console.warn('⚠️ Respuesta sin datos válidos:', response);
                    this.categoriasTodas = [];
                    this.categorias = [];
                }

                this.loadingCategorias = false;
            },
            error: (error: any) => {
                console.error('❌ Error al cargar categorías:', error);
                this.categoriasTodas = [];
                this.categorias = [];
                this.loadingCategorias = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar categorías',
                    detail: error?.message || 'Error desconocido al cargar las categorías',
                    life: 5000
                });
            }
        });
    }

    // ========== MÉTODOS PARA NIVEL 2 ==========

    seleccionarCategoriaPadre(categoriaPadre: Categoria): void {
        this.categoriaPadreSeleccionada = categoriaPadre;
        this.categoriaPadreSeleccionadaId = categoriaPadre.id_cat || this.getCategoriaId(categoriaPadre);
        this.cargarCategoriasNivel2();
    }

    seleccionarCategoriaPadreDesdeTabla(categoriaPadre: Categoria): void {
        // Cambiar al Tab 1 (Subcategorías)
        this.activeTabIndex = '1';

        // Pequeño delay para asegurar que el tab se active antes de seleccionar
        setTimeout(() => {
            // Seleccionar la categoría padre en el SELECT del Tab 1
            this.seleccionarCategoriaPadre(categoriaPadre);
        }, 100);
    }

    onCategoriaPadreChange(event: any): void {

        // El ngModel ya actualizó categoriaPadreSeleccionadaId
        // Solo necesitamos procesar si hay un valor válido
        if (this.categoriaPadreSeleccionadaId) {
            const categoriaPadre = this.categoriasPadre.find(c => c.id_cat === this.categoriaPadreSeleccionadaId);

            if (categoriaPadre) {
                // Solo actualizar categoriaPadreSeleccionada, no el ID (ya está actualizado por ngModel)
                this.categoriaPadreSeleccionada = categoriaPadre;

                // Cargar subcategorías
                this.cargarCategoriasNivel2();
            } else {
                console.warn('⚠️ No se encontró la categoría padre con id_cat:', this.categoriaPadreSeleccionadaId);
                console.log('📋 Categorías padre disponibles:', this.categoriasPadre.map(c => ({ id_cat: c.id_cat, nombre: c.nombre })));
            }
        } else {
            console.log('🧹 Limpiando selección de categoría padre');
            // Si no hay selección, limpiar las subcategorías
            this.categoriaPadreSeleccionada = null;
            this.categoriaPadreSeleccionadaId = null;
            this.categoriasNivel2 = [];
            this.categoriasNivel2Todas = [];
        }
    }

    cargarCategoriasNivel2(): void {
        if (!this.proyectoSeleccionado || !this.categoriaPadreSeleccionada) {
            console.warn('⚠️ No se puede cargar subcategorías: proyecto=', !!this.proyectoSeleccionado, 'categoriaPadre=', !!this.categoriaPadreSeleccionada);
            return;
        }

        this.loadingCategoriasNivel2 = true;

        // Payload específico con id_cat_padre como especificó el usuario
        const idCatPadre = this.categoriaPadreSeleccionada.id_cat || this.getCategoriaId(this.categoriaPadreSeleccionada);

        const payload = {
            action: 'SL',
            id_proy: this.proyectoSeleccionado.id_proy,
            nivel: 2 as const,
            id_cat_padre: idCatPadre
        };

        this.categoriaService.getAllCategorias(payload).subscribe({
            next: (response: any) => {

                if (response?.data && Array.isArray(response.data)) {
                    // Agregar el nombre de la categoría padre a cada subcategoría
                    this.categoriasNivel2Todas = response.data.map((subcategoria: any) => ({
                        ...subcategoria,
                        nombre_cat_padre: this.categoriaPadreSeleccionada?.nombre || ''
                    }));

                    this.filtrarCategoriasNivel2PorEstado();
                } else {
                    console.warn('⚠️ Respuesta sin datos válidos:', response);
                    this.categoriasNivel2Todas = [];
                    this.categoriasNivel2 = [];
                }

                this.loadingCategoriasNivel2 = false;
            },
            error: (error: any) => {
                console.error('❌ Error al cargar subcategorías:', error);
                this.categoriasNivel2Todas = [];
                this.categoriasNivel2 = [];
                this.loadingCategoriasNivel2 = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar subcategorías',
                    detail: error?.message || 'Error desconocido al cargar las subcategorías',
                    life: 5000
                });
            }
        });
    }

    filtrarCategoriasNivel2PorEstado(): void {

        if (this.estadoFiltro === '') {
            this.categoriasNivel2 = [...this.categoriasNivel2Todas];
        } else {
            this.categoriasNivel2 = this.categoriasNivel2Todas.filter(categoria =>
                categoria.estado === this.estadoFiltro
            );
            console.log(`✅ Mostrando subcategorías ${this.estadoFiltro === 'A' ? 'activas' : 'inactivas'}:`, this.categoriasNivel2.length);
        }
    }
    // ========== MÉTODOS DE FILTROS ==========

    filtrarCategoriasPorEstado(): void {
        if (this.estadoFiltro === '') {
            // Mostrar todas las categorías
            this.categorias = [...this.categoriasTodas];
        } else {
            // Filtrar por estado específico
            this.categorias = this.categoriasTodas.filter(categoria =>
                categoria.estado === this.estadoFiltro
            );
            console.log(`✅ Mostrando categorías ${this.estadoFiltro === 'A' ? 'activas' : 'inactivas'}:`, this.categorias.length);
        }
    }

    onEstadoFiltroClick(estadoValue: string): void {
        // Si se hace click en el mismo botón, resetear el filtro
        if (this.estadoFiltroSeleccionado === estadoValue) {
            this.estadoFiltroSeleccionado = 'A'; // Resetear a Activos por defecto
            this.estadoFiltro = 'A';
        } else {
            // Cambiar al nuevo filtro
            this.estadoFiltroSeleccionado = estadoValue;
            this.estadoFiltro = estadoValue;
            console.log('✅ Filtro cambiado a:', estadoValue);
        }

        const estadoTexto = this.estadoFiltro === 'A' ? 'Activas' : this.estadoFiltro === 'R' ? 'Inactivas' : 'Todas';
        // Aplicar filtro según el tab activo
        if (this.activeTabIndex === '0') {
            // Tab Nivel 1
            if (this.categoriasTodas.length > 0) {
                this.cdr.detectChanges();
                this.filtrarCategoriasPorEstado();
            } else if (this.proyectoSeleccionado) {
                this.cargarCategorias();
            }
        } else if (this.activeTabIndex === '1') {
            // Tab Nivel 2
            if (this.categoriasNivel2Todas.length > 0) {
                this.cdr.detectChanges();
                this.filtrarCategoriasNivel2PorEstado();
            }
        }

        // Mostrar mensaje
        const mensaje = estadoValue === this.estadoFiltroSeleccionado
            ? `Filtro aplicado: ${estadoTexto}`
            : `Filtro reseteado a: Activas`;

        this.messageService.add({
            severity: 'success',
            summary: 'Filtro Aplicado',
            detail: mensaje,
            life: 1500
        });
    }

    onGlobalFilter(table: any, event: any): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    /**
     * Obtiene el nombre de la categoría padre
     */
    getNombreCategoriaPadre(categoria: Categoria): string {
        return categoria.nombre_cat_padre || 'Sin padre';
    }

    private procesarRespuesta(response: any): Categoria[] {
        if (Array.isArray(response)) {
            return response[0]?.statuscode === 200 ? response[0].data : response;
        } else if (response?.statuscode === 200) {
            return response.data || [];
        }
        return [];
    }

    // ========== MÉTODOS DE SELECCIÓN ==========

    seleccionarProyecto(proyecto: Proyecto): void {
        this.proyectoSeleccionado = proyecto;
        this.proyectoSeleccionadoId = proyecto.id_proy;

        // Resetear el tab activo al tab 0 (Categorías) por defecto
        this.activeTabIndex = '0';

        // Resetear selecciones de Nivel 2
        this.categoriaPadreSeleccionada = null;
        this.categoriaPadreSeleccionadaId = null;
        this.categoriasNivel2 = [];
        this.categoriasNivel2Todas = [];
        this.categoriasPadre = [];

        this.cargarCategorias();
    }

    onProyectoChange(event: any): void {
        const proyectoId = event?.value;
        if (proyectoId) {
            const proyecto = this.proyectos.find(p => p.id_proy === proyectoId);
            if (proyecto) {
                this.seleccionarProyecto(proyecto);

                // Forzar detección de cambios para actualizar la UI
                setTimeout(() => {
                    this.cdr.detectChanges();
                }, 50);
            }
        }
    }

    onTabChange(event: any): void {
        console.log('🔄 onTabChange ejecutado con event:', event, 'tipo:', typeof event);

        let newTabIndex: string;

        // Manejar diferentes formatos del evento de PrimeNG
        if (typeof event === 'number') {
            newTabIndex = event.toString();
        } else if (typeof event === 'string') {
            newTabIndex = event;
        } else if (event && typeof event.index === 'number') {
            newTabIndex = event.index.toString();
        } else if (event && typeof event.value !== 'undefined') {
            newTabIndex = event.value.toString();
        } else {
            console.warn('🔄 Formato de evento onTabChange desconocido:', event);
            return;
        }

        console.log('🔄 newTabIndex determinado:', newTabIndex);

        // Actualizar activeTabIndex con el nuevo valor
        const oldTabIndex = this.activeTabIndex;
        this.activeTabIndex = newTabIndex;
        console.log('🔄 activeTabIndex cambió de', oldTabIndex, 'a', this.activeTabIndex);

        // Si cambió al tab de Nivel 2, usar las categorías padre ya cargadas
        if (this.activeTabIndex === '1') {
            // Resetear selección previa para evitar conflictos
            this.categoriaPadreSeleccionada = null;
            this.categoriaPadreSeleccionadaId = null;
            this.categoriasNivel2 = [];
            this.categoriasNivel2Todas = [];

            // Usar solo las categorías ACTIVAS para el selector de padre
            // Esto asegura que solo se puedan crear subcategorías de categorías activas
            this.categoriasPadre = this.categoriasTodas.filter(categoria => categoria.estado === 'A');
            this.cdr.detectChanges(); // Forzar actualización de la vista
        }
    }

    // ========== MÉTODOS DEL FORMULARIO ==========

    cargarCategoriasPadreDisponibles(): void {
        console.log('🚀 Método cargarCategoriasPadreDisponibles() ejecutado');
        this.loadingCategoriasPadre = true;

        if (!this.proyectoSeleccionado) {
            console.warn('⚠️ No hay proyecto seleccionado para cargar categorías padre');
            this.categoriasPadreDisponibles = [];
            this.loadingCategoriasPadre = false;
            return;
        }

        console.log('📋 Cargando categorías padre disponibles para selector en modal...');

        const payload = {
            action: 'SL',
            id_proy: this.proyectoSeleccionado.id_proy,
            nivel: 1 as const,
            estado: 'A' as const // Solo categorías activas como padres
        };

        this.categoriaService.getAllCategorias(payload).subscribe({
            next: (response: any) => {
                if (response?.data && Array.isArray(response.data)) {
                    this.categoriasPadreDisponibles = response.data;
                    console.log('✅ Categorías padre disponibles cargadas:', this.categoriasPadreDisponibles.length);
                } else {
                    console.warn('⚠️ No se encontraron categorías padre disponibles');
                    this.categoriasPadreDisponibles = [];
                }
                this.loadingCategoriasPadre = false;
            },
            error: (error: any) => {
                console.error('❌ Error cargando categorías padre para modal:', error);
                this.categoriasPadreDisponibles = [];
                this.loadingCategoriasPadre = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar categorías padre',
                    detail: 'No se pudieron cargar las categorías disponibles para asignar como padre.',
                    life: 5000
                });
            }
        });
    }

    openCategoriaForm(categoria?: Categoria): void {
        // Limpiar estado anterior completamente
        this.categoriasPadreDisponibles = [];
        this.loadingCategoriasPadre = false;
        this.isEditingCategoria = !!categoria;

        if (categoria) {
            console.log('✏️ Editando categoría:', categoria);
            this.categoriaForm = {
                nombre: categoria.nombre,
                estado: categoria.estado,
                nivel: categoria.nivel,
                id_cat_padre: categoria.id_cat_padre || null,
                url_img_web: categoria.url_img_web || '',
                url_img_app: categoria.url_img_app || '',
                url_min_web: categoria.url_min_web || '',
                url_min_app: categoria.url_min_app || ''
            };
            this.categoriaSeleccionada = categoria;
            // Para edición, las categorías padre se cargan solo si es nivel 2
            if (categoria.nivel === 2) {
                this.cargarCategoriasPadreDisponibles();
            }
        } else {
            console.log('➕ Creando nueva categoría');
            console.log('📊 activeTabIndex actual:', this.activeTabIndex);
            const nivelNuevo = this.activeTabIndex == '0' ? 1 : 2;
            console.log('🎯 Nivel calculado:', nivelNuevo);
            this.categoriaForm = {
                nombre: '',
                estado: 'A',
                nivel: nivelNuevo,
                id_cat_padre: nivelNuevo === 2 ? this.categoriaPadreSeleccionadaId : null, // Para nivel 2, pre-seleccionar el padre del tab
                url_img_web: '',
                url_img_app: '',
                url_min_web: '',
                url_min_app: ''
            };
            this.categoriaSeleccionada = null;

            // Si es nivel 2, cargar categorías padre disponibles para el selector
            if (nivelNuevo === 2) {
                console.log('🔄 Cargando categorías padre disponibles...');
                this.cargarCategoriasPadreDisponibles();
            } else {
                console.log('ℹ️ Nivel 1 - no se cargan categorías padre');
            }
            // Para nivel 1, categoriasPadreDisponibles ya está vacío desde el inicio
        }

        this.showCategoriaModal = true;
    }

    closeCategoriaForm(): void {
        this.showCategoriaModal = false;
        this.isEditingCategoria = false;
        this.categoriaSeleccionada = null;
        this.categoriasPadreDisponibles = []; // Limpiar también las categorías padre disponibles
        this.loadingCategoriasPadre = false; // Resetear estado de carga
        this.categoriaForm = {
            nombre: '',
            estado: 'A',
            nivel: 1,
            id_cat_padre: null,
            url_img_web: '',
            url_img_app: '',
            url_min_web: '',
            url_min_app: ''
        };
    }

    saveCategoria(): void {
        if (!this.proyectoSeleccionado) return;

        // Validaciones adicionales
        if (!this.categoriaForm.nombre?.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Campo requerido',
                detail: 'El nombre de la categoría es obligatorio.',
                life: 3000
            });
            return;
        }

        // Validación específica para nivel 2: debe tener padre
        if (this.categoriaForm.nivel === 2 && !this.categoriaForm.id_cat_padre) {
            this.messageService.add({
                severity: 'error',
                summary: 'Campo requerido',
                detail: 'Las categorías de nivel 2 deben tener una categoría padre.',
                life: 3000
            });
            return;
        }

        this.savingCategoria = true;
        const formData = this.categoriaForm;

        const categoriaData: CreateCategoriaRequest = {
            nombre: formData.nombre,
            estado: formData.estado,
            id_proy: this.proyectoSeleccionado.id_proy,
            nivel: formData.nivel,
            id_cat_padre: formData.id_cat_padre,
            url_img_web: formData.url_img_web || undefined,
            url_img_app: formData.url_img_app || undefined,
            url_min_web: formData.url_min_web || undefined,
            url_min_app: formData.url_min_app || undefined
        };

        console.log('🔍 Categoria data:', categoriaData);

        if (this.isEditingCategoria && this.categoriaSeleccionada) {
            // Actualizar
            const updateData: UpdateCategoriaRequest = {
                ...categoriaData,
                id_categoria: this.getCategoriaId(this.categoriaSeleccionada)
            };

            console.log('🔍 Update data:', updateData);

            this.categoriaService.updateCategoria(updateData).subscribe({
                next: () => {
                    this.mostrarExito('Categoría actualizada correctamente');
                    this.closeCategoriaForm();
                    this.cargarCategorias();
                    this.savingCategoria = false;
                },
                error: (error) => {
                    this.mostrarError('Error al actualizar categoría', error);
                    this.savingCategoria = false;
                }
            });
        } else {
            // Crear
            this.categoriaService.createCategoria(categoriaData).subscribe({
                next: () => {
                    this.mostrarExito('Categoría creada correctamente');
                    this.closeCategoriaForm();
                    this.cargarCategorias();
                    this.savingCategoria = false;
                },
                error: (error) => {
                    this.mostrarError('Error al crear categoría', error);
                    this.savingCategoria = false;
                }
            });
        }
    }

    // ========== EDICIÓN INLINE ==========

    editInlineCategoria(categoria: Categoria, field: string): void {
        const categoriaId = this.getCategoriaId(categoria);
        this.editingCell = `${categoriaId}_${field}`;
        this.originalValue = (categoria as any)[field];
    }

    saveInlineEditCategoria(categoria: Categoria, field: string): void {
        const newValue = (categoria as any)[field];
        if (newValue === this.originalValue) {
            this.cancelInlineEdit();
            return;
        }

        const categoriaId = this.getCategoriaId(categoria);
        if (categoriaId) {
            this.categoriaService.updateCategoriaField(categoriaId, field, newValue).subscribe({
                next: () => {
                    this.mostrarExito(`${this.getFieldLabel(field)} actualizado correctamente`);
                    this.editingCell = null;
                    this.originalValue = null;
                },
                error: (error) => {
                    // Revertir cambio
                    (categoria as any)[field] = this.originalValue;
                    this.mostrarError(`Error al actualizar ${this.getFieldLabel(field)}`, error);
                    this.editingCell = null;
                    this.originalValue = null;
                }
            });
        }
    }

    cancelInlineEdit(): void {
        this.editingCell = null;
        this.originalValue = null;
    }

    // ========== UTILIDADES ==========

    /**
     * Determina qué campo usar para mostrar el nombre del proyecto
     */
    getDisplayField(): string {
        if (!this.proyectos || this.proyectos.length === 0) {
            return 'nombre';
        }

        const primerProyecto = this.proyectos[0];
        const camposPosibles = ['nombre', 'name', 'titulo', 'descripcion', 'nom_proy'];

        for (const campo of camposPosibles) {
            if (primerProyecto.hasOwnProperty(campo) && (primerProyecto as any)[campo]) {
                return campo;
            }
        }

        console.warn('⚠️ No se encontró campo válido para display, usando "nombre" por defecto');
        return 'nombre';
    }

    getProyectoNombre(proyecto: Proyecto): string {
        return proyecto.nombre || `${proyecto.descripcion}`;
    }

    /**
     * Obtiene el ID de la categoría (id_cat o id_categoria)
     */
    getCategoriaId(categoria: Categoria): number {
        return categoria.id_cat || categoria.id_categoria || 0;
    }

    /**
     * Obtiene la fecha de modificación de la categoría (fecha_mod o updated_at)
     */
    getCategoriaFechaMod(categoria: Categoria): string {
        return categoria.fecha_mod || categoria.updated_at || '';
    }

    /**
     * Valida si una URL de imagen es válida
     */
    isValidImageUrl(url: string): boolean {
        if (!url || url.trim() === '') return false;
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Maneja el error de carga de imagen
     */
    onImageError(event: any): void {
        event.target.style.display = 'none';
    }

    /**
     * Maneja la carga exitosa de imagen
     */
    onImageLoad(event: any): void {
        event.target.style.display = 'block';
    }

    getEstadoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: string): 'success' | 'danger' {
        return estado === 'A' ? 'success' : 'danger';
    }

    private getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            nombre: 'Nombre',
            descripcion: 'Descripción',
            estado: 'Estado'
        };
        return labels[field] || field;
    }

    private mostrarExito(mensaje: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: mensaje,
            life: 3000
        });
    }

    private mostrarError(mensaje: string, error?: any): void {
        console.error('❌ Error:', error);
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: mensaje,
            life: 5000
        });
    }

    // ========== PLACEHOLDER METHODS (POR IMPLEMENTAR) ==========

    eliminarCategoria(categoria: Categoria): void {
        console.log('🗑️ Solicitando eliminación de categoría:', categoria.nombre);

        // Mostrar confirmación usando MessageService
        this.messageService.add({
            key: 'confirm',
            sticky: true,
            severity: 'secondary',
            summary: 'Confirmar Eliminación',
            detail: `¿Está seguro de que desea eliminar la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
            data: categoria
        });
    }

    procesarEliminacionCategoria(categoria: Categoria): void {
        console.log('🗑️ Procesando eliminación de categoría:', categoria.nombre);
        this.savingCategoria = true;

        const categoriaId = this.getCategoriaId(categoria);

        this.categoriaService.deleteCategoria(categoriaId).subscribe({
            next: (response) => {
                console.log('✅ Categoría eliminada exitosamente:', response);
                this.mostrarExito('Categoría eliminada correctamente');

                // Limpiar mensaje de confirmación
                this.messageService.clear('confirm');

                // Recargar datos
                this.cargarCategorias();
                this.savingCategoria = false;
            },
            error: (error) => {
                console.error('❌ Error al eliminar categoría:', error);
                this.mostrarError('Error al eliminar categoría', error);
                this.savingCategoria = false;

                // Limpiar mensaje de confirmación
                this.messageService.clear('confirm');
            }
        });
    }

    toggleEstado(categoria: Categoria): void {
        // TODO: Implementar cambio de estado
        console.log('🔄 Toggle estado:', categoria);
    }
}