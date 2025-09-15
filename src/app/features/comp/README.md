# 📦 Módulo de Componentes (COMP)

Sistema para gestión de componentes reutilizables de página y aplicación web.

## 🏗️ Arquitectura

### Estructura del Módulo
```
comp/
├── models/
│   ├── comp.interface.ts          # Interfaces TypeScript
│   └── index.ts                   # Exportaciones
├── services/
│   └── comp.service.ts           # Servicio principal
└── README.md                     # Esta documentación
```

## 📋 Interfaces Principales

### `Componente`
Interface principal que representa un componente del sistema:

```typescript
interface Componente {
    id_comp: number;           // ID único del componente
    clave: string;            // Clave única (ej: "CARR_HOME")
    nombre: string;           // Nombre descriptivo
    descripcion: string;      // Descripción detallada
    canal: string;            // Canal del componente
    tipo_comp: string;        // Tipo de componente
    isUnico: number;          // 0: múltiple, 1: único
    tiempo: number;           // Tiempo en ms para carruseles/autoplay
    visibles: number;         // Número de elementos visibles
    swEnable: number;         // 0: deshabilitado, 1: habilitado
    usr_a: string;
    usr_m: string | null;
    fecha_a: string;         // ISO date string
    fecha_m: string;         // ISO date string
}
```

## 🔧 Servicio Principal (CompService)

### Configuración del Endpoint
- **ID del Endpoint:** `18`
- **Constante:** `COMP_ENDPOINT_ID = 18`
- **Protocolo:** HTTP POST con inyección de sesión obligatoria

### Métodos CRUD Principales

#### 1. `getAllComponentes(params?: ComponentePaginationParams)`
Obtiene todos los componentes con soporte para paginación y filtros.

```typescript
// Ejemplo de uso
this.compService.getAllComponentes({
    page: 1,
    limit: 10,
    sort: 'nombre',
    order: 'asc',
    filters: {
        canal: 'web',
        swEnable: 1
    }
}).subscribe(response => {
    console.log('Componentes:', response.data);
});
```

#### 2. `createComponente(componente: CreateComponenteRequest)`
Crea un nuevo componente.

```typescript
const nuevoComponente: CreateComponenteRequest = {
    clave: 'BANNER_PROMO',
    nombre: 'Banner Promocional',
    descripcion: 'Banner principal de promociones',
    canal: 'web',
    tipo_comp: 'banner',
    tiempo: 3000,
    visibles: 1
};

this.compService.createComponente(nuevoComponente).subscribe(response => {
    console.log('Componente creado:', response.data);
});
```

#### 3. `updateComponente(componente: UpdateComponenteRequest)`
Actualiza un componente existente.

```typescript
const actualizarComponente: UpdateComponenteRequest = {
    id_comp: 1,
    nombre: 'Carrusel Principal Actualizado',
    tiempo: 4000
};

this.compService.updateComponente(actualizarComponente).subscribe(response => {
    console.log('Componente actualizado:', response.data);
});
```

#### 4. `deleteComponente(id: number)`
Elimina un componente por su ID.

```typescript
this.compService.deleteComponente(1).subscribe(response => {
    console.log('Componente eliminado');
});
```

#### 5. `getComponenteById(id: number)`
Obtiene un componente específico por su ID.

```typescript
this.compService.getComponenteById(1).subscribe(response => {
    console.log('Componente encontrado:', response.data);
});
```

### Métodos de Utilidad

#### Componentes Filtrados
```typescript
// Componentes activos
this.compService.getComponentesActivos();

// Por clave
this.compService.getComponenteByClave('CARR_HOME');

// Por canal
this.compService.getComponentesByCanal('web');

// Por tipo
this.compService.getComponentesByTipo('banner');

// Componentes únicos
this.compService.getComponentesUnicos();
```

#### Configuración y Metadatos
```typescript
// Tipos de componentes disponibles
this.compService.getTiposComponente().subscribe(response => {
    console.log('Tipos:', response.data);
});

// Canales disponibles
this.compService.getCanales().subscribe(response => {
    console.log('Canales:', response.data);
});

// Estadísticas
this.compService.getEstadisticas().subscribe(response => {
    console.log('Estadísticas:', response.data);
});
```

#### Validaciones
```typescript
// Validar clave única
this.compService.validarClaveUnica('NUEVA_CLAVE').subscribe(esValida => {
    console.log('Clave válida:', esValida);
});

// Configuración por defecto
this.compService.getConfiguracionPorDefecto('banner').subscribe(config => {
    console.log('Configuración por defecto:', config);
});
```

## 📊 Estructura de Respuestas

