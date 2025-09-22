import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Angular
import { FormsModule } from '@angular/forms';

// Componentes de tabs
import { BannersComponentsTabComponent } from './banners-components-tab.component';
import { BannersTabComponent } from './banners-tab.component';

// Modelos
import { Componente } from '../../../features/comp/models/comp.interface';

@Component({
    selector: 'app-banners',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TabsModule,
        CardModule,
        TagModule,
        SelectModule,
        FloatLabelModule,
        ToastModule,
        BannersComponentsTabComponent,
        BannersTabComponent
    ],
    providers: [MessageService],
    template: `
        <div class="card">
            <p-toast></p-toast>
            <p-tabs [value]="activeTabIndex" (onTabChange)="onTabChange($event)">
                <p-tablist>
                    <p-tab value="0">
                        <span class="flex items-center gap-2">
                            Contenedores
                        </span>
                    </p-tab>
                    <p-tab value="1">
                        <span class="flex items-center gap-2">
                            Banners
                            <p-tag
                                *ngIf="componenteSeleccionado"
                                [value]="componenteSeleccionado.nombre"
                                severity="info"
                                class="text-xs">
                            </p-tag>
                        </span>
                    </p-tab>
                </p-tablist>

                <p-tabpanels>
                    <p-tabpanel value="0">
                        <app-banners-components-tab
                            (conceptoClick)="onConceptoClick($event)"
                            (conceptoDobleClick)="onConceptoDobleClick($event)">
                        </app-banners-components-tab>
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <app-banners-tab
                            [componenteSeleccionado]="componenteSeleccionado">
                        </app-banners-tab>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>
    `,
    styles: [`
        /* Estilos específicos para la página de banners */
        .p-tabs .p-tablist {
            border-bottom: 2px solid #e5e7eb;
        }

        .p-tabview .p-tabview-panels {
            padding: 0;
        }
    `]
})
export class BannersComponent implements OnInit {
    activeTabIndex: string = '0'; // manejar como string
    componenteSeleccionado: Componente | null = null;


    constructor() {}

    ngOnInit(): void {
        console.log('🎨 BannersComponent inicializado');
    }

    onConceptoSeleccionadoChange(componente: Componente | null): void {
        console.log('🔄 Componente seleccionado cambió en el componente padre:', componente);
        this.componenteSeleccionado = componente;
    }

    onConceptoClick(componente: Componente): void {
        console.log('👆 Click en componente - seleccionando:', componente);
        // Solo seleccionar el componente, sin cambiar de tab automáticamente
        this.componenteSeleccionado = { ...componente };
    }

    onConceptoDobleClick(componente: Componente): void {
        console.log('👆 Doble click en componente - cambiando a tab 2:', componente);
        // Mantener funcionalidad de doble click para cambiar de tab
        this.activeTabIndex = '0';
        setTimeout(() => {
            this.componenteSeleccionado = { ...componente }; // clonar para forzar change detection
            this.activeTabIndex = '1'; // mover al tab 2
        }, 0);
    }

    onTabChange(event: any): void {
        const newTabIndex = event.value;
        console.log('📑 Tab cambió de', this.activeTabIndex, 'a', newTabIndex);

        // Actualizar el tab activo
        this.activeTabIndex = newTabIndex;

        // Si cambió al tab 1 (banners) y hay un componente seleccionado, forzar refresh
        if (this.activeTabIndex === '1' && this.componenteSeleccionado) {
            console.log('🔄 Cambió a tab Banners con componente seleccionado - forzando refresh');
            // Forzar refresh del tab banners enviando el componente nuevamente
            setTimeout(() => {
                const componenteActual = this.componenteSeleccionado;
                this.componenteSeleccionado = null; // Reset temporal
                setTimeout(() => {
                    this.componenteSeleccionado = { ...componenteActual! }; // Reasignar para forzar change detection
                }, 10);
            }, 50);
        }

        // Si cambió al tab 0 (contenedores), mantener el componente seleccionado
        if (this.activeTabIndex === '0') {
            console.log('🏠 Cambió a tab Contenedores - componente seleccionado:', this.componenteSeleccionado?.nombre || 'ninguno');
        }
    }

}
