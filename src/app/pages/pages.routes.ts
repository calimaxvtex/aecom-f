import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { AboutUs } from './aboutus/aboutus';
import { ContactUs } from './contactus/contactus';
import { Help } from './help/help';
import { Invoice } from './invoice/invoice';

export default [
    { path: 'aboutus', data: { breadcrumb: 'About' }, component: AboutUs },
    {
        path: 'documentation',
        data: { breadcrumb: 'Documentation' },
        component: Documentation
    },
    { path: 'contact', data: { breadcrumb: 'Contact' }, component: ContactUs },
    { path: 'crud', data: { breadcrumb: 'Crud' }, component: Crud },
    { path: 'empty', data: { breadcrumb: 'Empty' }, component: Empty },
    { path: 'help', data: { breadcrumb: 'Help' }, component: Help },
    { path: 'invoice', data: { breadcrumb: 'Invoice' }, component: Invoice },
    {
        path: 'system/amenu',
        data: { breadcrumb: 'Administración de Menú', proy: 1 },
        loadComponent: () => import('./system/amenu/amenu.component').then(c => c.AmenuComponent)
    },
    {
        path: 'test/route-service',
        data: { breadcrumb: 'RouteService Test', proy: 1 },
        loadComponent: () => import('./test/route-test/route-test.component').then(c => c.RouteTestComponent)
    },
    {
        path: 'system/spconfig',
        data: { breadcrumb: 'Configuración del Sistema', proy: 1 },
        loadComponent: () => import('./system/spconfig/spconfig.component').then(c => c.SPConfigComponent)
    },
    {
        path: 'adm-ecom/tabadm',
        data: { breadcrumb: 'Administración de Tabloides', proy: 1 },
        loadComponent: () => import('./adm-ecom/tabadm/tabadm.component').then(c => c.TabAdmComponent)
    },
    {
        path: 'adm-ecom/sucursal',
        data: { breadcrumb: 'Administración de Sucursales', proy: 1 },
        loadComponent: () => import('./adm-ecom/sucursal/sucursal.component').then(c => c.SucursalComponent)
    },
    {
        path: 'system/usuarios',
        data: { breadcrumb: 'Gestión de Usuarios', proy: 1 },
        loadComponent: () => import('./system/usuarios/usuarios.component').then(c => c.UsuariosComponent)
    },
    {
        path: 'system/menu',
        data: { breadcrumb: 'Administración de Menú', proy: 1 },
        loadComponent: () => import('./system/menu-admin/components/menu-admin-list').then(m => m.MenuAdminList)
    },
    {
        path: 'system/catconceptos',
        data: { breadcrumb: 'Catálogos de Conceptos', proy: 1 },
        loadComponent: () => import('./system/catconceptos/catconceptos.component').then(c => c.CatconceptosComponent)
    },
    {
        path: 'adm-ecom/collections',
        data: { breadcrumb: 'Administración de Colecciones', proy: 1 },
        loadComponent: () => import('./adm-ecom/collections/collections.component').then(c => c.CollectionsComponent)
    },
    {
        path: 'adm-ecom/test/items-test',
        data: { breadcrumb: 'Items Test Page', proy: 1 },
        loadComponent: () => import('./adm-ecom/test/items-test/items-test.component').then(c => c.ItemsTestComponent)
    },
    {
        path: 'adm-ecom/banners',
        data: { breadcrumb: 'Banners', proy: 1 },
        loadComponent: () => import('./adm-ecom/banners/banners.component').then(c => c.BannersComponent)
    },
    {
        path: 'system/proy',
        data: { breadcrumb: 'Configuración del Sistema', proy: 1 },
        loadComponent: () => import('./proy/proy.component').then(c => c.ProyComponent)
    },
    {
        path: 'adm-ecom/recetas',
        data: { breadcrumb: 'Recetas', proy: 1 },
        loadComponent: () => import('./adm-ecom/recetas/receta.component').then(c => c.RecetaComponent)
    },
    {
        path: 'system/tipogateway',
        data: { breadcrumb: 'Tipos de Gateway', proy: 1 },
        loadComponent: () => import('./system/tipogateway/tipogateway.component').then(c => c.TipoGatewayComponent)
    }
    //,    { path: '**', redirectTo: '/notfound' }
] as Routes;
