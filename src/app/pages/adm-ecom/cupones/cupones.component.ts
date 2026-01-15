import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Modules (standalone)
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
// import { RowReorderModule } from 'primeng/rowreorder'; // Comentado temporalmente
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
import { CheckboxModule } from 'primeng/checkbox'; // Para checkboxes de selección múltiple
// import { SplitButtonModule } from 'primeng/splitbutton'; // Ya no se usa, filtros ahora son botones
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { CuponService } from '@/features/cupones/services/cupones.service';
import { CupondService } from '@/features/cupones/services/cuponesd.service';
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
        // RowReorderModule,  // Para funcionalidades de reordenamiento - comentado temporalmente
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
        CheckboxModule, // Para checkboxes de selección múltiple
        // SplitButtonModule, // Ya no se usa, filtros ahora son botones
        CardModule,  // Para las tarjetas de información
        TooltipModule,  // Para tooltips
        ConfirmDialogModule,  // Para confirmación de cambios
        // Import del ItemsComponent
    ],
    providers: [MessageService]
})
export class CuponesComponent implements OnInit {

    cupones: any[] = [];
    filteredCupones: any[] = [];
    loadingCupones = false;

    // ID de colección seleccionada para pasar al CuponesdComponent
    selectedCuponId : number | null = null;


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

    constructor(
        private fb: FormBuilder,
        private cuponService: CuponService,
        private cupondService: CupondService,
        private messageService: MessageService
    ) {
        this.initializeForm();
    }

    private removeModalClickListener(): void {
        if (this.modalClickListener) {
            document.removeEventListener('click', this.modalClickListener);
            this.modalClickListener = null;
        }
    }

    ngOnInit(): void {
        this.loadCupones();
    }

    ngOnDestroy() {
        this.removeModalClickListener();
    }

    // Event listener para cerrar modal al hacer clic fuera
    private modalClickListener: ((event: Event) => void) | null = null;
    private modalElement: HTMLElement | null = null;

    loadCupones(): void {
        this.loadingCupones = true;

        this.cuponService.getAllRecords().subscribe({
            next: (response: any) => {
                console.log('Respuesta API:', response);

                const data = Array.isArray(response) ? response[0]?.data : response?.data;

                if (Array.isArray(data)) {
                    this.cupones = data;
                    this.filteredCupones = [...data];
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
                console.log('Registro eliminado:', response);
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

    saveCupon():void {
        console.log('hola')
        if (this.CuponesForm.invalid) {
            return;
          }
        
          const payload = this.CuponesForm.value;
          console.log('Cupón a guardar:', payload);
    }

    closeCuponesForm(): void {
        this.showCuponModal = false;
        this.CuponesForm.reset();
        this.cuponSeleccionado = null;
        this.isEditingCupon = false;
        
        // Limpiar event listener y referencias del modal
        this.removeModalClickListener();
        this.modalElement = null;
    }
    // ========== FORMULARIO ==========
    
    openCuponForm(cupon?: CuponItem): void {
        this.showCuponModal = true;
        //this.addModalClickListener();
    }
    estadosCupon = [
        { label: 'Inicial', value: 'I' },
        { label: 'Activo', value: 'A' },
        { label: 'Utilizado', value: 'R' },
        { label: 'Cancelado', value: 'C' },
        { label: 'Baja', value: 'B' }
    ];
      
    tiposCupon = [
        { label: 'Monto fijo', value: 1 },
        { label: 'Porcentaje', value: 2 }
    ];

    initializeForm(): void {
        this.CuponesForm = this.fb.group({
            codigo: [''],
            descripcion: [''],
            estado: ['I'],
            fecha_ini: [null],
            fecha_fin: [null],
            id_promo: [null],
            limite: [null],
            tipo_cupon: [null],
            importe_minimo: [null],
            url_min: [''],
            valor_desc: [null]
          });
    }
      
      

    /*onCuponSelect(event: any): void {
        const nuevoCupon = event.data;

        console.log('se le dio click a la row')
    
        this.cuponSeleccionado = nuevoCupon;
        this.selectedCuponId = nuevoCupon?.id_cupon || null;

        console.log('id_cupon de la row:',this.selectedCuponId)

        const cuponCambiado = this.cuponSeleccionado?.id_cupon !== nuevoCupon?.id_cupon;
        
        console.log('Cupon cambiado:', cuponCambiado)


        if (cuponCambiado) {
            this.cupondDataLoaded = false;
            this.cupondClientes = [];
            this.filteredCuponClientes = [];

            this.multiSelectMode = false;
            this.selectedCupondClientes = [];
            this.selectedCupondClientesMap = {};
            this.selectAllCupond = false;
        }
    }*/
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

        /*if (this.activeTabIndex === 1) {
            this.cargarClientesPorCupon();
        }*/
        // Cambiar al tab de Items
        //this.activeTabIndex = 1;

        // Forzar carga inmediata si es necesario
        if (!this.cupondDataLoaded || cuponCambiado) {
            this.cargarClientesPorCupon();
        }
    }
    }


    onCuponDoubleClick(cupon: CuponItem){
        const cuponCambiado = this.cuponSeleccionado?.id_cupon !== cupon.id_cupon;

        this.cuponSeleccionado = cupon;
        this.selectedCuponId = cupon.id_cupon;

        // ✅ Si cambió la colección, resetear el estado de carga COLLD
        if (cuponCambiado) {
            this.cupondDataLoaded = false;
            this.cupondClientes = [];
            this.filteredCuponClientes = [];

            // Resetear selección múltiple
            this.multiSelectMode = false;
            this.selectedCupondClientes = [];
            this.selectedCupondClientesMap = {};
            this.selectAllCupond = false;
        }

        // Cambiar al tab de Items
        this.activeTabIndex = 1;

        // Forzar carga inmediata si es necesario
        if (!this.cupondDataLoaded || cuponCambiado) {
            this.cargarClientesPorCupon();
        }
    }
    

    onGlobalFilter(table: any, event: Event): void {
        const input = event.target as HTMLInputElement;
        table.filterGlobal(input.value, 'contains');
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

     // ✅ MÉTODO PÚBLICO PARA FORZAR RECARGA MANUAL
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
            console.warn('⚠️ No hay cupón seleccionado para refrescar');
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin selección',
                detail: 'Selecciona un cupón primero para refrescar sus detalles',
                life: 3000
            });
        }
    }
    
