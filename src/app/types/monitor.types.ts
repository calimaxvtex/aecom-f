// Interfaces para Monitor
export interface ApiCall {
    id: string;
    timestamp: Date;
    tipo: 'in' | 'out';
    servidor: string;
    ruta: string;
    url: string;
    parametros: any;
    body: any;
    respuesta: any;
    statusCode: number;
    mensaje: string;
    duracion?: number;
}

export interface MonitorConfig {
    enabled: boolean;
    maxRecords: number;
    autoCleanup: boolean;
    cleanupDays: number;
}
