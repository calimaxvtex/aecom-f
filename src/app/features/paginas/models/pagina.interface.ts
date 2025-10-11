/**
 * Interfaces para el módulo de Páginas (Contenido de Páginas)
 * Servicio para gestión de páginas web/móviles
 */

// ========== INTERFACES PRINCIPALES ==========

/**
 * Página - Elemento principal de contenido
 */
export interface Pagina {
    id_pag: number;
    nombre: string;                   // Nombre de la página
    canal: string;                    // Canal: 'WEB' | 'APP'
    estado: number;                   // Estado: 1 (Activo) | 0 (Inactivo)
    fecha_a: string;                  // Fecha de creación
    fecha_m: string;                  // Fecha de modificación
    usu_a: string;                    // Usuario que creó
    usu_m: string;                    // Usuario que modificó
    componentes: number;              // Número de componentes asociados
}

/**
 * Página para creación (sin campos autogenerados)
 */
export interface CreatePaginaRequest {
    nombre: string;                   // Nombre de la página (requerido)
}

/**
 * Página para actualización
 */
export interface UpdatePaginaRequest extends Partial<CreatePaginaRequest> {
    id_pag: number;                   // ID de la página a actualizar (requerido)
    estado?: number;                  // Estado de la página: 1 (activo) | 0 (inactivo)
}

/**
 * Página para eliminación (marcar como baja)
 */
export interface DeletePaginaRequest {
    id_pag: number;                   // ID de la página a eliminar (requerido)
    id_pagd: number;                  // ID adicional requerido para eliminación
}

// ========== INTERFACES DE RESPUESTA ==========

/**
 * Respuesta para lista de páginas
 */
export interface PaginaResponse {
    statuscode: number;
    mensaje: string;
    data: Pagina[];
}

/**
 * Respuesta para página individual
 */
export interface PaginaSingleResponse {
    statuscode: number;
    mensaje: string;
    data: Pagina | null;
}

// ========== INTERFACES DE FILTROS Y PARÁMETROS ==========

/**
 * Parámetros de consulta para páginas
 */
export interface PaginaQueryParams {
    canal?: 'WEB' | 'APP';
    estado?: 1 | 0;
    search?: string; // búsqueda por nombre
}

/**
 * Filtros disponibles para páginas
 */
export interface PaginaFilters extends PaginaQueryParams {
    fecha_desde?: string;
    fecha_hasta?: string;
}

// ========== TIPOS ADICIONALES ==========

/**
 * Tipo de canal
 */
export type TipoCanal = 'WEB' | 'APP';

/**
 * Estado de página
 */
export type EstadoPagina = 1 | 0;

/**
 * Estadísticas de páginas
 */
export interface PaginaStats {
    total: number;
    activas: number;
    bajas: number;
    por_canal: {
        WEB: number;
        MOBILE: number;
    };
}

// ========== CONSTANTES ==========

/**
 * Constantes para tipos de canal
 */
export const TIPO_CANAL = {
    WEB: 'WEB',
    APP: 'APP'
} as const;

/**
 * Constantes para estados
 */
export const ESTADO_PAGINA = {
    ACTIVO: 1,
    INACTIVO: 0
} as const;

/**
 * Valores por defecto
 */
export const PAGINA_DEFAULTS = {
    CANAL: 'WEB' as TipoCanal,
    ESTADO: 1 as EstadoPagina
} as const;
