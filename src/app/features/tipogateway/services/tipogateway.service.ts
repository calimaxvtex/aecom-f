import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  TipoGatewayItem, 
  TipoGatewayCrudResponse, 
  TipoGatewayCrudSingleResponse,
  TipoGatewayFormItem,
  TipoGatewayRequest 
} from '../models/tipogateway.interface';
import { ApiConfigService } from '../../../core/services/api/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class TipoGatewayService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    // Obtener URL base del servicio de configuración
    this.baseUrl = this.apiConfigService.getBaseUrl();
  }

  /**
   * Obtener todos los tipos de gateway
   */
  getTipoGateways(filters?: {
    activo?: boolean;
    nombre?: string;
  }): Observable<TipoGatewayCrudResponse> {
    let params = new HttpParams();
    
    if (filters?.activo !== undefined) {
      params = params.set('activo', filters.activo.toString());
    }
    
    if (filters?.nombre) {
      params = params.set('nombre', filters.nombre);
    }

    const url = `${this.baseUrl}/api/admtipogateway/v1`;
    return this.http.get<TipoGatewayCrudResponse>(url, { params });
  }

  /**
   * Crear un nuevo tipo de gateway
   */
  createTipoGateway(tipogateway: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse> {
    const payload: TipoGatewayRequest = {
      action: 'IN',
      nombre: tipogateway.nombre,
      descripcion: tipogateway.descripcion,
      activo: tipogateway.activo,
      configuracion: tipogateway.configuracion
    };

    const url = `${this.baseUrl}/api/admtipogateway/v1`;
    return this.http.post<TipoGatewayCrudSingleResponse>(url, payload);
  }

  /**
   * Actualizar un tipo de gateway existente
   */
  updateTipoGateway(tipogateway: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse> {
    const payload: TipoGatewayRequest = {
      action: 'UP',
      id_tipogateway: tipogateway.id_tipogateway,
      nombre: tipogateway.nombre,
      descripcion: tipogateway.descripcion,
      activo: tipogateway.activo,
      configuracion: tipogateway.configuracion
    };

    const url = `${this.baseUrl}/api/admtipogateway/v1`;
    return this.http.post<TipoGatewayCrudSingleResponse>(url, payload);
  }

  /**
   * Eliminar un tipo de gateway
   */
  deleteTipoGateway(id: number): Observable<TipoGatewayCrudSingleResponse> {
    const payload: TipoGatewayRequest = {
      action: 'DL',
      id_tipogateway: id
    };

    const url = `${this.baseUrl}/api/admtipogateway/v1`;
    return this.http.post<TipoGatewayCrudSingleResponse>(url, payload);
  }

  /**
   * Guardar tipo de gateway (crear o actualizar automáticamente)
   */
  saveTipoGateway(tipogateway: TipoGatewayFormItem): Observable<TipoGatewayCrudSingleResponse> {
    if (tipogateway.id_tipogateway) {
      return this.updateTipoGateway(tipogateway);
    } else {
      return this.createTipoGateway(tipogateway);
    }
  }

  /**
   * Obtener un tipo de gateway por ID
   */
  getTipoGatewayById(id: number): Observable<TipoGatewayCrudSingleResponse> {
    const payload: TipoGatewayRequest = {
      action: 'SL',
      id_tipogateway: id
    };

    const url = `${this.baseUrl}/api/admtipogateway/v1`;
    return this.http.post<TipoGatewayCrudSingleResponse>(url, payload);
  }
}
