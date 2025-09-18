// ⚠️ DEPRECATED: Usar RecetaItem de @/features/receta/services/receta.service
// Este archivo se mantiene por compatibilidad pero se recomienda usar RecetaItem
export interface Receta {
    id?: number;
    title: string;
    category?: string | null;
    url_mini: string;
    time: string;
    people: number;
    difficulty: 'facil' | 'medio' | 'dificil';
    // Campos opcionales para compatibilidad
    id_receta?: number;
    title_min?: string;
    description?: string;
    ingredients?: string;
    instructions?: string;
    id_coll?: number;
    url_banner?: string;
    servings?: number;
    status?: 'activo' | 'inactivo' | 'borrador';
    estado?: string;
    created_at?: Date;
    updated_at?: Date;
    fecha_mod?: string;
    usr_m?: string;
}
