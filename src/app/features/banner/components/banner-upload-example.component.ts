import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { ImageUploadService } from '../../../core/services/img/';
import { ImageUploadResponse, ImageFile } from '../models/image-upload.interface';

@Component({
    selector: 'app-banner-upload-example',
    standalone: true,
    imports: [
        CommonModule,
        FileUploadModule,
        ButtonModule,
        CardModule,
        ProgressBarModule,
        ToastModule
    ],
    template: `
        <p-toast></p-toast>

        <div class="grid">
            <div class="col-12">
                <p-card header="Carga de Imágenes de Banner">
                    <div class="p-fluid">
                        <!-- File Upload con PrimeNG -->
                        <p-fileUpload
                            #fileUpload
                            name="multi-files"
                            (onSelect)="onFileSelected($event)"
                            (onUpload)="onUploadComplete($event)"
                            [multiple]="true"
                            accept="image/jpeg,image/png,image/gif"
                            [maxFileSize]="5000000"
                            [customUpload]="true"
                            [showUploadButton]="false"
                            [showCancelButton]="true"
                            chooseLabel="Seleccionar Imágenes"
                            cancelLabel="Cancelar"
                            class="mb-4">

                            <ng-template pTemplate="content">
                                <div class="flex flex-column align-items-center">
                                    <i class="pi pi-upload text-4xl text-primary mb-3"></i>
                                    <span class="text-lg font-medium mb-2">Arrastra y suelta imágenes aquí</span>
                                    <span class="text-sm text-gray-600">o haz clic para seleccionar</span>
                                    <small class="mt-2 text-gray-500">
                                        JPG, PNG, GIF hasta 5MB cada uno
                                    </small>
                                </div>
                            </ng-template>
                        </p-fileUpload>

                        <!-- Botón de carga personalizado -->
                        <div class="flex justify-content-center gap-3">
                            <p-button
                                label="Subir Imágenes"
                                icon="pi pi-upload"
                                (onClick)="uploadSelectedFiles()"
                                [disabled]="!selectedFiles.length || isUploading"
                                [loading]="isUploading">
                            </p-button>

                            <p-button
                                label="Limpiar"
                                icon="pi pi-times"
                                severity="secondary"
                                (onClick)="clearFiles()"
                                [disabled]="isUploading">
                            </p-button>
                        </div>

                        <!-- Barra de progreso -->
                        <div *ngIf="isUploading" class="mt-4">
                            <p-progressBar
                                [value]="uploadProgress"
                                [showValue]="true"
                                [unit]="'%'"
                                styleClass="mb-2">
                            </p-progressBar>
                            <small class="text-center block text-gray-600">
                                Subiendo {{ selectedFiles.length }} archivo(s)...
                            </small>
                        </div>

                        <!-- Lista de archivos seleccionados -->
                        <div *ngIf="selectedFiles.length > 0" class="mt-4">
                            <h5>Archivos Seleccionados ({{ selectedFiles.length }})</h5>
                            <div class="grid">
                                <div *ngFor="let file of selectedFiles; let i = index"
                                     class="col-12 md:col-6 lg:col-4">
                                    <div class="file-item border-1 border-round p-3 mb-2">
                                        <div class="flex align-items-center gap-3">
                                            <i class="pi pi-image text-primary"></i>
                                            <div class="flex-1">
                                                <div class="font-medium text-sm">{{ file.name }}</div>
                                                <small class="text-gray-600">
                                                    {{ formatFileSize(file.size) }}
                                                </small>
                                            </div>
                                            <i class="pi pi-times text-red-500 cursor-pointer"
                                               (click)="removeFile(i)"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Resultados de carga -->
                        <div *ngIf="uploadedResults.length > 0" class="mt-4">
                            <h5>Imágenes Subidas Exitosamente</h5>
                            <div class="mb-3">
                                <p-chip
                                    [label]="uploadStatsMessage"
                                    [styleClass]="isCompleteSuccess ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                                </p-chip>
                            </div>
                            <div class="grid">
                                <div *ngFor="let result of uploadedResults"
                                     class="col-12 md:col-6 lg:col-4">
                                    <div class="result-item border-1 border-success border-round p-3 mb-2 bg-green-50">
                                        <div class="flex align-items-center gap-3">
                                            <i class="pi pi-check-circle text-green-600"></i>
                                            <div class="flex-1">
                                                <div class="font-medium text-sm">{{ result.name }}</div>
                                                <small class="text-green-700 break-all">{{ result.img }}</small>
                                                <div class="mt-2">
                                                    <p-chip
                                                        [label]="result.mensaje"
                                                        styleClass="bg-green-100 text-green-800 text-xs">
                                                    </p-chip>
                                                </div>
                                            </div>
                                            <p-button
                                                icon="pi pi-copy"
                                                size="small"
                                                severity="secondary"
                                                pTooltip="Copiar URL_IMG"
                                                (onClick)="copyToClipboard(result.img)">
                                            </p-button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- URLs_IMG para desarrollo -->
                            <div class="mt-4 p-3 bg-gray-50 border-round">
                                <h6 class="mb-2">URLs_IMG para usar en código:</h6>
                                <div class="flex flex-column gap-2">
                                    <div *ngFor="let urlImg of successfulUrlsImg; let i = index"
                                         class="flex align-items-center gap-2">
                                        <code class="flex-1 p-2 bg-white border-1 border-round text-sm break-all">
                                            {{ urlImg }}
                                        </code>
                                        <p-button
                                            icon="pi pi-copy"
                                            size="small"
                                            severity="secondary"
                                            pTooltip="Copiar URL_IMG"
                                            (onClick)="copyToClipboard(urlImg)">
                                        </p-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </p-card>
            </div>
        </div>
    `,
    styles: [`
        .file-item {
            background: var(--surface-section);
            transition: all 0.2s;
        }
        .file-item:hover {
            background: var(--surface-hover);
        }
        .result-item {
            border-color: var(--green-400) !important;
        }
    `]
})
export class BannerUploadExampleComponent {
    private imageUploadService = inject(ImageUploadService);
    private messageService = inject(MessageService);

