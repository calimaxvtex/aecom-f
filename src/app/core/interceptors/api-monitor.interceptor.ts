import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ApiMonitorInterceptor implements HttpInterceptor {
  
  private startTime: number = 0;
  private apiCalls: any[] = [];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Verificar si el monitor está activo
    const monitorConfig = localStorage.getItem('monitorConfig');
    if (!monitorConfig) return next.handle(req);
    
    const config = JSON.parse(monitorConfig);
    if (!config.enabled) return next.handle(req);

    // Capturar tiempo de inicio
    this.startTime = Date.now();

    // Extraer información de la request
    const requestInfo = this.extractRequestInfo(req);

    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.captureApiCall(requestInfo, event, null);
          }
        },
        (error: HttpErrorResponse) => {
          this.captureApiCall(requestInfo, null, error);
        }
      )
    );
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
      ...requestInfo,
      statusCode: response ? response.status : (error ? error.status : 0),
      respuesta: response ? response.body : null,
      mensaje: response ? 'OK' : (error ? error.message : 'Unknown error'),
      duracion: duration
    };

    // Agregar al array local
    this.apiCalls.push(apiCall);

    // Notificar al componente (si está disponible)
    this.notifyComponent(apiCall);
  }

  private notifyComponent(apiCall: any): void {
    // Buscar el componente SPConfig en el DOM y notificar
    const event = new CustomEvent('apiCallCaptured', {
      detail: apiCall
    });
    window.dispatchEvent(event);
  }
}
