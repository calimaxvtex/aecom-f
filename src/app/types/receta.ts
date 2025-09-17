export interface Receta {
    id_receta?: number;
    title: string;
    title_min?: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    id_coll?: number;
    url_banner?: string;
    url_mini?: string;
    time?: string;
    servings?: number;
    status: 'activo' | 'inactivo' | 'borrador';
    estado?: string; // Para compatibilidad con SQL (varchar(2))
    difficulty?: 'facil' | 'medio' | 'dificil';
    category?: string;
    created_at?: Date;
    updated_at?: Date;
    // Campos de auditoría - REGLA OBLIGATORIA
    fecha_mod?: string;
    usr_m?: string;
}
