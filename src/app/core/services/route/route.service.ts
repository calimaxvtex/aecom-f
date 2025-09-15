import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';

export interface RouteInfo {
  path: string;
  fullPath: string;
  component?: string;
  data?: any;
  title?: string;
  hasChildren: boolean;
  children?: RouteInfo[];
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private router: Router) {}

  private cachedProyRoutes: RouteInfo[] | null = null;

  /**
   * Obtiene todas las rutas configuradas en la aplicación
   */
  getAllRoutes(): RouteInfo[] {
    const routes = this.router.config;
    return this.extractRoutesInfo(routes);
  }

  /**
   * Obtiene solo las rutas que pueden ser navegables (sin parámetros dinámicos)
   */
  getNavigableRoutes(): RouteInfo[] {
    const allRoutes = this.getAllRoutes();
    return this.filterNavigableRoutes(allRoutes);
  }

  /**
   * Obtiene rutas filtradas por criterios específicos
   */
  getFilteredRoutes(options: {
    excludeEmpty?: boolean;
    excludeWildcard?: boolean;
    excludeRedirects?: boolean;
    excludeParams?: boolean;
    includeData?: boolean;
  } = {}): RouteInfo[] {
    const routes = this.getAllRoutes();
    return this.applyFilters(routes, options);
  }

  /**
   * Busca rutas por texto
   */
  searchRoutes(searchTerm: string): RouteInfo[] {
    const allRoutes = this.getAllRoutes();
    return this.searchInRoutes(allRoutes, searchTerm.toLowerCase());
  }

  /**
   * Devuelve rutas con data.proy === 1 resolviendo rutas lazy
   */
  async getProyRoutes(): Promise<RouteInfo[]> {
    if (this.cachedProyRoutes) {
      return this.cachedProyRoutes;
    }

    const deepRoutes = await this.resolveRoutesRecursively(this.router.config);
    const filtered = this.filterProyRoutes(deepRoutes);
    const deduped = this.dedupeByFullPath(filtered);
    this.cachedProyRoutes = deduped;
    return deduped;
  }

  /**
   * Versión Observable de getProyRoutes
   */
  getProyRoutes$(): Observable<RouteInfo[]> {
    return from(this.getProyRoutes());
  }

  /**
   * Limpia la caché para forzar un nuevo escaneo
   */
  refresh(): void {
    this.cachedProyRoutes = null;
  }

  private extractRoutesInfo(routes: any[], parentPath: string = ''): RouteInfo[] {
    const routeInfos: RouteInfo[] = [];

    routes.forEach(route => {
      if (route.path !== undefined) {
        const fullPath = this.buildFullPath(parentPath, route.path);
        
        const routeInfo: RouteInfo = {
          path: route.path,
          fullPath: fullPath,
          component: route.component?.name || 'Unknown',
          data: route.data || {},
          title: route.data?.title || route.title || this.generateTitleFromPath(route.path),
          hasChildren: !!(route.children && route.children.length > 0),
          children: []
        };

        // Agregar información adicional si existe
        if (route.redirectTo) {
          routeInfo.data = { ...routeInfo.data, redirectTo: route.redirectTo };
        }

        if (route.canActivate) {
          routeInfo.data = { ...routeInfo.data, hasGuards: true };
        }

        // Procesar rutas hijas recursivamente
        if (route.children && route.children.length > 0) {
          routeInfo.children = this.extractRoutesInfo(route.children, fullPath);
        }

        routeInfos.push(routeInfo);
      }
    });

    return routeInfos;
  }

  /**
   * Resuelve rutas recursivamente incluyendo lazy (loadChildren)
   */
  private async resolveRoutesRecursively(routes: any[], parentPath: string = ''): Promise<RouteInfo[]> {
    const result: RouteInfo[] = [];

    for (const route of routes) {
      if (route.path === undefined) {
        continue;
      }

      const fullPath = this.buildFullPath(parentPath, route.path);

      const routeInfo: RouteInfo = {
        path: route.path,
        fullPath: fullPath,
        component: route.component?.name || 'Unknown',
        data: route.data || {},
        title: route.data?.title || route.title || this.generateTitleFromPath(route.path),
        hasChildren: !!(route.children && route.children.length > 0),
        children: []
      };

      if (route.redirectTo) {
        routeInfo.data = { ...routeInfo.data, redirectTo: route.redirectTo };
      }

      if (route.canActivate) {
        routeInfo.data = { ...routeInfo.data, hasGuards: true };
      }

      result.push(routeInfo);

      // Resolver hijos estáticos
      if (route.children && route.children.length > 0) {
        const childrenInfos = await this.resolveRoutesRecursively(route.children, fullPath);
        routeInfo.children = childrenInfos;
        result.push(...childrenInfos);
      }

      // Resolver hijos lazy
      if (route.loadChildren && typeof route.loadChildren === 'function') {
        try {
          const loaded = await route.loadChildren();
          let childRoutes: any[] = [];

          if (Array.isArray(loaded)) {
            childRoutes = loaded;
          } else if (Array.isArray(loaded?.default)) {
            childRoutes = loaded.default;
          } else if (Array.isArray(loaded?.routes)) {
            childRoutes = loaded.routes;
          }

          if (childRoutes.length > 0) {
            const lazyInfos = await this.resolveRoutesRecursively(childRoutes, fullPath);
            routeInfo.hasChildren = true;
            routeInfo.children = [...(routeInfo.children || []), ...lazyInfos];
            result.push(...lazyInfos);
          }
        } catch (err) {
          // Ignorar errores de carga de rutas lazy para no romper el escaneo
        }
      }
    }

    return result;
  }

  private buildFullPath(parentPath: string, currentPath: string): string {
    if (!currentPath) return parentPath;
    if (!parentPath) return currentPath;
    
    // Manejar rutas absolutas
    if (currentPath.startsWith('/')) {
      return currentPath;
    }
    
    // Construir ruta relativa
    return parentPath.endsWith('/') 
      ? `${parentPath}${currentPath}` 
      : `${parentPath}/${currentPath}`;
  }

  private generateTitleFromPath(path: string): string {
    if (!path || path === '' || path === '**') return 'Home';
    
    // Limpiar parámetros y caracteres especiales
    const cleanPath = path.replace(/[:*]/g, '').replace(/-/g, ' ');
    
    // Capitalizar primera letra de cada palabra
    return cleanPath.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private filterNavigableRoutes(routes: RouteInfo[]): RouteInfo[] {
    return routes.filter(route => {
      // Excluir rutas vacías, wildcards y con parámetros
      if (!route.path || 
          route.path === '**' || 
          route.path.includes(':') || 
          route.path.includes('*')) {
        return false;
      }

      // Excluir redirects sin componente
      if (route.data?.redirectTo && !route.component) {
        return false;
      }

      return true;
    }).map(route => ({
      ...route,
      children: route.hasChildren ? this.filterNavigableRoutes(route.children || []) : []
    }));
  }

  private filterProyRoutes(routes: RouteInfo[]): RouteInfo[] {
    return routes.filter(route => {
      if (!route.path || route.path === '**') {
        return false;
      }
      if (route.data?.redirectTo) {
        return false;
      }
      return route.data?.proy === 1;
    });
  }

  private dedupeByFullPath(routes: RouteInfo[]): RouteInfo[] {
    const seen = new Set<string>();
    const output: RouteInfo[] = [];
    for (const r of routes) {
      if (!seen.has(r.fullPath)) {
        seen.add(r.fullPath);
        output.push(r);
      }
    }
    return output;
  }

  private applyFilters(routes: RouteInfo[], options: any): RouteInfo[] {
    return routes.filter(route => {
      if (options.excludeEmpty && (!route.path || route.path === '')) {
        return false;
      }

      if (options.excludeWildcard && route.path === '**') {
        return false;
      }

      if (options.excludeRedirects && route.data?.redirectTo) {
        return false;
      }

      if (options.excludeParams && route.path.includes(':')) {
        return false;
      }

      return true;
    }).map(route => ({
      ...route,
      children: route.hasChildren ? this.applyFilters(route.children || [], options) : [],
      data: options.includeData ? route.data : undefined
    }));
  }

  private searchInRoutes(routes: RouteInfo[], searchTerm: string): RouteInfo[] {
    const results: RouteInfo[] = [];

    routes.forEach(route => {
      const matchesPath = route.path.toLowerCase().includes(searchTerm);
      const matchesTitle = route.title?.toLowerCase().includes(searchTerm);
      const matchesFullPath = route.fullPath.toLowerCase().includes(searchTerm);

      if (matchesPath || matchesTitle || matchesFullPath) {
        results.push(route);
      }

      // Buscar en rutas hijas
      if (route.hasChildren && route.children) {
        const childResults = this.searchInRoutes(route.children, searchTerm);
        results.push(...childResults);
      }
    });

    return results;
  }

  /**
   * Obtiene rutas agrupadas por módulo (si están configuradas con data.module)
   */
  getRoutesByModule(): { [module: string]: RouteInfo[] } {
    const routes = this.getAllRoutes();
    const groupedRoutes: { [module: string]: RouteInfo[] } = {};

    const groupRoutes = (routeList: RouteInfo[], parentModule?: string) => {
      routeList.forEach(route => {
        const module = route.data?.module || parentModule || 'default';
        
        if (!groupedRoutes[module]) {
          groupedRoutes[module] = [];
        }
        
        groupedRoutes[module].push(route);

        // Procesar rutas hijas
        if (route.hasChildren && route.children) {
          groupRoutes(route.children, module);
        }
      });
    };

    groupRoutes(routes);
    return groupedRoutes;
  }

  /**
   * Verifica si una ruta específica existe
   */
  routeExists(path: string): boolean {
    const allRoutes = this.getAllRoutes();
    return this.findRouteByPath(allRoutes, path) !== null;
  }

  private findRouteByPath(routes: RouteInfo[], targetPath: string): RouteInfo | null {
    for (const route of routes) {
      if (route.fullPath === targetPath || route.path === targetPath) {
        return route;
      }

      if (route.hasChildren && route.children) {
        const found = this.findRouteByPath(route.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  }
}