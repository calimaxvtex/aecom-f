// Test simple para verificar interceptores
console.log('🧪 Test simple de interceptores');

// Verificar configuración del monitor
const config = localStorage.getItem('monitorConfig');
console.log('🔍 Configuración del monitor:', config);

// Hacer una llamada simple con fetch
fetch('http://localhost:3000/api/admcoll/v1', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'TP' })
})
.then(response => response.json())
.then(data => {
    console.log('✅ Respuesta fetch:', data);
})
.catch(error => {
    console.log('❌ Error fetch:', error);
});

// También probar con XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open('GET', 'http://localhost:3000/api/admcoll/v1');
xhr.onload = function() {
    console.log('✅ Respuesta XHR:', xhr.responseText.substring(0, 100));
};
xhr.send();

console.log('🚀 Tests enviados');
