import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AppConfigurator } from '@/layout/components/app.configurator';
import { UsuarioService } from '@/features/usuarios/services/usuario.service';
import { SessionService } from '@/core/services/session.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, ReactiveFormsModule, RouterModule, RippleModule, InputIcon, IconField, ToastModule, AppConfigurator],
    providers: [MessageService],
    template: `<div class="min-h-screen flex flex-col bg-cover relative" [style]="{ backgroundImage: 'url(/images/pages/calimax-login-bg.jpg)' }">
            <div class="self-center mt-auto mb-auto">
                <div class="text-center z-50 flex flex-col border rounded-md border-surface bg-surface-0 dark:bg-surface-900 p-12">
                    <!-- Logo de Calimax en círculo azul -->
                    <div class="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                        <img 
                            src="/layout/images/logo/calimax-vector-logo.svg" 
                            alt="Calimax Logo" 
                            class="w-16 h-16 text-white"
                        />
                    </div>
                    
                    <span class="text-2xl font-semibold">Welcome</span>
                    <div class="text-muted-color mb-12 px-12">admin de Calimax Digital</div>

                    <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="w-full flex flex-col gap-4 px-4">
                        <p-icon-field>
                            <p-inputicon class="pi pi-user" />
                            <input 
                                pInputText 
                                class="w-full" 
                                placeholder="Número de empleado"
                                formControlName="usuario"
                                [class.ng-invalid]="loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched"
                            />
                        </p-icon-field>

                        <p-icon-field>
                            <p-inputicon class="pi pi-key" />
                            <input 
                                pInputText 
                                type="password" 
                                class="w-full" 
                                placeholder="Contraseña"
                                formControlName="password"
                                [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                            />
                        </p-icon-field>
                        
                        <button 
                            pButton 
                            pRipple 
                            type="submit"
                            class="w-full mt-4 px-4" 
                            label="INICIAR SESIÓN"
                            [loading]="isLoading"
                            [disabled]="loginForm.invalid || isLoading">
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <app-configurator simple />
        <p-toast position="top-right"></p-toast>`
})
export class Login implements OnInit {
    loginForm: FormGroup;
    isLoading = false;

    private fb = inject(FormBuilder);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private usuarioService = inject(UsuarioService);
    private sessionService = inject(SessionService);

    constructor() {
        this.loginForm = this.fb.group({
            usuario: ['', [Validators.required]], // Simplificado temporalmente
            password: ['', [Validators.required]] // Simplificado temporalmente
        });

        // Suscribirse al estado de carga del servicio de usuario
        // Nota: UsuarioService no tiene estado de carga, se maneja localmente

        // Monitoreo de cambios en el formulario (sin logs de debug)
    }

    ngOnInit(): void {
        // Verificar si el usuario ya está autenticado
        if (this.sessionService.isLoggedIn()) {
            console.log('🔄 Usuario ya autenticado, redirigiendo al dashboard');
            this.router.navigate(['/dashboards']);
        }
    }

    onLogin(): void {
        if (this.loginForm.valid) {
            this.isLoading = true;
            const formData = this.loginForm.value;
            const credentials = {
                usuario: formData.usuario,
                password: formData.password
            };

            this.usuarioService.login(credentials).subscribe({
                next: async (response: any) => {
                    // Mostrar mensaje de éxito
                    let userName = 'Usuario';
                    if (Array.isArray(response.data) && response.data.length > 0) {
                        userName = response.data[0]?.nombre || response.data[0]?.usuario || 'Usuario';
                    } else if (response.data) {
                        userName = response.data.nombre || response.data.usuario || 'Usuario';
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Login Exitoso',
                        detail: `Bienvenido ${userName}`,
                        life: 3000
                    });

                    // Esperar carga completa del menú antes de continuar
                    try {
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        // Continuar si hay error esperando menú
                    }

                    this.isLoading = false;

                    // Redirigir al dashboard
                    setTimeout(() => {
                        this.router.navigate(['/dashboards']);
                    }, 1000);
                },
                error: (error: any) => {
                    console.error('❌ Error en login:', error);
                    this.isLoading = false;

                    // Mostrar mensaje de error
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de Autenticación',
                        detail: error.message || 'Usuario o contraseña incorrectos',
                        life: 5000
                    });
                }
            });
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Campos Requeridos',
                detail: 'Por favor complete todos los campos',
                life: 3000
            });
        }
    }

}
