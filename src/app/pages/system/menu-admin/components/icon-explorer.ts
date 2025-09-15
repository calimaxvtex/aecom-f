import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface IconCategory {
    name: string;
    label: string;
    icons: string[];
    color: string;
    description: string;
}

@Component({
    selector: 'app-icon-explorer',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        TagModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <div class="p-4">
            <!-- Header -->
            <div class="mb-6">
                <h2 class="text-xl font-semibold mb-2">🎨 Explorador de Iconos</h2>
                <p class="text-gray-600">Descubre y copia iconos organizados por categorías para usar en tu aplicación</p>
            </div>

            <!-- Búsqueda global -->
            <div class="mb-6">
                <input 
                    pInputText 
                    type="text" 
                    [(ngModel)]="searchText" 
                    placeholder="Buscar iconos por nombre..." 
                    class="w-full"
                    (input)="applyFilters()"
                />
            </div>

            <!-- Filtros por categoría -->
            <div class="flex flex-wrap gap-2 mb-6">
                <p-button 
                    label="Todas" 
                    [severity]="selectedCategory === null ? 'primary' : 'secondary'"
                    [outlined]="selectedCategory !== null"
                    (onClick)="clearCategoryFilter()" 
                    size="small"
                />
                <p-button 
                    *ngFor="let category of iconCategories" 
                    [label]="category.label"
                    [severity]="selectedCategory === category.name ? 'primary' : 'secondary'"
                    [outlined]="selectedCategory !== category.name"
                    (onClick)="filterByCategory(category.name)" 
                    size="small"
                />
            </div>

            <!-- Estadísticas -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-blue-600 font-medium">Total de Iconos</p>
                            <p class="text-2xl font-bold text-blue-800">{{ getTotalIcons() }}</p>
                        </div>
                        <i class="pi pi-chart-bar text-blue-500 text-2xl"></i>
                    </div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-green-600 font-medium">Categorías</p>
                            <p class="text-2xl font-bold text-green-800">{{ iconCategories.length }}</p>
                        </div>
                        <i class="pi pi-tags text-green-500 text-2xl"></i>
                    </div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-purple-600 font-medium">Mostrando</p>
                            <p class="text-2xl font-bold text-purple-800">{{ getFilteredIconsCount() }}</p>
                        </div>
                        <i class="pi pi-filter text-purple-500 text-2xl"></i>
                    </div>
                </div>
            </div>

            <!-- Categorías de iconos -->
            <div class="space-y-6">
                <div *ngFor="let category of getFilteredCategories()" class="category-section">
                    <!-- Header de categoría -->
                    <div class="flex items-center justify-between mb-4 pb-2 border-b">
                        <div class="flex items-center gap-3">
                            <div class="w-4 h-4 rounded-full" [style.background-color]="category.color"></div>
                            <h3 class="text-lg font-semibold">{{ category.label }}</h3>
                            <p-tag 
                                [value]="getFilteredIcons(category).length.toString()" 
                                severity="info" 
                                class="text-xs"
                            />
                        </div>
                        <p class="text-sm text-gray-500">{{ category.description }}</p>
                    </div>

                    <!-- Grid de iconos -->
                    <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                        <div
                            *ngFor="let icon of getFilteredIcons(category)"
                            class="icon-card group relative bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                            (click)="copyIcon(icon, $event)"
                            [title]="'Clic para copiar: ' + icon"
                        >
                            <!-- Icono -->
                            <div class="flex flex-col items-center">
                                <i [class]="icon" class="text-2xl mb-2 text-gray-700 group-hover:text-blue-600"></i>
                                <span class="text-xs text-center text-gray-500 group-hover:text-blue-600 break-all leading-tight">
                                    {{ getIconName(icon) }}
                                </span>
                            </div>

                            <!-- Botón de copiar (aparece en hover) -->
                            <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p-button
                                    icon="pi pi-copy"
                                    (onClick)="copyIcon(icon, $event)"
                                    [text]="true"
                                    size="small"
                                    severity="secondary"
                                    class="p-1 w-6 h-6"
                                    pTooltip="Copiar código"
                                />
                            </div>

                            <!-- Indicador de copiado -->
                            <div 
                                class="absolute inset-0 bg-green-100 border-green-300 rounded-lg flex items-center justify-center opacity-0 transition-opacity"
                                [class.opacity-100]="copiedIcon === icon"
                            >
                                <i class="pi pi-check text-green-600 text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Mensaje cuando no hay iconos en la categoría -->
                    <div *ngIf="getFilteredIcons(category).length === 0" class="text-center py-8 text-gray-500">
                        <i class="pi pi-info-circle text-2xl mb-2"></i>
                        <p>No se encontraron iconos en esta categoría</p>
                    </div>
                </div>
            </div>

            <!-- Mensaje cuando no hay resultados -->
            <div *ngIf="getFilteredCategories().length === 0" class="text-center py-12">
                <i class="pi pi-search text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-600 mb-2">No se encontraron iconos</h3>
                <p class="text-gray-500">Intenta con otros términos de búsqueda o selecciona una categoría diferente</p>
                <p-button 
                    label="Limpiar filtros" 
                    icon="pi pi-refresh" 
                    (onClick)="clearAllFilters()"
                    class="mt-4"
                    [text]="true"
                />
            </div>
        </div>

        <!-- Toast para notificaciones -->
        <p-toast />
    `,
    styles: [`
        .icon-card {
            min-height: 80px;
        }
        
        .icon-card:hover {
            transform: translateY(-2px);
        }
        
        .category-section:not(:last-child) {
            margin-bottom: 2rem;
        }
        
        .icon-card .p-button {
            width: 24px !important;
            height: 24px !important;
            min-width: 24px !important;
        }
        
        .icon-card .p-button .p-button-icon {
            font-size: 0.75rem;
        }
    `]
})
export class IconExplorer implements OnInit {
    searchText = '';
    selectedCategory: string | null = null;
    copiedIcon = '';
    
    iconCategories: IconCategory[] = [
        {
            name: 'popular',
            label: 'Populares',
            color: '#3b82f6',
            description: 'Los iconos más utilizados en aplicaciones',
            icons: [
                'pi pi-home', 'pi pi-user', 'pi pi-users', 'pi pi-cog', 'pi pi-chart-bar',
                'pi pi-file', 'pi pi-folder', 'pi pi-calendar', 'pi pi-clock', 'pi pi-envelope',
                'pi pi-phone', 'pi pi-map-marker', 'pi pi-shopping-cart', 'pi pi-credit-card', 'pi pi-dollar',
                'pi pi-heart', 'pi pi-star', 'pi pi-bookmark', 'pi pi-tag', 'pi pi-tags',
                'pi pi-search', 'pi pi-filter', 'pi pi-sort', 'pi pi-list', 'pi pi-th-large',
                'pi pi-plus', 'pi pi-minus', 'pi pi-times', 'pi pi-check', 'pi pi-exclamation-triangle',
                'pi pi-info-circle', 'pi pi-question-circle', 'pi pi-bell', 'pi pi-lock', 'pi pi-unlock'
            ]
        },
        {
            name: 'admin',
            label: 'Administración',
            color: '#8b5cf6',
            description: 'Iconos para paneles de administración y gestión',
            icons: [
                'pi pi-cog', 'pi pi-wrench', 'pi pi-sliders-h', 'pi pi-desktop',
                'pi pi-users', 'pi pi-user-plus', 'pi pi-user-minus', 'pi pi-shield',
                'pi pi-key', 'pi pi-lock', 'pi pi-unlock', 'pi pi-eye', 'pi pi-eye-slash',
                'pi pi-bars', 'pi pi-list', 'pi pi-th-large', 'pi pi-table',
                'pi pi-database', 'pi pi-server', 'pi pi-cloud', 'pi pi-link',
                'pi pi-globe', 'pi pi-wifi', 'pi pi-sitemap', 'pi pi-chart-bar',
                'pi pi-chart-line', 'pi pi-chart-pie', 'pi pi-percentage'
            ]
        },
        {
            name: 'navigation',
            label: 'Navegación',
            color: '#10b981',
            description: 'Flechas, direcciones y controles de navegación',
            icons: [
                'pi pi-home', 'pi pi-arrow-left', 'pi pi-arrow-right', 'pi pi-arrow-up', 'pi pi-arrow-down',
                'pi pi-chevron-left', 'pi pi-chevron-right', 'pi pi-chevron-up', 'pi pi-chevron-down',
                'pi pi-angle-left', 'pi pi-angle-right', 'pi pi-angle-up', 'pi pi-angle-down',
                'pi pi-angle-double-left', 'pi pi-angle-double-right', 'pi pi-angle-double-up', 'pi pi-angle-double-down',
                'pi pi-caret-left', 'pi pi-caret-right', 'pi pi-caret-up', 'pi pi-caret-down',
                'pi pi-step-backward', 'pi pi-step-forward', 'pi pi-fast-backward', 'pi pi-fast-forward',
                'pi pi-backward', 'pi pi-forward', 'pi pi-replay', 'pi pi-refresh'
            ]
        },
        {
            name: 'actions',
            label: 'Acciones',
            color: '#f59e0b',
            description: 'Botones de acción y operaciones CRUD',
            icons: [
                'pi pi-plus', 'pi pi-minus', 'pi pi-times', 'pi pi-check', 'pi pi-save', 'pi pi-trash',
                'pi pi-pencil', 'pi pi-copy', 'pi pi-clone', 'pi pi-undo', 'pi pi-redo', 'pi pi-sync',
                'pi pi-download', 'pi pi-upload', 'pi pi-external-link', 'pi pi-link', 'pi pi-unlink',
                'pi pi-print', 'pi pi-share-alt', 'pi pi-send', 'pi pi-reply', 'pi pi-forward',
                'pi pi-play', 'pi pi-pause', 'pi pi-stop', 'pi pi-eject', 'pi pi-power-off',
                'pi pi-expand', 'pi pi-compress', 'pi pi-eye', 'pi pi-eye-slash', 'pi pi-search'
            ]
        },
        {
            name: 'business',
            label: 'Negocios',
            color: '#8b5cf6',
            description: 'Gráficos, finanzas y elementos empresariales',
            icons: [
                'pi pi-chart-bar', 'pi pi-chart-line', 'pi pi-chart-pie', 'pi pi-calculator', 'pi pi-percentage',
                'pi pi-dollar', 'pi pi-euro', 'pi pi-pound', 'pi pi-credit-card', 'pi pi-paypal',
                'pi pi-shopping-cart', 'pi pi-shopping-bag', 'pi pi-gift', 'pi pi-ticket', 'pi pi-receipt',
                'pi pi-briefcase', 'pi pi-building', 'pi pi-warehouse', 'pi pi-truck', 'pi pi-car',
                'pi pi-globe', 'pi pi-map', 'pi pi-map-marker', 'pi pi-compass', 'pi pi-directions',
                'pi pi-users', 'pi pi-user-plus', 'pi pi-user-minus', 'pi pi-id-card', 'pi pi-address-book'
            ]
        },
        {
            name: 'communication',
            label: 'Comunicación',
            color: '#ef4444',
            description: 'Email, teléfono, chat y medios sociales',
            icons: [
                'pi pi-envelope', 'pi pi-inbox', 'pi pi-send', 'pi pi-reply', 'pi pi-reply-all',
                'pi pi-phone', 'pi pi-mobile', 'pi pi-fax', 'pi pi-microphone', 'pi pi-volume-up',
                'pi pi-volume-down', 'pi pi-volume-off', 'pi pi-comment', 'pi pi-comments', 'pi pi-chat',
                'pi pi-bell', 'pi pi-bell-slash', 'pi pi-bullhorn', 'pi pi-rss', 'pi pi-wifi',
                'pi pi-bluetooth', 'pi pi-signal', 'pi pi-satellite', 'pi pi-podcast', 'pi pi-video',
                'pi pi-camera', 'pi pi-image', 'pi pi-images', 'pi pi-file-video', 'pi pi-youtube'
            ]
        },
        {
            name: 'files',
            label: 'Archivos',
            color: '#06b6d4',
            description: 'Documentos, carpetas y almacenamiento',
            icons: [
                'pi pi-file', 'pi pi-file-o', 'pi pi-file-text', 'pi pi-file-word', 'pi pi-file-excel',
                'pi pi-file-pdf', 'pi pi-file-image', 'pi pi-file-video', 'pi pi-file-audio', 'pi pi-file-code',
                'pi pi-folder', 'pi pi-folder-open', 'pi pi-folder-plus', 'pi pi-archive', 'pi pi-database',
                'pi pi-server', 'pi pi-cloud', 'pi pi-cloud-download', 'pi pi-cloud-upload', 'pi pi-hdd',
                'pi pi-save', 'pi pi-download', 'pi pi-upload', 'pi pi-paperclip', 'pi pi-link',
                'pi pi-bookmark', 'pi pi-tag', 'pi pi-tags', 'pi pi-sitemap', 'pi pi-list'
            ]
        }
    ];

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        console.log('🎨 IconExplorer inicializado con', this.getTotalIcons(), 'iconos');
    }

    // Filtros y búsqueda
    applyFilters(): void {
        // El filtrado se realiza automáticamente en getFilteredCategories()
    }

    filterByCategory(categoryName: string): void {
        this.selectedCategory = this.selectedCategory === categoryName ? null : categoryName;
    }

    clearCategoryFilter(): void {
        this.selectedCategory = null;
    }

    clearAllFilters(): void {
        this.searchText = '';
        this.selectedCategory = null;
    }

    // Obtener datos filtrados
    getFilteredCategories(): IconCategory[] {
        let categories = this.iconCategories;
        
        // Filtrar por categoría seleccionada
        if (this.selectedCategory) {
            categories = categories.filter(cat => cat.name === this.selectedCategory);
        }
        
        // Solo mostrar categorías que tengan iconos después del filtro de búsqueda
        return categories.filter(category => this.getFilteredIcons(category).length > 0);
    }

    getFilteredIcons(category: IconCategory): string[] {
        if (!this.searchText) {
            return category.icons;
        }
        
        const search = this.searchText.toLowerCase();
        return category.icons.filter(icon => 
            icon.toLowerCase().includes(search) ||
            this.getIconName(icon).toLowerCase().includes(search)
        );
    }

    // Estadísticas
    getTotalIcons(): number {
        // Usar Set para evitar duplicados entre categorías
        const allIcons = new Set<string>();
        this.iconCategories.forEach(category => {
            category.icons.forEach(icon => allIcons.add(icon));
        });
        return allIcons.size;
    }

    getFilteredIconsCount(): number {
        let count = 0;
        this.getFilteredCategories().forEach(category => {
            count += this.getFilteredIcons(category).length;
        });
        return count;
    }

    // Utilidades
    getIconName(icon: string): string {
        return icon.replace('pi pi-', '').replace(/-/g, ' ');
    }

    // Copiar icono al portapapeles
    copyIcon(icon: string, event: Event): void {
        event.stopPropagation();
        
        // Copiar al portapapeles
        navigator.clipboard.writeText(icon).then(() => {
            // Mostrar feedback visual
            this.copiedIcon = icon;
            
            // Mostrar toast
            this.messageService.add({
                severity: 'success',
                summary: 'Copiado',
                detail: `Icono "${icon}" copiado al portapapeles`,
                life: 2000
            });
            
            // Limpiar feedback después de 1 segundo
            setTimeout(() => {
                this.copiedIcon = '';
            }, 1000);
            
        }).catch(err => {
            console.error('Error al copiar:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo copiar el icono',
                life: 3000
            });
        });
    }
}
