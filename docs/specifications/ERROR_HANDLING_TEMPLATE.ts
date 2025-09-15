/**
 * 🚨 TEMPLATE PARA MANEJO DE ERRORES - COPIAR Y PEGAR
 *
 * Este archivo contiene templates reutilizables para implementar
 * correctamente el manejo de errores en servicios y componentes.
 *
 * INSTRUCCIONES:
 * 1. Copiar el código correspondiente
 * 2. Adaptar nombres de variables según el contexto
 * 3. Seguir el checklist de verificación
 */

export class ErrorHandlingTemplates {

    // =================================================================
    // 🎯 SERVICIOS - MANEJO DE ERRORES
    // =================================================================

    /**
     * TEMPLATE: Verificación de errores del backend en map()
     * COPIAR ESTE BLOQUE en TODOS los map() de servicios
     */
    static readonly SERVICE_MAP_ERROR_CHECK = `
// ⚠️ CRÍTICO: Verificar errores del backend
if (Array.isArray(response) && response.length > 0) {
    const firstItem = response[0];
    if (firstItem.statuscode && firstItem.statuscode !== 200) {
        console.log('❌ Backend devolvió error en array:', firstItem);
        throw new Error(firstItem.mensaje || 'Error del servidor');
    }
    // Procesar respuesta exitosa...
    return {
        statuscode: firstItem.statuscode || 200,
        mensaje: firstItem.mensaje || 'Operación exitosa',
        data: firstItem.data
    };
}

// Verificar error en respuesta directa
if (response.statuscode && response.statuscode !== 200) {
    console.log('❌ Backend devolvió error directo:', response);
    throw new Error(response.mensaje || 'Error del servidor');
}

return {
    statuscode: response.statuscode || 200,
    mensaje: response.mensaje || 'Operación exitosa',
    data: response.data
};`;

    /**
     * TEMPLATE: catchError que preserva mensajes del backend
     * COPIAR ESTE BLOQUE en TODOS los catchError de servicios
     */
    static readonly SERVICE_CATCH_ERROR = `
catchError(error => {
    console.error('❌ Error en [NOMBRE_OPERACIÓN]:', error);

    // ⚠️ CRÍTICO: Preservar mensaje original del backend si ya existe
    const errorMessage = error instanceof Error ? error.message : 'Error en [NOMBRE_OPERACIÓN]';
    console.log('📤 Enviando error al componente:', errorMessage);

    return throwError(() => new Error(errorMessage));
})`;

    // =================================================================
    // 🎯 COMPONENTES - MANEJO DE ERRORES
    // =================================================================

    /**
     * TEMPLATE: Error handler completo para componentes
     * COPIAR ESTE BLOQUE en TODOS los subscribe() de operaciones
     */
    static readonly COMPONENT_SUBSCRIBE_ERROR = `
.subscribe({
    next: (response) => {
        console.log('✅ [NOMBRE_OPERACIÓN] exitosa:', response);

        this.messageService.add({
            severity: 'success',
            summary: '[TÍTULO ÉXITO]',
            detail: response.mensaje || '[MENSAJE ÉXITO DEFAULT]'
        });

        // Actualizar estado local si es necesario
        // this.cargarDatos();
    },
    error: (error) => {
        console.error('❌ Error en [NOMBRE_OPERACIÓN]:', error);

        // ⚠️ CRÍTICO: Usar mensaje específico del backend
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido en [NOMBRE_OPERACIÓN]';

        this.messageService.add({
            severity: 'error',
            summary: 'Error en [NOMBRE_OPERACIÓN]',
            detail: errorMessage,  // ← MENSAJE ESPECÍFICO DEL BACKEND
            life: 5000
        });

        // ⚠️ Revertir cambios locales si es necesario
        // this.revertirCambio();
    }
});`;

