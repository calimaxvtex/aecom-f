import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService, RouteInfo } from '@/core/services/route/route.service';

@Component({
  selector: 'app-route-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2 class="text-xl font-semibold mb-3">Rutas con data.proy === 1</h2>
      <ng-container *ngIf="routes$ | async as routes; else loading">
        <p *ngIf="routes.length === 0">No se encontraron rutas proy.</p>
        <ul class="list-disc pl-5" *ngIf="routes.length > 0">
          <li *ngFor="let r of routes">
            <code>{{ r.fullPath }}</code>
            <span *ngIf="r.data?.breadcrumb"> · {{ r.data.breadcrumb }}</span>
          </li>
        </ul>
      </ng-container>
      <ng-template #loading> Cargando rutas… </ng-template>
    </div>
  `
})
export class RouteTestComponent {
  private routeService = inject(RouteService);
  routes$ = this.routeService.getProyRoutes$();
}


