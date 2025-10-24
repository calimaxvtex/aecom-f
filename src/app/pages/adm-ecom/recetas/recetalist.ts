import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmationService, MessageService } from 'primeng/api';

// Servicios específicos del dominio
import { RecetaMockService } from '@/pages/service/receta.service';
import { SessionService } from '@/core/services/session.service';
import { Receta } from '@/types/receta';

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
        InputNumberModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        TooltipModule,
        FloatLabelModule
    ],
    providers: [MessageService, ConfirmationService, DatePipe],
    template: `
        <div class="card">
            <p-table
                #dt
                [value]="recetas"
                [paginator]="true"
                paginatorDropdownAppendTo="body"
                [rows]="10"
                [showCurrentPageReport]="true"
                responsiveLayout="scroll"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} recetas"
                [rowsPerPageOptions]="[5, 10, 25]"
                [globalFilterFields]="['title']"
                [loading]="loadingRecetas"
            >
                <ng-template #caption>
                    <div class="flex flex-wrap gap-2 items-center justify-between">
                        <input
                            pInputText
                            type="text"
                            (input)="onGlobalFilter(dt, $event)"
                            placeholder="Buscar recetas..."
                            class="w-full sm:w-80 order-1 sm:order-0"
                        />
                            <div class="flex gap-2 order-0 sm:order-1">
                                <!-- ✅ PATRÓN CRÍTICO: Botones solo con íconos, raised, sin clases de ancho -->
                                <button
                                    (click)="loadRecetas()"
                                    pButton
                                    raised
                                    icon="pi pi-refresh"
                                    [loading]="loadingRecetas"
                                    pTooltip="Actualizar"
                                ></button>
                                <button
                                    (click)="openRecetaForm()"
                                    pButton
                                    raised
                                    icon="pi pi-plus"
                                    pTooltip="Agregar Receta"
                                ></button>
                        </div>
                    </div>
                </ng-template>

                <ng-template #header>
                    <tr>
                        <th class="white-space-nowrap" style="width:8%">ID</th>
                        <th class="white-space-nowrap" style="width:20%">Título</th>
                        <th class="white-space-nowrap" style="width:12%">Imagen</th>
                        <th class="white-space-nowrap" style="width:12%">Categoría</th>
                        <th class="white-space-nowrap" style="width:10%">Dificultad</th>
                        <th class="white-space-nowrap" style="width:10%">Tiempo</th>
                        <th class="white-space-nowrap" style="width:8%">Porciones</th>
                        <th class="white-space-nowrap" style="width:10%">Estado</th>
                        <th class="white-space-nowrap" style="width:12%">Modificado</th>
                        <th class="white-space-nowrap" style="width:10%">Usuario</th>
                        <th class="white-space-nowrap" style="width:10%">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template #body let-Receta let-editing="editing" let-ri="rowIndex">
                    <tr>
                        <!-- ID (solo vista) -->
                        <td>{{ Receta.id_receta }}</td>

                        <!-- Título (edición inline) -->
                        <td>
                            <!-- Vista normal -->
                            <span
                                *ngIf="editingCell !== Receta.id_receta + '_title'"
                                (click)="editInlineReceta(Receta, 'title'); $event.stopPropagation()"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{Receta.title}}
                            </span>

                            <!-- Vista de edición -->
                            <div
                                *ngIf="editingCell === Receta.id_receta + '_title'"
                                class="inline-edit-container"
                            >
                                <input
                                   pInputText
                                   type="text"
                                   [(ngModel)]="Receta.title"
                                    (keyup.enter)="saveInlineEditReceta(Receta, 'title')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                    placeholder="Título de la receta"
                                />
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEditReceta(Receta, 'title')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    pButton
                                    icon="pi pi-undo"
                                    (click)="cancelInlineEdit()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
                        </td>

                        <!-- Imagen (preview) -->
                        <td class="text-center">
                            <div class="flex justify-center">
                                <!-- Vista normal -->
                                <div
                                    *ngIf="editingCell !== Receta.id_receta + '_url_mini'"
                                    (click)="editInlineReceta(Receta, 'url_mini'); $event.stopPropagation()"
                                    class="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                    title="Clic para editar"
                                >
                                    <img
                                        [src]="Receta.url_mini"
                                        [alt]="Receta.title"
                                        class="w-12 h-12 object-cover rounded border"
                                        (error)="onImageError($event)"
                                    />
                                </div>

                                <!-- Vista de edición -->
                                <div
                                    *ngIf="editingCell === Receta.id_receta + '_url_mini'"
                                    class="inline-edit-container"
                                >
                                    <input
                                        pInputText
                                           type="url"
                                           [(ngModel)]="Receta.url_mini"
                                        (keyup.enter)="saveInlineEditReceta(Receta, 'url_mini')"
                                        (keyup.escape)="cancelInlineEdit()"
                                        class="p-inputtext-sm flex-1"
                                        #input
                                        (focus)="input.select()"
                                        autofocus
                                        placeholder="URL de la imagen"
                                    />
                                    <button
                                        pButton
                                        icon="pi pi-check"
                                        (click)="saveInlineEditReceta(Receta, 'url_mini')"
                                        class="p-button-sm p-button-success p-button-text inline-action-btn"
                                        pTooltip="Guardar (Enter)"
                                    ></button>
                                    <button
                                        pButton
                                        icon="pi pi-undo"
                                        (click)="cancelInlineEdit()"
                                        class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                        pTooltip="Deshacer (Escape)"
                                    ></button>
                                </div>
                            </div>
                        </td>

                        <!-- Categoría -->
                        <td>
                            <!-- Vista normal -->
                            <span
                                *ngIf="editingCell !== Receta.id_receta + '_category'"
                                (click)="editInlineReceta(Receta, 'category'); $event.stopPropagation()"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{Receta.category || '-'}}
                            </span>

                            <!-- Vista de edición -->
                            <div
                                *ngIf="editingCell === Receta.id_receta + '_category'"
                                class="inline-edit-container"
                            >
                                <input
                                   pInputText
                                   type="text"
                                   [(ngModel)]="Receta.category"
                                    (keyup.enter)="saveInlineEditReceta(Receta, 'category')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    (focus)="input.select()"
                                    autofocus
                                    placeholder="Categoría de la receta"
                                />
                                <button
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEditReceta(Receta, 'category')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    pButton
                                    icon="pi pi-undo"
                                    (click)="cancelInlineEdit()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
                        </td>

                        <!-- Dificultad -->
                        <td>
                            <!-- Vista normal -->
                            <span
                                *ngIf="editingCell !== Receta.id_receta + '_difficulty'"
                                (click)="editInlineReceta(Receta, 'difficulty'); $event.stopPropagation()"
                                class="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                <p-tag
                                    [value]="getDifficultyLabel(Receta.difficulty)"
                                    [severity]="getDifficultySeverity(Receta.difficulty)"
                                ></p-tag>
                            </span>

                            <!-- Vista de edición -->
                            <div
                                *ngIf="editingCell === Receta.id_receta + '_difficulty'"
                                class="inline-edit-container"
                            >
                                <select
                                    [(ngModel)]="Receta.difficulty"
                                    (change)="saveInlineEditReceta(Receta, 'difficulty')"
                                    class="p-inputtext-sm flex-1 border rounded px-2 py-1"
                                >
                                <option value="facil">Fácil</option>
                                <option value="medio">Medio</option>
                                <option value="dificil">Difícil</option>
                            </select>
                                <button
                                    pButton
                                    icon="pi pi-undo"
                                    (click)="cancelInlineEdit()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Cancelar (Escape)"
                                ></button>
                            </div>
                        </td>

                        <!-- Tiempo -->
                        <td class="text-center">
                            <span class="text-sm">{{ Receta.time || '-' }}</span>
                        </td>

                        <!-- Porciones -->
                        <td class="text-center">
                            <span class="text-sm">{{ Receta.servings || '-' }}</span>
                        </td>

                        <!-- Estado (botón) -->
                        <td>
                            <p-tag
                                [value]="getStatusLabel(Receta.status)"
                                [severity]="getStatusSeverity(Receta.status)"
                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                (click)="toggleEstado(Receta); $event.stopPropagation()"
                                title="Clic para cambiar"
                            ></p-tag>
                        </td>

                        <!-- Modificado -->
                        <td class="text-center">
                            <span class="text-xs text-gray-600">{{ Receta.fecha_mod || Receta.updated_at | date:'short' }}</span>
                        </td>

                        <!-- Usuario -->
                        <td class="text-center">
                            <span class="text-xs text-gray-600">{{ Receta.usr_m || '-' }}</span>
                        </td>

                        <!-- Acciones -->
                        <td>
                            <div class="flex gap-2">
                                <button
                                    pButton
                                    icon="pi pi-pencil"
                                    (click)="editReceta(Receta)"
                                    class="p-button-sm p-button-text p-button-warning"
                                    pTooltip="Editar Receta"
                                ></button>
                                <button
                                    pButton
                                    icon="pi pi-trash"
                                    (click)="eliminarReceta(Receta)"
                                    class="p-button-sm p-button-text p-button-danger"
                                    pTooltip="Eliminar Receta"
                                ></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- ⚠️ MODAL DE ELIMINACIÓN CON ÍCONO EMOJI -->
        <p-dialog
            [(visible)]="showConfirmDeleteReceta"
            header="Confirmar Eliminación"
            [modal]="true"
            [style]="{width: '400px', minHeight: '200px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
            [maximizable]="false"
        >
            <div class="flex items-center gap-4 mb-4">
                <span class="text-8xl animate-bounce">⚠️</span>
                <div>
                    <h4 class="font-semibold text-xl mb-1">¿Eliminar Receta?</h4>
                    <p class="text-gray-700 text-lg">
                        ¿Estás seguro de que deseas eliminar
                        <strong>"{{RecetaToDelete?.title}}"</strong>?
                    </p>
                    <p class="text-sm text-red-600 mt-2 font-medium">
                        ⚠️ Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                    pButton
                    type="button"
                    (click)="cancelDeleteReceta()"
                    label="Cancelar"
                    class="p-button-text"
                ></button>
                <button
                    pButton
                    type="button"
                    (click)="confirmDeleteReceta()"
                    label="Eliminar"
                    class="p-button-danger"
                    [loading]="deletingReceta"
                ></button>
            </div>
        </p-dialog>

        <!-- ⚠️ MODAL DE CONFIRMACIÓN GENÉRICO -->
        <p-dialog
            [(visible)]="showConfirmDialog"
            [header]="confirmHeader"
            [modal]="true"
            [style]="{width: '400px'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <div class="flex items-center gap-4 mb-4">
                <span class="text-4xl">⚠️</span>
                <div>
                    <p class="text-gray-700">{{ confirmMessage }}</p>
                </div>
                        </div>

            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                    pButton
                    type="button"
                    (click)="cancelarConfirmacion()"
                    label="Cancelar"
                    class="p-button-text"
                ></button>
                <button
                    pButton
                    type="button"
                    (click)="confirmarAccion()"
                    label="Confirmar"
                    class="p-button-danger"
                ></button>
                        </div>
        </p-dialog>

        <!-- FORMULARIO MODAL CON LABELS FLOTANTES -->
        <p-dialog
            [(visible)]="showRecetaModal"
            [header]="isEditingReceta ? 'Editar Receta' : 'Nueva Receta'"
            [modal]="true"
            [style]="{width: '700px', maxHeight: '80vh'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="RecetaForm" (ngSubmit)="saveReceta()">
                <div class="grid grid-cols-1 gap-4" style="max-height: 60vh; overflow-y: auto; padding-right: 8px;">
                    <!-- Campos principales -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <p-floatLabel variant="on">
                                <input pInputText
                                       formControlName="title"
                                       placeholder="Título de la receta"
                                       class="w-full"
                                       autofocus />
                                <label>Título *</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <p-floatLabel variant="on">
                                <input pInputText
                                       formControlName="title_min"
                                       placeholder="Título corto"
                                       class="w-full" />
                                <label>Título Corto</label>
                            </p-floatLabel>
                        </div>
                        </div>

                    <!-- Imágenes -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <p-floatLabel variant="on">
                                <input pInputText
                                       formControlName="url_mini"
                                       placeholder="https://ejemplo.com/imagen.jpg"
                                       class="w-full" />
                                <label>URL Imagen Mini *</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <p-floatLabel variant="on">
                                <input pInputText
                                       formControlName="url_banner"
                                       placeholder="https://ejemplo.com/banner.jpg"
                                       class="w-full" />
                                <label>URL Imagen Banner</label>
                            </p-floatLabel>
                        </div>
                    </div>

                    <!-- Descripción -->
                    <div>
                        <p-floatLabel variant="on">
                            <textarea
                                pInputTextarea
                                formControlName="description"
                                placeholder="Describe la receta brevemente"
                                class="w-full"
                                rows="3">
                            </textarea>
                            <label>Descripción</label>
                        </p-floatLabel>
                        </div>

                    <!-- Ingredientes -->
                    <div>
                        <p-floatLabel variant="on">
                            <textarea
                                pInputTextarea
                                formControlName="ingredients"
                                placeholder="Lista de ingredientes separados por comas"
                                class="w-full"
                                rows="3">
                            </textarea>
                            <label>Ingredientes</label>
                        </p-floatLabel>
                        </div>

                    <!-- Instrucciones -->
                    <div>
                        <p-floatLabel variant="on">
                            <textarea
                                pInputTextarea
                                formControlName="instructions"
                                placeholder="Pasos para preparar la receta"
                                class="w-full"
                                rows="4">
                            </textarea>
                            <label>Instrucciones</label>
                        </p-floatLabel>
                        </div>

                    <!-- Campos numéricos y selectores -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <p-floatLabel variant="on">
                                <input pInputText
                                       formControlName="time"
                                       placeholder="ej: 45 min"
                                       class="w-full" />
                                <label>Tiempo</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <p-floatLabel variant="on">
                                <p-inputNumber
                                    formControlName="servings"
                                    [min]="1"
                                    [max]="50"
                                    placeholder="1"
                                    class="w-full">
                                </p-inputNumber>
                                <label>Porciones</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <p-floatLabel variant="on">
                                <p-inputNumber
                                    formControlName="id_coll"
                                    [min]="1"
                                    placeholder="1"
                                    class="w-full">
                                </p-inputNumber>
                                <label>ID Colección</label>
                            </p-floatLabel>
                        </div>
                        </div>

                    <!-- Categoría y dificultad -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <p-floatLabel variant="on">
                                <input pInputText
                                       formControlName="category"
                                       placeholder="Categoría de la receta"
                                       class="w-full" />
                                <label>Categoría</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <p-floatLabel variant="on">
                                <p-select
                                    formControlName="difficulty"
                                    [options]="[
                                        { label: 'Fácil', value: 'facil' },
                                        { label: 'Medio', value: 'medio' },
                                        { label: 'Difícil', value: 'dificil' }
                                    ]"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Seleccione dificultad"
                                    class="w-full"
                                    appendTo="body">
                                </p-select>
                                <label>Dificultad *</label>
                            </p-floatLabel>
                        </div>
                    </div>

                    <!-- Estado -->
                    <div>
                        <p-floatLabel variant="on">
                            <p-select
                                formControlName="status"
                                [options]="[
                                    { label: 'Activo', value: 'activo' },
                                    { label: 'Inactivo', value: 'inactivo' },
                                    { label: 'Borrador', value: 'borrador' }
                                ]"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Seleccione estado"
                                class="w-full"
                                appendTo="body">
                            </p-select>
                            <label>Estado *</label>
                        </p-floatLabel>
                </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                        pButton
                        type="button"
                        (click)="closeRecetaForm()"
                        label="Cancelar"
                        class="p-button-text"
                    ></button>
                    <button
                        pButton
                        type="button"
                        (click)="saveReceta()"
                        [label]="isEditingReceta ? 'Actualizar' : 'Crear'"
                        [disabled]="!RecetaForm.valid || savingReceta"
                        [loading]="savingReceta"
                        class="p-button-success"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Toast para mensajes -->
        <p-toast></p-toast>
    `,
    styles: [`
        .inline-edit-container {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .inline-action-btn {
            padding: 0.25rem;
            min-width: 2rem;
        }

        .editable-cell {
            display: block;
            min-height: 1.5rem;
        }

        .p-datatable .p-datatable-tbody > tr > td {
            padding: 0.5rem;
            vertical-align: middle;
        }

        .p-datatable .p-datatable-tbody > tr:hover {
            background-color: #f8fafc;
        }

        /* Estilos para botones de tabla */
        .p-button.p-button-text.p-button-sm {
            width: 2rem !important;
            height: 2rem !important;
            min-width: 2rem !important;
            padding: 0 !important;
            border-radius: 0.25rem !important;
        }

        .p-button.p-button-text.p-button-sm .p-button-icon {
            font-size: 0.875rem !important;
        }

        /* Fila seleccionada */
        .bg-blue-50 {
            background-color: #eff6ff !important;
        }

        /* Scroll personalizado para formularios */
        .grid::-webkit-scrollbar {
            width: 8px;
        }

        .grid::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .grid::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }

        .grid::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
    `]
})
export class RecetaList implements OnInit {
    // Datos
    recetas: Receta[] = [];
    RecetaSeleccionado: Receta | null = null;

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

