import {computed, effect, Injectable, signal, Signal, WritableSignal} from '@angular/core';
import {Subject} from 'rxjs';
import {MenuItem} from 'primeng/api';

export type MenuMode = 'static' | 'overlay' | 'slim-plus' | 'slim' | 'horizontal' | 'reveal' | 'drawer';

export interface layoutConfig {
    primary: string;
    surface: string | undefined | null;
    darkTheme: boolean;
    menuMode: MenuMode;
    menuTheme: string;
    topbarTheme: string;
    menuProfilePosition: string;
}

export interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    configSidebarVisible: boolean;
    staticMenuMobileActive: boolean;
    menuHoverActive: boolean;
    rightMenuActive: boolean;
    topbarMenuActive: boolean;
    sidebarActive: boolean;
    activeMenuItem: any;
    overlaySubmenuActive: boolean;
    anchored: boolean;
    menuProfileActive: boolean;
}

export interface MenuChangeEvent {
    key: string;
    routeEvent?: boolean;
}

export interface TabCloseEvent {
    tab: MenuItem;
    index: number;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    private readonly CONFIG_KEY = 'calimax-layout-config';

    // 🎨 OPCIONES DE COLORES DISPONIBLES
    readonly colorOptions = {
        primary: ['emerald', 'blue', 'indigo', 'purple', 'pink', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'teal', 'cyan', 'sky', 'violet', 'fuchsia', 'rose'],
        surface: ['slate', 'gray', 'zinc', 'neutral', 'stone'],
        themes: ['light', 'dark', 'emerald', 'blue', 'indigo', 'purple', 'pink', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'teal', 'cyan', 'sky', 'violet', 'fuchsia', 'rose']
    };

    // 🚀 MÉTODO PARA CAMBIAR COLORES RÁPIDAMENTE
    changeTheme(primary: string = 'emerald', surface: string = 'slate', menuTheme: string = 'emerald', topbarTheme: string = 'emerald') {
        console.log(`🎨 Cambiando tema - Primary: ${primary}, Surface: ${surface}, Menu: ${menuTheme}, Topbar: ${topbarTheme}`);

        this.layoutConfig.update((config) => ({
            ...config,
            primary,
            surface,
            menuTheme,
            topbarTheme
        }));

        // Guardar en localStorage
        this.saveConfigToStorage(this.layoutConfig());
    }

    // 🎨 TEMAS PREDEFINIDOS POPULARES
    applyEmeraldTheme() {
        this.changeTheme('emerald', 'slate', 'emerald', 'emerald');
    }

    applyPurpleTheme() {
        this.changeTheme('purple', 'slate', 'purple', 'purple');
    }

    applyRoseTheme() {
        this.changeTheme('rose', 'slate', 'rose', 'rose');
    }

    applyOrangeTheme() {
        this.changeTheme('orange', 'slate', 'orange', 'orange');
    }

    applyTealTheme() {
        this.changeTheme('teal', 'slate', 'teal', 'teal');
    }

    // 🌙 CAMBIAR A MODO OSCURO/CLARO
    toggleDarkMode() {
        const currentConfig = this.layoutConfig();
        const newDarkTheme = !currentConfig.darkTheme;

        this.layoutConfig.update((config) => ({
            ...config,
            darkTheme: newDarkTheme
        }));

        // Aplicar clase CSS para el tema oscuro
        if (newDarkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }

        this.saveConfigToStorage(this.layoutConfig());
        console.log(`🌙 Modo ${newDarkTheme ? 'oscuro' : 'claro'} activado`);
    }

    // 🔄 RESTABLECER A CONFIGURACIÓN POR DEFECTO
    resetToDefault() {
        this.changeTheme('emerald', 'slate', 'emerald', 'emerald');
        this.layoutConfig.update((config) => ({
            ...config,
            darkTheme: false,
            menuMode: 'static',
            menuProfilePosition: 'end'
        }));
        this.saveConfigToStorage(this.layoutConfig());
        console.log('🔄 Tema restablecido a configuración por defecto');
    }
    
    _config: layoutConfig = this.loadConfigFromStorage() || {
        // ⚙️ CONFIGURACIÓN POR DEFECTO PERSONALIZADA
        // Cambia estos valores según tus preferencias
        primary: 'emerald',        // Color primario (emerald, blue, indigo, purple, etc.)
        surface: 'slate',          // Superficie (slate, gray, zinc, neutral, etc.)
        darkTheme: false,          // Modo oscuro (true/false)
        menuMode: 'static',        // Modo del menú (static, overlay, slim, etc.)
        menuTheme: 'emerald',      // Tema del menú lateral (emerald, light, dark, blue, indigo, etc.)
        topbarTheme: 'emerald',    // Tema del header/topbar (emerald, blue, indigo, purple, etc.)
        menuProfilePosition: 'end' // Posición del perfil (start/end)
    };

