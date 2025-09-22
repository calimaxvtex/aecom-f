// Interface para Sucursales - Endpoint: /api/admsucursal/v1

export interface Sucursal {
    // Campos principales
    sucursal: number;
    tienda: string;
    direccion: string;
    latitud: string;
    longitud: string;
    fecha: string;
    estado: string; // 'A' | 'I'
    id_proy: number;

    // Campos opcionales (pueden ser null)
    id_sref?: number | null;
    prioridad?: number | null;
    policies_id?: string | null;
    store_id?: string | null;
    serial?: string | null;
    orden_carga?: number | null;
    agrupa_carga?: number | null;
    id_muelle?: number | null;
    apptoken?: string | null;
    appkey?: string | null;
    e_account_id?: string | null;
    e_account_name?: string | null;
    sellerid?: string | null;
    ip?: string | null;
    locker_id?: string | null;
    loc_id?: string | null;
    ip_serv?: string | null;
    locker_top?: string | null;
    ciudad?: string | null;
    picking_point_id?: string | null;
    place_id?: string | null;
    swRappi?: number | null;
    express?: number | null;
    telefono?: string | null;
    swUber?: number | null;
    swpos?: number | null;
    indexApp?: number | null;
    zona_geografica?: number | null;
    sap?: string | null;
}

// Interface para respuesta de API de sucursales
export interface SucursalResponse {
    statuscode: number;
    mensaje: string;
    data: Sucursal[];
}

// Interface para crear sucursal (solo campos requeridos)
export interface CreateSucursalRequest {
    sucursal: number;         // ID de la sucursal (requerido)
    tienda: string;
    direccion: string;
    latitud: string;
    longitud: string;
    id_proy: number;
    zona_geografica?: number;
    estado?: string;
    telefono?: string;
    sap?: number;
    ip?: string;
    ip_serv?: string;
}

// Interface para actualizar sucursal
export interface UpdateSucursalRequest extends Partial<CreateSucursalRequest> {
    sucursal: number;
}

// Interfaces de Proyecto importadas desde el feature correspondiente
export type { Proyecto, ProyectoResponse } from '../../proy/models/proyecto.interface';

// Interface para filtros de sucursales
export interface SucursalFilters {
    id_proy?: number;
    estado?: string;
    zona_geografica?: number;
}
