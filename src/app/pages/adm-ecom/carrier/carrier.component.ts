import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';

// Servicios y modelos
import { CarrierService } from '../../../features/carrier/services/carrier.service';
import { SessionService } from '../../../core/services/session.service';
import { Carrier, HorarioCarrier } from '../../../features/carrier/models/carrier.interface';

@Component({
    selector: 'app-carrier',
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
        SelectModule,
        MultiSelectModule,
        SelectButtonModule,
        FloatLabelModule,
        CardModule,
        TooltipModule,
        InputNumberModule
    ],
    providers: [MessageService],
    templateUrl: './carrier.component.html',
    styleUrls: ['./carrier.component.css']
})
export class CarrierComponent implements OnInit {
    // ========== DATOS PRINCIPALES ==========
    carriers: Carrier[] = []; // Datos filtrados que se muestran en la tabla
    carriersTodas: Carrier[] = []; // Todos los datos sin filtrar

    // ========== FILTROS ==========
    estadoFiltro: string = 'A'; // Por defecto mostrar Activos
    estadoFiltroSeleccionado: string = 'A'; // Para los botones compactos
    estadoOptions: { label: string; value: string }[] = [
        { label: 'Activos', value: 'A' },
        { label: 'Inactivos', value: 'R' },
        { label: 'Todos', value: '' }
    ];
    searchFilterValue: string = ''; // Valor del filtro de búsqueda global

    // ========== ESTADOS DE CARGA ==========
    loadingCarriers = false;

    // ========== ESTADOS DE UI ==========
    showCarrierModal = false;
    showHorariosModal = false;

    // ========== HORARIOS ==========
    horarios: HorarioCarrier[] = [];
    horariosOriginales: HorarioCarrier[] = []; // Para comparar cambios
    loadingHorarios = false;
    savingHorarios = false;
    carrierParaHorarios: Carrier | null = null;

    // Días de la semana (1=Lunes, 7=Domingo)
    diasSemanaOptions: { label: string; value: number }[] = [
        { label: 'Lunes', value: 1 },
        { label: 'Martes', value: 2 },
        { label: 'Miércoles', value: 3 },
        { label: 'Jueves', value: 4 },
        { label: 'Viernes', value: 5 },
        { label: 'Sábado', value: 6 },
        { label: 'Domingo', value: 7 }
    ];
    diasSeleccionados: number[] = [];

    // Ventanas de horario (estructura plana para edición)
    ventanasHorario: any[] = []; // Array de ventanas sin agrupar por día

    // ========== FORMULARIO ==========
    isEditingCarrier = false;
    carrierForm: any = {
        id_ref_vtex: '',
        nombre: '',
        tienda: '',
        tipo_envio_desc: '',
        tipo_envio: 1,
        fee: 0,
        estado: 'A'
    };
    carrierSeleccionado: Carrier | null = null;

    // Opciones para el tipo de envío
    tipoEnvioOptions: { label: string; value: number; desc: string }[] = [
        { label: 'Entrega a domicilio', value: 1, desc: 'Entrega a domicilio' },
        { label: 'Retirar en tienda', value: 2, desc: 'Retirar en tienda' }
    ];

    constructor(
        private carrierService: CarrierService,
        private sessionService: SessionService,
        public messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        console.log('📦 CarrierComponent inicializado');
        this.cargarCarriers();
    }

    // ========== MÉTODOS DE CARGA DE DATOS ==========

