// Script para probar el interceptor del monitor
console.log('🧪 Probando interceptor del monitor...');

// 1. Verificar configuración del monitor
const monitorConfig = localStorage.getItem('monitorConfig');
console.log('🔍 Configuración actual del monitor:', monitorConfig);

// 2. Si no existe, crear configuración por defecto
if (!monitorConfig) {
    const defaultConfig = {
        enabled: true,
        maxRecords: 1000,
        autoCleanup: false,
        cleanupDays: 7
    };
    localStorage.setItem('monitorConfig', JSON.stringify(defaultConfig));
    console.log('✅ Configuración por defecto creada:', defaultConfig);
}

// 3. Verificar datos del monitor
const apiMonitor = localStorage.getItem('apiMonitor');
console.log('🔍 Datos del monitor:', apiMonitor);

// 4. Escuchar eventos del interceptor
window.addEventListener('apiCallCaptured', (event) => {
    console.log('🎯 Evento del interceptor recibido:', event.detail);
});

// 5. Hacer una llamada de prueba
console.log('🚀 Realizando llamada de prueba...');
fetch('http://localhost:3000/api/admcoll/v1', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'TP' })
})
.then(response => response.json())
.then(data => {
    console.log('✅ Respuesta de prueba:', data);
})
.catch(error => {
    console.log('❌ Error en prueba:', error);
});

console.log('🧪 Prueba completada. Revisa la consola del navegador.');
