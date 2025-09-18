import { Component, computed, OnDestroy, Renderer2, ViewChild, OnInit, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AppTopbar } from './app.topbar';
import { AppFooter } from './app.footer';
import { LayoutService } from '@/layout/service/layout.service';
import { AppConfigurator } from './app.configurator';
import { AppBreadcrumb } from './app.breadcrumb';
import { AppSidebar } from './app.sidebar';
import { AppRightMenu } from '@/layout/components/app.rightmenu';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SessionService } from '@/core/services/session.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, AppTopbar, AppSidebar, RouterModule, AppFooter, AppConfigurator, AppBreadcrumb, AppRightMenu, Toast],
    template: `
        <div class="layout-container" [ngClass]="containerClass()">
            <div app-topbar></div>
            <div app-right-menu></div>
            <div app-sidebar></div>
            <div class="layout-content-wrapper">
                <div app-breadcrumb></div>
                <div class="layout-content">
                    <router-outlet></router-outlet>
                </div>
                <div app-footer></div>
            </div>
        </div>
        <app-configurator />
        <p-toast />
    `,
    providers: [MessageService]
})
export class AppLayout implements OnInit, OnDestroy {
    overlayMenuOpenSubscription: Subscription;

    menuOutsideClickListener: any;

    menuScrollListener: any;

    @ViewChild(AppSidebar) appSidebar!: AppSidebar;

    @ViewChild(AppTopbar) appTopbar!: AppTopbar;

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router,
        private cdr: ChangeDetectorRef,
        private appRef: ApplicationRef,
        private sessionService: SessionService
    ) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    const isOutsideClicked = !(
                        this.appSidebar.appMenu.el.nativeElement.isSameNode(event.target) ||
                        this.appSidebar.appMenu.el.nativeElement.contains(event.target) ||
                        this.appTopbar.menuButton.nativeElement.isSameNode(event.target) ||
                        this.appTopbar.menuButton.nativeElement.contains(event.target)
                    );
                    if (isOutsideClicked) {
                        this.hideMenu();
                    }
                });
            }

            if ((this.layoutService.isSlim() || this.layoutService.isSlimPlus()) && !this.menuScrollListener) {
                this.menuScrollListener = this.renderer.listen(this.appSidebar.appMenu.menuContainer.nativeElement, 'scroll', (event) => {
                    if (this.layoutService.isDesktop()) {
                        this.hideMenu();
                    }
                });
            }

            if (this.layoutService.layoutState().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.hideMenu();
        });
    }

    ngOnInit(): void {
        // Forzar inicialización inicial del layout
        setTimeout(() => {
            this.forceLayoutReinitialization();
        }, 100);

        // Suscribirse a cambios de sesión para forzar re-renderizado después del login
        this.sessionService.session$.subscribe(session => {
            if (session && session.isLoggedIn) {
                // Forzar re-inicialización del layout después del login
                setTimeout(() => {
                    this.forceLayoutReinitialization();
                }, 200);
            }
        });
    }

    /**
     * Fuerza la re-inicialización del layout después del login
     */
    private forceLayoutReinitialization(): void {
        try {
            // Forzar detección de cambios
            this.cdr.detectChanges();
            
            // Forzar tick de aplicación
            this.appRef.tick();
            
            // Re-aplicar clases del contenedor
            setTimeout(() => {
                this.cdr.detectChanges();
            }, 100);
            
            console.log('🔄 Layout re-inicializado después del login');
        } catch (error) {
            console.warn('⚠️ Error re-inicializando layout:', error);
        }
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({ ...prev, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
        this.layoutService.reset();
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }

        if (this.menuScrollListener) {
            this.menuScrollListener();
            this.menuScrollListener = null;
        }

        this.unblockBodyScroll();
    }

    containerClass = computed(() => {
        const layoutConfig = this.layoutService.layoutConfig();
        const layoutState = this.layoutService.layoutState();

        return {
            'layout-overlay': layoutConfig.menuMode === 'overlay',
            'layout-static': layoutConfig.menuMode === 'static',
            'layout-slim': layoutConfig.menuMode === 'slim',
            'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
            'layout-horizontal': layoutConfig.menuMode === 'horizontal',
            'layout-reveal': layoutConfig.menuMode === 'reveal',
            'layout-drawer': layoutConfig.menuMode === 'drawer',
            'layout-sidebar-dark': layoutConfig.darkTheme,
            'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
            'layout-overlay-active': layoutState.overlayMenuActive,
            'layout-mobile-active': layoutState.staticMenuMobileActive,
            'layout-topbar-menu-active': layoutState.topbarMenuActive,
            'layout-menu-profile-active': layoutState.rightMenuActive,
            'layout-sidebar-active': layoutState.sidebarActive,
            'layout-sidebar-anchored': layoutState.anchored,
            [`layout-topbar-${layoutConfig.topbarTheme}`]: true,
            [`layout-menu-${layoutConfig.menuTheme}`]: true,
            [`layout-menu-profile-${layoutConfig.menuProfilePosition}`]: true
        };
    });

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
    }
}
