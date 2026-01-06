import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';

// Servicios y modelos
import { PushNotificationService } from '../../../features/push-notifications/services/push-notification.service';
import { SessionService } from '../../../core/services/session.service';
import { PushNotification } from '../../../features/push-notifications/models/push-notification.interface';

@Component({
    selector: 'app-push-notifications',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        FloatLabelModule,
        CardModule,
        TooltipModule,
        InputNumberModule,
        DatePickerModule,
        TextareaModule
    ],
    providers: [MessageService],
    templateUrl: './push-notifications.component.html',
    styleUrls: ['./push-notifications.component.css']
})
export class PushNotificationsComponent implements OnInit {
    // ========== DATOS PRINCIPALES ==========
    pushNotifications: PushNotification[] = []; // Datos filtrados que se muestran en la tabla
    pushNotificationsTodas: PushNotification[] = []; // Todos los datos sin filtrar

    // ========== FILTROS ==========
    estadoFiltro: string = ''; // Por defecto mostrar Todos (para ver todos los datos)
    estadoFiltroSeleccionado: string = ''; // Para los botones compactos
    estadoOptions: { label: string; value: string }[] = [
        { label: 'Activos', value: 'A' },
        { label: 'Inactivos', value: 'INACTIVOS' }, // Valor especial para agrupar B, R, I
        { label: 'Todos', value: '' }
    ];
    searchFilterValue: string = ''; // Valor del filtro de búsqueda global

    // ========== ESTADOS DE CARGA ==========
    loadingPushNotifications = false;

    // ========== ESTADOS DE UI ==========
    showPushNotificationModal = false;

    // ========== FORMULARIO ==========
    isEditingPushNotification = false;
    pushNotificationForm: any = {
        TITULO: '',
        CONTENIDO: '',
        DATA: null,
        TIPO: 1,
        ESTADO: 'A',
        FECHA_INICIO: null,
        FECHA_FIN: null,
        FECHA_ALTA: null,
        ID_PROMO: '',
        ST_ORDEN: 0
    };
    pushNotificationSeleccionado: PushNotification | null = null;

    constructor(
        private pushNotificationService: PushNotificationService,
        private sessionService: SessionService,
        public messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        console.log('📱 PushNotificationsComponent inicializado');
        this.cargarPushNotifications();
    }

    // ========== MÉTODOS DE CARGA DE DATOS ==========

    cargarPushNotifications(): void {
        // Evitar múltiples cargas simultáneas
        if (this.loadingPushNotifications) {
            return;
        }

        this.loadingPushNotifications = true;

        this.pushNotificationService.getAllPushNotifications().subscribe({
            next: (response: any) => {
                console.log('📱 Respuesta completa de la API:', response);
                console.log('📱 Tipo de response:', typeof response);
                console.log('📱 response.data:', response?.data);
                console.log('📱 Es array?', Array.isArray(response?.data));
                
                // Verificar diferentes estructuras posibles de respuesta
                let datos: any[] = [];
                
                if (response?.data && Array.isArray(response.data)) {
                    datos = response.data;
                } else if (Array.isArray(response)) {
                    // Si la respuesta es directamente un array
                    datos = response;
                } else if (response?.data && !Array.isArray(response.data)) {
                    // Si data es un objeto único, convertirlo a array
                    datos = [response.data];
                }
                
                console.log('📱 Datos extraídos:', datos);
                console.log('📱 Cantidad de registros:', datos.length);
                
                if (datos.length > 0) {
                    // Almacenar TODOS los datos sin filtrar
                    this.pushNotificationsTodas = datos;
                    console.log('📱 pushNotificationsTodas asignado:', this.pushNotificationsTodas);
                    console.log('📱 Primer registro:', this.pushNotificationsTodas[0]);
                    
                    this.filtrarPushNotificationsPorEstado();
                    console.log('📱 pushNotifications después de filtrar:', this.pushNotifications);
                    console.log('📱 Cantidad después de filtrar:', this.pushNotifications.length);

                    // Mensaje de carga exitosa
                    const estadoTexto = this.estadoFiltro === 'A' ? 'activos' : 
                                      this.estadoFiltro === 'INACTIVOS' ? 'inactivos' : 
                                      'todos';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Datos Cargados',
                        detail: `${this.pushNotificationsTodas.length} push notifications totales, mostrando ${this.pushNotifications.length} ${estadoTexto}`,
                        life: 3000
                    });
                } else {
                    console.warn('⚠️ No se encontraron datos válidos en la respuesta:', response);
                    this.pushNotificationsTodas = [];
                    this.pushNotifications = [];
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Sin Datos',
                        detail: 'No se encontraron push notifications en la respuesta',
                        life: 3000
                    });
                }

