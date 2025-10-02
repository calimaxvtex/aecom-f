// Interfaces para el CRUD de Tipo Gateway basadas en el modelo proporcionado

export interface TipoGatewayItem {
    id: number;
    nombre: string;
    clave: string;
    tipo_deposito: number;
    estado: string;
    fecha_mov: string;
    swActivo: number;
    idj: number | null;
    sw: string | null;
}

export interface TipoGatewayCrudResponse {
    statuscode: number;
    mensaje: string;
    data: TipoGatewayItem[];
}

// Interface para respuestas individuales (POST, PUT, DELETE)
export interface TipoGatewayCrudSingleResponse {
    statuscode: number;
    mensaje: string;
    data: TipoGatewayItem;
}

// Interface para el formulario
export interface TipoGatewayFormItem {
    id?: number | null;
    nombre: string | null;
    clave: string | null;
    tipo_deposito: number | null;
    estado: string | null;
    swActivo: number | null;
    idj?: number | null;
    sw?: string | null;
}

// Interface para requests de acciones CRUD
export interface TipoGatewayRequest {
    action: 'SL' | 'SE' | 'IN' | 'UP' | 'DE'; // SELECT, INSERT, UPDATE, DELETE
    id?: number;
    nombre?: string;
    clave?: string;
    tipo_deposito?: number;
    estado?: string;
    swActivo?: number;
    idj?: number;
    sw?: string;
    usr?: string | number;
    id_session?: number;
}
