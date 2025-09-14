import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';

// Componentes de tabs
import { CatconceptosTabComponent } from './catconceptos-tab.component';
import { CatconceptosdetTabComponent } from './catconceptosdet-tab.component';

@Component({
    selector: 'app-catconceptos',
    standalone: true,
    imports: [
        CommonModule,
        TabsModule,
        CardModule,
        CatconceptosTabComponent,
        CatconceptosdetTabComponent
    ],
    template: `
        <div class="card">
            <h1 class="text-3xl font-bold mb-6">🏷️ Administración de Catálogos de Conceptos</h1>

            <p-tabs [value]="activeTabIndex.toString()" (onTabChange)="onTabChange($event)">
                <p-tablist>
                    <p-tab value="0">
                        <i class="pi pi-tags mr-2"></i>
                        Conceptos
                    </p-tab>
                    <p-tab value="1">
                        <i class="pi pi-list mr-2"></i>
                        Detalles de Conceptos
                    </p-tab>
                </p-tablist>

                <p-tabpanels>
                    <!-- Tab 1: CatConceptos -->
                    <p-tabpanel value="0">
                        <app-catconceptos-tab></app-catconceptos-tab>
                    </p-tabpanel>

                    <!-- Tab 2: CatConceptosDet -->
                    <p-tabpanel value="1">
                        <app-catconceptosdet-tab></app-catconceptosdet-tab>
                    </p-tabpanel>
                </p-tabpanels>
            </p-tabs>
        </div>
    `,
    styles: [`
        /* Estilos específicos para la página de catconceptos */
        .p-tabs .p-tablist {
            border-bottom: 2px solid #e5e7eb;
        }

        .p-tabview .p-tabview-panels {
            padding: 0;
        }
    `]
})
export class CatconceptosComponent implements OnInit {
    activeTabIndex = 0;

    ngOnInit(): void {
        console.log('🏷️ CatconceptosComponent inicializado');
    }

    onTabChange(event: any): void {
        const newIndex = event.index !== undefined ? parseInt(event.index) : parseInt(event.value);
        this.activeTabIndex = newIndex;
        console.log('📑 Tab cambiado a:', this.activeTabIndex);
    }
}
