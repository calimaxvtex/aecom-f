import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@/core/services/session.service';
import { SPConfigService } from '../../../features/spconfig/services/spconfig.service';
import { ControllersService } from '../../../core/services/controllers.service';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Interfaces y modelos
import { SPConfig } from '../../../features/spconfig/models/spconfig.interface';
import { ApiCall, MonitorConfig } from '../../../types/monitor.types';
import { ApiConnTabComponent } from './apiconn-tab.component';

// Interfaces para Controllers
interface Controller {
    id_sp: number;
    route: string;
    apiName: string;
    method: string;
    spName: string;
    fullRoute: string;
    keyId?: string;
    paramCount: number;
}

interface ControllersResponse {
    statuscode: number;
    mensaje: string;
    active: number;
    controllers: Controller[];
}

// Interfaces para Reload
interface Cambio {
    tipo: string;
    nombre: string;
    accion: string;
}

interface Resumen {
    registrosDB: number;
    procedimientosAntes: number;
    procedimientosDespues: number;
    controladoresAntes: number;
    controladoresDespues: number;
}

interface Cambios {
    nuevos: Cambio[];
    modificados: Cambio[];
    eliminados: Cambio[];
    sinCambios: Cambio[];
    totalCambios: number;
}

interface Informe {
    timestamp: string;
    proceso: string;
    resumen: Resumen;
    cambios: Cambios;
    estado: string;
    errores: string[];
}

interface ReloadResponse {
    statuscode: number;
    mensaje: string;
    informe: Informe;
}



