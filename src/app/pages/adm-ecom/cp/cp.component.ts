import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';

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
import { MessageService, SelectItem } from 'primeng/api';

// Modelos y servicios
import { CpService } from '@/features/cp/services/cp.service';
import { Cp, CpResponseInfo } from '@/features/cp/models';

@Component({
    selector: 'app-cp',
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
    templateUrl: './cp.component.html',
    styleUrls: ['./cp.component.scss']
})
export class CpComponent implements OnInit {
    @ViewChild('dtCp') dtCp!: Table;
    // Datos principales
    cp: Cp[] = [];
    cpf: Cp[] = [];
    CoberturaSeleccionado: Cp | null = null;
    sucursales: any[] = [];
    municipios: any[] = [];
    colonias: any[] = [];
    
    // Filtros
    estadoFiltro: string = 'A';
    estadoFiltroSeleccionado: string = 'A';
    estadoOptions: { label: string; value: string }[] = [
        { label: 'Activos', value: 'A' },
        { label: 'Inactivos', value: 'R' },
        { label: 'Todos', value: '' }
    ];
    
    // Estados de carga
    loadingCobertura = false;
    savingCobertura = false;
    
    // Estados de modales
    showCoberturaModal = false;
    
    // Estados del formulario
    CoberturaForm!: FormGroup;
    isEditingCobertura = false;
    
    // Edición inline
    editingCell: string | null = null;
    originalValue: any = null;
    hasChanges = false;
    
    // Estados de confirmación
    showConfirmDialog = false;
    confirmMessage = '';
    confirmHeader = '';
    accionConfirmada: (() => void) | null = null;
    
    @HostListener('document:keydown.escape', ['$event'])
    onGlobalEscape(event: KeyboardEvent): void {
        if (this.editingCell) {
            event.preventDefault();
            this.cancelInlineEdit();
        }
    }
    
