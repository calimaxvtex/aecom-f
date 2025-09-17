import { Component, inject } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AppConfigurator } from '@/layout/components/app.configurator';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { UsuarioService } from '@/features/usuarios/services/usuario.service';

@Component({
    selector: 'app-login-2',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, ReactiveFormsModule, RouterModule, RippleModule, ToastModule, AppConfigurator, InputGroup, InputGroupAddon],
    providers: [MessageService],
    template: `<div class="h-screen flex w-full bg-surface-50 dark:bg-surface-950">
            <div class="flex flex-1 flex-col bg-surface-50 dark:bg-surface-950 items-center justify-center" style="flex: 0 0 30%">
                <div class="w-11/12 sm:w-120">
                    <div class="flex flex-col items-center">
                        <!-- Logo de Calimax en círculo azul - subido para mejor centrado -->
                        <div class="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-8 shadow-lg -mt-8">
                            <img 
                                src="/layout/images/logo/calimax-vector-logo.svg" 
                                alt="Calimax Logo" 
                                class="w-16 h-16 text-white"
                            />
                        </div>
                        <div class="text-center">
                            <h1 class="m-0 text-primary font-medium text-3xl">Welcome back!</h1>
                            <span class="block text-surface-700 dark:text-surface-100 mt-2">admin de Calimax Digital</span>
                        </div>
                    </div>
                    <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="flex flex-col gap-4 mt-12">
                        <p-input-group>
                            <p-inputgroup-addon>
                                <i class="pi pi-user"></i>
                            </p-inputgroup-addon>
                            <input 
                                pInputText 
                                type="text" 
                                formControlName="usuario"
                                placeholder="Usuario"
                                [class.ng-invalid]="loginForm.get('usuario')?.invalid && loginForm.get('usuario')?.touched"
                            />
                        </p-input-group>
                        <p-input-group>
                            <p-inputgroup-addon>
                                <i class="pi pi-key"></i>
                            </p-inputgroup-addon>
                            <input 
                                pInputText 
                                type="password" 
                                formControlName="password"
                                placeholder="Contraseña"
                                [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                            />
                        </p-input-group>
                        <div>
                            <button 
                                pButton 
                                pRipple 
                                type="submit"
                                class="w-full" 
                                label="INICIAR SESIÓN"
                                [loading]="isLoading"
                                [disabled]="loginForm.invalid || isLoading">
                            </button>
                        </div>
                        <div>
                            <button pButton pRipple class="w-full text-primary-500" text label="¿OLVIDASTE TU CONTRASEÑA?"></button>
                        </div>
                    </form>
                </div>
            </div>
            <div [style]="{ backgroundImage: 'url(/images/pages/calimax-login-bg.jpg)' }" class="hidden lg:flex items-center justify-center bg-cover" style="flex: 0 0 70%">
                <!-- Solo imagen de fondo de Calimax -->
            </div>
        </div>
        <app-configurator simple />
        <p-toast position="top-right"></p-toast>`
})
export class Login2 {
    loginForm: FormGroup;
    isLoading = false;

    private fb = inject(FormBuilder);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private usuarioService = inject(UsuarioService);

    constructor() {
        this.loginForm = this.fb.group({
            usuario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]], // Solo números
            password: ['', [Validators.required, Validators.minLength(1)]]
        });

        // Suscribirse al estado de carga del servicio de usuario
        // Nota: UsuarioService no tiene estado de carga, se maneja localmente
    }

    onLogin(): void {
        console.log('🔐 Iniciando proceso de login usando UsuarioService (Login2)');

        if (this.loginForm.valid) {
            this.isLoading = true;
            const formData = this.loginForm.value;
            const credentials = {
                usuario: formData.usuario,
                password: formData.password
            };

            console.log('📤 Enviando login con credenciales (Login2):', { ...credentials, password: '***' });

            this.usuarioService.login(credentials).subscribe({
                next: (response: any) => {
                    console.log('✅ Login exitoso a través de UsuarioService (Login2):', response);
                    this.isLoading = false;

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

                    // Redirigir al dashboard con recarga completa
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                },
                error: (error: any) => {
                    console.error('❌ Error en login a través de UsuarioService (Login2):', error);
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
