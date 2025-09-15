/**
 * 🚨 VALIDADOR DE MANEJO DE ERRORES
 *
 * Script para validar que los servicios y componentes implementan
 * correctamente el manejo de errores según las especificaciones.
 *
 * USO:
 * node validate-error-handling.js [ruta-al-archivo]
 *
 * EJEMPLO:
 * node validate-error-handling.js src/app/features/catconceptos/services/catconceptos.service.ts
 */

const fs = require('fs');
const path = require('path');

class ErrorHandlingValidator {

    constructor() {
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
    }

    validateFile(filePath) {
        console.log(`🔍 Validando: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            console.error(`❌ Archivo no encontrado: ${filePath}`);
            return false;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const isService = filePath.includes('service');
        const isComponent = filePath.includes('component');

        if (isService) {
            return this.validateService(content, filePath);
        } else if (isComponent) {
            return this.validateComponent(content, filePath);
        } else {
            console.log(`⚠️ Tipo de archivo desconocido: ${filePath}`);
            return false;
        }
    }

    validateService(content, filePath) {
        let passed = true;

        // 1. Verificar que los map() verifican statuscode
        const hasStatusCodeCheck = content.includes('firstItem.statuscode !== 200') ||
                                  content.includes('firstItem.statuscode && firstItem.statuscode !== 200');

        if (!hasStatusCodeCheck) {
            this.results.failed.push(`${filePath}: ❌ No verifica statuscode en map()`);
            passed = false;
        } else {
            this.results.passed.push(`${filePath}: ✅ Verifica statuscode en map()`);
        }

        // 2. Verificar que catchError preserva mensajes
        const hasErrorInstanceof = content.includes('error instanceof Error ? error.message');
        const hasGenericReplacement = content.includes("new Error('Error");

        if (!hasErrorInstanceof) {
            this.results.failed.push(`${filePath}: ❌ catchError no preserva mensajes (falta instanceof check)`);
            passed = false;
        } else {
            this.results.passed.push(`${filePath}: ✅ catchError preserva mensajes`);
        }

        if (hasGenericReplacement) {
            this.results.warnings.push(`${filePath}: ⚠️ Posible reemplazo de mensajes específicos con genéricos`);
        }

        // 3. Verificar logs de envío de error
        const hasErrorLog = content.includes('Enviando error al componente');
        if (!hasErrorLog) {
            this.results.warnings.push(`${filePath}: ⚠️ No hay logs de envío de errores al componente`);
        } else {
            this.results.passed.push(`${filePath}: ✅ Tiene logs de envío de errores`);
        }

        return passed;
    }

    validateComponent(content, filePath) {
        let passed = true;

        // 1. Verificar que los error handlers usan error.message
        const hasErrorMessage = content.includes('error.message') &&
                               content.includes('error instanceof Error');

        if (!hasErrorMessage) {
            this.results.failed.push(`${filePath}: ❌ Error handlers no usan mensajes específicos`);
            passed = false;
        } else {
            this.results.passed.push(`${filePath}: ✅ Error handlers usan mensajes específicos`);
        }

        // 2. Verificar que no hay mensajes hardcodeados
        const hardcodedErrors = content.match(/detail: 'Error[^']*'/g);
        if (hardcodedErrors && hardcodedErrors.length > 0) {
            this.results.warnings.push(`${filePath}: ⚠️ Posibles mensajes hardcodeados: ${hardcodedErrors.join(', ')}`);
        }

        // 3. Verificar que los toasts tienen duración apropiada
        const hasLife5000 = content.includes('life: 5000');
        if (!hasLife5000) {
            this.results.warnings.push(`${filePath}: ⚠️ Los toasts de error deberían tener life: 5000`);
        }

        return passed;
    }

    printResults() {
        console.log('\n📊 RESULTADOS DE VALIDACIÓN:');
        console.log('='.repeat(50));

        if (this.results.passed.length > 0) {
            console.log('\n✅ PASÓ:');
            this.results.passed.forEach(result => console.log(`   ${result}`));
        }

        if (this.results.warnings.length > 0) {
            console.log('\n⚠️ ADVERTENCIAS:');
            this.results.warnings.forEach(result => console.log(`   ${result}`));
        }

        if (this.results.failed.length > 0) {
            console.log('\n❌ FALLÓ:');
            this.results.failed.forEach(result => console.log(`   ${result}`));
        }

        const totalTests = this.results.passed.length + this.results.failed.length;
        const passedPercent = totalTests > 0 ? Math.round((this.results.passed.length / totalTests) * 100) : 0;

        console.log(`\n📈 RESUMEN: ${this.results.passed.length}/${totalTests} pruebas pasaron (${passedPercent}%)`);

        if (this.results.failed.length === 0) {
            console.log('🎉 ¡FELICITACIONES! El manejo de errores está correctamente implementado.');
        } else {
            console.log('⚠️ Hay problemas que corregir. Revisa las especificaciones en ERROR_HANDLING_GUIDE.md');
        }
    }

    validateDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            console.error(`❌ Directorio no encontrado: ${dirPath}`);
            return;
        }

        const files = this.getFilesRecursively(dirPath);
        const relevantFiles = files.filter(file =>
            file.endsWith('.ts') &&
            (file.includes('service') || file.includes('component'))
        );

        console.log(`🔍 Validando ${relevantFiles.length} archivos en: ${dirPath}`);

        relevantFiles.forEach(file => {
            this.validateFile(file);
        });

        this.printResults();
    }

    getFilesRecursively(dirPath) {
        const files = [];

        function traverse(currentPath) {
            const items = fs.readdirSync(currentPath);

            items.forEach(item => {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    traverse(fullPath);
                } else if (stat.isFile()) {
                    files.push(fullPath);
                }
            });
        }

        traverse(dirPath);
        return files;
    }
}

// Función principal
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Uso: node validate-error-handling.js [ruta-al-archivo-o-directorio]');
        console.log('Ejemplos:');
        console.log('  node validate-error-handling.js src/app/features/catconceptos/');
        console.log('  node validate-error-handling.js src/app/features/catconceptos/services/catconceptos.service.ts');
        return;
    }

    const validator = new ErrorHandlingValidator();
    const targetPath = args[0];

    if (fs.statSync(targetPath).isDirectory()) {
        validator.validateDirectory(targetPath);
    } else {
        validator.validateFile(targetPath);
        validator.printResults();
    }
}

if (require.main === module) {
    main();
}

module.exports = ErrorHandlingValidator;
