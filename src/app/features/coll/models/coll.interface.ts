// Interfaces para el módulo de Colecciones (COLL)

export interface CollItem {
    id_coll: number;
    nombre: string;
    descripcion: string;
    products: number;
    swtag: number;
    swsrc: number;
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

export interface CollResponse {
    statuscode: number;
    mensaje: string;
    data: CollItem[];
}

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

export interface ColldResponse {
    statuscode: number;
    mensaje: string;
    data: ColldItem[];
}

export interface ColldArrayResponse extends Array<ColldResponse> {}

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
