import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

// Componentes de tabs
import { CatconceptosTabComponent } from './catconceptos-tab.component';
import { CatconceptosdetTabComponent } from './catconceptosdet-tab.component';

// Modelos
import { CatConcepto } from '../../../features/catconceptos/models/catconceptos.interface';

@Component({
    selector: 'app-catconceptos',
    standalone: true,
    imports: [
        CommonModule,
        TabsModule,
        CardModule,
        TagModule,
        CatconceptosTabComponent,
        CatconceptosdetTabComponent
    ],
    template: `
        <div class="card">

            <p-tabs [value]="activeTabIndex" (onTabChange)="onTabChange($event)">
                <p-tablist>
                    <p-tab value="0">Conceptos</p-tab>
                    <p-tab value="1">
                        <span class="flex items-center gap-2">
                            Detalles
                            <p-tag
                                *ngIf="conceptoSeleccionado"
                                [value]="conceptoSeleccionado.clave"
                                severity="success"
                                class="text-xs">
                            </p-tag>
                        </span>
                    </p-tab>
                </p-tablist>

                <p-tabpanels>
                    <p-tabpanel value="0">
                        <app-catconceptos-tab
                            (conceptoClick)="onConceptoClick($event)"
                            (conceptoDobleClick)="onConceptoDobleClick($event)">
                        </app-catconceptos-tab>
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <app-catconceptosdet-tab
                            [conceptoSeleccionado]="conceptoSeleccionado">
                        </app-catconceptosdet-tab>
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
    activeTabIndex: string = '0'; // manejar como string
    conceptoSeleccionado: CatConcepto | null = null;

    ngOnInit(): void {
        console.log('🏷️ CatconceptosComponent inicializado');
    }

    onConceptoSeleccionadoChange(concepto: CatConcepto | null): void {
        console.log('🔄 Concepto seleccionado cambió en el componente padre:', concepto);
        this.conceptoSeleccionado = concepto;
    }

    onConceptoClick(concepto: CatConcepto): void {
        console.log('👆 Click en concepto - seleccionando:', concepto);
        // Solo seleccionar el concepto, sin cambiar de tab automáticamente
        this.conceptoSeleccionado = { ...concepto };
    }

    onConceptoDobleClick(concepto: CatConcepto): void {
        console.log('👆 Doble click en concepto - cambiando a tab 2:', concepto);
        // Mantener funcionalidad de doble click para cambiar de tab
        this.activeTabIndex = '0';
        setTimeout(() => {
            this.conceptoSeleccionado = { ...concepto }; // clonar para forzar change detection
            this.activeTabIndex = '1'; // mover al tab 2
        }, 0);
    }

    onTabChange(event: any): void {
        this.activeTabIndex = event.value; // sincronizar con el tab clicado
        console.log('📑 Tab cambió a:', this.activeTabIndex);

        // Si cambió al tab 2 (detalles) y hay un concepto seleccionado, forzar refresh
        if (this.activeTabIndex === '1' && this.conceptoSeleccionado) {
            console.log('🔄 Cambió a tab 2 con concepto seleccionado - forzando refresh');
            // Forzar refresh del tab 2 enviando el concepto nuevamente
            setTimeout(() => {
                this.conceptoSeleccionado = { ...this.conceptoSeleccionado! };
            }, 100);
        }
    }
}
