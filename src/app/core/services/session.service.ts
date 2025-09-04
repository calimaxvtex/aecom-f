import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SessionData {
    usuario: string | number;
    id_session: number;
    nombre?: string;
    email?: string;
    isLoggedIn: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    private sessionSubject = new BehaviorSubject<SessionData | null>(null);
    public session$: Observable<SessionData | null> = this.sessionSubject.asObservable();

    constructor() {
        // Cargar sesión existente al inicializar
        this.loadSessionFromStorage();
    }

    /**
     * Establecer datos de sesión después de login exitoso
     */
    setSession(userData: any): void {
        console.log('🔐 Estableciendo sesión con datos:', userData);
        
        const sessionData: SessionData = {
            usuario: userData.usuario || userData.id,
            id_session: userData.id_session,
            nombre: userData.nombre,
            email: userData.email,
            isLoggedIn: true
        };

        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        localStorage.setItem('isLoggedIn', 'true');

        // Actualizar BehaviorSubject
        this.sessionSubject.next(sessionData);
        
        console.log('✅ Sesión establecida:', sessionData);
    }

    /**
     * Obtener datos de sesión actuales
     */
    getSession(): SessionData | null {
        return this.sessionSubject.value;
    }

    /**
     * Obtener usuario actual para APIs
     */
    getCurrentUser(): string | number | null {
        const session = this.getSession();
        return session ? session.usuario : null;
    }

    /**
     * Obtener id_session actual para APIs
     */
    getCurrentSessionId(): number | null {
        const session = this.getSession();
        return session ? session.id_session : null;
    }

    /**
     * Verificar si el usuario está logueado
     */
    isLoggedIn(): boolean {
        const session = this.getSession();
        return session ? session.isLoggedIn : false;
    }

    /**
     * Obtener payload base para APIs (incluye usr e id_session)
     */
    getApiPayloadBase(): { usr?: string | number; id_session?: number } {
        const session = this.getSession();
        if (session) {
            return {
                usr: session.usuario,
                id_session: session.id_session
            };
        }
        return {};
    }

    /**
     * Cerrar sesión
     */
    logout(): void {
        console.log('🚪 Cerrando sesión...');
        
        // Limpiar localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionData');
        localStorage.removeItem('isLoggedIn');
        
        // Limpiar BehaviorSubject
        this.sessionSubject.next(null);
        
        console.log('✅ Sesión cerrada');
    }

    /**
     * Cargar sesión desde localStorage al inicializar
     */
    private loadSessionFromStorage(): void {
        try {
            const sessionData = localStorage.getItem('sessionData');
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (sessionData && isLoggedIn) {
                const session: SessionData = JSON.parse(sessionData);
                this.sessionSubject.next(session);
                console.log('🔄 Sesión cargada desde localStorage:', session);
            }
        } catch (error) {
            console.error('❌ Error cargando sesión desde localStorage:', error);
            this.logout(); // Limpiar si hay error
        }
    }
}
