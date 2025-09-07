// Script para probar el interceptor desde el navegador
// Copia y pega este código en la consola del navegador en http://localhost:4200/test-coll

console.log('🧪 Probando interceptor del monitor desde el navegador...');

// 1. Verificar configuración del monitor
const monitorConfig = localStorage.getItem('monitorConfig');
console.log('🔍 Configuración actual del monitor:', monitorConfig);

// 2. Escuchar eventos del interceptor
window.addEventListener('apiCallCaptured', (event) => {
    console.log('🎯 Evento del interceptor recibido:', event.detail);
    console.log('✅ ¡El interceptor está funcionando!');
});

// 3. Verificar si hay datos del monitor
const apiMonitor = localStorage.getItem('apiMonitor');
console.log('�� Datos actuales del monitor:', apiMonitor);

console.log('🧪 Script cargado. Ahora haz clic en algún botón de la página test-coll para generar llamadas HTTP.');
