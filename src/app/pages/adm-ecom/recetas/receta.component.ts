import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError, from } from 'rxjs';

// PrimeNG Modules (standalone)
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TabsModule } from 'primeng/tabs';
import { ConfirmationService, MessageService } from 'primeng/api';

// Servicios específicos del dominio
import { RecetaService, RecetaItem, RecetaFormItem } from '@/features/receta/services/receta.service';
import { CollService } from '@/features/coll/services/coll.service';
import { CollItem, ParsedCollTypesResponse } from '@/features/coll/models/coll.interface';
import { SessionService } from '@/core/services/session.service';
import { ApiConfigService } from '@/core/services/api/api-config.service';

@Component({
    selector: 'receta-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        InputNumberModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        TooltipModule,
        FloatLabelModule,
        TabsModule,
        TextareaModule
    ],
    providers: [MessageService, ConfirmationService, DatePipe],
    templateUrl: './receta.component.html',
    styleUrls: ['./receta.component.scss']
})

export class RecetaComponent implements OnInit, OnDestroy {
    // Datos
    recetas: RecetaItem[] = [];
    colecciones: CollItem[] = []; // Lista de colecciones disponibles
    RecetaSeleccionado: RecetaItem | null = null;

    // Estados de carga
    loadingRecetas = false;
    savingReceta = false;
    deletingReceta = false;

    // Estados de modales
    showRecetaModal = false;
    showConfirmDeleteReceta = false;

    // Formularios
    RecetaForm!: FormGroup;
    isEditingReceta = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;
    hasChanges: boolean = false;
    isTransitioningFields = false;

    // Confirmaciones
    RecetaToDelete: RecetaItem | null = null;
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;

    // Confirmación de estado
    showConfirmDialog = false;

    // Validación de imagen
    imageUrlValidated = false;
    bannerUrlValidated = false;

    // Getter que agrupa las categorías únicas de las recetas existentes
    get categoriasDisponibles() {
        const categoriasUnicas = new Set<string>();

        this.recetas.forEach(receta => {
            if (receta.category && receta.category.trim()) {
                categoriasUnicas.add(receta.category.trim());
            }
        });

        return Array.from(categoriasUnicas).sort();
    }

