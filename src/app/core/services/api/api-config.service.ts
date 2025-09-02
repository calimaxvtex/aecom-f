import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../constants/api.constants';

@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {
    private baseUrl = API_CONFIG.BASE_URL;
    
    getBaseUrl(): string {
        return this.baseUrl;
    }
    
    getMenuCrudUrl(): string {
        return `${this.baseUrl}${API_CONFIG.ENDPOINTS.MENU.CRUD}`;
    }
    
    // Método para cambiar URL en tiempo de ejecución
    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }
}


