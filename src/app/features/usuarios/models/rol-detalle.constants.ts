/**
 * Constantes para el servicio de detalle de roles
 */

export const ROL_DETALLE_API_CONFIG = {
  // Endpoints
  ENDPOINTS: {
    ROL_DETALLE: '/api/admrold/v1'
  },
  
  // URL base por defecto
  DEFAULT_BASE_URL: 'http://localhost:3000',
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // Tipos de consulta
  TIPOS_CONSULTA: {
    POR_ROL: 'id_rol',      // Consultar todos los detalles de un rol
    POR_DETALLE: 'id_rold'  // Consultar un detalle específico
  },
  
  // Límites por defecto
  DEFAULTS: {
    PAGE_SIZE: 10,
    MAX_REN: 999,
    MIN_REN: 1
  },
  
  // Mensajes de validación
  VALIDATION_MESSAGES: {
    REQUIRED_FIELDS: 'Los campos marcados con * son obligatorios',
    INVALID_ID_ROL: 'El ID del rol debe ser mayor a 0',
    INVALID_ID_MENU: 'El ID del menú debe ser mayor a 0',
    INVALID_REN: 'El número de orden debe estar entre 1 y 999',
    DUPLICATE_MENU_ROL: 'Ya existe este menú asignado al rol',
    INVALID_ID_ROLD: 'El ID del detalle debe ser mayor a 0'
  },
  
  // Patrones de validación
  PATTERNS: {
    ID_POSITIVO: /^[1-9]\d*$/,
    REN_RANGE: /^[1-9]\d{0,2}$/
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
 * Configuración de la tabla de detalle de roles
 */
export const ROL_DETALLE_TABLE_CONFIG = {
  // Columnas de la tabla
  COLUMNS: [
    { field: 'id_rold', header: 'ID Detalle', sortable: true, width: '100px' },
    { field: 'id_rol', header: 'ID Rol', sortable: true, width: '80px' },
    { field: 'nombre_rol', header: 'Nombre del Rol', sortable: true, width: '200px' },
    { field: 'ren', header: 'Orden', sortable: true, width: '80px' },
    { field: 'id_menu', header: 'ID Menú', sortable: true, width: '100px' },
    { field: 'nombre_menu', header: 'Nombre del Menú', sortable: true, width: '200px' },
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
    ROL_FILTER: true,
    MENU_FILTER: true
  }
};

/**
 * Configuración de formularios de detalle de roles
 */
export const ROL_DETALLE_FORM_CONFIG = {
  // Campos del formulario
  FIELDS: {
    ID_ROL: {
      label: 'ID del Rol',
      placeholder: 'Seleccione el rol',
      required: true,
      min: 1
    },
    ID_MENU: {
      label: 'ID del Menú',
      placeholder: 'Seleccione el menú',
      required: true,
      min: 1
    },
    REN: {
      label: 'Número de Orden',
      placeholder: 'Ingrese el orden (1-999)',
      required: true,
      min: 1,
      max: 999
    }
  },
  
  // Validaciones
  VALIDATIONS: {
    ID_ROL: {
      required: true,
      min: 1,
      pattern: /^[1-9]\d*$/
    },
    ID_MENU: {
      required: true,
      min: 1,
      pattern: /^[1-9]\d*$/
    },
    REN: {
      required: true,
      min: 1,
      max: 999,
      pattern: /^[1-9]\d{0,2}$/
    }
  }
};

/**
 * Mensajes de operación
 */
export const ROL_DETALLE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Detalle de rol creado exitosamente',
    UPDATED: 'Detalle de rol actualizado exitosamente',
    DELETED: 'Detalle de rol eliminado exitosamente',
    QUERY_SUCCESS: 'Consulta de detalle de roles exitosa'
  },
  ERROR: {
    CREATE_FAILED: 'Error al crear el detalle del rol',
    UPDATE_FAILED: 'Error al actualizar el detalle del rol',
    DELETE_FAILED: 'Error al eliminar el detalle del rol',
    QUERY_FAILED: 'Error al consultar el detalle de roles',
    INVALID_OPERATION: 'Operación no válida',
    DUPLICATE_ENTRY: 'Ya existe este menú asignado al rol'
  },
  CONFIRM: {
    DELETE: '¿Está seguro de que desea eliminar este detalle de rol?',
    UPDATE: '¿Está seguro de que desea actualizar este detalle de rol?'
  }
};
