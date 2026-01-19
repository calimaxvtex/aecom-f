export interface Cp {
    id: number;
    sucursal: number;
    tienda: string;
    codigo_postal: string;
    colonia: string;
    municipio: number;
    d_ciudad: string;
    estado: 'A' | 'R';
}

export interface CpResponse {
    statuscode: number;
    mensaje: string;
    data: Cp[];
}

export interface CpSingleResponse {
    statuscode: number;
    mensaje: string;
    data: Cp | null;
}

export interface CpResponseInfo {
    statuscode: number;
    mensaje: string;
    data: CpInfoData;
}

export interface CpInfoData {
    data_cp: CpInfo;
    existe: number;
}

export interface CpInfo {
    sucursales: SucursalCp[];
    colonias: { colonia: string }[];
    municipios: MunicipioCp[];
}

export interface SucursalCp {
    v_suc: number;
    suc: string;
}

export interface MunicipioCp {
    c_mnpio: number;
    d_ciudad: string;
}

export interface CreateSucursalRequest {
    sucursal: number;         
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