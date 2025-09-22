import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-no-menu-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  template: `
    <div class="flex flex-col items-center gap-4 p-6">
      <!-- Icono de error -->
      <div class="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
        <i class="pi pi-exclamation-triangle text-3xl text-red-600"></i>
      </div>

      <!-- Mensaje -->
      <div class="text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Menú no disponible
        </h3>
        <p class="text-gray-600">
          {{ config.data?.message || 'No se pudo cargar el menú de navegación.' }}
        </p>
      </div>

      <!-- Botones -->
      <div class="flex gap-3 mt-4">
        <p-button
          label="Reintentar"
          icon="pi pi-refresh"
          severity="primary"
          (onClick)="retry()"
          [loading]="retrying"
        ></p-button>

        <p-button
          label="Contactar soporte"
          icon="pi pi-envelope"
          severity="secondary"
          variant="outlined"
          (onClick)="contactSupport()"
        ></p-button>
      </div>

      <!-- Información adicional -->
      <div class="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg w-full">
        <p><strong>Solución sugerida:</strong></p>
        <ul class="list-disc list-inside mt-1">
          <li>Verifique su conexión a internet</li>
          <li>Contacte al administrador del sistema</li>
          <li>Intente recargar la página</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-dialog .p-dialog-content {
      padding: 0;
    }

    :host ::ng-deep .p-dialog .p-dialog-header {
      padding: 1.5rem 1.5rem 0 1.5rem;
    }

    :host ::ng-deep .p-dialog .p-dialog-footer {
      padding: 0 1.5rem 1.5rem 1.5rem;
    }
  `]
})
export class NoMenuDialogComponent {
  private dialogRef = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  retrying = false;

  /**
   * Reintenta cargar el menú
   */
  async retry(): Promise<void> {
    this.retrying = true;

    try {
      // Forzar recarga de página para reinicializar la aplicación
      window.location.reload();
    } catch (error) {
      console.error('Error al reintentar:', error);
      this.retrying = false;
    }
  }

  /**
   * Contacta al soporte (abre email o página de soporte)
   */
  contactSupport(): void {
    // Intentar abrir email
    const email = 'soporte@empresa.com'; // TODO: Configurar email de soporte
    const subject = 'Error de carga de menú - Sistema';
    const body = 'Hola,\n\nEstoy experimentando problemas para cargar el menú de navegación.\n\nDetalles del error:\n- No se pudo cargar el menú dinámico\n- Sistema operativo: ' + navigator.platform + '\n- Navegador: ' + navigator.userAgent + '\n\nGracias.';

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Intentar abrir cliente de email
    const emailWindow = window.open(mailtoLink, '_blank');

    // Si no se pudo abrir, mostrar mensaje
    if (!emailWindow) {
      alert('Por favor, contacte al soporte técnico al email: ' + email);
    }

    // Cerrar dialog
    this.dialogRef.close();
  }
}
