// Interfaces para el módulo de Detalles de Conceptos (CATCONCEPTOSDET)
// Sistema de detalles relacionados con conceptos por clave

import { Observable } from 'rxjs';

export interface CatConceptoDet {
    clave: string;           // FK a catconceptos.clave (string)
    concepto: number;        // Consecutivo automático del detalle dentro de la clave
    descripcion: string;     // Descripción específica del detalle
    folio: number;
    valor1: number;
    valorcadena1: string;    // Campo existente para valor de cadena
    swestado: number;
    nombre_concepto?: string; // Campo adicional del JOIN (opcional)
}

// Respuesta cruda del backend (data como array directo)
export interface CatConceptoDetRawResponse {
    statuscode: number;
    mensaje: string;
    data: CatConceptoDet[]; // ← El backend devuelve data como array directo
}

// Respuesta procesada (data siempre como array)
export interface CatConceptoDetResponse {
    statuscode: number;
    mensaje: string;
    data: CatConceptoDet[];
}

// Array de respuestas del backend
export interface CatConceptoDetRawArrayResponse extends Array<CatConceptoDetRawResponse> {}
export interface CatConceptoDetArrayResponse extends Array<CatConceptoDetResponse> {}

// Respuesta individual (para un solo registro)
export interface CatConceptoDetSingleResponse {
    statuscode: number;
    mensaje: string;
    data: CatConceptoDet;
}

// Interfaces para operaciones CRUD
export interface CreateCatConceptoDetRequest {
    clave: string;           // Obligatorio - FK a catconceptos.clave
    descripcion: string;     // Obligatorio
    folio?: number;          // Opcional, default 0
    valor1?: number;         // Opcional, default 0
    valorcadena1?: string;   // Campo existente para valor de cadena
    swestado?: number;       // Opcional, default 1
    // NOTA: 'concepto' se asigna automáticamente en backend
}

export interface UpdateCatConceptoDetRequest {
    clave: string;           // Parte de PK compuesta
    concepto: number;        // Parte de PK compuesta (consecutivo actual)
    descripcion?: string;    // Campos a actualizar
    folio?: number;
    valor1?: number;
    valorcadena1?: string;   // Campo existente para valor de cadena
    swestado?: number;
}

// Interface para consulta unificada (método único POST)
export interface CatConceptoDetQueryParams {
    clave?: string;          // Filtrar por clave padre
    concepto?: number;       // Filtrar por consecutivo específico
    descripcion?: string;    // Filtrar por descripción
    swestado?: number;       // Filtrar por estado
    valor1?: number;         // Filtrar por valor numérico
    valorcadena1?: string;   // Filtrar por valor de cadena
    folio?: number;          // Filtrar por folio
    page?: number;           // Paginación
    limit?: number;
    sort?: string;           // Ordenamiento
    order?: 'asc' | 'desc';
}

// Interface para respuesta de eliminación
export interface DeleteCatConceptoDetRequest {
    clave: string;           // Parte de PK
    concepto: number;        // Parte de PK
}

// ==========================================
// Interfaces para sistema de detalles extendido
// ==========================================

// Configuración para un tipo específico de detalle
export interface CatConceptoDetConfig {
    clavePadre: string;      // Clave del concepto padre
    tipoDetalle: string;     // Tipo de detalle (ciudades, estados, etc.)
    camposRequeridos: string[]; // Campos obligatorios para este tipo
    valoresDefault: Partial<CatConceptoDet>; // Valores por defecto
}

// Servicio para gestión de detalles de conceptos
export interface ICatConceptoDetService {
    // Método unificado de consulta
    queryDetalles(params: CatConceptoDetQueryParams): Observable<CatConceptoDetResponse>;

    // CRUD básico
    createDetalle(detalle: CreateCatConceptoDetRequest): Observable<CatConceptoDetSingleResponse>;
    updateDetalle(detalle: UpdateCatConceptoDetRequest): Observable<CatConceptoDetSingleResponse>;
    deleteDetalle(clave: string, concepto: number): Observable<CatConceptoDetSingleResponse>;

    // Utilidades
    getMaxConceptoByClave(clave: string): Observable<{maxConcepto: number}>;
    validarClavePadre(clave: string): Observable<boolean>;
}
