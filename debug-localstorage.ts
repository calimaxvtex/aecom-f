// Script temporal para debuguear configuración del localStorage
console.log('🔍 Debug: Revisando localStorage...');

const config = localStorage.getItem('calimax-layout-config');
if (config) {
    console.log('✅ Configuración encontrada en localStorage:');
    console.log(JSON.parse(config));
} else {
    console.log('❌ No hay configuración guardada en localStorage');
}

// También revisar si hay otros valores relevantes
const allKeys = Object.keys(localStorage);
console.log('📋 Todas las keys en localStorage:', allKeys);
