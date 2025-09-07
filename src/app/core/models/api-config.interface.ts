// src/app/core/models/api-config.interface.ts
export interface SpConfigResponse {
    statuscode: number;
    mensaje: string;
    active: number;
    controllers: SpConfigController[];
}

export interface SpConfigController {
    id_sp: number;
    route: string;
    fullRoute: string;
}

export interface ApiEndpoint {
    id: number;
    name: string;
    url: string;
}