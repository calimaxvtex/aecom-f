import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@/core/services/session.service';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
// import { DropdownModule } from 'primeng/dropdown';
// import { CalendarModule } from 'primeng/calendar';

// Interfaces mock para datos ficticios
interface UsuarioMock {
    id: number;
    usuario: number;
    email: string;
    nombre: string;
    estado: number;
    logins: number;
    intentos: number;
    fecha_login: string | null;
    fecha_intento: string | null;
    fecha_m: string;
    fecha_a: string;
    fecha: string;
    id_session: number;
    logout: number;
}

interface RolMock {
    id_rol: number;
    nombre: string;
    estado: string;
    fecha_m: string;
}

interface RolDetalleMock {
    id_rold: number;
    id_rol: number;
    ren: number;
    id_menu: number;
    fecha_m: string;
    nombre_rol: string;
    nombre_menu: string | null;
}

interface RolUsuarioMock {
    id: number;
    id_usu: number;
    id_rol: number;
    estado: string;
    fecha_m: string;
    usu_m: string;
    nombre_usuario: string;
    email_usuario: string;
    nombre_rol: string;
}

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        DialogModule,
        TagModule,
        TooltipModule,
        ToastModule,
        TabsModule,
        CheckboxModule,
        CardModule,
        SelectModule,
        // DropdownModule,
        // CalendarModule
    ],
    providers: [MessageService],
    template: `
        <div class="card">
            <!-- Pestañas principales -->
            <p-tabs value="0" (onTabChange)="onTabChange($event)">
                <p-tablist>
                    <p-tab value="0">
                        <i class="pi pi-users mr-2"></i>
                        Usuarios
                    </p-tab>
                    <p-tab value="1">
                        <i class="pi pi-key mr-2"></i>
                        Permisos
                    </p-tab>
                    <p-tab value="2">
                        <i class="pi pi-shield mr-2"></i>
                        Roles
                    </p-tab>
                </p-tablist>
                
                <p-tabpanels>
                    <!-- Panel 1: Usuarios -->
                    <p-tabpanel value="0">
                        <div class="mb-4">
                            <h1 class="text-2xl font-bold mb-2">👥 Gestión de Usuarios</h1>
                            <p class="text-gray-600 mb-4">Administra los usuarios del sistema</p>
                        </div>

                        <p-table
                            #dtUsuarios
                            [value]="usuarios"
                            [paginator]="true"
                            [rows]="10"
                            [showCurrentPageReport]="true"
                            responsiveLayout="scroll"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                            [rowsPerPageOptions]="[10, 25, 50]"
                            [globalFilterFields]="['nombre', 'email', 'usuario']"
                        >
                            <ng-template #caption>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <input 
                                        pInputText
                                        type="text" 
                                        (input)="onGlobalFilter(dtUsuarios, $event)" 
                                        placeholder="Buscar usuarios..." 
                                        class="w-full sm:w-80 order-1 sm:order-0"
                                    />
                                    <div class="flex gap-2 ml-auto">
                                        <button 
                                            (click)="cargarUsuarios()" 
                                            pButton 
                                            raised 
                                            class="w-auto" 
                                            icon="pi pi-refresh" 
                                            label="Actualizar"
                                            [loading]="loadingUsuarios"
                                        ></button>
                                        <button 
                                            (click)="openUsuarioForm()" 
                                            pButton 
                                            raised 
                                            class="w-auto" 
                                            icon="pi pi-plus" 
                                            label="Agregar Usuario"
                                        ></button>
                                    </div>
                                </div>
                            </ng-template>

                            <ng-template #header>
                                <tr>
                                    <th pSortableColumn="usuario" style="width: 100px">ID Usuario <p-sortIcon field="usuario"></p-sortIcon></th>
                                    <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                                    <th pSortableColumn="email" style="min-width: 250px">Email <p-sortIcon field="email"></p-sortIcon></th>
                                    <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                                    <th pSortableColumn="logins" style="width: 80px">Logins <p-sortIcon field="logins"></p-sortIcon></th>
                                    <th pSortableColumn="intentos" style="width: 80px">Intentos <p-sortIcon field="intentos"></p-sortIcon></th>
                                    <th pSortableColumn="fecha_login" style="width: 150px">Último Login <p-sortIcon field="fecha_login"></p-sortIcon></th>
                                    <th pSortableColumn="fecha_m" style="width: 150px">Modificado <p-sortIcon field="fecha_m"></p-sortIcon></th>
                                    <th style="width: 150px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-usuario>
                                <tr>
                                    <!-- Usuario - EDITABLE (como menu-admin) -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== usuario.id + '_usuario'"
                                            (click)="editInline(usuario, 'usuario')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{usuario.usuario}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === usuario.id + '_usuario'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="text"
                                                [(ngModel)]="usuario.usuario"
                                                (keyup.enter)="saveInlineEdit(usuario, 'usuario')"
                                                (keyup.escape)="cancelInlineEdit()"
                                                class="p-inputtext-sm"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Código usuario"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEdit(usuario, 'usuario')"
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
                                    
                                    <!-- Nombre - EDITABLE (como menu-admin) -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== usuario.id + '_nombre'"
                                            (click)="editInline(usuario, 'nombre')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{usuario.nombre}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === usuario.id + '_nombre'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                [(ngModel)]="usuario.nombre"
                                                (keyup.enter)="saveInlineEdit(usuario, 'nombre')"
                                                (keyup.escape)="cancelInlineEdit()"
                                                class="flex-1 p-inputtext-sm"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="Nombre completo"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEdit(usuario, 'nombre')"
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
                                    
                                    <!-- Email - EDITABLE (como menu-admin) -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== usuario.id + '_email'"
                                            (click)="editInline(usuario, 'email')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{usuario.email}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === usuario.id + '_email'"
                                            class="inline-edit-container"
                                        >
                                            <input
                                                pInputText
                                                type="email"
                                                [(ngModel)]="usuario.email"
                                                (keyup.enter)="saveInlineEdit(usuario, 'email')"
                                                (keyup.escape)="cancelInlineEdit()"
                                                class="flex-1 p-inputtext-sm"
                                                #input
                                                (focus)="input.select()"
                                                autofocus
                                                placeholder="correo@ejemplo.com"
                                            />
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEdit(usuario, 'email')"
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
                                    
                                    <!-- Estado - EDITABLE con toggle (como menu-admin) -->
                                    <td>
                                        <p-tag 
                                            [value]="getEstadoLabel(usuario.estado)" 
                                            [severity]="getEstadoSeverity(usuario.estado)"
                                            (click)="toggleField(usuario, 'estado')"
                                            class="cursor-pointer hover:opacity-80 transition-opacity"
                                            title="Clic para cambiar"
                                        ></p-tag>
                                    </td>
                                    <td>{{usuario.logins}}</td>
                                    <td>
                                        <span [class]="usuario.intentos > 0 ? 'text-red-600 font-bold' : ''">
                                            {{usuario.intentos}}
                                        </span>
                                    </td>
                                    <td>{{usuario.fecha_login ? (usuario.fecha_login | date:'short') : 'Nunca'}}</td>
                                    <td>{{usuario.fecha_m | date:'short'}}</td>
                                    <!-- Acciones - Solo editar modal y eliminar -->
                                    <td>
                                        <div class="flex gap-1">
                                            <button
                                                pButton
                                                icon="pi pi-pencil"
                                                (click)="editarUsuario(usuario)"
                                                class="p-button-sm p-button-warning p-button-text"
                                                pTooltip="Editar en modal"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-trash"
                                                (click)="eliminarUsuario(usuario)"
                                                class="p-button-sm p-button-danger p-button-text"
                                                pTooltip="Eliminar"
                                            ></button>
                                        </div>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-tabpanel>

                    <!-- Panel 2: Permisos -->
                    <p-tabpanel value="1">
                        <div class="mb-4">
                            <h1 class="text-2xl font-bold mb-2">🔐 Gestión de Permisos</h1>
                            <p class="text-gray-600 mb-4">Administra los permisos y roles asignados a usuarios</p>
                        </div>

                        <p-table
                            #dtRolUsuarios
                            [value]="rolUsuarios"
                            [paginator]="true"
                            [rows]="10"
                            [showCurrentPageReport]="true"
                            responsiveLayout="scroll"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} permisos"
                            [rowsPerPageOptions]="[10, 25, 50]"
                            [globalFilterFields]="['nombre_usuario', 'email_usuario', 'nombre_rol']"
                        >
                            <ng-template #caption>
                                <div class="flex flex-wrap gap-2 items-center justify-between">
                                    <input 
                                        pInputText
                                        type="text" 
                                        (input)="onGlobalFilter(dtRolUsuarios, $event)" 
                                        placeholder="Buscar permisos..." 
                                        class="w-full sm:w-80 order-1 sm:order-0"
                                    />
                                    <div class="flex gap-2 ml-auto">
                                        <button 
                                            (click)="cargarPermisos()" 
                                            pButton 
                                            raised 
                                            class="w-auto" 
                                            icon="pi pi-refresh" 
                                            label="Actualizar"
                                            [loading]="loadingPermisos"
                                        ></button>
                                        <button 
                                            (click)="openPermisoForm()" 
                                            pButton 
                                            outlined 
                                            class="w-auto" 
                                            icon="pi pi-plus" 
                                            label="Asignar Permiso"
                                        ></button>
                                    </div>
                                </div>
                            </ng-template>

                            <ng-template #header>
                                <tr>
                                    <th style="width: 100px">ID</th>
                                    <th pSortableColumn="id_usu" style="min-width: 200px">ID Usuario <p-sortIcon field="id_usu"></p-sortIcon></th>
                                    <th style="min-width: 250px">Email Usuario</th>
                                    <th pSortableColumn="id_rol" style="min-width: 180px">Rol <p-sortIcon field="id_rol"></p-sortIcon></th>
                                    <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                                    <th style="width: 150px">Modificado</th>
                                    <th style="width: 120px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-permiso>
                                <tr>
                                    <td>{{permiso.id}}</td>
                                    
                                    <!-- ID Usuario - EDITABLE con select -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== permiso.id + '_id_usu'"
                                            (click)="editInlinePermiso(permiso, 'id_usu')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{permiso.id_usu}} - {{permiso.nombre_usuario}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === permiso.id + '_id_usu'"
                                            class="inline-edit-container"
                                        >
                                            <p-select
                                                [(ngModel)]="permiso.id_usu"
                                                [options]="getUsuariosOptions()"
                                                optionLabel="label"
                                                optionValue="value"
                                                (keyup.enter)="saveInlineEditPermiso(permiso, 'id_usu')"
                                                (keyup.escape)="cancelInlineEditPermiso()"
                                                class="flex-1"
                                                placeholder="Seleccionar usuario"
                                                autofocus
                                            ></p-select>
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditPermiso(permiso, 'id_usu')"
                                                class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                pTooltip="Guardar (Enter)"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEditPermiso()"
                                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                pTooltip="Deshacer (Escape)"
                                            ></button>
                                        </div>
                                    </td>
                                    
                                    <!-- Email Usuario - Solo informativo -->
                                    <td>{{permiso.email_usuario}}</td>
                                    
                                    <!-- Rol - EDITABLE con select -->
                                    <td>
                                        <span
                                            *ngIf="editingCell !== permiso.id + '_id_rol'"
                                            (click)="editInlinePermiso(permiso, 'id_rol')"
                                            class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                            title="Clic para editar"
                                        >
                                            {{permiso.nombre_rol}}
                                        </span>
                                        <div
                                            *ngIf="editingCell === permiso.id + '_id_rol'"
                                            class="inline-edit-container"
                                        >
                                            <p-select
                                                [(ngModel)]="permiso.id_rol"
                                                [options]="getRolesOptions()"
                                                optionLabel="label"
                                                optionValue="value"
                                                (keyup.enter)="saveInlineEditPermiso(permiso, 'id_rol')"
                                                (keyup.escape)="cancelInlineEditPermiso()"
                                                class="flex-1"
                                                placeholder="Seleccionar rol"
                                                autofocus
                                            ></p-select>
                                            <button
                                                pButton
                                                icon="pi pi-check"
                                                (click)="saveInlineEditPermiso(permiso, 'id_rol')"
                                                class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                pTooltip="Guardar (Enter)"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-undo"
                                                (click)="cancelInlineEditPermiso()"
                                                class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                pTooltip="Deshacer (Escape)"
                                            ></button>
                                        </div>
                                    </td>
                                    
                                    <!-- Estado - EDITABLE con toggle -->
                                    <td>
                                        <p-tag 
                                            [value]="getEstadoPermisoLabel(permiso.estado)" 
                                            [severity]="getEstadoPermisoSeverity(permiso.estado)"
                                            (click)="toggleFieldPermiso(permiso, 'estado')"
                                            class="cursor-pointer hover:opacity-80 transition-opacity"
                                            title="Clic para cambiar"
                                        ></p-tag>
                                    </td>
                                    
                                    <!-- Fecha Modificación - Solo informativo -->
                                    <td>{{permiso.fecha_m | date:'short'}}</td>
                                    
                                    <!-- Acciones - Solo editar modal y eliminar -->
                                    <td>
                                        <div class="flex gap-1">
                                            <button
                                                pButton
                                                icon="pi pi-pencil"
                                                (click)="editarPermiso(permiso)"
                                                class="p-button-sm p-button-warning p-button-text"
                                                pTooltip="Editar en modal"
                                            ></button>
                                            <button
                                                pButton
                                                icon="pi pi-trash"
                                                (click)="eliminarPermiso(permiso)"
                                                class="p-button-sm p-button-danger p-button-text"
                                                pTooltip="Eliminar"
                                            ></button>
                                        </div>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-tabpanel>

                    <!-- Panel 3: Roles -->
                    <p-tabpanel value="2">
                        <div class="mb-4">
                            <h1 class="text-2xl font-bold mb-2">👑 Gestión de Roles</h1>
                            <p class="text-gray-600 mb-4">Administra los roles del sistema y sus detalles</p>
                        </div>

                        <!-- Tabla de Roles -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-3">
                                📋 Lista de Roles 
                                <span class="text-sm font-normal text-blue-600 ml-2">
                                    💡 Clic en una fila para seleccionar y ver detalles
                                </span>
                            </h3>
                            <p-table
                                #dtRoles
                                [value]="roles"
                                [paginator]="true"
                                [rows]="5"
                                [showCurrentPageReport]="true"
                                responsiveLayout="scroll"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
                                [rowsPerPageOptions]="[5, 10, 25]"
                                [globalFilterFields]="['nombre']"
                                selectionMode="single"
                                [(selection)]="rolSeleccionado"
                                (onRowSelect)="onRolSelect($event)"
                            >
                                <ng-template #caption>
                                    <div class="flex flex-wrap gap-2 items-center justify-between">
                                        <input 
                                            pInputText
                                            type="text" 
                                            (input)="onGlobalFilter(dtRoles, $event)" 
                                            placeholder="Buscar roles..." 
                                            class="w-full sm:w-80 order-1 sm:order-0"
                                        />
                                        <div class="flex gap-2 ml-auto">
                                            <button 
                                                (click)="cargarRoles()" 
                                                pButton 
                                                raised 
                                                class="w-auto" 
                                                icon="pi pi-refresh" 
                                                label="Actualizar"
                                                [loading]="loadingRoles"
                                            ></button>
                                            <button 
                                                (click)="openRolForm()" 
                                                pButton 
                                                outlined 
                                                class="w-auto" 
                                                icon="pi pi-plus" 
                                                label="Agregar Rol"
                                            ></button>
                                        </div>
                                    </div>
                                </ng-template>

                                <ng-template #header>
                                    <tr>
                                        <th style="width: 80px">ID</th>
                                        <th pSortableColumn="nombre" style="min-width: 200px">Nombre <p-sortIcon field="nombre"></p-sortIcon></th>
                                        <th pSortableColumn="estado" style="width: 100px">Estado <p-sortIcon field="estado"></p-sortIcon></th>
                                        <th style="width: 150px">Modificado</th>
                                        <th style="width: 120px">Acciones</th>
                                    </tr>
                                </ng-template>

                                <ng-template #body let-rol>
                                    <tr 
                                        [class]="rolSeleccionado?.id_rol === rol.id_rol ? 'selected-row' : ''"
                                        (click)="selectRol(rol)"
                                        class="cursor-pointer hover:bg-blue-50 transition-colors"
                                        [title]="'Clic para seleccionar rol: ' + rol.nombre"
                                    >
                                        <td>{{rol.id_rol}}</td>
                                        
                                        <!-- Nombre - EDITABLE -->
                                        <td>
                                            <span
                                                *ngIf="editingCell !== rol.id_rol + '_nombre'"
                                                (click)="editInlineRol(rol, 'nombre')"
                                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                                title="Clic para editar"
                                            >
                                                {{rol.nombre}}
                                            </span>
                                            <div
                                                *ngIf="editingCell === rol.id_rol + '_nombre'"
                                                class="inline-edit-container"
                                            >
                                                <input
                                                    pInputText
                                                    type="text"
                                                    [(ngModel)]="rol.nombre"
                                                    (keyup.enter)="saveInlineEditRol(rol, 'nombre')"
                                                    (keyup.escape)="cancelInlineEditRol()"
                                                    class="p-inputtext-sm flex-1"
                                                    #input
                                                    (focus)="input.select()"
                                                    autofocus
                                                    placeholder="Nombre del rol"
                                                />
                                                <button
                                                    pButton
                                                    icon="pi pi-check"
                                                    (click)="saveInlineEditRol(rol, 'nombre')"
                                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                    pTooltip="Guardar (Enter)"
                                                ></button>
                                                <button
                                                    pButton
                                                    icon="pi pi-undo"
                                                    (click)="cancelInlineEditRol()"
                                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                    pTooltip="Deshacer (Escape)"
                                                ></button>
                                            </div>
                                        </td>
                                        
                                        <!-- Estado - EDITABLE con toggle -->
                                        <td>
                                            <p-tag 
                                                [value]="getEstadoRolLabel(rol.estado)" 
                                                [severity]="getEstadoRolSeverity(rol.estado)"
                                                (click)="toggleFieldRol(rol, 'estado')"
                                                class="cursor-pointer hover:opacity-80 transition-opacity"
                                                title="Clic para cambiar"
                                            ></p-tag>
                                        </td>
                                        
                                        <!-- Fecha Modificación - Solo informativo -->
                                        <td>{{rol.fecha_m | date:'short'}}</td>
                                        
                                        <!-- Acciones - Editar modal y eliminar -->
                                        <td>
                                            <div class="flex gap-1">
                                                <button
                                                    pButton
                                                    icon="pi pi-pencil"
                                                    (click)="editarRol(rol)"
                                                    class="p-button-sm p-button-warning p-button-text"
                                                    pTooltip="Editar en modal"
                                                ></button>
                                                <button
                                                    pButton
                                                    icon="pi pi-trash"
                                                    (click)="eliminarRol(rol)"
                                                    class="p-button-sm p-button-danger p-button-text"
                                                    pTooltip="Eliminar"
                                                ></button>
                                            </div>
                                        </td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        </div>

                        <!-- Tabla de Rol Detalle (dependiente de la selección) -->
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold mb-3">
                                📋 Detalles del Rol: 
                                <span class="text-blue-600">
                                    {{rolSeleccionado ? rolSeleccionado.nombre : 'Seleccione un rol'}}
                                </span>
                            </h3>
                            <div *ngIf="!rolSeleccionado" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div class="flex items-center">
                                    <i class="pi pi-info-circle text-blue-500 mr-2"></i>
                                    <span class="text-blue-700">
                                        💡 <strong>Instrucción:</strong> Haz clic en una fila de la tabla de Roles de arriba para seleccionar un rol y ver sus detalles aquí.
                                    </span>
                                </div>
                            </div>
                            
                            <p-table
                                #dtRolDetalle
                                [value]="rolDetallesFiltrados"
                                [paginator]="true"
                                [rows]="10"
                                [showCurrentPageReport]="true"
                                responsiveLayout="scroll"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} detalles"
                                [rowsPerPageOptions]="[10, 25, 50]"
                                [globalFilterFields]="['nombre_menu']"
                                [loading]="!rolSeleccionado"
                            >
                                <ng-template #caption>
                                    <div class="flex flex-wrap gap-2 items-center justify-between">
                                        <input 
                                            pInputText
                                            type="text" 
                                            (input)="onGlobalFilter(dtRolDetalle, $event)" 
                                            placeholder="Buscar detalles..." 
                                            class="w-full sm:w-80 order-1 sm:order-0"
                                            [disabled]="!rolSeleccionado"
                                        />
                                        <button 
                                            (click)="openRolDetalleForm()" 
                                            pButton 
                                            outlined 
                                            class="w-full sm:w-auto flex-order-0 sm:flex-order-1" 
                                            icon="pi pi-plus" 
                                            label="Agregar Detalle"
                                            [disabled]="!rolSeleccionado"
                                        ></button>
                                    </div>
                                </ng-template>

                                <ng-template #header>
                                    <tr>
                                        <th style="width: 80px">ID</th>
                                        <th pSortableColumn="ren" style="width: 100px">REN <p-sortIcon field="ren"></p-sortIcon></th>
                                        <th pSortableColumn="id_menu" style="min-width: 150px">ID Menú <p-sortIcon field="id_menu"></p-sortIcon></th>
                                        <th style="min-width: 200px">Nombre Menú</th>
                                        <th style="width: 150px">Modificado</th>
                                        <th style="width: 120px">Acciones</th>
                                    </tr>
                                </ng-template>

                                <ng-template #body let-detalle>
                                    <tr>
                                        <td>{{detalle.id_rold}}</td>
                                        
                                        <!-- REN - EDITABLE -->
                                        <td>
                                            <span
                                                *ngIf="editingCell !== detalle.id_rold + '_ren'"
                                                (click)="editInlineRolDetalle(detalle, 'ren')"
                                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                                title="Clic para editar"
                                            >
                                                {{detalle.ren}}
                                            </span>
                                            <div
                                                *ngIf="editingCell === detalle.id_rold + '_ren'"
                                                class="inline-edit-container"
                                            >
                                                <input
                                                    pInputText
                                                    type="number"
                                                    [(ngModel)]="detalle.ren"
                                                    (keyup.enter)="saveInlineEditRolDetalle(detalle, 'ren')"
                                                    (keyup.escape)="cancelInlineEditRolDetalle()"
                                                    class="p-inputtext-sm flex-1"
                                                    #input
                                                    (focus)="input.select()"
                                                    autofocus
                                                    placeholder="Orden"
                                                    min="1"
                                                />
                                                <button
                                                    pButton
                                                    icon="pi pi-check"
                                                    (click)="saveInlineEditRolDetalle(detalle, 'ren')"
                                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                    pTooltip="Guardar (Enter)"
                                                ></button>
                                                <button
                                                    pButton
                                                    icon="pi pi-undo"
                                                    (click)="cancelInlineEditRolDetalle()"
                                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                    pTooltip="Deshacer (Escape)"
                                                ></button>
                                            </div>
                                        </td>
                                        
                                        <!-- ID Menu - EDITABLE con select -->
                                        <td>
                                            <span
                                                *ngIf="editingCell !== detalle.id_rold + '_id_menu'"
                                                (click)="editInlineRolDetalle(detalle, 'id_menu')"
                                                class="editable-cell cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                                                title="Clic para editar"
                                            >
                                                {{getMenuNombre(detalle.id_menu)}}
                                            </span>
                                            <div
                                                *ngIf="editingCell === detalle.id_rold + '_id_menu'"
                                                class="inline-edit-container"
                                            >
                                                <p-select
                                                    [(ngModel)]="detalle.id_menu"
                                                    [options]="getMenusOptions()"
                                                    optionLabel="label"
                                                    optionValue="value"
                                                    (keyup.enter)="saveInlineEditRolDetalle(detalle, 'id_menu')"
                                                    (keyup.escape)="cancelInlineEditRolDetalle()"
                                                    class="flex-1"
                                                    placeholder="Seleccionar menú"
                                                    autofocus
                                                ></p-select>
                                                <button
                                                    pButton
                                                    icon="pi pi-check"
                                                    (click)="saveInlineEditRolDetalle(detalle, 'id_menu')"
                                                    class="p-button-sm p-button-success p-button-text inline-action-btn"
                                                    pTooltip="Guardar (Enter)"
                                                ></button>
                                                <button
                                                    pButton
                                                    icon="pi pi-undo"
                                                    (click)="cancelInlineEditRolDetalle()"
                                                    class="p-button-sm p-button-secondary p-button-text inline-action-btn"
                                                    pTooltip="Deshacer (Escape)"
                                                ></button>
                                            </div>
                                        </td>
                                        
                                        <!-- Nombre Menú - Solo informativo -->
                                        <td>{{detalle.nombre_menu || 'Sin menú'}}</td>
                                        
                                        <!-- Fecha Modificación - Solo informativo -->
                                        <td>{{detalle.fecha_m | date:'short'}}</td>
                                        
                                        <!-- Acciones - Editar modal y eliminar -->
                                        <td>
                                            <div class="flex gap-1">
                                                <button
                                                    pButton
                                                    icon="pi pi-pencil"
                                                    (click)="editarRolDetalle(detalle)"
                                                    class="p-button-sm p-button-warning p-button-text"
                                                    pTooltip="Editar en modal"
                                                ></button>
                                                <button
                                                    pButton
                                                    icon="pi pi-trash"
                                                    (click)="eliminarRolDetalle(detalle)"
                                                    class="p-button-sm p-button-danger p-button-text"
                                                    pTooltip="Eliminar"
                                                ></button>
                                            </div>
                                        </td>
                                    </tr>
                                </ng-template>

                                <ng-template #emptymessage>
                                    <tr>
                                        <td colspan="5" class="text-center py-8">
                                            <div class="text-gray-500">
                                                <i class="pi pi-info-circle text-2xl mb-2"></i>
                                                <p>{{rolSeleccionado ? 'No hay detalles para este rol' : 'Seleccione un rol para ver sus detalles'}}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </ng-template>
                            </p-table>
                        </div>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>

        <!-- Toast para mensajes -->
        <p-toast></p-toast>

        <!-- Modal del Formulario de Usuario (siguiendo patrón de menu-admin) -->
        <p-dialog 
            [header]="usuarioFormTitle" 
            [(visible)]="showUsuarioModal"
            [modal]="true"
            [style]="{width: '500px'}"
            [closable]="true"
        >
            <form [formGroup]="usuarioForm" (ngSubmit)="saveUsuario()">
                <div class="grid grid-cols-1 gap-4">
                    <!-- Usuario -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Usuario *</label>
                        <input 
                            pInputText 
                            formControlName="usuario"
                            placeholder="Número de empleado"
                            class="w-full"
                            [class.ng-invalid]="usuarioForm.get('usuario')?.invalid && usuarioForm.get('usuario')?.touched"
                        />
                        <small 
                            class="p-error block" 
                            *ngIf="usuarioForm.get('usuario')?.invalid && usuarioForm.get('usuario')?.touched">
                            El número de empleado es requerido y debe contener solo números
                        </small>
                    </div>

                    <!-- Nombre -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Nombre y Apellidos *</label>
                        <input 
                            pInputText 
                            formControlName="nombre"
                            placeholder="Nombre y apellidos"
                            class="w-full"
                            [class.ng-invalid]="usuarioForm.get('nombre')?.invalid && usuarioForm.get('nombre')?.touched"
                        />
                        <small 
                            class="p-error block" 
                            *ngIf="usuarioForm.get('nombre')?.invalid && usuarioForm.get('nombre')?.touched">
                            El nombre es requerido y debe contener solo letras y espacios
                        </small>
                    </div>

                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Email *</label>
                        <input 
                            pInputText 
                            type="email"
                            formControlName="email"
                            placeholder="nombre@calimax.com.mx"
                            class="w-full"
                            [class.ng-invalid]="usuarioForm.get('email')?.invalid && usuarioForm.get('email')?.touched"
                        />
                        <small 
                            class="p-error block" 
                            *ngIf="usuarioForm.get('email')?.invalid && usuarioForm.get('email')?.touched">
                            <span *ngIf="usuarioForm.get('email')?.errors?.['required']">El email es requerido</span>
                            <span *ngIf="usuarioForm.get('email')?.errors?.['calimaxEmail']">El email debe terminar en @calimax.com.mx</span>
                        </small>
                    </div>
                    
                    <!-- Campo Password -->
                    <div class="field">
                        <label for="password" class="block text-900 font-medium mb-2">
                            Contraseña {{ isEditingUsuario ? '(opcional - dejar vacío para mantener actual)' : '*' }}
                        </label>
                        <div class="password-input-container">
                            <input 
                                pInputText 
                                [type]="showPassword ? 'text' : 'password'"
                                formControlName="password"
                                [placeholder]="isEditingUsuario ? 'Nueva contraseña (opcional)' : 'Mínimo 6 caracteres'"
                                class="w-full password-input"
                                [class.ng-invalid]="usuarioForm.get('password')?.invalid && usuarioForm.get('password')?.touched"
                            />
                            <button 
                                type="button"
                                class="password-toggle-btn"
                                (click)="togglePasswordVisibility()"
                                [pTooltip]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                                tooltipPosition="top">
                                <i [class]="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                            </button>
                        </div>
                        <small 
                            class="p-error block" 
                            *ngIf="usuarioForm.get('password')?.invalid && usuarioForm.get('password')?.touched">
                            {{ isEditingUsuario ? 'Mínimo 6 caracteres si desea cambiar la contraseña' : 'La contraseña es requerida (mínimo 6 caracteres)' }}
                        </small>
                    </div>

                    <!-- Estado -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Estado *</label>
                        <div class="flex align-items-center">
                            <button 
                                type="button"
                                (click)="toggleEstadoUsuario()"
                                class="estado-toggle-btn"
                                [class.estado-activo]="usuarioForm.get('estado')?.value === 1"
                                [class.estado-inactivo]="usuarioForm.get('estado')?.value === 0">
                                <span class="estado-label">
                                    {{ usuarioForm.get('estado')?.value === 1 ? 'Activo' : 'Inactivo' }}
                                </span>
                                <i [class]="usuarioForm.get('estado')?.value === 1 ? 'pi pi-check' : 'pi pi-times'"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button 
                        type="button"
                        pButton 
                        label="Cancelar" 
                        class="p-button-text"
                        (click)="closeUsuarioForm()"
                    ></button>
                    <button 
                        type="submit"
                        pButton 
                        [label]="isEditingUsuario ? 'Actualizar' : 'Crear'" 
                        class="p-button-primary"
                        [disabled]="!usuarioForm.valid"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- ====== FORMULARIO MODAL DE PERMISOS ====== -->
        <p-dialog 
            [header]="rolUsuarioFormTitle"
            [(visible)]="showRolUsuarioModal"
            [modal]="true"
            [style]="{width: '450px'}"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
        >
            <form [formGroup]="rolUsuarioForm" (ngSubmit)="savePermiso()">
                <div class="grid gap-4">
                    <!-- Usuario -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Usuario *</label>
                        <p-select 
                            formControlName="id_usu"
                            [options]="getUsuariosOptions()"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar usuario"
                            class="w-full"
                        ></p-select>
                    </div>

                    <!-- Rol -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Rol *</label>
                        <p-select 
                            formControlName="id_rol"
                            [options]="getRolesOptions()"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar rol"
                            class="w-full"
                        ></p-select>
                    </div>

                    <!-- Estado -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Estado *</label>
                        <p-select 
                            formControlName="estado"
                            [options]="[
                                {label: 'Activo', value: 'A'},
                                {label: 'Inactivo', value: 'I'}
                            ]"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar estado"
                            class="w-full"
                        ></p-select>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button 
                        type="button"
                        pButton 
                        label="Cancelar" 
                        class="p-button-text"
                        (click)="closePermisoForm()"
                    ></button>
                    <button 
                        type="submit"
                        pButton 
                        [label]="isEditingRolUsuario ? 'Actualizar' : 'Asignar'" 
                        class="p-button-primary"
                        [disabled]="!rolUsuarioForm.valid"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- ====== FORMULARIO MODAL DE ROLES ====== -->
        <p-dialog 
            [header]="rolFormTitle"
            [(visible)]="showRolModal"
            [modal]="true"
            [style]="{width: '400px'}"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
        >
            <form [formGroup]="rolForm" (ngSubmit)="saveRol()">
                <div class="grid gap-4">
                    <!-- Nombre -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Nombre del Rol *</label>
                        <input 
                            pInputText 
                            formControlName="nombre"
                            placeholder="Nombre del rol"
                            class="w-full"
                        />
                    </div>

                    <!-- Estado -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Estado *</label>
                        <p-select 
                            formControlName="estado"
                            [options]="[
                                {label: 'Activo', value: 'A'},
                                {label: 'Inactivo', value: 'I'}
                            ]"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar estado"
                            class="w-full"
                        ></p-select>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button 
                        type="button"
                        pButton 
                        label="Cancelar" 
                        class="p-button-text"
                        (click)="closeRolForm()"
                    ></button>
                    <button 
                        type="submit"
                        pButton 
                        [label]="isEditingRol ? 'Actualizar' : 'Crear'" 
                        class="p-button-primary"
                        [disabled]="!rolForm.valid"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- ====== FORMULARIO MODAL DE ROL DETALLE ====== -->
        <p-dialog 
            [header]="rolDetalleFormTitle"
            [(visible)]="showRolDetalleModal"
            [modal]="true"
            [style]="{width: '400px'}"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
        >
            <form [formGroup]="rolDetalleForm" (ngSubmit)="saveRolDetalle()">
                <div class="grid gap-4">
                    <!-- REN -->
                    <div>
                        <label class="block text-sm font-medium mb-1">REN (Orden) *</label>
                        <input 
                            pInputText 
                            type="number"
                            formControlName="ren"
                            placeholder="Número de orden"
                            class="w-full"
                            min="1"
                        />
                    </div>

                    <!-- ID Menú -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Menú *</label>
                        <p-select 
                            formControlName="id_menu"
                            [options]="getMenusOptions()"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Seleccionar menú"
                            class="w-full"
                        ></p-select>
                    </div>

                    <!-- Rol (readonly) -->
                    <div>
                        <label class="block text-sm font-medium mb-1">Rol</label>
                        <input 
                            pInputText 
                            [value]="rolSeleccionado?.nombre || ''"
                            readonly
                            class="w-full"
                            style="background-color: #f8f9fa;"
                        />
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <button 
                        type="button"
                        pButton 
                        label="Cancelar" 
                        class="p-button-text"
                        (click)="closeRolDetalleForm()"
                    ></button>
                    <button 
                        type="submit"
                        pButton 
                        [label]="isEditingRolDetalle ? 'Actualizar' : 'Crear'" 
                        class="p-button-primary"
                        [disabled]="!rolDetalleForm.valid"
                    ></button>
                </div>
            </form>
        </p-dialog>

        <!-- Modal de Confirmación para Usuario -->
        <p-dialog 
            [(visible)]="showConfirmDeleteUsuario" 
            header="Confirmar Eliminación"
            [modal]="true" 
            [style]="{width: '400px'}"
            [draggable]="false" 
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Eliminar Usuario?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas eliminar al usuario 
                        <strong>"{{usuarioToDelete?.nombre}}"</strong>?
                    </p>
                    <p class="text-sm text-red-600 mt-2">
                        ⚠️ Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>
            
            <!-- Botones movidos fuera del footer (como en spconfig) -->
            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                    pButton 
                    type="button" 
                    (click)="cancelDeleteUsuario()" 
                    label="Cancelar" 
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    type="button" 
                    (click)="confirmDeleteUsuario()" 
                    label="Eliminar" 
                    class="p-button-danger"
                ></button>
            </div>
        </p-dialog>

        <!-- Modal de Confirmación para Permiso -->
        <p-dialog 
            [(visible)]="showConfirmDeletePermiso" 
            header="Confirmar Eliminación"
            [modal]="true" 
            [style]="{width: '400px'}"
            [draggable]="false" 
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Eliminar Permiso?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas eliminar el permiso de 
                        <strong>"{{permisoToDelete?.nombre_usuario}}"</strong> para el rol
                        <strong>"{{permisoToDelete?.nombre_rol}}"</strong>?
                    </p>
                    <p class="text-sm text-red-600 mt-2">
                        ⚠️ Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                    pButton 
                    type="button" 
                    (click)="cancelDeletePermiso()" 
                    label="Cancelar" 
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    type="button" 
                    (click)="confirmDeletePermiso()" 
                    label="Eliminar" 
                    class="p-button-danger"
                ></button>
            </div>
        </p-dialog>

        <!-- Modal de Confirmación para Rol -->
        <p-dialog 
            [(visible)]="showConfirmDeleteRol" 
            header="Confirmar Eliminación"
            [modal]="true" 
            [style]="{width: '400px'}"
            [draggable]="false" 
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Eliminar Rol?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas eliminar el rol 
                        <strong>"{{rolToDelete?.nombre}}"</strong>?
                    </p>
                    <p class="text-sm text-red-600 mt-2">
                        ⚠️ Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                    pButton 
                    type="button" 
                    (click)="cancelDeleteRol()" 
                    label="Cancelar" 
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    type="button" 
                    (click)="confirmDeleteRol()" 
                    label="Eliminar" 
                    class="p-button-danger"
                ></button>
            </div>
        </p-dialog>

        <!-- Modal de Confirmación para Rol Detalle -->
        <p-dialog 
            [(visible)]="showConfirmDeleteRolDetalle" 
            header="Confirmar Eliminación"
            [modal]="true" 
            [style]="{width: '400px'}"
            [draggable]="false" 
            [resizable]="false"
        >
            <div class="flex items-center gap-3 mb-4">
                <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-lg mb-1">¿Eliminar Detalle de Rol?</h4>
                    <p class="text-gray-600">
                        ¿Estás seguro de que deseas eliminar el detalle del menú 
                        <strong>"{{rolDetalleToDelete?.nombre_menu}}"</strong>?
                    </p>
                    <p class="text-sm text-red-600 mt-2">
                        ⚠️ Esta acción no se puede deshacer.
                    </p>
                </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                    pButton 
                    type="button" 
                    (click)="cancelDeleteRolDetalle()" 
                    label="Cancelar" 
                    class="p-button-text"
                ></button>
                <button 
                    pButton 
                    type="button" 
                    (click)="confirmDeleteRolDetalle()" 
                    label="Eliminar" 
                    class="p-button-danger"
                ></button>
            </div>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep {
            .p-tabview .p-tabview-nav {
                margin-bottom: 1rem;
            }
            
            .p-tabview .p-tabview-panels {
                padding: 1rem 0;
            }
            
            .p-datatable .p-datatable-header {
                background: transparent;
                border: none;
                padding: 0;
            }
            
            .p-datatable .p-datatable-thead > tr > th {
                background: #f8fafc;
                border-color: #e2e8f0;
                font-weight: 600;
                color: #374151;
            }
            
            .p-datatable .p-datatable-tbody > tr > td {
                border-color: #e2e8f0;
                padding: 0.75rem;
            }
            
            .p-datatable .p-datatable-tbody > tr:hover {
                background-color: #f1f5f9;
            }
            
            .p-tag {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
            }
            
            .p-button.p-button-sm {
                padding: 0.25rem 0.5rem;
                font-size: 0.875rem;
            }

            /* Estilos para edición inline (como menu-admin) */
            .editable-cell {
                border: 1px solid transparent;
                min-height: 32px;
                display: inline-block;
                min-width: 60px;
            }
            
            .editable-cell:hover {
                border-color: #3b82f6;
                background-color: #eff6ff !important;
            }
            
            .p-inputtext-sm {
                padding: 4px 8px;
                font-size: 0.875rem;
            }

            /* Indicador visual para campos editables */
            .editable-cell::after {
                content: "✏️";
                opacity: 0;
                margin-left: 4px;
                font-size: 0.7rem;
                transition: opacity 0.2s;
            }
            
            .editable-cell:hover::after {
                opacity: 0.6;
            }

            /* Mejorar apariencia de tags clickeables */
            .p-tag.cursor-pointer:hover {
                transform: scale(1.05);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            /* Botones inline pequeños */
            .inline-action-btn {
                width: 24px !important;
                height: 24px !important;
                min-width: 24px !important;
                padding: 0 !important;
            }

            .inline-action-btn .p-button-icon {
                font-size: 0.75rem;
            }

            /* Contenedor de edición inline */
            .inline-edit-container {
                display: flex;
                align-items: center;
                gap: 4px;
                max-width: 200px;
                min-width: 140px; /* Asegurar ancho mínimo */
                white-space: nowrap; /* Evitar que se rompan las líneas */
            }

            .inline-edit-container input {
                flex: 1;
                min-width: 80px;
                max-width: 140px;
                box-sizing: border-box; /* Incluir padding en el cálculo del ancho */
            }

            /* Ajustar específicamente para campos numéricos */
            .inline-edit-container input[type="number"] {
                max-width: 80px;
                min-width: 60px;
            }

            /* Estilos para filas seleccionables de roles */
            .p-datatable .p-datatable-tbody > tr.cursor-pointer {
                transition: all 0.2s ease;
            }

            .p-datatable .p-datatable-tbody > tr.cursor-pointer:hover {
                background-color: #dbeafe !important;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
            }

            .p-datatable .p-datatable-tbody > tr.selected-row {
                background-color: #3b82f6 !important;
                color: white !important;
                font-weight: 600;
            }

            .p-datatable .p-datatable-tbody > tr.selected-row:hover {
                background-color: #2563eb !important;
            }

            .p-datatable .p-datatable-tbody > tr.selected-row .p-tag {
                background-color: white !important;
                color: #3b82f6 !important;
            }

            /* Asegurar que los botones no se muevan */
            .inline-action-btn {
                width: 24px !important;
                height: 24px !important;
                min-width: 24px !important;
                max-width: 24px !important;
                padding: 0 !important;
                flex-shrink: 0; /* Evitar que se compriman */
            }

            /* Mejorar el ancho de las celdas editables para evitar saltos */
            .p-datatable .p-datatable-tbody > tr > td:nth-child(1) { /* Usuario */
                min-width: 120px;
            }
            .p-datatable .p-datatable-tbody > tr > td:nth-child(2) { /* Nombre */
                min-width: 180px;
            }
            .p-datatable .p-datatable-tbody > tr > td:nth-child(3) { /* Email */
                min-width: 220px;
            }

            /* Estilos para password input con botón interno */
            .password-input-container {
                position: relative;
                display: flex;
                align-items: center;
            }

            .password-input {
                padding-right: 40px !important; /* Espacio para el botón */
            }

            .password-toggle-btn {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                border: none;
                background: transparent;
                color: #6b7280;
                padding: 4px;
                cursor: pointer;
                z-index: 10;
                border-radius: 4px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .password-toggle-btn:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .password-toggle-btn:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }

            .password-toggle-btn i {
                font-size: 14px;
            }

            /* Estilos para toggle de estado */
            .estado-toggle-btn {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                border-radius: 6px;
                border: 1px solid #d1d5db;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 120px;
                font-size: 14px;
                font-weight: 500;
            }

            .estado-toggle-btn:hover {
                border-color: #3b82f6;
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .estado-toggle-btn.estado-activo {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .estado-toggle-btn.estado-inactivo {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .estado-label {
                margin-right: 8px;
            }
        }
    `]
})
export class UsuariosComponent implements OnInit {
    // Datos mock
    usuarios: UsuarioMock[] = [];
    roles: RolMock[] = [];
    rolDetalles: RolDetalleMock[] = [];
    rolUsuarios: RolUsuarioMock[] = [];
    
