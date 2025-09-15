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
import { BannersComponentsTabComponent } from './banners-components-tab.component';
import { BannersTabComponent } from './banners-tab.component';

// Modelos
import { Componente } from '../../../features/comp/models/comp.interface';
import { CatConceptosDetService } from '../../../features/catconceptos/services/catconceptosdet.service';
import { CatConceptoDet } from '../../../features/catconceptos/models/catconceptosdet.interface';

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
        BannersComponentsTabComponent,
        BannersTabComponent
    ],
    template: `
        <div class="card">

            <!-- Header con filtro por canal -->
            <div class="mb-4">
                <h2 class="text-2xl font-bold mb-4">🎨 Gestión de Banners</h2>
                <div class="flex gap-4 items-end">
                    <div class="flex-1">
                        <p-floatLabel variant="on">
                            <p-select
                                [(ngModel)]="canalSeleccionado"
                                [options]="canalesOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Seleccionar canal"
                                class="w-full"
                                (onChange)="onCanalChange($event)"
                            ></p-select>
                            <label>Filtro por Canal</label>
                        </p-floatLabel>
                    </div>
                </div>
            </div>

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
                        <app-banners-components-tab
                            [canalFiltro]="canalSeleccionado"
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
        this.activeTabIndex = event.value; // sincronizar con el tab clicado
        console.log('📑 Tab cambió a:', this.activeTabIndex);

        // Si cambió al tab 2 (banners) y hay un componente seleccionado, forzar refresh
        if (this.activeTabIndex === '1' && this.componenteSeleccionado) {
            console.log('🔄 Cambió a tab 2 con componente seleccionado - forzando refresh');
            // Forzar refresh del tab 2 enviando el componente nuevamente
            setTimeout(() => {
                this.componenteSeleccionado = { ...this.componenteSeleccionado! };
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
