import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SessionService } from '../services/session/session.service';
import { environment } from '../../../environments/environment';

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
  ): boolean {
    
    // 🔧 BYPASS PARA DESARROLLO
    if (!environment.production && environment.bypassAuth) {
      console.log('🔓 AuthGuard: Bypass activado para desarrollo');
      
      // Crear sesión mock si no existe
      if (!this.sessionService.isLoggedIn()) {
        console.log('👤 Creando sesión mock para desarrollo');
        this.sessionService.setUser({
          id: 1,
          username: 'dev_user',
          email: 'dev@example.com',
          name: 'Usuario Desarrollo',
          role: 'admin'
        });
      }
      
      return true;
    }

    // 🔐 VERIFICACIÓN REAL DE AUTENTICACIÓN
    if (this.sessionService.isLoggedIn()) {
      return true;
    }

    // 🚫 REDIRECCIÓN A LOGIN
    console.log('🔒 AuthGuard: Usuario no autenticado, redirigiendo a login');
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    
    return false;
  }
}