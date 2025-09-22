/**
 * Interface para ítem de receta en operaciones CRUD (listado/tabla)
 * Basado en la respuesta del backend /admrcta/v1
 */
export interface RecetaItem {
    id: number; // id de la API
    title: string;
    category: string | null;
    url_mini: string;
    time: string;
    people: number;
    difficulty: string;
    // Campos opcionales para compatibilidad futura
    description?: string;
    ingredients?: string;
    instructions?: string;
    url_banner?: string;
    title_min?: string; // Para el PUT request
    id_coll?: number | null; // ID de colección
    fecha_cre?: string;
    fecha_mod?: string;
    usr_c?: string;
    usr_m?: string;
    createdAt?: string;
    updatedAt?: string;
    date?: string; // Campo date de la base de datos
}

/**
 * Interface para formulario de receta (crear/editar)
 * Basado en la estructura del backend /admrcta/v1
 */
export interface RecetaFormItem {
    id?: number | null; // null para creación, número para edición
    title?: string;
    category?: string | null;
    url_mini?: string;
    time?: string;
    people?: number;
    difficulty?: string;
    // Campos opcionales para compatibilidad futura
    description?: string;
    ingredients?: string;
    instructions?: string;
    url_banner?: string;
    title_min?: string; // Para el PUT request
    id_coll?: number | null; // ID de colección (para creación)
}

/**
 * Response para operaciones que devuelven lista de recetas
 */
export interface RecetaResponse {
    statuscode: number;
    mensaje: string;
    data: RecetaItem[];
}

/**
 * Response para operaciones que devuelven una sola receta
 */
export interface RecetaSingleResponse {
    statuscode: number;
    mensaje: string;
    data: RecetaItem | null;
}
