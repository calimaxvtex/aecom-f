import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {MegaMenuItem} from 'primeng/api';
import {RouterModule, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {StyleClassModule} from 'primeng/styleclass';
import {LayoutService} from '@/layout/service/layout.service';
import {Ripple} from 'primeng/ripple';
import {InputText} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {MegaMenuModule} from 'primeng/megamenu';
import {MessageService} from 'primeng/api';

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, FormsModule, Ripple, InputText, ButtonModule, MegaMenuModule],
    template: `
        <div class="layout-topbar-start">
            <a class="layout-topbar-logo" routerLink="/">
                <!-- Logo completo de Calimax -->
                <img 
                    src="/images/pages/calimax-banner.svg" 
                    alt="Calimax Banner" 
                    class="layout-topbar-logo-full h-8 w-auto"
                />
                <!-- Logo compacto de Calimax para sidebar slim -->
                <img 
                    src="/images/pages/calimax-banner.svg" 
                    alt="Calimax Banner" 
                    class="layout-topbar-logo-slim h-8 w-auto"
                />
            </a>
            <a #menuButton class="layout-menu-button" (click)="onMenuButtonClick()">
                <i class="pi pi-chevron-right"></i>
            </a>

            <button class="app-config-button app-config-mobile-button" (click)="toggleConfigSidebar()">
                <i class="pi pi-cog"></i>
            </button>

            <a #mobileMenuButton class="layout-topbar-mobile-button" (click)="onTopbarMenuToggle()">
                <i class="pi pi-ellipsis-v"></i>
            </a>
        </div>

        <div class="layout-topbar-end">
            <div class="layout-topbar-actions-start">
                <p-megamenu [model]="model" styleClass="layout-megamenu" breakpoint="0px"></p-megamenu>
            </div>
            <div class="layout-topbar-actions-end">
                <ul class="layout-topbar-items">
                    <li class="layout-topbar-search">
                        <a pStyleClass="@next" enterFromClass="!hidden" enterActiveClass="animate-scalein" leaveToClass="!hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true" (click)="focusSearchInput()">
                            <i class="pi pi-search"></i>
                        </a>

                        <div class="layout-search-panel !hidden p-input-filled">
                            <i class="pi pi-search"></i>
                            <input #searchInput type="text" pInputText placeholder="Buscar sección..." (keyup.enter)="onSearchInput($event)" />
                            <button pButton pRipple type="button" icon="pi pi-times" rounded text pStyleClass=".layout-search-panel" leaveToClass="!hidden" leaveActiveClass="animate-fadeout"></button>
                        </div>
                    </li>
                    <li>
                        <button class="app-config-button" (click)="toggleConfigSidebar()">
                            <i class="pi pi-cog"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    `,
    host: {
        class: 'layout-topbar'
    },
})
export class AppTopbar {
    layoutService = inject(LayoutService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    @ViewChild('menuButton') menuButton!: ElementRef<HTMLButtonElement>;

    @ViewChild('mobileMenuButton') mobileMenuButton!: ElementRef<HTMLButtonElement>;

    model: MegaMenuItem[] = [
        {
            label: 'UI KIT',
            items: [
                [
                    {
                        label: 'UI KIT 1',
                        items: [
                            { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: '/uikit/formlayout' },
                            { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: '/uikit/input' },
                            { label: 'Timeline', icon: 'pi pi-fw pi-bookmark', routerLink: '/uikit/timeline' },
                            { label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: '/uikit/button' },
                            { label: 'File', icon: 'pi pi-fw pi-file', routerLink: '/uikit/file' }
                        ]
                    }
                ],
                [
                    {
                        label: 'UI KIT 2',
                        items: [
                            { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: '/uikit/table' },
                            { label: 'List', icon: 'pi pi-fw pi-list', routerLink: '/uikit/list' },
                            { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: '/uikit/tree' },
                            { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: '/uikit/panel' },
                            { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: '/uikit/charts' }
                        ]
                    }
                ],
                [
                    {
                        label: 'UI KIT 3',
                        items: [
                            { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: '/uikit/overlay' },
                            { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: '/uikit/media' },
                            { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: '/uikit/menu' },
                            { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: '/uikit/message' },
                            { label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: '/uikit/misc' }
                        ]
                    }
                ]
            ]
        },
        {
            label: 'UTILITIES',
            items: [
                [
                    {
                        label: 'UTILITIES 1',
                        items: [
                            {
                                label: 'Buy Now',
                                icon: 'pi pi-fw pi-shopping-cart',
                                url: 'https://www.primefaces.org/store',
                                target: '_blank'
                            },
                            {
                                label: 'Documentation',
                                icon: 'pi pi-fw pi-info-circle',
                                routerLink: '/documentation'
                            }
                        ]
                    }
                ]
            ]
        }
    ];

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }


    toggleConfigSidebar() {
        let layoutState = this.layoutService.layoutState();

        if (this.layoutService.isSidebarActive()) {
            layoutState.overlayMenuActive = false;
            layoutState.overlaySubmenuActive = false;
            layoutState.staticMenuMobileActive = false;
            layoutState.menuHoverActive = false;
            layoutState.configSidebarVisible = false;
        }
        layoutState.configSidebarVisible = !layoutState.configSidebarVisible;
        this.layoutService.layoutState.set({ ...layoutState });
    }

    focusSearchInput() {
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        }, 150);
    }

    onSearchInput(event: any) {
        const query = event.target.value?.toLowerCase().trim();
        if (!query) return;

        // Definir rutas disponibles para búsqueda
        const searchRoutes = [
            { keywords: ['dashboard', 'inicio', 'home'], route: '/', label: 'Dashboard' },
            { keywords: ['banners', 'banner'], route: '/adm-ecom/banners', label: 'Banners' },
            { keywords: ['colecciones', 'collections', 'productos'], route: '/adm-ecom/collections', label: 'Colecciones' },
            { keywords: ['usuarios', 'users', 'user'], route: '/system/usuarios', label: 'Usuarios' },
            { keywords: ['configuracion', 'config', 'settings'], route: '/system/spconfig', label: 'Configuración del Sistema' },
            { keywords: ['conceptos', 'catconceptos'], route: '/system/catconceptos', label: 'Conceptos' },
            { keywords: ['componentes', 'comp'], route: '/system/comp', label: 'Componentes' },
            { keywords: ['perfil', 'profile'], route: '/profile', label: 'Perfil' },
            { keywords: ['login', 'entrar'], route: '/login2', label: 'Login' }
        ];

        // Buscar coincidencias
        const match = searchRoutes.find(route =>
            route.keywords.some(keyword => keyword.includes(query) || query.includes(keyword))
        );

        if (match) {
            // Cerrar el panel de búsqueda
            const searchPanel = document.querySelector('.layout-search-panel');
            if (searchPanel) {
                searchPanel.classList.add('!hidden');
            }

            // Limpiar el input
            this.searchInput.nativeElement.value = '';

            // Mostrar mensaje de navegación
            this.messageService.add({
                severity: 'info',
                summary: 'Navegando...',
                detail: `Redirigiendo a ${match.label}`,
                life: 2000
            });

            // Navegar después de un breve delay
            setTimeout(() => {
                this.router.navigate([match.route]);
            }, 500);
        } else {
            // No se encontró coincidencia
            this.messageService.add({
                severity: 'warn',
                summary: 'No encontrado',
                detail: `No se encontró una sección para: "${query}"`,
                life: 3000
            });
        }
    }

    onTopbarMenuToggle() {
        this.layoutService.layoutState.update((val) => ({ ...val, topbarMenuActive: !val.topbarMenuActive }));
    }

}
