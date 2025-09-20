import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { MessageService, ConfirmationService } from 'primeng/api';

// Modelos y servicios
import { Sucursal, CreateSucursalRequest, UpdateSucursalRequest } from '@/features/sucursal/models/sucursal.interface';
import { SucursalService } from '@/features/sucursal/services/sucursal.service';
import { ProyectoService, Proyecto } from '@/features/proy/services/proyecto.service';
import { SessionService } from '@/core/services/session.service';

@Component({
    selector: 'app-sucursal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        FloatLabelModule,
        TooltipModule,
        CardModule
    ],
    providers: [MessageService],
    templateUrl: './sucursal.component.html',
    styleUrls: ['./sucursal.component.scss']
})
export class SucursalComponent implements OnInit {
    // Datos principales
    sucursales: Sucursal[] = []; // Datos filtrados que se muestran en la tabla
    sucursalesTodas: Sucursal[] = []; // Todos los datos sin filtrar
    proyectos: Proyecto[] = [];
    proyectoSeleccionado: Proyecto | null = null;
    proyectoSeleccionadoId: number | null = null; // Para el binding del SELECT

    // Filtros
    estadoFiltro: string = 'A'; // Por defecto mostrar Activas
    estadoFiltroSeleccionado: string = 'A'; // Para los botones compactos
    estadoOptions: { label: string; value: string }[] = [
        { label: 'Activos', value: 'A' },
        { label: 'Inactivos', value: 'R' },
        { label: 'Todos', value: '' }
    ];

    // Estados de carga
    loadingSucursales = false;
    savingSucursal = false;
    loadingProyectos = false;

    // Estados de modales
    showSucursalModal = false;

    // Estados del formulario
    sucursalForm!: FormGroup;
    isEditingSucursal = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;

    // Estados de confirmación
    showConfirmDialog = false;
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;

    constructor(
        private fb: FormBuilder,
        private sucursalService: SucursalService,
        private proyectoService: ProyectoService,
        private sessionService: SessionService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        console.log('🏪 SucursalComponent inicializado');
        console.log('🎯 Estado filtro inicial:', this.estadoFiltro);
        this.cargarProyectos();

        // Test inicial para verificar que la pantalla carga
        console.log('🧪 Test inicial - proyectos:', this.proyectos);
        console.log('🧪 Test inicial - proyecto seleccionado:', this.proyectoSeleccionado);
    }

    // ========== MÉTODOS DE INICIALIZACIÓN ==========

    initializeForms(): void {
        this.sucursalForm = this.fb.group({
            sucursal: [{ value: '', disabled: false }, [Validators.required]], // ID editable en creación, readonly en edición
            tienda: ['', [Validators.required]],
            direccion: ['', [Validators.required]],
            latitud: [''],
            longitud: [''],
            zona_geografica: [1],
            estado: ['A', [Validators.required]],
            telefono: [''],           // Nuevo: Teléfono
            sap: [0],                // Nuevo: Switch SAP (0=apagado, 1=prendido)
            ip: [''],               // Nuevo: IP
            ip_serv: ['']           // Nuevo: IP del servidor
        });
    }

    // ========== MÉTODOS DE DATOS ==========

