/**
 * Constantes para el servicio de relación rol-usuario
 */

export const ROL_USUARIO_API_CONFIG = {
  // Endpoints
  ENDPOINTS: {
    ROL_USUARIO: '/api/admrolu/v1'
  },
  
  // URL base por defecto
  DEFAULT_BASE_URL: 'http://localhost:3000',
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // Estados de relación
  ESTADOS: {
    ACTIVO: 'A',
    INACTIVO: 'I',
    SUSPENDIDO: 'S',
    BLOQUEADO: 'B'
  },
  
  // Estados de relación con etiquetas legibles
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
    MAX_ROLES_POR_USUARIO: 10,
    MAX_USUARIOS_POR_ROL: 100
  },
  
  // Mensajes de validación
  VALIDATION_MESSAGES: {
    REQUIRED_FIELDS: 'Los campos marcados con * son obligatorios',
    INVALID_ID_USU: 'El ID del usuario debe ser mayor a 0',
    INVALID_ID_ROL: 'El ID del rol debe ser mayor a 0',
    INVALID_ESTADO: 'El estado seleccionado no es válido',
    DUPLICATE_ROL_USUARIO: 'El usuario ya tiene asignado este rol',
    MAX_ROLES_EXCEEDED: 'El usuario ya tiene el máximo de roles permitidos',
    MAX_USUARIOS_EXCEEDED: 'El rol ya tiene el máximo de usuarios permitidos'
  },
  
  // Patrones de validación
  PATTERNS: {
    ID_POSITIVO: /^[1-9]\d*$/,
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
 * Configuración de la tabla de relaciones rol-usuario
 */
export const ROL_USUARIO_TABLE_CONFIG = {
  // Columnas de la tabla
  COLUMNS: [
    { field: 'id', header: 'ID', sortable: true, width: '80px' },
    { field: 'id_usu', header: 'ID Usuario', sortable: true, width: '100px' },
    { field: 'nombre_usuario', header: 'Nombre Usuario', sortable: true, width: '200px' },
    { field: 'email_usuario', header: 'Email Usuario', sortable: true, width: '250px' },
    { field: 'id_rol', header: 'ID Rol', sortable: true, width: '80px' },
    { field: 'nombre_rol', header: 'Nombre Rol', sortable: true, width: '200px' },
    { field: 'estado', header: 'Estado', sortable: true, width: '120px' },
    { field: 'usu_m', header: 'Modificado Por', sortable: true, width: '150px' },
    { field: 'fecha_m', header: 'Fecha Modificación', sortable: true, width: '150px' },
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
    USUARIO_FILTER: true,
    ROL_FILTER: true
  }
};

/**
 * Configuración de formularios de relación rol-usuario
 */
export const ROL_USUARIO_FORM_CONFIG = {
  // Campos del formulario
  FIELDS: {
    ID_USU: {
      label: 'ID del Usuario',
      placeholder: 'Seleccione el usuario',
      required: true,
      min: 1
    },
    ID_ROL: {
      label: 'ID del Rol',
      placeholder: 'Seleccione el rol',
      required: true,
      min: 1
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
    ID_USU: {
      required: true,
      min: 1,
      pattern: /^[1-9]\d*$/
    },
    ID_ROL: {
      required: true,
      min: 1,
      pattern: /^[1-9]\d*$/
    },
    ESTADO: {
      required: true,
      pattern: /^[AISB]$/
    }
  }
};

/**
 * Mensajes de operación
 */
export const ROL_USUARIO_MESSAGES = {
  SUCCESS: {
    CREATED: 'Rol asignado al usuario exitosamente',
    UPDATED: 'Relación rol-usuario actualizada exitosamente',
    DELETED: 'Rol removido del usuario exitosamente',
    QUERY_SUCCESS: 'Consulta de relaciones rol-usuario exitosa',
    ROL_ASIGNED: 'Rol asignado correctamente',
    ROL_REMOVED: 'Rol removido correctamente'
  },
  ERROR: {
    CREATE_FAILED: 'Error al asignar el rol al usuario',
    UPDATE_FAILED: 'Error al actualizar la relación rol-usuario',
    DELETE_FAILED: 'Error al remover el rol del usuario',
    QUERY_FAILED: 'Error al consultar las relaciones rol-usuario',
    INVALID_OPERATION: 'Operación no válida',
    DUPLICATE_ENTRY: 'El usuario ya tiene asignado este rol',
    MAX_ROLES_EXCEEDED: 'El usuario ya tiene el máximo de roles permitidos',
    MAX_USUARIOS_EXCEEDED: 'El rol ya tiene el máximo de usuarios permitidos'
  },
  CONFIRM: {
    DELETE: '¿Está seguro de que desea remover este rol del usuario?',
    UPDATE: '¿Está seguro de que desea actualizar esta relación rol-usuario?',
    ASSIGN_ROLE: '¿Está seguro de que desea asignar este rol al usuario?',
    REMOVE_ROLE: '¿Está seguro de que desea remover este rol del usuario?'
  }
};

/**
 * Configuración de permisos y roles
 */
export const ROL_USUARIO_PERMISSIONS = {
  // Permisos por tipo de usuario
  PERMISSIONS: {
    'Super Administrador': [
      'usuarios:asignar_roles',
      'usuarios:remover_roles',
      'usuarios:ver_todos',
      'roles:asignar_usuarios',
      'roles:remover_usuarios',
      'roles:ver_todos'
    ],
    'Administrador': [
      'usuarios:asignar_roles',
      'usuarios:remover_roles',
      'usuarios:ver_limite',
      'roles:asignar_usuarios',
      'roles:ver_limite'
    ],
    'Usuario': [
      'usuarios:ver_propio',
      'roles:ver_propio'
    ]
  },
  
  // Límites por tipo de usuario
  LIMITS: {
    'Super Administrador': {
      max_roles_por_usuario: 10,
      max_usuarios_por_rol: 100
    },
    'Administrador': {
      max_roles_por_usuario: 5,
      max_usuarios_por_rol: 50
    },
    'Usuario': {
      max_roles_por_usuario: 1,
      max_usuarios_por_rol: 0
    }
  }
};
