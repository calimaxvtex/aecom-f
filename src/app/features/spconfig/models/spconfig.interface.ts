/**
 * Interfaces para el servicio de configuración de Stored Procedures
 * Basado en la estructura de datos de la API: /api/spconfig/v1/{id}
 */

export interface SPConfig {
  id_sp: number;
  nombre: string;
  db: string;
  params: string; // JSON string con parámetros
  estado: string;
  swApi: number;
  ruta: string;
  apiName: string;
  metodo: string;
  keyId: string;
  fecha_m: string;
}

/**
 * Respuesta estándar de la API para SPConfig
 * Patrón común para todos los servicios
 */
export interface SPConfigApiResponse {
  statusCode: number;
  mensaje: string;
  data: SPConfig[];
}

/**
 * Interfaz para formularios de creación/edición de SPConfig
 * Campos editables por el usuario
 */
export interface SPConfigForm {
  id_sp?: number;
  nombre: string;
  db: string;
  params: string;
  estado: string;
  swApi: number;
  ruta: string;
  apiName: string;
  metodo: string;
  keyId: string;
  fecha_m?: string;
}

/**
 * Acciones disponibles para el método POST utilitario
 */
export type SPConfigAction = 'SL' | 'UP' | 'IN' | 'DL';

/**
 * Parámetros para operaciones con acción específica
 */
export interface SPConfigActionParams {
  action: SPConfigAction;
  data?: Partial<SPConfigForm>;
  id?: number;
}

/**
 * Filtros para búsqueda de SPConfig
 */
export interface SPConfigFilters {
  nombre?: string;
  db?: string;
  estado?: string;
  swApi?: number;
  ruta?: string;
  apiName?: string;
  metodo?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/**
 * Opciones de paginación para SPConfig
 */
export interface SPConfigPagination {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Consulta específica para SPConfig
 */
export interface SPConfigQuery {
  id_sp?: number;    // Para consultar un SP específico
  nombre?: string;   // Para consultar por nombre
  db?: string;       // Para consultar por base de datos
}

/**
 * Estructura de parámetros de Stored Procedure
 */
export interface SPParam {
  ParamName: string;
  ParamType: string;
  MaxLength: number;
  IsOutput: boolean;
  DefaultValue?: string;
  IsNullable?: boolean;
}

/**
 * Estructura para configuración de API
 */
export interface APIConfig {
  ruta: string;
  apiName: string;
  metodo: string;
  keyId: string;
  swApi: number;
}

/**
 * Estructura para generación de controladores
 */
export interface ControllerConfig {
  spName: string;
  dbName: string;
  apiConfig: APIConfig;
  parameters: SPParam[];
  estado: string;
}

/**
 * Estados disponibles para SPs
 */
export interface SPEstados {
  ACTIVO: 'A';
  INACTIVO: 'I';
  SUSPENDIDO: 'S';
  BLOQUEADO: 'B';
  EN_DESARROLLO: 'D';
}

/**
 * Tipos de base de datos soportados
 */
export interface DatabaseTypes {
  EC: 'ec';
  SQLSERVER: 'sqlserver';
  MYSQL: 'mysql';
  POSTGRESQL: 'postgresql';
  ORACLE: 'oracle';
}

/**
 * Métodos HTTP soportados
 */
export interface HTTPMethods {
  GET: 'GET';
  POST: 'POST';
  PUT: 'PUT';
  PATCH: 'PATCH';
  DELETE: 'DELETE';
}
