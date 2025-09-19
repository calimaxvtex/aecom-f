# 🧪 Componente de Prueba - Proyectos Service

## 📋 Descripción

Este componente permite probar todas las funcionalidades del servicio de proyectos (`ProyService`) de manera interactiva. Es útil para verificar que el servicio funciona correctamente con el endpoint ID 14.

## 🚀 Funcionalidades de Prueba

### 1. **Obtener Todos los Proyectos**
- Prueba la consulta general de proyectos
- Verifica el manejo de respuestas array/objeto
- Muestra todos los proyectos disponibles

### 2. **Crear Proyecto de Prueba**
- Crea un proyecto temporal para testing
- Verifica la funcionalidad de creación
- Incluye todos los campos requeridos

### 3. **Buscar Proyectos**
- Prueba la búsqueda por descripción
- Verifica los filtros de búsqueda
- Muestra resultados filtrados

### 4. **Actualizar Proyecto**
- Permite modificar un proyecto existente
- Prueba la funcionalidad de actualización
- Verifica que los cambios se guarden correctamente

### 5. **Eliminar Proyecto**
- Prueba la eliminación de proyectos
- Incluye confirmación de eliminación
- Verifica que se elimine correctamente

## 🔗 URL de Acceso

```
http://localhost:4200/test/proy-test
```

## 📊 Información del Servicio

El componente muestra información en tiempo real sobre:
- **ID del Servicio**: 14 (configurado para proyectos)
- **URL del Endpoint**: Obtenida dinámicamente desde `ApiConfigService`
- **Estado del Servicio**: Conectado/Error
- **Último Test Ejecutado**: Para seguimiento

## 🧪 Cómo Usar

1. **Accede a la URL de test**
2. **Ejecuta las pruebas en orden**:
   - Primero "Obtener Todos" para ver datos existentes
   - Luego "Crear Proyecto" para agregar datos de prueba
   - Prueba "Buscar" con diferentes términos
   - Selecciona un proyecto y pruébalo "Actualizar"
   - Finalmente, prueba "Eliminar" si es necesario

3. **Observa los resultados**:
   - Los resultados se muestran en la tabla de la derecha
   - Los mensajes de éxito/error aparecen como toast
   - La consola del navegador muestra logs detallados

## 🔍 Debugging

El componente incluye logging detallado que se puede ver en:
- **Consola del navegador**: Logs de todas las operaciones
- **Network tab**: Peticiones HTTP realizadas
- **Application tab**: Estado de localStorage (si aplica)

## ⚠️ Consideraciones

- **Proyecto de Prueba**: Los proyectos creados tienen un identificador único temporal
- **Datos Reales**: Las pruebas afectan la base de datos real
- **Limpieza**: Usa "Limpiar Resultados" para resetear el estado

## 🐛 Troubleshooting

### Si no se conecta al servicio:
1. Verifica que el backend esté ejecutándose
2. Confirma que el endpoint ID 14 esté configurado en `spconfig`
3. Revisa la consola para errores de red

### Si las pruebas fallan:
1. Verifica la estructura de respuesta del backend
2. Confirma que los campos requeridos estén presentes
3. Revisa los logs de error en la consola

## 📝 Logs de Ejemplo

```javascript
// Ejemplo de log exitoso
✅ Test exitoso - Proyectos obtenidos: {
  statuscode: 200,
  mensaje: "ok",
  data: [...]
}

// Ejemplo de log de error
❌ Test fallido - Error al crear proyecto: {
  statuscode: 500,
  mensaje: "Error interno del servidor"
}
```

---

## 🎯 Próximos Pasos

Después de verificar que el servicio funciona correctamente:
1. El componente principal (`/system/catalogo/proy`) debería funcionar sin problemas
2. Se pueden agregar más funcionalidades al servicio si es necesario
3. Se puede integrar con otros módulos del sistema
