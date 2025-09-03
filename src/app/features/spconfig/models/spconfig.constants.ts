/**
 * Constantes para el servicio de configuración de Stored Procedures
 */

export const SPCONFIG_API_CONFIG = {
  // Endpoints
  ENDPOINTS: {
    SPCONFIG: '/api/spconfig/v1'
  },
  
  // URL base por defecto
  DEFAULT_BASE_URL: 'http://localhost:3000',
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // Estados de SP
  ESTADOS: {
    ACTIVO: 'A',
    INACTIVO: 'I',
    SUSPENDIDO: 'S',
    BLOQUEADO: 'B',
    EN_DESARROLLO: 'D'
  },
  
  // Estados de SP con etiquetas legibles
  ESTADOS_LABELS: {
    'A': 'Activo',
    'I': 'Inactivo',
    'S': 'Suspendido',
    'B': 'Bloqueado',
    'D': 'En Desarrollo'
  },
  
  // Colores para estados (para UI)
  ESTADOS_COLORS: {
    'A': 'success',    // Verde
    'I': 'secondary',  // Gris
    'S': 'warning',    // Amarillo
    'B': 'danger',     // Rojo
    'D': 'info'        // Azul
  },
  
  // Tipos de base de datos
  DATABASE_TYPES: {
    EC: 'ec',
    SQLSERVER: 'sqlserver',
    MYSQL: 'mysql',
    POSTGRESQL: 'postgresql',
    ORACLE: 'oracle'
  },
  
  // Tipos de base de datos con etiquetas legibles
  DATABASE_LABELS: {
    'ec': 'EC Database',
    'sqlserver': 'SQL Server',
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'oracle': 'Oracle'
  },
  
  // Métodos HTTP soportados
  HTTP_METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
  },
  
  // Métodos HTTP con etiquetas legibles
  HTTP_METHOD_LABELS: {
    'GET': 'GET - Consulta',
    'POST': 'POST - Crear/Insertar',
    'PUT': 'PUT - Actualizar Completo',
    'PATCH': 'PATCH - Actualizar Parcial',
    'DELETE': 'DELETE - Eliminar'
  },
  
  // Switches de API
  API_SWITCHES: {
    HABILITADO: 1,
    DESHABILITADO: 0
  },
  
  // Switches de API con etiquetas legibles
  API_SWITCH_LABELS: {
    1: 'Habilitado',
    0: 'Deshabilitado'
  },
  
  // Límites por defecto
  DEFAULTS: {
    PAGE_SIZE: 10,
    MAX_NOMBRE_LENGTH: 100,
    MAX_PARAMS_LENGTH: 4000,
    MAX_RUTA_LENGTH: 100,
    MAX_API_NAME_LENGTH: 50,
    MAX_KEY_ID_LENGTH: 50
  },
  
  // Mensajes de validación
  VALIDATION_MESSAGES: {
    REQUIRED_FIELDS: 'Los campos marcados con * son obligatorios',
    INVALID_NOMBRE: 'El nombre del SP debe tener entre 2 y 100 caracteres',
    INVALID_DB: 'El tipo de base de datos no es válido',
    INVALID_PARAMS: 'Los parámetros deben ser un JSON válido',
    INVALID_ESTADO: 'El estado seleccionado no es válido',
    INVALID_SW_API: 'El switch de API debe ser 0 o 1',
    INVALID_RUTA: 'La ruta debe tener entre 2 y 100 caracteres',
    INVALID_API_NAME: 'El nombre de la API debe tener entre 2 y 50 caracteres',
    INVALID_METODO: 'El método HTTP no es válido',
    INVALID_KEY_ID: 'El ID de clave debe tener entre 2 y 50 caracteres',
    DUPLICATE_NOMBRE: 'Ya existe un SP con ese nombre',
    INVALID_JSON_PARAMS: 'Los parámetros no son un JSON válido'
  },
  
  // Patrones de validación
  PATTERNS: {
    NOMBRE: /^[a-zA-Z0-9_]{2,100}$/,
    RUTA: /^[a-zA-Z0-9\/_-]{2,100}$/,
    API_NAME: /^[a-zA-Z0-9_-]{2,50}$/,
    KEY_ID: /^[a-zA-Z0-9_]{2,50}$/,
    ESTADO: /^[AISBD]$/,
    SW_API: /^[01]$/
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
 * Configuración de la tabla de SPConfig
 */
export const SPCONFIG_TABLE_CONFIG = {
  // Columnas de la tabla
  COLUMNS: [
    { field: 'id_sp', header: 'ID SP', sortable: true, width: '80px' },
    { field: 'nombre', header: 'Nombre SP', sortable: true, width: '200px' },
    { field: 'db', header: 'Base de Datos', sortable: true, width: '120px' },
    { field: 'estado', header: 'Estado', sortable: true, width: '100px' },
    { field: 'swApi', header: 'API', sortable: true, width: '80px' },
    { field: 'ruta', header: 'Ruta', sortable: true, width: '150px' },
    { field: 'apiName', header: 'Nombre API', sortable: true, width: '120px' },
    { field: 'metodo', header: 'Método', sortable: true, width: '100px' },
    { field: 'keyId', header: 'ID Clave', sortable: true, width: '120px' },
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
    STATUS_FILTER: true,
    DATABASE_FILTER: true,
    METHOD_FILTER: true,
    API_SWITCH_FILTER: true
  }
};

/**
 * Configuración de formularios de SPConfig
 */
export const SPCONFIG_FORM_CONFIG = {
  // Campos del formulario
  FIELDS: {
    NOMBRE: {
      label: 'Nombre del Stored Procedure',
      placeholder: 'Ej: ADM_ROL_100',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    DB: {
      label: 'Base de Datos',
      placeholder: 'Seleccione la base de datos',
      required: true,
      options: [
        { label: 'EC Database', value: 'ec' },
        { label: 'SQL Server', value: 'sqlserver' },
        { label: 'MySQL', value: 'mysql' },
        { label: 'PostgreSQL', value: 'postgresql' },
        { label: 'Oracle', value: 'oracle' }
      ]
    },
    PARAMS: {
      label: 'Parámetros (JSON)',
      placeholder: '[{"ParamName":"@JSON","ParamType":"nvarchar","MaxLength":-1,"IsOutput":false}]',
      required: true,
      type: 'textarea',
      rows: 4
    },
    ESTADO: {
      label: 'Estado',
      required: true,
      options: [
        { label: 'Activo', value: 'A' },
        { label: 'Inactivo', value: 'I' },
        { label: 'Suspendido', value: 'S' },
        { label: 'Bloqueado', value: 'B' },
        { label: 'En Desarrollo', value: 'D' }
      ]
    },
    SW_API: {
      label: 'Habilitar API',
      required: true,
      options: [
        { label: 'Habilitado', value: 1 },
        { label: 'Deshabilitado', value: 0 }
      ]
    },
    RUTA: {
      label: 'Ruta de la API',
      placeholder: 'Ej: adminUsr',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    API_NAME: {
      label: 'Nombre de la API',
      placeholder: 'Ej: rol',
      required: true,
      minLength: 2,
      maxLength: 50
    },
    METODO: {
      label: 'Método HTTP',
      required: true,
      options: [
        { label: 'GET - Consulta', value: 'GET' },
        { label: 'POST - Crear/Insertar', value: 'POST' },
        { label: 'PUT - Actualizar Completo', value: 'PUT' },
        { label: 'PATCH - Actualizar Parcial', value: 'PATCH' },
        { label: 'DELETE - Eliminar', value: 'DELETE' }
      ]
    },
    KEY_ID: {
      label: 'ID de Clave',
      placeholder: 'Ej: id_rol',
      required: true,
      minLength: 2,
      maxLength: 50
    }
  },
  
  // Validaciones
  VALIDATIONS: {
    NOMBRE: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9_]{2,100}$/
    },
    DB: {
      required: true
    },
    PARAMS: {
      required: true,
      pattern: /^\[.*\]$/, // Debe ser un array JSON
      customValidator: 'jsonValidator'
    },
    ESTADO: {
      required: true,
      pattern: /^[AISBD]$/
    },
    SW_API: {
      required: true,
      pattern: /^[01]$/
    },
    RUTA: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\/_-]{2,100}$/
    },
    API_NAME: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]{2,50}$/
    },
    METODO: {
      required: true,
      pattern: /^(GET|POST|PUT|PATCH|DELETE)$/
    },
    KEY_ID: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_]{2,50}$/
    }
  }
};

