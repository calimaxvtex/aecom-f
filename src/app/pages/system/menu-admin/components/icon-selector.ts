import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-icon-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, TabsModule, ButtonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IconSelector),
            multi: true
        }
    ],
    template: `
        <div class="icon-selector">
            <!-- Búsqueda mejorada -->
            <div class="mb-3">
                <div class="flex gap-2">
                    <input 
                        pInputText 
                        [(ngModel)]="searchText"
                        placeholder="Buscar icono... (ej: usuario, casa, configuración)"
                        class="flex-1"
                        (input)="filterIcons()"
                    />
                    <button 
                        pButton 
                        icon="pi pi-times" 
                        class="p-button-text p-button-sm"
                        (click)="clearSearch()"
                        *ngIf="searchText"
                        pTooltip="Limpiar búsqueda"
                    ></button>
                </div>
                <!-- Sugerencias rápidas -->
                <div class="mt-2" *ngIf="suggestedIcons.length > 0 && !searchText">
                    <small class="text-gray-600">💡 Sugeridos para "{{currentLabel}}":</small>
                    <div class="flex gap-1 mt-1">
                        <button 
                            *ngFor="let icon of suggestedIcons" 
                            pButton 
                            class="p-button-sm p-button-outlined p-button-text"
                            (click)="selectIcon(icon)"
                            [pTooltip]="icon"
                        >
                            <i [class]="icon" class="text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Pestañas por categorías -->
            <p-tabs>
                <p-tabPanel header="Todos" *ngIf="searchText">
                    <div class="icon-grid">
                        <div *ngFor="let icon of filteredIcons" 
                             class="icon-item"
                             [class.selected]="_value === icon.class"
                             (click)="selectIcon(icon.class)"
                             [title]="icon.name + ' - ' + icon.keywords.join(', ')">
                            <i [class]="icon.class"></i>
                            <span class="icon-name">{{icon.name}}</span>
                        </div>
                    </div>
                </p-tabPanel>
                
                <p-tabPanel *ngFor="let category of categories" [header]="category.label">
                    <div class="icon-grid">
                        <div *ngFor="let icon of category.icons" 
                             class="icon-item"
                             [class.selected]="_value === icon.class"
                             (click)="selectIcon(icon.class)"
                             [title]="icon.name + ' - ' + icon.keywords.join(', ')">
                            <i [class]="icon.class"></i>
                            <span class="icon-name">{{icon.name}}</span>
                        </div>
                    </div>
                </p-tabPanel>
            </p-tabs>
        </div>
    `,
    styles: [`
        .icon-selector {
            max-height: 400px;
            overflow-y: auto;
        }
        
        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 0.5rem;
            padding: 1rem 0;
        }
        
        .icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0.75rem;
            border: 1px solid var(--surface-border);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            background: var(--surface-card);
        }
        
        .icon-item:hover {
            background: var(--surface-hover);
            border-color: var(--primary-color);
        }
        
        .icon-item.selected {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        
        .icon-item i {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        .icon-name {
            font-size: 0.75rem;
            text-align: center;
            word-break: break-all;
        }
    `]
})
export class IconSelector implements ControlValueAccessor {
    @Input() selectedIcon: string = '';
    @Output() selectedIconChange = new EventEmitter<string>();

    // ControlValueAccessor implementation
    _value: string = '';
    private _onChange = (value: string) => {};
    private _onTouched = () => {};
    disabled = false;

    searchText = '';
    filteredIcons: string[] = [];

