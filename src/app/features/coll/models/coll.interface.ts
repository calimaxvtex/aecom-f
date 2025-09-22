// Interfaces para el módulo de Colecciones (COLL)

export interface CollItem {
    id_coll: number;
    nombre: string;
    descripcion: string;
    products: number;
    swtag: number;
    tag: string;
    swsrc: number;
    swslug: number;
    slug: string;
    swsched: number;
    estado: string;
    fecha_ini: string;
    fecha_fin: string;
    fecha_mod: string;
    fecha_a: string;
    usr_a: string;
    usr_m: string;
    sw_fijo: number;
    url_banner: string | null;
    id_tipoc: number;
}

// Respuesta cruda del backend (data como string JSON o array)
export interface CollRawResponse {
    statuscode: number;
    mensaje: string;
    data:  CollItem[]; // ← El backend puede devolver string JSON o array directo
}

// Respuesta procesada (data siempre como array)
export interface CollResponse {
    statuscode: number;
    mensaje: string;
    data: CollItem[];
}

export interface CollRawArrayResponse extends Array<CollRawResponse> {}
export interface CollArrayResponse extends Array<CollResponse> {}

export interface CollSingleResponse {
    statuscode: number;
    mensaje: string;
    data: CollItem;
}

// Interfaces para operaciones CRUD
export interface CreateCollRequest {
    nombre: string;
    descripcion: string;
    id_tipoc: number;
    estado?: string;
    fecha_ini?: string;
    fecha_fin?: string;
}

export interface UpdateCollRequest extends Partial<CreateCollRequest> {
    id_coll: number;
}

// Interfaces para filtros y búsqueda
export interface CollFilters {
    nombre?: string;
    estado?: string;
    id_tipoc?: number;
    fecha_ini?: string;
    fecha_fin?: string;
}

export interface CollPaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: CollFilters;
}

// Interfaces para el catálogo de tipos de colecciones
export interface CollTypeItem {
    id_tipoc: number;
    nomTipo: string;
}

export interface CollTypeResponse {
    statuscode: number;
    mensaje: string;
    data: string; // Contiene JSON string que se debe parsear
}

export interface CollTypeArrayResponse extends Array<CollTypeResponse> {}

// Interface para los tipos parseados
export interface ParsedCollTypesResponse {
    statuscode: number;
    mensaje: string;
    data: CollTypeItem[];
}

// ==========================================
// Interfaces para Collection Details (COLLD)
// ==========================================

export interface ColldItem {
    id_colld: number;
    id_coll: number;
    ren: number;
    orden: number;
    idref: number;
    url_img: string;
    nombre: string;
    nomColeccion: string;
    usr: string;
    fecha_m: string;
}

// Respuesta cruda del backend (data como string JSON)
export interface ColldRawResponse {
    statuscode: number;
    mensaje: string;
    data: string; // ← El backend devuelve data como string JSON
}

// Respuesta procesada (data como array ya parseado)
export interface ColldResponse {
    statuscode: number;
    mensaje: string;
    data: ColldItem[]; // ← Después del parsing, data es array
}

// Array de respuestas crudas del backend
export interface ColldRawArrayResponse extends Array<
ColldRawResponse
> {}

// Array de respuestas procesadas
export interface ColldArrayResponse extends Array<
    ColldResponse// 🔹 el back puede mandar string o array
> {}

// Respuesta individual (para un solo registro)
export interface ColldSingleResponse {
    statuscode: number;
    mensaje: string;
    data: ColldItem;
}

// Interfaces para operaciones CRUD de COLLD
export interface CreateColldRequest {
    id_coll: number;
    ren: number;
    orden: number;
    idref: number;
    nombre: string;
}

export interface UpdateColldRequest extends Partial<CreateColldRequest> {
    id_colld: number;
}

// Interfaces para filtros y búsqueda de COLLD
export interface ColldFilters {
    id_coll?: number;
    idref?: number;
    codigo?: string;
    nombre?: string;
}

export interface ColldPaginationParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filters?: ColldFilters;
}
