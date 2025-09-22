export interface Sucursal {
    sucursal: number;
    tienda: string;
    estado: string;
    id_proy?: number;
    direccion?: string;
}

export interface SucursalResponse {
    statuscode: number;
    mensaje: string;
    data: Sucursal[];
}

export interface SucursalFilters {
    id_proy?: number;
    estado?: string;
    tienda?: string;
}