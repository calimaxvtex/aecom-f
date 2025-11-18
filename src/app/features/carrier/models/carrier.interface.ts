export interface Carrier {
    id_carrier: number;
    id_ref_vtex: string;
    nombre: string;
    tienda: string;
    tipo_envio_desc: string;
    tipo_envio: number; // 1 = Entrega a domicilio, 2 = Retirar en tienda
    fee: number; // Costo de envío
    estado?: 'A' | 'I' | 'B' | 'R'; // A = Activo, I = Inactivo, B = Borrado, R = Retirado
    created_at?: string;
    updated_at?: string;
    fecha_mod?: string; // Alias que puede retornar la API
}

export interface CreateCarrierRequest {
    id_ref_vtex: string;
    nombre: string;
    tienda: string;
    tipo_envio_desc: string;
    tipo_envio: number;
    fee: number;
    estado?: 'A' | 'I' | 'B' | 'R';
}

export interface UpdateCarrierRequest extends CreateCarrierRequest {
    id_carrier: number;
}

export interface CarrierResponse {
    statuscode: number;
    mensaje: string;
    data: Carrier[];
}

// ========== INTERFACES PARA HORARIOS ==========

export interface HorarioCarrier {
    id_sched: number;
    id_carrier: number;
    estado: 'A' | 'I' | 'B' | 'R';
    week_day: number; // 1=Lunes, 2=Martes, ..., 7=Domingo
    ren: number; // Número de ventana en el día
    hini: string; // Hora inicio formato "HH:mm" (ej: "8:00")
    hfin: string; // Hora fin formato "HH:mm" (ej: "10:00")
    hini_int: number; // Hora inicio en formato entero (ej: 8)
    hfin_int: number; // Hora fin en formato entero (ej: 10)
    fee: number; // Costo de envío para esta ventana
    capacidad: number; // Capacidad web (pedidos)
    capacidad_app: number; // Capacidad app (pedidos)
    usuario?: string;
    fecha?: string | null;
    usu_mod_a?: string;
    fec_mod_a?: string;
    hora_ini: string; // Formato "HH:mm:ss" (ej: "08:00:00")
    hora_fin: string; // Formato "HH:mm:ss" (ej: "10:00:00")
    phora_ini?: string | null; // Mismo valor que hora_ini
}

export interface CreateHorarioCarrierRequest {
    id_carrier: number;
    week_day: number;
    hini: string;
    hfin: string;
    hini_int: number;
    hfin_int: number;
    fee: number;
    capacidad: number;
    capacidad_app: number;
    hora_ini: string;
    hora_fin: string;
    phora_ini: string;
    estado?: 'A' | 'I' | 'B' | 'R';
}

export interface UpdateHorarioCarrierRequest {
    id_sched: number;
    hini?: string;
    hfin?: string;
    hini_int?: number;
    hfin_int?: number;
    fee?: number;
    capacidad?: number;
    capacidad_app?: number;
    hora_ini?: string;
    hora_fin?: string;
    phora_ini?: string;
    estado?: 'A' | 'I' | 'B' | 'R';
}

export interface HorarioCarrierResponse {
    statuscode: number;
    mensaje: string;
    data: HorarioCarrier[];
}
