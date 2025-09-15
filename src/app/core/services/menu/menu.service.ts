import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiConfigService } from '../api/api-config.service';
import { SessionService } from '../session.service';
import { MenuCrudResponse, MenuCrudSingleResponse, MenuFormItem, MenuCrudItem, MenuApiResponse, MenuHttpResponse } from '../../models/menu.interface';

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private readonly MENU_ENDPOINT_ID = 3; // ID del endpoint de menú en la configuración

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfigService,
        private sessionService: SessionService
    ) {
        // console.log('🚀 MenuService inicializado');
        // console.log('🔗 Usando endpoint ID:', this.MENU_ENDPOINT_ID);
    }

    // Obtener URL del endpoint de menú
    private getMenuUrl(): Observable<string> {
        return this.apiConfig.getEndpointsLoaded$().pipe(
            switchMap(loaded => {
                if (!loaded) {
                    return throwError(() => new Error('Endpoints no cargados'));
                }
                
                const endpoint = this.apiConfig.getEndpointById(this.MENU_ENDPOINT_ID);
                if (!endpoint) {
                    return throwError(() => new Error(`Endpoint ID ${this.MENU_ENDPOINT_ID} no encontrado`));
                }
                
                // console.log('🔗 URL del menú obtenida:', endpoint.url);
                return [endpoint.url];
            })
        );
    }

    // GET - Obtener todos los items
    getMenuItems(): Observable<MenuCrudResponse> {
        // console.log('📋 Obteniendo items de menú...');

        return this.getMenuUrl().pipe(
            switchMap(url => {
                // Usar POST con action SL para obtener datos (requiere sesión según reglas)
                return this.http.post<any>(url, {
                    action: 'SL',
                    ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
                });
            }),
            map((response: any) => {
                // console.log('🌐 Respuesta de API:', response);
                
                // Si la respuesta es un array, tomar el primer elemento
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'OK',
                        active: firstItem.active || 1,
                        data: firstItem.data || []
                    } as MenuCrudResponse;
                }
                
                // Si la respuesta es un objeto directo
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'OK',
                    active: response.active || 1,
                    data: response.data || response || []
                } as MenuCrudResponse;
            }),
            catchError(error => {
                console.error('Error al obtener items de menú:', error);
                return throwError(() => new Error('Error al cargar items de menú'));
            })
        );
    }

    // POST - Crear/Actualizar item (detecta automáticamente)
    saveItem(item: MenuFormItem): Observable<MenuCrudSingleResponse> {
        // Determinar si es creación o actualización
        const hasId = item.id_menu && item.id_menu !== null && item.id_menu !== undefined;
        const action = hasId ? 'UP' : 'IN';
        
        // console.log('🔍 Determinando acción:', {
        //     id_menu: item.id_menu,
        //     hasId,
        //     action,
        //     itemKeys: Object.keys(item)
        // });
        
        const payload = {
            action: action,
            ...item,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        // console.log(`🚀 ${action === 'IN' ? 'Creando' : 'Actualizando'} item:`, payload);

        return this.getMenuUrl().pipe(
            switchMap(url => {
                return this.http.post<any>(url, payload);
            }),
            map((response: any) => {
                // console.log('🌐 Respuesta save completa:', response);

                // Manejar respuesta en formato array
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];

                    // console.log('📋 Procesando respuesta array:', firstItem);

                    // Verificar si el backend devolvió un error
                    if (firstItem.statuscode && firstItem.statuscode !== 200) {
                        // console.log('❌ Backend devolvió error en array:', firstItem);
                        throw new Error(firstItem.mensaje || 'Error del servidor');
                    }
                    
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Item guardado exitosamente',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : item as MenuCrudItem
                    } as MenuCrudSingleResponse;
                }
                
                // Si la respuesta es un objeto directo
                // console.log('📋 Procesando respuesta directa:', response);

                // Verificar error en respuesta directa
                if (response.statuscode && response.statuscode !== 200) {
                    // console.log('❌ Backend devolvió error directo:', response);
                    throw new Error(response.mensaje || 'Error del servidor');
                }
                
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Item guardado exitosamente',
                    data: response.data || item as MenuCrudItem
                } as MenuCrudSingleResponse;
            }),
            catchError(error => {
                // console.error('❌ Error completo al guardar item:', error);

                // Preservar el mensaje original del backend si existe
                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al guardar item de menú';
                // console.log('📤 Enviando error al componente:', errorMessage);
                
                return throwError(() => ({ 
                    message: errorMessage,
                    originalError: error 
                }));
            })
        );
    }

    // DELETE - Eliminar item
    deleteItem(id_menu: number): Observable<MenuCrudSingleResponse> {
        const payload = {
            action: 'DL',
            id_menu: id_menu,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        // console.log('🗑️ Eliminando item:', payload);

        return this.getMenuUrl().pipe(
            switchMap(url => {
                return this.http.post<any>(url, payload);
            }),
            map((response: any) => {
                // console.log('🌐 Respuesta delete:', response);
                
                // Manejar respuesta en formato array
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Item eliminado exitosamente',
                        data: {} as MenuCrudItem
                    } as MenuCrudSingleResponse;
                }
                
                // Si la respuesta es un objeto directo
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Item eliminado exitosamente',
                    data: {} as MenuCrudItem
                } as MenuCrudSingleResponse;
            }),
            catchError(error => {
                console.error('Error al eliminar item:', error);
                return throwError(() => new Error('Error al eliminar item de menú'));
            })
        );
    }

    // GET - Obtener item específico por ID
    getMenuItem(id_menu: number): Observable<MenuCrudSingleResponse> {
        const payload = {
            action: 'SL',
            id_menu: id_menu
        };
        
        // console.log('🔍 Obteniendo item específico:', payload);
        
        return this.getMenuUrl().pipe(
            switchMap(url => {
                return this.http.post<any>(url, payload);
            }),
            map((response: any) => {
                // console.log('🌐 Respuesta getItem:', response);
                
                // Manejar respuesta en formato array
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'OK',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : {} as MenuCrudItem
                    } as MenuCrudSingleResponse;
                }
                
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'OK',
                    data: response.data || {} as MenuCrudItem
                } as MenuCrudSingleResponse;
            }),
            catchError(error => {
                console.error('Error al obtener item específico:', error);
                return throwError(() => new Error('Error al obtener item de menú'));
            })
        );
    }

    // PATCH - Update de atributos específicos
    patchItem(id_menu: number, partialData: Partial<MenuFormItem>): Observable<MenuCrudSingleResponse> {
        const payload = {
            action: 'UP',
            id_menu: id_menu,
            ...partialData,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        // console.log('🔧 Actualizando parcialmente item:', payload);

        return this.getMenuUrl().pipe(
            switchMap(url => {
                return this.http.post<any>(url, payload);
            }),
            map((response: any) => {
                // console.log('🌐 Respuesta patch:', response);
                
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    
                    // Verificar si el backend devolvió un error
                    if (firstItem.statuscode && firstItem.statuscode !== 200) {
                        throw new Error(firstItem.mensaje || 'Error del servidor');
                    }
                    
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Item actualizado exitosamente',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : {} as MenuCrudItem
                    } as MenuCrudSingleResponse;
                }
                
                // Verificar error en respuesta directa
                if (response.statuscode && response.statuscode !== 200) {
                    throw new Error(response.mensaje || 'Error del servidor');
                }
                
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Item actualizado exitosamente',
                    data: response.data || {} as MenuCrudItem
                } as MenuCrudSingleResponse;
            }),
            catchError(error => {
                // console.error('❌ Error al actualizar parcialmente item:', error);
                
                // Preservar el mensaje original del backend si existe
                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al actualizar item de menú';
                return throwError(() => ({ 
                    message: errorMessage,
                    originalError: error 
                }));
            })
        );
    }

    // PUT - Update completo
    updateItem(id_menu: number, item: MenuFormItem): Observable<MenuCrudSingleResponse> {
        const payload = {
            action: 'UP',
            id_menu: id_menu,
            ...item,
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        // console.log('🔄 Actualizando completamente item:', payload);

        return this.getMenuUrl().pipe(
            switchMap(url => {
                return this.http.post<any>(url, payload);
            }),
            map((response: any) => {
                // console.log('🌐 Respuesta update:', response);
                
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    
                    // Verificar si el backend devolvió un error
                    if (firstItem.statuscode && firstItem.statuscode !== 200) {
                        throw new Error(firstItem.mensaje || 'Error del servidor');
                    }
                    
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'Item actualizado exitosamente',
                        data: firstItem.data && firstItem.data.length > 0 ? firstItem.data[0] : item as MenuCrudItem
                    } as MenuCrudSingleResponse;
                }
                
                // Verificar error en respuesta directa
                if (response.statuscode && response.statuscode !== 200) {
                    throw new Error(response.mensaje || 'Error del servidor');
                }
                
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'Item actualizado exitosamente',
                    data: response.data || item as MenuCrudItem
                } as MenuCrudSingleResponse;
            }),
            catchError(error => {
                // console.error('❌ Error al actualizar completamente item:', error);
                
                // Preservar el mensaje original del backend si existe
                const errorMessage = error.message || error.error?.message || error.error?.mensaje || 'Error al actualizar item de menú';
                return throwError(() => ({ 
                    message: errorMessage,
                    originalError: error 
                }));
            })
        );
    }

    // GET - Cargar menú dinámico completo
    loadMenu(): Observable<MenuApiResponse> {
        return this.getMenuUrl().pipe(
            switchMap(url => {
                return this.http.post<MenuHttpResponse>(url, {
                    action: 'GET',
                    ...this.sessionService.getApiPayloadBase()
                });
            }),
            map((response: MenuHttpResponse) => {
                // Si la respuesta es un array, tomar el primer elemento
                if (Array.isArray(response) && response.length > 0) {
                    const firstItem = response[0];
                    return {
                        statuscode: firstItem.statuscode || 200,
                        mensaje: firstItem.mensaje || 'OK',
                        data: firstItem.data || []
                    } as MenuApiResponse;
                }

                // Si la respuesta es un objeto directo
                return {
                    statuscode: response.statuscode || 200,
                    mensaje: response.mensaje || 'OK',
                    data: response.data || []
                } as MenuApiResponse;
            }),
            catchError(error => {
                console.error('Error cargando menú:', error instanceof Error ? error.message : String(error));
                return throwError(() => new Error('Error al cargar menú dinámico'));
            })
        );
    }

    // Método genérico para ejecutar acciones
    executeAction(action: string, data?: any, id_menu?: number): Observable<any> {
        const payload = {
            action: action,
            ...(id_menu && { id_menu }),
            ...(data && data),
            ...this.sessionService.getApiPayloadBase() // usr, id_session - REGLA OBLIGATORIA
        };

        // console.log(`⚡ Ejecutando acción ${action}:`, payload);

        return this.getMenuUrl().pipe(
            switchMap(url => {
                return this.http.post<any>(url, payload);
            }),
            map((response: any) => {
                // console.log(`🌐 Respuesta acción ${action}:`, response);
                
                if (Array.isArray(response) && response.length > 0) {
                    return response[0];
                }
                
                return response;
            }),
            catchError(error => {
                console.error(`Error en acción ${action}:`, error);
                return throwError(() => new Error(`Error al ejecutar acción ${action}`));
            })
        );
    }
}