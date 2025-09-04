export interface Tabloide {
    id_tab: number;
    nombre: string;
    descripcion: string;
    estado: string; // 'A' | 'I'
    fecha: string; // ISO date string
    fecha_mod: string; // ISO date string
    usr_a: string; // Usuario que agregó
    usr_m: string | number; // Usuario que modificó
    src: string; // URL del tabloide completo (fliphtml5)
    imagen: string; // URL de la miniatura/preview
}

export interface TabloideResponse {
    statuscode: number;
    mensaje: string;
    data: Tabloide[];
}

export interface TabloideForm {
    nombre: string;
    descripcion: string;
    estado: string;
    src: string;
    imagen: string;
}

export interface TabloideAction {
    action: 'SL' | 'IN' | 'UP' | 'DL'; // Select, Insert, Update, Delete
    id_tab?: number;
    nombre?: string;
    descripcion?: string;
    estado?: string;
    src?: string;
    imagen?: string;
    usr?: string | number; // Puede ser string o number
    id_session?: number;
}

export interface ApiResponse<T = any> {
    statuscode: number;
    mensaje: string;
    data?: T;
}