    onEscapeInline(): void {
        this.cancelInlineEdit();
    }
    
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.editingCell) return;
        
        if (this.isClickInsideInline(event.target as HTMLElement)) return;
        
        this.cancelInlineEdit();
    }
    
    private isClickInsideInline(target: HTMLElement): boolean {
        return [
            '.inline-edit-container',
            '.p-dropdown-panel',
            '.inline-action-btn'
        ].some(selector => target.closest(selector));
    }
    
    constructor(
        private fb: FormBuilder,
        private cpService: CpService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {
        this.initializeForms();
    }
    
    ngOnInit(): void {
        this.loadCps();
    }
    
    ngOnDestroy() {
        this.removeModalClickListener();
    }
    // Event listener para cerrar modal al hacer clic fuera
    private modalClickListener: ((event: Event) => void) | null = null;
    private modalElement: HTMLElement | null = null;
    
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
                if (!this.showCoberturaModal || !this.modalElement) return;
                
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
        // Remover listener inmediatamente
        this.removeModalClickListener();
        // Cerrar modal
        this.closeCoberturaForm();
        // Resetear referencia
        this.modalElement = null;
    }
    
    private removeModalClickListener(): void {
        if (this.modalClickListener) {
            document.removeEventListener('click', this.modalClickListener);
            this.modalClickListener = null;
        }
    }
    private toTitleCaseEs(value: string | null | undefined): string {
        if (!value) return '';
        
        const lowerWords = [
            'de', 'del', 'la', 'las', 'el', 'los',
            'y', 'o', 'en', 'al'
        ];
        
        return value
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
            if (/^[ivxlcdm]+$/i.test(word)) {
                return word.toUpperCase();
            }
            
            if (index !== 0 && lowerWords.includes(word)) {
                return word;
            }
            
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
    }
    
    loadCps() {
        this.loadingCobertura = true;
        this.cpService.getAllRecords().subscribe({
            next: (response) => {
                if (response?.data && Array.isArray(response.data)) {
                    
                    this.cp = response.data.map(cp => ({
                        ...cp,
                        colonia: this.toTitleCaseEs(cp.colonia),
                        tienda: this.toTitleCaseEs(cp.tienda),
                        d_ciudad: this.toTitleCaseEs(cp.d_ciudad)
                    }));
                    // Aplicar filtro de estado en el frontend
                    this.filterCpByState();
                    // Mensaje de carga exitosa
                    const stateText = this.estadoFiltro === 'A' ? 'activos' : this.estadoFiltro === 'R' ? 'inactivos' : 'todos';
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Datos Cargados',
                        detail: `${this.cp.length} coberturas totales, mostrando ${this.cpf.length} ${stateText}.`,
                        life: 3000
                    });
                    
                } else {
                    console.warn('Respuesta sin datos válidos:', response);
                    this.cp = [];
                    this.cpf = [];
                }
                this.loadingCobertura = false;
            },
            error: (error: any) => {
                console.error('Error al cargar registros:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los registros de coberturas ',
                    life: 5000
                });
                this.cp = [];
                this.loadingCobertura = false;
            }
        });
    }
    
    // ========== MÉTODOS DE INICIALIZACIÓN ==========
    
    initializeForms(): void {
        this.CoberturaForm = this.fb.group({
            id: [null],
            sucursal: [Number, [Validators.required]],
            codigo_postal: [Number, [Validators.required]],
            colonia: [String, [Validators.required]],
            municipio: [Number, [Validators.required]],
            estado: ['A', [Validators.required]]
        });
    }
    
    // ========== MÉTODOS DE UI ==========
    
    onGlobalFilter(dt: any, event: Event): void {
        const target = event.target as HTMLInputElement;
        dt.filterGlobal(target.value, 'contains');
    }
    
    filterCpByState(): void {
        if (this.estadoFiltro === '') {
            // Mostrar todas las sucursales
            this.cpf = [...this.cp];
        } else {
            // Filtrar por estado específico
            this.cpf = this.cp.filter(cp =>
                cp.estado === this.estadoFiltro
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
        if (this.cp.length > 0) {
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
            if (this.CoberturaSeleccionado) {
                this.loadCps();
            }
        }
    }
    
    onEstadoChange(event: any): void {
        const nuevoEstado = event?.value;
        
        if (nuevoEstado !== undefined && nuevoEstado !== null) {
            // Verificar si realmente cambió o si es el mismo (para mensaje diferente)
            const estadoCambio = nuevoEstado !== this.estadoFiltro;
            // Actualizar el filtro de estado
            this.estadoFiltro = nuevoEstado;
            const stateText = this.estadoFiltro === 'A' ? 'Activos' : this.estadoFiltro === 'R' ? 'Inactivos' : 'Todos';
            // Filtrar los datos en el frontend (no llamar API)
            if (this.cp.length > 0) {
                // Forzar detección de cambios antes de filtrar
                this.cdr.detectChanges();
                this.filterCpByState();
                const mensaje = estadoCambio
                ? `Filtro cambiado a: ${stateText}`
                : `Refrescando filtro: ${stateText}`;
                
                this.messageService.add({
                    severity: 'success',
                    summary: estadoCambio ? 'Filtro Aplicado' : 'Filtro Refrescado',
                    detail: `${this.sucursales.length} sucursales ${stateText.toLowerCase()}`,
                    life: 1500
                });
            } else {
                if (this.CoberturaSeleccionado) {
                    this.loadCps();
                }
            }
        } else {
            console.warn('Estado no válido recibido:', nuevoEstado);
        }
    }
    
    // ========== FORMULARIO ==========
    
    openCpForm(cp?: Cp): void {
        this.isEditingCobertura = !!cp;
        
        if (cp) {
            this.CoberturaSeleccionado = cp;
            
            this.CoberturaForm.patchValue({
                id: cp.id,
                codigo_postal: cp.codigo_postal,
                estado: cp.estado
            });
            
            this.CoberturaForm.get('codigo_postal')?.disable();
            
            this.onCpChange(true);
        } else {
            this.CoberturaSeleccionado = null;
            this.CoberturaForm.reset({
                id: null,
                sucursal: null,
                codigo_postal: '',
                colonia: '',
                municipio: null,
                estado: 'A'
            });
            this.CoberturaForm.get('codigo_postal')?.enable();
            this.sucursales = [];
            this.municipios = [];
            this.colonias = [];
        }
        
        this.showCoberturaModal = true;
        this.addModalClickListener();
    }
    
    // ========== EDICIÓN INLINE ==========
    
    loadDataByCp(cp: string, onFinish?: () => void): void {
        this.cpService.consultByCp(cp).subscribe({
            next: resp => {
                const dataCp = resp.data.data_cp;
                
                this.sucursales = dataCp.sucursales.map(s => ({
                    label: this.toTitleCaseEs(s.suc),
                    value: s.v_suc
                }));
                
                this.municipios = dataCp.municipios.map(m => ({
                    label: this.toTitleCaseEs(m.d_ciudad),
                    value: m.c_mnpio
                }));
                
                this.colonias = dataCp.colonias.map(c => ({
                    label: this.toTitleCaseEs(c.colonia),
                    value: c.colonia
                }));
                
                onFinish?.();
            },
            error: () => {
                onFinish?.();
            }
        });
    }
    
    private addOptionIfMissing(options: SelectItem[], value: any, label: string): void {
        const exists = options.some(
            o => this.normalizeText(o.value) === this.normalizeText(value)
        );
        
        if (!exists) {
            options.unshift({
                label: this.toTitleCaseEs(label),
                value
            });
        }
    }
    
    private fillIfNotExist(cp: Cp, field: keyof Cp): void {
        switch (field) {
            case 'sucursal':
            this.addOptionIfMissing
            (
                this.sucursales,
                cp.sucursal,
                cp.tienda
            );
            break;
            
            case 'municipio':
            this.addOptionIfMissing
            (
                this.municipios,
                cp.municipio,
                cp.d_ciudad
            );
            break;
            
            case 'colonia':
            this.addOptionIfMissing
            (
                this.colonias,
                cp.colonia,
                cp.colonia
            );
            break;
            
        }
    }
    
    private syncValueWithOptions(
        options: SelectItem[],
        currentValue: string
    ): string {
        
        const match = options.find(o =>
            this.normalizeText(o.value) === this.normalizeText(currentValue)
        );
        
        return match ? match.value : currentValue;
    }
    
    editInline(cp: Cp, field: keyof Cp): void {
        this.originalValue = cp[field];
        this.hasChanges = false;
        
        if (
            (field === 'sucursal' || field === 'municipio' || field === 'colonia')
            && cp.codigo_postal
        ) {
            this.loadDataByCp(cp.codigo_postal, () => {
                
                const options =
                field === 'sucursal' ? this.sucursales :
                field === 'municipio' ? this.municipios :
                this.colonias;
                
                (cp as Record<string, any>)[field] =
                this.syncValueWithOptions(options, String(cp[field]));
                
                this.fillIfNotExist(cp, field);
                
                this.editingCell = `${cp.id}-${field}`;
            });
        } else {
            this.editingCell = `${cp.id}-${field}`;
        }
    }
    
    onInlineChange(cp: Cp, field: keyof Cp): void {
        this.hasChanges = cp[field] !== this.originalValue;
    }
    
    private syncVisualField(cp: Cp, field: keyof Cp): void {
        
        if (field === 'sucursal') {
            const s = this.sucursales.find(
                x => Number(x.value) === Number(cp.sucursal)
            );
            if (s) cp.tienda = s.label;
        }
        
        if (field === 'municipio') {
            const m = this.municipios.find(
                x => Number(x.value) === Number(cp.municipio)
            );
            if (m) cp.d_ciudad = m.label;
        }
        
        if (field === 'colonia') {
            const c = this.colonias.find(
                x =>
                    this.normalizeText(x.value) ===
                this.normalizeText(cp.colonia)
            );
            
            if (c) {
                cp.colonia = c.label;
            }
        }
    }
    
    saveInline(cp: Cp, field: keyof Cp): void {
        if (!this.hasChanges) {
            this.cancelInlineEdit();
            return;
        }
        
        const payload = {
            id: cp.id,
            sucursal: cp.sucursal,
            codigo_postal: cp.codigo_postal,
            colonia: cp.colonia,
            municipio: cp.municipio,
            estado: cp.estado
        };
        
        
        this.cpService.updateRecord(payload).subscribe({
            next: () => {
                this.syncVisualField(cp, field);
                
                this.cpf = [...this.cpf];
                
                this.editingCell = null;
                
                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: 'Campo actualizado correctamente',
                });
            },            
            error: (error) => {
                (cp as any)[field] = this.originalValue;
                
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail:  error?.message ||`No se pudo actualizar el campo`
                });
                
                this.cancelInlineEdit();
            }
        });
    } 
    
    cancelInlineEdit(): void {
        if (this.editingCell && this.originalValue !== null) {
            const [id, field] = this.editingCell.split('-');
            const cp = this.cpf.find(c => c.id === Number(id));
            
            if (cp) {
                (cp as any)[field] = this.originalValue;
            }
        }
        this.editingCell = null;
        this.originalValue = null;
        this.hasChanges = false;
    }
    
    // ========== TOGGLE ESTADO ==========
    
    toggleEstado(cp: Cp): void {
        const nuevoEstado = cp.estado === 'A' ? 'R' : 'A';
        
        if (nuevoEstado === 'R') {
            this.confirmMessage = `¿Está seguro que desea cambiar el estado del registro con id "${cp.id}"?`;
            this.confirmHeader = 'Confirmar desactivación';
            this.accionConfirmada = () => this.procesarCambioEstado(cp, nuevoEstado);
            this.showConfirmDialog = true;
        } else {
            this.procesarCambioEstado(cp, nuevoEstado);
        }
    }
    
    private procesarCambioEstado(cp: Cp, nuevoEstado: 'A' | 'R'): void {
        const estadoAnterior = cp.estado;
        
        cp.estado = nuevoEstado;
        
        const body = {
            id: cp.id,
            estado: nuevoEstado
        };
        
        this.cpService.updateRecord(body).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `Estado ${nuevoEstado === 'A' ? 'activado' : 'desactivado'} correctamente`
                });
            },
            error: (error) => {
                cp.estado = estadoAnterior;
                
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
    
    
    // ========== ELIMINACIÓN ==========
    
    eliminarCobertura(cp: Cp): void {
        this.confirmMessage = `¿Está seguro de que desea eliminar el registro con id "${cp.id}"?`;
        this.confirmHeader = 'Confirmar eliminación';
        this.accionConfirmada = () => this.procesarEliminacionCobertura(cp);
        this.showConfirmDialog = true;
    }
    
    private procesarEliminacionCobertura(cp: Cp): void {
        this.cpService.deleteRecord(cp.id).subscribe({
            next: (response: any) => {
                console.log('Registro eliminado:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Cobertura eliminada correctamente'
                });
                this.loadCps();
            },
            error: (error: any) => {
                console.error(' Error al eliminar el registro:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar la cobertural',
                    life: 5000
                });
            }
        });
    }
    
    closeCoberturaForm(): void {
        this.showCoberturaModal = false;
        this.CoberturaForm.reset();
        this.CoberturaSeleccionado = null;
        this.isEditingCobertura = false;
        
        // Limpiar event listener y referencias del modal
        this.removeModalClickListener();
        this.modalElement = null;
    }
    
    saveCobertura(): void {
        if (this.CoberturaForm.invalid) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario inválido',
                detail: 'Por favor complete todos los campos requeridos',
                life: 3000
            });
            return;
        }
        
        this.savingCobertura = true;
        
        const formValue = this.CoberturaForm.getRawValue();
        
        if (this.isEditingCobertura && this.CoberturaSeleccionado) {
            // Actualizar cobertura existente
            const updateData = {
                id: this.CoberturaSeleccionado.id,
                sucursal: formValue.sucursal,
                codigo_postal: formValue.codigo_postal,
                colonia: formValue.colonia,
                municipio: formValue.municipio,
                estado: formValue.estado
            };
            
            this.cpService.updateRecord(updateData).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Cobertura actualizada correctamente'
                    });
                    this.closeCoberturaForm();
                    this.loadCps();
                    this.savingCobertura = false;
                },
                error: (error) => {
                    console.error('Error al actualizar cobertura:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error?.message || 'Error al actualizar la cobertura',
                        life: 5000
                    });
                    this.savingCobertura = false;
                }
            });
        } else {
            // Crear nueva cobertura
            const createData = {
                sucursal: formValue.sucursal,
                codigo_postal: formValue.codigo_postal,
                colonia: formValue.colonia,
                municipio: formValue.municipio,
                estado: formValue.estado
            };
            
            this.cpService.createRecord(createData).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Cobertura creada correctamente'
                    });
                    this.closeCoberturaForm();
                    this.loadCps();
                    this.savingCobertura = false;
                },
                error: (error) => {
                    console.error('Error al crear cobertura:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error?.message || 'Error al crear la cobertura',
                        life: 5000
                    });
                    this.savingCobertura = false;
                }
            });
        }
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
    
    toggleState() {
        const estadoActual = this.CoberturaForm.get('estado')?.value;
        this.CoberturaForm.patchValue({
            estado: estadoActual === 'A' ? 'R' : 'A'
        });
        this.CoberturaForm.markAsDirty();
    }
    resetCpData(): void {
        this.sucursales = [];
        this.municipios = [];
        this.colonias = [];
        
        this.CoberturaForm.patchValue({
            sucursal: null,
            municipio: null,
            colonia: null
        });
    }
    
    private normalizeText(value: any): string {
        return String(value ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }
    
    onCpChange(fromEdit: boolean = false): void {
        const cp = this.CoberturaForm.get('codigo_postal')?.value?.toString();
        
        if (!cp || cp.length !== 5) {
            this.resetCpData();
            return;
        }
        
        this.cpService.consultByCp(cp).subscribe({
            next: (resp: CpResponseInfo) => {
                
                if (resp.statuscode !== 200 || resp.data.existe !== 1) {
                    this.resetCpData();
                    return;
                }
                
                const dataCp = resp.data.data_cp;
                this.sucursales = dataCp.sucursales.map(s => ({
                    label: this.toTitleCaseEs(s.suc),
                    value: s.v_suc
                }));
                
                this.municipios = dataCp.municipios.map(m => ({
                    label: this.toTitleCaseEs(m.d_ciudad),
                    value: m.c_mnpio
                }));
                
                
                this.colonias = dataCp.colonias
                .filter(c => !!c.colonia)
                .map(c => ({
                    label: this.toTitleCaseEs(c.colonia),
                    value: c.colonia
                }));
                
                
                if (this.isEditingCobertura && this.CoberturaSeleccionado) {
                    const idSucursal = Number(this.CoberturaSeleccionado.sucursal);
                    
                    const existe = this.sucursales.some(
                        s => Number(s.value) === idSucursal
                    );
                    
                    if (!existe) {
                        this.sucursales.unshift({
                            label: this.CoberturaSeleccionado.tienda,
                            value: idSucursal
                        });
                    }
                    
                    if (!this.CoberturaSeleccionado) {
                        return;
                    }
                    
                    const coloniaBd = this.CoberturaSeleccionado.colonia;
                    
                    const coloniaMatch = this.colonias.find(c =>
                        this.normalizeText(c.value) === this.normalizeText(coloniaBd)
                    );
                    
                    this.CoberturaForm.patchValue({
                        sucursal: idSucursal,
                        municipio: Number(this.CoberturaSeleccionado.municipio),
                        colonia: coloniaMatch?.value ?? null
                    });
                }
                else {
                    this.CoberturaForm.patchValue({
                        sucursal: this.sucursales[0]?.value ?? null,
                        municipio: this.municipios[0]?.value ?? null,
                        colonia: this.colonias[0]?.value ?? null
                    });
                }
                
                if (fromEdit) {
                    this.CoberturaForm.markAsPristine();
                }
            },
            error: () => this.resetCpData()
        });
    }
    
}