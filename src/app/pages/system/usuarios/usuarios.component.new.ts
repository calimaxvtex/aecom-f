import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Componentes de tabs
import { UsuariosTabComponent } from './usuarios-tab.component';
import { PermisosTabComponent } from './permisos-tab.component';
import { RolesTabComponent } from './roles-tab.component';
import { RolDetalleTabComponent } from './rol-detalle-tab.component';

// Servicios
import { UsuarioService } from '../../../features/usuarios/services/usuario.service';
import { RolService } from '../../../features/usuarios/services/rol.service';
import { RolUsuarioService } from '../../../features/usuarios/services/rol-usuario.service';
import { RolDetalleService } from '../../../features/usuarios/services/rol-detalle.service';

// Interfaces
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
        TabsModule,
        ToastModule,
        UsuariosTabComponent,
        PermisosTabComponent,
        RolesTabComponent,
        RolDetalleTabComponent
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
                    <p-tab value="3">
                        <i class="pi pi-list mr-2"></i>
                        Detalles de Rol
                    </p-tab>
                </p-tablist>
                
                <p-tabpanels>
                    <!-- Panel 1: Usuarios -->
                    <p-tabpanel value="0">
                        <app-usuarios-tab
                            [usuarios]="usuarios"
                            (usuariosChange)="onUsuariosChange($event)"
                            (refreshUsuarios)="cargarUsuarios()"
                        ></app-usuarios-tab>
                    </p-tabpanel>

                    <!-- Panel 2: Permisos -->
                    <p-tabpanel value="1">
                        <app-permisos-tab
                            [permisos]="rolUsuarios"
                            [usuarios]="usuarios"
                            [roles]="roles"
                            (permisosChange)="onPermisosChange($event)"
                            (refreshPermisos)="cargarPermisos()"
                        ></app-permisos-tab>
                    </p-tabpanel>

                    <!-- Panel 3: Roles -->
                    <p-tabpanel value="2">
                        <app-roles-tab
                            [roles]="roles"
                            (rolesChange)="onRolesChange($event)"
                            (refreshRoles)="cargarRoles()"
                        ></app-roles-tab>
                    </p-tabpanel>

                    <!-- Panel 4: Detalles de Rol -->
                    <p-tabpanel value="3">
                        <app-rol-detalle-tab
                            [rolDetalles]="rolDetalles"
                            [roles]="roles"
                            [menusDisponibles]="menusDisponibles"
                            (rolDetallesChange)="onRolDetallesChange($event)"
                            (refreshRolDetalle)="cargarRolDetalle()"
                        ></app-rol-detalle-tab>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>

        <!-- Toast para mensajes globales -->
        <p-toast></p-toast>
    `
})
export class UsuariosComponent implements OnInit {
    // Datos principales
    usuarios: UsuarioMock[] = [];
    roles: RolMock[] = [];
    rolDetalles: RolDetalleMock[] = [];
    rolUsuarios: RolUsuarioMock[] = [];
    
    // Menús disponibles para selección
    menusDisponibles: any[] = [];

    // Variables para API
    loadingUsuarios = false;
    loadingRoles = false;
    loadingPermisos = false;
    loadingRolDetalle = false;

    constructor(
        private messageService: MessageService,
        private usuarioService: UsuarioService,
        private rolService: RolService,
        private rolUsuarioService: RolUsuarioService,
        private rolDetalleService: RolDetalleService
    ) {
        console.log('🔧 UsuariosComponent: Constructor ejecutado');
    }

    ngOnInit(): void {
        console.log('🚀 UsuariosComponent: ngOnInit ejecutado');
        this.initializeMenus();
        this.cargarUsuarios();
        this.cargarRoles();
        this.cargarPermisos();
        this.cargarRolDetalle();
    }

    // Inicializar menús disponibles
    initializeMenus(): void {
        this.menusDisponibles = [
            { id_menu: 1, nombre: 'Dashboard', descripcion: 'Panel principal' },
            { id_menu: 2, nombre: 'Usuarios', descripcion: 'Gestión de usuarios' },
            { id_menu: 3, nombre: 'Roles', descripcion: 'Gestión de roles' },
            { id_menu: 4, nombre: 'Permisos', descripcion: 'Gestión de permisos' },
            { id_menu: 5, nombre: 'Configuración', descripcion: 'Configuración del sistema' },
            { id_menu: 6, nombre: 'Reportes', descripcion: 'Generación de reportes' }
        ];
    }

    // ========== MÉTODOS DE CARGA DE DATOS ==========

    cargarUsuarios(): void {
        console.log('📥 Cargando usuarios...');
        this.loadingUsuarios = true;

        this.usuarioService.getAll().subscribe({
            next: (response: any) => {
                console.log('📥 Respuesta de usuarios:', response);
                
                if (response && response.data) {
                    const usuariosData = response.data;
                    if (Array.isArray(usuariosData) && usuariosData.length > 0) {
                        this.usuarios = usuariosData;
                        console.log('✅ Usuarios cargados:', this.usuarios.length, 'registros');
                    } else {
                        console.log('⚠️ No hay usuarios en la respuesta, usando datos mock');
                        this.cargarDatosMockUsuarios();
                    }
                } else {
                    console.log('⚠️ Respuesta inválida, usando datos mock');
                    this.cargarDatosMockUsuarios();
                }
            },
            error: (error) => {
                console.error('❌ Error cargando usuarios:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar usuarios'
                });
                
                // Fallback a datos mock después de un delay
                setTimeout(() => {
                    this.cargarDatosMockUsuarios();
                }, 2000);
            },
            complete: () => {
                this.loadingUsuarios = false;
            }
        });
    }

    cargarRoles(): void {
        console.log('📥 Cargando roles...');
        this.loadingRoles = true;

        this.rolService.getAll().subscribe({
            next: (response: any) => {
                console.log('📥 Respuesta de roles:', response);
                
                if (response && response.data) {
                    const rolesData = response.data;
                    if (Array.isArray(rolesData) && rolesData.length > 0) {
                        this.roles = rolesData;
                        console.log('✅ Roles cargados:', this.roles.length, 'registros');
                    } else {
                        console.log('⚠️ No hay roles en la respuesta, usando datos mock');
                        this.cargarDatosMockRoles();
                    }
                } else {
                    console.log('⚠️ Respuesta inválida, usando datos mock');
                    this.cargarDatosMockRoles();
                }
            },
            error: (error) => {
                console.error('❌ Error cargando roles:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar roles'
                });
                
                setTimeout(() => {
                    this.cargarDatosMockRoles();
                }, 2000);
            },
            complete: () => {
                this.loadingRoles = false;
            }
        });
    }

    cargarPermisos(): void {
        console.log('📥 Cargando permisos...');
        this.loadingPermisos = true;

        this.rolUsuarioService.getAll().subscribe({
            next: (response: any) => {
                console.log('📥 Respuesta de permisos:', response);
                
                if (response && response.data) {
                    const permisosData = response.data;
                    if (Array.isArray(permisosData) && permisosData.length > 0) {
                        this.rolUsuarios = permisosData;
                        console.log('✅ Permisos cargados:', this.rolUsuarios.length, 'registros');
                    } else {
                        console.log('⚠️ No hay permisos en la respuesta, usando datos mock');
                        this.cargarDatosMockPermisos();
                    }
                } else {
                    console.log('⚠️ Respuesta inválida, usando datos mock');
                    this.cargarDatosMockPermisos();
                }
            },
            error: (error) => {
                console.error('❌ Error cargando permisos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar permisos'
                });
                
                setTimeout(() => {
                    this.cargarDatosMockPermisos();
                }, 2000);
            },
            complete: () => {
                this.loadingPermisos = false;
            }
        });
    }

    cargarRolDetalle(): void {
        console.log('📥 Cargando rol detalle...');
        this.loadingRolDetalle = true;

        this.rolDetalleService.getAll().subscribe({
            next: (response: any) => {
                console.log('📥 Respuesta de rol detalle:', response);
                
                if (response && response.data) {
                    const rolDetallesData = response.data;
                    if (Array.isArray(rolDetallesData) && rolDetallesData.length > 0) {
                        this.rolDetalles = rolDetallesData;
                        console.log('✅ Rol detalle cargado:', this.rolDetalles.length, 'registros');
                    } else {
                        console.log('⚠️ No hay rol detalle en la respuesta, usando datos mock');
                        this.cargarDatosMockRolDetalle();
                    }
                } else {
                    console.log('⚠️ Respuesta inválida, usando datos mock');
                    this.cargarDatosMockRolDetalle();
                }
            },
            error: (error) => {
                console.error('❌ Error cargando rol detalle:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar detalles de rol'
                });
                
                setTimeout(() => {
                    this.cargarDatosMockRolDetalle();
                }, 2000);
            },
            complete: () => {
                this.loadingRolDetalle = false;
            }
        });
    }

    // ========== MÉTODOS DE DATOS MOCK ==========

    cargarDatosMockUsuarios(): void {
        console.log('📊 Cargando usuarios mock como fallback...');
        this.usuarios = [
            {
                id: 1,
                usuario: 1001,
                email: 'admin@calimax.com.mx',
                nombre: 'Administrador Sistema',
                estado: 1,
                logins: 45,
                intentos: 2,
                fecha_login: '2024-09-19T10:30:00Z',
                fecha_intento: '2024-09-18T15:20:00Z',
                fecha_m: '2024-09-01T00:00:00Z',
                fecha_a: '2024-09-01T00:00:00Z',
                fecha: '2024-09-01T00:00:00Z',
                id_session: 12345,
                logout: 0
            },
            {
                id: 2,
                usuario: 1002,
                email: 'usuario1@calimax.com.mx',
                nombre: 'Juan Pérez',
                estado: 1,
                logins: 12,
                intentos: 0,
                fecha_login: '2024-09-19T09:15:00Z',
                fecha_intento: null,
                fecha_m: '2024-09-01T00:00:00Z',
                fecha_a: '2024-09-01T00:00:00Z',
                fecha: '2024-09-01T00:00:00Z',
                id_session: 12346,
                logout: 0
            }
        ];
    }

    cargarDatosMockRoles(): void {
        console.log('📊 Cargando datos mock para roles...');
        this.roles = [
            { id_rol: 1, nombre: 'Administrador', estado: 'A', fecha_m: '2024-09-01T00:00:00Z' },
            { id_rol: 2, nombre: 'Usuario', estado: 'A', fecha_m: '2024-09-01T00:00:00Z' },
            { id_rol: 3, nombre: 'Editor', estado: 'A', fecha_m: '2024-09-01T00:00:00Z' }
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
                fecha_m: '2024-09-01T00:00:00Z',
                usu_m: 'admin',
                nombre_usuario: 'Administrador Sistema',
                email_usuario: 'admin@calimax.com.mx',
                nombre_rol: 'Administrador'
            },
            { 
                id: 2, 
                id_usu: 2, 
                id_rol: 2, 
                estado: 'A', 
                fecha_m: '2024-09-01T00:00:00Z',
                usu_m: 'admin',
                nombre_usuario: 'Juan Pérez',
                email_usuario: 'usuario1@calimax.com.mx',
                nombre_rol: 'Usuario'
            }
        ];
    }

    cargarDatosMockRolDetalle(): void {
        console.log('📊 Cargando datos mock para rol detalle...');
        this.rolDetalles = [
            {
                id_rold: 1,
                id_rol: 1,
                ren: 1,
                id_menu: 1,
                fecha_m: '2024-09-01T00:00:00Z',
                nombre_rol: 'Administrador',
                nombre_menu: 'Dashboard'
            },
            {
                id_rold: 2,
                id_rol: 1,
                ren: 2,
                id_menu: 2,
                fecha_m: '2024-09-01T00:00:00Z',
                nombre_rol: 'Administrador',
                nombre_menu: 'Usuarios'
            },
            {
                id_rold: 3,
                id_rol: 2,
                ren: 1,
                id_menu: 1,
                fecha_m: '2024-09-01T00:00:00Z',
                nombre_rol: 'Usuario',
                nombre_menu: 'Dashboard'
            }
        ];
    }

    // ========== EVENT HANDLERS DE TABS ==========

    onTabChange(event: any): void {
        console.log('🔄 Cambio de tab:', event.index);
        
        // Si se cambia al tab de Roles (índice 2), preseleccionar el primer rol
        if (event.index === 2) {
            console.log('🎯 Cambiando a tab Roles, preseleccionando primer rol...');
            this.onTabRolesActivated();
        }
    }

    onTabRolesActivated(): void {
        // Lógica específica cuando se activa el tab de roles
        if (this.roles.length > 0) {
            console.log('✅ Tab Roles activado, roles disponibles:', this.roles.length);
        }
    }

    // ========== EVENT HANDLERS DE COMPONENTES HIJO ==========

    onUsuariosChange(usuarios: UsuarioMock[]): void {
        this.usuarios = usuarios;
        console.log('🔄 Usuarios actualizados desde tab:', usuarios.length);
    }

    onPermisosChange(permisos: RolUsuarioMock[]): void {
        this.rolUsuarios = permisos;
        console.log('🔄 Permisos actualizados desde tab:', permisos.length);
    }

    onRolesChange(roles: RolMock[]): void {
        this.roles = roles;
        console.log('🔄 Roles actualizados desde tab:', roles.length);
    }

    onRolDetallesChange(rolDetalles: RolDetalleMock[]): void {
        this.rolDetalles = rolDetalles;
        console.log('🔄 Rol detalles actualizados desde tab:', rolDetalles.length);
    }
}
