import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

console.log('🔍 Simple Test: Archivo simple-test.interceptor.ts cargado');

@Injectable()
export class SimpleTestInterceptor implements HttpInterceptor {
  
  constructor() {
    console.log('🔍 Simple Test: SimpleTestInterceptor instanciado');
    console.log('🔍 Simple Test: Constructor ejecutado correctamente');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔍 Simple Test: Llamada interceptada:', req.url);
    console.log('🔍 Simple Test: Método:', req.method);
    console.log('🔍 Simple Test: Headers:', req.headers);
    return next.handle(req);
  }
}