                this.loadingPushNotifications = false;
            },
            error: (error: any) => {
                console.error('❌ Error cargando push notifications:', error);
                this.loadingPushNotifications = false;
                this.mostrarError('Error al cargar push notifications', error);
            }
        });
    }

    // ========== MÉTODOS DE FILTRADO ==========

    filtrarPushNotificationsPorEstado(): void {
        console.log('🔍 Filtrando por estado:', this.estadoFiltro);
        console.log('🔍 Total de registros antes de filtrar:', this.pushNotificationsTodas.length);
        
        if (this.estadoFiltro === '') {
            // Mostrar todos
            this.pushNotifications = [...this.pushNotificationsTodas];
        } else if (this.estadoFiltro === 'A') {
            // Filtrar solo Activos (estado 'A')
            this.pushNotifications = this.pushNotificationsTodas.filter(
                pn => {
                    const estado = pn.ESTADO?.trim() || pn.ESTADO;
                    return estado === 'A';
                }
            );
        } else if (this.estadoFiltro === 'INACTIVOS') {
            // Filtrar Inactivos (estados 'B', 'R', 'I')
            this.pushNotifications = this.pushNotificationsTodas.filter(
                pn => {
                    const estado = pn.ESTADO?.trim() || pn.ESTADO;
                    return estado === 'B' || estado === 'R' || estado === 'I';
                }
            );
        } else {
            // Filtro específico (por si acaso)
            this.pushNotifications = this.pushNotificationsTodas.filter(
                pn => {
                    const estado = pn.ESTADO?.trim() || pn.ESTADO;
                    return estado === this.estadoFiltro;
                }
            );
        }
        
        console.log('🔍 Registros después de filtrar:', this.pushNotifications.length);
        console.log('🔍 Estados encontrados:', [...new Set(this.pushNotificationsTodas.map(pn => pn.ESTADO?.trim() || pn.ESTADO))]);
    }

    onEstadoFiltroClick(estado: string): void {
        console.log('🔍 Cambiando filtro de estado a:', estado);
        this.estadoFiltro = estado;
        this.estadoFiltroSeleccionado = estado;
        this.filtrarPushNotificationsPorEstado();
    }

    onGlobalFilter(table: any): void {
        table.filterGlobal(this.searchFilterValue, 'contains');
    }

    // Limpiar el filtro de búsqueda global
    clearGlobalFilter(table: any): void {
        this.searchFilterValue = '';
        table.filterGlobal('', 'contains');
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    getEstadoLabel(estado: string): string {
        const estadoTrim = estado?.trim() || estado;
        switch (estadoTrim) {
            case 'A': return 'Activo';
            case 'B':
            case 'R':
            case 'I': return 'Inactivo';
            default: return 'Desconocido';
        }
    }

    getEstadoSeverity(estado: string): string {
        const estadoTrim = estado?.trim() || estado;
        switch (estadoTrim) {
            case 'A': return 'success';
            case 'B':
            case 'R':
            case 'I': return 'danger'; // Todos los inactivos con el mismo color
            default: return 'info';
        }
    }

    toggleEstado(pushNotification: PushNotification): void {
        // Si está activo (A), cambiar a Retirado (R). Si está inactivo (B, R, I), cambiar a Activo (A)
        const estadoActual = pushNotification.ESTADO?.trim() || pushNotification.ESTADO;
        const nuevoEstado = estadoActual === 'A' ? 'R' : 'A';
        
        this.pushNotificationService.updatePushNotificationField(
            pushNotification.ID, 
            'ESTADO', 
            nuevoEstado
        ).subscribe({
            next: (response: any) => {
                if (response.statuscode === 200) {
                    pushNotification.ESTADO = nuevoEstado as 'A' | 'B' | 'R' | 'I';
                    this.filtrarPushNotificationsPorEstado(); // Re-filtrar para actualizar la vista
                    
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Estado Actualizado',
                        detail: `Push Notification "${pushNotification.TITULO}" ahora está ${this.getEstadoLabel(nuevoEstado)}`,
                        life: 3000
                    });
                } else {
                    this.mostrarError('Error al actualizar estado', response.mensaje);
                }
            },
            error: (error: any) => {
                this.mostrarError('Error al actualizar estado', error);
            }
        });
    }

    // ========== MÉTODOS DE FORMULARIO ==========

    openPushNotificationForm(pushNotification?: PushNotification): void {
        if (pushNotification) {
            this.isEditingPushNotification = true;
            this.pushNotificationSeleccionado = pushNotification;
            this.pushNotificationForm = {
                TITULO: pushNotification.TITULO,
                CONTENIDO: pushNotification.CONTENIDO,
                DATA: pushNotification.DATA,
                TIPO: pushNotification.TIPO,
                ESTADO: pushNotification.ESTADO,
                FECHA_INICIO: pushNotification.FECHA_INICIO ? new Date(pushNotification.FECHA_INICIO) : null,
                FECHA_FIN: pushNotification.FECHA_FIN ? new Date(pushNotification.FECHA_FIN) : null,
                FECHA_ALTA: pushNotification.FECHA_ALTA ? new Date(pushNotification.FECHA_ALTA) : null,
                ID_PROMO: pushNotification.ID_PROMO,
                ST_ORDEN: pushNotification.ST_ORDEN
            };
        } else {
            this.isEditingPushNotification = false;
            this.pushNotificationSeleccionado = null;
            this.pushNotificationForm = {
                TITULO: '',
                CONTENIDO: '',
                DATA: '',
                TIPO: 1,
                ESTADO: 'A',
                FECHA_INICIO: null,
                FECHA_FIN: null,
                FECHA_ALTA: null,
                ID_PROMO: '',
                ST_ORDEN: 0
            };
        }
        this.showPushNotificationModal = true;
    }

    closePushNotificationForm(): void {
        this.showPushNotificationModal = false;
        this.pushNotificationSeleccionado = null;
        this.isEditingPushNotification = false;
    }

    savePushNotification(): void {
        // Validaciones
        if (!this.pushNotificationForm.TITULO.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El título es requerido',
                life: 3000
            });
            return;
        }

        if (!this.pushNotificationForm.CONTENIDO.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El contenido es requerido',
                life: 3000
            });
            return;
        }

        if (!this.pushNotificationForm.DATA || !this.pushNotificationForm.DATA.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El campo DATA es requerido',
                life: 3000
            });
            return;
        }

        if (!this.pushNotificationForm.FECHA_INICIO) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'La fecha de inicio es requerida',
                life: 3000
            });
            return;
        }

        if (!this.pushNotificationForm.FECHA_FIN) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'La fecha de fin es requerida',
                life: 3000
            });
            return;
        }

        if (this.pushNotificationForm.FECHA_FIN < this.pushNotificationForm.FECHA_INICIO) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'La fecha de fin debe ser posterior a la fecha de inicio',
                life: 3000
            });
            return;
        }

        // Preparar payload
        const payload: any = {
            TITULO: this.pushNotificationForm.TITULO.trim(),
            CONTENIDO: this.pushNotificationForm.CONTENIDO.trim(),
            DATA: this.pushNotificationForm.DATA.trim(),
            TIPO: this.pushNotificationForm.TIPO || 1,
            ESTADO: this.pushNotificationForm.ESTADO || 'A',
            FECHA_INICIO: this.formatDateTime(this.pushNotificationForm.FECHA_INICIO),
            FECHA_FIN: this.formatDateTime(this.pushNotificationForm.FECHA_FIN),
            ID_PROMO: this.pushNotificationForm.ID_PROMO.trim(),
            ST_ORDEN: this.pushNotificationForm.ST_ORDEN || 0
        };

        // Si es edición, agregar ID y FECHA_ALTA si existe
        if (this.isEditingPushNotification && this.pushNotificationSeleccionado) {
            payload.ID = this.pushNotificationSeleccionado.ID;
            if (this.pushNotificationForm.FECHA_ALTA) {
                payload.FECHA_ALTA = this.formatDate(this.pushNotificationForm.FECHA_ALTA);
            }
        } else {
            // Para creación, usar fecha actual si no se especifica
            payload.FECHA_ALTA = this.pushNotificationForm.FECHA_ALTA 
                ? this.formatDate(this.pushNotificationForm.FECHA_ALTA)
                : this.formatDate(new Date());
        }

        // Guardar
        const operation = this.isEditingPushNotification
            ? this.pushNotificationService.updatePushNotification(payload)
            : this.pushNotificationService.createPushNotification(payload);

        operation.subscribe({
            next: (response: any) => {
                if (response.statuscode === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: this.isEditingPushNotification 
                            ? 'Push Notification actualizada correctamente' 
                            : 'Push Notification creada correctamente',
                        life: 3000
                    });
                    this.closePushNotificationForm();
                    this.cargarPushNotifications();
                } else {
                    this.mostrarError('Error al guardar', response.mensaje);
                }
            },
            error: (error: any) => {
                this.mostrarError('Error al guardar', error);
            }
        });
    }

    deletePushNotification(pushNotification: PushNotification): void {
        this.pushNotificationService.deletePushNotification(pushNotification.ID).subscribe({
            next: (response: any) => {
                if (response.statuscode === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Eliminado',
                        detail: `Push Notification "${pushNotification.TITULO}" eliminada correctamente`,
                        life: 3000
                    });
                    this.cargarPushNotifications();
                } else {
                    this.mostrarError('Error al eliminar', response.mensaje);
                }
            },
            error: (error: any) => {
                this.mostrarError('Error al eliminar', error);
            }
        });
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    formatDateTime(date: Date): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    formatDate(date: Date): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    mostrarError(titulo: string, error: any): void {
        const mensaje = error?.error?.mensaje || error?.mensaje || error?.message || 'Error desconocido';
        this.messageService.add({
            severity: 'error',
            summary: titulo,
            detail: mensaje,
            life: 5000
        });
    }
}

