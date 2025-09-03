import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
            <p-tabs value="0">
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
                                    <p-inputtext 
                                        type="text" 
                                        (input)="onGlobalFilter(dtUsuarios, $event)" 
                                        placeholder="Buscar usuarios..." 
                                        class="w-full sm:w-80 order-1 sm:order-0"
                                    />
                                    <button 
                                        (click)="openUsuarioForm()" 
                                        pButton 
                                        outlined 
                                        class="w-full sm:w-auto flex-order-0 sm:flex-order-1" 
                                        icon="pi pi-plus" 
                                        label="Agregar Usuario"
                                    ></button>
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
                                    <td>{{usuario.usuario}}</td>
                                    <td>{{usuario.nombre}}</td>
                                    <td>{{usuario.email}}</td>
                                    <td>
                                        <p-tag 
                                            [value]="getEstadoLabel(usuario.estado)" 
                                            [severity]="getEstadoSeverity(usuario.estado)"
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
                                    <td>
                                        <div class="flex gap-2">
                                            <button 
                                                pButton 
                                                icon="pi pi-eye" 
                                                class="p-button-sm p-button-info p-button-text"
                                                pTooltip="Ver Usuario"
                                                (click)="verUsuario(usuario)"
                                            ></button>
                                            <button 
                                                pButton 
                                                icon="pi pi-pencil" 
                                                class="p-button-sm p-button-warning p-button-text"
                                                pTooltip="Editar Usuario"
                                                (click)="editarUsuario(usuario)"
                                            ></button>
                                            <button 
                                                pButton 
                                                icon="pi pi-trash" 
                                                class="p-button-sm p-button-danger p-button-text"
                                                pTooltip="Eliminar Usuario"
                                                (click)="eliminarUsuario(usuario)"
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
                            #dtPermisos
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
                                    <p-inputtext 
                                        type="text" 
                                        (input)="onGlobalFilter(dtPermisos, $event)" 
                                        placeholder="Buscar permisos..." 
                                        class="w-full sm:w-80 order-1 sm:order-0"
                                    />
                                    <button 
                                        (click)="openPermisoForm()" 
                                        pButton 
                                        outlined 
                                        class="w-full sm:w-auto flex-order-0 sm:flex-order-1" 
                                        icon="pi pi-plus" 
                                        label="Asignar Permiso"
                                    ></button>
                                </div>
                            </ng-template>

                            <ng-template #header>
                                <tr>
                                    <th style="width: 100px">ID</th>
                                    <th style="min-width: 200px">Usuario</th>
                                    <th style="min-width: 250px">Email</th>
                                    <th style="min-width: 200px">Rol</th>
                                    <th style="width: 100px">Estado</th>
                                    <th style="width: 150px">Modificado</th>
                                    <th style="width: 150px">Acciones</th>
                                </tr>
                            </ng-template>

                            <ng-template #body let-permiso>
                                <tr>
                                    <td>{{permiso.id}}</td>
                                    <td>{{permiso.nombre_usuario}}</td>
                                    <td>{{permiso.email_usuario}}</td>
                                    <td>{{permiso.nombre_rol}}</td>
                                    <td>
                                        <p-tag 
                                            [value]="getEstadoLabel(permiso.estado)" 
                                            [severity]="getEstadoSeverity(permiso.estado)"
                                        ></p-tag>
                                    </td>
                                    <td>{{permiso.fecha_m | date:'short'}}</td>
                                    <td>
                                        <div class="flex gap-2">
                                            <button 
                                                pButton 
                                                icon="pi pi-pencil" 
                                                class="p-button-sm p-button-warning p-button-text"
                                                pTooltip="Editar Permiso"
                                                (click)="editarPermiso(permiso)"
                                            ></button>
                                            <button 
                                                pButton 
                                                icon="pi pi-trash" 
                                                class="p-button-sm p-button-danger p-button-text"
                                                pTooltip="Eliminar Permiso"
                                                (click)="eliminarPermiso(permiso)"
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
                            <h3 class="text-lg font-semibold mb-3">📋 Lista de Roles</h3>
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
                                        <p-inputtext 
                                            type="text" 
                                            (input)="onGlobalFilter(dtRoles, $event)" 
                                            placeholder="Buscar roles..." 
                                            class="w-full sm:w-80 order-1 sm:order-0"
                                        />
                                        <button 
                                            (click)="openRolForm()" 
                                            pButton 
                                            outlined 
                                            class="w-full sm:w-auto flex-order-0 sm:flex-order-1" 
                                            icon="pi pi-plus" 
                                            label="Agregar Rol"
                                        ></button>
                                    </div>
                                </ng-template>

                                <ng-template #header>
                                    <tr>
                                        <th style="width: 80px">ID</th>
                                        <th style="min-width: 200px">Nombre</th>
                                        <th style="width: 100px">Estado</th>
                                        <th style="width: 150px">Modificado</th>
                                        <th style="width: 150px">Acciones</th>
                                    </tr>
                                </ng-template>

                                <ng-template #body let-rol>
                                    <tr>
                                        <td>{{rol.id_rol}}</td>
                                        <td>{{rol.nombre}}</td>
                                        <td>
                                            <p-tag 
                                                [value]="getEstadoLabel(rol.estado)" 
                                                [severity]="getEstadoSeverity(rol.estado)"
                                            ></p-tag>
                                        </td>
                                        <td>{{rol.fecha_m | date:'short'}}</td>
                                        <td>
                                            <div class="flex gap-2">
                                                <button 
                                                    pButton 
                                                    icon="pi pi-pencil" 
                                                    class="p-button-sm p-button-warning p-button-text"
                                                    pTooltip="Editar Rol"
                                                    (click)="editarRol(rol)"
                                                ></button>
                                                <button 
                                                    pButton 
                                                    icon="pi pi-trash" 
                                                    class="p-button-sm p-button-danger p-button-text"
                                                    pTooltip="Eliminar Rol"
                                                    (click)="eliminarRol(rol)"
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
                                        <p-inputtext 
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
                                        <th style="width: 100px">REN</th>
                                        <th style="min-width: 200px">Menú</th>
                                        <th style="width: 150px">Modificado</th>
                                        <th style="width: 150px">Acciones</th>
                                    </tr>
                                </ng-template>

                                <ng-template #body let-detalle>
                                    <tr>
                                        <td>{{detalle.id_rold}}</td>
                                        <td>{{detalle.ren}}</td>
                                        <td>{{detalle.nombre_menu || 'Sin menú'}}</td>
                                        <td>{{detalle.fecha_m | date:'short'}}</td>
                                        <td>
                                            <div class="flex gap-2">
                                                <button 
                                                    pButton 
                                                    icon="pi pi-pencil" 
                                                    class="p-button-sm p-button-warning p-button-text"
                                                    pTooltip="Editar Detalle"
                                                    (click)="editarRolDetalle(detalle)"
                                                ></button>
                                                <button 
                                                    pButton 
                                                    icon="pi pi-trash" 
                                                    class="p-button-sm p-button-danger p-button-text"
                                                    pTooltip="Eliminar Detalle"
                                                    (click)="eliminarRolDetalle(detalle)"
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
        }
    `]
})
export class UsuariosComponent implements OnInit {
    // Datos mock
    usuarios: UsuarioMock[] = [];
    roles: RolMock[] = [];
    rolDetalles: RolDetalleMock[] = [];
    rolUsuarios: RolUsuarioMock[] = [];
    
    // Selección
    rolSeleccionado: RolMock | null = null;
    
    // Filtros
    rolDetallesFiltrados: RolDetalleMock[] = [];

    constructor(private messageService: MessageService) {}

    ngOnInit(): void {
        this.cargarDatosMock();
    }

    // Cargar datos mock
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

        console.log('✅ Datos mock cargados:', {
            usuarios: this.usuarios.length,
            roles: this.roles.length,
            rolDetalles: this.rolDetalles.length,
            rolUsuarios: this.rolUsuarios.length
        });
    }

    // Filtro global
    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // Selección de rol
    onRolSelect(event: any): void {
        this.rolSeleccionado = event.data;
        this.filtrarRolDetalles();
        console.log('👑 Rol seleccionado:', this.rolSeleccionado);
    }

    // Filtrar detalles del rol seleccionado
    filtrarRolDetalles(): void {
        if (this.rolSeleccionado) {
            this.rolDetallesFiltrados = this.rolDetalles.filter(
                detalle => detalle.id_rol === this.rolSeleccionado!.id_rol
            );
            console.log('📋 Detalles filtrados para rol', this.rolSeleccionado.nombre, ':', this.rolDetallesFiltrados.length);
        } else {
            this.rolDetallesFiltrados = [];
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
    
    openUsuarioForm(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Formulario Usuario',
            detail: 'Funcionalidad de formulario de usuario - Implementar en siguiente fase'
        });
    }

    verUsuario(usuario: UsuarioMock): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Ver Usuario',
            detail: `Viendo usuario: ${usuario.nombre}`
        });
    }

    editarUsuario(usuario: UsuarioMock): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Editar Usuario',
            detail: `Editando usuario: ${usuario.nombre}`
        });
    }

    eliminarUsuario(usuario: UsuarioMock): void {
        this.messageService.add({
            severity: 'warn',
            summary: 'Eliminar Usuario',
            detail: `Eliminando usuario: ${usuario.nombre}`
        });
    }

    // ========== MÉTODOS PARA PERMISOS ==========
    
    openPermisoForm(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Formulario Permiso',
            detail: 'Funcionalidad de formulario de permiso - Implementar en siguiente fase'
        });
    }

    editarPermiso(permiso: RolUsuarioMock): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Editar Permiso',
            detail: `Editando permiso: ${permiso.nombre_usuario} - ${permiso.nombre_rol}`
        });
    }

    eliminarPermiso(permiso: RolUsuarioMock): void {
        this.messageService.add({
            severity: 'warn',
            summary: 'Eliminar Permiso',
            detail: `Eliminando permiso: ${permiso.nombre_usuario} - ${permiso.nombre_rol}`
        });
    }

    // ========== MÉTODOS PARA ROLES ==========
    
    openRolForm(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Formulario Rol',
            detail: 'Funcionalidad de formulario de rol - Implementar en siguiente fase'
        });
    }

    editarRol(rol: RolMock): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Editar Rol',
            detail: `Editando rol: ${rol.nombre}`
        });
    }

    eliminarRol(rol: RolMock): void {
        this.messageService.add({
            severity: 'warn',
            summary: 'Eliminar Rol',
            detail: `Eliminando rol: ${rol.nombre}`
        });
    }

    // ========== MÉTODOS PARA ROL DETALLE ==========
    
    openRolDetalleForm(): void {
        if (!this.rolSeleccionado) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Seleccionar Rol',
                detail: 'Debe seleccionar un rol antes de agregar detalles'
            });
            return;
        }

        this.messageService.add({
            severity: 'info',
            summary: 'Formulario Rol Detalle',
            detail: `Agregando detalle para rol: ${this.rolSeleccionado.nombre}`
        });
    }

    editarRolDetalle(detalle: RolDetalleMock): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Editar Rol Detalle',
            detail: `Editando detalle: ${detalle.nombre_menu || 'Sin menú'}`
        });
    }

    eliminarRolDetalle(detalle: RolDetalleMock): void {
        this.messageService.add({
            severity: 'warn',
            summary: 'Eliminar Rol Detalle',
            detail: `Eliminando detalle: ${detalle.nombre_menu || 'Sin menú'}`
        });
    }
}
