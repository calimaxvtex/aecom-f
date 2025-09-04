import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// PrimeNG Modules (standalone)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';

// Modelos y servicios
import { Tabloide, TabloideForm } from '@/features/tabloide/models/tabloide.interface';
import { TabloideService } from '@/features/tabloide/services/tabloide.service';
import { SessionService } from '@/core/services/session.service';

@Component({
    selector: 'app-tabadm',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        TabsModule,
        TooltipModule,
        CardModule,
        ImageModule,
        ProgressBarModule
    ],
    providers: [MessageService],
    template: `
        <div class="card">
            <p-toast></p-toast>
            
            <!-- Diálogo de confirmación personalizado -->
            <p-dialog 
                header="{{confirmHeader}}" 
                [(visible)]="showConfirmDialog" 
                [modal]="true" 
                [style]="{width: '450px'}"
                [closable]="true"
                (onHide)="cancelarConfirmacion()"
            >
                <div class="flex align-items-center gap-3 mb-3">
                    <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                    <span class="text-lg">{{confirmMessage}}</span>
                </div>
                
                <div class="flex justify-content-end gap-2 mt-4">
                    <p-button 
                        label="Cancelar" 
                        icon="pi pi-times" 
                        severity="secondary"
                        (onClick)="cancelarConfirmacion()"
                    ></p-button>
                    <p-button 
                        label="Sí, Confirmar" 
                        icon="pi pi-check" 
                        severity="danger"
                        (onClick)="confirmarAccion()"
                    ></p-button>
                </div>
            </p-dialog>
            
            <!-- Pestañas principales -->
            <p-tabs [value]="activeTabIndex.toString()" (onTabChange)="onTabChange($event)">
                <p-tablist>
                    <p-tab value="0">
                        <i class="pi pi-file-image mr-2"></i>
                        Tabloides
                    </p-tab>
                    <p-tab value="1">
                        <i class="pi pi-eye mr-2"></i>
                        Preview
                    </p-tab>
                </p-tablist>
                
                <p-tabpanels>
                    <!-- Panel 1: Tabloides CRUD -->
                    <p-tabpanel value="0">
                        <div class="mb-4">
                            <h1 class="text-2xl font-bold mb-2">📰 Administración de Tabloides</h1>
                            <p class="text-gray-600 mb-4">Gestiona los tabloides y sus enlaces</p>
                        </div>

                        <p-table
                            #dtTableides
                            [value]="tabloides"
                            [paginator]="true"
                            [rows]="10"
                            [showCurrentPageReport]="true"
                            responsiveLayout="scroll"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tabloides"
                            [rowsPerPageOptions]="[10, 25, 50]"
                            [globalFilterFields]="['nombre', 'descripcion', 'usr_a', 'usr_m']"
                            selectionMode="single"
                            [(selection)]="tabloideSeleccionado"
                            (onRowSelect)="onTabloideSelect($event)"
                        >
                            <ng-template #caption>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <input 
                                        pInputText
                                        type="text" 
                                        (input)="onGlobalFilter(dtTableides, $event)" 
                                        placeholder="Buscar tabloides..." 
                                        class="w-full sm:w-80 order-1 sm:order-0"
                                    />
                                    <div class="flex gap-2 order-0 sm:order-1">
                                        <button 
                                            (click)="cargarTableides()" 
                                            pButton 
                                            raised 
                                            class="w-full sm:w-auto" 
                                            icon="pi pi-refresh" 
                                            label="Actualizar"
                                            [loading]="loadingTableides"
                                        ></button>
                                        <button 
                                            (click)="openTabloideForm()" 
                                            pButton 
                                            raised 
                                            class="w-full sm:w-auto" 
                                            icon="pi pi-plus" 
                                            label="Agregar Tabloide"
                                        ></button>
                                    </div>
                                </div>
                            </ng-template>

                            <ng-template #header>
                                <tr>
                                    <th pSortableColumn="id_tab" style="width: 80px">ID <p-sortIcon field="id_tab"></p-sortIcon></th>
                                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                                    <th pSortableColumn="descripcion" style="min-width: 300px">Descripción <p-sortIcon field="descripcion"></p-sortIcon></th>
                                    <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                                    <th pSortableColumn="fecha_mod" style="width: 150px">Modificado <p-sortIcon field="fecha_mod"></p-sortIcon></th>
                                    <th pSortableColumn="usr_m" style="width: 120px">Usuario <p-sortIcon field="usr_m"></p-sortIcon></th>
                                    <th style="width: 100px">Miniatura</th>
                                    <th style="width: 150px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-tabloide>
                                <tr 
                                    [class.bg-blue-50]="tabloide === tabloideSeleccionado"
                                    (click)="seleccionarTabloideParaPreview(tabloide)"
                                    (dblclick)="seleccionarYMostrarPreview(tabloide)"
                                    class="cursor-pointer hover:bg-gray-50 transition-colors"
                                    pTooltip="Clic para seleccionar • Doble clic para ver preview"
                                >
                                    <!-- ID - NO EDITABLE -->
                                    <td>{{tabloide.id_tab}}</td>
                                    
                                    <!-- Nombre - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== tabloide.id_tab + '_nombre'"
                                            (click)="editInlineTabloide(tabloide, 'nombre'); $event.stopPropagation()"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{tabloide.nombre}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === tabloide.id_tab + '_nombre'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="tabloide.nombre"
                                                (keyup.enter)="saveInlineEditTabloide(tabloide, 'nombre')"
                                                (keyup.escape)="cancelInlineEdit()"
                                                class="p-inputtext-sm flex-1"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Nombre del tabloide"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditTabloide(tabloide, 'nombre')"
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
                                    
                                    <!-- Descripción - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== tabloide.id_tab + '_descripcion'"
                                            (click)="editInlineTabloide(tabloide, 'descripcion'); $event.stopPropagation()"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{tabloide.descripcion || 'Sin descripción'}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === tabloide.id_tab + '_descripcion'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="tabloide.descripcion"
                                                (keyup.enter)="saveInlineEditTabloide(tabloide, 'descripcion')"
                                                (keyup.escape)="cancelInlineEdit()"
                                                class="p-inputtext-sm flex-1"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Descripción del tabloide"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditTabloide(tabloide, 'descripcion')"
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
                                    
                                    <!-- Estado - TOGGLE SWITCH -->
                                    <td>
                                        <p-tag 
                                            [value]="getEstadoLabel(tabloide.estado)" 
                                            [severity]="getEstadoSeverity(tabloide.estado)"
                                            (click)="toggleEstado(tabloide); $event.stopPropagation()"
                                            class="cursor-pointer hover:opacity-80 transition-opacity"
                                            title="Clic para cambiar"
                                        ></p-tag>
                                    </td>
                                    
                                    <!-- Fecha Modificación -->
                                    <td>{{tabloide.fecha_mod | date:'short'}}</td>
                                    
                                    <!-- Usuario que modificó -->
                                    <td>{{tabloide.usr_m}}</td>
                                    
                                    <!-- Miniatura -->
                                    <td>
                                        <img 
                                            [src]="tabloide.imagen" 
                                            [alt]="tabloide.nombre"
                                            class="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                            (click)="seleccionarTabloide(tabloide)"
                                            pTooltip="Clic para ver en preview"
                                            onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyNEM0MS45NDExIDI0IDUwIDMyLjA1ODkgNTAgNDJDNTAgNTEuOTQxMSA0MS45NDExIDYwIDMyIDYwQzIyLjA1ODkgNjAgMTQgNTEuOTQxMSAxNCA0MkMxNCAzMi4wNTg5IDIyLjA1ODkgMjQgMzIgMjRaIiBmaWxsPSIjOTg5OEE5Ii8+CjxwYXRoIGQ9Ik0zMiAzNkMzNS4zMTM3IDM2IDM4IDMzLjMxMzcgMzggMzBDMzggMjYuNjg2MyAzNS4zMTM3IDI0IDMyIDI0QzI4LjY4NjMgMjQgMjYgMjYuNjg2MyAyNiAzMEMyNiAzMy4zMTM3IDI4LjY4NjMgMzYgMzIgMzZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'"
                                        />
                                    </td>
                                    
                                    <!-- Acciones -->
                                    <td (click)="$event.stopPropagation()">
                                        <div class="flex gap-1">
                                            <button
                                                pButton
                                                icon="pi pi-pencil"
                                                (click)="openTabloideForm(tabloide)"
                                                class="p-button-sm p-button-text p-button-warning"
                                                pTooltip="Editar Tabloide"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-trash"
                                                (click)="eliminarTabloide(tabloide)"
                                                class="p-button-sm p-button-text p-button-danger"
                                                pTooltip="Eliminar Tabloide"
                                            ></button>
                                        </div>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-tabpanel>
                    
                    <!-- Panel 2: Preview -->
                    <p-tabpanel value="1">
                        <div *ngIf="!tabloideSeleccionado" class="text-center p-8">
                            <i class="pi pi-image text-gray-400 text-6xl mb-4"></i>
                            <h3 class="text-xl font-semibold text-gray-600 mb-2">No hay tabloide seleccionado</h3>
                            <p class="text-gray-500 mb-4">Selecciona un tabloide de la tabla para ver su preview</p>
                            <button 
                                (click)="activeTabIndex = 0" 
                                pButton 
                                label="Ir a Tabloides" 
                                icon="pi pi-arrow-left"
                                class="p-button-outlined"
                            ></button>
                        </div>

                        <!-- Layout maximizado sin títulos -->
                        <div *ngIf="tabloideSeleccionado" class="h-screen-preview grid grid-cols-1 lg:grid-cols-3 gap-4" style="height: calc(100vh - 200px);">
                            <!-- Información del Tabloide con miniatura (1/3 del ancho) -->
                            <div class="bg-white rounded-lg border p-6 shadow-sm h-full overflow-y-auto">
                                <div class="h-full">
                                    <!-- Información principal reorganizada -->
                                    <div class="w-full space-y-6">
                                        <div>
                                            <label class="text-sm font-medium text-gray-600 mb-1 block">Nombre:</label>
                                            <p class="text-xl font-semibold text-gray-900">{{tabloideSeleccionado.nombre}}</p>
                                        </div>
                                        <div>
                                            <label class="text-sm font-medium text-gray-600 mb-1 block">Descripción:</label>
                                            <p class="text-base leading-relaxed text-gray-700">{{tabloideSeleccionado.descripcion || 'Sin descripción'}}</p>
                                        </div>
                                        <div>
                                            <label class="text-sm font-medium text-gray-600 mb-1 block">Usuario:</label>
                                            <p class="text-base text-gray-700">{{tabloideSeleccionado.usr_m}}</p>
                                        </div>
                                        
                                        <!-- Estado y botones al mismo nivel -->
                                        <div class="flex items-center gap-4">
                                            <div class="flex items-center gap-2">
                                                <label class="text-sm font-medium text-gray-600">Estado:</label>
                                                <p-tag 
                                                    [value]="getEstadoLabel(tabloideSeleccionado.estado)" 
                                                    [severity]="getEstadoSeverity(tabloideSeleccionado.estado)"
                                                    class="text-sm"
                                                ></p-tag>
                                            </div>
                                            <button 
                                                (click)="openTabloideForm(tabloideSeleccionado)" 
                                                pButton 
                                                label="Editar" 
                                                icon="pi pi-pencil"
                                                class="p-button-warning p-button-sm"
                                            ></button>
                                            <button 
                                                (click)="abrirTabloide(tabloideSeleccionado.src)" 
                                                pButton 
                                                label="Abrir Tabloide" 
                                                icon="pi pi-external-link"
                                                class="p-button-success p-button-sm"
                                            ></button>
                                        </div>
                                        
                                        <!-- Miniatura más grande (50% más grande: 36x36) -->
                                        <div class="flex justify-center pt-4">
                                            <div class="relative">
                                                <img 
                                                    [src]="tabloideSeleccionado.imagen" 
                                                    [alt]="tabloideSeleccionado.nombre"
                                                    class="w-36 h-36 object-cover rounded-lg border shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                                                    (click)="ampliarImagen(tabloideSeleccionado.imagen)"
                                                    (load)="imageLoaded = true"
                                                    (error)="imageError = true"
                                                    [style.display]="imageLoaded || imageError ? 'block' : 'none'"
                                                    pTooltip="Clic para ampliar"
                                                />
                                                <div 
                                                    *ngIf="!imageLoaded && !imageError" 
                                                    class="flex items-center justify-center w-36 h-36 bg-gray-100 rounded-lg border"
                                                >
                                                    <i class="pi pi-spin pi-spinner text-gray-400 text-xl"></i>
                                                </div>
                                                <div 
                                                    *ngIf="imageError" 
                                                    class="flex items-center justify-center w-36 h-36 bg-gray-100 rounded-lg border text-gray-400"
                                                >
                                                    <i class="pi pi-image text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Fecha modificación centrada debajo de la miniatura -->
                                        <div class="text-center">
                                            <label class="text-xs font-medium text-gray-500 block mb-1">Última Modificación:</label>
                                            <p class="text-xs text-gray-600 leading-tight">{{tabloideSeleccionado.fecha_mod | date:'medium'}}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Preview del Tabloide maximizado (2/3 del ancho) -->
                            <div class="lg:col-span-2 bg-white rounded-lg border shadow-sm h-full overflow-hidden">
                                <div class="h-full flex flex-col">
                                    <!-- Iframe maximizado -->
                                    <div class="flex-1 p-2">
                                        <iframe 
                                            [src]="getSafeUrl(tabloideSeleccionado.src)"
                                            class="w-full h-full rounded border-0"
                                            frameborder="0"
                                            allowfullscreen
                                            title="Preview del Tabloide"
                                            style="min-height: calc(100vh - 320px);"
                                        ></iframe>
                                    </div>
                                    
                                    <!-- Footer con controles en la parte inferior -->
                                    <div class="flex justify-between items-center p-3 border-t bg-gray-50">
                                        <div class="flex items-center gap-2">
                                            <i class="pi pi-file-pdf text-red-500"></i>
                                            <span class="text-sm font-medium text-gray-700">Preview del Tabloide</span>
                                        </div>
                                        <button 
                                            (click)="abrirTabloide(tabloideSeleccionado.src)" 
                                            pButton 
                                            label="Ventana Nueva" 
                                            icon="pi pi-external-link"
                                            class="p-button-outlined p-button-sm"
                                            pTooltip="Abrir en pestaña nueva"
                                        ></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>

        <!-- Modal Tabloide -->
        <p-dialog 
            [(visible)]="showTabloideModal" 
            [header]="isEditingTabloide ? 'Editar Tabloide' : 'Nuevo Tabloide'"
            [modal]="true" 
            [style]="{width: '700px', maxHeight: '80vh'}"
            [draggable]="false" 
            [resizable]="false"
            [closable]="true"
        >
            <form [formGroup]="tabloideForm" (ngSubmit)="saveTabloide()">
                <div class="grid grid-cols-1 gap-4" style="max-height: 60vh; overflow-y: auto; padding-right: 8px;">
                    <!-- Nombre -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Nombre *</label>
                        <input 
                            pInputText 
                            formControlName="nombre"
                            placeholder="Nombre del tabloide"
                            class="w-full"
                        />
                        <small *ngIf="tabloideForm.get('nombre')?.invalid && tabloideForm.get('nombre')?.touched" 
                               class="text-red-500">
                            El nombre es obligatorio
                        </small>
                    </div>
                    
                    <!-- Descripción -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Descripción</label>
                        <textarea 
                            pInputText 
                            formControlName="descripcion"
                            placeholder="Descripción del tabloide (opcional)"
                            class="w-full"
                            rows="3"
                        ></textarea>
                    </div>
                    
                    <!-- Estado -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Estado *</label>
                        <p-select 
                            formControlName="estado"
                            [options]="getEstadosOptions()"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar estado"
                            class="w-full"
                        ></p-select>
                    </div>
                    
                    <!-- URL del Tabloide -->
                    <div>
                        <label class="block text-sm font-medium mb-1">URL del Tabloide (FlipHTML5) *</label>
                        <div class="flex gap-2">
                            <input 
                                pInputText 
                                formControlName="src"
                                placeholder="https://online.fliphtml5.com/..."
                                class="w-full"
                            />
                            <button
                                pButton
                                icon="pi pi-external-link"
                                type="button"
                                (click)="testTabloideUrl()"
                                class="p-button-sm p-button-outlined p-button-info"
                                pTooltip="Probar URL"
                                [disabled]="!tabloideForm.get('src')?.value"
                            ></button>
                        </div>
                        <small *ngIf="tabloideForm.get('src')?.invalid && tabloideForm.get('src')?.touched" 
                               class="text-red-500">
                            La URL del tabloide es obligatoria
                        </small>
                    </div>
                    
                    <!-- URL de la Imagen -->
                    <div>
                        <label class="block text-sm font-medium mb-1">URL de la Miniatura *</label>
                        <div class="flex gap-2">
                            <input 
                                pInputText 
                                formControlName="imagen"
                                placeholder="https://imagenes.calimaxjs.com/..."
                                class="w-full"
                            />
                            <button
                                pButton
                                icon="pi pi-image"
                                type="button"
                                (click)="testImageUrl()"
                                class="p-button-sm p-button-outlined p-button-info"
                                pTooltip="Probar imagen"
                                [disabled]="!tabloideForm.get('imagen')?.value"
                            ></button>
                        </div>
                        <small *ngIf="tabloideForm.get('imagen')?.invalid && tabloideForm.get('imagen')?.touched" 
                               class="text-red-500">
                            La URL de la imagen es obligatoria
                        </small>
                        
                        <!-- Preview de la imagen -->
                        <div *ngIf="tabloideForm.get('imagen')?.value" class="mt-2">
                            <img 
                                [src]="tabloideForm.get('imagen')?.value" 
                                alt="Preview"
                                class="w-32 h-32 object-cover rounded border"
                                onerror="this.style.display='none'"
                                onload="this.style.display='block'"
                            />
                        </div>
                    </div>
                </div>
                
                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button 
                        pButton 
                        type="button" 
                        (click)="closeTabloideForm()" 
                        label="Cancelar" 
                        class="p-button-text"
                    ></button>
                    <button 
                        pButton 
                        type="button" 
                        (click)="saveTabloide()" 
                        [label]="isEditingTabloide ? 'Actualizar' : 'Crear'"
                        [disabled]="!tabloideForm.valid || savingTabloide"
                        [loading]="savingTabloide"
                        class="p-button-success"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de Confirmación para Eliminar -->
        <p-dialog 
            [(visible)]="showConfirmDeleteTabloide" 
            header="Confirmar Eliminación"
            [modal]="true" 
            [style]="{width: '400px', minHeight: '200px'}"
            [draggable]="false" 
            [resizable]="false"
            [closable]="true"
            [maximizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Eliminar Tabloide?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas eliminar el tabloide 
                        <strong>"{{tabloideToDelete?.nombre}}"</strong>?
                    </p>
                    <p class="text-sm text-red-600 mt-2">
                        ⚠️ Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>
            
            <!-- Botones -->
            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                    pButton 
                    type="button" 
                    (click)="cancelDeleteTabloide()" 
                    label="Cancelar" 
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    type="button" 
                    (click)="confirmDeleteTabloide()" 
                    label="Eliminar" 
                    class="p-button-danger"
                    [loading]="deletingTabloide"
                ></button>
            </div>
        </p-dialog>

        <!-- Modal para ampliar imagen -->
        <p-dialog 
            [(visible)]="showImageModal" 
            header="Imagen Ampliada"
            [modal]="true" 
            [style]="{width: '90vw', maxWidth: '800px', maxHeight: '90vh'}"
            [draggable]="false" 
            [resizable]="false"
            [closable]="true"
        >
            <div class="text-center">
                <img 
                    [src]="imageModalSrc" 
                    alt="Imagen ampliada"
                    class="max-w-full h-auto rounded"
                />
            </div>
        </p-dialog>
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
export class TabAdmComponent implements OnInit {
    // Datos
    tabloides: Tabloide[] = [];
    tabloideSeleccionado: Tabloide | null = null;

    // Estados de carga
    loadingTableides = false;
    savingTabloide = false;
    deletingTabloide = false;

    // Estados de modales
    showTabloideModal = false;
    showConfirmDeleteTabloide = false;
    showConfirmDialog = false;
    showImageModal = false;

    // Estados del preview
    imageLoaded = false;
    imageError = false;
    imageModalSrc = '';

    // Formularios
    tabloideForm!: FormGroup;
    isEditingTabloide = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Confirmaciones
    tabloideToDelete: Tabloide | null = null;
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;

    // Tabs
    activeTabIndex = 0;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private tabloideService: TabloideService,
        private sessionService: SessionService,
        private messageService: MessageService,
        private sanitizer: DomSanitizer
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        console.log('🚀 TabAdmComponent inicializado');
        this.cargarTableides();
    }

    // ========== MÉTODOS DE INICIALIZACIÓN ==========

    initializeForms(): void {
        this.tabloideForm = this.fb.group({
            nombre: ['', [Validators.required]],
            descripcion: [''],
            estado: ['A', [Validators.required]],
            src: ['', [Validators.required]],
            imagen: ['', [Validators.required]]
        });
    }

    // ========== MÉTODOS DE DATOS ==========

    cargarTableides(): void {
        console.log('📊 Cargando tabloides...');
        this.loadingTableides = true;

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();
        const payload = { action: 'SL' as const, ...sessionBase };

        this.tabloideService.getTableides(payload).subscribe({
            next: (response) => {
                console.log('✅ Tabloides cargados:', response);
                
                // Procesar respuesta (puede venir como array con wrapper)
                let dataToProcess = null;
                
                if (Array.isArray(response)) {
                    if (response.length === 1 && response[0] && 
                        (response[0].statuscode === 200) && 
                        response[0].data) {
                        dataToProcess = response[0].data;
                    } else {
                        dataToProcess = response;
                    }
                } else if (response && response.statuscode === 200 && response.data) {
                    dataToProcess = response.data;
                }

                if (dataToProcess && Array.isArray(dataToProcess)) {
                    this.tabloides = dataToProcess;
                    console.log('✅ Tabloides procesados:', this.tabloides.length, 'registros');
                } else {
                    console.error('❌ Formato de respuesta inesperado:', response);
                    this.tabloides = [];
                }

                this.loadingTableides = false;
            },
            error: (error) => {
                console.error('❌ Error al cargar tabloides:', error);
                this.loadingTableides = false;
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los tabloides',
                    life: 5000
                });
            }
        });
    }

    // ========== MÉTODOS DE UI ==========

    onTabChange(event: any): void {
        // En PrimeNG v20, el event puede tener diferentes propiedades
        const newIndex = event.index !== undefined ? parseInt(event.index) : parseInt(event.value);
        this.activeTabIndex = newIndex;
        console.log('📑 Tab cambiado a:', this.activeTabIndex, 'desde evento:', event);
    }

    onGlobalFilter(table: any, event: any): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onTabloideSelect(event: any): void {
        console.log('📋 Tabloide seleccionado:', event.data);
        this.tabloideSeleccionado = event.data;
        this.imageLoaded = false;
        this.imageError = false;
    }

    seleccionarTabloide(tabloide: Tabloide): void {
        this.tabloideSeleccionado = tabloide;
        this.activeTabIndex = 1; // Cambiar a tab de preview
        this.imageLoaded = false;
        this.imageError = false;
        console.log('👁️ Mostrando preview de:', tabloide.nombre);
    }

    seleccionarTabloideParaPreview(tabloide: Tabloide): void {
        console.log('🖱️ Seleccionando tabloide para preview:', tabloide.nombre);
        this.tabloideSeleccionado = tabloide;
        this.imageLoaded = false;
        this.imageError = false;
        // No cambiar de tab automáticamente, solo seleccionar
    }

    seleccionarYMostrarPreview(tabloide: Tabloide): void {
        console.log('👁️ Doble clic - Seleccionando y mostrando preview de:', tabloide.nombre);
        this.tabloideSeleccionado = tabloide;
        this.imageLoaded = false;
        this.imageError = false;
        
        // Si ya estamos en el tab de preview, primero ir al tab 0 y luego al 1
        if (this.activeTabIndex === 1) {
            this.activeTabIndex = 0;
            setTimeout(() => {
                this.activeTabIndex = 1;
                console.log('🔄 Forzando transición 0->1 para cambio de tabloide. ActiveTabIndex:', this.activeTabIndex);
            }, 50);
        } else {
            // Si estamos en otro tab, cambiar directamente al preview
            setTimeout(() => {
                this.activeTabIndex = 1;
                console.log('🔄 Cambiando a tab de preview. ActiveTabIndex:', this.activeTabIndex);
            }, 50);
        }
    }

    verPreview(tabloide: Tabloide): void {
        this.seleccionarTabloide(tabloide);
    }

    abrirTabloide(url: string): void {
        if (url) {
            window.open(url, '_blank');
            console.log('🔗 Abriendo tabloide:', url);
        }
    }

    ampliarImagen(src: string): void {
        this.imageModalSrc = src;
        this.showImageModal = true;
    }

    // ========== MÉTODOS DE FORMULARIO ==========

    openTabloideForm(tabloide?: Tabloide): void {
        this.isEditingTabloide = !!tabloide;
        
        if (tabloide) {
            console.log('✏️ Editando tabloide:', tabloide);
            this.tabloideForm.patchValue({
                nombre: tabloide.nombre,
                descripcion: tabloide.descripcion,
                estado: tabloide.estado,
                src: tabloide.src,
                imagen: tabloide.imagen
            });
        } else {
            console.log('➕ Creando nuevo tabloide');
            this.tabloideForm.reset({
                estado: 'A'
            });
        }
        
        this.showTabloideModal = true;
    }

    closeTabloideForm(): void {
        this.showTabloideModal = false;
        this.tabloideForm.reset();
        this.isEditingTabloide = false;
    }

    saveTabloide(): void {
        if (this.tabloideForm.valid) {
            this.savingTabloide = true;
            const formData = this.tabloideForm.value;
            
            // Obtener datos de sesión
            const sessionBase = this.sessionService.getApiPayloadBase();
            
            if (this.isEditingTabloide && this.tabloideSeleccionado) {
                // Actualizar
                const payload = {
                    action: 'UP' as const,
                    id_tab: this.tabloideSeleccionado.id_tab,
                    ...formData,
                    ...sessionBase
                };
                
                this.tabloideService.updateTabloide(payload).subscribe({
                    next: (response) => {
                        console.log('✅ Tabloide actualizado:', response);
                        this.handleSaveSuccess('Tabloide actualizado correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'actualizar')
                });
            } else {
                // Crear
                const payload = {
                    action: 'IN' as const,
                    ...formData,
                    ...sessionBase
                };
                
                this.tabloideService.createTabloide(payload).subscribe({
                    next: (response) => {
                        console.log('✅ Tabloide creado:', response);
                        this.handleSaveSuccess('Tabloide creado correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'crear')
                });
            }
        }
    }

    private handleSaveSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: message
        });
        
        this.closeTabloideForm();
        this.cargarTableides();
        this.savingTabloide = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} tabloide:`, error);
        
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${operation} el tabloide`,
            life: 5000
        });
        
        this.savingTabloide = false;
    }

    // ========== MÉTODOS DE VALIDACIÓN ==========

    testTabloideUrl(): void {
        const url = this.tabloideForm.get('src')?.value;
        if (url) {
            this.tabloideService.validateTabloideUrl(url).then(valid => {
                this.messageService.add({
                    severity: valid ? 'success' : 'error',
                    summary: valid ? 'URL Válida' : 'URL Inválida',
                    detail: valid ? 'La URL del tabloide es válida' : 'No se pudo acceder a la URL del tabloide'
                });
            });
        }
    }

    testImageUrl(): void {
        const url = this.tabloideForm.get('imagen')?.value;
        if (url) {
            this.tabloideService.validateImageUrl(url).then(valid => {
                this.messageService.add({
                    severity: valid ? 'success' : 'error',
                    summary: valid ? 'Imagen Válida' : 'Imagen Inválida',
                    detail: valid ? 'La imagen es válida' : 'No se pudo cargar la imagen'
                });
            });
        }
    }

    // ========== EDICIÓN INLINE ==========

    editInlineTabloide(tabloide: Tabloide, field: string): void {
        this.editingCell = tabloide.id_tab + '_' + field;
        this.originalValue = (tabloide as any)[field];
        console.log('✏️ Editando inline:', field, 'Valor:', this.originalValue);
    }

    saveInlineEditTabloide(tabloide: Tabloide, field: string): void {
        console.log('💾 Guardando inline:', field, 'Nuevo valor:', (tabloide as any)[field]);
        
        if ((tabloide as any)[field] === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando');
            this.cancelInlineEdit();
            return;
        }

        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();
        
        this.tabloideService.updateTabloideField(
            tabloide.id_tab, 
            field, 
            (tabloide as any)[field],
            sessionBase
        ).subscribe({
            next: (response) => {
                console.log('✅ Campo actualizado:', response);
                
                // Actualizar fecha de modificación local
                tabloide.fecha_mod = new Date().toISOString();
                tabloide.usr_m = sessionBase.usr || tabloide.usr_m;
                
                this.editingCell = null;
                this.originalValue = null;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Campo Actualizado',
                    detail: `${this.getFieldLabel(field)} actualizado correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al actualizar campo:', error);
                
                // Revertir el cambio local
                (tabloide as any)[field] = this.originalValue;
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

    cancelInlineEdit(): void {
        this.editingCell = null;
        this.originalValue = null;
    }

    private getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            nombre: 'Nombre',
            descripcion: 'Descripción',
            src: 'URL del Tabloide',
            imagen: 'URL de la Imagen'
        };
        return labels[field] || field;
    }

    // ========== TOGGLE ESTADO ==========

    toggleEstado(tabloide: Tabloide): void {
        const nuevoEstado = tabloide.estado === 'A' ? 'I' : 'A';
        
        if (nuevoEstado === 'I') {
            // Confirmar desactivación
            this.confirmMessage = `¿Está seguro de que desea desactivar el tabloide "${tabloide.nombre}"?`;
            this.confirmHeader = 'Confirmar Desactivación';
            this.accionConfirmada = () => this.procesarCambioEstado(tabloide, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            // Activar directamente
            this.procesarCambioEstado(tabloide, nuevoEstado);
        }
    }

    private procesarCambioEstado(tabloide: Tabloide, nuevoEstado: string): void {
        const estadoAnterior = tabloide.estado;
        tabloide.estado = nuevoEstado;
        
        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();
        
        this.tabloideService.updateTabloideField(
            tabloide.id_tab, 
            'estado', 
            nuevoEstado,
            sessionBase
        ).subscribe({
            next: (response) => {
                console.log('✅ Estado actualizado:', response);
                
                tabloide.fecha_mod = new Date().toISOString();
                tabloide.usr_m = sessionBase.usr || tabloide.usr_m;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado Actualizado',
                    detail: `Tabloide ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`
                });
            },
            error: (error) => {
                console.error('❌ Error al cambiar estado:', error);
                
                // Revertir cambio local
                tabloide.estado = estadoAnterior;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado del tabloide',
                    life: 5000
                });
            }
        });
    }

    // ========== ELIMINACIÓN ==========

    eliminarTabloide(tabloide: Tabloide): void {
        this.tabloideToDelete = tabloide;
        this.showConfirmDeleteTabloide = true;
    }

    confirmDeleteTabloide(): void {
        if (this.tabloideToDelete) {
            this.deletingTabloide = true;
            
            // Obtener datos de sesión
            const sessionBase = this.sessionService.getApiPayloadBase();
            const payload = {
                action: 'DL' as const,
                id_tab: this.tabloideToDelete.id_tab,
                ...sessionBase
            };
            
            this.tabloideService.deleteTabloide(payload).subscribe({
                next: (response) => {
                    console.log('✅ Tabloide eliminado:', response);
                    
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: 'Tabloide eliminado correctamente'
                    });
                    
                    // Si el tabloide eliminado estaba seleccionado, deseleccionar
                    if (this.tabloideSeleccionado?.id_tab === this.tabloideToDelete?.id_tab) {
                        this.tabloideSeleccionado = null;
                    }
                    
                    this.cancelDeleteTabloide();
                    this.cargarTableides();
                },
                error: (error) => {
                    console.error('❌ Error al eliminar tabloide:', error);
                    
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al eliminar el tabloide',
                        life: 5000
                    });
                    
                    this.deletingTabloide = false;
                }
            });
        }
    }

    cancelDeleteTabloide(): void {
        this.showConfirmDeleteTabloide = false;
        this.tabloideToDelete = null;
        this.deletingTabloide = false;
    }

    // ========== CONFIRMACIONES ==========

    confirmarAccion(): void {
        if (this.accionConfirmada) {
            this.accionConfirmada();
        }
        this.cancelarConfirmacion();
    }

    cancelarConfirmacion(): void {
        this.showConfirmDialog = false;
        this.confirmMessage = '';
        this.confirmHeader = '';
        this.accionConfirmada = null;
    }

    // ========== MÉTODOS DE UTILIDAD ==========

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

    // ========== MÉTODO PARA IFRAME SEGURO ==========

    /**
     * Sanitizar URL para iframe seguro
     * @param url - URL del tabloide
     * @returns SafeResourceUrl para iframe
     */
    getSafeUrl(url: string): SafeResourceUrl {
        if (!url) return '';
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