    // Iconos ya utilizados en el proyecto
    projectIcons: string[] = [
        'pi pi-home',
        'pi pi-th-large',
        'pi pi-fw pi-chart-pie',
        'pi pi-fw pi-home',
        'pi pi-fw pi-bolt',
        'pi pi-fw pi-comment',
        'pi pi-fw pi-comments',
        'pi pi-fw pi-folder',
        'pi pi-fw pi-sliders-v',
        'pi pi-fw pi-envelope',
        'pi pi-fw pi-inbox',
        'pi pi-fw pi-calendar',
        'pi pi-fw pi-user',
        'pi pi-fw pi-users',
        'pi pi-fw pi-cog',
        'pi pi-fw pi-wrench',
        'pi pi-fw pi-file',
        'pi pi-fw pi-file-text',
        'pi pi-fw pi-image',
        'pi pi-fw pi-video',
        'pi pi-fw pi-music',
        'pi pi-fw pi-download',
        'pi pi-fw pi-upload',
        'pi pi-fw pi-share-alt',
        'pi pi-fw pi-link',
        'pi pi-fw pi-external-link',
        'pi pi-fw pi-print',
        'pi pi-fw pi-save',
        'pi pi-fw pi-edit',
        'pi pi-fw pi-trash',
        'pi pi-fw pi-plus',
        'pi pi-fw pi-minus',
        'pi pi-fw pi-check',
        'pi pi-fw pi-times',
        'pi pi-fw pi-search',
        'pi pi-fw pi-filter',
        'pi pi-fw pi-sort',
        'pi pi-fw pi-sort-up',
        'pi pi-fw pi-sort-down',
        'pi pi-fw pi-arrow-up',
        'pi pi-fw pi-arrow-down',
        'pi pi-fw pi-arrow-left',
        'pi pi-fw pi-arrow-right',
        'pi pi-fw pi-chevron-up',
        'pi pi-fw pi-chevron-down',
        'pi pi-fw pi-chevron-left',
        'pi pi-fw pi-chevron-right',
        'pi pi-fw pi-angle-up',
        'pi pi-fw pi-angle-down',
        'pi pi-fw pi-angle-left',
        'pi pi-fw pi-angle-right',
        'pi pi-fw pi-circle',
        'pi pi-fw pi-circle-fill',
        'pi pi-fw pi-square',
        'pi pi-fw pi-square-fill',
        'pi pi-fw pi-dot',
        'pi pi-fw pi-dot-fill'
    ];

    // Iconos más populares
    popularIcons: string[] = [
        'pi pi-home',
        'pi pi-user',
        'pi pi-users',
        'pi pi-cog',
        'pi pi-wrench',
        'pi pi-file',
        'pi pi-folder',
        'pi pi-envelope',
        'pi pi-phone',
        'pi pi-calendar',
        'pi pi-clock',
        'pi pi-map-marker',
        'pi pi-globe',
        'pi pi-link',
        'pi pi-share-alt',
        'pi pi-heart',
        'pi pi-star',
        'pi pi-thumbs-up',
        'pi pi-thumbs-down',
        'pi pi-eye',
        'pi pi-eye-slash',
        'pi pi-lock',
        'pi pi-unlock',
        'pi pi-key',
        'pi pi-shield',
        'pi pi-info-circle',
        'pi pi-question-circle',
        'pi pi-exclamation-triangle',
        'pi pi-times-circle',
        'pi pi-check-circle',
        'pi pi-plus-circle',
        'pi pi-minus-circle',
        'pi pi-times',
        'pi pi-check',
        'pi pi-plus',
        'pi pi-minus',
        'pi pi-search',
        'pi pi-filter',
        'pi pi-sort',
        'pi pi-arrow-up',
        'pi pi-arrow-down',
        'pi pi-arrow-left',
        'pi pi-arrow-right',
        'pi pi-chevron-up',
        'pi pi-chevron-down',
        'pi pi-chevron-left',
        'pi pi-chevron-right',
        'pi pi-angle-up',
        'pi pi-angle-down',
        'pi pi-angle-left',
        'pi pi-angle-right',
        'pi pi-circle',
        'pi pi-square'
    ];

    // Todos los iconos para búsqueda
    allIcons: string[] = [
        ...this.projectIcons,
        ...this.popularIcons,
        'pi pi-adobe',
        'pi pi-amazon',
        'pi pi-android',
        'pi pi-apple',
        'pi pi-bitcoin',
        'pi pi-chrome',
        'pi pi-codepen',
        'pi pi-discord',
        'pi pi-facebook',
        'pi pi-github',
        'pi pi-google',
        'pi pi-instagram',
        'pi pi-linkedin',
        'pi pi-microsoft',
        'pi pi-paypal',
        'pi pi-reddit',
        'pi pi-slack',
        'pi pi-snapchat',
        'pi pi-spotify',
        'pi pi-telegram',
        'pi pi-tiktok',
        'pi pi-twitter',
        'pi pi-whatsapp',
        'pi pi-youtube',
        'pi pi-zoom'
    ];

    ngOnInit() {
        this.filteredIcons = this.allIcons;
    }

    selectIcon(icon: string): void {
        this._value = icon;
        this.selectedIcon = icon;
        this._onChange(icon);
        this._onTouched();
        this.selectedIconChange.emit(icon);
    }

    filterIcons(): void {
        if (!this.searchText.trim()) {
            this.filteredIcons = this.allIcons;
        } else {
            this.filteredIcons = this.allIcons.filter(icon => 
                icon.toLowerCase().includes(this.searchText.toLowerCase())
            );
        }
    }

    // ControlValueAccessor methods
    writeValue(value: string): void {
        this._value = value || '';
        this.selectedIcon = this._value;
    }

    registerOnChange(fn: (value: string) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