    _state: LayoutState = {
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
        rightMenuActive: false,
        topbarMenuActive: false,
        sidebarActive: false,
        anchored: false,
        activeMenuItem: null,
        overlaySubmenuActive: false,
        menuProfileActive: false
    };

    layoutConfig = signal<layoutConfig>(this._config);

    layoutState = signal<LayoutState>(this._state);

    private configUpdate = new Subject<layoutConfig>();

    private overlayOpen = new Subject<any>();

    private menuSource = new Subject<MenuChangeEvent>();

    private resetSource = new Subject();

    menuSource$ = this.menuSource.asObservable();

    resetSource$ = this.resetSource.asObservable();

    configUpdate$ = this.configUpdate.asObservable();

    overlayOpen$ = this.overlayOpen.asObservable();

    isSidebarActive: Signal<boolean> = computed(() => this.layoutState().overlayMenuActive || this.layoutState().staticMenuMobileActive);

    isDarkTheme: Signal<boolean> = computed(() => this.layoutConfig().darkTheme);

    isOverlay: Signal<boolean> = computed(() => this.layoutConfig().menuMode === 'overlay');

    isSlim: Signal<boolean> = computed(() => this.layoutConfig().menuMode === 'slim');

    isSlimPlus: Signal<boolean> = computed(() => this.layoutConfig().menuMode === 'slim-plus');

    isHorizontal: Signal<boolean> = computed(() => this.layoutConfig().menuMode === 'horizontal');

    transitionComplete: WritableSignal<boolean> = signal<boolean>(false);

    isSidebarStateChanged = computed(() => {
        const layoutConfig = this.layoutConfig();
        return layoutConfig.menuMode === 'horizontal' || layoutConfig.menuMode === 'slim' || layoutConfig.menuMode === 'slim-plus';
    });

    private initialized = false;

    constructor() {
        effect(() => {
            const config = this.layoutConfig();
            if (config) {
                this.onConfigUpdate();
                // Removido saveConfigToStorage del effect para evitar doble guardado
                // this.saveConfigToStorage(config);
            }
        });

        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });

        effect(() => {
            this.isSidebarStateChanged() && this.reset();
        });
    }

    private loadConfigFromStorage(): layoutConfig | null {
        try {
            const savedConfig = localStorage.getItem(this.CONFIG_KEY);
            return savedConfig ? JSON.parse(savedConfig) : null;
        } catch (error) {
            console.warn('Error loading layout config from storage:', error);
            return null;
        }
    }

    private saveConfigToStorage(config: layoutConfig): void {
        try {
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
        } catch (error) {
            console.warn('Error saving layout config to storage:', error);
        }
    }

    private handleDarkModeTransition(config: layoutConfig): void {
        if ((document as any).startViewTransition) {
            this.startViewTransition(config);
        } else {
            // Aplicar clase CSS directamente sin llamar toggleDarkMode()
            if (config.darkTheme) {
                document.documentElement.classList.add('app-dark');
            } else {
                document.documentElement.classList.remove('app-dark');
            }
            this.onTransitionEnd();
        }
    }

    private startViewTransition(config: layoutConfig): void {
        const transition = (document as any).startViewTransition(() => {
            // Aplicar clase CSS directamente sin llamar toggleDarkMode()
            if (config.darkTheme) {
                document.documentElement.classList.add('app-dark');
            } else {
                document.documentElement.classList.remove('app-dark');
            }
        });

        transition.ready
            .then(() => {
                this.onTransitionEnd();
            })
            .catch(() => {});
    }


    private onTransitionEnd() {
        this.transitionComplete.set(true);
        setTimeout(() => {
            this.transitionComplete.set(false);
        });
    }

    onMenuToggle() {
        if (this.isOverlay()) {
            this.layoutState.update((prev) => ({ ...prev, overlayMenuActive: !this.layoutState().overlayMenuActive }));

            if (this.layoutState().overlayMenuActive) {
                this.overlayOpen.next(null);
            }
        }

        if (this.isDesktop()) {
            this.layoutState.update((prev) => ({ ...prev, staticMenuDesktopInactive: !this.layoutState().staticMenuDesktopInactive }));
        } else {
            this.layoutState.update((prev) => ({ ...prev, staticMenuMobileActive: !this.layoutState().staticMenuMobileActive }));

            if (this.layoutState().staticMenuMobileActive) {
                this.overlayOpen.next(null);
            }
        }
    }

    onMenuProfileToggle() {
        this.layoutState.update((prev) => ({ ...prev, menuProfileActive: !prev.menuProfileActive }));
    }

    openRightMenu() {
        this.layoutState.update((prev) => ({ ...prev, rightMenuActive: true }));
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return !this.isDesktop();
    }

    onConfigUpdate() {
        this._config = { ...this.layoutConfig() };
        this.configUpdate.next(this.layoutConfig());
    }

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }

    onOverlaySubmenuOpen() {
        this.overlayOpen.next(null);
    }

    hideConfigSidebar() {
        this.layoutState.update((prev) => ({ ...prev, configSidebarVisible: false }));
    }
}
