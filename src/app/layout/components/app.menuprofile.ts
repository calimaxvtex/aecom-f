import {Component, computed, effect, ElementRef, inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {LayoutService} from '@/layout/service/layout.service';
import {TooltipModule} from 'primeng/tooltip';
import {ButtonModule} from 'primeng/button';
import {CommonModule} from '@angular/common';
import {RouterModule, Router} from '@angular/router';
import {Subscription} from "rxjs";
import {UsuarioService} from '@/features/usuarios/services/usuario.service';
import {MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {SessionService} from '@/core/services/session.service';

@Component({
    selector: '[app-menu-profile]',
    standalone: true,
    imports: [CommonModule, TooltipModule, ButtonModule, RouterModule, ToastModule],
    template: `<button (click)="toggleMenu()" pTooltip="Profile" [tooltipDisabled]="isTooltipDisabled()">
            <img [src]="userAvatar" alt="avatar" style="width: 32px; height: 32px;" />
            <span class="text-start">
                <strong>{{ userName }}</strong>
                <small>{{ userRole }}</small>
            </span>
            <i class="layout-menu-profile-toggler pi pi-fw" [ngClass]="{ 'pi-angle-down': menuProfilePosition() === 'start' || isHorizontal(), 'pi-angle-up': menuProfilePosition() === 'end' && !isHorizontal() }"></i>
        </button>

        <ul *ngIf="menuProfileActive()" [@menu]="isHorizontal() ? 'overlay' : 'inline'">
            <li pTooltip="Settings" [tooltipDisabled]="isTooltipDisabled()" [routerLink]="['/profile/create']">
                <button [routerLink]="['/documentation']">
                    <i class="pi pi-cog pi-fw"></i>
                    <span>Settings</span>
                </button>
            </li>
            <li pTooltip="Logout" [tooltipDisabled]="isTooltipDisabled()">
                <button class="p-link" (click)="onLogout()">
                    <i class="pi pi-power-off pi-fw"></i>
                    <span>Logout</span>
                </button>
            </li>
        </ul>
        <p-toast position="top-right"></p-toast>`,
    animations: [
        trigger('menu', [
            transition('void => inline', [style({ height: 0 }), animate('400ms cubic-bezier(0.86, 0, 0.07, 1)', style({ opacity: 1, height: '*' }))]),
            transition('inline => void', [animate('400ms cubic-bezier(0.86, 0, 0.07, 1)', style({ opacity: 0, height: '0' }))]),
            transition('void => overlay', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('.12s cubic-bezier(0, 0, 0.2, 1)')]),
            transition('overlay => void', [animate('.1s linear', style({ opacity: 0 }))])
        ])
    ],
    host: {
        class: 'layout-menu-profile'
    }
})
export class AppMenuProfile implements OnInit, OnDestroy {
    layoutService = inject(LayoutService);

    renderer = inject(Renderer2);

    el = inject(ElementRef);

    private usuarioService = inject(UsuarioService);

    private router = inject(Router);

    private messageService = inject(MessageService);

    private sessionService = inject(SessionService);

    // Propiedades para el usuario actual
    userName = 'Usuario';
    userRole = 'Usuario';
    userAvatar = '/images/avatar/amyelsner.png';

    isHorizontal = computed(() => this.layoutService.isHorizontal() && this.layoutService.isDesktop());

    menuProfileActive = computed(() => this.layoutService.layoutState().menuProfileActive);

    menuProfilePosition = computed(() => this.layoutService.layoutConfig().menuProfilePosition);

    isTooltipDisabled = computed(() => !this.layoutService.isSlim());

    subscription!: Subscription;

    outsideClickListener: any;

    ngOnInit() {
        // Cargar datos del usuario actual
        this.loadCurrentUser();

        // Suscribirse a cambios en la sesión
        this.sessionService.session$.subscribe(session => {
            if (session && session.isLoggedIn) {
                this.userName = session.nombre || 'Usuario';
                this.userRole = 'Usuario'; // Puedes agregar lógica para determinar el rol
                // Mantener el avatar por defecto o puedes agregar lógica para cambiarlo
            } else {
                this.userName = 'Usuario';
                this.userRole = 'Usuario';
            }
        });
    }

    private loadCurrentUser() {
        const session = this.sessionService.getSession();
        if (session && session.isLoggedIn) {
            this.userName = session.nombre || 'Usuario';
            this.userRole = 'Usuario';
        }
    }

    constructor() {
        this.subscription = this.layoutService.overlayOpen$.subscribe(() => {
            if(this.isHorizontal() && this.menuProfileActive()) {
                this.layoutService.layoutState.update(value => ({...value, menuProfileActive: false}))
            }
        })

        effect(() => {
            if(this.isHorizontal() && this.menuProfileActive() && !this.outsideClickListener) {
                this.bindOutsideClickListener();
            }

            if(!this.menuProfileActive() && this.isHorizontal()) {
                this.unbindOutsideClickListener();
            }
        })
    }

    bindOutsideClickListener() {
        if(this.isHorizontal()) {
            this.outsideClickListener = this.renderer.listen(document, 'click', (event: MouseEvent) => {
                if(this.menuProfileActive()) {
                    const isOutsideClicked = !(this.el.nativeElement.isSameNode(event.target) || this.el.nativeElement.contains(event.target))
                    if(isOutsideClicked) {
                        this.layoutService.layoutState.update(value => ({...value, menuProfileActive: false}))
                    }
                }
            })
        }
    }

    unbindOutsideClickListener() {
        if(this.outsideClickListener) {
            this.outsideClickListener();
            this.outsideClickListener = null;
        }
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
        this.unbindOutsideClickListener();
    }

    toggleMenu() {
        this.layoutService.onMenuProfileToggle();
    }

    /**
     * Maneja el logout desde el menu profile
     */
    onLogout(): void {
        console.log('🚪 Logout iniciado desde menu profile');

        this.usuarioService.logout().subscribe({
            next: (response) => {
                console.log('✅ Logout exitoso desde menu profile:', response);

                // Mostrar mensaje de éxito
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sesión Cerrada',
                    detail: 'Has cerrado sesión exitosamente',
                    life: 3000
                });

                // Cerrar el menú antes de redirigir
                this.layoutService.layoutState.update(value => ({...value, menuProfileActive: false}));

                // Redirigir a login2 después de un breve delay
                setTimeout(() => {
                    this.router.navigate(['/login2']);
                }, 1000);
            },
            error: (error) => {
                console.error('❌ Error en logout desde menu profile:', error);

                // Mostrar mensaje de error
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al Cerrar Sesión',
                    detail: 'Ocurrió un error al cerrar la sesión',
                    life: 5000
                });

                // Cerrar el menú y redirigir de todas formas
                this.layoutService.layoutState.update(value => ({...value, menuProfileActive: false}));

                setTimeout(() => {
                    this.router.navigate(['/login2']);
                }, 1000);
            }
        });
    }
}
