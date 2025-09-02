import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface RouteInfo {
  path: string;
  label: string;
  description?: string;
  category: string;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RouteDiscoveryService {

  constructor(private router: Router) {}

  /**
   * Obtiene todas las rutas disponibles del proyecto
   */
  getAvailableRoutes(): RouteInfo[] {
    const routes: RouteInfo[] = [];

    // Rutas principales del dashboard
    routes.push(
      {
        path: '/dashboard/analytics',
        label: 'Dashboard Analytics',
        description: 'Panel de análisis y métricas',
        category: 'Dashboard',
        icon: 'pi pi-chart-line'
      },
      {
        path: '/dashboard/saas',
        label: 'Dashboard SaaS',
        description: 'Panel de software como servicio',
        category: 'Dashboard',
        icon: 'pi pi-desktop'
      },
      {
        path: '/dashboard/sales',
        label: 'Dashboard Ventas',
        description: 'Panel de ventas y reportes',
        category: 'Dashboard',
        icon: 'pi pi-shopping-cart'
      }
    );

    // Rutas de aplicaciones
    routes.push(
      {
        path: '/apps/chat',
        label: 'Chat',
        description: 'Aplicación de mensajería',
        category: 'Aplicaciones',
        icon: 'pi pi-comments'
      },
      {
        path: '/apps/files',
        label: 'Gestión de Archivos',
        description: 'Explorador y gestión de archivos',
        category: 'Aplicaciones',
        icon: 'pi pi-folder'
      },
      {
        path: '/apps/kanban',
        label: 'Kanban',
        description: 'Tablero de tareas Kanban',
        category: 'Aplicaciones',
        icon: 'pi pi-th-large'
      },
      {
        path: '/apps/mail',
        label: 'Correo',
        description: 'Cliente de correo electrónico',
        category: 'Aplicaciones',
        icon: 'pi pi-envelope'
      },
      {
        path: '/apps/tasklist',
        label: 'Lista de Tareas',
        description: 'Gestión de tareas y proyectos',
        category: 'Aplicaciones',
        icon: 'pi pi-check-square'
      }
    );

    // Rutas de ecommerce
    routes.push(
      {
        path: '/ecommerce/checkoutform',
        label: 'Formulario de Pago',
        description: 'Proceso de checkout',
        category: 'E-commerce',
        icon: 'pi pi-credit-card'
      },
      {
        path: '/ecommerce/newproduct',
        label: 'Nuevo Producto',
        description: 'Crear nuevo producto',
        category: 'E-commerce',
        icon: 'pi pi-plus-circle'
      },
      {
        path: '/ecommerce/orderhistory',
        label: 'Historial de Pedidos',
        description: 'Ver historial de pedidos',
        category: 'E-commerce',
        icon: 'pi pi-history'
      },
      {
        path: '/ecommerce/ordersummary',
        label: 'Resumen de Pedido',
        description: 'Resumen de pedidos',
        category: 'E-commerce',
        icon: 'pi pi-file-text'
      },
      {
        path: '/ecommerce/productlist',
        label: 'Lista de Productos',
        description: 'Catálogo de productos',
        category: 'E-commerce',
        icon: 'pi pi-list'
      },
      {
        path: '/ecommerce/productoverview',
        label: 'Vista de Producto',
        description: 'Detalles del producto',
        category: 'E-commerce',
        icon: 'pi pi-eye'
      },
      {
        path: '/ecommerce/shop',
        label: 'Tienda',
        description: 'Página principal de la tienda',
        category: 'E-commerce',
        icon: 'pi pi-shopping-bag'
      },
      {
        path: '/ecommerce/shoppingcart',
        label: 'Carrito de Compras',
        description: 'Carrito de compras',
        category: 'E-commerce',
        icon: 'pi pi-shopping-cart'
      }
    );

    // Rutas de UI Kit
    routes.push(
      {
        path: '/uikit/button',
        label: 'Botones',
        description: 'Componentes de botones',
        category: 'UI Kit',
        icon: 'pi pi-circle'
      },
      {
        path: '/uikit/chart',
        label: 'Gráficos',
        description: 'Componentes de gráficos',
        category: 'UI Kit',
        icon: 'pi pi-chart-bar'
      },
      {
        path: '/uikit/file',
        label: 'Archivos',
        description: 'Componentes de archivos',
        category: 'UI Kit',
        icon: 'pi pi-file'
      },
      {
        path: '/uikit/floatlabel',
        label: 'Float Label',
        description: 'Etiquetas flotantes',
        category: 'UI Kit',
        icon: 'pi pi-tag'
      },
      {
        path: '/uikit/formlayout',
        label: 'Layout de Formulario',
        description: 'Diseños de formularios',
        category: 'UI Kit',
        icon: 'pi pi-th-large'
      },
      {
        path: '/uikit/input',
        label: 'Inputs',
        description: 'Componentes de entrada',
        category: 'UI Kit',
        icon: 'pi pi-pencil'
      },
      {
        path: '/uikit/invalidstate',
        label: 'Estado Inválido',
        description: 'Estados de validación',
        category: 'UI Kit',
        icon: 'pi pi-exclamation-triangle'
      },
      {
        path: '/uikit/panel',
        label: 'Paneles',
        description: 'Componentes de paneles',
        category: 'UI Kit',
        icon: 'pi pi-window-maximize'
      },
      {
        path: '/uikit/table',
        label: 'Tablas',
        description: 'Componentes de tablas',
        category: 'UI Kit',
        icon: 'pi pi-table'
      },
      {
        path: '/uikit/tree',
        label: 'Árbol',
        description: 'Componente de árbol',
        category: 'UI Kit',
        icon: 'pi pi-sitemap'
      },
      {
        path: '/uikit/menu',
        label: 'Menú',
        description: 'Componentes de menú',
        category: 'UI Kit',
        icon: 'pi pi-bars'
      },
      {
        path: '/uikit/message',
        label: 'Mensajes',
        description: 'Componentes de mensajes',
        category: 'UI Kit',
        icon: 'pi pi-comment'
      },
      {
        path: '/uikit/overlay',
        label: 'Overlay',
        description: 'Componentes de superposición',
        category: 'UI Kit',
        icon: 'pi pi-layer-group'
      },
      {
        path: '/uikit/media',
        label: 'Media',
        description: 'Componentes multimedia',
        category: 'UI Kit',
        icon: 'pi pi-image'
      },
      {
        path: '/uikit/misc',
        label: 'Misceláneos',
        description: 'Componentes varios',
        category: 'UI Kit',
        icon: 'pi pi-ellipsis-h'
      }
    );

    // Rutas de páginas
    routes.push(
      {
        path: '/pages/aboutus',
        label: 'Acerca de Nosotros',
        description: 'Información de la empresa',
        category: 'Páginas',
        icon: 'pi pi-info-circle'
      },
      {
        path: '/pages/contactus',
        label: 'Contáctanos',
        description: 'Formulario de contacto',
        category: 'Páginas',
        icon: 'pi pi-phone'
      },
      {
        path: '/pages/help',
        label: 'Ayuda',
        description: 'Centro de ayuda',
        category: 'Páginas',
        icon: 'pi pi-question-circle'
      },
      {
        path: '/pages/invoice',
        label: 'Factura',
        description: 'Generar facturas',
        category: 'Páginas',
        icon: 'pi pi-file-pdf'
      },
      {
        path: '/pages/landing',
        label: 'Landing Page',
        description: 'Página de aterrizaje',
        category: 'Páginas',
        icon: 'pi pi-globe'
      },
      {
        path: '/pages/notfound',
        label: 'Página No Encontrada',
        description: 'Error 404',
        category: 'Páginas',
        icon: 'pi pi-exclamation-circle'
      },
      {
        path: '/pages/empty',
        label: 'Página Vacía',
        description: 'Página en blanco',
        category: 'Páginas',
        icon: 'pi pi-square'
      }
    );

    // Rutas de gestión de usuarios
    routes.push(
      {
        path: '/usermanagement/userlist',
        label: 'Lista de Usuarios',
        description: 'Gestión de usuarios',
        category: 'Gestión',
        icon: 'pi pi-users'
      },
      {
        path: '/usermanagement/usercreate',
        label: 'Crear Usuario',
        description: 'Crear nuevo usuario',
        category: 'Gestión',
        icon: 'pi pi-user-plus'
      }
    );

    // Rutas de autenticación
    routes.push(
      {
        path: '/auth/login',
        label: 'Iniciar Sesión',
        description: 'Página de login',
        category: 'Autenticación',
        icon: 'pi pi-sign-in'
      },
      {
        path: '/auth/register',
        label: 'Registrarse',
        description: 'Página de registro',
        category: 'Autenticación',
        icon: 'pi pi-user-plus'
      },
      {
        path: '/auth/forgotpassword',
        label: 'Recuperar Contraseña',
        description: 'Recuperar contraseña',
        category: 'Autenticación',
        icon: 'pi pi-key'
      },
      {
        path: '/auth/accessdenied',
        label: 'Acceso Denegado',
        description: 'Error de acceso',
        category: 'Autenticación',
        icon: 'pi pi-ban'
      }
    );

    // Rutas especiales
    routes.push(
      {
        path: '/menu-admin',
        label: 'Administración de Menú',
        description: 'Gestión del menú del sistema',
        category: 'Administración',
        icon: 'pi pi-cog'
      },
      {
        path: '/crud',
        label: 'CRUD',
        description: 'Operaciones CRUD',
        category: 'Administración',
        icon: 'pi pi-database'
      },
      {
        path: '/documentation',
        label: 'Documentación',
        description: 'Documentación del sistema',
        category: 'Sistema',
        icon: 'pi pi-book'
      }
    );

    return routes.sort((a, b) => {
      // Ordenar primero por categoría, luego por label
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Obtiene las categorías únicas de rutas
   */
  getRouteCategories(): string[] {
    const routes = this.getAvailableRoutes();
    const categories = [...new Set(routes.map(route => route.category))];
    return categories.sort();
  }

  /**
   * Filtra rutas por categoría
   */
  getRoutesByCategory(category: string): RouteInfo[] {
    return this.getAvailableRoutes().filter(route => route.category === category);
  }

  /**
   * Busca rutas por texto
   */
  searchRoutes(searchText: string): RouteInfo[] {
    if (!searchText.trim()) {
      return this.getAvailableRoutes();
    }

    const text = searchText.toLowerCase();
    return this.getAvailableRoutes().filter(route => 
      route.path.toLowerCase().includes(text) ||
      route.label.toLowerCase().includes(text) ||
      route.description?.toLowerCase().includes(text) ||
      route.category.toLowerCase().includes(text)
    );
  }
}
