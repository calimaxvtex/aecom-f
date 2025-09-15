import { Injectable } from '@angular/core';
import { Router, Route } from '@angular/router';

export interface ProjectRoute {
    path: string;
    title?: string;
    breadcrumb?: string;
    icon?: string;
    description?: string;
    proy?: number;
}

@Injectable({
    providedIn: 'root'
})
export class RouteService {

    constructor(private router: Router) {}

    /**
     * Obtiene todas las rutas que pertenecen al proyecto (data.proy === 1)
     * Incluye rutas hardcodeadas ya que las lazy-loaded no están disponibles en router.config
     */
    getProjectRoutes(): ProjectRoute[] {
        console.log('🔍 RouteService: Obteniendo rutas del proyecto...');
        
        // Rutas hardcodeadas del proyecto (las que sabemos que tienen proy: 1)
        const hardcodedProjectRoutes: ProjectRoute[] = [
            {
                path: 'system/spconfig',
                title: 'Configuración del Sistema',
                breadcrumb: 'Configuración del Sistema',
                description: 'Configuración general del sistema',
                icon: 'pi pi-cog',
                proy: 1
            },
            {
                path: 'adm-ecom/tabadm',
                title: 'Administración de Tabloides',
                breadcrumb: 'Administración de Tabloides',
                description: 'Gestión de tabloides del ecommerce',
                icon: 'pi pi-table',
                proy: 1
            },
            {
                path: 'system/usuarios',
                title: 'Gestión de Usuarios',
                breadcrumb: 'Gestión de Usuarios',
                description: 'Administración de usuarios del sistema',
                icon: 'pi pi-users',
                proy: 1
            },
            {
                path: 'system/menu',
                title: 'Administración de Menú',
                breadcrumb: 'Administración de Menú',
                description: 'Configuración del menú principal',
                icon: 'pi pi-bars',
                proy: 1
            },
            {
                path: 'adm-ecom/collections',
                title: 'Administración de Colecciones',
                breadcrumb: 'Administración de Colecciones',
                description: 'Gestión de colecciones del ecommerce',
                icon: 'pi pi-folder',
                proy: 1
            },
            {
                path: 'adm-ecom/test/items-test',
                title: 'Items Test Page',
                breadcrumb: 'Items Test Page',
                description: 'Página de pruebas para items',
                icon: 'pi pi-wrench',
                proy: 1
            },
            {
                path: 'test-endpoints',
                title: 'Test de Endpoints',
                breadcrumb: 'Test de Endpoints',
                description: 'Pruebas de conectividad con endpoints',
                icon: 'pi pi-link',
                proy: 1
            },
            {
                path: 'test-coll',
                title: 'Test de Colecciones',
                breadcrumb: 'Test de Colecciones',
                description: 'Pruebas del sistema de colecciones',
                icon: 'pi pi-database',
                proy: 1
            }
        ];
        
        console.log('🎯 RouteService: Rutas del proyecto encontradas:', hardcodedProjectRoutes.length);
        console.log('🎯 RouteService: Rutas del proyecto:', hardcodedProjectRoutes);
        
        return hardcodedProjectRoutes;
    }

    /**
     * Extrae recursivamente las rutas que tienen data.proy === 1
     */
    private extractProjectRoutes(routes: Route[], parentPath: string = ''): ProjectRoute[] {
        const projectRoutes: ProjectRoute[] = [];

        routes.forEach(route => {
            console.log('🔍 Analizando ruta:', {
                path: route.path,
                data: route.data,
                proy: route.data?.['proy']
            });
            
            // Verificar si la ruta tiene data.proy === 1
            if (route.data?.['proy'] === 1) {
                const fullPath = this.buildFullPath(parentPath, route.path || '');
                
                console.log('✅ Ruta del proyecto encontrada:', fullPath);
                
                projectRoutes.push({
                    path: fullPath,
                    title: route.data?.['title'] || route.data?.['breadcrumb'] || this.formatPathAsTitle(route.path || ''),
                    breadcrumb: route.data?.['breadcrumb'],
                    icon: route.data?.['icon'],
                    description: route.data?.['description'],
                    proy: route.data?.['proy']
                });
            }

            // Si tiene rutas hijas, procesarlas recursivamente
            if (route.children && route.children.length > 0) {
                const childPath = this.buildFullPath(parentPath, route.path || '');
                const childRoutes = this.extractProjectRoutes(route.children, childPath);
                projectRoutes.push(...childRoutes);
            }

            // Si tiene loadChildren y es del proyecto, marcarlo
            if (route.loadChildren && route.data?.['proy'] === 1) {
                const fullPath = this.buildFullPath(parentPath, route.path || '');
                projectRoutes.push({
                    path: fullPath,
                    title: route.data?.['breadcrumb'] || this.formatPathAsTitle(route.path || ''),
                    breadcrumb: route.data?.['breadcrumb'],
                    icon: route.data?.['icon'],
                    description: route.data?.['description'] || 'Módulo con rutas dinámicas',
                    proy: route.data?.['proy']
                });
            }
        });

        return projectRoutes;
    }

    /**
     * Construye la ruta completa combinando el path padre con el hijo
     */
    private buildFullPath(parentPath: string, childPath: string): string {
        if (!parentPath) return childPath;
        if (!childPath || childPath === '') return parentPath;
        
        // Manejar rutas relativas como '../system/spconfig'
        if (childPath.startsWith('../')) {
            return childPath.substring(3); // Remover '../'
        }
        
        return `${parentPath}/${childPath}`.replace(/\/+/g, '/');
    }

    /**
     * Convierte un path en un título legible
     */
    private formatPathAsTitle(path: string): string {
        return path
            .split('/')
            .pop() || ''
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Obtiene rutas filtradas por categoría específica
     */
    getProjectRoutesByCategory(category?: string): ProjectRoute[] {
        const routes = this.getProjectRoutes();
        
        if (!category) return routes;
        
        return routes.filter(route => 
            route.path.includes(category) || 
            route.breadcrumb?.toLowerCase().includes(category.toLowerCase())
        );
    }

    /**
     * Busca rutas por término de búsqueda
     */
    searchProjectRoutes(searchTerm: string): ProjectRoute[] {
        const routes = this.getProjectRoutes();
        const term = searchTerm.toLowerCase();
        
        return routes.filter(route => 
            route.path.toLowerCase().includes(term) ||
            route.title?.toLowerCase().includes(term) ||
            route.breadcrumb?.toLowerCase().includes(term) ||
            route.description?.toLowerCase().includes(term)
        );
    }

    /**
     * Verifica si una ruta específica pertenece al proyecto
     */
    isProjectRoute(path: string): boolean {
        const routes = this.getProjectRoutes();
        return routes.some(route => route.path === path);
    }

    /**
     * Obtiene rutas agrupadas por categorías (system, admin, test, etc.)
     */
    getProjectRoutesByCategories(): { [category: string]: ProjectRoute[] } {
        const routes = this.getProjectRoutes();
        const categories: { [category: string]: ProjectRoute[] } = {};

        routes.forEach(route => {
            const pathParts = route.path.split('/');
            const category = pathParts[0] || 'general';
            
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(route);
        });

        return categories;
    }

    /**
     * Obtiene solo las rutas principales (sin sub-rutas)
     */
    getMainProjectRoutes(): ProjectRoute[] {
        return this.getProjectRoutes().filter(route => 
            !route.path.includes('/') || route.path.split('/').length <= 2
        );
    }
}
