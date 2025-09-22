import { provideHttpClient, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withDebugTracing } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app/app.routes';
import Material from '@primeuix/themes/material';
import { definePreset } from '@primeuix/themes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiMonitorInterceptor } from './app/api-monitor.interceptor';
import { SimpleTestInterceptor } from './app/simple-test.interceptor';
import { ApiConfigService } from './app/core/services/api/api-config.service';
import { environment } from '../src/environments/environment';
// import { HttpLoggingInterceptor } from './core/interceptors/http-logging.interceptor';

// console.log('🔍 App Config: ApiMonitorInterceptor importado:', ApiMonitorInterceptor);
// console.log('🔍 App Config: SimpleTestInterceptor importado:', SimpleTestInterceptor);

// Función factory para inicializar los endpoints
function initializeApiConfig(apiConfigService: ApiConfigService) {
    return (): Promise<any> => {
        // console.log('🚀 Inicializando configuración de API...');
        return new Promise((resolve, reject) => {
            apiConfigService.getspConfis().subscribe({
                next: (response) => {
                    console.log('✅ Endpoints cargados:', response.controllers?.length || 0);
                    resolve(response);
                },
                error: (error) => {
                    console.error('❌ Error cargando endpoints:', error instanceof Error ? error.message : String(error));
                    resolve(null);
                }
            });
        });
    };
}

const MyPreset = definePreset(Material, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        }
    }
});

export const appConfig: ApplicationConfig = {
    providers: [
        // Log para verificar que se está ejecutando
        {
            provide: 'APP_CONFIG_DEBUG',
            useValue: 'App config ejecutándose'
        },
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation(),
            // withDebugTracing() // 🔍 Debug deshabilitado
        ),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({
            ripple: true,
            inputStyle: 'filled',
            theme: { preset: MyPreset, options: { darkModeSelector: '.app-dark' } },
            // Configuración adicional para reducir warnings NG0912
            csp: {
                nonce: undefined
            },
            zIndex: {
                modal: 1100,
                overlay: 1000,
                menu: 1000,
                tooltip: 1100
            }
        }),
        // Servicios globales de PrimeNG necesarios para tablas, diálogos, etc.
        ConfirmationService,
        MessageService,
        DialogService,

        // 🔥 APP_INITIALIZER para cargar endpoints al inicio
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApiConfig,
            deps: [ApiConfigService],
            multi: true
        },

        // Interceptor simple para testing (solo en desarrollo)
        ...(environment.enableLogs ? [{
            provide: HTTP_INTERCEPTORS,
            useClass: SimpleTestInterceptor,
            multi: true
        }] : []),
        
        // Interceptor para monitoreo de APIs (solo si está habilitado)
        ...(environment.enableApiMonitor ? [{
            provide: HTTP_INTERCEPTORS,
            useClass: ApiMonitorInterceptor,
            multi: true
        }] : [])
        // {
        //     provide: HTTP_INTERCEPTORS,
        //     useClass: HttpLoggingInterceptor,
        //     multi: true
        // }
    ]
};