    // Confirmaciones
    RecetaToDelete: Receta | null = null;
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;

    // Confirmación de estado
    showConfirmDialog = false;

    constructor(
        private fb: FormBuilder,
        private RecetaService: RecetaMockService,
        private sessionService: SessionService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.initializeForms();
    }

    ngOnInit() {
        this.loadRecetas();
    }

    // Inicialización
    initializeForms(): void {
        this.RecetaForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            title_min: [''],
            description: [''],
            ingredients: [''],
            instructions: [''],
            url_mini: ['', [Validators.required]],
            url_banner: [''],
            time: [''],
            servings: [1, [Validators.min(1), Validators.max(50)]],
            category: [''],
            difficulty: ['medio', [Validators.required]],
            status: ['borrador', [Validators.required]],
            id_coll: [1, [Validators.required, Validators.min(1)]]
        });
    }

    loadRecetas() {
        this.loadingRecetas = true;
        this.RecetaService.getRecetas().then((Recetas) => {
            this.recetas = Recetas;
            this.loadingRecetas = false;
        }).catch((error) => {
            console.error('❌ Error al cargar recetas:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar las recetas',
                life: 5000
            });
            this.loadingRecetas = false;
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
            'borrador': 'Borrador'
        };
        return labels[status as keyof typeof labels] || status;
    }

    getStatusSeverity(status: string): 'success' | 'danger' | 'warning' | 'info' {
        const severities: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
            'activo': 'success',
            'inactivo': 'danger',
            'borrador': 'warning'
        };
        return severities[status as keyof typeof severities] || 'info';
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
        return severities[difficulty as keyof typeof severities] || 'info';
    }

    toggleEstado(Receta: Receta): void {
        const nuevoEstado = Receta.status === 'activo' ? 'inactivo' : 'activo';

        if (nuevoEstado === 'inactivo') {
            // ⚠️ REGLA: Confirmar desactivación
            this.confirmMessage = `¿Está seguro de que desea desactivar "${Receta.title}"?`;
            this.confirmHeader = 'Confirmar Desactivación';
            this.accionConfirmada = () => this.procesarCambioEstado(Receta, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            // Activar directamente
            this.procesarCambioEstado(Receta, nuevoEstado);
        }
    }

    private procesarCambioEstado(Receta: Receta, nuevoEstado: string): void {
        const estadoAnterior = Receta.status;
        Receta.status = nuevoEstado as any;

        const sessionBase = this.sessionService.getApiPayloadBase();

        this.RecetaService.updateRecetaField(
            Receta.id_receta!,
            'status',
            nuevoEstado,
            sessionBase
        ).subscribe({
            next: (response) => {
                console.log('✅ Estado actualizado:', response);

                Receta.fecha_mod = new Date().toISOString();
                Receta.usr_m = String(sessionBase.usr) || Receta.usr_m;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado Actualizado',
                    detail: `Receta ${nuevoEstado === 'activo' ? 'activada' : 'desactivada'} correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local
                Receta.status = estadoAnterior;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado',
                    life: 5000
                });
            }
        });
    }

    editReceta(Receta: Receta) {
        this.openRecetaForm(Receta);
    }

    // ⚠️ REGLA: Siempre pedir confirmación para eliminar
    eliminarReceta(Receta: Receta): void {
        this.RecetaToDelete = Receta;
        this.showConfirmDeleteReceta = true;
    }

    confirmDeleteReceta(): void {
        if (this.RecetaToDelete) {
            this.deletingReceta = true;

            const sessionBase = this.sessionService.getApiPayloadBase();
            const payload = {
                action: 'DL' as const,
                id: this.RecetaToDelete.id_receta,
                ...sessionBase
            };

            this.RecetaService.deleteReceta(this.RecetaToDelete.id_receta!).then((response) => {
                console.log('✅ Receta eliminada:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminada',
                    detail: 'Receta eliminada correctamente'
                });

                // Si el item eliminado estaba seleccionado, deseleccionar
                if (this.RecetaSeleccionado?.id_receta === this.RecetaToDelete?.id_receta) {
                    this.RecetaSeleccionado = null;
                }

                this.cancelDeleteReceta();
                this.loadRecetas();
            }).catch((error) => {
                console.error('❌ Error al eliminar Receta:', error);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar la receta',
                    life: 5000
                });

                this.deletingReceta = false;
            });
        }
    }

    cancelDeleteReceta(): void {
        this.showConfirmDeleteReceta = false;
        this.RecetaToDelete = null;
        this.deletingReceta = false;
    }

    // ========== CONFIRMACIONES GENÉRICAS ==========

    cancelarConfirmacion(): void {
        this.showConfirmDialog = false;
        this.confirmMessage = '';
        this.confirmHeader = '';
        this.accionConfirmada = null;
    }

    confirmarAccion(): void {
        if (this.accionConfirmada) {
            this.accionConfirmada();
            this.cancelarConfirmacion();
        }
    }

    // Abrir formulario
    openRecetaForm(Receta?: Receta): void {
        this.isEditingReceta = !!Receta;

        if (Receta) {
            console.log('✏️ Editando Receta:', Receta);
            this.RecetaSeleccionado = Receta;
            this.RecetaForm.patchValue({
                title: Receta.title,
                title_min: Receta.title_min || '',
                description: Receta.description || '',
                ingredients: Receta.ingredients || '',
                instructions: Receta.instructions || '',
                url_mini: Receta.url_mini || '',
                url_banner: Receta.url_banner || '',
                time: Receta.time || '',
                servings: Receta.servings || 1,
                category: Receta.category || '',
                difficulty: Receta.difficulty || 'medio',
                status: Receta.status,
                id_coll: Receta.id_coll ? Number(Receta.id_coll) : 1
            });
        } else {
            console.log('➕ Creando nueva Receta');
            this.RecetaSeleccionado = null;
            this.RecetaForm.reset({
                status: 'borrador',
                difficulty: 'medio',
                servings: 1,
                id_coll: 1
            });
        }

        this.showRecetaModal = true;
    }

    // Cerrar formulario
    closeRecetaForm(): void {
        this.showRecetaModal = false;
        this.isEditingReceta = false;
        this.RecetaSeleccionado = null;
    }

    // Guardar
    saveReceta(): void {
        if (this.RecetaForm.valid) {
            this.savingReceta = true;
            const formData = this.RecetaForm.value;

            const sessionBase = this.sessionService.getApiPayloadBase();

            if (this.isEditingReceta && this.RecetaSeleccionado) {
                // Actualizar
                const payload = {
                    action: 'UP' as const,
                    id: this.RecetaSeleccionado.id_receta,
                    ...formData,
                    ...sessionBase
                };

                this.RecetaService.updateReceta(this.RecetaSeleccionado).then((response) => {
                    console.log('✅ Receta actualizada:', response);
                    this.handleSaveSuccess('Receta actualizada correctamente');
                }).catch((error) => this.handleSaveError(error, 'actualizar'));
            } else {
                // Crear
                const payload = {
                    action: 'IN' as const,
                    ...formData,
                    ...sessionBase
                };

                this.RecetaService.createReceta(formData).then((response) => {
                    console.log('✅ Receta creada:', response);
                    this.handleSaveSuccess('Receta creada correctamente');
                }).catch((error) => this.handleSaveError(error, 'crear'));
            }
        }
    }

    onImageError(event: any) {
        event.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
    }

    // ========== EDICIÓN INLINE ESTÁNDAR ==========

    // Iniciar edición
    editInlineReceta(Receta: Receta, field: string): void {
        this.editingCell = Receta.id_receta + '_' + field;
        this.originalValue = (Receta as any)[field];
        console.log('✏️ Editando inline:', field, 'Valor:', this.originalValue);
    }

    // Guardar edición
    saveInlineEditReceta(Receta: Receta, field: string): void {
        console.log('💾 Guardando inline:', field, 'Nuevo valor:', (Receta as any)[field]);

        if ((Receta as any)[field] === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando');
            this.cancelInlineEdit();
            return;
        }

        // Obtener datos de sesión - REGLA OBLIGATORIA
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.RecetaService.updateRecetaField(
            Receta.id_receta!,
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

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Error al actualizar ${this.getFieldLabel(field)}`,
                    life: 5000
                });
            }
        });
    }

    // Cancelar edición
    cancelInlineEdit(): void {
        this.editingCell = null;
        this.originalValue = null;
    }

    // ========== MÉTODOS DE UTILIDAD ESTÁNDAR ==========

    getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            'title': 'Título',
            'title_min': 'Título Corto',
            'description': 'Descripción',
            'ingredients': 'Ingredientes',
            'instructions': 'Instrucciones',
            'url_mini': 'URL Imagen Mini',
            'url_banner': 'URL Imagen Banner',
            'time': 'Tiempo',
            'servings': 'Porciones',
            'category': 'Categoría',
            'difficulty': 'Dificultad',
            'status': 'Estado',
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

    private createEmptyReceta(): Receta {
        return {
            id_receta: 0,
            title: '',
            title_min: '',
            description: '',
            ingredients: '',
            instructions: '',
            url_mini: '',
            url_banner: '',
            time: '',
            servings: 1,
            status: 'borrador',
            estado: 'BO',
            difficulty: 'medio',
            category: '',
            id_coll: 1
        };
    }
}
