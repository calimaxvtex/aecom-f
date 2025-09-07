import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiConfigService } from './core/services/api/api-config.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {

    constructor(private apiConfigService: ApiConfigService) {}

    ngOnInit() {
        // Verificar que los endpoints se cargaron al inicio
        console.log('🔍 Verificando carga de endpoints en AppComponent...');

        if (this.apiConfigService.hasEndpoints()) {
            console.log('✅ Endpoints ya están disponibles:', this.apiConfigService.getAllEndpoints());
        } else {
            console.log('⏳ Endpoints aún no disponibles, suscribiéndose...');
            this.apiConfigService.getEndpointsLoaded$().subscribe(loaded => {
                if (loaded) {
                    console.log('✅ Endpoints cargados dinámicamente:', this.apiConfigService.getAllEndpoints());
                }
            });
        }
    }
}

