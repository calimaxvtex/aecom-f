/**
 * Constantes para el servicio de usuarios
 */

export const USUARIO_API_CONFIG = {
  // Endpoints
  ENDPOINTS: {
    USUARIOS: '/api/admusr/v1'
  },
  
  // URL base por defecto
  DEFAULT_BASE_URL: 'http://localhost:3000',
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // Estados de usuario
  ESTADOS: {
    INACTIVO: 0,
    ACTIVO: 1,
    SUSPENDIDO: 2,
    BLOQUEADO: 3
  },
  
  // Estados de sesión
  SESSION_STATUS: {
    LOGOUT: 0,
    LOGIN: 1
  },
  
  // Límites por defecto
  DEFAULTS: {
    MAX_LOGIN_ATTEMPTS: 3,
    SESSION_TIMEOUT: 30, // minutos
    PAGE_SIZE: 10
  },
  
  // Mensajes de validación
  VALIDATION_MESSAGES: {
    REQUIRED_FIELDS: 'Los campos marcados con * son obligatorios',
    INVALID_EMAIL: 'El formato del email no es válido',
    INVALID_USUARIO: 'El número de usuario debe ser mayor a 0',
    DUPLICATE_EMAIL: 'El email ya está registrado',
    DUPLICATE_USUARIO: 'El número de usuario ya existe',
    INVALID_ESTADO: 'El estado seleccionado no es válido'
  },
  
  // Patrones de validación
  PATTERNS: {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    NOMBRE: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
    USUARIO: /^[1-9]\d*$/
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
 * Configuración de la tabla de usuarios
 */
export const USUARIO_TABLE_CONFIG = {
  // Columnas de la tabla
  COLUMNS: [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'usuario', header: 'Usuario', sortable: true, width: '100px' },
    { field: 'nombre', header: 'Nombre', sortable: true, width: '200px' },
    { field: 'email', header: 'Email', sortable: true, width: '250px' },
    { field: 'estado', header: 'Estado', sortable: true, width: '100px' },
    { field: 'logins', header: 'Logins', sortable: true, width: '80px' },
    { field: 'intentos', header: 'Intentos', sortable: true, width: '80px' },
    { field: 'fecha_login', header: 'Último Login', sortable: true, width: '150px' },
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
 * Configuración de formularios
 */
export const USUARIO_FORM_CONFIG = {
  // Campos del formulario
  FIELDS: {
    USUARIO: {
      label: 'Número de Usuario',
      placeholder: 'Ingrese el número de usuario',
      required: true,
      min: 1,
      max: 999999
    },
    EMAIL: {
      label: 'Email',
      placeholder: 'usuario@empresa.com',
      required: true,
      type: 'email'
    },
    NOMBRE: {
      label: 'Nombre Completo',
      placeholder: 'Ingrese el nombre completo',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    ESTADO: {
      label: 'Estado',
      required: true,
      options: [
        { label: 'Inactivo', value: 0 },
        { label: 'Activo', value: 1 },
        { label: 'Suspendido', value: 2 },
        { label: 'Bloqueado', value: 3 }
      ]
    }
  },
  
  // Validaciones
  VALIDATIONS: {
    USUARIO: {
      required: true,
      min: 1,
      pattern: /^[1-9]\d*$/
    },
    EMAIL: {
      required: true,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    NOMBRE: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/
    },
    ESTADO: {
      required: true
    }
  }
};
