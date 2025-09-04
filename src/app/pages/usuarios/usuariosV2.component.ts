import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

// PrimeNG v20 Module Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

// Interfaces existentes (reutilizadas)
import { Usuario } from '@/features/usuarios/models/usuario.interface';

@Component({
    standalone: true,
    selector: 'app-usuarios-v2',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TagModule,
        TooltipModule,
        ToastModule,
        TabsModule,
        CheckboxModule,
        CardModule,
        SelectModule
    ],
    templateUrl: './usuariosV2.component.html',
    styles: [`
        :host {
            display: block;
            height: 100%;
        }
        
        .p-tabview {
            height: 100%;
        }
        
        .p-tabview-panels {
            padding: 1rem 0;
        }

        .field label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #374151;
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .p-toast {
            z-index: 9999;
        }

        .p-button.w-auto {
            width: auto;
        }
    `],
    providers: [MessageService]
})
export class UsuariosV2Component implements OnInit {
    // Variables para gestión de usuarios
    usuarios: Usuario[] = [];
    loadingUsuarios = false;
    
    // Variables para formularios
    showUsuarioForm = false;
    isEditMode = false;
    usuarioForm!: FormGroup;
    usuarioToEdit: Usuario | null = null;

    // API URLs (reutilizadas del componente original)
    apiUrl = 'http://localhost:3000/api/admusr/v1';

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
        private formBuilder: FormBuilder
    ) {
        this.initializeUsuarioForm();
    }

    ngOnInit(): void {
        console.log('🚀 UsuariosV2Component: Iniciando componente standalone...');
        this.cargarUsuarios();
    }

    initializeUsuarioForm(): void {
        this.usuarioForm = this.formBuilder.group({
            usuario: ['', Validators.required],
            nombre: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    cargarUsuarios(): void {
        console.log('📊 V2: Cargando usuarios desde API...');
        this.loadingUsuarios = true;
        
        const payload = { action: 'SL' };
        
        this.http.post(this.apiUrl, payload).subscribe({
            next: (response: any) => {
                console.log('✅ V2: Respuesta completa de API:', response);
                console.log('✅ V2: Tipo de respuesta:', typeof response);
                console.log('✅ V2: Es array?', Array.isArray(response));
                
                let usuariosData: Usuario[] = [];
                
                // Manejo robusto de diferentes formatos de respuesta
                if (Array.isArray(response)) {
                    console.log('📊 V2: Procesando como array...');
                    if (response.length > 0 && response[0].data) {
                        usuariosData = response[0].data;
                        console.log('📊 V2: Tomando datos de response[0].data:', usuariosData.length, 'usuarios');
                    } else {
                        usuariosData = response;
                        console.log('📊 V2: Tomando datos del array directo:', usuariosData.length, 'usuarios');
                    }
                } else if (response.data) {
                    usuariosData = response.data;
                    console.log('📊 V2: Tomando datos de response.data:', usuariosData.length, 'usuarios');
                } else {
                    usuariosData = [];
                    console.log('⚠️ V2: No se encontraron datos, usando array vacío');
                }

                console.log('📋 V2: Datos finales a asignar:', usuariosData);

                setTimeout(() => {
                    this.usuarios = usuariosData;
                    this.loadingUsuarios = false;
                    console.log('✅ V2: Usuarios asignados a la tabla:', this.usuarios.length);
                }, 0);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Usuarios V2',
                    detail: `${usuariosData.length} usuarios cargados exitosamente`,
                    life: 3000
                });
            },
            error: (error) => {
                console.error('❌ V2: Error al cargar usuarios:', error);
                this.loadingUsuarios = false;
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error V2',
                    detail: 'No se pudieron cargar los usuarios. Usando datos de prueba.',
                    life: 5000
                });
                
                // Fallback a datos mock
                this.usuarios = [
                    {
                        id: 1,
                        usuario: 1001,
                        email: 'admin@empresa.com',
                        nombre: 'Admin V2',
                        estado: 1,
                        logins: 2,
                        intentos: 0,
                        fecha_login: '2025-08-29T16:49:41.523',
                        fecha_intento: null,
                        fecha_m: '2025-08-29T16:52:57.610',
                        fecha_a: '2025-08-29T16:47:37.480',
                        fecha: '2025-08-29',
                        id_session: 2,
                        logout: 0
                    }
                ];
            }
        });
    }

    editarUsuario(usuario: Usuario): void {
        console.log('✏️ V2: Editando usuario:', usuario.nombre);
        this.isEditMode = true;
        this.usuarioToEdit = usuario;
        this.usuarioForm.patchValue({
            usuario: usuario.usuario,
            nombre: usuario.nombre,
            email: usuario.email
        });
        this.showUsuarioForm = true;
    }

    eliminarUsuario(usuario: Usuario): void {
        console.log('🗑️ V2: Eliminar usuario:', usuario.nombre);
        // TODO: Implementar confirmación y API call
        this.messageService.add({
            severity: 'info',
            summary: 'Función V2',
            detail: 'Eliminar usuario - Próximamente en standalone',
            life: 3000
        });
    }

    saveUsuario(): void {
        if (this.usuarioForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario Inválido',
                detail: 'Por favor complete todos los campos requeridos',
                life: 3000
            });
            return;
        }

        console.log('💾 V2: Guardando usuario...');
        // TODO: Implementar API call para guardar
        
        this.messageService.add({
            severity: 'info',
            summary: 'Función V2',
            detail: 'Guardar usuario - Próximamente en standalone',
            life: 3000
        });
        
        this.closeUsuarioForm();
    }

    closeUsuarioForm(): void {
        this.showUsuarioForm = false;
        this.isEditMode = false;
        this.usuarioToEdit = null;
        this.usuarioForm.reset();
    }
}