@Component({
    selector: 'app-spconfig',
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

        // Componente ApiConn
        ApiConnTabComponent
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
                (onHide)="cancelarDesactivacion()"
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
                        (onClick)="cancelarDesactivacion()"
                    ></p-button>
                    <p-button 
                        label="Sí, Desactivar" 
                        icon="pi pi-check" 
                        severity="danger"
                        (onClick)="confirmarDesactivacion()"
                    ></p-button>
                </div>
            </p-dialog>
            
            <!-- Pestañas principales -->
            <p-tabs value="0" (onTabChange)="onTabChange($event)">
                <p-tablist>
                    <p-tab value="0">
                        <i class="pi pi-database mr-2"></i>
                        SPConfig
                    </p-tab>
                    <p-tab value="1">
                        <i class="pi pi-server mr-2"></i>
                        Controllers
                    </p-tab>
                    <p-tab value="2">
                        <i class="pi pi-link mr-2"></i>
                        API Connections
                    </p-tab>
                </p-tablist>
                
                <p-tabpanels>
                    <!-- Panel 1: SPConfig -->
                    <p-tabpanel value="0">
                        <div class="mb-4">
                            
                            <p class="text-gray-600 mb-4">Gestiona los stored procedures del sistema</p>
                        </div>

                        <p-table
                            #dtSPConfig
                            [value]="spConfigs"
                            [paginator]="true"
                            [rows]="10"
                            [showCurrentPageReport]="true"
                            responsiveLayout="scroll"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} configuraciones"
                            [rowsPerPageOptions]="[10, 25, 50]"
                            [globalFilterFields]="['nombre', 'db', 'ruta', 'apiName']"
                        >
                            <ng-template #caption>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <input 
                                        pInputText
                                        type="text" 
                                        (input)="onGlobalFilter(dtSPConfig, $event)" 
                                        placeholder="Buscar configuraciones..." 
                                        class="w-full sm:w-80 order-1 sm:order-0"
                                    />
                                    <div class="flex gap-2 order-0 sm:order-1">
                                        <button
                                            (click)="cargarSPConfigs()"
                                            pButton
                                            raised
                                            class="square-button"
                                            icon="pi pi-refresh"
                                            [loading]="loadingSPConfigs"
                                            pTooltip="Actualizar"
                                            tooltipPosition="top"
                                        ></button>
                                        <button
                                            (click)="openSPConfigForm()"
                                            pButton
                                            raised
                                            class="square-button"
                                            icon="pi pi-plus"
                                            pTooltip="Agregar SPConfig"
                                            tooltipPosition="top"
                                        ></button>
                                    </div>
                                </div>
                            </ng-template>

                            <ng-template #header>
                                <tr>
                                    <th pSortableColumn="id_sp" style="width: 80px">ID <p-sortIcon field="id_sp"></p-sortIcon></th>
                                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                                    <th pSortableColumn="db" style="width: 100px">DB <p-sortIcon field="db"></p-sortIcon></th>
                                    <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                                    <th pSortableColumn="swApi" style="width: 80px">API <p-sortIcon field="swApi"></p-sortIcon></th>
                                    <th pSortableColumn="ruta" style="width: 120px">Ruta <p-sortIcon field="ruta"></p-sortIcon></th>
                                    <th pSortableColumn="apiName" style="width: 120px">API Name <p-sortIcon field="apiName"></p-sortIcon></th>
                                    <th pSortableColumn="keyId" style="width: 100px">Key ID <p-sortIcon field="keyId"></p-sortIcon></th>
                                    <th style="width: 150px">Metodo</th>
                                    <th pSortableColumn="metodo" style="width: 100px">Param <p-sortIcon field="metodo"></p-sortIcon></th>
                                    <th pSortableColumn="fecha_m" style="width: 150px">Modificado <p-sortIcon field="fecha_m"></p-sortIcon></th>
                                    <th style="width: 150px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-spconfig>
                                <tr>
                                    <!-- ID - NO EDITABLE -->
                                    <td>{{spconfig.id_sp}}</td>
                                    
                                    <!-- Nombre - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== spconfig.id_sp + '_nombre'"
                                            (click)="editInlineSPConfig(spconfig, 'nombre')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{spconfig.nombre}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === spconfig.id_sp + '_nombre'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="spconfig.nombre"
                                                (keyup.enter)="saveInlineEditSPConfig(spconfig, 'nombre')"
                                                (keyup.escape)="cancelInlineEditSPConfig()"
                                                class="p-inputtext-sm flex-1"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Nombre del SP"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditSPConfig(spconfig, 'nombre')"
                                                class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                pTooltip="Guardar (Enter)"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEditSPConfig()"
                                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                pTooltip="Deshacer (Escape)"
                                            ></button>
                                        </div>
                                    </td>
                                    
                                    <!-- DB - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== spconfig.id_sp + '_db'"
                                            (click)="editInlineSPConfig(spconfig, 'db')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{spconfig.db}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === spconfig.id_sp + '_db'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="spconfig.db"
                                                (keyup.enter)="saveInlineEditSPConfig(spconfig, 'db')"
                                                (keyup.escape)="cancelInlineEditSPConfig()"
                                                class="p-inputtext-sm flex-1"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Base de datos"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditSPConfig(spconfig, 'db')"
                                                class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                pTooltip="Guardar (Enter)"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEditSPConfig()"
                                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                pTooltip="Deshacer (Escape)"
                                            ></button>
                                        </div>
                                    </td>
                                    
                                    <!-- Estado - TOGGLE SWITCH (como usuarios) -->
                                    <td>
                                        <p-tag 
                                            [value]="getEstadoSPConfigLabel(spconfig.estado)" 
                                            [severity]="getEstadoSPConfigSeverity(spconfig.estado)"
                                            (click)="toggleEstadoSPConfig(spconfig)"
                                            class="cursor-pointer hover:opacity-80 transition-opacity"
                                            title="Clic para cambiar"
                                        ></p-tag>
                                    </td>
                                    
                                    <!-- SW API - TOGGLE SWITCH (como estado) -->
                                    <td>
                                        <p-tag 
                                            [value]="getSwApiLabel(spconfig.swApi)" 
                                            [severity]="getSwApiSeverity(spconfig.swApi)"
                                            (click)="toggleSwApiSPConfig(spconfig)"
                                            class="cursor-pointer hover:opacity-80 transition-opacity"
                                            title="Clic para cambiar"
                                        ></p-tag>
                                    </td>
                                    
                                    <!-- Ruta - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== spconfig.id_sp + '_ruta'"
                                            (click)="editInlineSPConfig(spconfig, 'ruta')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{spconfig.ruta}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === spconfig.id_sp + '_ruta'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="spconfig.ruta"
                                                (keyup.enter)="saveInlineEditSPConfig(spconfig, 'ruta')"
                                                (keyup.escape)="cancelInlineEditSPConfig()"
                                                class="p-inputtext-sm flex-1"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Ruta de la API"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditSPConfig(spconfig, 'ruta')"
                                                class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                pTooltip="Guardar (Enter)"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEditSPConfig()"
                                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                pTooltip="Deshacer (Escape)"
                                            ></button>
                                        </div>
                                    </td>
                                    
                                    <!-- API Name - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== spconfig.id_sp + '_apiName'"
                                            (click)="editInlineSPConfig(spconfig, 'apiName')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{spconfig.apiName}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === spconfig.id_sp + '_apiName'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="spconfig.apiName"
                                                (keyup.enter)="saveInlineEditSPConfig(spconfig, 'apiName')"
                                                (keyup.escape)="cancelInlineEditSPConfig()"
                                                class="p-inputtext-sm flex-1"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Nombre de la API"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditSPConfig(spconfig, 'apiName')"
                                                class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                pTooltip="Guardar (Enter)"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEditSPConfig()"
                                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                pTooltip="Deshacer (Escape)"
                                            ></button>
                                        </div>
                                    </td>
                                    
                                    <!-- Key ID - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== spconfig.id_sp + '_keyId'"
                                            (click)="editInlineSPConfig(spconfig, 'keyId')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{spconfig.keyId}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === spconfig.id_sp + '_keyId'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="spconfig.keyId"
                                                (keyup.enter)="saveInlineEditSPConfig(spconfig, 'keyId')"
                                                (keyup.escape)="cancelInlineEditSPConfig()"
                                                class="p-inputtext-sm flex-1"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Campo ID principal"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditSPConfig(spconfig, 'keyId')"
                                                class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                pTooltip="Guardar (Enter)"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEditSPConfig()"
                                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                pTooltip="Deshacer (Escape)"
                                            ></button>
                                        </div>
                                    </td>
                                    
                                    <!-- Método - EDITABLE -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== spconfig.id_sp + '_metodo'"
                                            (click)="editInlineSPConfig(spconfig, 'metodo')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{spconfig.metodo}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === spconfig.id_sp + '_metodo'"
                                            class="inline-edit-container"
                                        >
                                            <p-select
                                                [(ngModel)]="spconfig.metodo"
                                                [options]="getMetodosOptions()"
                                                optionLabel="label"
                                                optionValue="value"
                                                (keyup.enter)="saveInlineEditSPConfig(spconfig, 'metodo')"
                                                (keyup.escape)="cancelInlineEditSPConfig()"
                                                class="flex-1"
                                                placeholder="Seleccionar método"
                                                autofocus
                                            ></p-select>
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditSPConfig(spconfig, 'metodo')"
                                                class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                pTooltip="Guardar (Enter)"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEditSPConfig()"
                                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                pTooltip="Deshacer (Escape)"
                                            ></button>
                                        </div>
                                    </td>
                                    
                                    <!-- Parámetros -->
                                    <td>
                                        <button
                                            pButton
                                            icon="pi pi-code"
                                            (click)="showParametros(spconfig.params)"
                                            class="p-button-sm p-button-text p-button-info"
                                            pTooltip="{{hasValidParams(spconfig.params) ? 'Ver parámetros JSON' : 'Sin parámetros'}}"
                                            [disabled]="!hasValidParams(spconfig.params)"
                                        ></button>
                                    </td>
                                    
                                    <!-- Fecha Modificación - NO EDITABLE -->
                                    <td>{{spconfig.fecha_m | date:'short'}}</td>
                                    
                                                                         <!-- Acciones -->
                                     <td>
                                         <div class="flex gap-1">
                                             <button
                                                 pButton
                                                 icon="pi pi-pencil"
                                                 (click)="openSPConfigForm(spconfig)"
                                                 class="p-button-sm p-button-text p-button-info"
                                                 pTooltip="Editar SPConfig"
                                             ></button>
                                             <button
                                                 pButton
                                                 icon="pi pi-trash"
                                                 (click)="eliminarSPConfig(spconfig)"
                                                 class="p-button-sm p-button-text p-button-danger"
                                                 pTooltip="Eliminar SPConfig"
                                             ></button>
                                         </div>
                                     </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-tabpanel>
                    
                    
                    <!-- Panel 2: Controllers -->
                    <p-tabpanel value="1">
                        <div class="mb-4">
                            
                            <p class="text-gray-600 mb-4">Consulta los controladores activos del sistema</p>
                        </div>

                        <p-table
                            #dtControllers
                            [value]="controllers"
                            [paginator]="true"
                            [rows]="10"
                            [showCurrentPageReport]="true"
                            responsiveLayout="scroll"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} controladores"
                            [rowsPerPageOptions]="[10, 25, 50]"
                            [globalFilterFields]="['route', 'apiName', 'method', 'spName', 'fullRoute']"
                        >
                            <ng-template #caption>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <input 
                                        pInputText
                                        type="text" 
                                        (input)="onGlobalFilter(dtControllers, $event)" 
                                        placeholder="Buscar controladores..." 
                                        class="w-full sm:w-80 order-1 sm:order-0"
                                    />
                                    <div class="flex gap-2 order-0 sm:order-1">
                                        <button 
                                            (click)="loadControllers()" 
                                            pButton 
                                            outlined 
                                            class="w-full sm:w-auto" 
                                            icon="pi pi-search" 
                                            label="Consultar"
                                        ></button>
                                        <button 
                                            (click)="reloadControllers()" 
                                            pButton 
                                            outlined 
                                            class="w-full sm:w-auto" 
                                            icon="pi pi-refresh" 
                                            label="Reload"
                                            [loading]="reloadingControllers"
                                        ></button>
                                    </div>
                                </div>
                            </ng-template>

                            <ng-template #header>
                                <tr>
                                    <th pSortableColumn="id_sp" style="width: 80px">SP ID <p-sortIcon field="id_sp"></p-sortIcon></th>
                                    <th pSortableColumn="route" style="width: 120px">Route <p-sortIcon field="route"></p-sortIcon></th>
                                    <th pSortableColumn="apiName" style="width: 100px">API Name <p-sortIcon field="apiName"></p-sortIcon></th>
                                    <th pSortableColumn="method" style="width: 80px">Método <p-sortIcon field="method"></p-sortIcon></th>
                                    <th pSortableColumn="spName" style="min-width: 200px">Stored Procedure <p-sortIcon field="spName"></p-sortIcon></th>
                                    <th pSortableColumn="fullRoute" style="min-width: 200px">Ruta Completa <p-sortIcon field="fullRoute"></p-sortIcon></th>
                                    <th pSortableColumn="keyId" style="width: 100px">Key ID <p-sortIcon field="keyId"></p-sortIcon></th>
                                    <th pSortableColumn="paramCount" style="width: 100px">Parámetros <p-sortIcon field="paramCount"></p-sortIcon></th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-controller>
                                <tr>
                                    <td>
                                        <span class="font-mono text-sm font-semibold text-green-600">
                                            {{controller.id_sp || 'N/A'}}
                                        </span>
                                    </td>
                                    <td>
                                        <p-tag 
                                            [value]="controller.route || 'N/A'"
                                            severity="info"
                                        ></p-tag>
                                    </td>
                                    <td>{{controller.apiName || 'N/A'}}</td>
                                    <td>
                                        <p-tag 
                                            [value]="controller.method || 'N/A'"
                                            [severity]="getMethodSeverity(controller.method)"
                                        ></p-tag>
                                    </td>
                                    <td>
                                        <span class="font-mono text-sm">{{controller.spName || 'N/A'}}</span>
                                    </td>
                                    <td>
                                        <span class="font-mono text-sm text-blue-600">{{controller.fullRoute || 'N/A'}}</span>
                                    </td>
                                    <td>{{controller.keyId || 'N/A'}}</td>
                                    <td>
                                        <p-tag 
                                            [value]="controller.paramCount ? controller.paramCount.toString() : 'N/A'"
                                            severity="secondary"
                                        ></p-tag>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>

                        <!-- Sección de Informe de Reload -->
                        <div *ngIf="reloadInforme" class="mt-6 p-4 bg-gray-50 rounded-lg border">
                            <div class="flex items-center gap-2 mb-4">
                                <i class="pi pi-info-circle text-blue-500 text-xl"></i>
                                <h3 class="text-lg font-semibold text-gray-800">Informe de Recarga</h3>
                                <p-tag 
                                    [value]="reloadInforme.estado"
                                    [severity]="getEstadoSeverity(reloadInforme.estado)"
                                    class="ml-auto"
                                ></p-tag>
                            </div>

                            <!-- Resumen General -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div class="bg-white p-3 rounded border">
                                    <div class="text-sm text-gray-600">Timestamp</div>
                                    <div class="font-medium">{{reloadInforme.timestamp | date:'short'}}</div>
                                </div>
                                <div class="bg-white p-3 rounded border">
                                    <div class="text-sm text-gray-600">Proceso</div>
                                    <div class="font-medium">{{reloadInforme.proceso}}</div>
                                </div>
                                <div class="bg-white p-3 rounded border">
                                    <div class="text-sm text-gray-600">Total Cambios</div>
                                    <div class="font-medium text-lg" [class]="getCambiosClass(reloadInforme.cambios.totalCambios)">
                                        {{reloadInforme.cambios.totalCambios}}
                                    </div>
                                </div>
                            </div>

                            <!-- Estadísticas -->
                            <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                                <div class="bg-white p-3 rounded border text-center">
                                    <div class="text-sm text-gray-600">Registros DB</div>
                                    <div class="text-xl font-bold text-blue-600">{{reloadInforme.resumen.registrosDB}}</div>
                                </div>
                                <div class="bg-white p-3 rounded border text-center">
                                    <div class="text-sm text-gray-600">SP Antes</div>
                                    <div class="text-xl font-bold text-orange-600">{{reloadInforme.resumen.procedimientosAntes}}</div>
                                </div>
                                <div class="bg-white p-3 rounded border text-center">
                                    <div class="text-sm text-gray-600">SP Después</div>
                                    <div class="text-xl font-bold text-green-600">{{reloadInforme.resumen.procedimientosDespues}}</div>
                                </div>
                                <div class="bg-white p-3 rounded border text-center">
                                    <div class="text-sm text-gray-600">Ctrl Antes</div>
                                    <div class="text-xl font-bold text-purple-600">{{reloadInforme.resumen.controladoresAntes}}</div>
                                </div>
                                <div class="bg-white p-3 rounded border text-center">
                                    <div class="text-sm text-gray-600">Ctrl Después</div>
                                    <div class="text-xl font-bold text-indigo-600">{{reloadInforme.resumen.controladoresDespues}}</div>
                                </div>
                            </div>

                            <!-- Detalles de Cambios -->
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <!-- Nuevos -->
                                <div *ngIf="reloadInforme.cambios.nuevos.length > 0" class="bg-green-50 p-3 rounded border border-green-200">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="pi pi-plus text-green-600"></i>
                                        <span class="font-medium text-green-800">Nuevos ({{reloadInforme.cambios.nuevos.length}})</span>
                                    </div>
                                    <div class="space-y-1">
                                        <div *ngFor="let item of reloadInforme.cambios.nuevos" class="text-sm text-green-700">
                                            {{item.nombre}}
                                        </div>
                                    </div>
                                </div>

                                <!-- Modificados -->
                                <div *ngIf="reloadInforme.cambios.modificados.length > 0" class="bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="pi pi-pencil text-yellow-600"></i>
                                        <span class="font-medium text-yellow-800">Modificados ({{reloadInforme.cambios.modificados.length}})</span>
                                    </div>
                                    <div class="space-y-1">
                                        <div *ngFor="let item of reloadInforme.cambios.modificados" class="text-sm text-yellow-700">
                                            {{item.nombre}}
                                        </div>
                                    </div>
                                </div>

                                <!-- Eliminados -->
                                <div *ngIf="reloadInforme.cambios.eliminados.length > 0" class="bg-red-50 p-3 rounded border border-red-200">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="pi pi-trash text-red-600"></i>
                                        <span class="font-medium text-red-800">Eliminados ({{reloadInforme.cambios.eliminados.length}})</span>
                                    </div>
                                    <div class="space-y-1">
                                        <div *ngFor="let item of reloadInforme.cambios.eliminados" class="text-sm text-red-700">
                                            {{item.nombre}}
                                        </div>
                                    </div>
                                </div>

                                <!-- Sin Cambios -->
                                <div *ngIf="reloadInforme.cambios.sinCambios.length > 0" class="bg-gray-50 p-3 rounded border border-gray-200">
                                    <div class="flex items-center gap-2 mb-2">
                                        <i class="pi pi-check text-gray-600"></i>
                                        <span class="font-medium text-gray-800">Sin Cambios ({{reloadInforme.cambios.sinCambios.length}})</span>
                                    </div>
                                    <div class="space-y-1 max-h-32 overflow-y-auto">
                                        <div *ngFor="let item of reloadInforme.cambios.sinCambios" class="text-sm text-gray-700">
                                            {{item.nombre}}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Errores -->
                            <div *ngIf="reloadInforme.errores.length > 0" class="mt-4 bg-red-50 p-3 rounded border border-red-200">
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="pi pi-exclamation-triangle text-red-600"></i>
                                    <span class="font-medium text-red-800">Errores ({{reloadInforme.errores.length}})</span>
                                </div>
                                <div class="space-y-1">
                                    <div *ngFor="let error of reloadInforme.errores" class="text-sm text-red-700">
                                        {{error}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-tabpanel>

                    <!-- Panel 3: API Connections -->
                    <p-tabpanel value="2">
                        <app-apiconn-tab></app-apiconn-tab>
                    </p-tabpanel>

                </p-tabpanels>
             </p-tabs>
         </div>

         <!-- Modal SPConfig -->
         <p-dialog 
             [(visible)]="showSPConfigModal" 
             [header]="isEditingSPConfig ? 'Editar SPConfig' : 'Nuevo SPConfig'"
             [modal]="true" 
             [style]="{width: '600px', maxHeight: '80vh'}"
             [draggable]="false" 
             [resizable]="false"
             [closable]="true"
         >
             <form [formGroup]="spConfigForm" (ngSubmit)="saveSPConfig()">
                 <div class="grid grid-cols-2 gap-4" style="max-height: 60vh; overflow-y: auto; padding-right: 8px;">
                     <!-- Nombre -->
                     <div class="col-span-2">
                         <label class="block text-sm font-medium mb-1">Nombre *</label>
                         <input 
                             pInputText 
                             formControlName="nombre"
                             placeholder="Nombre del stored procedure"
                             class="w-full"
                         />
                     </div>
                     
                     <!-- DB -->
                     <div>
                         <label class="block text-sm font-medium mb-1">Base de Datos *</label>
                         <input 
                             pInputText 
                             formControlName="db"
                             placeholder="Nombre de la BD"
                             class="w-full"
                         />
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
                     
                     <!-- SW API -->
                     <div>
                         <label class="block text-sm font-medium mb-1">API Activa *</label>
                         <p-select 
                             formControlName="swApi"
                             [options]="getSwApiOptions()"
                             optionLabel="label"
                             optionValue="value"
                             placeholder="Seleccionar estado API"
                             class="w-full"
                         ></p-select>
                     </div>
                     
                     <!-- Método -->
                     <div>
                         <label class="block text-sm font-medium mb-1">Método *</label>
                         <p-select 
                             formControlName="metodo"
                             [options]="getMetodosOptions()"
                             optionLabel="label"
                             optionValue="value"
                             placeholder="Seleccionar método"
                             class="w-full"
                         ></p-select>
                     </div>
                     
                     <!-- Ruta -->
                     <div>
                         <label class="block text-sm font-medium mb-1">Ruta *</label>
                         <input 
                             pInputText 
                             formControlName="ruta"
                             placeholder="Ruta de la API"
                             class="w-full"
                         />
                     </div>
                     
                     <!-- API Name -->
                     <div>
                         <label class="block text-sm font-medium mb-1">Nombre API *</label>
                         <input 
                             pInputText 
                             formControlName="apiName"
                             placeholder="Nombre de la API"
                             class="w-full"
                         />
                     </div>
                     
                     <!-- Key ID -->
                     <div>
                         <label class="block text-sm font-medium mb-1">Key ID *</label>
                         <input 
                             pInputText 
                             formControlName="keyId"
                             placeholder="Campo ID principal"
                             class="w-full"
                         />
                     </div>
                     
                                         <!-- Parámetros -->
                    <div class="col-span-2">
                        <label class="block text-sm font-medium mb-1">Parámetros *</label>
                        <div class="flex gap-2">
                            <input 
                                pInputText 
                                formControlName="params"
                                placeholder="JSON de parámetros"
                                class="w-full"
                            />
                            <button
                                pButton
                                icon="pi pi-eye"
                                type="button"
                                (click)="showParametros(spConfigForm.get('params')?.value || '')"
                                class="p-button-sm p-button-outlined p-button-info"
                                pTooltip="Ver parámetros formateados"
                                [disabled]="!spConfigForm.get('params')?.value"
                            ></button>
                        </div>
                    </div>
                 </div>
                 
                 <!-- Botones directamente en el contenido del modal -->
                 <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                     <button 
                         pButton 
                         type="button" 
                         (click)="closeSPConfigForm()" 
                         label="Cancelar" 
                         class="p-button-text"
                     ></button>
                     <button 
                         pButton 
                         type="button" 
                         (click)="saveSPConfig()" 
                         [label]="isEditingSPConfig ? 'Actualizar' : 'Crear'"
                         [disabled]="!spConfigForm.valid"
                         class="p-button-success"
                     ></button>
                 </div>
             </form>
         </p-dialog>

         <!-- Modal API Config -->
         <p-dialog 
             [(visible)]="showAPIConfigModal" 
             [header]="isEditingAPIConfig ? 'Editar API Config' : 'Nueva API Config'"
             [modal]="true" 
             [style]="{width: '500px', maxHeight: '80vh'}"
             [draggable]="false" 
             [resizable]="false"
             [closable]="true"
         >
             <form [formGroup]="apiConfigForm" (ngSubmit)="saveAPIConfig()">
                 <div class="grid grid-cols-1 gap-4" style="max-height: 60vh; overflow-y: auto; padding-right: 8px;">
                     <!-- Nombre -->
                     <div>
                         <label class="block text-sm font-medium mb-1">Nombre *</label>
                         <input 
                             pInputText 
                             formControlName="nombre"
                             placeholder="Nombre de la API"
                             class="w-full"
                         />
                     </div>
                     
                     <!-- URL -->
                     <div>
                         <label class="block text-sm font-medium mb-1">URL *</label>
                         <input 
                             pInputText 
                             formControlName="url"
                             placeholder="URL completa de la API"
                             class="w-full"
                         />
                     </div>
                     
                     <!-- Método -->
                     <div>
                         <label class="block text-sm font-medium mb-1">Método *</label>
                         <p-select 
                             formControlName="metodo"
                             [options]="getMetodosOptions()"
                             optionLabel="label"
                             optionValue="value"
                             placeholder="Seleccionar método"
                             class="w-full"
                         ></p-select>
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
                     
                     <!-- Timeout -->
                     <div>
                         <label class="block text-sm font-medium mb-1">Timeout (ms) *</label>
                         <input 
                             pInputText 
                             type="number"
                             formControlName="timeout"
                             placeholder="Timeout en milisegundos"
                             class="w-full"
                             min="1000"
                             max="30000"
                         />
                     </div>
                 </div>
                 
                 <!-- Botones directamente en el contenido del modal -->
                 <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                     <button 
                         pButton 
                         type="button" 
                         (click)="closeAPIConfigForm()" 
                         label="Cancelar" 
                         class="p-button-text"
                     ></button>
                     <button 
                         pButton 
                         type="button" 
                         (click)="saveAPIConfig()" 
                         [label]="isEditingAPIConfig ? 'Actualizar' : 'Crear'"
                         [disabled]="!apiConfigForm.valid"
                         class="p-button-success"
                     ></button>
                 </div>
             </form>
         </p-dialog>

         <!-- Modal de Confirmación para SPConfig -->
         <p-dialog 
             [(visible)]="showConfirmDeleteSPConfig" 
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
                     <h4 class="font-semibold text-lg mb-1">¿Eliminar Registro?</h4>
                     <p class="text-gray-600">
                         ¿Estás seguro de que deseas eliminar la configuración 
                         <strong>"{{spConfigToDelete?.nombre}}"</strong>?
                     </p>
                     <p class="text-sm text-red-600 mt-2">
                         ⚠️ Esta acción no se puede deshacer.
                     </p>
                 </div>
             </div>
             
             <!-- Botones directamente en el contenido del modal -->
             <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                 <button 
                     pButton 
                     type="button" 
                     (click)="cancelDeleteSPConfig()" 
                     label="Cancelar" 
                     class="p-button-text"
                 ></button>
                 <button 
                     pButton 
                     type="button" 
                     (click)="confirmDeleteSPConfig()" 
                     label="Eliminar" 
                     class="p-button-danger"
                 ></button>
             </div>
         </p-dialog>

         <!-- Modal de Confirmación para API Config -->
         <p-dialog 
             [(visible)]="showConfirmDeleteAPIConfig" 
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
                     <h4 class="font-semibold text-lg mb-1">¿Eliminar API Config?</h4>
                     <p class="text-gray-600">
                         ¿Estás seguro de que deseas eliminar la configuración de API 
                         <strong>"{{apiConfigToDelete?.nombre}}"</strong>?
                     </p>
                     <p class="text-sm text-red-600 mt-2">
                         ⚠️ Esta acción no se puede deshacer.
                     </p>
                 </div>
             </div>
             
             <!-- Botones directamente en el contenido del modal -->
             <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                 <button 
                     pButton 
                     type="button" 
                     (click)="cancelDeleteAPIConfig()" 
                     label="Cancelar" 
                     class="p-button-text"
                 ></button>
                 <button 
                     pButton 
                     type="button" 
                     (click)="confirmDeleteAPIConfig()" 
                     label="Eliminar" 
                     class="p-button-danger"
                 ></button>
             </div>
                 </p-dialog>

        <!-- Modal para mostrar Parámetros JSON -->
        <p-dialog
            [(visible)]="showParametrosModal"
            header="Parámetros JSON"
            [style]="{width: '80vw', maxWidth: '600px', maxHeight: '80vh'}"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
        >
            <div class="p-4">
                <pre class="bg-gray-100 p-4 rounded border text-sm overflow-auto max-h-96" style="white-space: pre-wrap; word-break: break-word;">{{parametrosJSON}}</pre>
            </div>
            
            <ng-template pTemplate="footer">
                <div class="flex justify-end">
                    <button 
                        pButton 
                        label="Cerrar" 
                        icon="pi pi-times" 
                        (click)="showParametrosModal = false"
                        class="p-button-secondary"
                    ></button>
                </div>
            </ng-template>
        </p-dialog>

        <!-- Modal para mostrar detalles de llamada API -->
        <p-dialog
            [(visible)]="showApiCallDetailsModal"
            header="Detalles de Llamada API"
            [style]="{width: '90vw', maxWidth: '1000px', maxHeight: '80vh'}"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
        >
            <div *ngIf="selectedApiCall" class="p-4">
                <!-- Información General -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 p-3 rounded border">
                        <div class="text-sm text-blue-600 font-medium">Timestamp</div>
                        <div class="text-sm">{{selectedApiCall.timestamp | date:'medium'}}</div>
                    </div>
                    <div class="bg-green-50 p-3 rounded border">
                        <div class="text-sm text-green-600 font-medium">Tipo</div>
                        <p-tag [value]="selectedApiCall.tipo.toUpperCase()" [severity]="selectedApiCall.tipo === 'in' ? 'info' : 'success'"></p-tag>
                    </div>
                    <div class="bg-purple-50 p-3 rounded border">
                        <div class="text-sm text-purple-600 font-medium">Duración</div>
                        <div class="text-sm">{{selectedApiCall.duracion || 0}}ms</div>
                    </div>
                </div>

                <!-- URL y Servidor -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-50 p-3 rounded border">
                        <div class="text-sm text-gray-600 font-medium mb-2">URL Completa</div>
                        <div class="font-mono text-sm text-blue-600 break-all">{{selectedApiCall.url}}</div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                        <div class="text-sm text-gray-600 font-medium mb-2">Servidor</div>
                        <div class="font-mono text-sm">{{selectedApiCall.servidor}}</div>
                    </div>
                </div>

                <!-- Ruta y Status -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div class="bg-gray-50 p-3 rounded border">
                        <div class="text-sm text-gray-600 font-medium mb-2">Ruta</div>
                        <div class="font-mono text-sm text-green-600">{{selectedApiCall.ruta}}</div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                        <div class="text-sm text-gray-600 font-medium mb-2">Status Code</div>
                        <p-tag [value]="selectedApiCall.statusCode.toString()" [severity]="getStatusSeverity(selectedApiCall.statusCode)"></p-tag>
                    </div>
                </div>

                <!-- Parámetros -->
                <div class="mb-6">
                    <div class="text-sm text-gray-600 font-medium mb-2">Parámetros</div>
                    <div class="bg-gray-100 p-3 rounded border">
                        <pre class="text-sm overflow-auto max-h-32" style="white-space: pre-wrap; word-break: break-word;">{{formatJson(selectedApiCall.parametros)}}</pre>
                    </div>
                </div>

                <!-- Body -->
                <div class="mb-6">
                    <div class="text-sm text-gray-600 font-medium mb-2">Body</div>
                    <div class="bg-gray-100 p-3 rounded border">
                        <pre class="text-sm overflow-auto max-h-32" style="white-space: pre-wrap; word-break: break-word;">{{formatJson(selectedApiCall.body)}}</pre>
                    </div>
                </div>

                <!-- Respuesta -->
                <div class="mb-6">
                    <div class="text-sm text-gray-600 font-medium mb-2">Respuesta</div>
                    <div class="bg-gray-100 p-3 rounded border">
                        <pre class="text-sm overflow-auto max-h-32" style="white-space: pre-wrap; word-break: break-word;">{{formatJson(selectedApiCall.respuesta)}}</pre>
                    </div>
                </div>

                <!-- Mensaje -->
                <div class="mb-6">
                    <div class="text-sm text-gray-600 font-medium mb-2">Mensaje</div>
                    <div class="bg-gray-100 p-3 rounded border">
                        <div class="text-sm">{{selectedApiCall.mensaje}}</div>
                    </div>
                </div>
            </div>
            
            <ng-template pTemplate="footer">
                <div class="flex justify-end">
                    <button 
                        pButton 
                        label="Cerrar" 
                        icon="pi pi-times" 
                        (click)="showApiCallDetailsModal = false"
                        class="p-button-secondary"
                    ></button>
                </div>
            </ng-template>
        </p-dialog>

        <!-- Modal para mostrar JSON (Body/Respuesta) -->
        <p-dialog
            [(visible)]="showJsonModal"
            [header]="jsonModalTitle"
            [style]="{width: '80vw', maxWidth: '800px', maxHeight: '80vh'}"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
        >
            <div class="p-4">
                <pre class="bg-gray-100 p-4 rounded border text-sm overflow-auto max-h-96" style="white-space: pre-wrap; word-break: break-word;">{{jsonModalContent}}</pre>
            </div>
            
            <ng-template pTemplate="footer">
                <div class="flex justify-end">
                    <button 
                        pButton 
                        label="Cerrar" 
                        icon="pi pi-times" 
                        (click)="showJsonModal = false"
                        class="p-button-secondary"
                    ></button>
                </div>
            </ng-template>
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

        /* Asegurar que los botones del modal sean visibles */
        .p-dialog .p-dialog-footer {
            display: flex !important;
            justify-content: flex-end !important;
            gap: 0.5rem !important;
            padding: 1rem !important;
            border-top: 1px solid #e2e8f0 !important;
            background-color: #ffffff !important;
            min-height: 60px !important;
        }

        .p-dialog .p-dialog-footer button {
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
            min-width: 80px !important;
            height: 2.5rem !important;
        }

        /* Estilos específicos para modales de confirmación */
        .p-dialog[style*="width: 400px"] .p-dialog-footer {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* Debug: hacer todos los botones visibles */
        button {
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }

        /* Estilos para botones de tabla (igual que usuarios) */
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

        /* Estilos para botones cuadrados */
        .square-button {
            width: 40px !important;
            height: 40px !important;
            min-width: 40px !important;
            min-height: 40px !important;
            border-radius: 8px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .square-button .p-button-icon {
            font-size: 1.2rem !important;
            margin: 0 !important;
        }

        .square-button .p-button-label {
            display: none !important;
        }
    `]
})
export class SPConfigComponent implements OnInit, OnDestroy {

    // Datos mock
    spConfigs: SPConfig[] = [];
    apiConfigs: any[] = [];
    controllers: Controller[] = [];
    reloadingControllers = false;
    reloadInforme: Informe | null = null;
    loadingSPConfigs = false;
    

    // Formularios
    spConfigForm: FormGroup;
    apiConfigForm: FormGroup;

    // Estados de formularios
    isEditingSPConfig = false;
    isEditingAPIConfig = false;
    editingSPConfigId: number | null = null;
    editingAPIConfigId: number | null = null;

    // Estados de modales
    showSPConfigModal = false;
    showAPIConfigModal = false;
    
    // Estados de modales de confirmación
    showConfirmDeleteSPConfig = false;
    showConfirmDeleteAPIConfig = false;
    spConfigToDelete: SPConfig | null = null;
    apiConfigToDelete: any | null = null;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Testing de API
    testingAPI = false;
    testResults: any[] = [];
    
    // Modal para mostrar parámetros JSON
    showParametrosModal = false;
    parametrosJSON = '';

    // Modal de confirmación personalizado
    showConfirmDialog = false;
    confirmMessage = '';
    confirmHeader = '';
    spconfigToConfirm: SPConfig | null = null;
    nuevoEstadoConfirm = '';
    estadoAnteriorConfirm = '';

    // Propiedades para modales de detalles de API
    showApiCallDetailsModal = false;
    selectedApiCall: any = null;

    // Propiedades para modal JSON
    showJsonModal = false;
    jsonModalTitle = '';
    jsonModalContent = '';

    constructor(
        private fb: FormBuilder,
        private messageService: MessageService,
        private http: HttpClient,
        private sessionService: SessionService,
        private spconfigService: SPConfigService,
        private controllersService: ControllersService
    ) {
        console.log('🔧 SPConfigComponent: Constructor ejecutado');
        
        // Inicializar formularios
        this.spConfigForm = this.fb.group({
            nombre: ['', Validators.required],
            db: ['', Validators.required],
            params: ['[]', Validators.required],
            estado: ['A', Validators.required],
            swApi: [true, Validators.required],
            ruta: ['', Validators.required],
            apiName: ['', Validators.required],
            metodo: ['POST', Validators.required],
            keyId: ['', Validators.required]
        });

        this.apiConfigForm = this.fb.group({
            nombre: ['', Validators.required],
            url: ['', Validators.required],
            metodo: ['GET', Validators.required],
            estado: ['A', Validators.required],
            timeout: [5000, [Validators.required, Validators.min(1000), Validators.max(30000)]]
        });
    }

    ngOnInit(): void {
        console.log('🚀 SPConfigComponent: ngOnInit ejecutado');
        this.cargarDatos();

        // Inicializar datos del componente
        console.log('🔍 Componente: Inicialización completada');
    }

    ngOnDestroy(): void {
        // Limpieza del componente
        console.log('🧹 SPConfigComponent: Componente destruido');
    }

    // Cargar datos mock
    cargarDatos(): void {
        console.log('📊 Cargando datos desde API...');
        this.cargarSPConfigs();
    }

    cargarSPConfigs(): void {
        console.log('📊 Cargando SPConfigs desde API...');
        this.loadingSPConfigs = true;
        const apiUrl = this.spconfigService.getSpconfigUrl();
        
        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();
        const payload = { action: 'SL', ...sessionBase };
        
        this.http.post(apiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ SPConfigs cargados - Respuesta completa:', response);
                console.log('🔍 Tipo de respuesta:', typeof response);
                console.log('🔍 Es array?:', Array.isArray(response));
                console.log('🔍 Longitud si es array:', Array.isArray(response) ? response.length : 'N/A');
                
                // Verificar el formato de la respuesta
                let dataToProcess = null;
                
                if (Array.isArray(response)) {
                    // Si es array, verificar si el primer elemento tiene statusCode/data
                    if (response.length === 1 && response[0] && 
                        (response[0].statuscode === 200 || response[0].statusCode === 200) && 
                        response[0].data) {
                        // Array con wrapper: [{statusCode: 200, data: [...]}]
                        dataToProcess = response[0].data;
                        console.log('✅ SPConfigs - desde response[0].data:', dataToProcess.length, 'registros');
                    } else {
                        // Array directo con datos
                        dataToProcess = response;
                        console.log('✅ SPConfigs - array directo:', dataToProcess.length, 'registros');
                    }
                } else if (response && (response.statuscode === 200 || response.statusCode === 200) && response.data) {
                    // Objeto directo con estructura estándar
                    dataToProcess = response.data;
                    console.log('✅ SPConfigs - desde response.data:', dataToProcess.length, 'registros');
                } else {
                    console.error('❌ Formato de respuesta no reconocido:', response);
                    this.loadingSPConfigs = false;
                    return;
                }
                
                if (dataToProcess && Array.isArray(dataToProcess)) {
                    console.log('🔄 Iniciando mapeo de', dataToProcess.length, 'elementos...');
                    
                    // Mapear datos con transformación de params
                    this.spConfigs = dataToProcess.map((item: any, index: number) => {
                        console.log(`🔍 Procesando item ${index}:`, item);
                        
                        // Convertir params a string si viene como objeto/array
                        let paramsString = '';
                        if (item.params) {
                            console.log(`🔍 Params originales (${index}):`, item.params, 'tipo:', typeof item.params);
                            if (typeof item.params === 'string') {
                                paramsString = item.params;
                            } else if (typeof item.params === 'object') {
                                paramsString = JSON.stringify(item.params);
                            }
                            console.log(`🔍 Params convertidos (${index}):`, paramsString);
                        }
                        
                        const mappedItem = {
                            id_sp: item.id_sp,
                            nombre: item.nombre,
                            db: item.db,
                            params: paramsString,
                            estado: item.estado,
                            swApi: item.swApi,
                            ruta: item.ruta,
                            apiName: item.apiName,
                            metodo: item.metodo,
                            keyId: item.keyId || 'N/A',
                            fecha_m: item.fecha_m
                        };
                        
                        console.log(`✅ Item mapeado (${index}):`, mappedItem);
                        return mappedItem;
                    });
                    
                    console.log('✅ SPConfigs procesados FINAL:', this.spConfigs.length, 'registros');
                    console.log('🔍 Array final this.spConfigs:', this.spConfigs);
                    
                    // Verificar que this.spConfigs tiene contenido
                    if (this.spConfigs.length > 0) {
                        console.log('✅ Primer elemento del array final:', this.spConfigs[0]);
                        
                        // Forzar detección de cambios
                        setTimeout(() => {
                            console.log('🔄 Forzando detección de cambios...');
                            console.log('🔍 this.spConfigs después del timeout:', this.spConfigs.length, 'elementos');
                        }, 100);
                        
                    } else {
                        console.error('❌ El array final está vacío!');
                    }
                } else {
                    console.error('❌ dataToProcess no es un array válido:', dataToProcess);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Formato de respuesta inesperado'
                    });
                }
            },
            error: (error) => {
                console.error('❌ Error al cargar SPConfigs:', error);
                
                // Error registrado en logs
                console.error('❌ Error en SPConfigs:', error);
                
                // Extraer información detallada del error
                let errorCode = 'N/A';
                let errorMessage = 'Error desconocido';
                let errorStatus = 'N/A';
                
                if (error.status) {
                    errorStatus = error.status.toString();
                }
                
                if (error.error) {
                    if (error.error.statuscode) {
                        errorCode = error.error.statuscode.toString();
                    }
                    if (error.error.mensaje) {
                        errorMessage = error.error.mensaje;
                    } else if (error.error.message) {
                        errorMessage = error.error.message;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar mensaje detallado
                this.messageService.add({
                    severity: 'error',
                    summary: `Error ${errorStatus}`,
                    detail: `Código: ${errorCode} | Mensaje: ${errorMessage}`,
                    life: 5000 // 5 segundos para poder leer mejor
                });
                
                // Cargar datos mock como fallback después de un delay
                setTimeout(() => {
                    this.cargarSPConfigsMock();
                }, 2000);
            },
            complete: () => {
                this.loadingSPConfigs = false;
            }
        });
    }

    cargarSPConfigsMock(): void {
        console.log('📊 Cargando SPConfigs mock como fallback...');
        this.spConfigs = [
            {
                id_sp: 1,
                nombre: 'ADM_ROL_100',
                db: 'ec',
                params: '[{"ParamName":"@JSON","ParamType":"nvarchar","MaxLength":-1,"IsOutput":false}]',
                estado: 'A',
                swApi: 1,
                ruta: 'adminUsr',
                apiName: 'rol',
                metodo: 'POST',
                keyId: 'id_rol',
                fecha_m: '2025-08-29T16:27:51.873'
            },
            {
                id_sp: 2,
                nombre: 'ADM_USR_100',
                db: 'ec',
                params: '[{"ParamName":"@JSON","ParamType":"nvarchar","MaxLength":-1,"IsOutput":false}]',
                estado: 'A',
                swApi: 1,
                ruta: 'admusr',
                apiName: 'usuario',
                metodo: 'POST',
                keyId: 'id',
                fecha_m: '2025-08-29T16:30:15.123'
            },
            {
                id_sp: 3,
                nombre: 'ADM_MENU_100',
                db: 'ec',
                params: '[{"ParamName":"@JSON","ParamType":"nvarchar","MaxLength":-1,"IsOutput":false}]',
                estado: 'A',
                swApi: 1,
                ruta: 'adminMenu',
                apiName: 'menu',
                metodo: 'POST',
                keyId: 'id_menu',
                fecha_m: '2025-08-29T16:32:45.789'
            }
        ];

        // API Config mock (APIs del sistema) - URLs dinámicas desde servicios
        this.apiConfigs = [
            {
                id: 1,
                nombre: 'API Usuarios',
                url: this.spconfigService.getUsuariosUrl(),
                metodo: 'POST',
                estado: 'A',
                timeout: 5000
            },
            {
                id: 2,
                nombre: 'API Roles',
                url: this.spconfigService.getRolesUrl(),
                metodo: 'POST',
                estado: 'A',
                timeout: 5000
            },
            {
                id: 3,
                nombre: 'API Rol Detalle',
                url: this.spconfigService.getRolDetalleUrl(),
                metodo: 'POST',
                estado: 'A',
                timeout: 5000
            },
            {
                id: 4,
                nombre: 'API Rol Usuario',
                url: this.spconfigService.getRolUsuarioUrl(),
                metodo: 'POST',
                estado: 'A',
                timeout: 5000
            },
            {
                id: 5,
                nombre: 'API Menús',
                url: this.spconfigService.getMenuUrl(),
                metodo: 'POST',
                estado: 'A',
                timeout: 5000
            },
            {
                id: 6,
                nombre: 'API SPConfig',
                url: this.spconfigService.getSpconfigUrl() + '/1',
                metodo: 'POST',
                estado: 'A',
                timeout: 5000
            }
        ];

        console.log('✅ Datos mock cargados:', {
            spConfigs: this.spConfigs.length,
            apiConfigs: this.apiConfigs.length
        });
    }



    // ========== MÉTODOS PARA CONTROLLERS ==========

    // Cargar controladores desde la API (solo consulta)
    loadControllers(): void {
        console.log('🔍 Consultando controladores...');

        // Usar ControllersService para URL dinámica
        this.controllersService.loadControllers().subscribe({
            next: (response) => {
                console.log('✅ Controladores consultados:', response);
                this.controllers = response.controllers || [];
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Consulta Exitosa',
                    detail: `Se consultaron ${this.controllers.length} controladores activos`
                });
            },
            error: (error) => {
                console.error('❌ Error consultando controladores:', error);
                
                // Error registrado en logs
                console.error('❌ Error al consultar controladores:', error);
                
                // Extraer información detallada del error
                let errorCode = 'N/A';
                let errorMessage = 'Error desconocido';
                let errorStatus = 'N/A';
                
                if (error.status) {
                    errorStatus = error.status.toString();
                }
                
                if (error.error) {
                    if (error.error.statuscode) {
                        errorCode = error.error.statuscode.toString();
                    }
                    if (error.error.mensaje) {
                        errorMessage = error.error.mensaje;
                    } else if (error.error.message) {
                        errorMessage = error.error.message;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar mensaje detallado
                this.messageService.add({
                    severity: 'error',
                    summary: `Error ${errorStatus}`,
                    detail: `Código: ${errorCode} | Mensaje: ${errorMessage}`,
                    life: 5000 // 5 segundos para poder leer mejor
                });
            }
        });
    }

    // Recargar controladores (reload + mostrar informe)
    reloadControllers(): void {
        console.log('🔄 Recargando controladores...');
        this.reloadingControllers = true;
        
        // Usar ControllersService para URL dinámica de recarga
        this.controllersService.reloadControllers().subscribe({
            next: (response) => {
                console.log('✅ Controladores recargados:', response);
                this.reloadInforme = response.informe;
                this.reloadingControllers = false;
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Controladores Recargados',
                    detail: response.mensaje
                });
            },
            error: (error) => {
                console.error('❌ Error recargando controladores:', error);
                this.reloadingControllers = false;
                
                // Error registrado en logs
                console.error('❌ Error al recargar controladores:', error);
                
                // Extraer información detallada del error
                let errorCode = 'N/A';
                let errorMessage = 'Error desconocido';
                let errorStatus = 'N/A';
                
                if (error.status) {
                    errorStatus = error.status.toString();
                }
                
                if (error.error) {
                    if (error.error.statuscode) {
                        errorCode = error.error.statuscode.toString();
                    }
                    if (error.error.mensaje) {
                        errorMessage = error.error.mensaje;
                    } else if (error.error.message) {
                        errorMessage = error.error.message;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                // Mostrar mensaje detallado
                this.messageService.add({
                    severity: 'error',
                    summary: `Error ${errorStatus}`,
                    detail: `Código: ${errorCode} | Mensaje: ${errorMessage}`,
                    life: 5000 // 5 segundos para poder leer mejor
                });
            }
        });
    }

    // Obtener severidad del método HTTP para el tag
    getMethodSeverity(method: string): string {
        if (!method) return 'secondary';
        
        switch (method.toUpperCase()) {
            case 'GET':
                return 'info';
            case 'POST':
                return 'success';
            case 'PUT':
                return 'warning';
            case 'DELETE':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    // Obtener severidad del estado del informe
    getEstadoSeverity(estado: string): string {
        switch (estado.toUpperCase()) {
            case 'EXITOSO':
                return 'success';
            case 'ERROR':
                return 'danger';
            case 'ADVERTENCIA':
                return 'warning';
            default:
                return 'info';
        }
    }

    // Obtener clase CSS para el total de cambios
    getCambiosClass(totalCambios: number): string {
        if (totalCambios === 0) {
            return 'text-gray-600';
        } else if (totalCambios > 0) {
            return 'text-green-600';
        } else {
            return 'text-red-600';
        }
    }

    // ========== MÉTODOS PARA MONITOR ==========

    // Inicializar configuración del monitor desde localStorage

    // ========== MÉTODOS PARA SPConfig ==========

    // Edición inline para SPConfig
    editInlineSPConfig(spconfig: SPConfig, field: string): void {
        this.editingCell = spconfig.id_sp + '_' + field;
        this.originalValue = (spconfig as any)[field];
        console.log('✏️ Editando SPConfig inline:', field, 'Valor:', this.originalValue);
    }

    // Guardar edición inline de SPConfig
    saveInlineEditSPConfig(spconfig: SPConfig, field: string): void {
        console.log('💾 Guardando SPConfig inline:', field, 'Nuevo valor:', (spconfig as any)[field]);
        console.log('🔍 Original value:', this.originalValue);
        console.log('🔍 SPConfig completo:', spconfig);
        console.log('🔍 Campo específico keyId:', spconfig.keyId);
        
        // Validar que el valor haya cambiado
        if ((spconfig as any)[field] === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando edición');
            this.cancelInlineEditSPConfig();
            return;
        }

        console.log('✅ Valor SÍ cambió, procediendo a actualizar...');
        // Enviar actualización al servidor
        this.updateSPConfigField(spconfig, field);
    }

    // Toggle del estado SPConfig (A/I)
    toggleEstadoSPConfig(spconfig: SPConfig): void {
        console.log('🔄 Cambiando estado SPConfig:', spconfig.estado, '→', spconfig.estado === 'A' ? 'I' : 'A');
        
        const nuevoEstado = spconfig.estado === 'A' ? 'I' : 'A';
        const estadoAnterior = spconfig.estado;
        
        // Si va a desactivar (A → I), mostrar confirmación
        if (nuevoEstado === 'I') {
            this.spconfigToConfirm = spconfig;
            this.nuevoEstadoConfirm = nuevoEstado;
            this.estadoAnteriorConfirm = estadoAnterior;
            this.confirmMessage = `¿Está seguro de que desea desactivar el SPConfig "${spconfig.nombre}"?`;
            this.confirmHeader = 'Confirmar Desactivación';
            this.showConfirmDialog = true;
        } else {
            // Si va a activar (I → A), proceder directamente
            this.procesarCambioEstado(spconfig, nuevoEstado, estadoAnterior);
        }
    }

    // Toggle del swApi SPConfig (1/0)
    toggleSwApiSPConfig(spconfig: SPConfig): void {
        console.log('🔄 Cambiando swApi SPConfig:', spconfig.swApi, '→', spconfig.swApi === 1 ? 0 : 1);
        
        const nuevoSwApi = spconfig.swApi === 1 ? 0 : 1;
        const swApiAnterior = spconfig.swApi;
        
        // Si va a desactivar (1 → 0), mostrar confirmación
        if (nuevoSwApi === 0) {
            this.spconfigToConfirm = spconfig;
            this.nuevoEstadoConfirm = nuevoSwApi.toString();
            this.estadoAnteriorConfirm = swApiAnterior.toString();
            this.confirmMessage = `¿Está seguro de que desea desactivar la API del SPConfig "${spconfig.nombre}"?`;
            this.confirmHeader = 'Confirmar Desactivación de API';
            this.showConfirmDialog = true;
        } else {
            // Si va a activar (0 → 1), proceder directamente
            this.procesarCambioSwApi(spconfig, nuevoSwApi, swApiAnterior);
        }
    }

    // Procesar el cambio de swApi (activar/desactivar)
    procesarCambioSwApi(spconfig: SPConfig, nuevoSwApi: number, swApiAnterior: number): void {
        console.log('✅ Procesando cambio de swApi:', swApiAnterior, '→', nuevoSwApi);
        
        // Cambiar swApi localmente primero
        spconfig.swApi = nuevoSwApi;
        
        // Enviar actualización al servidor
        this.updateSPConfigField(spconfig, 'swApi', swApiAnterior);
    }

    // Procesar el cambio de estado (activar/desactivar)
    procesarCambioEstado(spconfig: SPConfig, nuevoEstado: string, estadoAnterior: string): void {
        console.log('✅ Procesando cambio de estado:', estadoAnterior, '→', nuevoEstado);
        
        // Cambiar estado localmente primero
        spconfig.estado = nuevoEstado;
        
        // Enviar actualización al servidor
        this.updateSPConfigField(spconfig, 'estado', estadoAnterior);
    }

    // Confirmar desactivación
    confirmarDesactivacion(): void {
        if (this.spconfigToConfirm) {
            // Determinar si es cambio de estado o swApi basado en el header
            if (this.confirmHeader.includes('API')) {
                // Es cambio de swApi
                this.procesarCambioSwApi(
                    this.spconfigToConfirm, 
                    parseInt(this.nuevoEstadoConfirm), 
                    parseInt(this.estadoAnteriorConfirm)
                );
            } else {
                // Es cambio de estado
                this.procesarCambioEstado(this.spconfigToConfirm, this.nuevoEstadoConfirm, this.estadoAnteriorConfirm);
            }
        }
        this.cerrarConfirmDialog();
    }

    // Cancelar desactivación
    cancelarDesactivacion(): void {
        console.log('❌ Usuario canceló la desactivación');
        this.cerrarConfirmDialog();
    }

    // Cerrar diálogo de confirmación
    cerrarConfirmDialog(): void {
        this.showConfirmDialog = false;
        this.spconfigToConfirm = null;
        this.nuevoEstadoConfirm = '';
        this.estadoAnteriorConfirm = '';
        this.confirmMessage = '';
        this.confirmHeader = '';
    }

    // Actualizar campo específico en el servidor
    updateSPConfigField(spconfig: SPConfig, field: string, valorAnterior?: any): void {
        console.log('🔄 Enviando actualización al servidor...');
        console.log('🔍 SPConfig.id_sp:', spconfig.id_sp);
        console.log('🔍 Campo a actualizar:', field);
        console.log('🔍 Valor del campo:', (spconfig as any)[field]);
        
        // Obtener datos de sesión
        const sessionBase = this.sessionService.getApiPayloadBase();
        console.log('🔍 Session base:', sessionBase);
        
        const updateData = {
            id_sp: spconfig.id_sp,
            [field]: (spconfig as any)[field],
            action: "UP",
            ...sessionBase
        };

        console.log('🔍 Payload completo a enviar:', updateData);
        const apiUrl = `${this.spconfigService.getSpconfigUrl()}/${spconfig.id_sp}`;
        console.log('🔍 URL de la API:', apiUrl);
        
        this.http.post(apiUrl, updateData).subscribe({
            next: (response) => {
                console.log('✅ SPConfig actualizado en servidor:', response);
                
                // Actualizar fecha de modificación local
                spconfig.fecha_m = new Date().toISOString();
                
                // Limpiar edición
                this.editingCell = null;
                this.originalValue = null;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Campo Actualizado',
                    detail: `Campo ${this.getFieldLabelSPConfig(field)} actualizado correctamente en el servidor`
                });
            },
            error: (error) => {
                console.error('❌ Error al actualizar SPConfig:', error);
                
                // Error registrado en logs
                console.error('❌ Error al actualizar SPConfig:', error);
                
                // Extraer información detallada del error
                let errorCode = 'N/A';
                let errorMessage = 'Error desconocido';
                let errorStatus = 'N/A';
                
                if (error.status) {
                    errorStatus = error.status.toString();
                }
                
                if (error.error) {
                    if (error.error.statuscode) {
                        errorCode = error.error.statuscode.toString();
                    }
                    if (error.error.mensaje) {
                        errorMessage = error.error.mensaje;
                    } else if (error.error.message) {
                        errorMessage = error.error.message;
                    }
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                // Revertir el cambio local
                if (valorAnterior !== undefined) {
                    (spconfig as any)[field] = valorAnterior;
                } else {
                    (spconfig as any)[field] = this.originalValue;
                }
                
                // Limpiar edición
                this.editingCell = null;
                this.originalValue = null;

                this.messageService.add({
                    severity: 'error',
                    summary: `Error ${errorStatus}`,
                    detail: `Campo: ${this.getFieldLabelSPConfig(field)} | Código: ${errorCode} | Mensaje: ${errorMessage}`,
                    life: 5000 // 5 segundos para poder leer mejor
                });
            }
        });
    }

    // Cancelar edición inline de SPConfig
    cancelInlineEditSPConfig(): void {
        if (this.editingCell && this.originalValue !== null) {
            const [id, field] = this.editingCell.split('_');
            const spconfig = this.spConfigs.find(s => s.id_sp.toString() === id);
            if (spconfig) {
                (spconfig as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;
        console.log('❌ Edición inline cancelada');
    }

    // ========== MÉTODOS PARA API Config ==========

    // Edición inline para API Config

    // ========== MÉTODOS COMPARTIDOS ==========

    // Filtro global para tablas
    onGlobalFilter(table: any, event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        table.filterGlobal(filterValue, 'contains');
    }

    // ========== FORMULARIOS SPConfig ==========

    // Abrir formulario de SPConfig
    openSPConfigForm(spconfig?: SPConfig): void {
        console.log('🚀 openSPConfigForm() ejecutado');
        console.log('📊 Estado actual - showSPConfigModal:', this.showSPConfigModal);
        
        if (spconfig) {
            // Modo edición
            this.isEditingSPConfig = true;
            this.editingSPConfigId = spconfig.id_sp;
            
            // Formatear parámetros para mostrar en el input
            let paramsFormatted = '';
            if (spconfig.params) {
                if (typeof spconfig.params === 'string') {
                    try {
                        // Si es string JSON, parsearlo y formatearlo
                        const parsed = JSON.parse(spconfig.params);
                        paramsFormatted = JSON.stringify(parsed, null, 2);
                    } catch (e) {
                        // Si no es JSON válido, usar el string tal como está
                        paramsFormatted = spconfig.params;
                    }
                } else {
                    // Si ya es un objeto, formatearlo
                    paramsFormatted = JSON.stringify(spconfig.params, null, 2);
                }
            }
            
            this.spConfigForm.patchValue({
                nombre: spconfig.nombre,
                db: spconfig.db,
                params: paramsFormatted,
                estado: spconfig.estado,
                swApi: spconfig.swApi === 1,
                ruta: spconfig.ruta,
                apiName: spconfig.apiName,
                metodo: spconfig.metodo,
                keyId: spconfig.keyId
            });
            console.log('✏️ Editando SPConfig:', spconfig.nombre);
            console.log('📝 Parámetros formateados:', paramsFormatted);
        } else {
            // Modo creación
            this.isEditingSPConfig = false;
            this.editingSPConfigId = null;
            this.spConfigForm.reset({
                estado: 'A',
                swApi: true,
                metodo: 'POST'
            });
            console.log('➕ Creando nuevo SPConfig');
        }
        
        this.showSPConfigModal = true;
        console.log('✅ showSPConfigModal establecido a:', this.showSPConfigModal);
        console.log('📋 Formulario válido:', this.spConfigForm.valid);
    }

    // Cerrar formulario de SPConfig
    closeSPConfigForm(): void {
        this.showSPConfigModal = false;
        this.spConfigForm.reset();
        this.isEditingSPConfig = false;
        this.editingSPConfigId = null;
    }

    // Guardar SPConfig
    saveSPConfig(): void {
        if (this.spConfigForm.valid) {
            const formValue = this.spConfigForm.value;
            console.log('💾 Guardando SPConfig:', formValue);
            
            // Obtener datos de sesión
            const sessionBase = this.sessionService.getApiPayloadBase();
            
            // Procesar parámetros: convertir de string formateado a string JSON compacto
            let paramsProcessed = '';
            if (formValue.params) {
                try {
                    // Si es un string formateado, parsearlo y convertirlo a string compacto
                    const parsed = JSON.parse(formValue.params);
                    paramsProcessed = JSON.stringify(parsed);
                } catch (e) {
                    // Si no es JSON válido, usar el string tal como está
                    paramsProcessed = formValue.params;
                }
            }
            
            console.log('📝 Parámetros procesados:', paramsProcessed);

            if (this.isEditingSPConfig && this.editingSPConfigId) {
                // Editar SPConfig existente
                const index = this.spConfigs.findIndex(s => s.id_sp === this.editingSPConfigId);
                
                if (index !== -1) {
                    // Verificar nombre duplicado
                    const nombreExiste = this.spConfigs.find(s => 
                        s.id_sp !== this.editingSPConfigId && 
                        s.nombre === formValue.nombre
                    );
                    
                    if (nombreExiste) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Nombre Duplicado',
                            detail: `Ya existe un SPConfig con el nombre "${formValue.nombre}"`
                        });
                        return;
                    }
                    
                    // Actualizar SPConfig
                    this.spConfigs[index] = {
                        ...this.spConfigs[index],
                        nombre: formValue.nombre,
                        db: formValue.db,
                        params: paramsProcessed,
                        estado: formValue.estado,
                        swApi: formValue.swApi ? 1 : 0,
                        ruta: formValue.ruta,
                        apiName: formValue.apiName,
                        metodo: formValue.metodo,
                        keyId: formValue.keyId,
                        fecha_m: new Date().toISOString()
                    };

                    this.messageService.add({
                        severity: 'success',
                        summary: 'SPConfig Actualizado',
                        detail: 'Configuración de SP actualizada correctamente'
                    });
                }
            } else {
                // Crear nuevo SPConfig
                // Verificar nombre duplicado
                const nombreExiste = this.spConfigs.find(s => s.nombre === formValue.nombre);
                
                if (nombreExiste) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Nombre Duplicado',
                        detail: `Ya existe un SPConfig con el nombre "${formValue.nombre}"`
                    });
                    return;
                }
                
                const nuevoSPConfig: SPConfig = {
                    id_sp: Math.max(...this.spConfigs.map(s => s.id_sp)) + 1,
                    nombre: formValue.nombre,
                    db: formValue.db,
                    params: paramsProcessed,
                    estado: formValue.estado,
                    swApi: formValue.swApi ? 1 : 0,
                    ruta: formValue.ruta,
                    apiName: formValue.apiName,
                    metodo: formValue.metodo,
                    keyId: formValue.keyId,
                    fecha_m: new Date().toISOString()
                };

                this.spConfigs.push(nuevoSPConfig);

                this.messageService.add({
                    severity: 'success',
                    summary: 'SPConfig Creado',
                    detail: 'Nueva configuración de SP creada correctamente'
                });
            }

            this.closeSPConfigForm();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: 'Por favor, complete todos los campos requeridos'
            });
        }
    }

    // Eliminar SPConfig (mostrar confirmación)
    eliminarSPConfig(spconfig: SPConfig): void {
        console.log('🗑️ Solicitando eliminación de SPConfig:', spconfig.nombre);
        this.spConfigToDelete = spconfig;
        this.showConfirmDeleteSPConfig = true;
    }

    // Confirmar eliminación de SPConfig
    confirmDeleteSPConfig(): void {
        if (this.spConfigToDelete) {
            console.log('✅ Confirmando eliminación de SPConfig:', this.spConfigToDelete.nombre);
            
            const index = this.spConfigs.findIndex(s => s.id_sp === this.spConfigToDelete!.id_sp);
            
            if (index !== -1) {
                this.spConfigs.splice(index, 1);
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'SPConfig Eliminado',
                    detail: `Configuración "${this.spConfigToDelete.nombre}" eliminada correctamente`
                });
            }
        }
        
        this.cancelDeleteSPConfig();
    }

    // Cancelar eliminación de SPConfig
    cancelDeleteSPConfig(): void {
        this.showConfirmDeleteSPConfig = false;
        this.spConfigToDelete = null;
        console.log('❌ Eliminación de SPConfig cancelada');
    }

    // ========== FORMULARIOS API Config ==========

    // Abrir formulario de API Config

    // ========== TESTING DE API ==========

    // Probar conexión de API
    testAPIConnection(api: any): void {
        console.log('🧪 Probando conexión de API:', api.nombre, 'URL:', api.url);
        
        this.testingAPI = true;
        
        // Simular test de API (en producción sería una llamada real)
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% éxito para demo
            
            const result = {
                api: api.nombre,
                url: api.url,
                timestamp: new Date().toISOString(),
                success: success,
                responseTime: Math.floor(Math.random() * 2000) + 100,
                status: success ? 200 : 500,
                message: success ? 'Conexión exitosa' : 'Error de conexión'
            };
            
            this.testResults.unshift(result);
            
            this.messageService.add({
                severity: success ? 'success' : 'error',
                summary: success ? 'Conexión Exitosa' : 'Error de Conexión',
                detail: `${api.nombre}: ${result.message} (${result.responseTime}ms)`
            });
            
            this.testingAPI = false;
        }, 1000);
    }

    // ========== HELPERS ==========

    // Helper para obtener etiquetas de campos de SPConfig
    getFieldLabelSPConfig(field: string): string {
        const labels: { [key: string]: string } = {
            'nombre': 'Nombre',
            'db': 'Base de Datos',
            'estado': 'Estado',
            'swApi': 'API Activa',
            'ruta': 'Ruta',
            'apiName': 'Nombre API',
            'metodo': 'Método'
        };
        return labels[field] || field;
    }

    // Helper para obtener etiquetas de campos de API Config
    getFieldLabelAPIConfig(field: string): string {
        const labels: { [key: string]: string } = {
            'nombre': 'Nombre',
            'url': 'URL',
            'metodo': 'Método',
            'estado': 'Estado',
            'timeout': 'Timeout'
        };
        return labels[field] || field;
    }

    // Helper para obtener opciones de estados
    getEstadosOptions(): any[] {
        return [
            { label: 'Activo', value: 'A' },
            { label: 'Inactivo', value: 'I' }
        ];
    }

    // Helper para obtener opciones de SW API
    getSwApiOptions(): any[] {
        return [
            { label: 'Activo', value: true },
            { label: 'Inactivo', value: false }
        ];
    }

    // Helper para obtener opciones de métodos
    getMetodosOptions(): any[] {
        return [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'PATCH', value: 'PATCH' },
            { label: 'DELETE', value: 'DELETE' }
        ];
    }

    // Helper para obtener etiqueta de estado SPConfig
    getEstadoSPConfigLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    // Helper para obtener severidad de estado SPConfig
    getEstadoSPConfigSeverity(estado: string): string {
        return estado === 'A' ? 'success' : 'danger';
    }

    // Helper para obtener etiqueta de swApi SPConfig
    getSwApiLabel(swApi: number): string {
        return swApi === 1 ? 'Activo' : 'Inactivo';
    }

    // Helper para obtener severidad de swApi SPConfig
    getSwApiSeverity(swApi: number): string {
        return swApi === 1 ? 'success' : 'danger';
    }

    // Helper para obtener etiqueta de estado API Config
    getEstadoAPIConfigLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    // Helper para obtener severidad de estado API Config
    getEstadoAPIConfigSeverity(estado: string): string {
        return estado === 'A' ? 'success' : 'danger';
    }

    // ========== TABS ==========

    // Cambio de tab
    onTabChange(event: any): void {
        console.log('🔄 Tab cambiado a:', event.index, 'Nombre:', event.originalEvent?.target?.textContent);
        
        // Cargar controladores cuando se seleccione el tab de Controllers (índice 2)
        if (event.index === 2) {
            this.loadControllers();
        }
        
        // Inicializar monitor cuando se seleccione el tab de Monitor (índice 3)
        if (event.index === 3) {
            // TODO: Implementar inicialización del monitor si es necesario
            console.log('📊 Tab Monitor seleccionado - inicialización pendiente');
        }
    }

    // ========== MÉTODOS PARA API CONFIG ==========

    /**
     * Guardar configuración de API
     */
    saveAPIConfig(): void {
        console.log('💾 Guardando configuración de API...');
        // TODO: Implementar lógica para guardar configuración de API
    }

    /**
     * Cerrar formulario de configuración de API
     */
    closeAPIConfigForm(): void {
        console.log('❌ Cerrando formulario de API config');
        this.showAPIConfigModal = false;
        this.isEditingAPIConfig = false;
        this.editingAPIConfigId = null;
        this.apiConfigForm.reset();
    }

    /**
     * Cancelar eliminación de configuración de API
     */
    cancelDeleteAPIConfig(): void {
        console.log('❌ Cancelando eliminación de API config');
        this.showConfirmDeleteAPIConfig = false;
        this.apiConfigToDelete = null;
    }

    /**
     * Confirmar eliminación de configuración de API
     */
    confirmDeleteAPIConfig(): void {
        console.log('🗑️ Confirmando eliminación de API config');
        if (this.apiConfigToDelete) {
            // TODO: Implementar lógica para eliminar configuración de API
            this.showConfirmDeleteAPIConfig = false;
            this.apiConfigToDelete = null;
        }
    }

    /**
     * Obtener severidad para estados de status
     */
    getStatusSeverity(statusCode: number): string {
        if (statusCode >= 200 && statusCode < 300) {
            return 'success';
        } else if (statusCode >= 400 && statusCode < 500) {
            return 'warning';
        } else if (statusCode >= 500) {
            return 'danger';
        }
        return 'info';
    }

    /**
     * Formatear JSON para mostrar
     */
    formatJson(obj: any): string {
        try {
            return JSON.stringify(obj, null, 2);
        } catch (error) {
            return 'Error al formatear JSON';
        }
    }
    
    // Método para validar si hay parámetros válidos
    hasValidParams(params: any): boolean {
        // Si no hay parámetros
        if (!params) {
            return false;
        }
        
        // Si es string vacío, null, o array vacío como string
        if (params === '' || params === 'null' || params === '[]' || params === '{}') {
            return false;
        }
        
        // Si es un array y está vacío
        if (Array.isArray(params) && params.length === 0) {
            return false;
        }
        
        // Si es un objeto y está vacío
        if (typeof params === 'object' && Object.keys(params).length === 0) {
            return false;
        }
        
        // Si es string, intentar parsearlo para verificar si es JSON válido
        if (typeof params === 'string') {
            try {
                const parsed = JSON.parse(params);
                if (Array.isArray(parsed) && parsed.length === 0) {
                    return false;
                }
                if (typeof parsed === 'object' && Object.keys(parsed).length === 0) {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
        
        return true;
    }

    // Método para mostrar parámetros JSON formateados
    showParametros(params: any): void {
        
        try {
            // Si ya es un objeto/array, usarlo directamente
            if (typeof params === 'object') {
                this.parametrosJSON = JSON.stringify(params, null, 2);
            } else {
                // Si es string, intentar parsearlo
                const parsedParams = JSON.parse(params);
                this.parametrosJSON = JSON.stringify(parsedParams, null, 2);
            }
        } catch (e) {
            // Si no se puede parsear, mostrar como texto
            this.parametrosJSON = typeof params === 'string' ? params : JSON.stringify(params, null, 2);
        }
        this.showParametrosModal = true;
    }
}