### Respuesta Estándar
```json
{
    "statuscode": 200,
    "mensaje": "ok",
    "data": [
        {
            "id_comp": 1,
            "clave": "CARR_HOME",
            "nombre": "Carrusel Principal",
            "descripcion": "Carrusel principal del home page",
            "canal": "web",
            "tipo_comp": "carrusel",
            "isUnico": 0,
            "tiempo": 5000,
            "visibles": 5,
            "swEnable": 1,
            "usr_a": "admin",
            "usr_m": null,
            "fecha_a": "2025-09-14T12:43:49.637",
            "fecha_m": "2025-09-14T12:43:49.637"
        }
    ]
}
```

## 🔐 Seguridad y Sesión

### Inyección de Sesión Obligatoria
Todos los métodos incluyen automáticamente:
- `usr`: Usuario actual de la sesión
- `id_session`: ID de sesión actual

```typescript
private getSessionData(): any {
    const session = this.sessionService.getSession();
    if (!session) {
        throw new Error('Sesión no encontrada. Usuario debe estar autenticado.');
    }
    return {
        usr: session.usuario,
        id_session: session.id_session
    };
}
```

## 🎯 Acciones del Backend

| Acción | Descripción | Parámetros Requeridos |
|--------|-------------|----------------------|
| `SL` | Select/Query | `usr`, `id_session` |
| `IN` | Insert/Create | `usr`, `id_session`, datos del componente |
| `UP` | Update | `usr`, `id_session`, `id_comp`, datos a actualizar |
| `DL` | Delete | `usr`, `id_session`, `id_comp` |

## 📝 Campos Obligatorios

### Para Crear Componente
```typescript
{
    "clave": "string (única)",
    "nombre": "string",
    "descripcion": "string",
    "canal": "string",
    "tipo_comp": "string"
}
```

### Campos Opcionales con Valores por Defecto
```typescript
{
    "isUnico": 0,      // Default: 0 (múltiple)
    "tiempo": 5000,    // Default: 5000ms
    "visibles": 5,     // Default: 5 elementos
    "swEnable": 1      // Default: 1 (habilitado)
}
```

## 🚀 Uso en Componentes Angular

### Inyección del Servicio
```typescript
import { CompService } from '../../features/comp/services/comp.service';

@Component({
    selector: 'app-gestion-componentes',
    templateUrl: './gestion-componentes.component.html'
})
export class GestionComponentesComponent {
    constructor(private compService: CompService) {}

    ngOnInit() {
        this.cargarComponentes();
    }

    cargarComponentes() {
        this.compService.getAllComponentes().subscribe({
            next: (response) => {
                this.componentes = response.data;
            },
            error: (error) => {
                console.error('Error al cargar componentes:', error);
            }
        });
    }
}
```

## 🔍 Filtros y Búsqueda Avanzada

### Filtros Disponibles
```typescript
interface ComponenteFilters {
    clave?: string;
    nombre?: string;
    descripcion?: string;
    canal?: string;
    tipo_comp?: string;
    isUnico?: number;
    swEnable?: number;
    usr_a?: string;
    usr_m?: string;
}
```

### Paginación
```typescript
interface ComponentePaginationParams {
    page?: number;      // Página actual
    limit?: number;     // Registros por página
    sort?: string;      // Campo para ordenar
    order?: 'asc' | 'desc'; // Orden
    filters?: ComponenteFilters; // Filtros
}
```

## 📈 Estadísticas y Reportes

### Información Disponible
```typescript
interface ComponenteStats {
    total_componentes: number;
    componentes_activos: number;
    componentes_por_tipo: { [tipo: string]: number };
    componentes_por_canal: { [canal: string]: number };
    componentes_creados_hoy: number;
    componentes_modificados_hoy: number;
}
```

## ⚠️ Consideraciones Importantes

1. **Sesión Obligatoria:** Todos los métodos requieren una sesión activa
2. **Validación de Claves:** Las claves deben ser únicas en el sistema
3. **Campos por Defecto:** El servicio asigna valores por defecto a campos opcionales
4. **Auditoría:** Se registra automáticamente usuario y fecha de creación/modificación
5. **Paginación:** Implementa paginación para consultas grandes

## 🧪 Testing

### Ejemplo de Test Unitario
```typescript
describe('CompService', () => {
    let service: CompService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CompService, ApiConfigService, SessionService]
        });
        service = TestBed.inject(CompService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should create component', () => {
        const mockComponente = { clave: 'TEST', nombre: 'Test Component' };

        service.createComponente(mockComponente).subscribe(response => {
            expect(response.statuscode).toBe(200);
        });

        const req = httpMock.expectOne('/api/componentes');
        expect(req.request.method).toBe('POST');
        req.flush({ statuscode: 200, mensaje: 'ok', data: mockComponente });
    });
});
```

## 📚 Referencias

- [Documentación General del Proyecto](../../docs/README.md)
- [Especificaciones de Servicios](../../docs/specifications/SERVICE_SPECIFICATIONS.md)
- [Reglas del Proyecto](../../docs/guidelines/PROJECT_RULES.md)

---

**Versión:** 1.0.0
**Última actualización:** 14 de septiembre de 2025
**Endpoint ID:** 18
