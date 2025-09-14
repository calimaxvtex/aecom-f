# 📋 AECOM-F - Sistema de Administración de Menú

## 🎯 **Resumen del Proyecto**

**AECOM-F** es una aplicación Angular 20 con PrimeNG 20 que implementa un sistema completo de administración de menú para aplicaciones web. El proyecto incluye funcionalidades avanzadas de CRUD, gestión de rutas, exploración de iconos y configuración de API.

---

## 🚀 **Estado Actual**

**Versión:** 1.0.0  
**Estado:** ✅ **FUNCIONAL Y EN PRODUCCIÓN**

El sistema está completamente implementado y listo para uso en entornos reales.

---

## 🏗️ **Stack Tecnológico**

- **Angular 20** - Framework principal
- **PrimeNG 20** - Componentes UI
- **Tailwind CSS** - Estilos y layout
- **TypeScript** - Tipado estático
- **RxJS** - Programación reactiva

---

## 🚀 **Quick Start**

### **Prerrequisitos**
- Node.js 18+
- Angular CLI 20+
- npm o yarn

### **Instalación**
```bash
# Clonar repositorio
git clone https://github.com/calimaxvtex/aecom-f.git

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Acceder a la aplicación
http://localhost:4200/menu-admin
```

### **Configuración de API**
1. Ir al tab "Configuración API"
2. Configurar URL base (ej: `http://localhost:3000`)
3. Seleccionar modo mock/real
4. Probar conectividad

---

## 📚 **Documentación Detallada**

### **🎯 Funcionalidades**
- **[Resumen de Funcionalidades](FEATURES_SUMMARY.md)** - Lista completa de características implementadas
- **[Especificaciones CRUD](specifications/CRUD_TABLE_SPECIFICATIONS.md)** - Patrones para componentes de tabla
- **[Especificaciones de Servicios](specifications/CRUD_SERVICE_SPECIFICATIONS.md)** - Patrones para servicios HTTP

### **🔧 Aspectos Técnicos**
- **[Resumen Técnico](TECHNICAL_SUMMARY.md)** - Arquitectura, métricas y configuración
- **[Reglas del Proyecto](guidelines/PROJECT_RULES.md)** - Convenciones y mejores prácticas
- **[Sistema de Caché](cache-system-documentation.md)** - Documentación del sistema de caché

### **📊 Contexto del Proyecto**
- **[Contexto del Proyecto](context/PROJECT_CONTEXT.md)** - Información contextual
- **[Estado Actual](context/CURRENT_STATUS.md)** - Estado actual del desarrollo
- **[Referencias](context/REFERENCES.md)** - Referencias y recursos

---

## 🎯 **Funcionalidades Principales**

### ✅ **Sistema de Administración de Menú**
- CRUD completo para items de menú
- Formularios reactivos con validaciones
- Tabla avanzada con PrimeNG Table
- Edición inline y modales

### ✅ **Gestión Inteligente de Jerarquías**
- Selector de padre con vista jerárquica
- Cálculo automático de niveles
- Validación de relaciones padre-hijo

### ✅ **Exploradores Integrados**
- Explorador de rutas Angular
- Explorador de 157+ iconos PrimeIcons
- Búsqueda y filtrado en tiempo real

### ✅ **Configuración Flexible**
- Modo mock/real configurable
- URLs de API dinámicas
- Pruebas de conectividad

---

## 🛠️ **Comandos Útiles**

### **Desarrollo**
```bash
# Servidor de desarrollo
ng serve

# Build de producción
ng build --prod

# Linting
ng lint

# Testing
ng test
```

### **Git**
```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "mensaje"

# Push
git push origin develop
```

---

## 🐛 **Solución de Problemas**

### **Errores Comunes**
1. **NG0912 Warnings** - Warnings internos de PrimeNG (ignorar)
2. **Formularios Reactivos** - Usar FormControl.disable() en lugar de [disabled]
3. **API Connection** - Verificar URL base y conectividad
4. **Iconos no cargan** - Verificar importación de PrimeIcons

### **Debugging**
- Usar DevTools del navegador
- Revisar consola para errores
- Verificar Network tab para llamadas API
- Usar Angular DevTools

---

## 👥 **Contribución**

### **Flujo de Trabajo**
1. Crear rama desde `develop`
2. Implementar funcionalidad
3. Hacer commit con mensaje descriptivo
4. Crear Pull Request
5. Revisión y merge

### **Estándares de Código**
- TypeScript estricto
- ESLint configurado
- Prettier para formato
- Commits semánticos
- Documentación en código

---

## 📞 **Soporte**

Para soporte técnico o preguntas:
- Revisar documentación existente
- Verificar issues conocidos
- Contactar al equipo de desarrollo
- Crear issue en GitHub

---

## 📄 **Licencia**

Este proyecto está bajo la licencia [especificar licencia].

---

**Última actualización:** $(date)  
**Versión:** 1.0.0  
**Estado:** ✅ Funcional y en producción