    // Menús disponibles para selección
    menusDisponibles: any[] = [];
    
    // Selección
    rolSeleccionado: RolMock | null = null;
    
    // Filtros
    rolDetallesFiltrados: RolDetalleMock[] = [];

    // Variables para formularios modales (siguiendo patrón de menu-admin)
    showUsuarioModal = false;

    // Validador personalizado para email @calimax.com.mx
    calimaxEmailValidator(control: any) {
        const email = control.value;
        if (!email) return null; // Si está vacío, que lo maneje required
        
        const validEmailPattern = /^[a-zA-Z0-9._%+-]+@calimax\.com\.mx$/;
        if (validEmailPattern.test(email)) {
            return null; // Válido
        } else {
            return { calimaxEmail: true }; // Inválido
        }
    }
    showRolModal = false;
    showRolDetalleModal = false;
    showRolUsuarioModal = false;
    showPassword = false; // Para toggle de visibilidad de contraseña
    
    // Estados de modales de confirmación
    showConfirmDeleteUsuario = false;
    showConfirmDeletePermiso = false;
    showConfirmDeleteRol = false;
    showConfirmDeleteRolDetalle = false;
    usuarioToDelete: UsuarioMock | null = null;
    permisoToDelete: RolUsuarioMock | null = null;
    rolToDelete: RolMock | null = null;
    rolDetalleToDelete: RolDetalleMock | null = null;
    
