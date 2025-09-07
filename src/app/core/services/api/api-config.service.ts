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
                        this.endpoints.push({
                            id: controller.id_sp,
                            name: controller.route,
                            url: controller.fullRoute
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
}


