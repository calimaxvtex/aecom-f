import { AbstractControl, ValidationErrors } from '@angular/forms';

export class MenuValidators {
    // Label obligatorio
    static requiredLabel(control: AbstractControl): ValidationErrors | null {
        if (!control.value || control.value.trim() === '') {
            return { requiredLabel: 'El label es obligatorio' };
        }
        return null;
    }

    // Icono obligatorio
    static requiredIcon(control: AbstractControl): ValidationErrors | null {
        if (!control.value || control.value.trim() === '') {
            return { requiredIcon: 'El icono es obligatorio' };
        }
        return null;
    }

    // RouterLink válido (si se proporciona)
    static validRouterLink(control: AbstractControl): ValidationErrors | null {
        if (control.value && control.value.trim() !== '') {
            // Debe empezar con /
            if (!control.value.startsWith('/')) {
                return { invalidRouterLink: 'La ruta debe empezar con /' };
            }
            // No debe tener espacios
            if (control.value.includes(' ')) {
                return { invalidRouterLink: 'La ruta no puede tener espacios' };
            }
        }
        return null;
    }

    // Orden válido (número positivo)
    static validOrder(control: AbstractControl): ValidationErrors | null {
        if (control.value !== null && control.value !== undefined) {
            if (isNaN(control.value) || control.value < 0) {
                return { invalidOrder: 'El orden debe ser un número positivo' };
            }
        }
        return null;
    }
}


