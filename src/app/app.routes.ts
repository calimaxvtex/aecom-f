import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';

export const appRoutes: Routes = [
    // Ruta por defecto - redirige al login
    { path: '', redirectTo: '/login', pathMatch: 'full' },

    // Layout principal para rutas autenticadas
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: 'dashboards',
                data: { breadcrumb: 'Analytics Dashboard' },
                loadChildren: () => import('@/pages/dashboard/dashboard.routes')
            },
            {
                path: 'uikit',
                data: { breadcrumb: 'UI Kit' },
                loadChildren: () => import('@/pages/uikit/uikit.routes')
            },
            {
                path: 'documentation',
                data: { breadcrumb: 'Documentation' },
                loadComponent: () => import('@/pages/documentation/documentation').then((c) => c.Documentation)
            },
            {
                path: '',
                data: { breadcrumb: 'Pages' },
                loadChildren: () => import('@/pages/pages.routes').then(m => m.default)
            },
            {
                path: 'apps',
                data: { breadcrumb: 'Apps' },
                loadChildren: () => import('@/apps/apps.routes')
            },
            {
                path: 'ecommerce',
                data: { breadcrumb: 'E-Commerce' },
                loadChildren: () => import('@/pages/ecommerce/ecommerce.routes')
            },
            {
                path: 'blocks',
                data: { breadcrumb: 'Prime Blocks' },
                loadChildren: () => import('@/pages/blocks/blocks.routes')
            },
            {
                path: 'profile',
                data: { breadcrumb: 'User Management' },
                loadChildren: () => import('@/pages/usermanagement/usermanagement.routes')
            },
        ]
    },
    // Rutas de login específicas sin prefijo
    {
        path: 'login',
        loadComponent: () => import('@/pages/auth/login').then((c) => c.Login)
    },
    {
        path: 'login2',
        loadComponent: () => import('@/pages/auth/login2').then((c) => c.Login2)
    },
    // Resto de rutas de autenticación con prefijo /auth
    {
        path: 'auth',
        loadChildren: () => import('@/pages/auth/auth.routes')
    },
    {
        path: 'landing',
        loadComponent: () => import('@/pages/landing/landing').then((c) => c.Landing)
    },
    {
        path: 'notfound',
        loadComponent: () => import('@/pages/notfound/notfound').then((c) => c.Notfound)
    },
    {
        path: 'test-endpoints',
        loadComponent: () => import('@/pages/adm-ecom/test-endpoints/test-endpoints').then((c) => c.TestEndpoints)
    },
    {
        path: 'test-coll',
        loadComponent: () => import('@/features/coll/test-coll.component').then((c) => c.TestCollComponent)
    },
    //{ path: '**', redirectTo: '/notfound' },
    {        path: '**',
        loadComponent: () => import('@/pages/notfound/notfound').then((c) => c.Notfound)
    }
];
