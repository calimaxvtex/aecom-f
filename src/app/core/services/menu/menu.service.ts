import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { ApiConfigService } from '../api/api-config.service';
import { MenuCrudResponse, MenuCrudSingleResponse, MenuFormItem, MenuCrudItem } from '../../models/menu.interface';
import { MOCK_API_RESPONSE, MOCK_MENU_DATA } from '../../../features/menu-admin/mock/menu-mock.data';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private useMockData = true; // Cambiar a false cuando el backend esté listo

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfigService
    ) {
        console.log('🚀 MenuService inicializado. useMockData:', this.useMockData);
    }

    // GET - Obtener todos los items
    getMenuItems(): Observable<MenuCrudResponse> {
        console.log('🔧 MenuService: useMockData =', this.useMockData);
        if (this.useMockData) {
            console.log('📦 Usando datos MOCK:', MOCK_API_RESPONSE);
            // Simular delay de red
            return of(MOCK_API_RESPONSE).pipe(
                delay(500),
                catchError(error => {
                    console.error('Error en datos mock:', error);
                    return throwError(() => new Error('Error al cargar datos mock'));
                })
            );
        }
        
        return this.http.get<MenuCrudResponse>(
            this.apiConfig.getMenuCrudUrl()
        ).pipe(
            catchError(error => {
                console.error('Error en API real:', error);
                // Fallback a datos mock en caso de error
                console.warn('Fallback a datos mock debido a error de API');
                return of(MOCK_API_RESPONSE);
            })
        );
    }

    // POST - Crear/Actualizar item (detecta automáticamente)
    saveItem(item: MenuFormItem): Observable<MenuCrudSingleResponse> {
        if (this.useMockData) {
            // Simular respuesta de guardado
            const mockResponse: MenuCrudSingleResponse = {
                statuscode: 200,
                mensaje: 'Item guardado exitosamente (MOCK)',
                data: item as MenuCrudItem
            };
            
            return of(mockResponse).pipe(
                delay(300),
                catchError(error => {
                    console.error('Error en mock save:', error);
                    return throwError(() => new Error('Error al guardar item mock'));
                })
            );
        }
        
        return this.http.post<MenuCrudSingleResponse>(
            this.apiConfig.getMenuCrudUrl(),
            item
        ).pipe(
            catchError(error => {
                console.error('Error en API real save:', error);
                return throwError(() => new Error('Error al guardar item en API'));
            })
        );
    }

    // DELETE - Eliminar item
    deleteItem(id_menu: number): Observable<MenuCrudSingleResponse> {
        if (this.useMockData) {
            // Simular respuesta de eliminación
            const mockResponse: MenuCrudSingleResponse = {
                statuscode: 200,
                mensaje: `Item ${id_menu} eliminado exitosamente (MOCK)`,
                data: { id_menu } as MenuCrudItem
            };
            
            return of(mockResponse).pipe(
                delay(200),
                catchError(error => {
                    console.error('Error en mock delete:', error);
                    return throwError(() => new Error('Error al eliminar item mock'));
                })
            );
        }
        
        return this.http.delete<MenuCrudSingleResponse>(
            `${this.apiConfig.getMenuCrudUrl()}/${id_menu}`
        ).pipe(
            catchError(error => {
                console.error('Error en API real delete:', error);
                return throwError(() => new Error('Error al eliminar item en API'));
            })
        );
    }
}
