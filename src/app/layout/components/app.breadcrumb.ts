import { Component } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { UsuarioService } from '@/features/usuarios/services/usuario.service';

interface Breadcrumb {
    label: string;
    url?: string;
}

@Component({
    selector: '[app-breadcrumb]',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, RippleModule, TooltipModule],
    template: `
        <nav class="layout-breadcrumb">
            <ol>
                <li><i class="pi pi-home"></i></li>
                <ng-template ngFor let-item let-last="last" [ngForOf]="breadcrumbs$ | async">
                    <li><i class="pi pi-angle-right"></i></li>
                    <li>
                        <span>{{ item.label }}</span>
                    </li>
                </ng-template>
            </ol>
        </nav>
        <div class="layout-breadcrumb-buttons">
            <button
                pButton
                pRipple
                type="button"
                icon="pi pi-bookmark"
                class="p-button-rounded p-button-text p-button-plain"
                [class.p-button-warning]="isPageBookmarked()"
                (click)="onBookmarkClick()"
                pTooltip="Marcar como favorito"
                tooltipPosition="bottom"
            ></button>
            <button
                pButton
                pRipple
                type="button"
                icon="pi pi-sign-out"
                class="p-button-rounded p-button-text p-button-secondary"
                (click)="onClosePage()"
                pTooltip="Cerrar página"
                tooltipPosition="bottom"
                [disabled]="!canClosePage()"
            ></button>
        </div>
    `,
    host: {
        class: 'layout-breadcrumb-container'
    }
})
export class AppBreadcrumb {
    private readonly _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

    readonly breadcrumbs$ = this._breadcrumbs$.asObservable();

    // Almacenar páginas favoritas en localStorage
    private bookmarkedPages: string[] = [];

    constructor(
        private router: Router,
        private messageService: MessageService,
        private usuarioService: UsuarioService
    ) {
        // Cargar páginas favoritas del localStorage
        const saved = localStorage.getItem('bookmarkedPages');
        if (saved) {
            this.bookmarkedPages = JSON.parse(saved);
        }
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
            const root = this.router.routerState.snapshot.root;
            const breadcrumbs: Breadcrumb[] = [];
            this.addBreadcrumb(root, [], breadcrumbs);

            this._breadcrumbs$.next(breadcrumbs);
        });
    }

    private addBreadcrumb(route: ActivatedRouteSnapshot, parentUrl: string[], breadcrumbs: Breadcrumb[]) {
        const routeUrl = parentUrl.concat(route.url.map((url) => url.path));
        const breadcrumb = route.data['breadcrumb'];
        const parentBreadcrumb = route.parent && route.parent.data ? route.parent.data['breadcrumb'] : null;

        if (breadcrumb && breadcrumb !== parentBreadcrumb) {
            breadcrumbs.push({
                label: route.data['breadcrumb'],
                url: '/' + routeUrl.join('/')
            });
        }

        if (route.firstChild) {
            this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
        }
    }


    /**
     * Función del botón de favorito
     */
    onBookmarkClick(): void {
        const currentUrl = this.router.url;
        const currentPageTitle = this.getCurrentPageTitle();

        if (this.isPageBookmarked()) {
            // Remover de favoritos
            this.bookmarkedPages = this.bookmarkedPages.filter(url => url !== currentUrl);
            localStorage.setItem('bookmarkedPages', JSON.stringify(this.bookmarkedPages));

            this.messageService.add({
                severity: 'warn',
                summary: '⭐ Removido de favoritos',
                detail: `"${currentPageTitle}" removido de tus favoritos`,
                life: 2000
            });
        } else {
            // Agregar a favoritos
            this.bookmarkedPages.push(currentUrl);
            localStorage.setItem('bookmarkedPages', JSON.stringify(this.bookmarkedPages));

            this.messageService.add({
                severity: 'success',
                summary: '⭐ Agregado a favoritos',
                detail: `"${currentPageTitle}" agregado a tus favoritos`,
                life: 2000
            });
        }
    }

    /**
     * Obtener el título de la página actual desde el breadcrumb
     */
    private getCurrentPageTitle(): string {
        const breadcrumbs = this._breadcrumbs$.value;
        if (breadcrumbs.length > 0) {
            return breadcrumbs[breadcrumbs.length - 1].label;
        }
        return 'Página actual';
    }

    /**
     * Verifica si la página actual está en favoritos
     */
    isPageBookmarked(): boolean {
        return this.bookmarkedPages.includes(this.router.url);
    }

    /**
     * Función del botón de cerrar página
     */
    onClosePage(): void {
        // Verificar si hay páginas en el historial para volver atrás
        if (window.history.length > 1) {
            // Volver a la página anterior
            window.history.back();
            this.messageService.add({
                severity: 'info',
                summary: '⬅️ Volviendo atrás',
                detail: 'Regresando a la página anterior',
                life: 1500
            });
        } else {
            // Si no hay historial, ir al dashboard
            this.router.navigate(['/']);
            this.messageService.add({
                severity: 'info',
                summary: '🏠 Volviendo al inicio',
                detail: 'Redirigiendo al dashboard',
                life: 1500
            });
        }
    }

    /**
     * Verifica si se puede cerrar la página
     */
    canClosePage(): boolean {
        // No mostrar el botón si estamos en el dashboard raíz
        return this.router.url !== '/' && this._breadcrumbs$.value.length > 0;
    }

}
