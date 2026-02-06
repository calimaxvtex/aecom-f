import { Component, OnInit, ChangeDetectorRef, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// PrimeNG Modules (standalone)
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { CuponService } from '@/features/cupones/services/cupones.service';
import { CupondService } from '@/features/cupones/services/cuponesclientes.service';
import { SessionService } from '@/core/services/session.service';
import { CuponItem } from '@/features/cupones/models';

@Component({
    selector: 'app-cupones',
    standalone: true,
    templateUrl: './cupones.component.html',
    styleUrls: ['./cupones.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TabsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        TagModule,
        SelectModule,
        SelectButtonModule,
        InputMaskModule,
        DatePickerModule,
        ToggleSwitchModule,
        FloatLabelModule,
        CheckboxModule,
        CardModule,
        TooltipModule,
        ConfirmDialogModule,
        InputNumberModule
    ],
    providers: [MessageService]
})
export class CuponesComponent implements OnInit {

    cupones: any[] = [];
    filteredCupones: any[] = [];
    loadingCupones = false;
    idPromoOriginal: number | null = null;

    // Filtros
    estadoFiltro: string = 'A';
    estadoFiltroSeleccionado: string = 'A';
    estadoOptions: { label: string; value: string }[] = [
        { label: 'Activos', value: 'A' },
        { label: 'Inactivos', value: 'R' },
        { label: 'Todos', value: '' }
    ];

    //estado de carga cupones
    savingCupones = false;

    // ID de colección seleccionada para pasar al CuponesdComponent
    selectedCuponId: number | null = null;


    activeTabIndex = 0;
    cuponSeleccionado: any = null;

    // Estados de modales
    showCuponModal = false;

    // Estados de carga CUPOND
    loadingCupond = false;
    savingCupond = false;
    deletingCupond = false;
    cupondDataLoaded = false;

    // Datos COLLD
    cupondClientes: any[] = [];
    filteredCuponClientes: any[] = [];

    // Estados de confirmación
    showConfirmDialog = false;
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;
    accionCancelada: (() => void) | null = null;


    // Estados del formulario
    CuponesForm!: FormGroup;
    isEditingCupon = false;

    // Selección múltiple
    multiSelectMode = false;
    selectedCupondClientes: any[] = [];
    selectedCupondClientesMap: { [key: number]: boolean } = {};
    selectAllCupond = false;

    disableModalClose = false;

    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;
    hasChanges = false;


    editingField: string | null = null;
    editingCupon: CuponItem | null = null;

    // Control de estado temporal del ToggleSwitch
    toggleStates: { [key: string]: boolean } = {};
    conteoEstadosBackend: { estado: string; total: number }[] = [];
    estadoCards: { label: string; value: string; total: number }[] = [];

    constructor(
        private fb: FormBuilder,
        private cuponService: CuponService,
        private cupondService: CupondService,
        private sessionService: SessionService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {
        this.initializeForm();
    }
    @ViewChild('inlineContainer') inlineContainer!: ElementRef;

    // Event listener para cerrar modal al hacer clic fuera
    private modalClickListener: ((event: Event) => void) | null = null;
    private modalElement: HTMLElement | null = null;

    private removeModalClickListener(): void {
        if (this.modalClickListener) {
            document.removeEventListener('click', this.modalClickListener);
            this.modalClickListener = null;
        }
    }
    private addModalClickListener(): void {
        // Remover listener anterior si existe
        this.removeModalClickListener();
        // Esperar a que el modal esté completamente renderizado
        setTimeout(() => {
            this.modalElement = document.querySelector('.p-dialog') as HTMLElement;

            if (!this.modalElement) return;
            // Agregar listener al documento
            this.modalClickListener = (event: Event) => {
                // Solo procesar si el modal está abierto
                if (!this.showCuponModal || !this.modalElement) return;

                const target = event.target as HTMLElement;

                // Si el clic fue fuera del modal completo, cerrar
                if (!this.modalElement.contains(target)) {
                    this.handleClickOutside();
                }
            };

            document.addEventListener('click', this.modalClickListener);
        }, 200); // Aumentar el delay para asegurar que el DOM esté listo
    }
    private handleClickOutside(): void {
        if (this.disableModalClose) {
            return; // 👈 NO cerrar modal
        }
        // Remover listener inmediatamente
        this.removeModalClickListener();
        // Cerrar modal
        this.closeCuponesForm();
        // Resetear referencia
        this.modalElement = null;
    }
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadCupones();
        this.toggleValue();
        this.setupUppercase();
        this.initValidacionIdPromo();
        /*this.CuponesForm.get('id_promo')?.valueChanges
        .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter(val => val && val !== this.idPromoOriginal)
    )
        .subscribe(idPromo => {
        this.validarPromoEnFormulario(idPromo);
        });*/
    }

    private initValidacionIdPromo(): void {
        const control = this.CuponesForm.get('id_promo');

        if (!control) return;

        control.valueChanges
            .pipe(
                debounceTime(400),
                distinctUntilChanged(),
                filter(val => val && val !== this.idPromoOriginal),
                takeUntil(this.destroy$)
            )
            .subscribe(idPromo => {
                this.validarPromoEnFormulario(idPromo);
            });
    }

    ngOnDestroy() {
        this.removeModalClickListener();
        this.destroy$.next();
        this.destroy$.complete();
    }

    setupUppercase() {
        this.CuponesForm.get('codigo')?.valueChanges.subscribe(value => {
            if (value) {
                this.CuponesForm.get('codigo')?.setValue(
                    value.toUpperCase(),
                    { emitEvent: false }
                );
            }
        });
    }
    validarPromoEnFormulario(idPromo: number) {
        this.cuponService.validarIdPromo(idPromo).subscribe(resp => {

            if (resp.statuscode === 200) {
                this.CuponesForm.get('id_promo')?.setErrors(null);
            } else {
                this.CuponesForm.get('id_promo')?.setErrors({
                    promoInvalida: resp.mensaje
                });
            }

        });
    }

    loadCupones(): void {
        this.loadingCupones = true;

        this.cuponService.getAllRecords().subscribe({
            next: (response: any) => {
                const data = Array.isArray(response) ? response[0]?.data : response?.data;

                if (Array.isArray(data)) {
                    this.cupones = data;
                    this.filteredCupones = [...data];

                    // Aplicar filtro de estado en el frontend
                    this.filterCpByState();
                    // Mensaje de carga exitosa
                    const stateText = this.estadoFiltro === 'A' ? 'activos' : this.estadoFiltro === 'R' ? 'inactivos' : 'todos';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Datos Cargados',
                        detail: `${this.cupones.length} cupones totales, mostrando ${this.filteredCupones.length} ${stateText}.`,
                        life: 3000
                    });
                } else {
                    this.cupones = [];
                    this.filteredCupones = [];
                }

                this.loadingCupones = false;
            },
            error: (error: any) => {
                console.error('Error al cargar cupones:', error);
                this.loadingCupones = false;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los cupones',
                    life: 5000
                });
            }
        });
    }

    eliminarCupon(cupon: CuponItem) {
        this.confirmMessage = `¿Está seguro de que desea eliminar el cupon "${cupon.codigo}"?`;
        this.confirmHeader = 'Confirmar Eliminación';
        this.accionConfirmada = () => this.procesarEliminacionCupon(cupon);
        this.showConfirmDialog = true;
    }

    private procesarEliminacionCupon(cupon: CuponItem): void {
        this.cuponService.deleteCupon(cupon.id_cupon).subscribe({
            next: (response: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Cupón eliminado correctamente'
                });
                this.loadCupones();
            },
            error: (error: any) => {
                console.error(' Error al eliminar el Cupón:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar el Cupón',
                    life: 5000
                });
            }
        });
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: MouseEvent) {
        if (!this.editingCell) return;

        const clickedInside = this.inlineContainer?.nativeElement.contains(event.target);

        if (!clickedInside) {
            this.cancelInlineEdit();
        }
    }


    // ========== MÉTODOS DE UI ==========

    onGlobalFilter(table: any, event: Event): void {
        const input = event.target as HTMLInputElement;
        table.filterGlobal(input.value, 'contains');
    }

    filterCpByState(): void {
        if (this.estadoFiltro === '') {
            // Mostrar todas las sucursales
            this.filteredCupones = [...this.cupones];
        } else {
            // Filtrar por estado específico
            this.filteredCupones = this.cupones.filter(cupones =>
                cupones.estado === this.estadoFiltro
            );
        }
    }

    onEstadoFiltroClick(estadoValue: string): void {
        // Si se hace click en el mismo botón, resetear el filtro
        if (this.estadoFiltroSeleccionado === estadoValue) {
            this.estadoFiltroSeleccionado = 'A';
            this.estadoFiltro = 'A';
        } else {
            // Cambiar al nuevo filtro
            this.estadoFiltroSeleccionado = estadoValue;
            this.estadoFiltro = estadoValue;
        }
        const stateText = this.estadoFiltro === 'A' ? 'Activos' : this.estadoFiltro === 'R' ? 'Inactivos' : 'Todos';
        // Aplicar filtro
        if (this.cupones.length > 0) {
            // Forzar detección de cambios antes de filtrar
            this.cdr.detectChanges();
            this.filterCpByState();
            const mensaje = estadoValue === this.estadoFiltroSeleccionado
                ? `Filtro aplicado: ${stateText}`
                : `Filtro reseteado a: Activos`;

            this.messageService.add({
                severity: 'success',
                summary: 'Filtro Aplicado',
                detail: mensaje,
                life: 1500
            });
        } else {
            if (this.cuponSeleccionado) {
                this.loadCupones();
            }
        }
    }

    private toggleValue(): void {
        // Toggle → estado ('A' | 'R')
        this.CuponesForm.get('estadoToggle')?.valueChanges.subscribe(value => {
            this.CuponesForm.get('estado')?.setValue(value ? 'A' : 'R', { emitEvent: false });
        });

        // estado → Toggle (modo editar)
        this.CuponesForm.get('estado')?.valueChanges.subscribe(value => {
            this.CuponesForm.get('estadoToggle')?.setValue(value === 'A', { emitEvent: false });
        });
    }

    saveCupon(): void {
        if (this.CuponesForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario inválido',
                detail: 'Por favor complete todos los campos requeridos',
                life: 3000
            });
            return;
        }
        this.savingCupones = true;
        const formValue = this.CuponesForm.getRawValue();
        if (this.isEditingCupon && this.cuponSeleccionado) {
            const updateData = {
                id_cupon: this.cuponSeleccionado.id_cupon,
                codigo: formValue.codigo,
                id_promo: formValue.id_promo,
                tipo_cupon: formValue.tipo_cupon,
                descripcion: formValue.descripcion,
                estado: formValue.estado,
                url_min: formValue.url_min,
                fecha_ini: this.normalizeDateOnly(formValue.fecha_ini),
                fecha_fin: this.normalizeDateOnly(formValue.fecha_fin),
                limite: formValue.limite,
                importe_minimo: formValue.importe_minimo,
                valor_desc: formValue.valor_desc
            };

            this.cuponService.updateCupon(updateData).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Cupón actualizado correctamente'
                    });
                    this.closeCuponesForm();
                    this.loadCupones();
                    this.savingCupones = false;
                },
                error: (error) => {
                    console.error('Error al actualizar el cupón:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error?.mensaje || 'Error al actualizar el cupón',
                        life: 5000
                    });
                    this.savingCupones = false;
                }
            });
        } else {
            this.idPromoOriginal = null;
            const createData = {
                codigo: formValue.codigo,
                id_promo: formValue.id_promo,
                tipo_cupon: formValue.tipo_cupon,
                descripcion: formValue.descripcion,
                estado: formValue.estado,
                url_min: formValue.url_min,
                fecha_ini: this.normalizeDateOnlyRequired(formValue.fecha_ini),
                fecha_fin: this.normalizeDateOnlyRequired(formValue.fecha_fin),
                limite: formValue.limite,
                importe_minimo: formValue.importe_minimo,
                valor_desc: formValue.valor_desc
            };

            this.cuponService.createCuponection(createData).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Cupón creado correctamente'
                    });
                    this.closeCuponesForm();
                    this.loadCupones();
                    this.savingCupones = false;
                },
                error: (error) => {
                    console.error('Error al crear cupón:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.mensaje || 'Error al crear el cupón',
                        life: 5000
                    });
                    this.savingCupones = false;
                }
            });
        }

        const payload = this.CuponesForm.value;
    }

    // ========== FORMULARIO ==========

    openCuponForm(cupon?: CuponItem): void {
        this.isEditingCupon = !!cupon;
        if (cupon) {
            this.cuponSeleccionado = cupon;
            this.idPromoOriginal = cupon.id_promo;
            this.CuponesForm.patchValue({
                codigo: cupon.codigo,
                id_promo: cupon.id_promo,
                tipo_cupon: cupon.tipo_cupon,
                descripcion: cupon.descripcion,
                estado: cupon.estado,
                url_min: cupon.url_min,
                fecha_ini: cupon.fecha_ini ? new Date(cupon.fecha_ini) : null,
                fecha_fin: cupon.fecha_fin ? new Date(cupon.fecha_fin) : null,
                limite: cupon.limite,
                importe_minimo: cupon.importe_minimo,
                valor_desc: cupon.valor_desc
            });
            this.CuponesForm.get('codigo')?.disable();

        } else {
            this.cuponSeleccionado = null;

            this.CuponesForm.reset({
                codigo: '',
                id_promo: null,
                tipo_cupon: 1,
                descripcion: '',
                estado: 'A',
                url_min: 'https://imagenes.calimaxjs.com/img/banners/upload_banner20251028/avatar-mandado-max-optz.png',
                fecha_ini: null,
                fecha_fin: null,
                limite: null,
                importe_minimo: null,
                valor_desc: null
            });
            this.CuponesForm.get('codigo')?.enable();
        }

        this.showCuponModal = true;
        this.addModalClickListener();
    }

    estadosCupon = [
        { label: 'Inicial', value: 'I' },
        { label: 'Activo', value: 'A' },
        { label: 'Aplicado', value: 'R' },
        { label: 'Cancelado', value: 'C' },
        { label: 'Baja', value: 'B' }
    ];


    initializeForm(): void {
        this.CuponesForm = this.fb.group({
            codigo: [String, [Validators.required]],
            descripcion: [String, [Validators.required]],
            estadoToggle: [true],
            estado: ['A', [Validators.required]],
            fecha_ini: [Validators.required],
            fecha_fin: [Validators.required],
            id_promo: [Number, [Validators.required]],
            limite: [Number, [Validators.required]],
            tipo_cupon: [Number, [Validators.required]],
            importe_minimo: [Number, [Validators.required]],
            url_min: [String, [Validators.required]],
            valor_desc: [Number, [Validators.required]]
        });
    }

    onCuponSelect(event: any): void {
        const nuevoCupon = event.data;

        const cuponCambiado =
            this.cuponSeleccionado?.id_cupon !== nuevoCupon?.id_cupon;

        this.cuponSeleccionado = nuevoCupon;
        this.selectedCuponId = nuevoCupon?.id_cupon || null;

        if (cuponCambiado) {
            this.cupondDataLoaded = false;
            this.cupondClientes = [];
            this.filteredCuponClientes = [];

            this.multiSelectMode = false;
            this.selectedCupondClientes = [];
            this.selectedCupondClientesMap = {};
            this.selectAllCupond = false;

            // Forzar carga inmediata si es necesario
            if (!this.cupondDataLoaded || cuponCambiado) {
                this.cargarClientesPorCupon();
            }
        }
    }

    onTabClick(tabIndex: number): void {
        this.activeTabIndex = tabIndex;

        // Tab 1 = Clientes del cupón
        if (tabIndex === 1) {
            if (!this.cuponSeleccionado) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Sin cupón',
                    detail: 'Selecciona un cupón para ver sus clientes',
                    life: 3000
                });
                return;
            }

            if (!this.cupondDataLoaded) {
                this.cargarClientesPorCupon();
            }
        }
    }

    refreshCupondData(): void {
        if (this.cuponSeleccionado) {
            this.loadingCupond = true;
            this.cupondDataLoaded = false;

            // Resetear selección múltiple
            this.multiSelectMode = false;
            this.selectedCupondClientes = [];
            this.selectedCupondClientesMap = {};
            this.selectAllCupond = false;

            this.cargarClientesPorCupon();
        } else {
            console.warn('No hay cupón seleccionado para refrescar');
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin selección',
                detail: 'Selecciona un cupón primero para refrescar sus detalles',
                life: 3000
            });
        }
    }
    private construirCardsEstado(): void {
        // Protección por si el backend no manda nada
        const conteo = this.conteoEstadosBackend || [];

        this.estadoCards = this.estadosCupon.map(estado => {             
          const encontrado = conteo.find(
            c => c.estado === estado.value
          );
      
          return {
            label: estado.label,
            value: estado.value,
            total: encontrado ? encontrado.total : 0
          };
        });
      }      

    cargarClientesPorCupon(): void {
        if (!this.cuponSeleccionado?.id_cupon) {
            return;
        }

        this.loadingCupond = true;
        this.cupondDataLoaded = false;

        this.cupondService.getClientesPorCupon(this.cuponSeleccionado.id_cupon)
            .subscribe({
                next: (response) => {
                
                    //Clientes
                    this.cupondClientes = response.data.clientes || [];
                    this.filteredCuponClientes = [...this.cupondClientes];
                
                    //Conteo por estado
                    this.conteoEstadosBackend = response.data.conteo_estados || [];
                    this.construirCardsEstado();
                
                    //UI
                    this.cupondDataLoaded = true;
                    this.loadingCupond = false;
                },                
                error: (error) => {
                    console.error('Error al cargar clientes del cupón:', error);

                    this.loadingCupond = false;
                    this.cupondDataLoaded = true;

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudieron cargar los clientes del cupón',
                        life: 5000
                    });
                }
            });
    }

    getEstadoLabel(estado: string): string {
        return estado === 'A' ? 'Activo' : 'Inactivo';
    }

    getEstadoSeverity(estado: string): 'success' | 'danger' {
        return estado === 'A' ? 'success' : 'danger';
    }

    getEstadoLabelC(estado: string): string {
        switch (estado) {
            case 'I': return 'Creado';
            case 'A': return 'Activado';
            case 'R': return 'Aplicado';
            case 'C': return 'Cancelado';
            case 'B': return 'Surtido';
            default: return 'Desconocido';
        }
    }

    getEstadoSeverityC(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (estado) {
            case 'I': return 'info';
            case 'A': return 'success';
            case 'R': return 'secondary';
            case 'C': return 'danger';
            case 'B': return 'warn';
            default: return 'info';
        }
    }

    // ========== TOGGLE ESTADO ==========

    toggleEstado(cupon: CuponItem): void {
        const nuevoEstado = cupon.estado === 'A' ? 'R' : 'A';

        if (nuevoEstado === 'R') {
            this.confirmMessage = `¿Está seguro que desea cambiar el estado del cupón "${cupon.codigo}"?`;
            this.confirmHeader = 'Confirmar desactivación';
            this.accionConfirmada = () => this.procesarCambioEstado(cupon, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            this.procesarCambioEstado(cupon, nuevoEstado);
        }
    }

    private procesarCambioEstado(cupon: CuponItem, nuevoEstado: 'A' | 'R'): void {
        const estadoAnterior = cupon.estado;

        cupon.estado = nuevoEstado;

        const body = {
            id_cupon: cupon.id_cupon,
            estado: nuevoEstado
        };

        this.cuponService.updateCupon(body).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `Estado ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`
                });
            },
            error: (error) => {
                cupon.estado = estadoAnterior;

                console.error('Error al cambiar estado:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo actualizar el estado',
                    life: 5000
                });
            }
        });
    }


    toggleState() {
        const estadoActual = this.CuponesForm.get('estado')?.value;
        this.CuponesForm.patchValue({
            estado: estadoActual === 'A' ? 'R' : 'A'
        });
        this.CuponesForm.markAsDirty();
    }

    formatearNombreCompleto(
        nombre?: string | null,
        apPaterno?: string | null,
        apMaterno?: string | null
    ): string {

        const partes = [nombre, apPaterno, apMaterno]
            .filter(p => p && p.trim() !== '')
            .map(p =>
                p!
                    .toLowerCase()
                    .split(' ')
                    .map(palabra =>
                        palabra.charAt(0).toUpperCase() + palabra.slice(1)
                    )
                    .join(' ')
            );

        return partes.join(' ');
    }

    formatDate(fecha: string | null): string {
        if (!fecha) return '';
        const [year, month, day] = fecha.split('-');
    
        return `${day}/${month}/${year}`;
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
        this.accionConfirmada = null;
    }

    closeCuponesForm(): void {
        this.showCuponModal = false;
    }

    onCuponModalHide(): void {
        this.CuponesForm.reset();
        this.cuponSeleccionado = null;
        this.isEditingCupon = false;
        this.modalElement = null;
    }

    editInlineCupon(cupon: CuponItem, field: string): void {
        this.editingCell = cupon.id_cupon + '_' + field;
        this.editingField = field;
        this.editingCupon = cupon;
        this.originalValue = (cupon as any)[field];
    }

    cancelInlineEdit(): void {
        if (this.editingCupon && this.editingField !== null) {
            (this.editingCupon as any)[this.editingField] = this.originalValue;
        }

        this.editingCell = null;
        this.editingField = null;
        this.editingCupon = null;
        this.originalValue = null;
    }


    saveInlineCupon(cupon: CuponItem, field: string): void {
        if ((cupon as any)[field] === this.originalValue) {
            this.cancelInlineEdit();
            return;
        }
        const sessionBase = this.sessionService.getApiPayloadBase();

        this.cuponService.updateCupon({
            id_cupon: cupon.id_cupon,
            [field]: (cupon as any)[field],
            ...sessionBase
        }).subscribe({
            next: (response) => {
                const responseData = Array.isArray(response) ? response[0] : response;

                if (responseData && responseData.statuscode === 200) {
                    this.editingCell = null;
                    this.originalValue = null;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Campo Actualizado',
                        detail: `Campo ${field} actualizado correctamente`
                    });
                } else {
                    // Revertir el cambio local
                    (cupon as any)[field] = this.originalValue;
                    this.editingCell = null;
                    this.originalValue = null;

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: (responseData && responseData.mensaje) || 'Error al actualizar el campo',
                        life: 5000
                    });
                }
            },
            error: (error) => {
                console.error('Error al actualizar campo:', error);

                // Revertir el cambio local
                (cupon as any)[field] = this.originalValue;
                this.editingCell = null;
                this.originalValue = null;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.mensaje || 'Error al actualizar',
                    life: 5000
                });
            }
        });

    }

    isInlineSaveDisabled(value: any): boolean {
        return value === null || value === undefined || value.toString().trim() === '';
    }

    normalizeDateOnly(date: Date | string | undefined): string | undefined {
        if (!date) return undefined;

        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
    }

    normalizeDateOnlyRequired(date: Date | string): string {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().split('T')[0];
    }

    getCollectionToggleState(cupon: CuponItem): boolean {
        // Usar el estado temporal si existe, sino usar el estado real
        const tempState = this.toggleStates[cupon.id_cupon];
        return tempState !== undefined ? tempState : cupon.estado === 'A';
    }
    
    onToggleSwitchChange(isChecked: boolean, cupon: CuponItem): void {

        const valorActual = cupon.estado;
        const nuevoEstado = isChecked ? 'A' : 'R';

        // Si el valor no cambió, no hacer nada
        if ((nuevoEstado === 'A' && valorActual === 'A') || (nuevoEstado === 'R' && valorActual === 'R')) {
            return;
        }

        // Para activación, hacer el cambio directamente
        if (nuevoEstado === 'A') {
            this.procesarCambioEstado(cupon, 'A');
            return;
        } else {
            delete this.toggleStates[cupon.id_cupon];
            this.procesarCambioEstado(cupon, 'R');
        }

    }
}
