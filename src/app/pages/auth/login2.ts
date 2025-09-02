import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {RippleModule} from 'primeng/ripple';
import {AppConfigurator} from '@/layout/components/app.configurator';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';

@Component({
    selector: 'app-login-2',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppConfigurator, InputGroup, InputGroupAddon],
    template: `<div class="h-screen flex w-full bg-surface-50 dark:bg-surface-950">
            <div class="flex flex-1 flex-col bg-surface-50 dark:bg-surface-950 items-center justify-center" style="flex: 0 0 30%">
                <div class="w-11/12 sm:w-120">
                    <div class="flex flex-col items-center">
                        <!-- Logo de Calimax en círculo azul - subido para mejor centrado -->
                        <div class="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-8 shadow-lg -mt-8">
                            <img 
                                src="/layout/images/logo/calimax-vector-logo.svg" 
                                alt="Calimax Logo" 
                                class="w-16 h-16 text-white"
                            />
                        </div>
                        <div class="text-center">
                            <h1 class="m-0 text-primary font-medium text-3xl">Welcome back!</h1>
                            <span class="block text-surface-700 dark:text-surface-100 mt-2">Please fill the fields to sign-up Ultima network</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4 mt-12">
                        <p-input-group>
                            <p-inputgroup-addon>
                                <i class="pi pi-user"></i>
                            </p-inputgroup-addon>
                            <input pInputText type="text" [(ngModel)]="email" placeholder="Email" />
                        </p-input-group>
                        <p-input-group>
                            <p-inputgroup-addon>
                                <i class="pi pi-key"></i>
                            </p-inputgroup-addon>
                            <input pInputText type="password" [(ngModel)]="password" placeholder="Password" />
                        </p-input-group>
                        <div>
                            <button pButton pRipple [routerLink]="['/']" class="w-full" label="LOGIN"></button>
                        </div>
                        <div>
                            <button pButton pRipple class="w-full text-primary-500" text label="FORGOT PASSWORD?"></button>
                        </div>
                    </div>
                </div>
            </div>
            <div [style]="{ backgroundImage: 'url(/images/pages/calimax-login-bg.jpg)' }" class="hidden lg:flex items-center justify-center bg-cover" style="flex: 0 0 70%">
                <!-- Solo imagen de fondo de Calimax -->
            </div>
        </div>
        <app-configurator simple />`
})
export class Login2 {
    password: string = '';

    email: string = '';
}
