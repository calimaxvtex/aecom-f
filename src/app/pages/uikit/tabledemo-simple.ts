import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

interface SimpleCustomer {
    id: number;
    name: string;
    country: string;
    status: string;
    date: string;
}

@Component({
    selector: 'app-table-demo-simple',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        TagModule
    ],
    template: `
        <div class="card">
            <h1 class="text-2xl font-bold mb-4">Tabla Demo - Simplificada</h1>
            
            <p-table [value]="customers" [paginator]="true" [rows]="10" responsiveLayout="scroll">
                <ng-template #header>
                    <tr>
                        <th pSortableColumn="id">ID <p-sortIcon field="id"></p-sortIcon></th>
                        <th pSortableColumn="name">Nombre <p-sortIcon field="name"></p-sortIcon></th>
                        <th pSortableColumn="country">País <p-sortIcon field="country"></p-sortIcon></th>
                        <th pSortableColumn="status">Estado <p-sortIcon field="status"></p-sortIcon></th>
                        <th pSortableColumn="date">Fecha <p-sortIcon field="date"></p-sortIcon></th>
                    </tr>
                </ng-template>
                
                <ng-template #body let-customer>
                    <tr>
                        <td>{{ customer.id }}</td>
                        <td>{{ customer.name }}</td>
                        <td>{{ customer.country }}</td>
                        <td>
                            <p-tag [value]="customer.status" [severity]="getSeverity(customer.status)" />
                        </td>
                        <td>{{ customer.date }}</td>
                    </tr>
                </ng-template>
                
                <ng-template #emptymessage>
                    <tr>
                        <td colspan="5" class="text-center py-4">No hay datos disponibles</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class TableDemoSimple {
    customers: SimpleCustomer[] = [
        { id: 1, name: 'Juan Pérez', country: 'España', status: 'Activo', date: '2024-01-15' },
        { id: 2, name: 'María García', country: 'México', status: 'Inactivo', date: '2024-01-16' },
        { id: 3, name: 'Carlos López', country: 'Argentina', status: 'Pendiente', date: '2024-01-17' },
        { id: 4, name: 'Ana Martínez', country: 'Colombia', status: 'Activo', date: '2024-01-18' },
        { id: 5, name: 'Luis Rodríguez', country: 'Chile', status: 'Inactivo', date: '2024-01-19' },
        { id: 6, name: 'Carmen Sánchez', country: 'Perú', status: 'Activo', date: '2024-01-20' },
        { id: 7, name: 'Pedro González', country: 'Venezuela', status: 'Pendiente', date: '2024-01-21' },
        { id: 8, name: 'Laura Fernández', country: 'Uruguay', status: 'Activo', date: '2024-01-22' },
        { id: 9, name: 'Miguel Torres', country: 'Ecuador', status: 'Inactivo', date: '2024-01-23' },
        { id: 10, name: 'Isabel Ruiz', country: 'Bolivia', status: 'Activo', date: '2024-01-24' }
    ];

    getSeverity(status: string): string {
        switch (status) {
            case 'Activo':
                return 'success';
            case 'Inactivo':
                return 'danger';
            case 'Pendiente':
                return 'warning';
            default:
                return 'info';
        }
    }
}
