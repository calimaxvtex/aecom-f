// Interfaces para el módulo de Componentes de Página y App (COMP)
// Sistema para gestión de componentes reutilizables

import { Observable } from 'rxjs';

export interface Componente {
    id_comp: number;
    clave: string;
    nombre: string;
    descripcion: string;
    canal: number;
    tipo_comp: number;
    isUnico: number; // 0: múltiple, 1: único
    tiempo: number; // tiempo en ms para carruseles/autoplay
    visibles: number; // número de elementos visibles
    swEnable: number; // 0: deshabilitado, 1: habilitado
    usr_a: string;
    usr_m: string | null;
    fecha_a: string; // ISO date string
    fecha_m: string; // ISO date string
}

// Respuesta cruda del backend (data como array directo)
export interface ComponenteRawResponse {
    statuscode: number;
    mensaje: string;
    data: Componente[]; // ← El backend devuelve data como array directo
}

// Respuesta procesada (data siempre como array)
export interface ComponenteResponse {
    statuscode: number;
    mensaje: string;
    data: Componente[];
}

// Array de respuestas del backend
export interface ComponenteRawArrayResponse extends Array<ComponenteRawResponse> {}
export interface ComponenteArrayResponse extends Array<ComponenteResponse> {}

// Respuesta individual (para un solo registro)
export interface ComponenteSingleResponse {
    statuscode: number;
    mensaje: string;
    data: Componente;
}

// Interfaces para operaciones CRUD
export interface CreateComponenteRequest {
    clave: string;
    nombre: string;
    descripcion: string;
    canal: number;
    tipo_comp: number;
    isUnico?: number; // opcional, default 0
    tiempo?: number; // opcional, default 5000
    visibles?: number; // opcional, default 5
    swEnable?: number; // opcional, default 1
}

export interface UpdateComponenteRequest extends Partial<CreateComponenteRequest> {
    id_comp: number;
}

// Interfaces para filtros y búsqueda
export interface ComponenteFilters {
    clave?: string;
    nombre?: string;
    descripcion?: string;
    canal?: number;
    tipo_comp?: number;
    isUnico?: number;
    swEnable?: number;
    usr_a?: string;
    usr_m?: string;
}

export interface ComponentePaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: ComponenteFilters;
}

// ==========================================
// Interfaces adicionales para configuración
// ==========================================

// Tipos de componentes disponibles
export interface TipoComponente {
    id: number;
    nombre: string;
    descripcion: string;
    icono?: string;
}

// Canales disponibles
export interface Canal {
    id: number;
    nombre: string;
    descripcion: string;
    plataforma: string; // web, mobile, desktop
}

// Configuración de componente
export interface ComponenteConfig {
    id_comp: number;
    config_json: string; // JSON string con configuración específica
    ultima_modificacion: string;
}

// Respuesta para tipos de componentes
export interface TiposComponenteResponse {
    statuscode: number;
    mensaje: string;
    data: TipoComponente[];
}

// Respuesta para canales
export interface CanalesResponse {
    statuscode: number;
    mensaje: string;
    data: Canal[];
}

// ==========================================
// Interfaces para operaciones avanzadas
// ==========================================

// Filtros avanzados
export interface ComponenteAdvancedFilters extends ComponenteFilters {
    fecha_desde?: string; // ISO date
    fecha_hasta?: string; // ISO date
    creador?: string;
    modificador?: string;
}

// Estadísticas de componentes
export interface ComponenteStats {
    total_componentes: number;
    componentes_activos: number;
    componentes_por_tipo: { [tipo: number]: number };
    componentes_por_canal: { [canal: number]: number };
    componentes_creados_hoy: number;
    componentes_modificados_hoy: number;
}

// Respuesta de estadísticas
export interface ComponenteStatsResponse {
    statuscode: number;
    mensaje: string;
    data: ComponenteStats;
}

// ==========================================
// Interfaces para validación y configuración
// ==========================================

// Reglas de validación por tipo de componente
export interface ValidacionTipoComponente {
    tipo_comp: number;
    campos_requeridos: string[];
    campos_opcionales: string[];
    validaciones: {
        campo: string;
        regla: string;
        mensaje_error: string;
    }[];
}

// Configuración por defecto para nuevos componentes
export interface ComponenteDefaultConfig {
    tipo_comp: number;
    valores_default: {
        [campo: string]: any;
    };
}

// Export types for convenience
export type ComponenteCreate = Omit<Componente, 'id_comp' | 'usr_a' | 'usr_m' | 'fecha_a' | 'fecha_m'>;
export type ComponenteUpdate = Partial<ComponenteCreate> & { id_comp: number };
