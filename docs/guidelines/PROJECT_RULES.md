# 📋 Reglas del Proyecto

## 🚨 REGLA CRÍTICA - Separación de Archivos de Componentes

### ❌ PROHIBIDO - Templates y Estilos Inline
```typescript
// ❌ INCORRECTO - NO HACER ESTO
@Component({
  selector: 'app-example',
  template: '<div>Contenido inline</div>',
  styles: ['.example { color: red; }']
})
export class ExampleComponent {}
```

### ✅ OBLIGATORIO - Archivos Separados
```typescript
// ✅ CORRECTO - HACER ASÍ
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent {}
```

## 📁 Estructura Obligatoria de Componentes

Cada componente DEBE tener la siguiente estructura:

```
src/app/components/example/
├── example.component.ts          # Lógica del componente
├── example.component.html       # Template (OBLIGATORIO)
├── example.component.css        # Estilos (OBLIGATORIO)
└── example.component.spec.ts    # Tests (RECOMENDADO)
```

## 🎯 Beneficios de la Separación

1. **Mantenibilidad:** Código más fácil de mantener
2. **Colaboración:** Múltiples desarrolladores pueden trabajar simultáneamente
3. **Herramientas:** Mejor soporte de IDEs y herramientas de desarrollo
4. **Reutilización:** Componentes más reutilizables
5. **Debugging:** Más fácil identificar y corregir problemas

## 🔧 Configuración de Schematics

El proyecto está configurado para generar automáticamente archivos separados:

```json
// angular.json
"schematics": {
  "@schematics/angular:component": {
    "style": "scss"
  }
}
```

## 📝 Ejemplos de Implementación

### Componente Simple
```typescript
// example.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent {
  title = 'Ejemplo';
}
```

```html
<!-- example.component.html -->
<div class="example-container">
  <h1>{{ title }}</h1>
  <p>Contenido del componente</p>
</div>
```

```css
/* example.component.css */
.example-container {
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
  font-size: 24px;
}
```

### Componente con PrimeNG
```typescript
// categoria.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriaComponent {
  categorias: any[] = [];
}
```

```html
<!-- categoria.component.html -->
<div class="categoria-container">
  <p-table [value]="categorias">
    <ng-template pTemplate="header">
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Estado</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-categoria>
      <tr>
        <td>{{ categoria.id }}</td>
        <td>{{ categoria.nombre }}</td>
        <td>{{ categoria.estado }}</td>
      </tr>
    </ng-template>
  </p-table>
</div>
```

```css
/* categoria.component.css */
.categoria-container {
  padding: 20px;
}

.p-datatable {
  margin-top: 20px;
}
```

## 🚫 Excepciones (Muy Limitadas)

### Solo se permite inline en casos MUY específicos:

1. **Componentes de Testing:** Para pruebas unitarias simples
2. **Componentes Mock:** Para datos de prueba
3. **Componentes de Utilidad:** Muy pequeños y específicos

```typescript
// ✅ EXCEPCIÓN VÁLIDA - Solo para testing
@Component({
  selector: 'app-test-mock',
  template: '<div>Mock data</div>',
  styles: ['.mock { display: none; }']
})
export class TestMockComponent {}
```

## 🔍 Verificación Automática

### Linting Rules
El proyecto incluye reglas de linting para verificar la separación:

```json
// .eslintrc.json
{
  "rules": {
    "@angular-eslint/component-max-inline-declarations": "error"
  }
}
```

### Pre-commit Hooks
Se recomienda configurar hooks de pre-commit para verificar:

```bash
# Verificar que no hay templates inline
ng lint --fix
```

## 📚 Recursos Adicionales

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Component Architecture Best Practices](https://angular.io/guide/architecture-components)
- [PrimeNG Component Guidelines](https://primeng.org/guides)

## 🎯 Resumen

**REGLA PRINCIPAL:** Siempre separar templates y estilos en archivos independientes. Esta regla es OBLIGATORIA y debe seguirse en todos los componentes del proyecto.