    usuarioFormTitle = '';
    rolFormTitle = '';
    rolDetalleFormTitle = '';
    rolUsuarioFormTitle = '';
    
    isEditingUsuario = false;
    isEditingRol = false;
    isEditingRolDetalle = false;
    isEditingRolUsuario = false;
    
    editingUsuarioId: number | null = null;
    editingRolId: number | null = null;
    editingRolDetalleId: number | null = null;
    editingRolUsuarioId: number | null = null;

    // Formularios reactivos
    usuarioForm!: FormGroup;
    rolForm!: FormGroup;
    rolDetalleForm!: FormGroup;
    rolUsuarioForm!: FormGroup;

    // Variables para edición inline personalizada (como menu-admin)
    editingCell: string | null = null; // Formato: "usuarioId_fieldName"
    originalValue: any = null;

    // Variables para API real
    loadingUsuarios = false;
    loadingRoles = false;
    loadingPermisos = false;
    apiUrl = 'http://localhost:3000/api/admusr/v1'; // API ID 1 - Usuarios
    rolesApiUrl = 'http://localhost:3000/api/adminUsr/rol'; // API ID 2 - Roles
    permisosApiUrl = 'http://localhost:3000/api/admrolu/v1'; // API ID 4 - Rol-Usuario (Permisos)
    rolDetalleApiUrl = 'http://localhost:3000/api/admrold/v1'; // API ID 3 - Rol Detalle

