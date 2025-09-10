import { Injectable } from '@angular/core';
import { API_CONFIG, API_URLS } from '../../constants/api.constants';
import { API_URLS as ApiUrlsType } from '../../constants/api.constants';
import { SpConfigResponse, ApiEndpoint, SpConfigController } from '../../models/api-config.interface';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {
    private baseUrl = API_CONFIG.BASE_URL;
    private spConfigURL = API_URLS.APIC_CONFIG;


    // Arreglo local para almacenar los endpoints
    private endpoints: ApiEndpoint[] = [];

    // Subject para notificar cuando los endpoints están listos
    private endpointsLoaded$ = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
        console.log('🔧 ApiConfigService inicializado');
    }


    // Nuevo método para descargar y almacenar endpoints
    getspConfis(): Observable<SpConfigResponse> {
        return this.http.get<SpConfigResponse>(this.spConfigURL).pipe(
            tap((response: SpConfigResponse) => {

                if (response.controllers && response.controllers.length > 0) {
                    // Limpiar el arreglo actual
                    this.endpoints = [];
                    
                    // Mapear y guardar solo los campos que nos interesan
                    response.controllers.forEach((controller: SpConfigController) => {
                        // 🔑 REGLA PRINCIPAL: URL final = URL base + fullRoute (siempre)
                        // Usar exactamente el fullRoute del SpConfigController (dinámico)
                        let finalUrl: string;

                        // Si fullRoute ya incluye protocolo completo (http/https), úsalo tal cual
                        if (controller.fullRoute.startsWith('http://') || controller.fullRoute.startsWith('https://')) {
                            finalUrl = controller.fullRoute;
                            console.log('🌐 FullRoute tiene protocolo completo, usando tal cual');
                        } else {
                            // 🔑 URL FINAL = URL BASE + FULLROUTE (siempre)
                            // Asegurar que fullRoute tenga barra inicial para concatenación correcta
                            const fullRouteWithSlash = controller.fullRoute.startsWith('/')
                                ? controller.fullRoute
                                : `/${controller.fullRoute}`;

                            // 🔑 CONCATENACIÓN EXPLÍCITA: baseUrl + fullRoute
                            finalUrl = this.baseUrl + fullRouteWithSlash;

                            console.log('🔗 Construyendo URL final:', {
                                baseUrl: this.baseUrl,
                                fullRoute: controller.fullRoute,
                                fullRouteWithSlash: fullRouteWithSlash,
                                operacion: `${this.baseUrl} + ${fullRouteWithSlash}`,
                                resultado: finalUrl
                            });
                        }

                        console.log(`🔗 Endpoint configurado (DINÁMICO):`, {
                            id: controller.id_sp,
                            name: controller.route,
                            fullRouteOriginal: controller.fullRoute,
                            urlFinal: finalUrl,
                            usaBaseUrl: !controller.fullRoute.startsWith('http')
                        });

                        this.endpoints.push({
                            id: controller.id_sp,
                            name: controller.route,
                            url: finalUrl
                        });
                    });

                    // Notificar que los endpoints están cargados
                    this.endpointsLoaded$.next(true);

                    console.log('✅ Endpoints cargados:', this.endpoints.length);
                }
            })
        );
    }


    // Método para obtener un endpoint por nombre
    getEndpointByName(name: string): ApiEndpoint | undefined {
        return this.endpoints.find(endpoint => endpoint.name === name);
    }

    // Método para obtener un endpoint por ID
    getEndpointById(id: number): ApiEndpoint | undefined {
        return this.endpoints.find(endpoint => endpoint.id === id);
    }

    // Método para obtener todos los endpoints
    getAllEndpoints(): ApiEndpoint[] {
        return [...this.endpoints];
    }

    // Método para verificar si los endpoints están cargados
    hasEndpoints(): boolean {
        return this.endpoints.length > 0;
    }

    // Observable para saber cuando los endpoints están listos
    getEndpointsLoaded$(): Observable<boolean> {
        return this.endpointsLoaded$.asObservable();
    }

    // Método para esperar a que los endpoints estén cargados
    waitForEndpoints(): Promise<void> {
        return new Promise((resolve) => {
            if (this.hasEndpoints()) {
                resolve();
            } else {
                this.endpointsLoaded$.subscribe(loaded => {
                    if (loaded) {
                        resolve();
                    }
                });
            }
        });
    }
    
    getBaseUrl(): string {
        return this.baseUrl;
    }
    
    getMenuCrudUrl(): string {
        return `${this.baseUrl}${API_CONFIG.ENDPOINTS.MENU.CRUD}`;
    }

    getCollCrudUrl(): string {
        return API_URLS.COLL_CRUD;
    }

    getColldCrudUrl(): string {
        return API_URLS.COLLD_CRUD;
    }
    
    // Método para cambiar URL en tiempo de ejecución
    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    // Método de debug para verificar configuración de URLs
    debugUrls(): void {
        console.log('🔧 ApiConfigService - Configuración DINÁMICA de URLs:');
        console.log('📍 Base URL configurada:', this.baseUrl);
        console.log('📊 Endpoints cargados desde SpConfigController:', this.endpoints.length);
        console.log('🔑 REGLA PRINCIPAL: URL final = BaseURL + fullRoute (siempre)');

        if (this.endpoints.length > 0) {
            console.log('📋 Lista de endpoints DINÁMICOS (construidos con baseUrl + fullRoute):');
            this.endpoints.forEach(endpoint => {
                console.log(`  ID ${endpoint.id}: ${endpoint.url}`);
                console.log(`    └─ Construcción: ${this.baseUrl} + ${endpoint.name}`);
            });
        } else {
            console.log('⚠️ No hay endpoints cargados aún. Ejecuta getspConfis() primero.');
        }

        // Verificar endpoint específico para productos
        const productosEndpoint = this.getEndpointById(12);
        if (productosEndpoint) {
            console.log('🎯 Endpoint de productos (ID 12) - DINÁMICO:');
            console.log('   URL final:', productosEndpoint.url);
            console.log('   Construcción:', `${this.baseUrl} + ${productosEndpoint.name}`);
        } else {
            console.log('❌ Endpoint de productos (ID 12) no encontrado en SpConfigController');
        }

        console.log('💡 Las URLs se construyen dinámicamente: BaseURL + fullRoute del SpConfigController');
    }
}


