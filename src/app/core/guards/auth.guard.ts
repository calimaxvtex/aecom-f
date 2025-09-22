import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { SessionService } from '@/core/services/session.service';

/**
 * Guard de autenticación para proteger rutas
 * Implementa bypass para desarrollo y verificación real para producción
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // 🚀 BYPASS para desarrollo
    if (environment.production === false && environment.bypassAuth) {
      console.log('🔓 [DEV] Bypass de autenticación activado');
      console.log('🔓 [DEV] Acceso permitido a:', state.url);
      
      // Crear sesión mock para desarrollo si no existe
      this.createMockSessionIfNeeded();
      return true;
    }

    // 🔒 Verificación real de autenticación
    const isLoggedIn = this.sessionService.isLoggedIn();
    
    if (!isLoggedIn) {
      console.log('🔒 [AUTH] Usuario no autenticado, redirigiendo al login');
      console.log('🔒 [AUTH] URL solicitada:', state.url);
      
      // Guardar la URL solicitada para redirigir después del login
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }
    
    console.log('✅ [AUTH] Usuario autenticado, acceso permitido');
    return true;
  }

  /**
   * Crea una sesión mock para desarrollo si no existe
   */
  private createMockSessionIfNeeded(): void {
    const currentSession = this.sessionService.getSession();
    
    if (!currentSession || !currentSession.isLoggedIn) {
      const mockUser = {
        usuario: 'dev_user',
        id_session: 999999,
        nombre: 'Usuario de Desarrollo',
        email: 'dev@calimax.com',
        isLoggedIn: true
      };

      // Establecer sesión mock
      this.sessionService.setSession(mockUser);
      console.log('👤 [DEV] Sesión mock creada:', mockUser);
    } else {
      console.log('👤 [DEV] Sesión existente encontrada:', currentSession);
    }
  }
}
