import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { MenuService } from './menu.service';
import { MenuApiItem, MenuApiResponse, MenuHttpResponse } from '../../models/menu.interface';
import { DialogService } from 'primeng/dynamicdialog';

// ❌ CACHE DESHABILITADO: Interface CachedMenuData eliminada

@Injectable({
  providedIn: 'root'
})
export class MenuLoaderService {
  // ❌ CACHE DESHABILITADO: Sin persistencia de localStorage
  // private readonly STORAGE_KEY = 'dynamic-menu-cache';

  // Estado del menú
  private menuSubject = new BehaviorSubject<MenuItem[] | null>(null);
  public menu$ = this.menuSubject.asObservable();

  // Estado de carga
  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();

  // Estado de error
  private errorSubject = new BehaviorSubject<boolean>(false);
  public error$ = this.errorSubject.asObservable();

  constructor(
    private menuService: MenuService,
    private dialogService: DialogService,
    private appRef: ApplicationRef
  ) {
    // MenuLoaderService inicializado
  }

  /**
   * Inicializa el menú dinámico (método público llamado desde AppMenu)
   */
  public async initialize(): Promise<void> {
    if (this.menuSubject.value !== null) {
      return; // Menú ya inicializado, omitir
    }
    await this.loadMenu();
  }

  /**
   * ❌ CACHE DESHABILITADO: Carga el menú directamente desde API
   * Sin persistencia localStorage - siempre fresco desde servidor
   */
  private async loadMenu(): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(false);

    // ❌ SIN CACHE: Cargar directamente desde API
    try {
      await this.loadMenuFromAPI();
      this.errorSubject.next(false);
    } catch (error) {
      console.error('❌ Error cargando menú desde API:', error instanceof Error ? error.message : String(error));
      this.errorSubject.next(true);

      // Sin cache disponible, mostrar error
      this.showNoMenuError();
      this.menuSubject.next([]);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * ❌ CACHE DESHABILITADO: Carga el menú desde la API sin guardar cache
   */
  private async loadMenuFromAPI(): Promise<void> {
    try {
      const response = await firstValueFrom(this.menuService.loadMenu());

      if (response && response.data) {
        const menuItems = this.mapApiToMenuItems(response.data);

        // ❌ SIN CACHE: No guardar en localStorage

        // Actualizar estado directamente
        this.menuSubject.next(menuItems);
      } else {
        throw new Error('Respuesta de API inválida');
      }
    } catch (error) {
      console.error('Error en API del menú:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Mapea la respuesta de la API a PrimeNG MenuItem
   */
  private mapApiToMenuItems(apiItems: MenuApiItem[]): MenuItem[] {
    return apiItems
      .filter(item => item.visible !== false) // Filtrar items no visibles
      .map(item => ({
        label: item.label,
        icon: item.icon,
        visible: item.visible,
        disabled: item.disable,
        tooltip: item.tooltip,
        separator: item.separator,
        routerLink: item.routerLink || undefined,
        items: item.items && item.items.length > 0
          ? this.mapApiToMenuItems(item.items)
          : undefined
      }));
  }

  /**
   * ❌ CACHE DESHABILITADO: Métodos de cache eliminados
   * Ya no se guarda ni recupera del localStorage
   */

  /**
   * ❌ CACHE DESHABILITADO: Recarga el menú desde API
   */
  async reloadMenu(): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(false);

    try {
      await this.loadMenuFromAPI();
    } catch (error) {
      console.error('❌ Error recargando menú:', error);
      this.errorSubject.next(true);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * ❌ CACHE DESHABILITADO: Actualiza el menú después de login exitoso
   * Sin cache, siempre carga fresco desde API
   */
  async updateMenuOnLogin(): Promise<void> {
    try {
      // 🚨 PASO 1: RESETAR ESTADO COMPLETO
      this.menuSubject.next(null);
      this.loadingSubject.next(true);
      this.errorSubject.next(false);

      // 🚨 PASO 2: ESPERAR CARGA COMPLETA DESDE API (SIN CACHE)
      await this.loadMenuFromAPI();

      // 🚨 PASO 3: ASEGURAR RENDERIZADO COMPLETO CON ESTADO FINAL
      await this.ensureMenuRendered();

      // 🚨 PASO 4: CONFIRMAR ESTADO FINAL - IMPORTANTE PARA SINCRONIZACIÓN
      this.loadingSubject.next(false); // Asegurar que loading esté en false
      this.appRef.tick(); // Forzar detección de cambios final

    } catch (error) {
      console.error('❌ Error cargando menú después del login:', error);

      // En caso de error, asegurar estado consistente
      this.loadingSubject.next(false);
      this.errorSubject.next(true);

      // En caso de error, mostrar error
      this.showNoMenuError();

      throw error; // Re-lanzar para que login sepa que falló
    }
  }

  /**
   * Asegura que el menú se renderice completamente antes de continuar
   */
  private async ensureMenuRendered(): Promise<void> {
    return new Promise((resolve) => {
      // Forzar detección de cambios inmediata
      this.appRef.tick();

      // Esperar un ciclo completo de renderizado
      setTimeout(() => {
        this.appRef.tick();
        resolve();
      }, 200);
    });
  }

  /**
   * ❌ CACHE DESHABILITADO: No hay cache que limpiar
   */
  clearCache(): void {
    // No hay cache que limpiar - funcionalidad deshabilitada
  }

  /**
   * Muestra modal de error cuando no hay menú disponible
   */
  private showNoMenuError(): void {
    console.error('🚨 No hay menú disponible - mostrando error');

    // Importar dinámicamente para evitar dependencias circulares
    import('./no-menu-dialog.component').then(({ NoMenuDialogComponent }) => {
      this.dialogService.open(NoMenuDialogComponent, {
        header: 'Menú no disponible',
        width: '400px',
        closable: false,
        modal: true,
        data: {
          message: 'No se pudo cargar el menú de navegación. Contacte al administrador del sistema.'
        }
      });
    }).catch(error => {
      console.error('❌ Error cargando componente de error:', error);
      // Fallback: mostrar alert nativo
      alert('Error: No se pudo cargar el menú. Contacte al administrador.');
    });
  }

  /**
   * Obtiene el menú actual como snapshot
   */
  getCurrentMenu(): MenuItem[] {
    return this.menuSubject.value || [];
  }

  /**
   * Verifica si hay menú disponible
   */
  hasMenu(): boolean {
    const menu = this.menuSubject.value;
    return menu !== null && menu.length > 0;
  }
}
