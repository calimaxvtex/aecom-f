import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError } from 'rxjs';

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
                        <th class="white-space-nowrap" style="width:6%">ID</th>
                        <th class="white-space-nowrap" style="width:15%">Título</th>
                        <th class="white-space-nowrap" style="width:10%">Imagen</th>
                        <th class="white-space-nowrap" style="width:10%">Categoría</th>
                        <th class="white-space-nowrap" style="width:15%">Descripción</th>
                        <th class="white-space-nowrap" style="width:8%">Dificultad</th>
                        <th class="white-space-nowrap" style="width:8%">Tiempo</th>
                        <th class="white-space-nowrap" style="width:6%">Porc.</th>
                        <th class="white-space-nowrap" style="width:10%">Fecha</th>
                        <th class="white-space-nowrap" style="width:12%">Colección</th>
                        <th class="white-space-nowrap" style="width:8%">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template #body let-Receta let-editing="editing" let-ri="rowIndex">
                    <tr>
                        <!-- ID (solo vista) -->
                        <td>{{ Receta.id }}</td>

                        <!-- Título (edición inline) -->
                        <td class="text-xs">
                            <div class="flex flex-col gap-1">
                                <!-- Título Principal -->
                                <div>
                                    <span
                                        *ngIf="editingCell !== Receta.id + '_title'"
                                        (click)="editInlineReceta(Receta, 'title'); $event.stopPropagation()"
                                        class="editable-cell cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded transition-colors font-medium"
                                        pTooltip="Clic para editar título principal"
                                    >
                                        {{Receta.title}}
                                    </span>

                                    <!-- Vista de edición título principal -->
                                    <div
                                        *ngIf="editingCell === Receta.id + '_title'"
                                        class="inline-edit-container mb-1"
                                    >
                                        <input
                                           pInputText
                                           type="text"
                                           [(ngModel)]="Receta.title"
                                           (input)="onInputChange(Receta, 'title')"
                                           (blur)="cancelInlineEditByBlur()"
                                            (keyup.enter)="saveInlineEditReceta(Receta, 'title')"
                                            (keyup.escape)="cancelInlineEdit()"
                                            class="p-inputtext-xs w-full"
                                            #input
                                            [attr.aria-label]="'title-' + Receta.id"
                                            placeholder="Título principal"
                                        />
                                        <div class="flex gap-1 mt-1" *ngIf="hasChanges">
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditReceta(Receta, 'title')"
                                                class="inline-action-btn p-button-success p-button-text"
                                                pTooltip="Guardar título"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEdit()"
                                                class="inline-action-btn p-button-secondary p-button-text"
                                                pTooltip="Cancelar"
                                            ></button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Título Corto (si existe) -->
                                <div *ngIf="Receta.title_min" class="text-gray-500">
                                    <span
                                        *ngIf="editingCell !== Receta.id + '_title_min'"
                                        (click)="editInlineReceta(Receta, 'title_min'); $event.stopPropagation()"
                                        class="editable-cell cursor-pointer hover:bg-blue-100 px-1 py-0.5 rounded transition-colors text-xs"
                                        title="Clic para editar título corto"
                                    >
                                        ({{Receta.title_min}})
                                    </span>

                                    <!-- Vista de edición título corto -->
                                    <div
                                        *ngIf="editingCell === Receta.id + '_title_min'"
                                        class="inline-edit-container"
                                    >
                                        <input
                                           pInputText
                                           type="text"
                                           [(ngModel)]="Receta.title_min"
                                           (input)="onInputChange(Receta, 'title_min')"
                                           (blur)="cancelInlineEditByBlur()"
                                            (keyup.enter)="saveInlineEditReceta(Receta, 'title_min')"
                                            (keyup.escape)="cancelInlineEdit()"
                                            class="p-inputtext-xs w-full"
                                            #input
                                            [attr.aria-label]="'title_min-' + Receta.id"
                                            placeholder="Título corto"
                                        />
                                        <div class="flex gap-1 mt-1" *ngIf="hasChanges">
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditReceta(Receta, 'title_min')"
                                                class="inline-action-btn p-button-success p-button-text"
                                                pTooltip="Guardar título corto"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEdit()"
                                                class="inline-action-btn p-button-secondary p-button-text"
                                                pTooltip="Cancelar"
                                            ></button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </td>

                        <!-- Imagen (preview) -->
                        <td class="text-center">
                            <div class="flex justify-center">
                                <!-- Vista normal -->
                                <div
                                    *ngIf="editingCell !== Receta.id + '_url_mini'"
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
                                    *ngIf="editingCell === Receta.id + '_url_mini'"
                                    class="inline-edit-container"
                                >
                                    <input
                                        pInputText
                                           type="url"
                                           [(ngModel)]="Receta.url_mini"
                                           (input)="onInputChange(Receta, 'url_mini')"
                                           (blur)="cancelInlineEditByBlur()"
                                        (keyup.enter)="saveInlineEditReceta(Receta, 'url_mini')"
                                        (keyup.escape)="cancelInlineEdit()"
                                        class="p-inputtext-sm flex-1"
                                        #input
                                        [attr.aria-label]="'url_mini-' + Receta.id"
                                        placeholder="URL de la imagen"
                                    />
                                    <button
                                        *ngIf="hasChanges"
                                        pButton
                                        icon="pi pi-check"
                                        (click)="saveInlineEditReceta(Receta, 'url_mini')"
                                        class="p-button-sm p-button-success p-button-text inline-action-btn"
                                        pTooltip="Guardar (Enter)"
                                    ></button>
                                    <button
                                        *ngIf="hasChanges"
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
                                *ngIf="editingCell !== Receta.id + '_category'"
                                (click)="editInlineReceta(Receta, 'category'); $event.stopPropagation()"
                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                {{Receta.category || '-'}}
                            </span>

                            <!-- Vista de edición -->
                            <div
                                *ngIf="editingCell === Receta.id + '_category'"
                                class="inline-edit-container"
                            >
                                <input
                                   pInputText
                                   type="text"
                                   [(ngModel)]="Receta.category"
                                   (input)="onInputChange(Receta, 'category')"
                                   (blur)="cancelInlineEditByBlur()"
                                    (keyup.enter)="saveInlineEditReceta(Receta, 'category')"
                                    (keyup.escape)="cancelInlineEdit()"
                                    class="p-inputtext-sm flex-1"
                                    #input
                                    [attr.aria-label]="'category-' + Receta.id"
                                    placeholder="Categoría de la receta"
                                />
                                <button
                                    *ngIf="hasChanges"
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEditReceta(Receta, 'category')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    *ngIf="hasChanges"
                                    pButton
                                    icon="pi pi-undo"
                                    (click)="cancelInlineEdit()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
                        </td>

                        <!-- Descripción e Ingredientes -->
                        <td class="text-xs">
                            <div class="flex flex-col gap-1">
                                <!-- Descripción -->
                                <div>
                                    <span
                                        *ngIf="editingCell !== Receta.id + '_description'"
                                        (click)="editInlineReceta(Receta, 'description'); $event.stopPropagation()"
                                        class="editable-cell cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded transition-colors"
                                        title="Clic para editar descripción"
                                        [class.text-gray-500]="!Receta.description"
                                    >
                                        <strong>Desc:</strong> {{ Receta.description || 'Sin descripción' | slice:0:20 }}{{ Receta.description && Receta.description.length > 20 ? '...' : '' }}
                                    </span>

                                    <!-- Vista de edición descripción -->
                                    <div
                                        *ngIf="editingCell === Receta.id + '_description'"
                                        class="inline-edit-container mb-1"
                                    >
                                        <textarea
                                            [(ngModel)]="Receta.description"
                                            (input)="onInputChange(Receta, 'description')"
                                            (blur)="cancelInlineEditByBlur()"
                                            (keyup.enter)="saveInlineEditReceta(Receta, 'description')"
                                            (keyup.escape)="cancelInlineEdit()"
                                            class="p-inputtext-xs w-full border rounded px-1 py-0.5"
                                            rows="2"
                                            #input
                                            [attr.aria-label]="'description-' + Receta.id"
                                            placeholder="Descripción de la receta"
                                            style="resize: none;"
                                        ></textarea>
                                        <div class="flex gap-1 mt-1" *ngIf="hasChanges">
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditReceta(Receta, 'description')"
                                                class="inline-action-btn p-button-success p-button-text"
                                                pTooltip="Guardar descripción"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEdit()"
                                                class="inline-action-btn p-button-secondary p-button-text"
                                                pTooltip="Cancelar"
                                            ></button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Ingredientes -->
                                <div *ngIf="Receta.ingredients" class="text-gray-600">
                                    <span
                                        *ngIf="editingCell !== Receta.id + '_ingredients'"
                                        (click)="editInlineReceta(Receta, 'ingredients'); $event.stopPropagation()"
                                        class="editable-cell cursor-pointer hover:bg-green-50 px-1 py-0.5 rounded transition-colors"
                                        title="Clic para editar ingredientes"
                                    >
                                        <strong>Ing:</strong> {{ Receta.ingredients | slice:0:25 }}{{ Receta.ingredients && Receta.ingredients.length > 25 ? '...' : '' }}
                                    </span>

                                    <!-- Vista de edición ingredientes -->
                                    <div
                                        *ngIf="editingCell === Receta.id + '_ingredients'"
                                        class="inline-edit-container"
                                    >
                                        <textarea
                                            [(ngModel)]="Receta.ingredients"
                                            (input)="onInputChange(Receta, 'ingredients')"
                                            (blur)="cancelInlineEditByBlur()"
                                            (keyup.enter)="saveInlineEditReceta(Receta, 'ingredients')"
                                            (keyup.escape)="cancelInlineEdit()"
                                            class="p-inputtext-xs w-full border rounded px-1 py-0.5"
                                            rows="3"
                                            #input
                                            [attr.aria-label]="'ingredients-' + Receta.id"
                                            placeholder="Lista de ingredientes separados por comas"
                                            style="resize: none;"
                                        ></textarea>
                                        <div class="flex gap-1 mt-1" *ngIf="hasChanges">
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditReceta(Receta, 'ingredients')"
                                                class="inline-action-btn p-button-success p-button-text"
                                                pTooltip="Guardar ingredientes"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEdit()"
                                                class="inline-action-btn p-button-secondary p-button-text"
                                                pTooltip="Cancelar"
                                            ></button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Botón para agregar ingredientes si no existen -->
                                <button
                                    *ngIf="!Receta.ingredients && editingCell !== Receta.id + '_description' && editingCell !== Receta.id + '_ingredients'"
                                    (click)="editInlineReceta(Receta, 'ingredients'); $event.stopPropagation()"
                                    pButton
                                    icon="pi pi-plus"
                                    class="inline-action-btn p-button-text p-button-secondary"
                                    pTooltip="Agregar ingredientes"
                                ></button>
                            </div>
                        </td>

                        <!-- Dificultad -->
                        <td>
                            <!-- Vista normal -->
                            <span
                                *ngIf="editingCell !== Receta.id + '_difficulty'"
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
                                *ngIf="editingCell === Receta.id + '_difficulty'"
                                class="inline-edit-container"
                            >
                                <select
                                    [(ngModel)]="Receta.difficulty"
                                    (change)="onInputChange(Receta, 'difficulty')"
                                    class="p-inputtext-sm flex-1 border rounded px-2 py-1"
                                >
                                <option value="facil">Fácil</option>
                                <option value="medio">Medio</option>
                                <option value="dificil">Difícil</option>
                            </select>
                                <button
                                    *ngIf="hasChanges"
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEditReceta(Receta, 'difficulty')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
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
                            <span class="text-sm">{{ Receta.people || Receta.servings || '-' }}</span>
                        </td>

                        <!-- Fecha -->
                        <td class="text-center">
                            <span class="text-sm">{{ formatFecha(Receta.date || Receta.fecha_cre || Receta.createdAt) }}</span>
                        </td>

                        <!-- Colección -->
                        <td>
                            <!-- Vista normal -->
                            <span
                                *ngIf="editingCell !== Receta.id + '_id_coll'"
                                (click)="editInlineReceta(Receta, 'id_coll'); $event.stopPropagation()"
                                class="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                title="Clic para editar"
                            >
                                <span *ngIf="getCollectionName(Receta.id_coll); else noCollection" class="text-sm">
                                    {{ getCollectionName(Receta.id_coll) }}
                                </span>
                                <ng-template #noCollection>
                                    <span class="text-gray-400 italic text-sm">Sin colección</span>
                                </ng-template>
                            </span>

                            <!-- Vista de edición -->
                            <div
                                *ngIf="editingCell === Receta.id + '_id_coll'"
                                class="inline-edit-container"
                            >
                                <select
                                    [(ngModel)]="Receta.id_coll"
                                    (change)="onInputChange(Receta, 'id_coll')"
                                    class="p-inputtext-sm flex-1 border rounded px-2 py-1"
                                >
                                    <option value="">Sin colección</option>
                                    <option *ngFor="let coll of colecciones" [attr.value]="coll.id_coll">
                                        {{ coll.nombre }}
                                    </option>
                                </select>
                                <button
                                    *ngIf="hasChanges"
                                    pButton
                                    icon="pi pi-check"
                                    (click)="saveInlineEditReceta(Receta, 'id_coll')"
                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                    pTooltip="Guardar (Enter)"
                                ></button>
                                <button
                                    *ngIf="hasChanges"
                                    pButton
                                    icon="pi pi-undo"
                                    (click)="cancelInlineEdit()"
                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                    pTooltip="Deshacer (Escape)"
                                ></button>
                            </div>
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
            [style]="{width: '1000px', maxHeight: '90vh', maxWidth: '95vw'}"
            [draggable]="false"
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="RecetaForm" (ngSubmit)="saveReceta()">
                <div class="grid grid-cols-1 gap-6 p-2" style="max-height: 75vh; overflow-y: auto; padding-right: 12px;">
                    <!-- Información Básica -->
                    <div class="form-section border-b border-gray-200 pb-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="pi pi-info-circle mr-2 text-blue-500"></i>
                            Información Básica
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p-floatLabel variant="on">
                                <input pInputText
                                       formControlName="title"
                                       placeholder="Título completo de la receta"
                                       class="w-full"
                                       autofocus />
                                <label>Título Principal *</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <p-floatLabel variant="on">
                                <input pInputText
                                       formControlName="title_min"
                                       placeholder="Título corto/acortado"
                                       class="w-full" />
                                <label>Título Corto</label>
                            </p-floatLabel>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Colección</label>
                            <p-select
                                formControlName="id_coll"
                                [options]="colecciones"
                                optionLabel="nombre"
                                optionValue="id_coll"
                                [placeholder]="colecciones && colecciones.length > 0 ? 'Selecciona una colección RECET' : 'No hay colecciones RECET disponibles'"
                                class="w-full"
                                [showClear]="true"
                                [disabled]="!colecciones || colecciones.length === 0">
                            </p-select>
                            <small class="text-gray-500 mt-1 block" *ngIf="!colecciones || colecciones.length === 0">
                                No hay colecciones de tipo RECET disponibles.
                                <button
                                    type="button"
                                    class="text-blue-500 hover:text-blue-700 underline ml-1"
                                    (click)="openColeccionesPage()">
                                    Crear colección RECET
                                </button>
                            </small>
                        </div>
                        </div>
                    </div>

                    <!-- Detalles Adicionales -->
                    <div class="form-section border-b border-gray-200 pb-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="pi pi-cog mr-2 text-green-500"></i>
                            Detalles Adicionales
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <input pInputText
                                       type="url"
                                       formControlName="url_mini"
                                       placeholder="https://ejemplo.com/imagen.jpg"
                                       class="w-full" />
                                <label>URL Imagen Miniatura *</label>
                            </p-floatLabel>
                        </div>
                        </div>
                    </div>

                    <!-- Contenido de la Receta -->
                    <div class="form-section border-b border-gray-200 pb-4">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="pi pi-book mr-2 text-purple-500"></i>
                            Contenido de la Receta
                        </h3>

                        <!-- Descripción -->
                    <div>
                        <p-floatLabel variant="on">
                            <textarea
                                pInputTextarea
                                formControlName="description"
                                placeholder="Describe brevemente la receta, sus características principales y por qué es especial..."
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
                                placeholder="Lista todos los ingredientes separados por comas: Arroz bomba 600g, pollo 400g, conejo 300g, judías verdes 250g..."
                                class="w-full"
                                rows="4">
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
                                placeholder="Describe paso a paso cómo preparar la receta: 1. Preparar el sofrito lentamente... 2. Añadir las carnes marinadas..."
                                class="w-full"
                                rows="5">
                            </textarea>
                            <label>Instrucciones</label>
                        </p-floatLabel>
                    </div>
                    </div>

                    <!-- Especificaciones -->
                    <div class="form-section">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="pi pi-clock mr-2 text-orange-500"></i>
                            Especificaciones
                        </h3>

                        <!-- Campos numéricos -->
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
                                    formControlName="people"
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

        /* Botones ultra pequeños para edición inline */
        .p-button.p-button-text.inline-action-btn {
            width: 1.5rem !important;
            height: 1.5rem !important;
            min-width: 1.5rem !important;
            max-width: 1.5rem !important;
            padding: 0 !important;
            border-radius: 0.2rem !important;
            margin: 0 0.125rem !important;
        }

        .p-button.p-button-text.inline-action-btn .p-button-icon {
            font-size: 0.75rem !important;
            line-height: 1 !important;
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

        /* Estilos para textareas en el modal */
        .p-inputtextarea {
            min-height: 80px;
            resize: vertical;
            font-family: inherit;
        }

        .p-float-label textarea:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 1px #4f46e5;
        }

        /* Mejorar legibilidad de placeholders en textareas */
        .p-inputtextarea::placeholder {
            color: #9ca3af;
            font-size: 0.875rem;
            line-height: 1.25rem;
        }

        /* Espaciado adicional para campos largos */
        .p-float-label:has(textarea) {
            margin-bottom: 1rem;
        }

        /* Estilos para las secciones del formulario */
        .form-section h3 {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }

        .form-section h3 i {
            font-size: 1.1rem;
        }

        /* Mejorar apariencia del modal */
        .p-dialog .p-dialog-content {
            padding: 1.5rem;
        }

        .p-dialog .p-dialog-header {
            padding: 1.5rem 1.5rem 1rem 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }

        .p-dialog .p-dialog-footer {
            padding: 1rem 1.5rem 1.5rem 1.5rem;
            border-top: 1px solid #e5e7eb;
        }

        /* Responsive design para campos */
        @media (max-width: 768px) {
            .grid-cols-1.md\\:grid-cols-2 {
                grid-template-columns: 1fr;
            }

            .grid-cols-1.md\\:grid-cols-3 {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class RecetaList implements OnInit {
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

    // Confirmaciones
    RecetaToDelete: RecetaItem | null = null;
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;

    // Confirmación de estado
    showConfirmDialog = false;

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

    // Inicialización
    initializeForms(): void {
        /**
         * FORMULARIO DE RECETAS - CAMPOS Y SU MAPEO A LA BASE DE DATOS:
         *
         * Campos del Formulario → Campos de la BD:
         * - title (requerido) → titulo (Título principal completo)
         * - title_min → titulo_min (Título corto/acortado)
         * - description → descripcion (Descripción detallada)
         * - ingredients → ingredientes (Lista de ingredientes)
         * - instructions → instrucciones (Pasos de preparación)
         * - category → categoria (Categoría de la receta)
         * - url_mini (requerido) → url_mini (URL de imagen miniatura)
         * - time → tiempo (Tiempo de preparación)
         * - people → personas (Número de porciones)
         * - difficulty (requerido) → dificultad (Nivel de dificultad)
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
                console.log('✅ Recetas cargadas desde backend:', this.recetas);
            },
            error: (error) => {
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
                console.log('🔍 Respuesta cruda del backend para RECET:', response);

                // Procesar respuesta similar al método getAllCollections del servicio
                let responseData: any;

                if (Array.isArray(response)) {
                    responseData = response.length > 0 ? response[0] : null;
                } else if (response && typeof response === 'object') {
                    responseData = response;
                } else {
                    responseData = null;
                }

                // Si hay datos, procesar el string JSON si es necesario
                if (responseData && responseData.data) {
                    if (typeof responseData.data === 'string') {
                        try {
                            const parsedData = JSON.parse(responseData.data);
                            responseData.data = parsedData;
                        } catch (error) {
                            console.error('❌ Error parseando datos RECET:', error);
                            responseData.data = [];
                        }
                    } else if (Array.isArray(responseData.data)) {
                        // Ya es array, verificar si necesita aplanamiento
                        if (responseData.data.length > 0 && responseData.data[0] && typeof responseData.data[0] === 'object' && responseData.data[0].data) {
                            responseData.data = responseData.data[0].data;
                        }
                    }
                }

                return responseData;
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
                this.colecciones = response?.data || [];
                console.log('✅ Colecciones RECET cargadas:', this.colecciones);
                console.log('📊 Número de colecciones RECET:', this.colecciones?.length || 0);

                if (this.colecciones && this.colecciones.length > 0) {
                    console.log('🎯 Primera colección RECET de ejemplo:', this.colecciones[0]);
                    console.log('📋 Nombres disponibles:', this.colecciones.map(c => c.nombre));
                } else {
                    console.warn('⚠️ No se encontraron colecciones de tipo RECET');
                }
            },
            error: (error) => {
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

    formatFecha(fecha: string | undefined): string {
        if (!fecha) return '-';

        try {
            const date = new Date(fecha);

            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) return '-';

            // Formatear como DD/MM/YYYY
            const dia = date.getDate().toString().padStart(2, '0');
            const mes = (date.getMonth() + 1).toString().padStart(2, '0');
            const anio = date.getFullYear();

            return `${dia}/${mes}/${anio}`;
        } catch (error) {
            console.warn('Error formateando fecha:', fecha, error);
            return '-';
        }
    }

    // Función simplificada ya que el backend no maneja estados
    toggleEstado(Receta: RecetaItem): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Información',
            detail: 'El backend no maneja estados de activación/desactivación'
        });
    }

    editReceta(Receta: RecetaItem) {
        this.openRecetaForm(Receta);
    }

    // ⚠️ REGLA: Siempre pedir confirmación para eliminar
    eliminarReceta(Receta: RecetaItem): void {
        this.RecetaToDelete = Receta;
        this.showConfirmDeleteReceta = true;
    }

    confirmDeleteReceta(): void {
        if (this.RecetaToDelete) {
            this.deletingReceta = true;

            const sessionBase = this.sessionService.getApiPayloadBase();
            const payload = {
                action: 'DL' as const,
                id: this.RecetaToDelete.id,
                ...sessionBase
            };

            this.RecetaService.deleteReceta(this.RecetaToDelete.id!).then((response) => {
                console.log('✅ Receta eliminada:', response);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminada',
                    detail: 'Receta eliminada correctamente'
                });

                // Si el item eliminado estaba seleccionado, deseleccionar
                if (this.RecetaSeleccionado?.id === this.RecetaToDelete?.id) {
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
                time: Receta.time || '',
                people: Receta.people || 1,
                difficulty: Receta.difficulty || 'medio',
                id_coll: Receta.id_coll || null // Campo de colección
            };

            console.log('📝 Datos preparados para formulario:', formData);

            // Usar setValue en lugar de patchValue para asegurar que todos los campos se actualicen
            this.RecetaForm.setValue(formData);

            console.log('✅ Formulario actualizado con datos de la receta');
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
                time: '',
                people: 1,
                difficulty: 'medio',
                id_coll: null
            });

            console.log('✅ Formulario reseteado para nueva receta');
        }

        this.showRecetaModal = true;
    }

    // Cerrar formulario
    closeRecetaForm(): void {
        this.showRecetaModal = false;
        this.isEditingReceta = false;
        this.RecetaSeleccionado = null;
    }

    // Abrir página de colecciones
    openColeccionesPage(): void {
        console.log('🔗 Navegando a la página de colecciones...');
        this.closeRecetaForm(); // Cerrar el modal antes de navegar
        this.router.navigate(['/adm-ecom/collections']);
    }

    // Guardar
    saveReceta(): void {
        console.log('💾 Iniciando guardado de receta...');
        console.log('📋 Estado del formulario:', {
            isValid: this.RecetaForm.valid,
            isEditing: this.isEditingReceta,
            formErrors: this.RecetaForm.errors,
            formValue: this.RecetaForm.value
        });

        if (this.RecetaForm.valid) {
            this.savingReceta = true;
            const formData = this.RecetaForm.value;

            console.log('✅ Formulario válido. Datos del formulario:', JSON.stringify(formData, null, 2));

            const sessionBase = this.sessionService.getApiPayloadBase();
            console.log('🔑 Datos de sesión:', sessionBase);

            if (this.isEditingReceta && this.RecetaSeleccionado) {
                console.log('✏️ Modo edición activado');

                // Actualizar - preparar datos con el ID correcto
                const updateData: RecetaFormItem = {
                    id: this.RecetaSeleccionado.id,
                    ...formData
                };

                console.log('🚀 Datos finales a enviar al servicio:', {
                    updateData: JSON.stringify(updateData, null, 2),
                    idReceta: this.RecetaSeleccionado.id,
                    todosLosCampos: Object.keys(updateData)
                });

                this.RecetaService.actualizarReceta(updateData).subscribe({
                    next: (response) => {
                        console.log('✅ Respuesta del servicio de actualización:', response);
                        this.handleSaveSuccess('Receta actualizada correctamente');
                    },
                    error: (error) => {
                        console.error('❌ Error en actualización:', error);
                        console.error('❌ Detalles del error:', {
                            message: error.message,
                            status: error.status,
                            body: error.error
                        });
                        this.handleSaveError(error, 'actualizar');
                    }
                });
            } else {
                console.log('➕ Modo creación activado');

                // Crear - preparar datos para el servicio
                console.log('🚀 Datos a enviar para creación:', {
                    formData: JSON.stringify(formData, null, 2),
                    sessionBase: sessionBase,
                    todosLosCampos: Object.keys(formData)
                });

                this.RecetaService.createReceta(formData).then((response) => {
                    console.log('✅ Respuesta del servicio de creación:', response);
                    this.handleSaveSuccess('Receta creada correctamente');
                }).catch((error) => {
                    console.error('❌ Error en creación:', error);
                    this.handleSaveError(error, 'crear');
                });
            }

            // Finalizar el estado de carga
            this.savingReceta = false;
            console.log('🏁 Proceso de guardado finalizado');
        } else {
            console.log('❌ Formulario inválido. Errores:', this.RecetaForm.errors);
            // Marcar todos los campos como tocados para mostrar errores
            Object.keys(this.RecetaForm.controls).forEach(key => {
                this.RecetaForm.get(key)?.markAsTouched();
            });
        }
    }

    onImageError(event: any) {
        event.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
    }

    // ========== EDICIÓN INLINE ESTÁNDAR ==========

    // Estado para controlar la transición entre campos
    private isTransitioningFields = false;

    // Iniciar edición
    editInlineReceta(Receta: RecetaItem, field: string): void {
        const newEditingCell = Receta.id + '_' + field;

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
        setTimeout(() => {
            const inputElement = document.querySelector(`input[aria-label="${field}-${Receta.id}"]`) as HTMLInputElement;
            const textareaElement = document.querySelector(`textarea[aria-label="${field}-${Receta.id}"]`) as HTMLTextAreaElement;

            const element = inputElement || textareaElement;
            if (element) {
                element.focus();
                // Posicionar el cursor al final del texto
                const textLength = element.value.length;
                element.setSelectionRange(textLength, textLength);
                console.log('🎯 Elemento enfocado:', element.tagName);
            }

            // Resetear el flag de transición después de enfocar
            setTimeout(() => {
                this.isTransitioningFields = false;
            }, 100);
        }, 50);
    }

    // Detectar cambios en el input
    onInputChange(Receta: RecetaItem, field: string): void {
        const currentValue = (Receta as any)[field];
        console.log(`📝 onInputChange ${field}:`, {
            current: currentValue,
            original: this.originalValue,
            currentType: typeof currentValue,
            originalType: typeof this.originalValue,
            areEqual: currentValue === this.originalValue
        });
        this.hasChanges = currentValue !== this.originalValue;
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

                // Forzar detección de cambios para actualizar la vista
                this.cdr.detectChanges();

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
                this.isTransitioningFields = false; // Resetear flag de transición

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
                const [recetaId, field] = this.editingCell.split('_');
                const receta = this.recetas.find(r => r.id === parseInt(recetaId));
                if (receta) {
                    (receta as any)[field] = this.originalValue;
                    console.log('🔄 Valor restaurado por blur:', field, 'Valor original:', this.originalValue);
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
        console.log('🛑 CANCELANDO:', {
            editingCell: this.editingCell,
            hasChanges: this.hasChanges,
            originalValue: this.originalValue,
            originalType: typeof this.originalValue
        });

        if (this.editingCell && this.hasChanges) {
            const [recetaId, field] = this.editingCell.split('_');
            const receta = this.recetas.find(r => r.id === parseInt(recetaId));

            if (receta) {
                const valorAntes = (receta as any)[field];
                console.log(`🔄 Restaurando ${field}:`, {
                    antes: valorAntes,
                    antesType: typeof valorAntes,
                    original: this.originalValue,
                    originalType: typeof this.originalValue
                });

                // Restaurar el valor original (misma lógica para todos los campos)
                (receta as any)[field] = this.originalValue;
                this.cdr.detectChanges();

                const valorDespues = (receta as any)[field];
                console.log(`✅ Después de restaurar ${field}:`, {
                    despues: valorDespues,
                    restauracionExitosa: valorDespues === this.originalValue
                });
            }
        }

        this.editingCell = null;
        this.originalValue = null;
        this.hasChanges = false;
        this.isTransitioningFields = false;
    }

    // ========== MÉTODOS DE UTILIDAD ESTÁNDAR ==========

    getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            'title': 'Título Principal',
            'title_min': 'Título Corto',
            'description': 'Descripción',
            'ingredients': 'Ingredientes',
            'instructions': 'Instrucciones',
            'url_mini': 'URL Imagen Miniatura',
            'url_banner': 'URL Imagen Banner',
            'time': 'Tiempo',
            'servings': 'Porciones',  // Para edición inline
            'people': 'Porciones',    // Para formulario
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
