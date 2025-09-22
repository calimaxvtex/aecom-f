import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';

// Angular
import { FormsModule } from '@angular/forms';

// Componentes de tabs
import { ComponentsTabComponent } from './components-tab.component';
import { ComponentsdetTabComponent } from './componentsdet-tab.component';

// Modelos
import { CatConcepto } from '../../../features/catconceptos/models/catconceptos.interface';
import { CatConceptosDetService } from '../../../features/catconceptos/services/catconceptosdet.service';
import { CatConceptoDet } from '../../../features/catconceptos/models/catconceptosdet.interface';

@Component({
    selector: 'app-components',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TabsModule,
        CardModule,
        TagModule,
        SelectModule,
        FloatLabelModule,
        ComponentsTabComponent,
        ComponentsdetTabComponent
    ],
    template: `
        <div class="card">

 

            <p-tabs [value]="activeTabIndex" (onTabChange)="onTabChange($event)">
                <p-tablist>
                    <p-tab value="0">
                        <span class="flex items-center gap-2">
                            Componentes
                            <p-tag
                                *ngIf="canalSeleccionado"
                                [value]="canalSeleccionado"
                                severity="info"
                                class="text-xs">
                            </p-tag>
                        </span>
                    </p-tab>
                    <p-tab value="1">Banners</p-tab>
                </p-tablist>

                <p-tabpanels>
                    <p-tabpanel value="0">
                        <app-components-tab
                            [canalFiltro]="canalSeleccionado"
                            (conceptoClick)="onConceptoClick($event)"
                            (conceptoDobleClick)="onConceptoDobleClick($event)">
                        </app-components-tab>
                    </p-tabpanel>
                    <p-tabpanel value="1">
                        <app-componentsdet-tab
                            [conceptoSeleccionado]="conceptoSeleccionado">
                        </app-componentsdet-tab>
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
    conceptoSeleccionado: CatConcepto | null = null;

    // Filtro por canal
    canalSeleccionado: string = '';
    canalesOptions: { label: string; value: string }[] = [];

    constructor(
        private catConceptosDetService: CatConceptosDetService
    ) {}

    ngOnInit(): void {
        console.log('🎨 BannersComponent inicializado');
        this.cargarCanalesOptions();
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

        // Si cambió al tab 2 (banners) y hay un concepto seleccionado, forzar refresh
        if (this.activeTabIndex === '1' && this.conceptoSeleccionado) {
            console.log('🔄 Cambió a tab 2 con concepto seleccionado - forzando refresh');
            // Forzar refresh del tab 2 enviando el concepto nuevamente
            setTimeout(() => {
                this.conceptoSeleccionado = { ...this.conceptoSeleccionado! };
            }, 100);
        }
    }

    // Cargar opciones de canal desde conceptosdet con clave 'TIPOCANAL'
    private cargarCanalesOptions(): void {
        this.catConceptosDetService.queryDetalles({
            clave: 'TIPOCANAL',
            swestado: 1
        }).subscribe({
            next: (response) => {
                this.canalesOptions = response.data.map(item => ({
                    label: item.valorcadena1 || item.descripcion,
                    value: item.valorcadena1 || item.descripcion
                }));
                console.log('📊 Opciones de canal cargadas:', this.canalesOptions);
            },
            error: (error) => {
                console.error('❌ Error al cargar opciones de canal:', error);
                this.canalesOptions = [];
            }
        });
    }

    // Manejar cambio de selección de canal
    onCanalChange(event: any): void {
        console.log('🔄 Canal seleccionado cambió:', event.value);
        this.canalSeleccionado = event.value;
        // Aquí se podría agregar lógica adicional si es necesario
    }
}
