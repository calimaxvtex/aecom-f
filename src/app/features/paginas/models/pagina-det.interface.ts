/**
 * Interfaces para el módulo de Detalles de Páginas (Componentes Asociados)
 * Servicio para gestión de componentes asociados a páginas
 */

// ========== INTERFACES PRINCIPALES ==========

/**
 * Detalle de Página - Asociación entre página y componente
 */
export interface PaginaDet {
    id_pagd: number;                  // ID del detalle de página (asociación)
    id_pag: number;                   // ID de la página
    orden: number;                    // Orden del componente en la página
    tipo_comp: string;                // Tipo de componente (carrusel, banner, etc.)
    id_ref: number;                   // ID del componente referenciado
    nomPagina: string;                // Nombre de la página
    canal: string;                    // Canal de la página (WEB/APP)
    nombre_ref: string;               // Nombre del componente referenciado
    // Campos opcionales para gestión
    estado?: number;                  // Estado: 1 (Activo) | 0 (Inactivo)
    fecha_a?: string;                 // Fecha de creación
    fecha_m?: string;                 // Fecha de modificación
    usu_a?: string;                   // Usuario que creó
    usu_m?: string;                   // Usuario que modificó
}

/**
 * Detalle de página para creación (asociación página-componente)
 */
export interface CreatePaginaDetRequest {
    id_pag: number;                   // ID de la página (requerido)
    tipo_comp: string;                // Tipo de componente (carrusel, banner, etc.) (requerido)
    id_ref: number;                   // ID del componente referenciado (requerido)
    // orden se calcula automáticamente en el backend
}

/**
 * Detalle de página para actualización
 */
export interface UpdatePaginaDetRequest extends Partial<CreatePaginaDetRequest> {
    id_pagd: number;                  // ID del detalle a actualizar (requerido)
}

/**
 * Detalle de página para eliminación
 */
export interface DeletePaginaDetRequest {
    id_pagd: number;                  // ID del detalle a eliminar (requerido)
}

// ========== INTERFACES DE RESPUESTA ==========

/**
 * Respuesta para lista de detalles de página
 */
export interface PaginaDetResponse {
    statuscode: number;
    mensaje: string;
    data: PaginaDet[];
}

/**
 * Respuesta para detalle de página individual
 */
export interface PaginaDetSingleResponse {
    statuscode: number;
    mensaje: string;
    data: PaginaDet | null;
}

// ========== INTERFACES DE FILTROS Y PARÁMETROS ==========

/**
 * Parámetros de consulta para detalles de página
 */
export interface PaginaDetQueryParams {
    id_pag?: number;                  // Filtrar por página (requerido para obtener componentes asociados)
}

/**
 * Filtros disponibles para detalles de página
 */
export interface PaginaDetFilters extends PaginaDetQueryParams {
    // Futuras extensiones de filtros si son necesarias
}

// ========== TIPOS ADICIONALES ==========

/**
 * Tipo de componente asociado a página
 */
export type TipoComponentePagina =
    | 'carrusel'     // Carrusel de imágenes
    | 'categoria'    // Categorías
    | 'vitrina'      // Vitrina de productos
    | string;        // Otros tipos

/**
 * Canal de la página
 */
export type CanalPagina = 'WEB' | 'APP';

/**
 * Estadísticas de detalles de página
 */
export interface PaginaDetStats {
    total: number;
    porTipo: Record<string, number>;
    porCanal: {
        WEB: number;
        APP: number;
    };
}

// ========== CONSTANTES ==========

/**
 * Constantes para tipos de componente
 */
export const TIPO_COMPONENTE_PAGINA = {
    CARRUSEL: 'carrusel',
    CATEGORIA: 'categoria',
    VITRINA: 'vitrina'
} as const;

/**
 * Constantes para canales
 */
export const CANAL_PAGINA = {
    WEB: 'WEB',
    APP: 'APP'
} as const;

/**
 * Valores por defecto
 */
export const PAGINA_DET_DEFAULTS = {
    ORDEN: 1
} as const;
