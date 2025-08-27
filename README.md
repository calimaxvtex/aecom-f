# Calimax - Aplicación Web

## Descripción
Aplicación web desarrollada con Angular 20 y el tema Ultima de PrimeFaces, diseñada para la gestión y administración de Calimax.

## 🚀 Tecnologías Utilizadas

- **Angular 20** - Framework principal
- **PrimeNG 20** - Componentes UI avanzados
- **PrimeUIX Themes** - Sistema de temas con soporte para modo oscuro
- **Tailwind CSS** - Framework CSS utilitario
- **TypeScript** - Lenguaje de programación
- **PrimeIcons** - Iconografía completa

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPOSITORIO]
cd aecom-f
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm start
```

4. **Construir para producción**
```bash
npm run build
```

## 🎨 Características del Tema

- **Tema Ultima** - Tema premium de PrimeFaces
- **Modo oscuro/claro** - Soporte completo para ambos temas
- **Componentes responsivos** - Optimizado para móviles y desktop
- **490+ bloques UI** - Componentes pre-construidos listos para usar
- **Personalización completa** - Colores, tipografías y estilos personalizables

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # Componentes de la aplicación
│   ├── apps/              # Módulos de aplicaciones
│   ├── layout/            # Componentes de layout
│   ├── pages/             # Páginas principales
│   └── types/             # Tipos TypeScript
├── assets/                 # Recursos estáticos
│   ├── logos/             # Logos y branding
│   ├── layout/            # Estilos del tema
│   └── demo/              # Datos de demostración
└── styles.scss            # Estilos globales
```

## 🎯 Componentes Principales

- **Dashboard** - Panel principal con analytics
- **Gestión de Usuarios** - CRUD de usuarios
- **E-commerce** - Módulo de comercio electrónico
- **Chat** - Sistema de mensajería
- **Kanban** - Gestión de tareas
- **Mail** - Sistema de correo
- **File Management** - Gestión de archivos

## 🔧 Configuración

### Logos Personalizados
Los logos se configuran en `src/assets/logos/logos.config.ts`:

```typescript
export const LOGOS_CONFIG: LogoConfig[] = [
    {
        name: 'calimax-logo',
        path: 'assets/logos/ic_calimax_logo.svg',
        alt: 'Logo Calimax',
        type: 'logo'
    }
    // ... más logos
];
```

### Tema Personalizado
El tema se configura en `src/app.config.ts`:

```typescript
const MyPreset = definePreset(Material, {
    semantic: {
        primary: {
            500: '{indigo.500}',
            // ... más colores
        }
    }
});
```

## 📱 Responsive Design

- **Mobile First** - Diseño optimizado para móviles
- **Breakpoints** - Adaptable a diferentes tamaños de pantalla
- **Touch Friendly** - Interacciones optimizadas para touch

## 🚀 Scripts Disponibles

- `npm start` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run test` - Ejecutar tests
- `npm run format` - Formatear código con Prettier

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto utiliza el tema Ultima de PrimeFaces. Consulta la licencia correspondiente.

## 📞 Soporte

Para soporte técnico o consultas sobre el tema Ultima, visita [PrimeFaces](https://www.primefaces.org/).

---

**Desarrollado con ❤️ usando Angular y PrimeFaces Ultima**