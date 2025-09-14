import { Component, inject } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
import { SessionService } from '@/core/services/session.service';
import { MenuLoaderService } from '@/core/services/menu/menu-loader.service';

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
export class Login {
    loginForm: FormGroup;
    isLoading = false;
    apiUrl = 'http://localhost:3000/api/admusr/v1'; // API ID 1 - Usuarios

    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private sessionService = inject(SessionService);
    private menuLoaderService = inject(MenuLoaderService);

    constructor() {
        this.loginForm = this.fb.group({
            usuario: ['', [Validators.required]], // Simplificado temporalmente
            password: ['', [Validators.required]] // Simplificado temporalmente
        });

        // Debug: Monitorear cambios en el formulario
        this.loginForm.valueChanges.subscribe(value => {
            console.log('🔍 Form values:', value);
            console.log('🔍 Form valid:', this.loginForm.valid);
            console.log('🔍 Usuario errors:', this.loginForm.get('usuario')?.errors);
            console.log('🔍 Password errors:', this.loginForm.get('password')?.errors);
        });
    }

    onLogin(): void {
        console.log('🔐 Iniciando proceso de login');
        
        if (this.loginForm.valid) {
            this.isLoading = true;
            const formData = this.loginForm.value;
            
            // Preparar payload para login
            const loginPayload = {
                usuario: formData.usuario,
                password: formData.password,
                action: 'LG' // Acción de login según especificación
            };
            
            console.log('📤 Enviando login a API:', loginPayload);
            
            this.http.post(this.apiUrl, loginPayload).subscribe({
                next: (response: any) => {
                    console.log('✅ Login exitoso - RESPUESTA:', response);
                    this.isLoading = false;
                    
                    // Procesar respuesta
                    this.handleLoginResponse(response);
                },
                error: (error: any) => {
                    console.error('❌ Error en login:', error);
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
        console.log('🔍 Procesando respuesta de login:', response);
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
                console.log('✅ Login exitoso para usuario:', loginData);
                console.log('🔍 id_session recibido:', loginData.id_session);
                
                // Establecer sesión usando SessionService
                this.sessionService.setSession(loginData);

                // Actualizar menú dinámico después del login
                this.updateMenuAfterLogin();

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
            console.error('❌ Error procesando respuesta de login:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Sistema',
                detail: 'Error procesando respuesta del servidor',
                life: 5000
            });
        }
    }

    /**
     * Actualizar menú dinámico después de login exitoso
     */
    private async updateMenuAfterLogin(): Promise<void> {
        try {
            await this.menuLoaderService.updateMenuOnLogin();
        } catch (error) {
            // Usar menú cacheado si falla
        }
    }
}
