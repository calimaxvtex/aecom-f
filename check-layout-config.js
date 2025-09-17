// Script para verificar y actualizar la configuración del layout
console.log('🔍 Sistema de configuración de colores del layout');
console.log('================================================\n');

// Configuración por defecto actual del LayoutService
const currentDefaultConfig = {
    primary: 'indigo',
    surface: 'slate',
    darkTheme: false,
    menuMode: 'static',
    menuTheme: 'light',
    topbarTheme: 'indigo',
    menuProfilePosition: 'end'
};

console.log('📋 Configuración POR DEFECTO actual:');
console.log(JSON.stringify(currentDefaultConfig, null, 2));

console.log('\n🎨 OPCIONES DISPONIBLES:');

// Colores primarios disponibles
console.log('\n🔵 Colores Primarios (primary):');
const primaryColors = [
    'emerald', 'green', 'lime', 'orange', 'amber', 'yellow',
    'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
    'purple', 'fuchsia', 'pink', 'rose', 'noir'
];
primaryColors.forEach(color => console.log(`  - ${color}`));

// Superficies disponibles
console.log('\n🎯 Superficies (surface):');
const surfaces = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'soho', 'viva', 'ocean'];
surfaces.forEach(surface => console.log(`  - ${surface}`));

// Temas de menú disponibles
console.log('\n📱 Temas de Menú (menuTheme):');
const menuThemes = ['light', 'dark', 'indigo', 'bluegrey', 'brown', 'cyan', 'green', 'deeppurple', 'deeporange', 'pink', 'purple', 'teal'];
menuThemes.forEach(theme => console.log(`  - ${theme}`));

// Temas de topbar disponibles
console.log('\n📋 Temas de Topbar (topbarTheme):');
const topbarThemes = [
    'lightblue', 'dark', 'white', 'blue', 'deeppurple', 'purple', 'pink',
    'cyan', 'teal', 'green', 'lightgreen', 'lime', 'yellow', 'amber',
    'orange', 'deeporange', 'brown', 'grey', 'bluegrey', 'indigo'
];
topbarThemes.forEach(theme => console.log(`  - ${theme}`));

console.log('\n📝 INSTRUCCIONES PARA CAMBIAR LOS VALORES POR DEFECTO:');
console.log('1. Abre el archivo: src/app/layout/service/layout.service.ts');
console.log('2. Busca las líneas 48-56 (propiedad _config)');
console.log('3. Modifica los valores que deseas cambiar');
console.log('4. Guarda el archivo y reinicia la aplicación');

console.log('\n💡 EJEMPLO de configuración personalizada:');
const customConfig = {
    primary: 'blue',           // Cambiar de 'indigo' a 'blue'
    surface: 'zinc',           // Cambiar de 'slate' a 'zinc'
    darkTheme: false,          // Mantener modo claro
    menuMode: 'static',        // Mantener menú estático
    menuTheme: 'blue',         // Cambiar de 'light' a 'blue'
    topbarTheme: 'blue',       // Cambiar de 'indigo' a 'blue'
    menuProfilePosition: 'end' // Mantener posición final
};
console.log(JSON.stringify(customConfig, null, 2));
