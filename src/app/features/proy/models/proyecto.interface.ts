// Interface para Proyectos - Endpoint: /api/admproy/v1

export interface Proyecto {
    id_proy: number;
    nombre: string;
    descripcion?: string;
    estado?: string;
    fecha_creacion?: string;
    fecha_mod?: string;
    usr_a?: string | number;
    usr_m?: string | number;
}

export interface ProyectoResponse {
    statuscode: number;
    mensaje: string;
    data: Proyecto[];
}