/**
 * Mensajes de operación
 */
export const SPCONFIG_MESSAGES = {
  SUCCESS: {
    CREATED: 'Stored Procedure configurado exitosamente',
    UPDATED: 'Configuración de SP actualizada exitosamente',
    DELETED: 'Configuración de SP eliminada exitosamente',
    QUERY_SUCCESS: 'Consulta de SPs exitosa',
    GENERATED_CONTROLLER: 'Controlador generado exitosamente'
  },
  ERROR: {
    CREATE_FAILED: 'Error al configurar el Stored Procedure',
    UPDATE_FAILED: 'Error al actualizar la configuración del SP',
    DELETE_FAILED: 'Error al eliminar la configuración del SP',
    QUERY_FAILED: 'Error al consultar los SPs',
    INVALID_OPERATION: 'Operación no válida',
    DUPLICATE_ENTRY: 'Ya existe un SP con ese nombre',
    INVALID_JSON: 'Los parámetros no son un JSON válido',
    GENERATION_FAILED: 'Error al generar el controlador'
  },
  CONFIRM: {
    DELETE: '¿Está seguro de que desea eliminar esta configuración de SP?',
    UPDATE: '¿Está seguro de que desea actualizar esta configuración?',
    GENERATE_CONTROLLER: '¿Está seguro de que desea generar el controlador para este SP?'
  }
};

