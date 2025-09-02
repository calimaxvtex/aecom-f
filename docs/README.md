# 📋 AECOM-F - Sistema de Administración de Menú

## 🎯 **Resumen del Proyecto**

**AECOM-F** es una aplicación Angular 20 con PrimeNG 20 que implementa un sistema completo de administración de menú para aplicaciones web. El proyecto incluye funcionalidades avanzadas de CRUD, gestión de rutas, exploración de iconos y configuración de API.

---

## 🚀 **Características Principales**

### ✅ **Sistema de Administración de Menú**
- **CRUD completo** para items de menú
- **Formularios reactivos** con validaciones
- **Tabla avanzada** con PrimeNG Table
- **Edición inline** y modales
- **Confirmaciones** para eliminación

### ✅ **Gestión Inteligente de Jerarquías**
- **Selector de padre** con vista jerárquica
- **Cálculo automático** de niveles
- **Validación de relaciones** padre-hijo
- **Soporte para separadores** visuales

### ✅ **Explorador de Rutas**
- **Descubrimiento automático** de rutas Angular
- **Integración con router** de la aplicación
- **Selector visual** de rutas disponibles
- **Filtrado y búsqueda** de rutas

### ✅ **Explorador de Iconos**
- **157+ iconos** de PrimeIcons organizados
- **Categorización** por tipo de icono
- **Búsqueda y filtrado** avanzado
- **Copia al portapapeles** con un click
- **Vista previa** en tiempo real

### ✅ **Configuración de API**
- **Modo mock/real** configurable
- **Configuración de URL** base
- **Pruebas de conectividad** en tiempo real
- **Estado de conexión** visual
- **Endpoints disponibles** listados

---

## 🏗️ **Arquitectura Técnica**

### **Frontend Stack**
- **Angular 20** - Framework principal
- **PrimeNG 20** - Componentes UI
- **Tailwind CSS** - Estilos y layout
- **TypeScript** - Tipado estático
- **RxJS** - Programación reactiva

### **Estructura de Componentes**
```
src/app/features/menu-admin/
├── components/
│   ├── menu-admin-list.ts      # Componente principal
│   ├── icon-explorer.ts        # Explorador de iconos
│   ├── route-explorer.ts       # Explorador de rutas
│   └── api-config.ts           # Configuración API
├── services/
│   └── menu.service.ts         # Servicio de API
└── models/
    └── menu.interface.ts       # Interfaces TypeScript
```

### **Servicios y APIs**
- **MenuService** - CRUD operations
- **RouteDiscoveryService** - Descubrimiento de rutas
- **API Configuration** - Gestión de configuración
- **Mock Data** - Datos de prueba

---

## 📊 **Funcionalidades Implementadas**

### 🔧 **Gestión de Menú**
- ✅ **Crear** nuevos items de menú
- ✅ **Leer** lista completa de items
- ✅ **Actualizar** items existentes
- ✅ **Eliminar** items con confirmación
- ✅ **Validaciones** de formulario
- ✅ **Reglas de negocio** implementadas

### 🎨 **Interfaz de Usuario**
- ✅ **4 tabs principales** organizados
- ✅ **Formularios optimizados** con tooltips
- ✅ **Tabla responsive** con sorting
- ✅ **Modales** para edición
- ✅ **Confirmaciones** estilizadas
- ✅ **Iconos de ayuda** contextuales

### 🔗 **Integración de Rutas**
- ✅ **Descubrimiento automático** de rutas
- ✅ **Selector visual** de rutas
- ✅ **Filtrado** por tipo de ruta
- ✅ **Integración** con Angular Router

### 🎯 **Exploración de Iconos**
- ✅ **157+ iconos** disponibles
- ✅ **Categorización** por tipo
- ✅ **Búsqueda** en tiempo real
- ✅ **Copia** al portapapeles
- ✅ **Vista previa** visual

### ⚙️ **Configuración API**
- ✅ **Modo mock/real** configurable
- ✅ **URL base** configurable
- ✅ **Pruebas** de conectividad
- ✅ **Estado visual** de conexión

---

## 🗄️ **Modelo de Datos**

### **MenuFormItem Interface**
```typescript
interface MenuFormItem {
  id_menu?: number;
  label: string;
  icon?: string;
  routerLink?: string;
  tooltip?: string | null;
  nivel: number;
  id_padre: number;
  swItenms: boolean;
  separator: boolean;
  visible: boolean;
  disable: boolean;
  orden?: number;
}
```

### **API Endpoints**
- **GET** `/api/menu/v1` - Obtener todos los items
- **POST** `/api/menu/v1` - Operaciones universales (IN/UP/SL/DL)
- **PATCH** `/api/menu/v1/:id` - Actualización parcial
- **PUT** `/api/menu/v1/:id` - Actualización completa

---

## 🚦 **Estado del Proyecto**

### ✅ **Completado**
- [x] Sistema de administración de menú completo
- [x] CRUD operations con API real
- [x] Formularios reactivos optimizados
- [x] Interfaz con PrimeNG profesional
- [x] Explorador de rutas funcional
- [x] Explorador de iconos completo
- [x] Configuración de API
- [x] Validaciones y reglas de negocio
- [x] Código limpio y mantenible
- [x] Documentación técnica

### 🔄 **En Desarrollo**
- [ ] Pruebas unitarias
- [ ] Pruebas de integración
- [ ] Optimización de rendimiento
- [ ] Documentación de usuario

### 📋 **Pendiente**
- [ ] Implementación de roles y permisos
- [ ] Auditoría de cambios
- [ ] Exportación/importación de datos
- [ ] Internacionalización (i18n)

---

## 🛠️ **Instalación y Configuración**

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

## 📁 **Estructura de Archivos**

### **Archivos Principales**
```
src/app/
├── core/
│   ├── constants/api.constants.ts    # Configuración API
│   ├── models/menu.interface.ts      # Interfaces
│   └── services/menu/menu.service.ts # Servicio principal
├── features/menu-admin/
│   └── components/                   # Componentes del módulo
├── layout/                          # Componentes de layout
└── pages/                           # Páginas de la aplicación
```

### **Configuración**
```
├── angular.json                     # Configuración Angular
├── package.json                     # Dependencias
├── tsconfig.json                    # Configuración TypeScript
└── tailwind.config.js               # Configuración Tailwind
```

---

## 🔧 **Comandos Útiles**

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

## 📚 **Documentación Adicional**

- [Especificaciones de Servicio](specifications/SERVICE_SPECIFICATIONS.md)
- [Guías de Desarrollo](guidelines/DEVELOPMENT_GUIDELINES.md)
- [Contexto del Proyecto](context/PROJECT_CONTEXT.md)
- [Estado Actual](context/CURRENT_STATUS.md)
- [Referencias](context/REFERENCES.md)

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