    cargarClientesPorCupon(): void {
        console.log('Cargando clientes para cupón:', this.cuponSeleccionado?.id_cupon);

        if (!this.cuponSeleccionado?.id_cupon) {
            return;
        }
    
        this.loadingCupond = true;
        this.cupondDataLoaded = false;
    
        this.cupondService.getClientesPorCupon(this.cuponSeleccionado.id_cupon)
            .subscribe({
                next: (response) => {
                    const responseData = Array.isArray(response) ? response[0] : response;
    
                    if (
                        responseData &&
                        responseData.statuscode === 200 &&
                        Array.isArray(responseData.data)
                    ) {
                        this.cupondClientes = responseData.data;
                        this.filteredCuponClientes = [...this.cupondClientes];
                    } else {
                        this.cupondClientes = [];
                        this.filteredCuponClientes = [];
                    }
    
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
          case 'R': return 'Utilizado';
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
        const nuevoEstado = cupon.estado === 'A' ? 'B' : 'A';
        
        if (nuevoEstado === 'B') {
            this.confirmMessage = `¿Está seguro que desea cambiar el estado del cupón "${cupon.codigo}"?`;
            this.confirmHeader = 'Confirmar desactivación';
            this.accionConfirmada = () => this.procesarCambioEstado(cupon, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            this.procesarCambioEstado(cupon, nuevoEstado);
        }
    }

    private procesarCambioEstado(cupon: CuponItem, nuevoEstado: 'A' | 'B'): void {
        const estadoAnterior = cupon.estado;
        
        cupon.estado = nuevoEstado;
        
        const body = {
            id_cupon: cupon.id_cupon,
            estado: nuevoEstado
        };
        console.log('Bodyy: ',body);
        
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
            estado: estadoActual === 'A' ? 'B' : 'A'
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

    formatDate(fecha: string | Date | null): string {
        if (!fecha) {
          return '';
        }
      
        const date = new Date(fecha);
      
        if (isNaN(date.getTime())) {
          return '';
        }
      
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
      
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
        this.confirmMessage = '';
        this.confirmHeader = '';
        this.accionConfirmada = null;
    }
      

}
