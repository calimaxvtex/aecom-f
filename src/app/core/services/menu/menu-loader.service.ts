import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { MenuService } from './menu.service';
import { MenuApiItem, MenuApiResponse, MenuHttpResponse } from '../../models/menu.interface';
import { DialogService } from 'primeng/dynamicdialog';

export interface CachedMenuData {
  menu: MenuItem[];
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class MenuLoaderService {
  private readonly STORAGE_KEY = 'dynamic-menu-cache';

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
      console.log('📋 Menú ya inicializado, omitiendo');
      return;
    }
    await this.loadMenu();
  }

  /**
   * Carga el menú con estrategia híbrida:
   * 1. Mostrar cache inmediatamente si existe
   * 2. Cargar desde API en background
   */
  private async loadMenu(): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(false);

    // 1. Intentar cargar desde cache primero
    const cachedMenu = this.getCachedMenu();
    if (cachedMenu && cachedMenu.length > 0) {
      this.menuSubject.next(cachedMenu);
      this.loadingSubject.next(false);
    }

    // 2. Cargar desde API
    try {
      await this.loadMenuFromAPI();
      this.errorSubject.next(false);
    } catch (error) {
      console.error('Error cargando menú:', error instanceof Error ? error.message : String(error));
      this.errorSubject.next(true);

      // Si no hay cache y API falló, mostrar error
      if (!cachedMenu || cachedMenu.length === 0) {
        this.showNoMenuError();
        this.menuSubject.next([]);
      }
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Carga el menú desde la API y actualiza el cache
   */
  private async loadMenuFromAPI(): Promise<void> {
    try {
      const response = await firstValueFrom(this.menuService.loadMenu());

      if (response && response.data) {
        const menuItems = this.mapApiToMenuItems(response.data);

        // Actualizar cache
        this.cacheMenu(menuItems);

        // Actualizar estado
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
   * Guarda el menú en localStorage (cache permanente)
   */
  private cacheMenu(menu: MenuItem[]): void {
    try {
      const cacheData: CachedMenuData = {
        menu,
        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error guardando menú en cache:', error);
    }
  }

  /**
   * Obtiene el menú desde localStorage
   */
  private getCachedMenu(): MenuItem[] | null {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (!cached) return null;

      const cacheData: CachedMenuData = JSON.parse(cached);
      return cacheData.menu;
    } catch (error) {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  /**
   * Fuerza recarga del menú desde API (para botón manual)
   */
  async reloadMenu(): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(false);

    try {
      await this.loadMenuFromAPI();
    } catch (error) {
      this.errorSubject.next(true);
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Actualiza el menú después de login exitoso
   */
  async updateMenuOnLogin(): Promise<void> {
    try {
      await this.loadMenuFromAPI();
      
      // Forzar detección de cambios para asegurar renderizado
      setTimeout(() => {
        this.appRef.tick();
      }, 100);
    } catch (error) {
      // Mantener cache existente si falla
      console.warn('Error actualizando menú después del login:', error);
    }
  }

  clearCache(): void {
    localStorage.removeItem(this.STORAGE_KEY);
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
