export interface CuponItem {
    id: number,
    id_cupon: number,
    codigo: string,
    descripcion: string,
    estado: 'A'| 'B'|'I',
    fecha_ini: string,
    fecha_fin: string,
    id_promo: number,
    limite: number,
    tipo_cupon: 1|2|3,
    importe_minimo: number,
    url_min: string,
    valor_desc: string
}

// Respuesta cruda del backend (data como string JSON o array)
export interface CuponRawResponse {
    statuscode: number;
    mensaje: string;
    data:  CuponItem[]; 
}

// Respuesta procesada (data siempre como array)
export interface CuponResponse {
    statuscode: number;
    mensaje: string;
    data: CuponItem[];
}
export interface CuponRawArrayResponse extends Array<CuponRawResponse> {}
export interface CuponArrayResponse extends Array<CuponResponse> {}

export interface CuponSingleResponse {
    statuscode: number;
    mensaje: string;
    data: CuponItem;
}

// Interfaces para operaciones CRUD
export interface CreateCuponRequest {
    id_cupon: number,
    codigo: string,
    descripcion: string,
    estado: 'A'| 'B'|'I',
    fecha_ini: string,
    fecha_fin: string,
    id_promo: number,
    limite: number,
    tipo_cupon: 1|2|3,
    importe_minimo: number,
    url_min: string,
    valor_desc: string
}

export interface UpdateCuponRequest extends Partial<CreateCuponRequest> {
    id_cupon: number;
}

// Interfaces para filtros y búsqueda
export interface CuponFilters {
    codigo?: string;
    estado?: string;
    id_promo?: number;
    fecha_ini?: string;
    fecha_fin?: string;
}

export interface CuponPaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: CuponFilters;
}


// ==========================================
// Interfaces para Cupones Details (CUPONESD)
// ==========================================

export interface CupondItem{
    NOMBRE: string,
    AP_PATERNO: number,
    AP_MATERNO: number,
    id_cliente: number,
    estado: 'A'| 'B'|'I',
    fecha: string, 
    id_orden: number,
    estado_orden: number
}

// Respuesta cruda del backend (data como string JSON)
export interface CupondRawResponse {
    statuscode: number;
    mensaje: string;
    data: string; // ← El backend devuelve data como string JSON
}

// Respuesta procesada (data como array ya parseado)
export interface CupondResponse {
    statuscode: number;
    mensaje: string;
    data: CupondItem[]; // ← Después del parsing, data es array
}

// Array de respuestas crudas del backend
export interface CupondRawArrayResponse extends Array<
CupondArrayResponse
> {}

// Array de respuestas procesadas
export interface CupondArrayResponse extends Array<
    CupondResponse// 🔹 el back puede mandar string o array
> {}

// Respuesta individual (para un solo registro)
export interface CupondSingleResponse {
    statuscode: number;
    mensaje: string;
    data: CupondItem;
}

// Interfaces para operaciones CRUD de COLLD
export interface CreateCupondRequest {
    id: number,
    id_cupon: number,
    id_cliente: number,
    estado: 'A'| 'B'|'I',
    tipo_cupon: number,
    fecha: string, 
    fecha_aplicacion: string,
    usuario_a: string,
    fecha_m: string,
    id_orden: number,
    estado_orden: number
}

export interface UpdateCupondRequest extends Partial<CreateCupondRequest> {
    id: number;
}

// Interfaces para filtros y búsqueda de COLLD
export interface CupondFilters {
    id?: number;
    idref?: number;
    codigo?: string;
    nombre?: string;
}

export interface CupondPaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: CupondFilters;
}