    selectedFiles: File[] = [];
    uploadedResults: any[] = [];
    successfulUrlsImg: string[] = [];
    isUploading = false;
    uploadProgress = 0;
    uploadStatsMessage = '';
    isCompleteSuccess = false;

    onFileSelected(event: any) {
        const files = event.files as File[];

        // Validar archivos antes de agregarlos
        const validation = this.imageUploadService.validateFiles(files);

        if (!validation.isValid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de Validación',
                detail: validation.errors.join('. ')
            });
            return;
        }

        // Mostrar warnings si existen
        if (validation.warnings.length > 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencias',
                detail: validation.warnings.join('. ')
            });
        }

        // Agregar archivos válidos
        this.selectedFiles = [...this.selectedFiles, ...files];

        this.messageService.add({
            severity: 'info',
            summary: 'Archivos Seleccionados',
            detail: `${files.length} archivo(s) agregado(s)`
        });
    }

    uploadSelectedFiles() {
        if (this.selectedFiles.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Sin Archivos',
                detail: 'Selecciona al menos un archivo para subir'
            });
            return;
        }

        this.isUploading = true;
        this.uploadProgress = 0;

        this.imageUploadService.uploadBannerImages(this.selectedFiles)
            .subscribe({
                next: (response: ImageUploadResponse) => {
                    this.isUploading = false;
                    this.uploadProgress = 100;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Carga Exitosa',
                        detail: response.mensaje
                    });

                    // Procesar respuesta con el nuevo formato
                    this.uploadedResults = response.images || [];
                    this.successfulUrlsImg = this.imageUploadService.getSuccessfulUrlImgs(response);
                    this.isCompleteSuccess = this.imageUploadService.isUploadCompletelySuccessful(response);
                    this.uploadStatsMessage = this.imageUploadService.formatUploadStats(response);

                    console.log('📊 Estadísticas de carga:', this.imageUploadService.getUploadStats(response));
                    console.log('🔗 URLs_IMG exitosas:', this.successfulUrlsImg);

                    // Limpiar archivos subidos
                    this.selectedFiles = [];
                },
                error: (error) => {
                    this.isUploading = false;
                    this.uploadProgress = 0;

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error en Carga',
                        detail: error.message
                    });
                }
            });

        // Simular progreso (en producción usar eventos del servicio)
        this.simulateProgress();
    }

    private simulateProgress() {
        const interval = setInterval(() => {
            this.uploadProgress += 10;
            if (this.uploadProgress >= 90) {
                clearInterval(interval);
            }
        }, 200);
    }

    removeFile(index: number) {
        this.selectedFiles.splice(index, 1);
        this.messageService.add({
            severity: 'info',
            summary: 'Archivo Removido',
            detail: 'Archivo eliminado de la selección'
        });
    }

    clearFiles() {
        this.selectedFiles = [];
        this.uploadedResults = [];
        this.successfulUrlsImg = [];
        this.uploadStatsMessage = '';
        this.isCompleteSuccess = false;
        this.messageService.add({
            severity: 'info',
            summary: 'Archivos Limpiados',
            detail: 'Todos los archivos han sido removidos'
        });
    }

    copyToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Copiado',
                detail: 'URL_IMG copiada al portapapeles'
            });
        }).catch(err => {
            console.error('Error al copiar:', err);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo copiar la URL_IMG'
            });
        });
    }

    onUploadComplete(event: any) {
        console.log('Upload completado:', event);
    }

    formatFileSize(bytes: number): string {
        return this.imageUploadService.formatFileSize(bytes);
    }
}
