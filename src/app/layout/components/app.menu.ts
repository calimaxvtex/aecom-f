import { Component, ElementRef, inject, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { MenuLoaderService } from '@/core/services/menu/menu-loader.service';
import { SkeletonModule } from 'primeng/skeleton';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu, [app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, SkeletonModule],
    template: `
        <!-- Loading state -->
        <div *ngIf="loading || model.length === 0" class="layout-menu-loading">
            <ng-container *ngFor="let i of skeletonItems">
                <div class="menu-skeleton-item">
                    <p-skeleton width="100%" height="40px" styleClass="mb-2"></p-skeleton>
                    <ng-container *ngIf="i < 3">
                        <p-skeleton width="80%" height="32px" styleClass="mb-1 ml-4" *ngFor="let j of [1,2]"></p-skeleton>
                    </ng-container>
                </div>
            </ng-container>
        </div>

        <!-- Menu content -->
        <ul *ngIf="!loading && model.length > 0" class="layout-menu" #menuContainer>
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `,
    styles: [`
        .layout-menu-loading {
            padding: 1rem;
        }

        .menu-skeleton-item {
            margin-bottom: 1rem;
        }

        .menu-skeleton-item p-skeleton {
            border-radius: 6px;
        }
    `]
})
export class AppMenu implements OnInit, OnDestroy {
    el: ElementRef = inject(ElementRef);
    private menuLoaderService = inject(MenuLoaderService);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    model: MenuItem[] = [];
    loading = true;
    skeletonItems = [1, 2, 3, 4, 5]; // 5 items de skeleton

    private subscriptions: Subscription[] = [];
    private renderRetryCount = 0;
    private maxRetries = 3;

    async ngOnInit(): Promise<void> {
        // Suscribirse a cambios del menú
        this.subscriptions.push(
            this.menuLoaderService.menu$.subscribe(menu => {
                if (menu !== null) {
                    this.model = menu;
                    // Forzar detección de cambios para asegurar renderizado
                    this.forceMenuRender();
                }
            })
        );

        // Suscribirse a cambios de loading
        this.subscriptions.push(
            this.menuLoaderService.loading$.subscribe(loading => {
                this.loading = loading;
                // Forzar detección de cambios para asegurar renderizado
                this.cdr.detectChanges();
            })
        );

        // Inicializar el menú dinámico
        await this.menuLoaderService.initialize();
    }

    /**
     * Fuerza el renderizado del menú con reintentos
     */
    private forceMenuRender(): void {
        try {
            this.cdr.detectChanges();
            
            // Verificar si el menú se renderizó correctamente
            setTimeout(() => {
                this.verifyMenuRender();
            }, 100);
        } catch (error) {
            console.warn('⚠️ Error forzando renderizado del menú:', error);
            this.retryMenuRender();
        }
    }

    /**
     * Verifica si el menú se renderizó correctamente y reintenta si es necesario
     */
    private verifyMenuRender(): void {
        const menuElement = this.el.nativeElement.querySelector('.layout-menu');
        const menuItems = menuElement?.querySelectorAll('li');
        
        // Si no hay elementos del menú visibles, reintentar
        if (!menuItems || menuItems.length === 0) {
            console.warn('⚠️ Menú no renderizado correctamente, reintentando...');
            this.retryMenuRender();
        } else {
            console.log('✅ Menú renderizado correctamente con', menuItems.length, 'elementos');
            this.renderRetryCount = 0; // Reset counter on success
        }
    }

    /**
     * Reintenta el renderizado del menú
     */
    private retryMenuRender(): void {
        if (this.renderRetryCount < this.maxRetries) {
            this.renderRetryCount++;
            console.log(`🔄 Reintento ${this.renderRetryCount}/${this.maxRetries} de renderizado del menú`);
            
            setTimeout(() => {
                this.forceMenuRender();
            }, 200 * this.renderRetryCount); // Incrementar delay con cada reintento
        } else {
            console.error('❌ Falló el renderizado del menú después de', this.maxRetries, 'intentos');
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