    cargarCarriers(): void {
        // Evitar múltiples cargas simultáneas
        if (this.loadingCarriers) {
            return;
        }

        this.loadingCarriers = true;

        // Payload especificado por el usuario
        const payload = {
            action: 'SL',
            usr: 'admin', // Dinámico desde sessionService
            id_session: 1 // Dinámico desde sessionService
        };

        this.carrierService.getAllCarriers().subscribe({
            next: (response: any) => {
                if (response?.data && Array.isArray(response.data)) {
                    // Almacenar TODOS los datos sin filtrar
                    this.carriersTodas = response.data;
                    this.filtrarCarriersPorEstado();

                    // Mensaje de carga exitosa
                    const estadoTexto = this.estadoFiltro === 'A' ? 'activos' : this.estadoFiltro === 'R' ? 'inactivos' : 'todos';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Datos Cargados',
                        detail: `${this.carriersTodas.length} carriers totales, mostrando ${this.carriers.length} ${estadoTexto}`,
                        life: 3000
                    });
                } else {
                    console.warn('⚠️ Respuesta sin datos válidos:', response);
                    this.carriersTodas = [];
                    this.carriers = [];
                }

                this.loadingCarriers = false;
            },
            error: (error: any) => {
                console.error('❌ Error cargando carriers:', error);
                this.loadingCarriers = false;
                this.mostrarError('Error al cargar carriers', error);
            }
        });
    }

    // ========== MÉTODOS DE FILTRADO ==========

    filtrarCarriersPorEstado(): void {
        if (this.estadoFiltro === '') {
            // Mostrar todos
            this.carriers = [...this.carriersTodas];
        } else {
            // Filtrar por estado
            this.carriers = this.carriersTodas.filter(carrier => carrier.estado === this.estadoFiltro);
        }
    }

    onEstadoFiltroClick(estado: string): void {
        console.log('🔍 Cambiando filtro de estado a:', estado);
        this.estadoFiltro = estado;
        this.estadoFiltroSeleccionado = estado;
        this.filtrarCarriersPorEstado();
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
        switch (estado) {
            case 'A': return 'Activo';
            case 'I': return 'Inactivo';
            case 'R': return 'Inactivo';
            default: return 'Desconocido';
        }
    }

    getEstadoSeverity(estado: string): string {
        switch (estado) {
            case 'A': return 'success';
            case 'R': return 'danger';
            case 'B': return 'danger';
            case 'I': return 'danger';
            default: return 'info';
        }
    }

    toggleEstado(carrier: Carrier): void {
        const nuevoEstado = carrier.estado === 'A' ? 'R' : 'A';
        
        this.carrierService.updateCarrierField(carrier.id_carrier, 'estado', nuevoEstado).subscribe({
            next: (response: any) => {
                if (response.statuscode === 200) {
                    carrier.estado = nuevoEstado;
                    this.filtrarCarriersPorEstado(); // Re-filtrar para actualizar la vista
                    
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Estado Actualizado',
                        detail: `Carrier ${carrier.nombre} ahora está ${this.getEstadoLabel(nuevoEstado)}`,
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

    openCarrierForm(carrier?: Carrier): void {
        if (carrier) {
            this.isEditingCarrier = true;
            this.carrierSeleccionado = carrier;
            this.carrierForm = {
                id_ref_vtex: carrier.id_ref_vtex,
                nombre: carrier.nombre,
                tienda: carrier.tienda,
                tipo_envio_desc: carrier.tipo_envio_desc,
                tipo_envio: carrier.tipo_envio || 1,
                fee: carrier.fee || 0,
                estado: carrier.estado || 'A'
            };
        } else {
            this.isEditingCarrier = false;
            this.carrierSeleccionado = null;
            this.carrierForm = {
                id_ref_vtex: '',
                nombre: '',
                tienda: '',
                tipo_envio_desc: '',
                tipo_envio: 1,
                fee: 0,
                estado: 'A'
            };
        }
        this.showCarrierModal = true;
    }

    closeCarrierForm(): void {
        this.showCarrierModal = false;
        this.carrierSeleccionado = null;
        this.isEditingCarrier = false;
    }

    saveCarrier(): void {
        // Validaciones
        if (!this.carrierForm.nombre.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El nombre es requerido',
                life: 3000
            });
            return;
        }

        if (!this.carrierForm.id_ref_vtex.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El ID Ref VTEX es requerido',
                life: 3000
            });
            return;
        }

        if (!this.validarIdRefVtex(this.carrierForm.id_ref_vtex)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El ID Ref VTEX debe ser alfanumérico y tener máximo 7 caracteres',
                life: 3000
            });
            return;
        }

        if (this.carrierForm.fee < 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'El fee no puede ser negativo',
                life: 3000
            });
            return;
        }

        if (this.isEditingCarrier && this.carrierSeleccionado) {
            // Actualizar carrier existente
            const updateData = {
                id_carrier: this.carrierSeleccionado.id_carrier,
                ...this.carrierForm
            };

            this.carrierService.updateCarrier(updateData).subscribe({
                next: (response: any) => {
                    if (response.statuscode === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Carrier Actualizado',
                            detail: 'El carrier se ha actualizado correctamente',
                            life: 3000
                        });
                        this.closeCarrierForm();
                        this.cargarCarriers();
                    } else {
                        this.mostrarError('Error al actualizar carrier', response.mensaje);
                    }
                },
                error: (error: any) => {
                    this.mostrarError('Error al actualizar carrier', error);
                }
            });
        } else {
            // Crear nuevo carrier
            this.carrierService.createCarrier(this.carrierForm).subscribe({
                next: (response: any) => {
                    if (response.statuscode === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Carrier Creado',
                            detail: 'El carrier se ha creado correctamente',
                            life: 3000
                        });
                        this.closeCarrierForm();
                        this.cargarCarriers();
                    } else {
                        this.mostrarError('Error al crear carrier', response.mensaje);
                    }
                },
                error: (error: any) => {
                    this.mostrarError('Error al crear carrier', error);
                }
            });
        }
    }

    eliminarCarrier(carrier: Carrier): void {
        this.messageService.add({
            key: 'confirm',
            severity: 'warn',
            summary: 'Confirmar Eliminación',
            detail: `¿Estás seguro de que deseas eliminar el carrier "${carrier.nombre}"?`,
            data: carrier,
            life: 0
        });
    }

    procesarEliminacionCarrier(carrier: Carrier): void {
        this.carrierService.deleteCarrier(carrier.id_carrier).subscribe({
            next: (response: any) => {
                if (response.statuscode === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Carrier Eliminado',
                        detail: `El carrier "${carrier.nombre}" ha sido eliminado`,
                        life: 3000
                    });
                    this.messageService.clear('confirm');
                    this.cargarCarriers();
                } else {
                    this.mostrarError('Error al eliminar carrier', response.mensaje);
                }
            },
            error: (error: any) => {
                this.mostrarError('Error al eliminar carrier', error);
            }
        });
    }

    // ========== MÉTODOS DE UTILIDAD ==========

    // Validar ID ref VTEX (alfanumérico, máximo 7 caracteres)
    validarIdRefVtex(value: string): boolean {
        const regex = /^[A-Za-z0-9]{1,7}$/;
        return regex.test(value);
    }

    // Filtrar caracteres no alfanuméricos del ID ref VTEX
    filtrarIdRefVtex(event: any): void {
        const value = event.target.value;
        this.carrierForm.id_ref_vtex = value.replace(/[^A-Za-z0-9]/g, '');
    }

    // Manejar cambio en el tipo de envío
    onTipoEnvioChange(): void {
        const selectedOption = this.tipoEnvioOptions.find(option => option.value === this.carrierForm.tipo_envio);
        if (selectedOption) {
            this.carrierForm.tipo_envio_desc = selectedOption.desc;
        }
    }

    // Formatear fee como dinero
    formatearFee(fee: number): string {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(fee);
    }

    // ========== MÉTODOS PARA HORARIOS ==========

    /**
     * Abre el modal de horarios para un carrier
     */
    openHorariosModal(carrier: Carrier): void {
        this.carrierParaHorarios = carrier;
        this.showHorariosModal = true;
        this.cargarHorarios();
    }

    /**
     * Cierra el modal de horarios
     */
    closeHorariosModal(): void {
        this.showHorariosModal = false;
        this.carrierParaHorarios = null;
        this.ventanasHorario = [];
        this.diasSeleccionados = [];
        this.horarios = [];
    }

    /**
     * Carga los horarios del carrier desde la API
     */
    cargarHorarios(): void {
        if (!this.carrierParaHorarios) return;

        this.loadingHorarios = true;
        this.carrierService.getHorariosByCarrier(this.carrierParaHorarios.id_carrier).subscribe({
            next: (response: any) => {
                console.log('🕐 Respuesta de horarios desde API:', response);
                
                if (response?.data && Array.isArray(response.data)) {
                    this.horarios = response.data;
                    this.horariosOriginales = JSON.parse(JSON.stringify(response.data));
                    
                    console.log('🕐 Horarios recibidos:', this.horarios);
                    console.log('🕐 Cantidad de horarios:', this.horarios.length);
                    
                    // Extraer días únicos que tienen horarios
                    const diasConHorarios = [...new Set(this.horarios.map(h => h.week_day))];
                    this.diasSeleccionados = diasConHorarios.sort((a, b) => a - b);
                    
                    console.log('🕐 Días con horarios:', this.diasSeleccionados);
                    
                    // Convertir horarios agrupados por día a estructura plana de ventanas
                    this.ventanasHorario = this.convertirHorariosAVentanas(this.horarios);
                    
                    console.log('🕐 Ventanas convertidas:', this.ventanasHorario);
                    console.log('🕐 Cantidad de ventanas:', this.ventanasHorario.length);
                } else {
                    console.log('🕐 No hay datos de horarios o el formato es incorrecto');
                    this.horarios = [];
                    this.ventanasHorario = [];
                    this.diasSeleccionados = [];
                }
                this.loadingHorarios = false;
            },
            error: (error: any) => {
                console.error('🕐 Error al cargar horarios:', error);
                this.loadingHorarios = false;
                this.mostrarError('Error al cargar horarios', error);
            }
        });
    }

    /**
     * Convierte horarios agrupados por día a estructura plana de ventanas
     * Agrupa por hora para mostrar ventanas globales (sin columna día)
     */
    convertirHorariosAVentanas(horarios: HorarioCarrier[]): any[] {
        console.log('🕐 Convirtiendo horarios a ventanas. Horarios recibidos:', horarios);
        
        if (!horarios || horarios.length === 0) {
            console.log('🕐 No hay horarios para convertir');
            return [];
        }
        
        // Agrupar horarios por hora (hini + hfin + fee + capacidad)
        const gruposHorarios = new Map<string, any>();
        
        horarios.forEach(horario => {
            console.log('🕐 Procesando horario:', horario);
            
            // Asegurar que los valores existen
            const hini = horario.hini || horario.hora_ini?.substring(0, 5) || '';
            const hfin = horario.hfin || horario.hora_fin?.substring(0, 5) || '';
            const fee = horario.fee || 0;
            const capacidad = horario.capacidad || 0;
            const capacidad_app = horario.capacidad_app || 0;
            
            const clave = `${hini}-${hfin}-${fee}-${capacidad}-${capacidad_app}`;
            
            if (!gruposHorarios.has(clave)) {
                gruposHorarios.set(clave, {
                    id_sched: horario.id_sched,
                    hini: hini,
                    hfin: hfin,
                    fee: fee,
                    capacidad: capacidad,
                    capacidad_app: capacidad_app,
                    estado: horario.estado || 'A',
                    esNuevo: false,
                    dias: [horario.week_day] // Array de días para esta ventana
                });
                console.log('🕐 Nueva ventana creada:', gruposHorarios.get(clave));
            } else {
                // Agregar el día a la ventana existente
                const ventana = gruposHorarios.get(clave);
                if (!ventana.dias.includes(horario.week_day)) {
                    ventana.dias.push(horario.week_day);
                    console.log('🕐 Día agregado a ventana existente:', horario.week_day);
                }
            }
        });
        
        const ventanas = Array.from(gruposHorarios.values());
        console.log('🕐 Ventanas finales después de conversión:', ventanas);
        
        return ventanas;
    }

    /**
     * Obtiene el nombre del día a partir del número
     */
    getNombreDia(weekDay: number): string {
        const dia = this.diasSemanaOptions.find(d => d.value === weekDay);
        return dia ? dia.label : '';
    }


    /**
     * Valida formato de hora HH:mm
     */
    validarFormatoHora(hora: string): boolean {
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(hora);
    }

    /**
     * Convierte hora string "HH:mm" a entero (solo horas)
     */
    horaAEntero(hora: string): number {
        if (!hora || !this.validarFormatoHora(hora)) return 0;
        const partes = hora.split(':');
        return parseInt(partes[0], 10);
    }

    /**
     * Convierte hora "HH:mm" a formato "HH:mm:ss"
     */
    horaAFormatoCompleto(hora: string): string {
        if (!hora || !this.validarFormatoHora(hora)) return '00:00:00';
        return hora + ':00';
    }

    /**
     * Valida que hora fin sea mayor que hora inicio
     */
    validarRangoHoras(hini: string, hfin: string): boolean {
        if (!hini || !hfin) return false;
        const iniInt = this.horaAEntero(hini);
        const finInt = this.horaAEntero(hfin);
        return finInt > iniInt;
    }

    /**
     * Agrega una nueva ventana de horario global (aplica a todos los días seleccionados)
     */
    agregarVentanaHorario(): void {
        if (this.diasSeleccionados.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Debe seleccionar al menos un día',
                life: 3000
            });
            return;
        }

        // Contar ventanas totales
        const totalVentanas = this.ventanasHorario.length;
        
        if (totalVentanas >= 10) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Límite alcanzado',
                detail: `Máximo 10 ventanas de entrega permitidas. Actualmente tiene ${totalVentanas}`,
                life: 3000
            });
            return;
        }

        // Agregar una sola ventana global que aplica a todos los días seleccionados
        this.ventanasHorario.push({
            id_sched: null,
            hini: '08:00',
            hfin: '10:00',
            fee: 0,
            capacidad: 20,
            capacidad_app: 20,
            estado: 'A',
            esNuevo: true,
            dias: [...this.diasSeleccionados] // Copia de los días seleccionados
        });
    }

    /**
     * Elimina una ventana de horario
     */
    eliminarVentanaHorario(index: number): void {
        this.ventanasHorario.splice(index, 1);
    }

    /**
     * Obtiene las ventanas para un día específico (ya no se usa con la nueva estructura global)
     */
    getVentanasPorDia(dia: number): any[] {
        return this.ventanasHorario.filter(v => v.dias && v.dias.includes(dia));
    }

    /**
     * Alterna la selección de un día (toggle)
     */
    toggleDia(dia: number): void {
        const index = this.diasSeleccionados.indexOf(dia);
        
        if (index > -1) {
            // Si el día está seleccionado, lo quitamos
            this.diasSeleccionados.splice(index, 1);
        } else {
            // Si no está seleccionado, lo agregamos
            this.diasSeleccionados.push(dia);
            // Mantener ordenados
            this.diasSeleccionados.sort((a, b) => a - b);
        }
        
        // Actualizar los días de todas las ventanas existentes
        this.onDiasSeleccionadosChange();
    }

    /**
     * Maneja el cambio en los días seleccionados
     * Actualiza los días de todas las ventanas existentes
     */
    onDiasSeleccionadosChange(): void {
        // Actualizar los días de todas las ventanas existentes
        this.ventanasHorario.forEach(ventana => {
            ventana.dias = [...this.diasSeleccionados];
        });
    }

    /**
     * Guarda todos los horarios
     */
    guardarHorarios(): void {
        if (!this.carrierParaHorarios) return;

        // Validaciones
        if (this.diasSeleccionados.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Debe seleccionar al menos un día',
                life: 3000
            });
            return;
        }

        if (this.ventanasHorario.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Debe agregar al menos una ventana de horario',
                life: 3000
            });
            return;
        }

        // Validar cada ventana
        for (const ventana of this.ventanasHorario) {
            if (!ventana.hini || !this.validarFormatoHora(ventana.hini)) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Validación',
                    detail: `Hora de inicio inválida en ${this.getNombreDia(ventana.week_day)}`,
                    life: 3000
                });
                return;
            }

            if (!ventana.hfin || !this.validarFormatoHora(ventana.hfin)) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Validación',
                    detail: `Hora de fin inválida en ${this.getNombreDia(ventana.week_day)}`,
                    life: 3000
                });
                return;
            }

            if (!this.validarRangoHoras(ventana.hini, ventana.hfin)) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Validación',
                    detail: `La hora fin debe ser mayor que la hora inicio en ${this.getNombreDia(ventana.week_day)}`,
                    life: 3000
                });
                return;
            }

            if (ventana.fee < 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Validación',
                    detail: `El fee no puede ser negativo en ${this.getNombreDia(ventana.week_day)}`,
                    life: 3000
                });
                return;
            }

            if (ventana.capacidad <= 0 || ventana.capacidad_app <= 0) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Validación',
                    detail: `Las capacidades deben ser mayores a 0 en ${this.getNombreDia(ventana.week_day)}`,
                    life: 3000
                });
                return;
            }
        }

        this.savingHorarios = true;

        const operaciones: Promise<any>[] = [];
        
        // Para cada horario original, actualizar según corresponda
        this.horariosOriginales.forEach(horario => {
            // Buscar si este horario debe estar activo (coincide con alguna ventana actual)
            let debeEstarActivo = false;
            let ventanaCorrespondiente: any = null;

            // Buscar ventana que coincida con este horario (mismo week_day y misma hora)
            for (const ventana of this.ventanasHorario) {
                if (ventana.dias && ventana.dias.includes(horario.week_day)) {
                    // Verificar si las horas coinciden
                    const hiniCoincide = (ventana.hini === horario.hini || 
                        ventana.hini === horario.hora_ini?.substring(0, 5));
                    const hfinCoincide = (ventana.hfin === horario.hfin || 
                        ventana.hfin === horario.hora_fin?.substring(0, 5));
                    
                    if (hiniCoincide && hfinCoincide) {
                        debeEstarActivo = true;
                        ventanaCorrespondiente = ventana;
                        break;
                    }
                }
            }

            // Si debe estar activo, actualizar todos los campos
            if (debeEstarActivo && ventanaCorrespondiente) {
                const payload: any = {
                    id_sched: horario.id_sched,
                    hini: ventanaCorrespondiente.hini,
                    hfin: ventanaCorrespondiente.hfin,
                    hini_int: this.horaAEntero(ventanaCorrespondiente.hini),
                    hfin_int: this.horaAEntero(ventanaCorrespondiente.hfin),
                    fee: ventanaCorrespondiente.fee,
                    capacidad: ventanaCorrespondiente.capacidad,
                    capacidad_app: ventanaCorrespondiente.capacidad_app,
                    hora_ini: this.horaAFormatoCompleto(ventanaCorrespondiente.hini),
                    hora_fin: this.horaAFormatoCompleto(ventanaCorrespondiente.hfin),
                    phora_ini: this.horaAFormatoCompleto(ventanaCorrespondiente.hini),
                    estado: 'A'
                };
                operaciones.push(firstValueFrom(this.carrierService.updateHorario(payload)));
            } else {
                // Si NO debe estar activo, solo actualizar el estado a Inactivo
                const payload: any = {
                    id_sched: horario.id_sched,
                    estado: 'I'
                };
                operaciones.push(firstValueFrom(this.carrierService.updateHorario(payload)));
            }
        });

        // Ejecutar todas las operaciones
        Promise.all(operaciones.map(p => p.catch(err => ({ error: err })))).then(results => {
            const errores = results.filter(r => r && r.error);
            
            if (errores.length > 0) {
                this.mostrarError('Error al guardar horarios', 'Algunos horarios no se pudieron guardar');
            } else {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Horarios Guardados',
                    detail: 'Los horarios se han guardado correctamente',
                    life: 3000
                });
                this.closeHorariosModal();
            }
            this.savingHorarios = false;
        });
    }

    mostrarError(titulo: string, error: any): void {
        console.error('❌', titulo, error);
        this.messageService.add({
            severity: 'error',
            summary: titulo,
            detail: typeof error === 'string' ? error : error.message || 'Error desconocido',
            life: 5000
        });
    }
}