    /**
     * TEMPLATE: Solo el error handler (para subscribe existentes)
     */
    static readonly COMPONENT_ERROR_HANDLER_ONLY = `
error: (error) => {
    console.error('❌ Error en [NOMBRE_OPERACIÓN]:', error);

    // ⚠️ CRÍTICO: Usar mensaje específico del backend
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido en [NOMBRE_OPERACIÓN]';

    this.messageService.add({
        severity: 'error',
        summary: 'Error en [NOMBRE_OPERACIÓN]',
        detail: errorMessage,  // ← MENSAJE ESPECÍFICO DEL BACKEND
        life: 5000
    });

    // ⚠️ Revertir cambios locales si es necesario
    // this.revertirCambio();
}`;

    // =================================================================
    // 🎯 FUNCIONES HELPER - PARA REUTILIZACIÓN
    // =================================================================

    /**
     * HELPER: Función para extraer mensaje de error de forma segura
     */
    static extractErrorMessage(error: any, fallback: string = 'Error desconocido'): string {
        if (error instanceof Error) {
            return error.message;
        }
        if (error?.message) {
            return error.message;
        }
        if (error?.error?.message) {
            return error.error.message;
        }
        if (error?.error?.mensaje) {
            return error.error.mensaje;
        }
        return fallback;
    }

    /**
     * HELPER: Crear configuración de toast de error estándar
     */
    static createErrorToast(error: any, operationName: string) {
        return {
            severity: 'error' as const,
            summary: \`Error en \${operationName}\`,
            detail: this.extractErrorMessage(error, \`Error desconocido en \${operationName}\`),
            life: 5000
        };
    }

    /**
     * HELPER: Crear configuración de toast de éxito estándar
     */
    static createSuccessToast(message: string, summary: string = 'Operación exitosa') {
        return {
            severity: 'success' as const,
            summary,
            detail: message
        };
    }

    // =================================================================
    // 🎯 TESTING - PATRONES PARA PRUEBAS
    // =================================================================

    /**
     * TEMPLATE: Prueba de error del backend
     */
    static readonly TEST_BACKEND_ERROR = `
it('debe manejar errores del backend correctamente', (done) => {
    const errorResponse = [{ statuscode: 400, mensaje: 'Campo requerido', data: null }];

    // Mock del servicio HTTP
    httpMock.expectOne('test-url').flush(errorResponse);

    service.operation(payload).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (error) => {
            expect(error.message).toBe('Campo requerido');
            done();
        }
    });
});`;

    /**
     * TEMPLATE: Prueba de preservación de mensajes
     */
    static readonly TEST_MESSAGE_PRESERVATION = `
it('debe preservar mensajes específicos del backend', () => {
    spyOn(console, 'log'); // Para verificar logs

    // Simular error del backend
    const backendError = new Error('Validación fallida');

    // Verificar que el mensaje se preserva
    expect(backendError.message).toBe('Validación fallida');
});`;

}

// =================================================================
// 🎯 CHECKLIST DE IMPLEMENTACIÓN
// =================================================================

/*
✅ CHECKLIST PARA MANEJO DE ERRORES - MARCAR TODOS

SERVICIOS:
□ Todos los map() verifican: firstItem.statuscode !== 200
□ Todos los map() verifican: response.statuscode !== 200
□ Todos los catchError usan: error instanceof Error ? error.message : fallback
□ Todos los catchError incluyen: console.log('📤 Enviando error al componente:', errorMessage)
□ NO hay mensajes hardcodeados reemplazando mensajes del backend

COMPONENTES:
□ Todos los error handlers usan: error instanceof Error ? error.message : fallback
□ Todos los messageService.add usan: detail: errorMessage (no strings hardcodeados)
□ Se revierten cambios locales cuando es apropiado
□ Los toasts de error tienen life: 5000

TESTING:
□ Se probaron operaciones que generan errores del backend
□ Se verificaron que los mensajes específicos se muestran en toasts
□ Se revisaron logs para confirmar preservación de mensajes
□ Se probaron casos edge (errores de red, timeouts, etc.)
*/