    // Método para manejar clics fuera del select de categoría
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        // Solo procesar si estamos editando una categoría
        if (this.editingCell && this.editingCell.includes('-category')) {
            const target = event.target as HTMLElement;
            const categorySelect = target.closest('.inline-edit-container');

            // Si el clic no fue dentro del contenedor de edición, cancelar edición
            if (!categorySelect) {
                this.cancelInlineEdit();
            }
        }
    }

    // Timers para debouncing
    private imageUrlTimer: any;
    private bannerUrlTimer: any;

    constructor(
        private fb: FormBuilder,
        private RecetaService: RecetaService,
        private collService: CollService,
        private sessionService: SessionService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private router: Router,
        private http: HttpClient,
        private apiConfigService: ApiConfigService,
        private cdr: ChangeDetectorRef
    ) {
        this.initializeForms();
    }

    ngOnInit() {
        this.loadRecetas();
        this.loadColecciones();
    }

    ngOnDestroy() {
        // Limpiar timers para evitar memory leaks
        if (this.imageUrlTimer) {
            clearTimeout(this.imageUrlTimer);
        }
        if (this.bannerUrlTimer) {
            clearTimeout(this.bannerUrlTimer);
        }
        // Limpiar event listener del modal
        this.removeModalClickListener();
    }

    // Event listener para cerrar modal al hacer clic fuera
    private modalClickListener: ((event: Event) => void) | null = null;
    private modalElement: HTMLElement | null = null;

    private addModalClickListener(): void {
        // Remover listener anterior si existe
        this.removeModalClickListener();

        // Esperar a que el modal esté completamente renderizado
        setTimeout(() => {
            this.modalElement = document.querySelector('.p-dialog') as HTMLElement;

            if (!this.modalElement) return;

            // Agregar listener al documento
            this.modalClickListener = (event: Event) => {
                // Solo procesar si el modal está abierto
                if (!this.showRecetaModal || !this.modalElement) return;

                const target = event.target as HTMLElement;

                // Si el clic fue fuera del modal completo, cerrar
                if (!this.modalElement.contains(target)) {
                    this.handleClickOutside();
                }
            };

            document.addEventListener('click', this.modalClickListener);
        }, 200); // Aumentar el delay para asegurar que el DOM esté listo
    }

    private handleClickOutside(): void {
        // Remover listener inmediatamente
        this.removeModalClickListener();
        // Cerrar modal
        this.closeRecetaForm();
        // Resetear referencia
        this.modalElement = null;
    }

    private removeModalClickListener(): void {
        if (this.modalClickListener) {
            document.removeEventListener('click', this.modalClickListener);
            this.modalClickListener = null;
        }
    }

    // Inicialización
    initializeForms(): void {
        /**
         * FORMULARIO DE RECETAS - CAMPOS Y SU MAPEO A LA BASE DE DATOS:
         *
         * Campos del Formulario → Campos de la BD:
         * - title (requerido) → titulo (Título principal completo)
         * - title_min → titulo_min (Título corto/acortado)
         * - instructions → instrucciones (Pasos de preparación)
         * - category → categoria (Categoría de la receta)
         * - url_mini (requerido) → url_mini (URL de imagen miniatura)
         * - url_banner → url_banner (URL de imagen banner)
         * - time → tiempo (Tiempo de preparación)
         * - people → personas (Número de porciones)
         * - difficulty (requerido) → dificultad (Nivel de dificultad)
         * - id_coll → id_coll (Colección a la que pertenece)
         *
         * NOTA: Los campos opcionales se envían como strings vacías si no se llenan
         */
        this.RecetaForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],      // → titulo
            title_min: [''],                                                   // → titulo_min
            description: [''],                                                 // → descripcion
            ingredients: [''],                                                 // → ingredientes
            instructions: [''],                                                // → instrucciones
            category: [''],                                                    // → categoria
            url_mini: ['', [Validators.required]],                            // → url_mini
            url_banner: [''],                                                  // → url_banner
            time: [''],                                                        // → tiempo
            people: [1, [Validators.min(1), Validators.max(50)]],             // → personas
            difficulty: ['medio', [Validators.required]],                     // → dificultad
            id_coll: [null]                                                    // → id_coll (colección)
        });
    }

    loadRecetas() {
        this.loadingRecetas = true;
        this.RecetaService.getRecetas().subscribe({
            next: (response) => {
                this.recetas = response.data;
                this.loadingRecetas = false;
            },
            error: (error: any) => {
                console.error('❌ Error al cargar recetas:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las recetas',
                    life: 5000
                });
                this.loadingRecetas = false;
            }
        });
    }

    loadColecciones() {
        console.log('📚 Cargando colecciones RECET usando API específica...');

        const collUrl = this.apiConfigService.getCollCrudUrl();

        // Preparar el body con los parámetros específicos para RECET (id_tipoc: 3)
        const body: any = {
            action: 'SL',
            id_tipoc: 3, // Tipo RECET según especificación del usuario
            ...this.sessionService.getApiPayloadBase() // Incluir datos de sesión
        };

        console.log('🔗 URL destino para colecciones RECET:', collUrl);
        console.log('📋 Body enviado:', body);

        // Hacer petición directa usando HttpClient
        this.http.post<any>(collUrl, body).pipe(
            map((response: any) => {
                return response
            }),
            catchError((error: any) => {
                console.error('Error en loadColecciones:', error);
                return throwError(() => ({
                    statuscode: error.status || 500,
                    mensaje: error.message || 'Error desconocido',
                    originalError: error
                }));
            })
        ).subscribe({
            next: (response) => {
                this.colecciones = response.data || [];
            },
            error: (error: any) => {
                console.error('❌ Error al cargar colecciones RECET:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las colecciones RECET',
                    life: 5000
                });
                this.colecciones = [];
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // Método para mostrar indicador visual de cambios
    getFieldClass(RecetaId: number, field: string, currentValue: any): string {
        // Para el nuevo patrón, este método ya no es necesario
        // La lógica de cambios se maneja en saveInlineEditReceta
        return '';
    }

    getStatusLabel(status: string): string {
        const labels = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
        };
        return labels[status as keyof typeof labels] || status;
    }

    getStatusSeverity(status: string): 'success' | 'danger' {
        return status === 'activo' ? 'success' : 'danger';
    }

    getDifficultyLabel(difficulty: string): string {
        const labels = {
            'facil': 'Fácil',
            'medio': 'Medio',
            'dificil': 'Difícil'
        };
        return labels[difficulty as keyof typeof labels] || difficulty;
    }

    getDifficultySeverity(difficulty: string): 'success' | 'warning' | 'danger' | 'info' {
        const severities: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
            'facil': 'success',
            'medio': 'warning',
            'dificil': 'danger'
        };
        return severities[difficulty] || 'info';
    }

    getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            'title': 'Título Principal',
            'title_min': 'Título Corto',
            'instructions': 'Instrucciones',
            'url_mini': 'URL Imagen Miniatura',
            'url_banner': 'URL Imagen Banner',
            'time': 'Tiempo',
            'servings': 'Porciones',  // Para edición inline
            'people': 'Porciones',    // Para formulario
            'category': 'Categoría',
            'difficulty': 'Dificultad',
            'id_coll': 'ID Colección'
        };
        return labels[field] || field;
    }

    getEstadoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: string): 'success' | 'danger' {
        return estado === 'A' ? 'success' : 'danger';
    }

    getEstadosOptions() {
        return [
            { label: 'Activo', value: 'A' },
            { label: 'Inactivo', value: 'I' }
        ];
    }

    // Método auxiliar para obtener el nombre de la colección por ID
    getCollectionName(id_coll: number | string | null | undefined): string {
        // Convertir a number si es string
        const idNum = typeof id_coll === 'string' ? parseInt(id_coll, 10) : id_coll;

        if (!idNum || !this.colecciones) {
            return '';
        }

        const collection = this.colecciones.find(coll => coll.id_coll === idNum);
        return collection ? collection.nombre : '';
    }

    // Método para manejar cambios en el select de colección durante edición inline
    onCollectionChange(Receta: RecetaItem): void {
        // No llamar onInputChange aquí porque el select con ngModel ya maneja los cambios automáticamente
    }

    // Detectar cambios en el input
    onInputChange(Receta: any, field: string): void {
        this.hasChanges = String(Receta[field]) !== String(this.originalValue);
    }

    // Guardar edición
    saveInlineEditReceta(Receta: RecetaItem, field: string): void {
        console.log('💾 Guardando inline:', field, 'Nuevo valor:', (Receta as any)[field]);

        if (field === 'id_coll') {
            const collectionName = this.getCollectionName((Receta as any)[field]);
            console.log('📚 Guardando colección:', collectionName || 'Sin colección', 'para receta:', Receta.id);
        }

        if ((Receta as any)[field] === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando');
            this.cancelInlineEdit();
            return;
        }

        // Obtener datos de sesión - REGLA OBLIGATORIA
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.RecetaService.updateRecetaField(
            Receta.id!,
            field,
            (Receta as any)[field],
            sessionBase
        ).subscribe({
            next: (response) => {
                console.log('✅ Campo actualizado:', response);

                // Actualizar metadatos locales - REGLA OBLIGATORIA
                Receta.fecha_mod = new Date().toISOString();
                Receta.usr_m = String(sessionBase.usr) || Receta.usr_m;

                this.editingCell = null;
                this.originalValue = null;
                this.hasChanges = false;
                this.isTransitioningFields = false; // Resetear flag de transición

                this.messageService.add({
                    severity: 'success',
                    summary: 'Campo Actualizado',
                    detail: `${this.getFieldLabel(field)} actualizado correctamente`
                });
            },
            error: (error: any) => {
                console.error('❌ Error al actualizar campo:', error);

                // Revertir el cambio local
                (Receta as any)[field] = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;
                this.hasChanges = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Error al actualizar ${this.getFieldLabel(field)}`,
                    life: 5000
                });
            }
        });
    }

    // Cancelar edición por blur (comportamiento inteligente)
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
                const [recetaId, field] = this.editingCell.split('-');
                const receta = this.recetas.find(r => r.id === parseInt(recetaId));
                if (receta) {
                    const valorAntes = (receta as any)[field];
                    console.log(`🔄 Blur: Restaurando ${field} - Antes: ${valorAntes}, Original: ${this.originalValue}`);

                    // Restaurar el valor original
                    (receta as any)[field] = this.originalValue;

                    // Para campos que usan select HTML, necesitamos forzar la actualización visual
                    if (field === 'id_coll' || field === 'difficulty') {
                        console.log('🎯 Blur: Campo select detectado - forzando actualización visual');

                        // Crear una nueva referencia del objeto para forzar la actualización del binding
                        const index = this.recetas.findIndex(r => r.id === receta.id);
                        if (index !== -1) {
                            this.recetas[index] = { ...this.recetas[index] };
                        }

                        // Múltiples detecciones de cambios para asegurar la actualización
                        this.cdr.detectChanges();
                        setTimeout(() => this.cdr.detectChanges(), 0);
                        setTimeout(() => this.cdr.detectChanges(), 10);
                    } else {
                        this.cdr.detectChanges();
                    }

                    console.log('🔄 Valor restaurado por blur:', field, 'Valor final:', (receta as any)[field]);
                }

                this.editingCell = null;
                this.originalValue = null;
                this.hasChanges = false;
                this.isTransitioningFields = false; // Resetear flag de transición
            }
        }, 150); // Pequeño delay para permitir que los clicks se ejecuten primero
    }

    // Cancelar edición
    cancelInlineEdit(): void {
        console.log('🔄 Cancelando edición:', this.editingCell, 'hasChanges:', this.hasChanges);
        if (this.editingCell && this.hasChanges) {
            const [recetaId, field] = this.editingCell.split('-');

            const receta: any = this.recetas[parseInt(recetaId) - 1];
            receta[field] = this.originalValue;
            this.recetas[parseInt(recetaId) - 1] = receta;

            if (field === 'id_coll' || field === 'difficulty') {
                this.cdr.detectChanges();
                setTimeout(() => this.cdr.detectChanges(), 0);
                setTimeout(() => this.cdr.detectChanges(), 10);
            } else {
                this.cdr.detectChanges();
            }

        }

        this.editingCell = null;
        this.originalValue = null;
        this.hasChanges = false;
        this.isTransitioningFields = false;
    }

    // ========== MÉTODOS DE UTILIDAD ESTÁNDAR ==========

    editInlineReceta(Receta: RecetaItem, field: string): void {
        const newEditingCell = Receta.id + '-' + field;

        // Si ya estamos editando otro campo y hay cambios pendientes
        if (this.editingCell && this.hasChanges && this.editingCell !== newEditingCell) {
            console.warn('⚠️ Cambiando de campo con cambios pendientes - cancelando edición anterior');
            this.cancelInlineEdit(); // Cancelar la edición anterior
        }

        // Marcar que estamos cambiando de campo
        this.isTransitioningFields = true;

        // Iniciar nueva edición
        this.editingCell = newEditingCell;
        this.originalValue = (Receta as any)[field];
        this.hasChanges = false;
        console.log(`✏️ Iniciando edición ${field}:`, {
            originalValue: this.originalValue,
            originalType: typeof this.originalValue,
            recetaValue: (Receta as any)[field]
        });

        // Programáticamente enfocamos y posicionamos el cursor al final del texto
        // Usar setTimeout con mayor delay para asegurar que PrimeNG renderice completamente
        setTimeout(() => {
            let element: HTMLElement | null = null;

            if (field === 'category') {
                // Para p-select de categoría, buscar el input dentro del contenedor de edición
                const editContainer = document.querySelector(`[aria-label="category-${Receta.id}"]`);
                if (editContainer) {
                    // Buscar el input dentro del p-select (estructura de PrimeNG)
                    element = editContainer.querySelector('input') as HTMLInputElement;
                }
            } else {
                // Para otros campos (input/textarea normales)
                const inputElement = document.querySelector(`input[aria-label="${field}-${Receta.id}"]`) as HTMLInputElement;
                const textareaElement = document.querySelector(`textarea[aria-label="${field}-${Receta.id}"]`) as HTMLTextAreaElement;
                element = inputElement || textareaElement;
            }

            if (element) {
                element.focus();
                // Posicionar el cursor al final del texto para inputs editables
                if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                    element.selectionStart = element.selectionEnd = element.value.length;
                }
                console.log('🎯 Elemento enfocado:', field, 'para receta:', Receta.id);
            } else {
                console.warn('⚠️ No se encontró elemento para enfocar:', field, 'receta:', Receta.id);
            }

            // Resetear el flag de transición después de un breve delay
            setTimeout(() => {
                this.isTransitioningFields = false;
                console.log('🔄 Flag de transición reseteado');
            }, 100);
        }, 50);
    }

    // Abrir formulario
    openRecetaForm(Receta?: RecetaItem): void {
        console.log('🚪 Abriendo modal de receta. Colecciones disponibles:', this.colecciones);
        if (Receta) {
            this.isEditingReceta = true;
            console.log('✏️ Editando Receta - Datos originales:', Receta);
            this.RecetaSeleccionado = Receta;

            // Asegurar que todos los campos opcionales existan con valores por defecto
            const formData = {
                title: Receta.title || '',
                title_min: Receta.title_min || '',
                description: Receta.description || '',
                ingredients: Receta.ingredients || '',
                instructions: Receta.instructions || '',
                category: Receta.category || '',
                url_mini: Receta.url_mini || '',
                url_banner: Receta.url_banner || '',
                time: Receta.time || '',
                people: Receta.people || 1,
                difficulty: Receta.difficulty || 'medio',
                id_coll: Receta.id_coll || null // Campo de colección
            };

            console.log('📝 Datos preparados para formulario:', formData);

            // Usar setValue en lugar de patchValue para asegurar que todos los campos se actualicen
            this.RecetaForm.setValue(formData);

            console.log('✅ Formulario actualizado con datos de la receta');

            // Si la receta tiene url_mini o url_banner, mostrar previews automáticamente
            this.imageUrlValidated = !!(Receta.url_mini && Receta.url_mini.trim());
            this.bannerUrlValidated = !!(Receta.url_banner && Receta.url_banner.trim());
        } else {
            this.isEditingReceta = false;
            console.log('➕ Creando nueva Receta');
            this.RecetaSeleccionado = null;

            // Reset completo del formulario con valores por defecto
            this.RecetaForm.reset({
                title: '',
                title_min: '',
                description: '',
                ingredients: '',
                instructions: '',
                category: '',
                url_mini: '',
                url_banner: '',
                time: '',
                people: 1,
                difficulty: 'medio',
                id_coll: null
            });

            console.log('✅ Formulario reseteado para nueva receta');

            // Ocultar previews para nueva receta
            this.imageUrlValidated = false;
            this.bannerUrlValidated = false;
        }

        this.showRecetaModal = true;

        // Agregar listener para cerrar modal al hacer clic fuera
        this.addModalClickListener();
    }

    editReceta(Receta: RecetaItem) {
        console.log('✏️ Editando receta:', Receta);
        this.openRecetaForm(Receta);
    }

    // ⚠️ REGLA: Siempre pedir confirmación para eliminar
    eliminarReceta(Receta: RecetaItem): void {
        this.RecetaToDelete = Receta;
        this.showConfirmDeleteReceta = true;
    }

    cancelDeleteReceta(): void {
        this.RecetaToDelete = null;
        this.showConfirmDeleteReceta = false;
    }

    confirmDeleteReceta(): void {
        if (!this.RecetaToDelete) return;

        this.deletingReceta = true;
        console.log('🗑️ Eliminando receta:', this.RecetaToDelete.id);

        // Obtener datos de sesión - REGLA OBLIGATORIA
        const sessionBase = this.sessionService.getApiPayloadBase();

        from(this.RecetaService.deleteReceta(
            this.RecetaToDelete.id!
        )).subscribe({
            next: (response: any) => {
                console.log('✅ Receta eliminada:', response);

                // Actualizar la lista local removiendo la receta eliminada
                this.recetas = this.recetas.filter(r => r.id !== this.RecetaToDelete!.id);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Receta Eliminada',
                    detail: 'La receta ha sido eliminada correctamente'
                });

                this.RecetaToDelete = null;
                this.showConfirmDeleteReceta = false;
                this.deletingReceta = false;
            },
            error: (error: any) => {
                console.error('❌ Error al eliminar receta:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar la receta',
                    life: 5000
                });
                this.deletingReceta = false;
            }
        });
    }

    // Confirmaciones genéricas
    cancelarConfirmacion(): void {
        this.showConfirmDialog = false;
        this.accionConfirmada = null;
    }

    confirmarAccion(): void {
        if (this.accionConfirmada) {
            this.accionConfirmada();
        }
        this.showConfirmDialog = false;
        this.accionConfirmada = null;
    }

    // Cerrar formulario
    closeRecetaForm(): void {
        this.showRecetaModal = false;
        this.isEditingReceta = false;
        this.RecetaSeleccionado = null;

        // Limpiar event listener y referencias del modal
        this.removeModalClickListener();
        this.modalElement = null;
    }

    // Abrir página de colecciones
    openColeccionesPage(): void {
        console.log('🔗 Navegando a la página de colecciones...');
        this.closeRecetaForm(); // Cerrar el modal antes de navegar
        this.router.navigate(['/adm-ecom/collections']);
    }

    // Guardar receta (crear/editar)
    saveReceta(): void {
        if (!this.RecetaForm.valid) {
            console.log('❌ Formulario inválido');
            this.messageService.add({
                severity: 'error',
                summary: 'Formulario Inválido',
                detail: 'Por favor complete todos los campos requeridos'
            });
            return;
        }

        this.savingReceta = true;
        const formData = this.RecetaForm.value;

        console.log('💾 Guardando receta:', formData);

        // Obtener datos de sesión - REGLA OBLIGATORIA
        const sessionBase = this.sessionService.getApiPayloadBase();

        const saveObservable = this.isEditingReceta
            ? from(this.RecetaService.updateReceta({ ...this.RecetaSeleccionado!, ...formData }))
            : from(this.RecetaService.createReceta(formData));

        saveObservable.subscribe({
            next: (response: any) => {
                console.log('✅ Receta guardada:', response);

                if (this.isEditingReceta) {
                    // Actualizar la receta en la lista local
                    const index = this.recetas.findIndex(r => r.id === this.RecetaSeleccionado!.id);
                    if (index !== -1) {
                        this.recetas[index] = response.data;
                    }
                } else {
                    // Agregar la nueva receta a la lista
                    this.recetas.unshift(response.data);
                }

                this.handleSaveSuccess('Receta guardada correctamente');
            },
            error: (error: any) => {
                console.error('❌ Error al guardar receta:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al guardar la receta',
                    life: 5000
                });
                this.savingReceta = false;
            }
        });
    }

    private handleSaveSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: message
        });

        this.closeRecetaForm();
        this.loadRecetas();
        this.savingReceta = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} Receta:`, error);

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${operation} la receta`,
            life: 5000
        });

        this.savingReceta = false;
    }

    // Probar URL de imagen
    testImageUrl(): void {
        const url = this.RecetaForm.get('url_mini')?.value;

        if (!url || !url.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'URL Vacía',
                detail: 'Por favor ingrese una URL de imagen primero',
                life: 3000
            });
            return;
        }

        // Crear una nueva imagen para probar la URL
        const testImg = new Image();

        testImg.onload = () => {
            this.messageService.add({
                severity: 'success',
                summary: 'Imagen Válida',
                detail: 'La URL de la imagen es accesible',
                life: 3000
            });
        };

        testImg.onerror = () => {
            this.messageService.add({
                severity: 'error',
                summary: 'Imagen No Accesible',
                detail: 'La URL proporcionada no es válida o no se puede acceder',
                life: 5000
            });
        };

        // Establecer timeout para evitar que la petición quede colgada
        setTimeout(() => {
            testImg.src = url;
        }, 100);
    }

    // Validar URL de imagen en tiempo real con debouncing
    onImageUrlInput(event: any): void {
        const url = event.target.value;

        // Limpiar timer anterior
        if (this.imageUrlTimer) {
            clearTimeout(this.imageUrlTimer);
        }

        // Si la URL está vacía, ocultar preview inmediatamente
        if (!url || !url.trim()) {
            this.imageUrlValidated = false;
            return;
        }

        // Esperar 500ms antes de validar (debouncing)
        this.imageUrlTimer = setTimeout(() => {
            // Crear una nueva imagen para probar la URL
            const testImg = new Image();

            testImg.onload = () => {
                // URL válida - mostrar preview
                this.imageUrlValidated = true;
            };

            testImg.onerror = () => {
                // URL inválida - ocultar preview (sin mostrar mensaje para evitar spam)
                this.imageUrlValidated = false;
            };

            // Establecer timeout para evitar que la petición quede colgada
            setTimeout(() => {
                testImg.src = url;
            }, 100);
        }, 500);
    }

    // Validar URL del banner en tiempo real con debouncing
    onBannerUrlInput(event: any): void {
        const url = event.target.value;

        // Limpiar timer anterior
        if (this.bannerUrlTimer) {
            clearTimeout(this.bannerUrlTimer);
        }

        // Si la URL está vacía, ocultar preview inmediatamente
        if (!url || !url.trim()) {
            this.bannerUrlValidated = false;
            return;
        }

        // Esperar 500ms antes de validar (debouncing)
        this.bannerUrlTimer = setTimeout(() => {
            // Crear una nueva imagen para probar la URL
            const testImg = new Image();

            testImg.onload = () => {
                // URL válida - mostrar preview
                this.bannerUrlValidated = true;
            };

            testImg.onerror = () => {
                // URL inválida - ocultar preview (sin mostrar mensaje para evitar spam)
                this.bannerUrlValidated = false;
            };

            // Establecer timeout para evitar que la petición quede colgada
            setTimeout(() => {
                testImg.src = url;
            }, 100);
        }, 500);
    }

    // Validar imagen de la tabla - función mejorada para preview
    async validateTableImage(receta: RecetaItem): Promise<boolean> {
        if (!receta.url_mini || !receta.url_mini.trim()) {
            return false;
        }

        // Crear imagen temporal para validar sin mostrarla en DOM
        const testImg = new Image();

        // Usar Promise para validación asíncrona
        return new Promise((resolve) => {
            testImg.onload = () => resolve(true);
            testImg.onerror = () => resolve(false);

            // Timeout para evitar esperas infinitas
            setTimeout(() => resolve(false), 3000);

            testImg.src = receta.url_mini;
        });
    }

    // Manejar errores de carga de imagen en tabla con mejor UX
    onImageError(event: Event, imgElement?: HTMLImageElement): void {
        const img = imgElement || (event.target as HTMLImageElement);

        // Ocultar la imagen con error
        img.style.display = 'none';
        img.classList.remove('table-image'); // Remover estilos de tabla

        console.log('🔴 Imagen no puede ser mostrada');
        // Mostrar el texto alternativo
        const container = img.parentElement;
        if (container) {
            const errorText = container.querySelector('.absolute') as HTMLElement;
            if (errorText) {
                errorText.classList.remove('hidden');
                errorText.classList.add('block');
            }
        }

        // Actualizar atributos de accesibilidad
        img.alt = 'Imagen no puede ser mostrada';
        img.title = 'La imagen no se pudo cargar';
    }

    // Función para mostrar indicador de carga en imágenes de tabla
    showImageLoading(img: HTMLImageElement): void {
        img.classList.add('image-loading');
        img.style.opacity = '0.5';
    }

    // Función para ocultar indicador de carga
    hideImageLoading(img: HTMLImageElement): void {
        img.classList.remove('image-loading');
        img.style.opacity = '1';
    }

    // Wrapper para manejar el evento load desde el template
    onImageLoad(event: Event): void {
        const img = event.target as HTMLImageElement;
        if (img) {
            this.hideImageLoading(img);

            // Asegurar que el texto de error esté oculto cuando la imagen carga correctamente
            const container = img.parentElement;
            if (container) {
                const errorText = container.querySelector('.absolute') as HTMLElement;
                if (errorText) {
                    errorText.classList.remove('block');
                    errorText.classList.add('hidden');
                }
            }

            // Asegurar que la imagen esté visible
            img.style.display = 'block';
            img.classList.add('table-image');
        }
    }

    formatFecha(fecha: string | Date | null | undefined): string {
        if (!fecha) return '-';

        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return '-';
        }
    }

    private createEmptyReceta(): RecetaItem {
        return {
            id: 0,
            title: '',
            category: '',
            url_mini: '',
            time: '',
            people: 1,
            difficulty: 'medio'
        };
    }
}
