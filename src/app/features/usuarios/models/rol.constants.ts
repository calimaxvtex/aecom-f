/**
 * Constantes para el servicio de roles
 */

export const ROL_API_CONFIG = {
  // Endpoints
  ENDPOINTS: {
    ROLES: '/api/adminUsr/rol'
  },
  
  // URL base por defecto
  DEFAULT_BASE_URL: 'http://localhost:3000',
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // Estados de rol
  ESTADOS: {
    ACTIVO: 'A',
    INACTIVO: 'I',
    SUSPENDIDO: 'S',
    BLOQUEADO: 'B'
  },
  
  // Estados de rol con etiquetas legibles
  ESTADOS_LABELS: {
    'A': 'Activo',
    'I': 'Inactivo',
    'S': 'Suspendido',
    'B': 'Bloqueado'
  },
  
  // Colores para estados (para UI)
  ESTADOS_COLORS: {
    'A': 'success',    // Verde
    'I': 'secondary',  // Gris
    'S': 'warning',    // Amarillo
    'B': 'danger'      // Rojo
  },
  
  // Límites por defecto
  DEFAULTS: {
    PAGE_SIZE: 10,
    MAX_NOMBRE_LENGTH: 100
  },
  
  // Mensajes de validación
  VALIDATION_MESSAGES: {
    REQUIRED_FIELDS: 'Los campos marcados con * son obligatorios',
    INVALID_NOMBRE: 'El nombre del rol debe tener entre 2 y 100 caracteres',
    INVALID_ESTADO: 'El estado seleccionado no es válido',
    DUPLICATE_NOMBRE: 'Ya existe un rol con ese nombre',
    INVALID_ID: 'El ID del rol debe ser mayor a 0'
  },
  
  // Patrones de validación
  PATTERNS: {
    NOMBRE: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-_]{2,100}$/,
    ESTADO: /^[AISB]$/
  },
  
  // Códigos de respuesta
  RESPONSE_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
  }
};

/**
 * Configuración de la tabla de roles
 */
export const ROL_TABLE_CONFIG = {
  // Columnas de la tabla
  COLUMNS: [
    { field: 'id_rol', header: 'ID', sortable: true, width: '80px' },
    { field: 'nombre', header: 'Nombre del Rol', sortable: true, width: '250px' },
    { field: 'estado', header: 'Estado', sortable: true, width: '120px' },
    { field: 'fecha_m', header: 'Modificado', sortable: true, width: '150px' },
    { field: 'acciones', header: 'Acciones', sortable: false, width: '150px' }
  ],
  
  // Opciones de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
    SHOW_FIRST_LAST: true,
    SHOW_PAGE_LINKS: true
  },
  
  // Opciones de filtrado
  FILTERS: {
    GLOBAL_SEARCH: true,
    COLUMN_FILTERS: true,
    DATE_RANGE_FILTER: true,
    STATUS_FILTER: true
  }
};

/**
 * Configuración de formularios de roles
 */
export const ROL_FORM_CONFIG = {
  // Campos del formulario
  FIELDS: {
    NOMBRE: {
      label: 'Nombre del Rol',
      placeholder: 'Ingrese el nombre del rol',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    ESTADO: {
      label: 'Estado',
      required: true,
      options: [
        { label: 'Activo', value: 'A' },
        { label: 'Inactivo', value: 'I' },
        { label: 'Suspendido', value: 'S' },
        { label: 'Bloqueado', value: 'B' }
      ]
    }
  },
  
  // Validaciones
  VALIDATIONS: {
    NOMBRE: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d\-_]{2,100}$/
    },
    ESTADO: {
      required: true,
      pattern: /^[AISB]$/
    }
  }
};

/**
 * Roles predefinidos del sistema
 */
export const ROLES_PREDEFINIDOS = [
  {
    id_rol: 1,
    nombre: 'Super Administrador',
    estado: 'A',
    descripcion: 'Acceso completo al sistema'
  },
  {
    id_rol: 2,
    nombre: 'Administrador',
    estado: 'A',
    descripcion: 'Administración general del sistema'
  },
  {
    id_rol: 3,
    nombre: 'Usuario',
    estado: 'A',
    descripcion: 'Usuario estándar del sistema'
  },
  {
    id_rol: 4,
    nombre: 'Solo Lectura',
    estado: 'A',
    descripcion: 'Acceso de solo lectura'
  }
];

/**
 * Permisos por rol (para futuras implementaciones)
 */
export const PERMISOS_POR_ROL = {
  'Super Administrador': [
    'usuarios:create', 'usuarios:read', 'usuarios:update', 'usuarios:delete',
    'roles:create', 'roles:read', 'roles:update', 'roles:delete',
    'sistema:configurar', 'sistema:auditoria'
  ],
  'Administrador': [
    'usuarios:create', 'usuarios:read', 'usuarios:update',
    'roles:read',
    'sistema:configurar'
  ],
  'Usuario': [
    'usuarios:read',
    'perfil:update'
  ],
  'Solo Lectura': [
    'usuarios:read'
  ]
};
