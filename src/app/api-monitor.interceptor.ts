import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

console.log('🔍 Interceptor: Archivo api-monitor.interceptor.ts cargado');

@Injectable()
export class ApiMonitorInterceptor implements HttpInterceptor {
  
  private startTime: number = 0;
  private apiCalls: any[] = [];

  constructor() {
    console.log('🔍 Interceptor: ApiMonitorInterceptor instanciado');
    console.log('🔍 Interceptor: Constructor ejecutado correctamente');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔍 Interceptor: === INTERCEPTOR EJECUTADO ===');
    console.log('🔍 Interceptor: URL:', req.url);

    // Solo pasar la petición al siguiente interceptor
    return next.handle(req);
  }

  private extractRequestInfo(req: HttpRequest<any>): any {
    const url = new URL(req.url);
    
    return {
      tipo: 'out', // Todas las llamadas desde el cliente son 'out'
      servidor: url.hostname,
      ruta: url.pathname,
      url: req.url,
      parametros: this.extractQueryParams(url),
      body: req.body,
      method: req.method
    };
  }

  private extractQueryParams(url: URL): any {
    const params: any = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length > 0 ? params : null;
  }

  private captureApiCall(requestInfo: any, response?: HttpResponse<any> | null, error?: HttpErrorResponse | null): void {
    const duration = Date.now() - this.startTime;

    const apiCall = {
      id: this.generateId(),
      timestamp: new Date(),
      ...requestInfo,
      statusCode: response ? response.status : (error ? error.status : 0),
      respuesta: response ? response.body : null,
      mensaje: response ? 'OK' : (error ? error.message : 'Unknown error'),
      duracion: duration
    };

    console.log('🔍 Interceptor: === CAPTURANDO LLAMADA API ===');
    console.log('🔍 Interceptor: Duración:', duration + 'ms');
    console.log('🔍 Interceptor: Status Code:', apiCall.statusCode);
    console.log('🔍 Interceptor: Llamada capturada:', apiCall);

    // Agregar al array local
    this.apiCalls.push(apiCall);

    // Aplicar límite de registros
    const maxRecords = this.getMaxRecords();
    if (this.apiCalls.length > maxRecords) {
      this.apiCalls = this.apiCalls.slice(-maxRecords);
    }

    // Guardar en localStorage
    console.log('🔍 Interceptor: Guardando en localStorage, total llamadas:', this.apiCalls.length);
    localStorage.setItem('apiMonitor', JSON.stringify(this.apiCalls));
    console.log('✅ Interceptor: Datos guardados en localStorage');

    // Verificar que se guardó correctamente
    const savedData = localStorage.getItem('apiMonitor');
    console.log('🔍 Interceptor: Verificación - Datos en localStorage:', savedData ? JSON.parse(savedData).length + ' llamadas' : 'null');

    // Notificar al componente (si está disponible)
    this.notifyComponent(apiCall);
  }

  private notifyComponent(apiCall: any): void {
    console.log('🔍 Interceptor: Notificando al componente...');

    // Buscar el componente SPConfig en el DOM y notificar
    const event = new CustomEvent('apiCallCaptured', {
      detail: apiCall
    });
    window.dispatchEvent(event);

    console.log('🔍 Interceptor: Evento enviado:', event);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getMaxRecords(): number {
    const config = localStorage.getItem('monitorConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      return parsedConfig.maxRecords || 1000;
    }
    return 1000; // Valor por defecto
  }
}
