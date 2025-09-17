// Interfaces para el módulo de Conexiones API (APICONN)
// Sistema para gestión de conexiones a servicios externos (REDIS, MEILI, GS1, etc.)

import { Observable } from 'rxjs';

export interface ApiConnItem {
    id: number;
    nombre: string;
    env: string;
    tipo: 'Cache' | 'Search' | 'GS1' | 'API' | 'Database' | string;
    host?: string;
    puerto?: number;
    url?: string;
    usuario?: string;
    password?: string;
    api_key?: string;
    opciones?: string;
    activo: number;
    fecha_a: string; // ISO date string
    fecha_m: string; // ISO date string
    usr_a: string;
    usr_m: string;
}

// Respuesta cruda del backend (data como array directo)
export interface ApiConnRawResponse {
    statuscode: number;
    mensaje: string;
    data: ApiConnItem[]; // ← El backend devuelve data como array directo
}

// Respuesta procesada (data siempre como array)
export interface ApiConnResponse {
    statuscode: number;
    mensaje: string;
    data: ApiConnItem[];
}

// Array de respuestas del backend
export interface ApiConnRawArrayResponse extends Array<ApiConnRawResponse> {}
export interface ApiConnArrayResponse extends Array<ApiConnResponse> {}

// Respuesta individual (para un solo registro)
export interface ApiConnSingleResponse {
    statuscode: number;
    mensaje: string;
    data: ApiConnItem;
}

// Interfaces para operaciones CRUD
export interface CreateApiConnRequest {
    nombre: string;
    env: string;
    tipo: string;
    host?: string;
    puerto?: number;
    url?: string;
    usuario?: string;
    password?: string;
    api_key?: string;
    opciones?: string;
    activo: number;
}

export interface UpdateApiConnRequest extends CreateApiConnRequest {
    id: number;
}

// Interfaces para formularios
export interface ApiConnForm {
    nombre: string;
    env: string;
    tipo: string;
    host?: string;
    puerto?: number;
    url?: string;
    usuario?: string;
    password?: string;
    api_key?: string;
    opciones?: string;
    activo: boolean;
}

// Interfaces para filtros y paginación
export interface ApiConnFilters {
    nombre?: string;
    env?: string;
    tipo?: string;
    host?: string;
    activo?: number;
}

export interface ApiConnPaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: ApiConnFilters;
}

// Interfaces para tipos de conexión
export interface ApiConnType {
    value: string;
    label: string;
    description: string;
}

// Interfaces para entornos
export interface ApiConnEnvironment {
    value: string;
    label: string;
}

// Constantes para tipos y entornos
export const APICONN_TYPES: ApiConnType[] = [
    { value: 'Cache', label: 'Cache', description: 'Sistema de cache (Redis, Memcached)' },
    { value: 'Search', label: 'Search', description: 'Motor de búsqueda (MeiliSearch, Elasticsearch)' },
    { value: 'GS1', label: 'GS1', description: 'Sistema GS1 para códigos de barras' },
    { value: 'API', label: 'API', description: 'API REST genérica' },
    { value: 'Database', label: 'Database', description: 'Base de datos externa' },
    { value: 'Queue', label: 'Queue', description: 'Sistema de colas (RabbitMQ, Kafka)' },
    { value: 'Storage', label: 'Storage', description: 'Almacenamiento (S3, MinIO)' },
    { value: 'Email', label: 'Email', description: 'Servicio de email (SMTP, SendGrid)' },
    { value: 'SMS', label: 'SMS', description: 'Servicio de SMS' },
    { value: 'Payment', label: 'Payment', description: 'Pasarela de pagos' },
    { value: 'Auth', label: 'Auth', description: 'Sistema de autenticación' }
];

export const APICONN_ENVIRONMENTS: ApiConnEnvironment[] = [
    { value: 'dev', label: 'Desarrollo' },
    { value: 'staging', label: 'Pruebas' },
    { value: 'prod', label: 'Producción' }
];

// Interfaces para estadísticas y métricas
export interface ApiConnStats {
    total: number;
    active: number;
    by_type: { [key: string]: number };
    by_env: { [key: string]: number };
}

// Interfaces para validaciones
export interface ApiConnValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// Interfaces para configuración avanzada
export interface ApiConnAdvancedOptions {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    ssl?: boolean;
    sslVerify?: boolean;
    compression?: boolean;
    keepAlive?: boolean;
    poolSize?: number;
    connectionTimeout?: number;
    requestTimeout?: number;
}

// Interfaces para testing de conexiones
export interface ApiConnTestResult {
    success: boolean;
    message: string;
    responseTime?: number;
    errorDetails?: any;
}

// Interfaces para logs de conexión
export interface ApiConnLog {
    id: number;
    id_conn: number;
    operation: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    response_time?: number;
    created_at: string;
}
