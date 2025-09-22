import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
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
import { MenuService } from '../../../core/services/menu/menu.service';

// Interfaces del servicio
import { Usuario } from '../../../features/usuarios/models/usuario.interface';
import { Rol } from '../../../features/usuarios/models/rol.interface';
import { RolDetalle } from '../../../features/usuarios/models/rol-detalle.interface';
import { RolUsuario } from '../../../features/usuarios/models/rol-usuario.interface';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [
        CommonModule,
        TabsModule,
        ToastModule,
        TagModule,
        UsuariosTabComponent,
        PermisosTabComponent,
        RolesTabComponent,
        RolDetalleTabComponent
    ],
    providers: [MessageService],
    template: `
        <div class="card">
            <!-- Pestañas principales -->
            <p-tabs [value]="activeTabIndex" (onTabChange)="onTabChange($event)">
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
                        <span class="flex items-center gap-2">
                            <i class="pi pi-list mr-2"></i>
                            Detalles de Rol
                            <p-tag
                                *ngIf="rolSeleccionado"
                                [value]="rolSeleccionado.nombre"
                                severity="success"
                                class="text-xs">
                            </p-tag>
                        </span>
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
                            (rolClick)="onRolClick($event)"
                            (rolDobleClick)="onRolDobleClick($event)"
                        ></app-roles-tab>
                    </p-tabpanel>

                    <!-- Panel 4: Detalles de Rol -->
                    <p-tabpanel value="3">
                        <app-rol-detalle-tab
                            [rolSeleccionado]="rolSeleccionado"
                            [menusDisponibles]="menusDisponibles"
                            (rolDetallesChange)="onRolDetallesChange($event)"
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
    // Control de tabs y estado padre-hijo
    activeTabIndex: string = '0'; // manejar como string
    rolSeleccionado: Rol | null = null;

    // Datos principales
    usuarios: Usuario[] = [];
    roles: Rol[] = [];
    rolDetalles: RolDetalle[] = [];
    rolUsuarios: RolUsuario[] = [];

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
        private rolDetalleService: RolDetalleService,
        private menuService: MenuService
    ) {
        // Constructor sin logs
    }

    ngOnInit(): void {
        this.initializeMenus();
        this.cargarUsuarios();
        this.cargarRoles();
        this.cargarPermisos();
        this.cargarRolDetalle();
    }

    // Inicializar menús disponibles desde el servicio
    initializeMenus(): void {
        this.menuService.getMenuItems().subscribe({
            next: (response) => {
                if (response.statuscode === 200 && response.data) {
                    // Transformar los datos del servicio al formato esperado
                    this.menusDisponibles = response.data.map(menu => ({
                        id_menu: menu.id_menu,
                        nombre: `${menu.id_menu} - ${menu.label} - ${menu.id_padre}`,
                        descripcion: `ID Padre: ${menu.id_padre}`
                    }));
                } else {
                    this.loadFallbackMenus();
                }
            },
            error: (error) => {
                console.error('❌ Error cargando menús:', error);
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Menús no disponibles',
                    detail: 'Usando menús por defecto'
                });
                this.loadFallbackMenus();
            }
        });
    }

    // Método fallback con menús por defecto
    loadFallbackMenus(): void {
        this.menusDisponibles = [
            { id_menu: 1, nombre: '1 - Dashboard - 0', descripcion: 'ID Padre: 0' },
            { id_menu: 2, nombre: '2 - Usuarios - 0', descripcion: 'ID Padre: 0' },
            { id_menu: 3, nombre: '3 - Roles - 0', descripcion: 'ID Padre: 0' },
            { id_menu: 4, nombre: '4 - Permisos - 0', descripcion: 'ID Padre: 0' },
            { id_menu: 5, nombre: '5 - Configuración - 0', descripcion: 'ID Padre: 0' },
            { id_menu: 6, nombre: '6 - Reportes - 0', descripcion: 'ID Padre: 0' }
        ];
    }

    // ========== MÉTODOS DE CARGA DE DATOS ==========

    cargarUsuarios(): void {
        this.loadingUsuarios = true;

        this.usuarioService.getUsuarios().subscribe({
            next: (response: any) => {
                if (response && Array.isArray(response)) {
                    this.usuarios = response;
                } else {
                    this.cargarDatosMockUsuarios();
                }
            },
            error: (error: any) => {
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
        this.loadingRoles = true;

        this.rolService.getRoles().subscribe({
            next: (response: any) => {
                if (response && Array.isArray(response)) {
                    this.roles = response;
                } else {
                    this.cargarDatosMockRoles();
                }
            },
            error: (error: any) => {
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
        this.loadingPermisos = true;

        this.rolUsuarioService.getRelacionesRolUsuario().subscribe({
            next: (response: any) => {
                if (response && Array.isArray(response)) {
                    this.rolUsuarios = response;
                } else {
                    this.cargarDatosMockPermisos();
                }
            },
            error: (error: any) => {
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
        this.loadingRolDetalle = true;

        this.rolDetalleService.consultarDetalleRol({}).subscribe({
            next: (rolDetalles: RolDetalle[]) => {
                this.rolDetalles = rolDetalles;
                this.loadingRolDetalle = false;
            },
            error: (error) => {
                console.error('❌ Error cargando rol detalle:', error);

                // ⚠️ CRÍTICO: Usar mensaje específico del backend
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido cargando rol detalle';

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error cargando permisos',
                    detail: errorMessage,  // ← MENSAJE ESPECÍFICO DEL BACKEND
                    life: 5000
                });

                this.loadingRolDetalle = false;
            }
        });
    }

    // ========== MÉTODOS DE DATOS MOCK ==========

    cargarDatosMockUsuarios(): void {
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
        this.roles = [
            { id_rol: 1, nombre: 'Administrador', estado: 'A', fecha_m: '2024-09-01T00:00:00Z' },
            { id_rol: 2, nombre: 'Usuario', estado: 'A', fecha_m: '2024-09-01T00:00:00Z' },
            { id_rol: 3, nombre: 'Editor', estado: 'A', fecha_m: '2024-09-01T00:00:00Z' }
        ];
    }

    cargarDatosMockPermisos(): void {
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
        this.rolDetalles = [
            {
                id_rold: 1,
                id_rol: 1,
                ren: 1,
                id_menu: 1,
                swestado: 1,
                swlock: 0,
                fecha_m: '2024-09-01T00:00:00Z',
                nombre_rol: 'Administrador',
                nombre_menu: 'Dashboard'
            },
            {
                id_rold: 2,
                id_rol: 1,
                ren: 2,
                id_menu: 2,
                swestado: 1,
                swlock: 0,
                fecha_m: '2024-09-01T00:00:00Z',
                nombre_rol: 'Administrador',
                nombre_menu: 'Usuarios'
            },
            {
                id_rold: 3,
                id_rol: 2,
                ren: 1,
                id_menu: 1,
                swestado: 1,
                swlock: 0,
                fecha_m: '2024-09-01T00:00:00Z',
                nombre_rol: 'Usuario',
                nombre_menu: 'Dashboard'
            }
        ];
    }

    // ========== EVENT HANDLERS DE TABS ==========

    onTabChange(event: any): void {
        this.activeTabIndex = event.value; // sincronizar con el tab clicado

        // Si cambió al tab 3 (detalles de rol) y hay un rol seleccionado, forzar refresh
        if (this.activeTabIndex === '3' && this.rolSeleccionado) {
            // Forzar refresh del tab 3 enviando el rol nuevamente
            setTimeout(() => {
                this.rolSeleccionado = { ...this.rolSeleccionado! };
            }, 100);
        }
    }

    // ========== FUNCIONALIDAD PADRE-HIJO ==========

    onRolClick(rol: Rol): void {
        // Solo seleccionar el rol, sin cambiar de tab automáticamente
        this.rolSeleccionado = { ...rol };
    }

    onRolDobleClick(rol: Rol): void {
        // Mantener funcionalidad de doble click para cambiar de tab
        this.activeTabIndex = '2';
        setTimeout(() => {
            this.rolSeleccionado = { ...rol }; // clonar para forzar change detection
            this.activeTabIndex = '3'; // mover al tab 3
        }, 0);
    }

    // ========== EVENT HANDLERS DE COMPONENTES HIJO ==========

    onUsuariosChange(usuarios: Usuario[]): void {
        this.usuarios = usuarios;
    }

    onPermisosChange(permisos: RolUsuario[]): void {
        this.rolUsuarios = permisos;
    }

    onRolesChange(roles: Rol[]): void {
        this.roles = roles;
    }

    onRolDetallesChange(rolDetalles: RolDetalle[]): void {
        this.rolDetalles = rolDetalles;
    }
}
