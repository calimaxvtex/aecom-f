/**
 * Interfaces para el módulo de Banner (Contenido de Páginas)
 * Servicio hijo dependiente de Componentes (CompService)
 */

// ========== INTERFACES PRINCIPALES ==========

/**
 * Banner - Elemento principal de contenido
 */
export interface Banner {
    id_mb: number;
    nombre: string;                    // Nombre del banner
    id_comp: number;
    id_coll?: number | null;
    tipo_call: string;
    call?: string | null;
    sucursales?: number[] | null;      // Array de IDs de sucursales
    swsched: number;
    fecha_ini: string;
    fecha_fin: string;
    url_banner?: string | null;
    url_banner_m?: string | null;
    url_banner_call?: string | null;
    orden: number;
    swEnable: number;
    swslug: number;
    slug: string;
    usr_a: string;
    usr_m?: string | null;
    fecha_a: string;
    fecha_m?: string | null;

    // Propiedades relacionadas del componente (join)
    componente_clave?: string;
    componente_nombre?: string;
    componente_tipo?: number;
    componente_canal?: number;
}

/**
 * Banner para creación (sin campos autogenerados)
 */
export interface CreateBannerRequest {
    nombre: string;                   // Nombre del banner (requerido)
    id_comp: number;
    id_coll?: number | null;
    tipo_call: string;
    call?: string | null;
    sucursales?: number[] | null;     // Array de IDs de sucursales
    swsched: number;
    fecha_ini: string;
    fecha_fin: string;
    url_banner?: string | null;
    url_banner_m?: string | null;
    url_banner_call?: string | null;
    orden: number;
    swEnable: number;
    swslug: number;
    slug: string;
}

/**
 * Banner para actualización
 */
export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {
    id_mb: number;
}

// ========== INTERFACES DE RESPUESTA ==========

/**
 * Respuesta para lista de banners
 */
export interface BannerResponse {
    statuscode: number;
    mensaje: string;
    data: Banner[];
}

/**
 * Respuesta para banner individual
 */
export interface BannerSingleResponse {
    statuscode: number;
    mensaje: string;
    data: Banner | null;
}

/**
 * Respuesta para estadísticas de banners
 */
export interface BannerStatsResponse {
    statuscode: number;
    mensaje: string;
    data: BannerStats;
}

/**
 * Estadísticas de banners
 */
export interface BannerStats {
    total: number;
    activos: number;
    programados: number;
    expirados: number;
    por_componente: Array<{
        id_comp: number;
        componente: string;
        total: number;
        activos: number;
    }>;
}

// ========== INTERFACES DE FILTROS Y PARÁMETROS ==========

/**
 * Parámetros de paginación para banners
 */
export interface BannerPaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: BannerFilters;
}

/**
 * Filtros disponibles para banners
 */
export interface BannerFilters {
    id_comp?: number;
    id_coll?: number;
    tipo_call?: 'LINK' | 'BUTTON' | 'NONE';
    swsched?: number;
    swEnable?: number;
    fecha_ini_desde?: string;
    fecha_ini_hasta?: string;
    fecha_fin_desde?: string;
    fecha_fin_hasta?: string;
    componente_clave?: string;
}

/**
 * Filtros avanzados para banners
 */
export interface BannerAdvancedFilters extends BannerFilters {
    search?: string; // búsqueda en texto libre
    estado?: 'activo' | 'programado' | 'expirado' | 'inactivo';
    orden_min?: number;
    orden_max?: number;
}

// ========== INTERFACES DE RESPUESTA RAW (BACKEND) ==========

/**
 * Respuesta cruda del backend (array)
 */
export interface BannerRawArrayResponse extends Array<BannerRawResponseItem> { }

/**
 * Item individual de respuesta cruda
 */
export interface BannerRawResponseItem {
    statuscode: number;
    mensaje: string;
    data: Banner[];
    executionId?: string;
    procedureName?: string;
}

// ========== TIPOS ADICIONALES ==========

/**
 * Tipo de llamada a acción
 */
export type TipoCall = 'LINK' | 'BUTTON' | 'NONE';

/**
 * Estados de banner
 */
export type EstadoBanner = 'activo' | 'programado' | 'expirado' | 'inactivo';

/**
 * Banner con información de componente
 */
export interface BannerConComponente extends Banner {
    componente_clave: string;
    componente_nombre: string;
    componente_tipo: number;
    componente_canal: number;
}

// ========== CONSTANTES ==========

/**
 * Constantes para tipos de llamada
 */
export const TIPO_CALL = {
    LINK: 'LINK',
    BUTTON: 'BUTTON',
    NONE: 'NONE'
} as const;

/**
 * Constantes para estados
 */
export const ESTADO_BANNER = {
    ACTIVO: 'activo',
    PROGRAMADO: 'programado',
    EXPIRADO: 'expirado',
    INACTIVO: 'inactivo'
} as const;

/**
 * Valores por defecto
 */
export const BANNER_DEFAULTS = {
    TIPO_CALL: 'NONE' as TipoCall,
    SWSCHED: 0,
    SWENABLE: 1,
    SWSLUG: 0,
    SLUG: '',
    ORDEN: 1
} as const;