    cargarProyectos(): void {
        this.loadingProyectos = true;
        console.log('📊 Cargando proyectos...');

        this.proyectoService.getAllProyectos().subscribe({
            next: (response: any) => {
                console.log('📊 Respuesta completa de proyectos:', response);
                if (response.data && Array.isArray(response.data)) {
                    this.proyectos = response.data;
                    console.log('✅ Proyectos cargados:', this.proyectos.length);
                    console.log('📋 Lista de proyectos:', this.proyectos);

                    // Preseleccionar el proyecto con ID=2 (o el primer proyecto como fallback)
                    if (this.proyectos.length > 0) {
                        // Buscar proyecto con ID=2
                        const proyectoId2 = this.proyectos.find(p => p.id_proy === 2);

                        if (proyectoId2) {
                            this.proyectoSeleccionado = proyectoId2;
                            this.proyectoSeleccionadoId = proyectoId2.id_proy; // Para el SELECT
                            console.log('🎯 Proyecto ID=2 encontrado y preseleccionado:', this.proyectoSeleccionado.nombre);
                        } else {
                            // Fallback: primer proyecto disponible
                            this.proyectoSeleccionado = this.proyectos[0];
                            this.proyectoSeleccionadoId = this.proyectos[0].id_proy; // Para el SELECT
                            console.log('⚠️ Proyecto ID=2 no encontrado, usando primer proyecto:', this.proyectoSeleccionado.nombre);
                        }

                        console.log('🎯 Proyecto final preseleccionado:', this.proyectoSeleccionado);
                        console.log('🎯 ID del proyecto para SELECT:', this.proyectoSeleccionadoId);

                        // Forzar actualización del modelo para asegurar que el SELECT muestre correctamente
                        setTimeout(() => {
                            console.log('🔄 Forzando actualización del modelo...');
                            this.estadoFiltro = 'A'; // Asegurar que esté en 'A'
                            console.log('🎯 Estado filtro confirmado:', this.estadoFiltro);

                            // Forzar detección de cambios para que el SELECT se actualice
                            this.cdr.detectChanges();

                            console.log('🔄 Detección de cambios forzada');
                            this.cargarSucursales();
                        }, 100);
                    }
                }
                this.loadingProyectos = false;
            },
            error: (error: any) => {
                console.error('❌ Error al cargar proyectos:', error);
                this.loadingProyectos = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los proyectos',
                    life: 5000
                });
            }
        });
    }

    cargarSucursales(): void {
        if (!this.proyectoSeleccionado) {
            console.log('⚠️ No hay proyecto seleccionado');
            return;
        }

        if (!this.proyectoSeleccionado.id_proy) {
            console.error('❌ Error: proyectoSeleccionado no tiene id_proy válido');
            return;
        }

        // Evitar múltiples cargas simultáneas
        if (this.loadingSucursales) {
            console.log('⚠️ Ya hay una carga de sucursales en progreso');
            return;
        }

        this.loadingSucursales = true;
        console.log('📊 Cargando sucursales para proyecto:', this.getProyectoNombre(this.proyectoSeleccionado));
        console.log('📊 ID del proyecto para filtrar:', this.proyectoSeleccionado.id_proy);
        console.log('📊 Cargando TODOS los datos del proyecto (sin filtro de estado)');
        console.log('📊 Los filtros se aplicarán en el frontend');

        // Preparar filtros - SOLO por proyecto, sin estado
        const filtros: any = {
            id_proy: this.proyectoSeleccionado.id_proy
        };

        // NO agregar filtro de estado aquí - se filtra en frontend
        console.log('🎯 Cargando datos completos del proyecto:', this.proyectoSeleccionado.id_proy);

        this.sucursalService.getAllSucursales(filtros).subscribe({
            next: (response: any) => {
                console.log('📦 Respuesta del servicio:', response);

                if (response?.data && Array.isArray(response.data)) {
                    // Almacenar TODOS los datos sin filtrar
                    this.sucursalesTodas = response.data;
                    console.log('✅ Datos completos cargados:', this.sucursalesTodas.length, 'sucursales');

                    // Verificar todos los estados disponibles
                    const estadosUnicos = [...new Set(this.sucursalesTodas.map(s => s.estado))];
                    console.log('🎯 Estados disponibles en datos:', estadosUnicos);

                    // Aplicar filtro de estado en el frontend
                    console.log('🔍 Aplicando filtro de estado al cargar datos...');
                    this.filtrarSucursalesPorEstado();

                    // Mensaje de carga exitosa
                    const estadoTexto = this.estadoFiltro === 'A' ? 'activas' : this.estadoFiltro === 'R' ? 'inactivas' : 'todas';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Datos Cargados',
                        detail: `${this.sucursalesTodas.length} sucursales totales, mostrando ${this.sucursales.length} ${estadoTexto}`,
                        life: 3000
                    });
                } else {
                    console.warn('⚠️ Respuesta sin datos válidos:', response);
                    this.sucursalesTodas = [];
                    this.sucursales = [];
                }

                this.loadingSucursales = false;
            },
            error: (error: any) => {
                console.error('❌ Error al cargar sucursales:', error);
                this.sucursalesTodas = [];
                this.sucursales = [];
                this.loadingSucursales = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error al cargar sucursales',
                    detail: error?.message || 'Error desconocido al cargar las sucursales',
                    life: 5000
                });
            }
        });
    }

    // ========== MÉTODOS DE UI ==========

    filtrarSucursalesPorEstado(): void {
        console.log('🔍 Filtrando sucursales por estado:', this.estadoFiltro);

        if (this.estadoFiltro === '') {
            // Mostrar todas las sucursales
            this.sucursales = [...this.sucursalesTodas];
            console.log('✅ Mostrando todas las sucursales:', this.sucursales.length);
        } else {
            // Filtrar por estado específico
            this.sucursales = this.sucursalesTodas.filter(sucursal =>
                sucursal.estado === this.estadoFiltro
            );
            console.log(`✅ Mostrando sucursales ${this.estadoFiltro === 'A' ? 'activas' : 'inactivas'}:`, this.sucursales.length);
        }

        // Verificar el estado de las sucursales filtradas
        const estadosUnicos = [...new Set(this.sucursales.map(s => s.estado))];
        console.log('🎯 Estados en datos filtrados:', estadosUnicos);
    }

    onEstadoFiltroClick(estadoValue: string): void {
        console.log('🔄 Click en filtro de estado:', estadoValue);

        // Si se hace click en el mismo botón, resetear el filtro
        if (this.estadoFiltroSeleccionado === estadoValue) {
            this.estadoFiltroSeleccionado = 'A'; // Resetear a Activos por defecto
            this.estadoFiltro = 'A';
            console.log('🔄 Filtro reseteado a Activos por defecto');
        } else {
            // Cambiar al nuevo filtro
            this.estadoFiltroSeleccionado = estadoValue;
            this.estadoFiltro = estadoValue;
            console.log('✅ Filtro cambiado a:', estadoValue);
        }

        const estadoTexto = this.estadoFiltro === 'A' ? 'Activas' : this.estadoFiltro === 'R' ? 'Inactivas' : 'Todas';
        console.log('🔄 Estado texto:', estadoTexto);

        // Aplicar filtro
        if (this.sucursalesTodas.length > 0) {
            console.log('🔍 Aplicando filtro frontend...');

            // Forzar detección de cambios antes de filtrar
            this.cdr.detectChanges();

            this.filtrarSucursalesPorEstado();

            // Mostrar mensaje
            const mensaje = estadoValue === this.estadoFiltroSeleccionado
                ? `Filtro aplicado: ${estadoTexto}`
                : `Filtro reseteado a: Activas`;

            this.messageService.add({
                severity: 'success',
                summary: 'Filtro Aplicado',
                detail: mensaje,
                life: 1500
            });
        } else {
            console.log('⚠️ No hay datos cargados, cargando desde API...');
            if (this.proyectoSeleccionado) {
                this.cargarSucursales();
            }
        }
    }

    onEstadoChange(event: any): void {
        console.log('🔄 EVENTO onEstadoChange recibido:', event);
        console.log('🔄 Valor del evento:', event?.value);

        const nuevoEstado = event?.value;
        console.log('🔄 Nuevo estado seleccionado:', nuevoEstado);
        console.log('🔄 Estado anterior:', this.estadoFiltro);

        if (nuevoEstado !== undefined && nuevoEstado !== null) {
            console.log('✅ Estado seleccionado:', nuevoEstado);

            // Verificar si realmente cambió o si es el mismo (para mensaje diferente)
            const estadoCambio = nuevoEstado !== this.estadoFiltro;

            // Actualizar el filtro de estado
            this.estadoFiltro = nuevoEstado;

            const estadoTexto = this.estadoFiltro === 'A' ? 'Activas' : this.estadoFiltro === 'R' ? 'Inactivas' : 'Todas';
            console.log('🔄 Estado texto:', estadoTexto);

            // Filtrar los datos en el frontend (no llamar API)
            if (this.sucursalesTodas.length > 0) {
                console.log('🔍 Aplicando filtro frontend...');

                // Forzar detección de cambios antes de filtrar
                this.cdr.detectChanges();

                this.filtrarSucursalesPorEstado();

                // Mostrar mensaje apropiado
                const mensaje = estadoCambio
                    ? `Filtro cambiado a: ${estadoTexto}`
                    : `Refrescando filtro: ${estadoTexto}`;

                this.messageService.add({
                    severity: 'success',
                    summary: estadoCambio ? 'Filtro Aplicado' : 'Filtro Refrescado',
                    detail: `${this.sucursales.length} sucursales ${estadoTexto.toLowerCase()}`,
                    life: 1500
                });
            } else {
                console.log('⚠️ No hay datos cargados, cargando desde API...');
                if (this.proyectoSeleccionado) {
                    this.cargarSucursales();
                }
            }
        } else {
            console.warn('⚠️ Estado no válido recibido:', nuevoEstado);
        }
    }

    onProyectoChange(event: any): void {
        console.log('🔄 EVENTO onProyectoChange recibido:', event);
        console.log('🔄 Valor del evento:', event?.value);

        const nuevoProyectoId = event?.value;
        console.log('🔄 Proyecto seleccionado ID:', nuevoProyectoId);
        console.log('🔄 Proyecto anterior ID:', this.proyectoSeleccionadoId);

        if (nuevoProyectoId) {
            // Buscar el proyecto completo por ID
            const nuevoProyecto = this.proyectos.find(p => p.id_proy === nuevoProyectoId);

            if (nuevoProyecto) {
                console.log('✅ Proyecto seleccionado:', nuevoProyecto.nombre, '(ID:', nuevoProyecto.id_proy, ')');

                // Verificar si realmente cambió o si es el mismo (para mensaje diferente)
                const proyectoCambio = nuevoProyectoId !== this.proyectoSeleccionadoId;

                // Actualizar ambos: el objeto completo y el ID
                this.proyectoSeleccionado = nuevoProyecto;
                this.proyectoSeleccionadoId = nuevoProyectoId;

                // Limpiar datos anteriores y recargar
                this.sucursalesTodas = [];
                this.sucursales = [];
                console.log('📊 Cargando sucursales para el proyecto...');
                this.cargarSucursales();

                // El mensaje se mostrará después de cargar los datos en cargarSucursales()
                // con información precisa sobre los datos filtrados
            } else {
                console.warn('⚠️ No se encontró el proyecto con ID:', nuevoProyectoId);
            }
        } else {
            console.warn('⚠️ ID de proyecto no válido recibido:', nuevoProyectoId);
        }
    }

    onGlobalFilter(table: any, event: any): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    // ========== FORMULARIO CRUD ==========

    openSucursalForm(sucursal?: Sucursal): void {
        this.isEditingSucursal = !!sucursal;

        if (sucursal) {
            console.log('✏️ Editando sucursal:', sucursal);
            // En edición: deshabilitar el campo ID y setear el valor
            this.sucursalForm.get('sucursal')?.disable();
            this.sucursalForm.patchValue({
                sucursal: sucursal.sucursal,
                tienda: sucursal.tienda,
                direccion: sucursal.direccion,
                latitud: sucursal.latitud,
                longitud: sucursal.longitud,
                zona_geografica: sucursal.zona_geografica || 1,
                estado: sucursal.estado,
                telefono: sucursal.telefono || '',           // Nuevo: Teléfono
                sap: sucursal.sap ? 1 : 0,                   // Nuevo: SAP (convertir a 0/1)
                ip: sucursal.ip || '',                       // Nuevo: IP
                ip_serv: sucursal.ip_serv || ''              // Nuevo: IP del servidor
            });
        } else {
            console.log('➕ Creando nueva sucursal');
            // En creación: habilitar el campo ID y limpiarlo
            this.sucursalForm.get('sucursal')?.enable();
            this.sucursalForm.reset({
                sucursal: '',    // Limpiar ID para nueva sucursal
                estado: 'A',
                zona_geografica: 1,
                sap: 0          // SAP por defecto desactivado
            });
        }

        this.showSucursalModal = true;
    }

    closeSucursalForm(): void {
        console.log('🔒 Cerrando modal de sucursal');
        this.showSucursalModal = false;

        // Limpiar estado
        this.isEditingSucursal = false;
        this.savingSucursal = false;
        this.sucursalForm.get('sucursal')?.enable();
        this.sucursalForm.reset();

        // Forzar detección de cambios
        this.cdr.detectChanges();
        console.log('✅ Modal cerrado correctamente');
    }

    saveSucursal(): void {
        if (this.sucursalForm.valid && this.proyectoSeleccionado) {
            this.savingSucursal = true;
            const formData = this.sucursalForm.value;

            // Obtener el valor del campo sucursal (considerando que puede estar deshabilitado)
            const sucursalId = this.sucursalForm.get('sucursal')?.value;

            const sucursalData: CreateSucursalRequest = {
                sucursal: parseInt(sucursalId),              // ID de la sucursal
                tienda: formData.tienda,
                direccion: formData.direccion,
                latitud: formData.latitud || '',
                longitud: formData.longitud || '',
                id_proy: this.proyectoSeleccionado.id_proy,
                zona_geografica: formData.zona_geografica,
                estado: formData.estado,
                telefono: formData.telefono || '',           // Nuevo: Teléfono
                sap: formData.sap || 0,                      // Nuevo: SAP (0/1)
                ip: formData.ip || '',                       // Nuevo: IP
                ip_serv: formData.ip_serv || ''              // Nuevo: IP del servidor
            };

            if (this.isEditingSucursal) {
                // Actualizar sucursal existente
                console.log('📝 Actualizando sucursal:', sucursalData);
                this.sucursalService.updateSucursal(sucursalData).subscribe({
                    next: (response: any) => {
                        this.handleSaveSuccess('Sucursal actualizada correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'actualizar')
                });
            } else {
                // Crear
                console.log('➕ Creando sucursal:', sucursalData);
                this.sucursalService.createSucursal(sucursalData).subscribe({
                    next: (response: any) => {
                        this.handleSaveSuccess('Sucursal creada correctamente');
                    },
                    error: (error) => this.handleSaveError(error, 'crear')
                });
            }
        }
    }

    private handleSaveSuccess(message: string): void {
        this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: message
        });

        this.closeSucursalForm();
        this.cargarSucursales();
        this.savingSucursal = false;
    }

    private handleSaveError(error: any, operation: string): void {
        console.error(`❌ Error al ${operation} sucursal:`, error);

        let errorMessage = `Error al ${operation} la sucursal`;
        if (error && error.mensaje) {
            errorMessage = error.mensaje;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });

        this.savingSucursal = false;
    }

    // ========== EDICIÓN INLINE ==========

    editInlineSucursal(sucursal: Sucursal, field: string): void {
        this.editingCell = sucursal.sucursal + '_' + field;
        this.originalValue = (sucursal as any)[field];
    }

    saveInlineEditSucursal(sucursal: Sucursal, field: string): void {
        console.log('💾 Guardando inline:', field, 'Nuevo valor:', (sucursal as any)[field]);

        if ((sucursal as any)[field] === this.originalValue) {
            console.log('ℹ️ Valor no cambió, cancelando');
            this.cancelInlineEdit();
            return;
        }

        this.sucursalService.updateSucursalField(sucursal.sucursal, field, (sucursal as any)[field]).subscribe({
                next: (response: any) => {
                    console.log('✅ Campo actualizado:', response);
                this.editingCell = null;
                this.originalValue = null;

                this.messageService.add({
                    severity: 'success',
                    summary: 'Campo Actualizado',
                    detail: `${this.getFieldLabel(field)} actualizado correctamente`
                });
            },
            error: (error: any) => {
                console.error('❌ Error al actualizar campo:', error);

                // Revertir el cambio local
                (sucursal as any)[field] = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Error al actualizar ${this.getFieldLabel(field)}`,
                    life: 5000
                });
            }
        });
    }

    cancelInlineEdit(): void {
        this.editingCell = null;
        this.originalValue = null;
    }

    private getFieldLabel(field: string): string {
        const labels: { [key: string]: string } = {
            tienda: 'Nombre de Sucursal',
            direccion: 'Dirección',
            estado: 'Estado'
        };
        return labels[field] || field;
    }

    // ========== TOGGLE ESTADO ==========

    toggleEstado(sucursal: Sucursal): void {
        const nuevoEstado = sucursal.estado === 'A' ? 'R' : 'A';

        if (nuevoEstado === 'R') {
            // Confirmar desactivación
            this.confirmMessage = `¿Está seguro de que desea desactivar la sucursal "${sucursal.tienda}"?`;
            this.confirmHeader = 'Confirmar Desactivación';
            this.accionConfirmada = () => this.procesarCambioEstado(sucursal, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            // Activar directamente
            this.procesarCambioEstado(sucursal, nuevoEstado);
        }
    }

    private procesarCambioEstado(sucursal: Sucursal, nuevoEstado: string): void {
        const estadoAnterior = sucursal.estado;
        sucursal.estado = nuevoEstado;

        this.sucursalService.updateSucursalField(sucursal.sucursal, 'estado', nuevoEstado).subscribe({
            next: (response: any) => {
                console.log('✅ Estado actualizado:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado Actualizado',
                    detail: `Sucursal ${nuevoEstado === 'A' ? 'activada' : 'desactivada'} correctamente`
                });
            },
            error: (error: any) => {
                console.error('❌ Error al cambiar estado:', error);

                // Revertir cambio local
                sucursal.estado = estadoAnterior;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado de la sucursal',
                    life: 5000
                });
            }
        });
    }

    // ========== ELIMINACIÓN ==========

    eliminarSucursal(sucursal: Sucursal): void {
        this.confirmMessage = `¿Está seguro de que desea eliminar la sucursal "${sucursal.tienda}"?`;
        this.confirmHeader = 'Confirmar Eliminación';
        this.accionConfirmada = () => this.procesarEliminacionSucursal(sucursal);
        this.showConfirmDialog = true;
    }

    private procesarEliminacionSucursal(sucursal: Sucursal): void {
        this.sucursalService.deleteSucursal(sucursal.sucursal).subscribe({
                next: (response: any) => {
                    console.log('✅ Sucursal eliminada:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminada',
                    detail: 'Sucursal eliminada correctamente'
                });
                this.cargarSucursales();
            },
            error: (error: any) => {
                console.error('❌ Error al eliminar sucursal:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar la sucursal',
                    life: 5000
                });
            }
        });
    }

    // ========== CONFIRMACIONES ==========

    confirmarAccion(): void {
        if (this.accionConfirmada) {
            this.accionConfirmada();
        }
        this.cancelarConfirmacion();
    }

    cancelarConfirmacion(): void {
        this.showConfirmDialog = false;
        this.confirmMessage = '';
        this.confirmHeader = '';
        this.accionConfirmada = null;
    }

    // ========== UTILIDADES ==========

    getEstadoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: string): 'success' | 'danger' {
        return estado === 'A' ? 'success' : 'danger';
    }

    getSapLabel(sap: number): string {
        return sap === 1 ? 'Activado' : 'Desactivado';
    }

    getSapSeverity(sap: number): 'success' | 'danger' {
        return sap === 1 ? 'success' : 'danger';
    }

    toggleSap(): void {
        const currentValue = this.sucursalForm.get('sap')?.value;
        const newValue = currentValue === 1 ? 0 : 1;
        this.sucursalForm.patchValue({ sap: newValue });
    }

    /**
     * Determina qué campo usar para mostrar el nombre del proyecto
     */
    getDisplayField(): string {
        if (!this.proyectos || this.proyectos.length === 0) {
            return 'nombre';
        }

        const primerProyecto = this.proyectos[0];
        const camposPosibles = ['nombre', 'name', 'titulo', 'descripcion', 'nom_proy'];

        for (const campo of camposPosibles) {
            if (primerProyecto.hasOwnProperty(campo) && (primerProyecto as any)[campo]) {
                // console.log('🎯 Usando campo para display:', campo);
                return campo;
            }
        }

        console.warn('⚠️ No se encontró campo válido para display, usando "nombre" por defecto');
        return 'nombre';
    }

    /**
     * Obtiene el nombre del proyecto usando el campo correcto
     */
    getProyectoNombre(proyecto: any): string {
        if (!proyecto) return '';

        const campoDisplay = this.getDisplayField();
        const nombre = proyecto[campoDisplay];

        if (nombre) {
            return nombre;
        }

        // Fallback: intentar otros campos comunes
        const camposFallback = ['nombre', 'name', 'titulo', 'descripcion'];
        for (const campo of camposFallback) {
            if ((proyecto as any)[campo]) {
                return (proyecto as any)[campo];
            }
        }

        // Último fallback: mostrar ID del proyecto
        return `Proyecto ${proyecto.id_proy || 'sin nombre'}`;
    }
}
