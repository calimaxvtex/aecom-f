import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { ApiConfigService } from '../api/api-config.service';
import { MenuCrudResponse, MenuCrudSingleResponse, MenuFormItem, MenuCrudItem } from '../../models/menu.interface';
import { MOCK_API_RESPONSE, MOCK_MENU_DATA } from '../../../features/menu-admin/mock/menu-mock.data';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private useMockData = false; // 🌐 Usando API real - localhost:3000

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfigService
    ) {
        console.log('🚀 MenuService inicializado. useMockData:', this.useMockData);
        console.log('🌐 API URL:', this.apiConfig.getMenuCrudUrl());
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
        
        // Usar POST con action SL para obtener datos (funciona mejor que GET)
        return this.http.post<any>(
            this.apiConfig.getMenuCrudUrl(),
            { action: 'SL' }
        ).pipe(
            map((response: any) => {
                console.log('🌐 Respuesta de API real:', response);
                
                // Si la respuesta es un array, tomar el primer elemento
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'OK',
                        data: firstItem.data || []
                    } as MenuCrudResponse;
                }
                
                // Si la respuesta ya tiene el formato correcto
                if (response && typeof response === 'object') {
                    return {
                        statuscode: response.statuscode || 200,
                        mensaje: response.mensaje || 'OK',
                        data: response.data || []
                    } as MenuCrudResponse;
                }
                
                // Fallback por si la respuesta no tiene el formato esperado
                return {
                    statuscode: 200,
                    mensaje: 'Datos recibidos',
                    data: Array.isArray(response) ? response : []
                } as MenuCrudResponse;
            }),
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
        
        // Usar POST con action IN para crear nuevo item
        const payload = {
            ...item,
            action: 'IN'
        };

        return this.http.post<any>(
            this.apiConfig.getMenuCrudUrl(),
            payload
        ).pipe(
            map((response: any) => {
                console.log('🌐 Respuesta save API real:', response);
                
                // Manejar respuesta en formato array
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'OK',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : item as MenuCrudItem
                    } as MenuCrudSingleResponse;
                }
                
                return {
                    statuscode: 200,
                    mensaje: 'Item guardado',
                    data: item as MenuCrudItem
                } as MenuCrudSingleResponse;
            }),
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
        
        // Usar POST con action DL para eliminar item
        const payload = {
            action: 'DL',
            id_menu: id_menu
        };

        return this.http.post<any>(
            this.apiConfig.getMenuCrudUrl(),
            payload
        ).pipe(
            map((response: any) => {
                console.log('🌐 Respuesta delete API real:', response);
                
                // Manejar respuesta en formato array
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Eliminado',
                        data: { id_menu } as MenuCrudItem
                    } as MenuCrudSingleResponse;
                }
                
                return {
                    statuscode: 200,
                    mensaje: 'Item eliminado',
                    data: { id_menu } as MenuCrudItem
                } as MenuCrudSingleResponse;
            }),
            catchError(error => {
                console.error('Error en API real delete:', error);
                return throwError(() => new Error('Error al eliminar item en API'));
            })
        );
    }

    // ========== MÉTODOS ADICIONALES PARA API REAL ==========

    // GET - Obtener item específico por ID
    getMenuItem(id_menu: number): Observable<MenuCrudSingleResponse> {
        if (this.useMockData) {
            const mockItem = MOCK_MENU_DATA.find(item => item.id_menu === id_menu);
            const mockResponse: MenuCrudSingleResponse = {
                statuscode: mockItem ? 200 : 404,
                mensaje: mockItem ? 'Item encontrado (MOCK)' : 'Item no encontrado (MOCK)',
                data: mockItem || {} as MenuCrudItem
            };
            
            return of(mockResponse).pipe(
                delay(300),
                catchError(error => {
                    console.error('Error en mock getItem:', error);
                    return throwError(() => new Error('Error al obtener item mock'));
                })
            );
        }

        return this.http.get<MenuCrudSingleResponse>(
            `${this.apiConfig.getMenuCrudUrl()}/${id_menu}`
        ).pipe(
            catchError(error => {
                console.error('Error en API real getItem:', error);
                return throwError(() => new Error('Error al obtener item en API'));
            })
        );
    }

    // PATCH - Update de atributos específicos
    patchItem(id_menu: number, partialData: Partial<MenuFormItem>): Observable<MenuCrudSingleResponse> {
        if (this.useMockData) {
            const mockResponse: MenuCrudSingleResponse = {
                statuscode: 200,
                mensaje: `Item ${id_menu} actualizado parcialmente (MOCK)`,
                data: { id_menu, ...partialData } as MenuCrudItem
            };
            
            return of(mockResponse).pipe(
                delay(300),
                catchError(error => {
                    console.error('Error en mock patch:', error);
                    return throwError(() => new Error('Error al actualizar parcialmente item mock'));
                })
            );
        }

        return this.http.patch<MenuCrudSingleResponse>(
            `${this.apiConfig.getMenuCrudUrl()}/${id_menu}`,
            partialData
        ).pipe(
            catchError(error => {
                console.error('Error en API real patch:', error);
                return throwError(() => new Error('Error al actualizar parcialmente item en API'));
            })
        );
    }

    // PUT - Update completo
    updateItem(id_menu: number, item: MenuFormItem): Observable<MenuCrudSingleResponse> {
        if (this.useMockData) {
            const mockResponse: MenuCrudSingleResponse = {
                statuscode: 200,
                mensaje: `Item ${id_menu} actualizado completamente (MOCK)`,
                data: { id_menu, ...item } as MenuCrudItem
            };
            
            return of(mockResponse).pipe(
                delay(300),
                catchError(error => {
                    console.error('Error en mock update:', error);
                    return throwError(() => new Error('Error al actualizar item mock'));
                })
            );
        }

        return this.http.put<MenuCrudSingleResponse>(
            `${this.apiConfig.getMenuCrudUrl()}/${id_menu}`,
            item
        ).pipe(
            catchError(error => {
                console.error('Error en API real update:', error);
                return throwError(() => new Error('Error al actualizar item en API'));
            })
        );
    }

    // POST con action - Método utilitario universal
    executeAction(action: 'IN' | 'UP' | 'SL' | 'DL', data: any, id_menu?: number): Observable<any> {
        const payload = {
            ...data,
            action: action
        };

        if (id_menu) {
            payload.id_menu = id_menu;
        }

        if (this.useMockData) {
            let mockResponse: any;
            
            switch (action) {
                case 'IN': // Insert
                    mockResponse = {
                        statuscode: 201,
                        mensaje: 'Item insertado exitosamente (MOCK)',
                        data: { id_menu: Math.random() * 1000, ...data }
                    };
                    break;
                case 'UP': // Update
                    mockResponse = {
                        statuscode: 200,
                        mensaje: `Item ${id_menu} actualizado exitosamente (MOCK)`,
                        data: { id_menu, ...data }
                    };
                    break;
                case 'SL': // Select/Query
                    mockResponse = {
                        statuscode: 200,
                        mensaje: 'Consulta ejecutada exitosamente (MOCK)',
                        data: id_menu ? MOCK_MENU_DATA.find(item => item.id_menu === id_menu) : MOCK_MENU_DATA
                    };
                    break;
                case 'DL': // Delete
                    mockResponse = {
                        statuscode: 200,
                        mensaje: `Item ${id_menu} eliminado exitosamente (MOCK)`,
                        data: { id_menu }
                    };
                    break;
                default:
                    mockResponse = {
                        statuscode: 400,
                        mensaje: 'Acción no válida (MOCK)',
                        data: null
                    };
            }
            
            return of(mockResponse).pipe(
                delay(400),
                catchError(error => {
                    console.error('Error en mock action:', error);
                    return throwError(() => new Error(`Error en acción ${action} mock`));
                })
            );
        }

        return this.http.post<any>(
            this.apiConfig.getMenuCrudUrl(),
            payload
        ).pipe(
            catchError(error => {
                console.error(`Error en API real action ${action}:`, error);
                return throwError(() => new Error(`Error en acción ${action} en API`));
            })
        );
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    // Cambiar entre mock y API real
    setUseMockData(useMock: boolean): void {
        this.useMockData = useMock;
        console.log('🔄 Modo cambiado a:', useMock ? 'MOCK DATA' : 'API REAL');
    }

    // Verificar estado actual
    isUsingMockData(): boolean {
        return this.useMockData;
    }
}
