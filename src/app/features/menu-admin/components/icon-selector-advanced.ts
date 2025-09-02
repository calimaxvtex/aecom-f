import { Component, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';

interface IconCategory {
    name: string;
    label: string;
    icons: string[];
}

@Component({
    selector: 'app-icon-selector-advanced',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        TabsModule
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IconSelectorAdvanced),
            multi: true
        }
    ],
    template: `
        <div class="icon-selector-field">
            <!-- Campo actual con preview -->
            <div class="flex gap-2 items-center">
                <div class="flex-1">
                    <input
                        pInputText
                        [(ngModel)]="selectedIcon"
                        placeholder="Seleccionar icono..."
                        readonly
                        class="w-full cursor-pointer"
                        (click)="openDialog()"
                    />
                </div>
                <div class="w-12 h-10 flex items-center justify-center border rounded">
                    <i *ngIf="selectedIcon" [class]="selectedIcon" class="text-lg"></i>
                    <span *ngIf="!selectedIcon" class="text-gray-400 text-xs">No</span>
                </div>
                <p-button
                    icon="pi pi-search"
                    (onClick)="openDialog()"
                    [text]="true"
                    class="p-button-sm"
                />
            </div>
        </div>

        <!-- Dialog selector -->
        <p-dialog
            header="Seleccionar Icono"
            [(visible)]="showDialog"
            [modal]="true"
            [style]="{width: '800px', height: '600px'}"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
        >
            <div class="icon-selector-content h-full flex flex-col">
                <!-- Búsqueda global -->
                <div class="mb-4">
                    <input
                        pInputText
                        [(ngModel)]="searchText"
                        placeholder="Buscar iconos..."
                        class="w-full"
                        (input)="filterIcons()"
                    />
                </div>

                <!-- Tabs de categorías -->
                <div class="flex-1 overflow-hidden">
                    <p-tabs [value]="activeTabIndex.toString()">
                        <p-tablist>
                            <p-tab *ngFor="let category of iconCategories; let i = index" [value]="i.toString()">
                                {{category.label}}
                            </p-tab>
                        </p-tablist>
                        <p-tabpanels>
                            <p-tabpanel *ngFor="let category of iconCategories; let i = index" [value]="i.toString()">
                                <div class="icon-grid-container h-80 overflow-y-auto">
                                    <div class="grid grid-cols-8 gap-3 p-2">
                                        <div
                                            *ngFor="let icon of getFilteredIcons(category)"
                                            class="icon-item flex flex-col items-center p-3 border rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                            [class.selected]="selectedIcon === icon"
                                            (click)="selectIcon(icon)"
                                        >
                                            <i [class]="icon" class="text-2xl mb-2"></i>
                                            <span class="text-xs text-center break-all">{{getIconName(icon)}}</span>
                                        </div>
                                    </div>
                                    
                                    <div *ngIf="getFilteredIcons(category).length === 0" class="text-center py-8 text-gray-500">
                                        <i class="pi pi-info-circle text-2xl mb-2"></i>
                                        <p>No se encontraron iconos</p>
                                    </div>
                                </div>
                            </p-tabpanel>
                        </p-tabpanels>
                    </p-tabs>
                </div>

                <!-- Botones -->
                <div class="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <p-button
                        label="Limpiar"
                        icon="pi pi-times"
                        (onClick)="clearSelection()"
                        class="p-button-text"
                    />
                    <p-button
                        label="Cancelar"
                        icon="pi pi-times"
                        (onClick)="closeDialog()"
                        class="p-button-text"
                    />
                    <p-button
                        label="Seleccionar"
                        icon="pi pi-check"
                        (onClick)="confirmSelection()"
                        [disabled]="!selectedIcon"
                    />
                </div>
            </div>
        </p-dialog>
    `,
    styles: [`
        .icon-item.selected {
            background-color: #3b82f6 !important;
            color: white;
            border-color: #3b82f6 !important;
        }
        
        .icon-grid-container {
            max-height: 320px;
        }
        
        :host ::ng-deep .p-dialog-content {
            padding: 1rem !important;
        }
    `]
})
export class IconSelectorAdvanced implements OnInit, ControlValueAccessor {
    selectedIcon = '';
    showDialog = false;
    searchText = '';
    activeTabIndex = '0';
    
    iconCategories: IconCategory[] = [
        {
            name: 'popular',
            label: 'Populares',
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
            name: 'navigation',
            label: 'Navegación',
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

    // ControlValueAccessor implementation
    private onChange = (value: string) => {};
    private onTouched = () => {};

    ngOnInit() {
        // Inicialización si es necesaria
    }

    writeValue(value: string): void {
        this.selectedIcon = value || '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        // Implementar si es necesario
    }

    openDialog(): void {
        this.showDialog = true;
        this.searchText = '';
        this.activeTabIndex = '0';
    }

    closeDialog(): void {
        this.showDialog = false;
        this.searchText = '';
    }

    selectIcon(icon: string): void {
        this.selectedIcon = icon;
    }

    confirmSelection(): void {
        this.onChange(this.selectedIcon);
        this.onTouched();
        this.closeDialog();
    }

    clearSelection(): void {
        this.selectedIcon = '';
        this.onChange('');
        this.onTouched();
        this.closeDialog();
    }

    filterIcons(): void {
        // El filtrado se hace en getFilteredIcons()
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

    getIconName(icon: string): string {
        return icon.replace('pi pi-', '').replace(/-/g, ' ');
    }
}
