import { Component, inject } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
import { SessionService } from '@/core/services/session.service';

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
    apiUrl = 'http://localhost:3000/api/admusr/v1'; // API ID 1 - Usuarios

    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private sessionService = inject(SessionService);

    constructor() {
        this.loginForm = this.fb.group({
            usuario: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]], // Solo números
            password: ['', [Validators.required, Validators.minLength(1)]]
        });
    }

    onLogin(): void {
        console.log('🔐 Iniciando proceso de login (Login2)');
        
        if (this.loginForm.valid) {
            this.isLoading = true;
            const formData = this.loginForm.value;
            
            // Preparar payload para login
            const loginPayload = {
                usuario: formData.usuario,
                password: formData.password,
                action: 'LG' // Acción de login según especificación
            };
            
            console.log('📤 Enviando login a API (Login2):', loginPayload);
            
            this.http.post(this.apiUrl, loginPayload).subscribe({
                next: (response: any) => {
                    console.log('✅ Login exitoso - RESPUESTA (Login2):', response);
                    this.isLoading = false;
                    
                    // Procesar respuesta
                    this.handleLoginResponse(response);
                },
                error: (error: any) => {
                    console.error('❌ Error en login (Login2):', error);
                    this.isLoading = false;
                    
                    // Mostrar mensaje de error
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error de Autenticación',
                        detail: error.error?.mensaje || 'Usuario o contraseña incorrectos',
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

    private handleLoginResponse(response: any): void {
        console.log('🔍 Procesando respuesta de login (Login2):', response);
        console.log('🔍 Tipo de respuesta:', typeof response);
        console.log('🔍 Es array?:', Array.isArray(response));
        
        // Analizar estructura de respuesta (manejo robusto de diferentes formatos)
        let loginData = null;
        let responseMessage = '';
        
        try {
            if (Array.isArray(response) && response.length > 0) {
                console.log('📦 Respuesta viene en array, procesando primer elemento...');
                const firstItem = response[0];
                console.log('📦 Primer elemento:', firstItem);
                
                if (firstItem && firstItem.statuscode === 200) {
                    responseMessage = firstItem.mensaje || 'Login exitoso';
                    
                    if (firstItem.data) {
                        // Si data es array, tomar primer elemento, si no, tomar directo
                        loginData = Array.isArray(firstItem.data) ? firstItem.data[0] : firstItem.data;
                        console.log('✅ Login data extraído del array:', loginData);
                    }
                } else {
                    console.log('❌ Error en statuscode del array:', firstItem?.statuscode);
                    responseMessage = firstItem?.mensaje || 'Error en autenticación';
                }
            } else if (response && typeof response === 'object') {
                console.log('📦 Respuesta viene como objeto directo...');
                
                if (response.statuscode === 200) {
                    responseMessage = response.mensaje || 'Login exitoso';
                    
                    if (response.data) {
                        loginData = Array.isArray(response.data) ? response.data[0] : response.data;
                        console.log('✅ Login data extraído del objeto:', loginData);
                    }
                } else {
                    console.log('❌ Error en statuscode del objeto:', response.statuscode);
                    responseMessage = response.mensaje || 'Error en autenticación';
                }
            } else {
                console.log('❌ Formato de respuesta no reconocido:', response);
            }
            
            // Verificar si obtuvimos datos válidos del usuario
            if (loginData && (loginData.id || loginData.usuario)) {
                console.log('✅ Login exitoso para usuario (Login2):', loginData);
                console.log('🔍 id_session recibido (Login2):', loginData.id_session);
                
                // Establecer sesión usando SessionService
                this.sessionService.setSession(loginData);
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Login Exitoso',
                    detail: `Bienvenido ${loginData.nombre || loginData.usuario || 'Usuario'}`,
                    life: 3000
                });
                
                // Redirigir al dashboard
                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 1000);
            } else {
                console.error('❌ No se encontraron datos válidos de usuario');
                console.error('❌ LoginData recibido:', loginData);
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de Login',
                    detail: responseMessage || 'Usuario o contraseña incorrectos',
                    life: 5000
                });
            }
        } catch (error) {
            console.error('❌ Error procesando respuesta de login (Login2):', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Sistema',
                detail: 'Error procesando respuesta del servidor',
                life: 5000
            });
        }
    }
}