    constructor(private messageService: MessageService, private fb: FormBuilder, private http: HttpClient, private sessionService: SessionService) {
        console.log('🔧 UsuariosComponent: Constructor ejecutado');
        console.log('📧 MessageService disponible:', !!this.messageService);
        
        // Test de mensaje deshabilitado para evitar conflictos
        // setTimeout(() => {
        //     console.log('🧪 Test: Enviando mensaje de prueba...');
        //     this.messageService.add({
        //         severity: 'success',
        //         summary: 'Test Sistema',
        //         detail: 'Los eventos y toasts están funcionando correctamente'
        //     });
        // }, 2000);
    }

    ngOnInit(): void {
        console.log('🚀 UsuariosComponent: ngOnInit ejecutado');
        this.initializeForms();
        this.cargarUsuarios();
        // Cargar roles, permisos y rol detalle desde API
        this.cargarRoles();
        this.cargarPermisos();
        this.cargarRolDetalle();
    }

    // Inicializar formularios reactivos (siguiendo patrón de menu-admin)
    initializeForms(): void {
        this.usuarioForm = this.fb.group({
            usuario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]], // Solo números
            nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]], // Solo letras y espacios
            email: ['', [Validators.required, this.calimaxEmailValidator]], // Email @calimax.com.mx
            password: ['', [Validators.required, Validators.minLength(6)]],
            estado: [1, [Validators.required]]
        });
        
        console.log('📋 UsuarioForm inicializado:', this.usuarioForm);
        console.log('📋 UsuarioForm controls:', this.usuarioForm.controls);

        this.rolForm = this.fb.group({
            nombre: ['', [Validators.required]],
            estado: ['A', [Validators.required]]
        });

        this.rolDetalleForm = this.fb.group({
            id_rol: ['', [Validators.required]],
            id_menu: ['', [Validators.required]],
            ren: [1, [Validators.required]]
        });

        this.rolUsuarioForm = this.fb.group({
            id_usu: ['', [Validators.required]],
            id_rol: ['', [Validators.required]],
            estado: ['A', [Validators.required]]
        });
    }

    // Cargar usuarios desde API
    cargarUsuarios(): void {
        console.log('📊 Cargando usuarios desde API...');
        this.loadingUsuarios = true;
        
        // Usar POST con action: "SL" según convenciones del proyecto
        const payload = this.createApiPayload({
            action: 'SL'
        });
        
        this.http.post(this.apiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Usuarios cargados - RESPUESTA COMPLETA:', response);
                console.log('✅ Tipo de respuesta:', typeof response);
                console.log('✅ Es array?:', Array.isArray(response));
                console.log('✅ Propiedades de response:', Object.keys(response || {}));
                
                // Usar setTimeout para evitar bucle de detección de cambios
                setTimeout(() => {
                    let usuariosData: any[] = [];
                    
                    if (Array.isArray(response) && response.length > 0) {
                        // Caso específico: Array que contiene objeto con estructura {statuscode, mensaje, data}
                        const firstItem = response[0];
                        console.log('📋 Primer elemento del array:', firstItem);
                        
                        if (firstItem && firstItem.statuscode === 200 && Array.isArray(firstItem.data)) {
                            console.log('📋 Encontrada estructura [{statuscode: 200, data: [...]}]');
                            usuariosData = firstItem.data;
                        } else if (firstItem && Array.isArray(firstItem.data)) {
                            console.log('📋 Encontrada estructura con data array (sin verificar statuscode)');
                            usuariosData = firstItem.data;
                        } else {
                            // Asumir que el array contiene usuarios directamente
                            console.log('📋 Asumiendo array directo de usuarios');
                            usuariosData = response;
                        }
                    } else if (response && Array.isArray(response.data)) {
                        // Caso 2: Respuesta con estructura {statuscode, mensaje, data: [...]}
                        console.log('📋 Respuesta tiene estructura estándar con data array');
                        usuariosData = response.data;
                    } else if (response && response.statuscode === 200 && response.data) {
                        // Caso 3: Respuesta con estructura estándar y data no array
                        console.log('📋 Respuesta tiene estructura estándar con data objeto');
                        usuariosData = Array.isArray(response.data) ? response.data : [response.data];
                    } else if (response && !response.statuscode) {
                        // Caso 4: Respuesta directa como objeto único (convertir a array)
                        console.log('📋 Respuesta es objeto único, convirtiendo a array');
                        usuariosData = [response];
                    } else {
                        console.error('❌ Formato de respuesta no reconocido:', response);
                        usuariosData = [];
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.mensaje || 'Error al cargar usuarios'
                        });
                        // Cargar datos mock como fallback
                        this.cargarDatosMockUsuarios();
                        return;
                    }
                    
                    // Asignar datos cargados a la propiedad del componente
                    this.usuarios = usuariosData;
                    console.log('✅ Usuarios finalmente asignados:', this.usuarios.length, 'registros');
                    console.log('✅ Primer usuario de ejemplo:', this.usuarios[0]);
                    
                    this.loadingUsuarios = false;
                    
                    if (this.usuarios.length > 0) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usuarios Cargados',
                            detail: `Se cargaron ${this.usuarios.length} usuarios correctamente`
                        });
                    }
                }, 0);
            },
            error: (error) => {
                console.error('❌ Error al cargar usuarios:', error);
                
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
                    this.cargarDatosMockUsuarios();
                }, 2000);
            },
            complete: () => {
                this.loadingUsuarios = false;
            }
        });
    }

    // Cargar roles desde API
    cargarRoles(): void {
        console.log('📊 Cargando roles desde API...');
        this.loadingRoles = true;
        
        const payload = this.createApiPayload({
            action: 'SL'
        });
        
        this.http.post(this.rolesApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Roles cargados - RESPUESTA COMPLETA:', response);
                console.log('✅ Tipo de respuesta:', typeof response);
                console.log('✅ Es array?:', Array.isArray(response));
                
                setTimeout(() => {
                    let rolesData: any[] = [];
                    
                    if (Array.isArray(response) && response.length > 0) {
                        const firstItem = response[0];
                        if (firstItem && firstItem.statuscode === 200 && Array.isArray(firstItem.data)) {
                            rolesData = firstItem.data;
                        } else if (firstItem && Array.isArray(firstItem.data)) {
                            rolesData = firstItem.data;
                        } else {
                            rolesData = response;
                        }
                    } else if (response && Array.isArray(response.data)) {
                        rolesData = response.data;
                    } else if (response && response.statuscode === 200 && response.data) {
                        rolesData = Array.isArray(response.data) ? response.data : [response.data];
                    } else if (response && !response.statuscode) {
                        rolesData = [response];
                    } else {
                        console.error('❌ Formato de respuesta no reconocido para roles:', response);
                        rolesData = [];
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.mensaje || 'Error al cargar roles'
                        });
                        this.cargarDatosMockRoles();
                        return;
                    }
                    
                    this.roles = rolesData;
                    console.log('✅ Roles finalmente asignados:', this.roles.length, 'registros');
                    console.log('✅ Primer rol de ejemplo:', this.roles[0]);
                    
                    this.loadingRoles = false;
                    
                    if (this.roles.length > 0) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Roles Cargados',
                            detail: `Se cargaron ${this.roles.length} roles correctamente`
                        });
                    }
                }, 0);
            },
            error: (error) => {
                console.error('❌ Error al cargar roles:', error);
                
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
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error ${errorStatus}`,
                        detail: `No se pudieron cargar los roles. Código: ${errorCode} | Mensaje: ${errorMessage}`,
                        life: 5000
                    });
                    // Cargar datos mock como fallback
                    this.cargarDatosMockRoles();
                }, 2000);
            },
            complete: () => {
                this.loadingRoles = false;
            }
        });
    }

    // Cargar permisos (rol-usuario) desde API
    cargarPermisos(): void {
        console.log('📊 Cargando permisos desde API...');
        this.loadingPermisos = true;
        
        const payload = this.createApiPayload({
            action: 'SL'
        });
        
        this.http.post(this.permisosApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Permisos cargados - RESPUESTA COMPLETA:', response);
                console.log('✅ Tipo de respuesta:', typeof response);
                console.log('✅ Es array?:', Array.isArray(response));
                
                setTimeout(() => {
                    let permisosData: any[] = [];
                    
                    if (Array.isArray(response) && response.length > 0) {
                        const firstItem = response[0];
                        if (firstItem && firstItem.statuscode === 200 && Array.isArray(firstItem.data)) {
                            permisosData = firstItem.data;
                        } else if (firstItem && Array.isArray(firstItem.data)) {
                            permisosData = firstItem.data;
                        } else {
                            permisosData = response;
                        }
                    } else if (response && Array.isArray(response.data)) {
                        permisosData = response.data;
                    } else if (response && response.statuscode === 200 && response.data) {
                        permisosData = Array.isArray(response.data) ? response.data : [response.data];
                    } else if (response && !response.statuscode) {
                        permisosData = [response];
                    } else {
                        console.error('❌ Formato de respuesta no reconocido para permisos:', response);
                        permisosData = [];
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: response.mensaje || 'Error al cargar permisos'
                        });
                        this.cargarDatosMockPermisos();
                        return;
                    }
                    
                    this.rolUsuarios = permisosData;
                    console.log('✅ Permisos finalmente asignados:', this.rolUsuarios.length, 'registros');
                    console.log('✅ Primer permiso de ejemplo:', this.rolUsuarios[0]);
                    
                    this.loadingPermisos = false;
                    
                    if (this.rolUsuarios.length > 0) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Permisos Cargados',
                            detail: `Se cargaron ${this.rolUsuarios.length} permisos correctamente`
                        });
                    }
                }, 0);
            },
            error: (error) => {
                console.error('❌ Error al cargar permisos:', error);
                
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
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error ${errorStatus}`,
                        detail: `No se pudieron cargar los permisos. Código: ${errorCode} | Mensaje: ${errorMessage}`,
                        life: 5000
                    });
                    // Cargar datos mock como fallback
                    this.cargarDatosMockPermisos();
                }, 2000);
            },
            complete: () => {
                this.loadingPermisos = false;
            }
        });
    }

    // Cargar rol detalle desde API
    cargarRolDetalle(): void {
        console.log('📊 Cargando rol detalle desde API...');
        
        const payload = this.createApiPayload({
            action: 'SL'
        });
        
        this.http.post(this.rolDetalleApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Rol detalle cargado - RESPUESTA COMPLETA:', response);
                console.log('✅ Tipo de respuesta:', typeof response);
                console.log('✅ Es array?:', Array.isArray(response));
                console.log('✅ Propiedades de response:', Object.keys(response || {}));
                
                setTimeout(() => {
                    let rolDetalleData: any[] = [];
                    
                    // Manejar diferentes formatos de respuesta
                    if (Array.isArray(response) && response.length > 0) {
                        const firstItem = response[0];
                        console.log('📋 Primer elemento del array:', firstItem);
                        
                        if (firstItem && firstItem.statuscode === 200 && Array.isArray(firstItem.data)) {
                            console.log('📋 Encontrada estructura [{statuscode: 200, data: [...]}]');
                            rolDetalleData = firstItem.data;
                        } else if (firstItem && Array.isArray(firstItem.data)) {
                            console.log('📋 Encontrada estructura con data array (sin verificar statuscode)');
                            rolDetalleData = firstItem.data;
                        } else {
                            console.log('📋 Asumiendo array directo de rol detalle');
                            rolDetalleData = response;
                        }
                    } else if (response && Array.isArray(response.data)) {
                        console.log('📋 Respuesta tiene estructura estándar con data array');
                        rolDetalleData = response.data;
                    } else if (response && response.statuscode === 200 && response.data) {
                        console.log('📋 Respuesta tiene estructura estándar con data objeto');
                        rolDetalleData = Array.isArray(response.data) ? response.data : [response.data];
                    } else if (response && !response.statuscode) {
                        console.log('📋 Respuesta es objeto único, convirtiendo a array');
                        rolDetalleData = [response];
                    } else {
                        console.error('❌ Formato de respuesta no reconocido:', response);
                        rolDetalleData = [];
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: 'Error', 
                            detail: response.mensaje || 'Error al cargar rol detalle' 
                        });
                        return;
                    }
                    
                    this.rolDetalles = rolDetalleData;
                    console.log('✅ Rol detalle finalmente asignado:', this.rolDetalles.length, 'registros');
                    console.log('✅ Primer detalle de ejemplo:', this.rolDetalles[0]);
                    
                    // Actualizar lista filtrada
                    this.updateRolDetallesFiltrados();
                    
                    if (this.rolDetalles.length > 0) {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: 'Rol Detalle Cargado', 
                            detail: `Se cargaron ${this.rolDetalles.length} detalles de rol correctamente` 
                        });
                    }
                }, 0);
            },
            error: (error) => {
                console.error('❌ Error al cargar rol detalle:', error);
                
                let errorStatus = error.status ? error.status.toString() : 'Desconocido';
                let errorCode = errorStatus;
                let errorMessage = 'Error desconocido';
                
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
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error ${errorStatus}`,
                        detail: `No se pudo cargar rol detalle. Código: ${errorCode} | Mensaje: ${errorMessage}`,
                        life: 5000
                    });
                    // Mantener datos mock como fallback
                    console.log('⚠️ Manteniendo datos mock de rol detalle como fallback');
                }, 2000);
            }
        });
    }

    cargarDatosMockUsuarios(): void {
        console.log('📊 Cargando usuarios mock como fallback...');
        this.usuarios = [
            {
                id: 1,
                usuario: 1001,
                email: 'admin@empresa.com',
                nombre: 'Administrador',
                estado: 1,
                logins: 15,
                intentos: 0,
                fecha_login: '2025-01-15T10:30:00.000Z',
                fecha_intento: null,
                fecha_m: '2025-01-15T10:30:00.000Z',
                fecha_a: '2025-01-01T00:00:00.000Z',
                fecha: '2025-01-15T10:30:00.000Z',
                id_session: 12345,
                logout: 0
            },
            {
                id: 2,
                usuario: 1002,
                email: 'usuario@empresa.com',
                nombre: 'Usuario Prueba',
                estado: 1,
                logins: 8,
                intentos: 1,
                fecha_login: '2025-01-14T14:20:00.000Z',
                fecha_intento: '2025-01-14T14:15:00.000Z',
                fecha_m: '2025-01-14T14:20:00.000Z',
                fecha_a: '2025-01-01T00:00:00.000Z',
                fecha: '2025-01-14T14:20:00.000Z',
                id_session: 12346,
                logout: 0
            }
        ];
    }

    cargarDatosMockRoles(): void {
        console.log('📊 Cargando datos mock para roles...');
        // Mantener solo los datos de roles, rolUsuarios y rolDetalles como mock por ahora
        this.rolUsuarios = [
            { 
                id: 1, 
                id_usu: 1, 
                id_rol: 1, 
                estado: 'A', 
                fecha_m: '2025-01-15T10:30:00.000Z', 
                usu_m: 'admin', 
                nombre_usuario: 'Administrador', 
                email_usuario: 'admin@empresa.com', 
                nombre_rol: 'Administrador' 
            },
            { 
                id: 2, 
                id_usu: 2, 
                id_rol: 2, 
                estado: 'A', 
                fecha_m: '2025-01-14T14:20:00.000Z', 
                usu_m: 'usuario', 
                nombre_usuario: 'Usuario Prueba', 
                email_usuario: 'usuario@empresa.com', 
                nombre_rol: 'Usuario' 
            }
        ];

        this.roles = [
            { id_rol: 1, nombre: 'Administrador', estado: 'A', fecha_m: '2025-01-01T00:00:00.000Z' },
            { id_rol: 2, nombre: 'Usuario', estado: 'A', fecha_m: '2025-01-01T00:00:00.000Z' }
        ];

        this.rolDetalles = [
            { id_rold: 1, id_rol: 1, ren: 1, id_menu: 1, fecha_m: '2025-01-01T00:00:00.000Z', nombre_rol: 'Administrador', nombre_menu: 'Dashboard' },
            { id_rold: 2, id_rol: 1, ren: 2, id_menu: 2, fecha_m: '2025-01-01T00:00:00.000Z', nombre_rol: 'Administrador', nombre_menu: 'Usuarios' }
        ];
    }

    cargarDatosMockPermisos(): void {
        console.log('📊 Cargando datos mock para permisos como fallback...');
        this.rolUsuarios = [
            { 
                id: 1, 
                id_usu: 1, 
                id_rol: 1, 
                estado: 'A', 
                fecha_m: '2025-01-15T10:30:00.000Z', 
                usu_m: 'admin', 
                nombre_usuario: 'Administrador', 
                email_usuario: 'admin@empresa.com', 
                nombre_rol: 'Administrador' 
            },
            { 
                id: 2, 
                id_usu: 2, 
                id_rol: 2, 
                estado: 'A', 
                fecha_m: '2025-01-14T14:20:00.000Z', 
                usu_m: 'usuario', 
                nombre_usuario: 'Usuario Prueba', 
                email_usuario: 'usuario@empresa.com', 
                nombre_rol: 'Usuario' 
            }
        ];
    }

    cargarDatosMock(): void {
        // Usuarios mock
        this.usuarios = [
            {
                id: 1,
                usuario: 1001,
                email: 'admin@empresa.com',
                nombre: 'Administrador',
                estado: 1,
                logins: 15,
                intentos: 0,
                fecha_login: '2025-01-15T10:30:00',
                fecha_intento: null,
                fecha_m: '2025-01-15T10:30:00',
                fecha_a: '2025-01-01T00:00:00',
                fecha: '2025-01-01',
                id_session: 1,
                logout: 0
            },
            {
                id: 2,
                usuario: 1002,
                email: 'usuario@empresa.com',
                nombre: 'Usuario Normal',
                estado: 1,
                logins: 8,
                intentos: 0,
                fecha_login: '2025-01-14T15:45:00',
                fecha_intento: null,
                fecha_m: '2025-01-14T15:45:00',
                fecha_a: '2025-01-01T00:00:00',
                fecha: '2025-01-01',
                id_session: 2,
                logout: 0
            },
            {
                id: 3,
                usuario: 1003,
                email: 'invitado@empresa.com',
                nombre: 'Usuario Invitado',
                estado: 0,
                logins: 2,
                intentos: 3,
                fecha_login: '2025-01-10T09:15:00',
                fecha_intento: '2025-01-15T11:20:00',
                fecha_m: '2025-01-15T11:20:00',
                fecha_a: '2025-01-01T00:00:00',
                fecha: '2025-01-01',
                id_session: 0,
                logout: 1
            }
        ];

        // Roles mock
        this.roles = [
            {
                id_rol: 1,
                nombre: 'Super Administrador',
                estado: 'A',
                fecha_m: '2025-01-15T10:00:00'
            },
            {
                id_rol: 2,
                nombre: 'Administrador',
                estado: 'A',
                fecha_m: '2025-01-15T10:00:00'
            },
            {
                id_rol: 3,
                nombre: 'Usuario',
                estado: 'A',
                fecha_m: '2025-01-15T10:00:00'
            },
            {
                id_rol: 4,
                nombre: 'Invitado',
                estado: 'I',
                fecha_m: '2025-01-15T10:00:00'
            }
        ];

        // Rol Detalles mock
        this.rolDetalles = [
            {
                id_rold: 1,
                id_rol: 1,
                ren: 1,
                id_menu: 1,
                fecha_m: '2025-01-15T10:00:00',
                nombre_rol: 'Super Administrador',
                nombre_menu: 'Dashboard'
            },
            {
                id_rold: 2,
                id_rol: 1,
                ren: 2,
                id_menu: 2,
                fecha_m: '2025-01-15T10:00:00',
                nombre_rol: 'Super Administrador',
                nombre_menu: 'Usuarios'
            },
            {
                id_rold: 3,
                id_rol: 1,
                ren: 3,
                id_menu: 3,
                fecha_m: '2025-01-15T10:00:00',
                nombre_rol: 'Super Administrador',
                nombre_menu: 'Roles'
            },
            {
                id_rold: 4,
                id_rol: 2,
                ren: 1,
                id_menu: 1,
                fecha_m: '2025-01-15T10:00:00',
                nombre_rol: 'Administrador',
                nombre_menu: 'Dashboard'
            },
            {
                id_rold: 5,
                id_rol: 2,
                ren: 2,
                id_menu: 2,
                fecha_m: '2025-01-15T10:00:00',
                nombre_rol: 'Administrador',
                nombre_menu: 'Usuarios'
            }
        ];

        // Rol Usuarios mock
        this.rolUsuarios = [
            {
                id: 1,
                id_usu: 1,
                id_rol: 1,
                estado: 'A',
                fecha_m: '2025-01-15T10:00:00',
                usu_m: 'ADMIN',
                nombre_usuario: 'Administrador',
                email_usuario: 'admin@empresa.com',
                nombre_rol: 'Super Administrador'
            },
            {
                id: 2,
                id_usu: 2,
                id_rol: 3,
                estado: 'A',
                fecha_m: '2025-01-15T10:00:00',
                usu_m: 'ADMIN',
                nombre_usuario: 'Usuario Normal',
                email_usuario: 'usuario@empresa.com',
                nombre_rol: 'Usuario'
            },
            {
                id: 3,
                id_usu: 3,
                id_rol: 4,
                estado: 'I',
                fecha_m: '2025-01-15T10:00:00',
                usu_m: 'ADMIN',
                nombre_usuario: 'Usuario Invitado',
                email_usuario: 'invitado@empresa.com',
                nombre_rol: 'Invitado'
            }
        ];

        // Cargar menús disponibles
        this.menusDisponibles = [
            { id: 1, nombre: 'Dashboard', descripcion: 'Panel principal' },
            { id: 2, nombre: 'Usuarios', descripcion: 'Gestión de usuarios' },
            { id: 3, nombre: 'Roles', descripcion: 'Gestión de roles' },
            { id: 4, nombre: 'Permisos', descripcion: 'Gestión de permisos' },
            { id: 5, nombre: 'Menús', descripcion: 'Gestión de menús' },
            { id: 6, nombre: 'Reportes', descripcion: 'Generación de reportes' },
            { id: 7, nombre: 'Configuración', descripcion: 'Configuración del sistema' },
            { id: 8, nombre: 'Auditoría', descripcion: 'Logs de auditoría' }
        ];

        console.log('✅ Datos mock cargados:', {
            usuarios: this.usuarios.length,
            roles: this.roles.length,
            rolDetalles: this.rolDetalles.length,
            rolUsuarios: this.rolUsuarios.length,
            menus: this.menusDisponibles.length
        });

        // Inicializar rolDetallesFiltrados como array vacío
        this.rolDetallesFiltrados = [];
        console.log('📋 rolDetallesFiltrados inicializado:', this.rolDetallesFiltrados.length);

        // Preseleccionar primer rol si hay roles disponibles
        if (this.roles.length > 0) {
            console.log('🎯 Preseleccionando primer rol en ngOnInit...');
            this.rolSeleccionado = this.roles[0];
            this.filtrarRolDetalles();
            console.log('✅ Rol preseleccionado en ngOnInit:', this.rolSeleccionado.nombre);
        }
    }

    // Filtro global
    onGlobalFilter(table: Table, event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        console.log('🔍 Filtro global aplicado:', value);
        table.filterGlobal(value, 'contains');
    }

    // Selección de rol (método simplificado para click directo)
    selectRol(rol: RolMock): void {
        console.log('🎯 selectRol() ejecutado para:', rol);
        
        // Si ya está seleccionado, deseleccionar
        if (this.rolSeleccionado?.id_rol === rol.id_rol) {
            console.log('🔄 Deseleccionando rol:', rol.nombre);
            this.rolSeleccionado = null;
            this.rolDetallesFiltrados = [];
        } else {
            // Seleccionar nuevo rol
            console.log('👑 Seleccionando nuevo rol:', rol.nombre);
            this.rolSeleccionado = rol;
            
            // Filtrar detalles inmediatamente
            this.filtrarRolDetalles();
        }
        
        // Forzar detección de cambios
        setTimeout(() => {
            console.log('⏰ Timeout ejecutado - rolSeleccionado:', this.rolSeleccionado?.nombre);
            console.log('📋 rolDetallesFiltrados:', this.rolDetallesFiltrados.length);
        }, 100);
    }

    // Selección de rol (método original para compatibilidad)
    onRolSelect(event: any): void {
        console.log('🎯 onRolSelect llamado con:', event);
        
        if (event && event.data) {
            this.rolSeleccionado = event.data;
            console.log('👑 Rol seleccionado:', this.rolSeleccionado);
            
            // Filtrar detalles inmediatamente
            this.filtrarRolDetalles();
            
            // Forzar detección de cambios
            setTimeout(() => {
                console.log('⏰ Timeout ejecutado - rolDetallesFiltrados:', this.rolDetallesFiltrados.length);
            }, 100);
        } else {
            console.warn('⚠️ Evento de selección inválido:', event);
        }
    }

    // Filtrar detalles del rol seleccionado
    filtrarRolDetalles(): void {
        console.log('🔍 filtrarRolDetalles() ejecutado');
        console.log('👑 rolSeleccionado:', this.rolSeleccionado);
        console.log('📋 rolDetalles total:', this.rolDetalles.length);
        
        if (this.rolSeleccionado) {
            const detallesFiltrados = this.rolDetalles.filter(
                detalle => detalle.id_rol === this.rolSeleccionado!.id_rol
            );
            
            this.rolDetallesFiltrados = detallesFiltrados;
            
            console.log('✅ Detalles filtrados para rol', this.rolSeleccionado.nombre, ':', this.rolDetallesFiltrados.length);
            console.log('📋 Detalles encontrados:', detallesFiltrados.map(d => ({ id: d.id_rold, menu: d.nombre_menu })));
        } else {
            this.rolDetallesFiltrados = [];
            console.log('❌ No hay rol seleccionado, array vacío');
        }
    }

    // Obtener etiqueta de estado
    getEstadoLabel(estado: number | string): string {
        if (typeof estado === 'number') {
            // Para usuarios
            switch (estado) {
                case 1: return 'Activo';
                case 0: return 'Inactivo';
                default: return 'Desconocido';
            }
        } else {
            // Para roles y permisos
            switch (estado) {
                case 'A': return 'Activo';
                case 'I': return 'Inactivo';
                case 'S': return 'Suspendido';
                case 'B': return 'Bloqueado';
                default: return 'Desconocido';
            }
        }
    }

    // Obtener severidad del estado para el tag
    getEstadoSeverity(estado: number | string): string {
        if (typeof estado === 'number') {
            // Para usuarios
            switch (estado) {
                case 1: return 'success';
                case 0: return 'danger';
                default: return 'secondary';
            }
        } else {
            // Para roles y permisos
            switch (estado) {
                case 'A': return 'success';
                case 'I': return 'danger';
                case 'S': return 'warning';
                case 'B': return 'danger';
                default: return 'secondary';
            }
        }
    }

    // ========== MÉTODOS PARA USUARIOS ==========
    
    // Abrir formulario de usuario (siguiendo patrón de menu-admin)
    openUsuarioForm(usuario?: UsuarioMock): void {
        console.log('🔧 openUsuarioForm() ejecutado para:', usuario?.nombre || 'nuevo usuario');
        this.isEditingUsuario = !!usuario;
        this.editingUsuarioId = usuario?.id || null;
        this.usuarioFormTitle = this.isEditingUsuario ? 'Editar Usuario' : 'Nuevo Usuario';
        
        if (usuario) {
            // En modo edición, password es opcional
            this.usuarioForm.get('password')?.clearValidators();
            this.usuarioForm.get('password')?.setValidators([Validators.minLength(6)]);
            this.usuarioForm.get('password')?.updateValueAndValidity();
            
            this.usuarioForm.patchValue({
                usuario: usuario.usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                password: '', // Vacío en edición
                estado: usuario.estado
            });
        } else {
            // En modo creación, password es obligatorio
            this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
            this.usuarioForm.get('password')?.updateValueAndValidity();
            
            this.usuarioForm.reset({
                usuario: '',
                nombre: '',
                email: '',
                password: '',
                estado: 1
            });
        }
        
        this.showUsuarioModal = true;
    }

    verUsuario(usuario: UsuarioMock): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Ver Usuario',
            detail: `Viendo usuario: ${usuario.nombre}`
        });
    }

    editarUsuario(usuario: UsuarioMock): void {
        console.log('✏️ editarUsuario() ejecutado para:', usuario.nombre);
        this.openUsuarioForm(usuario);  // Usar el formulario modal
    }

    // Cerrar formulario de usuario
    closeUsuarioForm(): void {
        this.showUsuarioModal = false;
        this.isEditingUsuario = false;
        this.editingUsuarioId = null;
        this.showPassword = false; // Reset visibility
        this.usuarioForm.reset();
    }

    // Toggle para mostrar/ocultar contraseña
    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    // Toggle para estado del usuario en el formulario
    toggleEstadoUsuario(): void {
        const currentValue = this.usuarioForm.get('estado')?.value;
        const newValue = currentValue === 1 ? 0 : 1;
        this.usuarioForm.get('estado')?.setValue(newValue);
    }

    // Helper para crear payload con datos de sesión
    private createApiPayload(data: any): any {
        const sessionBase = this.sessionService.getApiPayloadBase();
        return { ...data, ...sessionBase };
    }

    // Guardar usuario (siguiendo patrón de menu-admin)
    saveUsuario(): void {
        console.log('🚀 INICIO saveUsuario()');
        console.log('📝 Estado del formulario:', this.usuarioForm);
        console.log('📝 FormGroup status:', this.usuarioForm.status);
        console.log('📝 FormGroup errors:', this.usuarioForm.errors);
        console.log('📝 FormGroup controls:', this.usuarioForm.controls);
        
        if (this.usuarioForm.valid) {
            const formData = this.usuarioForm.value;
            console.log('💾 Guardando usuario - formData recibido:', formData);
            console.log('💾 Formulario válido:', this.usuarioForm.valid);
            console.log('💾 Es edición?:', this.isEditingUsuario);
            console.log('💾 ID editando:', this.editingUsuarioId);
            
            if (this.isEditingUsuario && this.editingUsuarioId) {
                // Actualizar usuario existente via API
                console.log('🔄 Ruta: ACTUALIZAR usuario existente');
                this.updateUsuarioAPI(this.editingUsuarioId, formData);
            } else {
                // Crear nuevo usuario via API
                console.log('➕ Ruta: CREAR nuevo usuario');
                this.createUsuarioAPI(formData);
            }
        } else {
            // Los errores de validación no necesitan setTimeout ya que no cambian estado del modal
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: 'Por favor complete todos los campos requeridos'
            });
        }
    }

    // Crear usuario via API
    createUsuarioAPI(formData: any): void {
        console.log('📤 Enviando nuevo usuario a API - formData:', formData);
        
        // Preparar payload para creación (password siempre requerido)
        const payload = this.createApiPayload({
            usuario: formData.usuario,
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password.trim(), // Requerido en creación
            estado: formData.estado,
            action: 'IN' // Según convenciones del proyecto
        });
        
        console.log('📤 Payload completo enviado:', payload);
        console.log('📤 URL destino:', this.apiUrl);
        
        this.http.post(this.apiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Usuario creado en API - RESPUESTA COMPLETA:', response);
                console.log('✅ Tipo de respuesta:', typeof response);
                console.log('✅ Es array?:', Array.isArray(response));
                console.log('✅ Propiedades de response:', Object.keys(response || {}));
                
                // Manejar respuesta según formato del servidor
                let successMessage = `Usuario ${formData.nombre} creado correctamente`;
                let isSuccess = false;
                
                if (Array.isArray(response)) {
                    console.log('📋 Respuesta es array, tomando primer elemento:', response[0]);
                    const firstItem = response[0];
                    if (firstItem && (firstItem.statuscode === 200 || firstItem.statuscode === '200')) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && (response.statuscode === 200 || response.statuscode === '200')) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    // Asumir éxito si hay respuesta y no hay error explícito
                    isSuccess = true;
                }
                
                console.log('✅ Es exitoso?:', isSuccess);
                console.log('✅ Mensaje final:', successMessage);
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usuario Creado',
                            detail: successMessage
                        });
                        this.closeUsuarioForm();
                        // Recargar lista de usuarios desde API
                        this.cargarUsuarios();
                    }, 0);
                } else {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Respuesta Inesperada',
                            detail: 'El usuario pudo haberse creado, pero la respuesta no fue la esperada'
                        });
                        this.closeUsuarioForm();
                        this.cargarUsuarios();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al crear usuario:', error);
                
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
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error ${errorStatus}`,
                        detail: `No se pudo crear el usuario. Código: ${errorCode} | Mensaje: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // Actualizar usuario via API
    updateUsuarioAPI(userId: number, formData: any): void {
        console.log('📤 Actualizando usuario en API:', userId, formData);
        
        // Preparar payload base
        const payload: any = this.createApiPayload({
            id: userId,
            usuario: formData.usuario,
            nombre: formData.nombre,
            email: formData.email,
            estado: formData.estado,
            action: 'UP' // Según convenciones del proyecto
        });
        
        // OMITIR el campo password del JSON si está vacío
        if (formData.password && formData.password.trim() !== '') {
            payload.password = formData.password.trim();
            console.log('🔐 Password incluido en el payload para actualización');
        } else {
            console.log('🔐 Password OMITIDO del payload (campo vacío)');
            // NO se agrega el campo password al payload
        }
        
        this.http.post(this.apiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Usuario actualizado en API - RESPUESTA COMPLETA:', response);
                console.log('✅ Tipo de respuesta:', typeof response);
                console.log('✅ Es array?:', Array.isArray(response));
                
                // Manejar respuesta según formato del servidor
                let successMessage = `Usuario ${formData.nombre} actualizado correctamente`;
                let isSuccess = false;
                
                if (Array.isArray(response)) {
                    const firstItem = response[0];
                    if (firstItem && (firstItem.statuscode === 200 || firstItem.statuscode === '200')) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && (response.statuscode === 200 || response.statuscode === '200')) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usuario Actualizado',
                            detail: successMessage
                        });
                        this.closeUsuarioForm();
                        // Recargar lista de usuarios desde API
                        this.cargarUsuarios();
                    }, 0);
                } else {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Respuesta Inesperada',
                            detail: 'El usuario pudo haberse actualizado, pero la respuesta no fue la esperada'
                        });
                        this.closeUsuarioForm();
                        this.cargarUsuarios();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al actualizar usuario:', error);
                
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
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error ${errorStatus}`,
                        detail: `No se pudo actualizar el usuario. Código: ${errorCode} | Mensaje: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // Eliminar usuario (mostrar confirmación)
    eliminarUsuario(usuario: UsuarioMock): void {
        console.log('🗑️ Solicitando eliminación de usuario:', usuario.nombre);
        this.usuarioToDelete = usuario;
        this.showConfirmDeleteUsuario = true;
    }

    // Confirmar eliminación de usuario
    confirmDeleteUsuario(): void {
        if (this.usuarioToDelete) {
            console.log('✅ Confirmando eliminación de usuario:', this.usuarioToDelete.nombre);
            this.deleteUsuarioAPI(this.usuarioToDelete.id);
        }
        
        this.cancelDeleteUsuario();
    }

    // Eliminar usuario via API
    deleteUsuarioAPI(userId: number): void {
        console.log('📤 Eliminando usuario en API:', userId);
        
        const payload = {
            id: userId,
            action: 'DL' // Según convenciones del proyecto
        };
        
        this.http.post(this.apiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Usuario eliminado en API - RESPUESTA COMPLETA:', response);
                console.log('✅ Tipo de respuesta:', typeof response);
                console.log('✅ Es array?:', Array.isArray(response));
                
                // Manejar respuesta según formato del servidor
                let successMessage = 'Usuario eliminado correctamente';
                let isSuccess = false;
                
                if (Array.isArray(response)) {
                    const firstItem = response[0];
                    if (firstItem && (firstItem.statuscode === 200 || firstItem.statuscode === '200')) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && (response.statuscode === 200 || response.statuscode === '200')) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usuario Eliminado',
                            detail: successMessage
                        });
                        // Recargar lista de usuarios desde API
                        this.cargarUsuarios();
                    }, 0);
                } else {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Respuesta Inesperada',
                            detail: 'El usuario pudo haberse eliminado, pero la respuesta no fue la esperada'
                        });
                        this.cargarUsuarios();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al eliminar usuario:', error);
                
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
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error ${errorStatus}`,
                        detail: `No se pudo eliminar el usuario. Código: ${errorCode} | Mensaje: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // Cancelar eliminación de usuario
    cancelDeleteUsuario(): void {
        this.showConfirmDeleteUsuario = false;
        this.usuarioToDelete = null;
        console.log('❌ Eliminación de usuario cancelada');
    }

    // ========== MÉTODOS PARA EDICIÓN INLINE (como menu-admin) ==========
    
    // Iniciar edición inline de una celda específica
    editInline(usuario: UsuarioMock, field: string): void {
        console.log('🔧 Iniciando edición inline:', field, 'para usuario:', usuario.nombre);
        this.editingCell = usuario.id + '_' + field;
        this.originalValue = (usuario as any)[field];
    }

    // Guardar edición inline
    saveInlineEdit(usuario: UsuarioMock, field: string): void {
        console.log('💾 Guardando edición inline:', field);
        
        const currentValue = (usuario as any)[field];
        
        // Validaciones específicas por campo
        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(currentValue)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de Validación',
                    detail: 'El email no tiene un formato válido'
                });
                return;
            }
        }
        
        if (field === 'usuario' || field === 'nombre' || field === 'email') {
            if (!currentValue || currentValue.trim() === '') {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de Validación',
                    detail: `El campo ${this.getFieldLabel(field)} es requerido`
                });
                return;
            }
        }
        
        // Enviar actualización a la API
        this.updateUsuarioFieldAPI(usuario.id, field, currentValue);
        
        // Limpiar edición
        this.editingCell = null;
        this.originalValue = null;
    }

    // Actualizar campo específico de usuario via API
    updateUsuarioFieldAPI(userId: number, field: string, value: any): void {
        console.log('📤 Actualizando campo de usuario en API:', userId, field, value);
        
        const payload = {
            id: userId,
            [field]: value,
            action: 'UP' // Según convenciones del proyecto
        };
        
        this.http.post(this.apiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Campo de usuario actualizado en API - RESPUESTA COMPLETA:', response);
                console.log('✅ Tipo de respuesta:', typeof response);
                console.log('✅ Es array?:', Array.isArray(response));
                
                // Manejar respuesta según formato del servidor
                let successMessage = `${this.getFieldLabel(field)} actualizado correctamente`;
                let isSuccess = false;
                
                if (Array.isArray(response)) {
                    const firstItem = response[0];
                    if (firstItem && (firstItem.statuscode === 200 || firstItem.statuscode === '200')) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && (response.statuscode === 200 || response.statuscode === '200')) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Campo Actualizado',
                            detail: successMessage
                        });
                        // Recargar lista de usuarios desde API para reflejar cambios
                        this.cargarUsuarios();
                    }, 0);
                } else {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Respuesta Inesperada',
                            detail: 'El campo pudo haberse actualizado, pero la respuesta no fue la esperada'
                        });
                        this.cargarUsuarios();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al actualizar campo de usuario:', error);
                
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
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: `Error ${errorStatus}`,
                        detail: `No se pudo actualizar ${this.getFieldLabel(field)}. Código: ${errorCode} | Mensaje: ${errorMessage}`,
                        life: 5000
                    });
                    // Revertir el cambio local si hay error
                    this.cargarUsuarios();
                }, 0);
            }
        });
    }

    // Cancelar edición inline
    cancelInlineEdit(): void {
        console.log('❌ Cancelando edición inline');
        
        if (this.editingCell && this.originalValue !== null) {
            const [userId, field] = this.editingCell.split('_');
            const usuario = this.usuarios.find(u => u.id.toString() === userId);
            
            if (usuario) {
                (usuario as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;

        this.messageService.add({
            severity: 'info',
            summary: 'Edición Cancelada',
            detail: 'Los cambios han sido descartados'
        });
    }

    // Toggle para campo estado (como menu-admin)
    toggleField(usuario: UsuarioMock, field: string): void {
        console.log(`🔄 Toggle ${field} para usuario:`, usuario.nombre);
        
        if (field === 'estado') {
            const newValue = usuario.estado === 1 ? 0 : 1;
            this.updateUsuarioFieldAPI(usuario.id, 'estado', newValue);
        }
    }

    // Helper para obtener etiquetas de campos
    getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            'usuario': 'Usuario',
            'nombre': 'Nombre',
            'email': 'Email',
            'estado': 'Estado'
        };
        return labels[field] || field;
    }

    // ========== MÉTODOS PARA PERMISOS ==========
    
    openPermisoForm(permiso?: RolUsuarioMock): void {
        if (permiso) {
            // Modo edición
            this.isEditingRolUsuario = true;
            this.editingRolUsuarioId = permiso.id;
            this.rolUsuarioFormTitle = 'Editar Permiso';
            
            // Cargar datos en el formulario
            this.rolUsuarioForm.patchValue({
                id_usu: permiso.id_usu,
                id_rol: permiso.id_rol,
                estado: permiso.estado
            });
        } else {
            // Modo creación
            this.isEditingRolUsuario = false;
            this.editingRolUsuarioId = null;
            this.rolUsuarioFormTitle = 'Asignar Nuevo Permiso';
            
            // Resetear formulario
            this.rolUsuarioForm.reset({
                id_usu: '',
                id_rol: '',
                estado: 'A'
            });
        }
        
        this.showRolUsuarioModal = true;
    }

    editarPermiso(permiso: RolUsuarioMock): void {
        this.openPermisoForm(permiso);
    }

    eliminarPermiso(permiso: RolUsuarioMock): void {
        console.log('🗑️ Solicitando eliminación de permiso:', permiso.nombre_usuario, '-', permiso.nombre_rol);
        this.permisoToDelete = permiso;
        this.showConfirmDeletePermiso = true;
    }

    // Confirmar eliminación de permiso
    confirmDeletePermiso(): void {
        if (this.permisoToDelete) {
            console.log('✅ Confirmando eliminación de permiso:', this.permisoToDelete.nombre_usuario);
            this.deletePermisoAPI(this.permisoToDelete.id);
        }
        
        this.cancelDeletePermiso();
    }

    // Cancelar eliminación de permiso
    cancelDeletePermiso(): void {
        this.showConfirmDeletePermiso = false;
        this.permisoToDelete = null;
        console.log('❌ Eliminación de permiso cancelada');
    }

    // Eliminar permiso via API
    deletePermisoAPI(permisoId: number): void {
        console.log('📤 Eliminando permiso en API:', permisoId);
        
        const payload = {
            id: permisoId,
            action: 'DL' // Según convenciones del proyecto
        };
        
        this.http.post(this.permisosApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Permiso eliminado en API - RESPUESTA COMPLETA:', response);
                
                // Manejar respuesta según formato del servidor
                let successMessage = 'Permiso eliminado correctamente';
                let isSuccess = false;
                
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    if (firstItem && firstItem.statuscode === 200) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && response.statuscode === 200) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Permiso Eliminado',
                            detail: successMessage
                        });
                        // Recargar lista de permisos desde API
                        this.cargarPermisos();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al eliminar permiso:', error);
                
                let errorMessage = 'Error desconocido';
                if (error.error?.mensaje) {
                    errorMessage = error.error.mensaje;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al Eliminar',
                        detail: `No se pudo eliminar el permiso: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // Actualizar campo específico de permiso via API
    updatePermisoFieldAPI(permisoId: number, field: string, value: any): void {
        console.log('📤 Actualizando campo de permiso en API:', permisoId, field, value);
        
        const payload = {
            id: permisoId,
            [field]: value,
            action: 'UP' // Según convenciones del proyecto
        };
        
        this.http.post(this.permisosApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Campo de permiso actualizado en API - RESPUESTA COMPLETA:', response);
                
                // Manejar respuesta según formato del servidor
                let successMessage = `${this.getFieldLabelPermiso(field)} actualizado correctamente`;
                let isSuccess = false;
                
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    if (firstItem && firstItem.statuscode === 200) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && response.statuscode === 200) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Campo Actualizado',
                            detail: successMessage
                        });
                        // Recargar lista de permisos desde API para reflejar cambios
                        this.cargarPermisos();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al actualizar campo de permiso:', error);
                
                let errorMessage = 'Error desconocido';
                if (error.error?.mensaje) {
                    errorMessage = error.error.mensaje;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al Actualizar',
                        detail: `No se pudo actualizar ${this.getFieldLabelPermiso(field)}: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // ========== MÉTODOS PARA EDICIÓN INLINE DE PERMISOS ==========
    
    // Iniciar edición inline de una celda específica de permiso
    editInlinePermiso(permiso: RolUsuarioMock, field: string): void {
        console.log('🔧 Iniciando edición inline permiso:', field, 'para:', permiso.nombre_usuario);
        this.editingCell = permiso.id + '_' + field;
        this.originalValue = (permiso as any)[field];
    }

    // Guardar edición inline de permiso
    saveInlineEditPermiso(permiso: RolUsuarioMock, field: string): void {
        console.log('💾 Guardando edición inline permiso:', field);
        
        const currentValue = (permiso as any)[field];
        
        // Validar que se haya seleccionado un valor
        if (!currentValue) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: `Debe seleccionar un ${this.getFieldLabelPermiso(field)}`
            });
            return;
        }
        
        // Actualizar nombres cuando cambian los IDs
        if (field === 'id_usu') {
            const usuario = this.usuarios.find(u => u.id === currentValue);
            if (usuario) {
                permiso.nombre_usuario = usuario.nombre;
                permiso.email_usuario = usuario.email;
            }
        } else if (field === 'id_rol') {
            const rol = this.roles.find(r => r.id_rol === currentValue);
            if (rol) {
                permiso.nombre_rol = rol.nombre;
            }
        }
        
        // Enviar actualización a la API
        this.updatePermisoFieldAPI(permiso.id, field, currentValue);
        
        // Limpiar edición
        this.editingCell = null;
        this.originalValue = null;
    }

    // Cancelar edición inline de permiso
    cancelInlineEditPermiso(): void {
        console.log('❌ Cancelando edición inline permiso');
        
        if (this.editingCell && this.originalValue !== null) {
            const [permisoId, field] = this.editingCell.split('_');
            const permiso = this.rolUsuarios.find(p => p.id.toString() === permisoId);
            
            if (permiso) {
                (permiso as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;

        this.messageService.add({
            severity: 'info',
            summary: 'Edición Cancelada',
            detail: 'Los cambios han sido descartados'
        });
    }

    // Toggle para campo estado de permiso
    toggleFieldPermiso(permiso: RolUsuarioMock, field: string): void {
        console.log(`🔄 Toggle ${field} para permiso:`, permiso.nombre_usuario);
        
        if (field === 'estado') {
            permiso.estado = permiso.estado === 'A' ? 'I' : 'A';
            permiso.fecha_m = new Date().toISOString();
            permiso.usu_m = 'ADMIN';
            
            this.messageService.add({
                severity: 'success',
                summary: 'Estado Actualizado',
                detail: `Permiso ${permiso.estado === 'A' ? 'activado' : 'inactivado'}`
            });
        }
    }

    // Helper para obtener opciones de usuarios
    getUsuariosOptions(): any[] {
        return this.usuarios.map(usuario => ({
            label: `${usuario.nombre} (${usuario.usuario})`,
            value: usuario.id
        }));
    }

    // Helper para obtener opciones de roles
    getRolesOptions(): any[] {
        return this.roles.map(rol => ({
            label: rol.nombre,
            value: rol.id_rol
        }));
    }

    // Helper para obtener etiquetas de campos de permiso
    getFieldLabelPermiso(field: string): string {
        const labels: { [key: string]: string } = {
            'id_usu': 'Usuario',
            'id_rol': 'Rol',
            'estado': 'Estado'
        };
        return labels[field] || field;
    }

    // Helper para obtener label del estado de permiso
    getEstadoPermisoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    // Helper para obtener severity del estado de permiso
    getEstadoPermisoSeverity(estado: string): string {
        return estado === 'A' ? 'success' : 'danger';
    }

    // Cerrar formulario de permiso
    closePermisoForm(): void {
        this.showRolUsuarioModal = false;
        this.isEditingRolUsuario = false;
        this.editingRolUsuarioId = null;
        this.rolUsuarioForm.reset();
    }

    // Guardar permiso (crear o editar)
    savePermiso(): void {
        if (this.rolUsuarioForm.valid) {
            const formValue = this.rolUsuarioForm.value;
            console.log('💾 Guardando permiso:', formValue);

            if (this.isEditingRolUsuario && this.editingRolUsuarioId) {
                // Editar permiso existente
                const index = this.rolUsuarios.findIndex(p => p.id === this.editingRolUsuarioId);
                
                if (index !== -1) {
                    // Obtener nombres para mostrar
                    const usuario = this.usuarios.find(u => u.id === formValue.id_usu);
                    const rol = this.roles.find(r => r.id_rol === formValue.id_rol);
                    
                    // Actualizar el permiso
                    this.rolUsuarios[index] = {
                        ...this.rolUsuarios[index],
                        id_usu: formValue.id_usu,
                        id_rol: formValue.id_rol,
                        estado: formValue.estado,
                        usu_m: 'ADMIN', // Usuario que modifica
                        nombre_usuario: usuario?.nombre || 'Usuario',
                        email_usuario: usuario?.email || '',
                        nombre_rol: rol?.nombre || 'Rol',
                        fecha_m: new Date().toISOString()
                    };

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Permiso Actualizado',
                        detail: `Permiso ${usuario?.nombre} - ${rol?.nombre} actualizado correctamente`
                    });
                }
            } else {
                // Crear nuevo permiso
                const usuario = this.usuarios.find(u => u.id === formValue.id_usu);
                const rol = this.roles.find(r => r.id_rol === formValue.id_rol);
                
                // Verificar que no exista ya esta combinación
                const existePermiso = this.rolUsuarios.find(p => 
                    p.id_usu === formValue.id_usu && p.id_rol === formValue.id_rol
                );
                
                if (existePermiso) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Permiso Existente',
                        detail: `Ya existe un permiso para ${usuario?.nombre} con el rol ${rol?.nombre}`
                    });
                    return;
                }
                
                const nuevoPermiso: RolUsuarioMock = {
                    id: Math.max(...this.rolUsuarios.map(p => p.id)) + 1,
                    id_usu: formValue.id_usu,
                    id_rol: formValue.id_rol,
                    estado: formValue.estado,
                    usu_m: 'ADMIN', // Usuario que modifica
                    nombre_usuario: usuario?.nombre || 'Usuario',
                    email_usuario: usuario?.email || '',
                    nombre_rol: rol?.nombre || 'Rol',
                    fecha_m: new Date().toISOString()
                };

                this.rolUsuarios.push(nuevoPermiso);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Permiso Creado',
                    detail: `Permiso ${usuario?.nombre} - ${rol?.nombre} creado correctamente`
                });
            }

            this.closePermisoForm();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: 'Por favor, complete todos los campos requeridos'
            });
        }
    }

    // ========== MÉTODOS PARA ROLES ==========
    
    openRolForm(rol?: RolMock): void {
        if (rol) {
            // Modo edición
            this.isEditingRol = true;
            this.editingRolId = rol.id_rol;
            this.rolFormTitle = 'Editar Rol';
            
            // Cargar datos en el formulario
            this.rolForm.patchValue({
                nombre: rol.nombre,
                estado: rol.estado
            });
        } else {
            // Modo creación
            this.isEditingRol = false;
            this.editingRolId = null;
            this.rolFormTitle = 'Crear Nuevo Rol';
            
            // Resetear formulario
            this.rolForm.reset({
                nombre: '',
                estado: 'A'
            });
        }
        
        this.showRolModal = true;
    }

    editarRol(rol: RolMock): void {
        this.openRolForm(rol);
    }

    eliminarRol(rol: RolMock): void {
        console.log('🗑️ Solicitando eliminación de rol:', rol.nombre);
        
        // Verificar si el rol está siendo usado en permisos
        const rolEnUso = this.rolUsuarios.find(p => p.id_rol === rol.id_rol);
        
        if (rolEnUso) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Rol en Uso',
                detail: `El rol "${rol.nombre}" está asignado a usuarios y no puede ser eliminado`
            });
            return;
        }
        
        this.rolToDelete = rol;
        this.showConfirmDeleteRol = true;
    }

    // Confirmar eliminación de rol
    confirmDeleteRol(): void {
        if (this.rolToDelete) {
            console.log('✅ Confirmando eliminación de rol:', this.rolToDelete.nombre);
            this.deleteRolAPI(this.rolToDelete.id_rol);
        }
        
        this.cancelDeleteRol();
    }

    // Cancelar eliminación de rol
    cancelDeleteRol(): void {
        this.showConfirmDeleteRol = false;
        this.rolToDelete = null;
        console.log('❌ Eliminación de rol cancelada');
    }

    // Eliminar rol via API
    deleteRolAPI(rolId: number): void {
        console.log('📤 Eliminando rol en API:', rolId);
        
        const payload = {
            id: rolId,
            action: 'DL' // Según convenciones del proyecto
        };
        
        this.http.post(this.rolesApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Rol eliminado en API - RESPUESTA COMPLETA:', response);
                
                // Manejar respuesta según formato del servidor
                let successMessage = 'Rol eliminado correctamente';
                let isSuccess = false;
                
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    if (firstItem && firstItem.statuscode === 200) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && response.statuscode === 200) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Rol Eliminado',
                            detail: successMessage
                        });
                        // Limpiar selección si era el rol eliminado
                        if (this.rolSeleccionado?.id_rol === rolId) {
                            this.rolSeleccionado = null;
                            this.rolDetallesFiltrados = [];
                        }
                        // Recargar lista de roles desde API
                        this.cargarRoles();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al eliminar rol:', error);
                
                let errorMessage = 'Error desconocido';
                if (error.error?.mensaje) {
                    errorMessage = error.error.mensaje;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al Eliminar',
                        detail: `No se pudo eliminar el rol: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // Actualizar campo específico de rol via API
    updateRolFieldAPI(rolId: number, field: string, value: any): void {
        console.log('📤 Actualizando campo de rol en API:', rolId, field, value);
        
        const payload = {
            id: rolId,
            [field]: value,
            action: 'UP' // Según convenciones del proyecto
        };
        
        this.http.post(this.rolesApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Campo de rol actualizado en API - RESPUESTA COMPLETA:', response);
                
                // Manejar respuesta según formato del servidor
                let successMessage = `${this.getFieldLabelRol(field)} actualizado correctamente`;
                let isSuccess = false;
                
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    if (firstItem && firstItem.statuscode === 200) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && response.statuscode === 200) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Campo Actualizado',
                            detail: successMessage
                        });
                        // Recargar lista de roles desde API para reflejar cambios
                        this.cargarRoles();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al actualizar campo de rol:', error);
                
                let errorMessage = 'Error desconocido';
                if (error.error?.mensaje) {
                    errorMessage = error.error.mensaje;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al Actualizar',
                        detail: `No se pudo actualizar ${this.getFieldLabelRol(field)}: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // ========== MÉTODOS PARA EDICIÓN INLINE DE ROLES ==========
    
    // Iniciar edición inline de una celda específica de rol
    editInlineRol(rol: RolMock, field: string): void {
        console.log('🔧 Iniciando edición inline rol:', field, 'para:', rol.nombre);
        this.editingCell = rol.id_rol + '_' + field;
        this.originalValue = (rol as any)[field];
    }

    // Guardar edición inline de rol
    saveInlineEditRol(rol: RolMock, field: string): void {
        console.log('💾 Guardando edición inline rol:', field);
        
        const currentValue = (rol as any)[field];
        
        // Validar que no esté vacío
        if (field === 'nombre') {
            if (!currentValue || currentValue.trim() === '') {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de Validación',
                    detail: 'El nombre del rol es requerido'
                });
                return;
            }
            
            // Verificar que no exista otro rol con el mismo nombre
            const nombreExiste = this.roles.find(r => 
                r.id_rol !== rol.id_rol && 
                r.nombre.toLowerCase() === currentValue.toLowerCase()
            );
            
            if (nombreExiste) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Nombre Duplicado',
                    detail: `Ya existe un rol con el nombre "${currentValue}"`
                });
                return;
            }
        }
        
        // Enviar actualización a la API
        this.updateRolFieldAPI(rol.id_rol, field, currentValue);
        
        // Limpiar edición
        this.editingCell = null;
        this.originalValue = null;
    }

    // Cancelar edición inline de rol
    cancelInlineEditRol(): void {
        console.log('❌ Cancelando edición inline rol');
        
        if (this.editingCell && this.originalValue !== null) {
            const [rolId, field] = this.editingCell.split('_');
            const rol = this.roles.find(r => r.id_rol.toString() === rolId);
            
            if (rol) {
                (rol as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;

        this.messageService.add({
            severity: 'info',
            summary: 'Edición Cancelada',
            detail: 'Los cambios han sido descartados'
        });
    }

    // Toggle para campo estado de rol
    toggleFieldRol(rol: RolMock, field: string): void {
        console.log(`🔄 Toggle ${field} para rol:`, rol.nombre);
        
        if (field === 'estado') {
            rol.estado = rol.estado === 'A' ? 'I' : 'A';
            rol.fecha_m = new Date().toISOString();
            
            this.messageService.add({
                severity: 'success',
                summary: 'Estado Actualizado',
                detail: `Rol ${rol.estado === 'A' ? 'activado' : 'inactivado'}`
            });
        }
    }

    // Helper para obtener etiquetas de campos de rol
    getFieldLabelRol(field: string): string {
        const labels: { [key: string]: string } = {
            'nombre': 'Nombre',
            'estado': 'Estado'
        };
        return labels[field] || field;
    }

    // Helper para obtener label del estado de rol
    getEstadoRolLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    // Helper para obtener severity del estado de rol
    getEstadoRolSeverity(estado: string): string {
        return estado === 'A' ? 'success' : 'danger';
    }

    // Cerrar formulario de rol
    closeRolForm(): void {
        this.showRolModal = false;
        this.isEditingRol = false;
        this.editingRolId = null;
        this.rolForm.reset();
    }

    // Guardar rol (crear o editar)
    saveRol(): void {
        if (this.rolForm.valid) {
            const formValue = this.rolForm.value;
            console.log('💾 Guardando rol:', formValue);

            if (this.isEditingRol && this.editingRolId) {
                // Editar rol existente
                const index = this.roles.findIndex(r => r.id_rol === this.editingRolId);
                
                if (index !== -1) {
                    // Verificar nombre duplicado
                    const nombreExiste = this.roles.find(r => 
                        r.id_rol !== this.editingRolId && 
                        r.nombre.toLowerCase() === formValue.nombre.toLowerCase()
                    );
                    
                    if (nombreExiste) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Nombre Duplicado',
                            detail: `Ya existe un rol con el nombre "${formValue.nombre}"`
                        });
                        return;
                    }
                    
                    // Actualizar el rol
                    this.roles[index] = {
                        ...this.roles[index],
                        nombre: formValue.nombre,
                        estado: formValue.estado,
                        fecha_m: new Date().toISOString()
                    };

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Rol Actualizado',
                        detail: `Rol "${formValue.nombre}" actualizado correctamente`
                    });
                }
            } else {
                // Crear nuevo rol
                // Verificar nombre duplicado
                const nombreExiste = this.roles.find(r => 
                    r.nombre.toLowerCase() === formValue.nombre.toLowerCase()
                );
                
                if (nombreExiste) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Nombre Duplicado',
                        detail: `Ya existe un rol con el nombre "${formValue.nombre}"`
                    });
                    return;
                }
                
                const nuevoRol: RolMock = {
                    id_rol: Math.max(...this.roles.map(r => r.id_rol)) + 1,
                    nombre: formValue.nombre,
                    estado: formValue.estado,
                    fecha_m: new Date().toISOString()
                };

                this.roles.push(nuevoRol);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Rol Creado',
                    detail: `Rol "${formValue.nombre}" creado correctamente`
                });
            }

            this.closeRolForm();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: 'Por favor, complete todos los campos requeridos'
            });
        }
    }

    // ========== MÉTODOS PARA ROL DETALLE ==========
    
    openRolDetalleForm(detalle?: RolDetalleMock): void {
        if (!this.rolSeleccionado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Seleccionar Rol',
                detail: 'Debe seleccionar un rol antes de agregar detalles'
            });
            return;
        }

        if (detalle) {
            // Modo edición
            this.isEditingRolDetalle = true;
            this.editingRolDetalleId = detalle.id_rold;
            this.rolDetalleFormTitle = 'Editar Detalle de Rol';
            
            // Cargar datos en el formulario
            this.rolDetalleForm.patchValue({
                id_rol: detalle.id_rol,
                id_menu: detalle.id_menu,
                ren: detalle.ren
            });
        } else {
            // Modo creación
            this.isEditingRolDetalle = false;
            this.editingRolDetalleId = null;
            this.rolDetalleFormTitle = 'Agregar Detalle de Rol';
            
            // Resetear formulario con valores por defecto
            this.rolDetalleForm.reset({
                id_rol: this.rolSeleccionado!.id_rol,
                id_menu: '',
                ren: this.getNextRen()
            });
        }
        
        this.showRolDetalleModal = true;
    }

    editarRolDetalle(detalle: RolDetalleMock): void {
        this.openRolDetalleForm(detalle);
    }

    eliminarRolDetalle(detalle: RolDetalleMock): void {
        console.log('🗑️ Solicitando eliminación de rol detalle:', detalle.nombre_menu);
        this.rolDetalleToDelete = detalle;
        this.showConfirmDeleteRolDetalle = true;
    }

    // Confirmar eliminación de rol detalle
    confirmDeleteRolDetalle(): void {
        if (this.rolDetalleToDelete) {
            console.log('✅ Confirmando eliminación de rol detalle:', this.rolDetalleToDelete.nombre_menu);
            // Como no hay API específica para rol detalle, usamos el mismo endpoint de roles
            this.deleteRolDetalleAPI(this.rolDetalleToDelete.id_rold);
        }
        
        this.cancelDeleteRolDetalle();
    }

    // Cancelar eliminación de rol detalle
    cancelDeleteRolDetalle(): void {
        this.showConfirmDeleteRolDetalle = false;
        this.rolDetalleToDelete = null;
        console.log('❌ Eliminación de rol detalle cancelada');
    }

    // Eliminar rol detalle via API
    deleteRolDetalleAPI(detalleId: number): void {
        console.log('📤 Eliminando rol detalle en API:', detalleId);
        
        const payload = {
            id: detalleId,
            action: 'DL' // Según convenciones del proyecto
        };
        
        // Usar endpoint específico de rol detalle
        this.http.post(this.rolDetalleApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Rol detalle eliminado en API - RESPUESTA COMPLETA:', response);
                
                // Manejar respuesta según formato del servidor
                let successMessage = 'Detalle de rol eliminado correctamente';
                let isSuccess = false;
                
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    if (firstItem && firstItem.statuscode === 200) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && response.statuscode === 200) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Detalle Eliminado',
                            detail: successMessage
                        });
                        // Recargar rol detalle desde API para reflejar cambios
                        this.cargarRolDetalle();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al eliminar rol detalle:', error);
                
                let errorMessage = 'Error desconocido';
                if (error.error?.mensaje) {
                    errorMessage = error.error.mensaje;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al Eliminar',
                        detail: `No se pudo eliminar el detalle: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // Actualizar campo específico de rol detalle via API
    updateRolDetalleFieldAPI(detalleId: number, field: string, value: any): void {
        console.log('📤 Actualizando campo de rol detalle en API:', detalleId, field, value);
        
        const payload = {
            id: detalleId,
            [field]: value,
            action: 'UP' // Según convenciones del proyecto
        };
        
        // Usar endpoint específico de rol detalle
        this.http.post(this.rolDetalleApiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ Campo de rol detalle actualizado en API - RESPUESTA COMPLETA:', response);
                
                // Manejar respuesta según formato del servidor
                let successMessage = `${this.getFieldLabelRolDetalle(field)} actualizado correctamente`;
                let isSuccess = false;
                
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    if (firstItem && firstItem.statuscode === 200) {
                        isSuccess = true;
                        successMessage = firstItem.mensaje || successMessage;
                    }
                } else if (response && response.statuscode === 200) {
                    isSuccess = true;
                    successMessage = response.mensaje || successMessage;
                } else if (response) {
                    isSuccess = true;
                }
                
                if (isSuccess) {
                    setTimeout(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Campo Actualizado',
                            detail: successMessage
                        });
                        // Recargar rol detalle desde API para reflejar cambios
                        this.cargarRolDetalle();
                    }, 0);
                }
            },
            error: (error) => {
                console.error('❌ Error al actualizar campo de rol detalle:', error);
                
                let errorMessage = 'Error desconocido';
                if (error.error?.mensaje) {
                    errorMessage = error.error.mensaje;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                setTimeout(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al Actualizar',
                        detail: `No se pudo actualizar ${this.getFieldLabelRolDetalle(field)}: ${errorMessage}`,
                        life: 5000
                    });
                }, 0);
            }
        });
    }

    // ========== MÉTODOS PARA EDICIÓN INLINE DE ROL DETALLE ==========
    
    // Iniciar edición inline de una celda específica de rol detalle
    editInlineRolDetalle(detalle: RolDetalleMock, field: string): void {
        console.log('🔧 Iniciando edición inline rol detalle:', field, 'para:', detalle.id_rold);
        this.editingCell = detalle.id_rold + '_' + field;
        this.originalValue = (detalle as any)[field];
    }

    // Guardar edición inline de rol detalle
    saveInlineEditRolDetalle(detalle: RolDetalleMock, field: string): void {
        console.log('💾 Guardando edición inline rol detalle:', field);
        
        const currentValue = (detalle as any)[field];
        
        // Validar campos
        if (field === 'ren' || field === 'id_menu') {
            if (!currentValue || currentValue < 1) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de Validación',
                    detail: `${this.getFieldLabelRolDetalle(field)} debe ser mayor a 0`
                });
                return;
            }
        }
        
        // Verificar duplicados de REN en el mismo rol
        if (field === 'ren') {
            const renExiste = this.rolDetalles.find(d => 
                d.id_rold !== detalle.id_rold && 
                d.id_rol === detalle.id_rol && 
                d.ren === currentValue
            );
            
            if (renExiste) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'REN Duplicado',
                    detail: `Ya existe un detalle con REN ${currentValue} en este rol`
                });
                return;
            }
        }
        
        // Actualizar nombre del menú si se cambió el ID
        if (field === 'id_menu') {
            detalle.nombre_menu = this.getMenuNombre(detalle.id_menu);
        }
        
        // Enviar actualización a la API
        this.updateRolDetalleFieldAPI(detalle.id_rold, field, currentValue);
        
        // Limpiar edición
        this.editingCell = null;
        this.originalValue = null;
    }

    // Cancelar edición inline de rol detalle
    cancelInlineEditRolDetalle(): void {
        console.log('❌ Cancelando edición inline rol detalle');
        
        if (this.editingCell && this.originalValue !== null) {
            const [detalleId, field] = this.editingCell.split('_');
            const detalle = this.rolDetalles.find(d => d.id_rold.toString() === detalleId);
            
            if (detalle) {
                (detalle as any)[field] = this.originalValue;
            }
        }
        
        this.editingCell = null;
        this.originalValue = null;

        this.messageService.add({
            severity: 'info',
            summary: 'Edición Cancelada',
            detail: 'Los cambios han sido descartados'
        });
    }

    // Helper para obtener el siguiente REN
    getNextRen(): number {
        if (!this.rolSeleccionado) return 1;
        
        const detallesDelRol = this.rolDetalles.filter(d => d.id_rol === this.rolSeleccionado!.id_rol);
        const maxRen = Math.max(...detallesDelRol.map(d => d.ren), 0);
        return maxRen + 1;
    }

    // Helper para obtener etiquetas de campos de rol detalle
    getFieldLabelRolDetalle(field: string): string {
        const labels: { [key: string]: string } = {
            'ren': 'REN',
            'id_menu': 'ID Menú'
        };
        return labels[field] || field;
    }

    // Helper para obtener opciones de menús disponibles
    getMenusOptions(): any[] {
        return this.menusDisponibles.map(menu => ({
            label: `${menu.nombre} (${menu.descripcion})`,
            value: menu.id
        }));
    }

    // Helper para obtener nombre del menú por ID
    getMenuNombre(idMenu: number): string {
        const menu = this.menusDisponibles.find(m => m.id === idMenu);
        return menu ? menu.nombre : `Menú ${idMenu}`;
    }

    // Cerrar formulario de rol detalle
    closeRolDetalleForm(): void {
        this.showRolDetalleModal = false;
        this.isEditingRolDetalle = false;
        this.editingRolDetalleId = null;
        this.rolDetalleForm.reset();
    }

    // Guardar rol detalle (crear o editar)
    saveRolDetalle(): void {
        if (this.rolDetalleForm.valid) {
            const formValue = this.rolDetalleForm.value;
            console.log('💾 Guardando rol detalle:', formValue);

            if (this.isEditingRolDetalle && this.editingRolDetalleId) {
                // Editar detalle existente
                const index = this.rolDetalles.findIndex(d => d.id_rold === this.editingRolDetalleId);
                
                if (index !== -1) {
                    // Verificar REN duplicado
                    const renExiste = this.rolDetalles.find(d => 
                        d.id_rold !== this.editingRolDetalleId && 
                        d.id_rol === formValue.id_rol && 
                        d.ren === formValue.ren
                    );
                    
                    if (renExiste) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'REN Duplicado',
                            detail: `Ya existe un detalle con REN ${formValue.ren} en este rol`
                        });
                        return;
                    }
                    
                    // Actualizar el detalle
                    this.rolDetalles[index] = {
                        ...this.rolDetalles[index],
                        id_menu: formValue.id_menu,
                        ren: formValue.ren,
                        nombre_menu: this.getMenuNombre(formValue.id_menu),
                        fecha_m: new Date().toISOString()
                    };

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Detalle Actualizado',
                        detail: 'Detalle de rol actualizado correctamente'
                    });
                }
            } else {
                // Crear nuevo detalle
                // Verificar REN duplicado
                const renExiste = this.rolDetalles.find(d => 
                    d.id_rol === formValue.id_rol && d.ren === formValue.ren
                );
                
                if (renExiste) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'REN Duplicado',
                        detail: `Ya existe un detalle con REN ${formValue.ren} en este rol`
                    });
                    return;
                }
                
                const nuevoDetalle: RolDetalleMock = {
                    id_rold: Math.max(...this.rolDetalles.map(d => d.id_rold)) + 1,
                    id_rol: formValue.id_rol,
                    id_menu: formValue.id_menu,
                    ren: formValue.ren,
                    nombre_rol: this.rolSeleccionado?.nombre || 'Rol',
                    nombre_menu: this.getMenuNombre(formValue.id_menu),
                    fecha_m: new Date().toISOString()
                };

                this.rolDetalles.push(nuevoDetalle);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Detalle Creado',
                    detail: 'Detalle de rol creado correctamente'
                });
            }

            // Actualizar la lista filtrada
            this.updateRolDetallesFiltrados();
            this.closeRolDetalleForm();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: 'Por favor, complete todos los campos requeridos'
            });
        }
    }

    // Helper para actualizar la lista filtrada de rol detalles
    updateRolDetallesFiltrados(): void {
        if (this.rolSeleccionado) {
            this.rolDetallesFiltrados = this.rolDetalles.filter(d => d.id_rol === this.rolSeleccionado!.id_rol);
        } else {
            this.rolDetallesFiltrados = [];
        }
    }

    // Método llamado cuando se activa el tab de Roles
    onTabRolesActivated(): void {
        console.log('🎯 onTabRolesActivated() ejecutado');
        console.log('📊 Roles disponibles:', this.roles.length);
        
        // Si hay roles disponibles y no hay ninguno seleccionado
        if (this.roles.length > 0 && !this.rolSeleccionado) {
            console.log('👑 Preseleccionando primer rol:', this.roles[0]);
            this.rolSeleccionado = this.roles[0];
            
            // Filtrar detalles inmediatamente
            this.filtrarRolDetalles();
            
            console.log('✅ Rol preseleccionado:', this.rolSeleccionado.nombre);
            console.log('📋 Detalles filtrados:', this.rolDetallesFiltrados.length);
        } else if (this.roles.length === 0) {
            console.log('⚠️ No hay roles disponibles para preseleccionar');
        } else {
            console.log('ℹ️ Ya hay un rol seleccionado:', this.rolSeleccionado?.nombre);
        }
    }

    // Cambio de tab
    onTabChange(event: any): void {
        console.log('🔄 Tab cambiado a:', event.index, 'Nombre:', event.originalEvent?.target?.textContent);
        
        // Si se cambia al tab de Roles (índice 2), preseleccionar el primer rol
        if (event.index === 2) {
            console.log('🎯 Cambiando a tab Roles, preseleccionando primer rol...');
            this.onTabRolesActivated();
        }
    }

    // ========== MODALES DE CONFIRMACIÓN ==========

    // Modal de confirmación para eliminar usuario
    showConfirmDeleteUsuarioModal(): void {
        if (this.usuarioToDelete) {
            this.showConfirmDeleteUsuario = true;
        }
    }

    // Modal de confirmación para eliminar permiso
    showConfirmDeletePermisoModal(): void {
        if (this.permisoToDelete) {
            this.showConfirmDeletePermiso = true;
        }
    }

    // Modal de confirmación para eliminar rol
    showConfirmDeleteRolModal(): void {
        if (this.rolToDelete) {
            this.showConfirmDeleteRol = true;
        }
    }

    // Modal de confirmación para eliminar rol detalle
    showConfirmDeleteRolDetalleModal(): void {
        if (this.rolDetalleToDelete) {
            this.showConfirmDeleteRolDetalle = true;
        }
    }
}
