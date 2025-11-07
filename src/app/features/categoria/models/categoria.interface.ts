export interface Categoria {
    id_categoria?: number;
    id_cat?: number; // Alias que puede retornar la API
    nombre: string;
    descripcion?: string;
    estado: 'A' | 'I';
    id_proy: number;
    nivel: 1 | 2;
    id_cat_padre?: number; // Para nivel 2, referencia a categoría padre
    url_img_web?: string; // URL de imagen/banner para ecommerce web
    url_img_app?: string; // URL de imagen/banner para ecommerce app
    url_min_web?: string; // URL de miniatura para ecommerce web
    url_min_app?: string; // URL de miniatura para ecommerce app
    nombre_cat_padre?: string; // Nombre de la categoría padre (para Nivel 2)
    created_at?: string;
    updated_at?: string;
    fecha_mod?: string; // Alias que puede retornar la API
}

export interface CreateCategoriaRequest {
    nombre: string;
    descripcion?: string;
    estado: 'A' | 'I';
    id_proy: number;
    nivel: 1 | 2;
    id_cat_padre?: number;
    url_img_web?: string; // URL de imagen/banner para ecommerce web
    url_img_app?: string; // URL de imagen/banner para ecommerce app
    url_min_web?: string; // URL de miniatura para ecommerce web
    url_min_app?: string; // URL de miniatura para ecommerce app
}

export interface UpdateCategoriaRequest extends CreateCategoriaRequest {
    id_categoria: number;
}

export interface CategoriaResponse {
    statuscode: number;
    mensaje: string;
    data: Categoria[];
}

export interface Proyecto {
    id_proy: number;
    nombre: string;
    descripcion?: string;
    estado: 'A' | 'I';
}