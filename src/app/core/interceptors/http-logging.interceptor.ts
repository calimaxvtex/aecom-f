import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';

@Injectable()
export class HttpLoggingInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const startTime = Date.now();
        
        // Log de petición
        console.group(`🚀 ${req.method} ${req.url}`);
        console.log('📤 Request:', {
            url: req.url,
            method: req.method,
            headers: req.headers,
            body: req.body
        });

        return next.handle(req).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        const duration = Date.now() - startTime;
                        console.log('📥 Response:', {
                            status: event.status,
                            statusText: event.statusText,
                            duration: `${duration}ms`,
                            data: event.body
                        });
                    }
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    console.error('❌ Error:', {
                        status: error.status,
                        statusText: error.statusText,
                        duration: `${duration}ms`,
                        error: error.error
                    });
                }
            }),
            finalize(() => {
                console.groupEnd();
            })
        );
    }
}


