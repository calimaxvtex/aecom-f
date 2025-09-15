// Interfaces para el módulo de Catálogos de Conceptos (CATCONCEPTOS)
// Sistema genérico para gestión de multi-catálogos

import { Observable } from 'rxjs';

export interface CatConcepto {
    id_c: number;
    clave: string;
    nombre: string;
    swestado: number;
}

// Respuesta cruda del backend (data como array directo)
export interface CatConceptoRawResponse {
    statuscode: number;
    mensaje: string;
    data: CatConcepto[]; // ← El backend devuelve data como array directo
}

// Respuesta procesada (data siempre como array)
export interface CatConceptoResponse {
    statuscode: number;
    mensaje: string;
    data: CatConcepto[];
}

// Array de respuestas del backend
export interface CatConceptoRawArrayResponse extends Array<CatConceptoRawResponse> {}
export interface CatConceptoArrayResponse extends Array<CatConceptoResponse> {}

// Respuesta individual (para un solo registro)
export interface CatConceptoSingleResponse {
    statuscode: number;
    mensaje: string;
    data: CatConcepto;
}

// Interfaces para operaciones CRUD
export interface CreateCatConceptoRequest {
    clave: string;
    nombre: string;
    swestado?: number;
}

export interface UpdateCatConceptoRequest extends Partial<CreateCatConceptoRequest> {
    id_c: number;
}

// Interfaces para filtros y búsqueda
export interface CatConceptoFilters {
    clave?: string;
    nombre?: string;
    swestado?: number;
}

export interface CatConceptoPaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: CatConceptoFilters;
}

// ==========================================
// Interfaces para sistema de multi-catálogos
// ==========================================

// Configuración genérica para cualquier catálogo
export interface CatalogoConfig {
    id: number;           // ID del endpoint en configuración
    nombre: string;       // Nombre del catálogo (conceptos, tipos, etc.)
    descripcion: string;  // Descripción del catálogo
    campos: CatalogoCampo[]; // Campos específicos del catálogo
}

// Campos dinámicos para diferentes catálogos
export interface CatalogoCampo {
    nombre: string;       // Nombre del campo (clave, nombre, swestado, etc.)
    tipo: 'string' | 'number' | 'boolean';
    requerido: boolean;
    longitud?: number;    // Para campos string
    etiqueta: string;     // Etiqueta para mostrar en UI
}

// Respuesta genérica para cualquier catálogo
export interface CatalogoResponse<T = any> {
    statuscode: number;
    mensaje: string;
    data: T[];
}

// Servicio genérico para catálogos (futuro uso)
export interface ICatalogoService<T> {
    getAll(params?: any): Observable<CatalogoResponse<T>>;
    create(item: Partial<T>): Observable<CatalogoResponse<T>>;
    update(item: T): Observable<CatalogoResponse<T>>;
    delete(id: number): Observable<CatalogoResponse<T>>;
}
