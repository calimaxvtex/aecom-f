export interface PushNotification {
    ID: number;
    TITULO: string;
    CONTENIDO: string;
    DATA: string | null;
    TIPO: number;
    ESTADO: 'A' | 'B' | 'R' | 'I'; // A = Activo, B = Baja, R = Retirado, I = Inactivo
    FECHA_INICIO: string; // Formato datetime: "2025-07-02T08:00:00"
    FECHA_FIN: string; // Formato datetime: "2025-07-28T08:00:00"
    FECHA_ALTA: string; // Formato date: "2025-07-07"
    ID_PROMO: string;
    ST_ORDEN: number;
}

export interface CreatePushNotificationRequest {
    TITULO: string;
    CONTENIDO: string;
    DATA?: string | null;
    TIPO: number;
    ESTADO?: 'A' | 'B' | 'R' | 'I';
    FECHA_INICIO: string;
    FECHA_FIN: string;
    FECHA_ALTA?: string;
    ID_PROMO: string;
    ST_ORDEN: number;
}

export interface UpdatePushNotificationRequest extends CreatePushNotificationRequest {
    ID: number;
}

export interface PushNotificationResponse {
    statuscode: number;
    mensaje: string;
    data: PushNotification[];
}

