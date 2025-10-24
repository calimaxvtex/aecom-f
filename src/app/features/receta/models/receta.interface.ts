/**
 * Interface para ítem de receta en operaciones CRUD (listado/tabla)
 * Basado en el modelo proporcionado por el usuario
 */
export interface RecetaItem {
    id: number; // id de la API
    title: string;
    description: string;
    ingredients: string;
    instructions: string;
    category: string;
    url_banner: string;
    time: string;
    people: number;
    difficulty: string;
    fecha_cre?: string;
    fecha_mod?: string;
    usr_c?: string;
    usr_m?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Interface para formulario de receta (crear/editar)
 * Todos los campos opcionales para permitir creación
 */
export interface RecetaFormItem {
    id?: number | null; // null para creación, número para edición
    title?: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    category?: string;
    url_banner?: string;
    time?: string;
    people?: number;
    difficulty?: string;
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