/**
 * Plantillas de parámetros comunes
 */
export const SPCONFIG_PARAM_TEMPLATES = {
  // Parámetro JSON estándar
  JSON_PARAM: {
    ParamName: '@JSON',
    ParamType: 'nvarchar',
    MaxLength: -1,
    IsOutput: false,
    IsNullable: true
  },
  
  // Parámetro de ID
  ID_PARAM: {
    ParamName: '@ID',
    ParamType: 'int',
    MaxLength: 4,
    IsOutput: false,
    IsNullable: false
  },
  
  // Parámetro de estado
  ESTADO_PARAM: {
    ParamName: '@ESTADO',
    ParamType: 'varchar',
    MaxLength: 1,
    IsOutput: false,
    IsNullable: true
  },
  
  // Parámetro de fecha
  FECHA_PARAM: {
    ParamName: '@FECHA',
    ParamType: 'datetime',
    MaxLength: 8,
    IsOutput: false,
    IsNullable: true
  }
};

/**
 * Configuración para generación de controladores
 */
export const SPCONFIG_CONTROLLER_CONFIG = {
  // Plantillas de controlador por tipo de base de datos
  TEMPLATES: {
    'ec': 'ec-controller-template',
    'sqlserver': 'sqlserver-controller-template',
    'mysql': 'mysql-controller-template',
    'postgresql': 'postgresql-controller-template',
    'oracle': 'oracle-controller-template'
  },
  
  // Configuración de rutas por defecto
  DEFAULT_ROUTES: {
    'adminUsr': '/admin/usuarios',
    'adminRol': '/admin/roles',
    'adminMenu': '/admin/menu',
    'system': '/system',
    'reports': '/reports'
  },
  
  // Configuración de métodos por defecto
  DEFAULT_METHODS: {
    'SELECT': 'GET',
    'INSERT': 'POST',
    'UPDATE': 'PUT',
    'DELETE': 'DELETE',
    'EXECUTE': 'POST'
  }
};
