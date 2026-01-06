import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
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

    cp: Cp[] = [];
    CoberturaSeleccionado: Cp | null = null;

    sucursales: any[] = [];
    municipios: any[] = [];
    colonias: any[] = [];

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
    ) {
        this.initializeForms();
    }

    ngOnInit(): void {
        this.loadCps();
        /*this.CoberturaForm.get('estado')?.valueChanges.subscribe(valor => {
            console.log('Estado cambiado a:', valor);
        });*/
    }

    loadCps() {
        this.loadingCobertura = true;
        this.cpService.getAllRecords().subscribe({
            next: (response) => {
                if (response?.data && Array.isArray(response.data)) {

                    this.cp = [...response.data];
                    /*console.log('Datos cargados:', this.cp.length, 'cps'); setTimeout(() => {
                        if (this.dtCp) {
                            this.dtCp.reset();
                        }
                    }, 0);*/
                } else {
                    console.warn('Respuesta sin datos válidos:', response);
                    this.cp = [];
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
    }

    // ========== EDICIÓN INLINE ==========

    loadDataByCp(cp: string, onFinish?: () => void): void {
        this.cpService.consultByCp(cp).subscribe({
            next: resp => {
                const dataCp = resp.data.data_cp;

                this.sucursales = dataCp.sucursales.map(s => ({
                    label: s.suc.toUpperCase(),
                    value: s.v_suc
                }));

                this.municipios = dataCp.municipios.map(m => ({
                    label: m.d_ciudad.toUpperCase(),
                    value: m.c_mnpio
                }));

                this.colonias = dataCp.colonias.map(c => ({
                    label: c.colonia.toUpperCase(),
                    value: c.colonia
                }));

                onFinish?.();
            },
            error: () => {
                onFinish?.();
            }
        });
    }
    private addOptionIfMissing
        (options: SelectItem[], value: any, label: string): void {
        const exists = options.some(o => o.value === value);
        if (!exists) {
            options.unshift({ label, value });
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

    editInline(cp: Cp, field: keyof Cp): void {
        this.originalValue = cp[field];
        this.hasChanges = false;

        if (
            (field === 'sucursal' || field === 'municipio' || field === 'colonia')
            && cp.codigo_postal
        ) {
            this.loadDataByCp(cp.codigo_postal, () => {
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
            const s = this.sucursales.find(x => Number(x.value) === Number(cp.sucursal));
            if (s) cp.tienda = s.label;
        }

        if (field === 'municipio') {
            const m = this.municipios.find(x => Number(x.value) === Number(cp.municipio));
            if (m) cp.d_ciudad = m.label;
        }
    }


    saveInline(cp: Cp, field: keyof Cp): void {
        if (!this.hasChanges) {
            this.cancelInlineEdit();
            return;
        }

        const payload = {
            id: cp.id,
            [field]: cp[field]
        };

        this.cpService.updateRecord(payload).subscribe({
            next: () => {

                this.syncVisualField(cp, field);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Actualizado',
                    detail: `Campo "${field}" actualizado correctamente`
                });

                this.cancelInlineEdit();
            },
            error: () => {
                (cp as Record<string, any>)[field] = this.originalValue;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se pudo actualizar el campo "${field}"`
                });

                this.cancelInlineEdit();
            }
        });
    }

    cancelInlineEdit(): void {
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

    private normalizeText(value: string | null | undefined): string {
        if (!value) return '';
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toUpperCase();
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
                    label: s.suc,
                    value: s.v_suc
                }));

                this.municipios = dataCp.municipios.map(m => ({
                    label: m.d_ciudad.toUpperCase(),
                    value: m.c_mnpio
                }));


                this.colonias = dataCp.colonias
                    .filter(c => !!c.colonia)
                    .map(c => ({
                        label: c.colonia.toUpperCase(),
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