/**
 * Interfaces para la gestión de Tipos de Gateway de Pago
 */

export interface TipoGatewayItem {
  id_tipogateway: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  configuracion?: any;
  fecha_creacion: string;
  fecha_actualizacion: string;
  id_usuario_creacion: number;
  id_usuario_actualizacion: number;
}

export interface TipoGatewayCrudResponse {
  statuscode: number;
  mensaje: string;
  data: TipoGatewayItem[];
}

export interface TipoGatewayCrudSingleResponse {
  statuscode: number;
  mensaje: string;
  data: TipoGatewayItem;
}

export interface TipoGatewayFormItem {
  id_tipogateway?: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  configuracion?: any;
}

export interface TipoGatewayRequest {
  action?: 'SL' | 'UP' | 'IN' | 'DL';
  id_tipogateway?: number;
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  configuracion?: any;
}