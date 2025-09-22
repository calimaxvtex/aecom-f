import { Injectable } from '@angular/core';

/**
 * Servicio para manejar cache persistente usando localStorage
 * Implementa expiración automática y manejo de errores
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageCacheService {
  private readonly CACHE_PREFIX = 'aec_cache_';
  private readonly CACHE_EXPIRY_DAYS = 7; // 1 semana

  /**
   * Guardar datos en cache con timestamp y expiración
   */
  set<T>(key: string, data: T): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) // 7 días en ms
      };

      const cacheString = JSON.stringify(cacheData);
      localStorage.setItem(`${this.CACHE_PREFIX}${key}`, cacheString);

      console.log(`💾 Cache guardado: ${key} (expira en ${this.CACHE_EXPIRY_DAYS} días)`);
    } catch (error) {
      console.error(`❌ Error guardando cache ${key}:`, error);
      // Si hay error (localStorage lleno, etc.), no hacer nada
    }
  }

  /**
   * Obtener datos desde cache si no han expirado
   */
  get<T>(key: string): T | null {
    try {
      const cacheString = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);

      if (!cacheString) {
        return null;
      }

      const cacheData = JSON.parse(cacheString);

      // Verificar si existe la estructura esperada
      if (!cacheData || !cacheData.expiry || !cacheData.timestamp) {
        console.warn(`⚠️ Cache corrupto para ${key}, eliminando...`);
        this.remove(key);
        return null;
      }

      // Verificar expiración
      if (Date.now() > cacheData.expiry) {
        console.log(`⏰ Cache expirado para ${key}, eliminando...`);
        this.remove(key);
        return null;
      }

      console.log(`💾 Cache cargado: ${key} (${Math.round((cacheData.expiry - Date.now()) / (1000 * 60 * 60 * 24))} días restantes)`);
      return cacheData.data;

    } catch (error) {
      console.error(`❌ Error leyendo cache ${key}:`, error);
      // Si hay error de parsing, eliminar el cache corrupto
      this.remove(key);
      return null;
    }
  }

  /**
   * Verificar si existe cache válido (no expirado)
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Obtener información del cache (timestamp, expiración)
   */
  getInfo(key: string): { timestamp: number, expiry: number, daysRemaining: number } | null {
    try {
      const cacheString = localStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cacheString) return null;

      const cacheData = JSON.parse(cacheString);
      const daysRemaining = Math.round((cacheData.expiry - Date.now()) / (1000 * 60 * 60 * 24));

      return {
        timestamp: cacheData.timestamp,
        expiry: cacheData.expiry,
        daysRemaining: Math.max(0, daysRemaining)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Eliminar cache específico
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
      console.log(`🗑️ Cache eliminado: ${key}`);
    } catch (error) {
      console.error(`❌ Error eliminando cache ${key}:`, error);
    }
  }

  /**
   * Limpiar todo el cache de la aplicación
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];

      // Encontrar todas las keys del cache
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      // Eliminar las keys encontradas
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`🗑️ Cache completo limpiado: ${keysToRemove.length} entradas eliminadas`);
    } catch (error) {
      console.error('❌ Error limpiando cache completo:', error);
    }
  }

  /**
   * Limpiar cache expirado automáticamente
   */
  cleanExpired(): void {
    try {
      const keysToCheck: string[] = [];

      // Encontrar todas las keys del cache
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          keysToCheck.push(key);
        }
      }

      let expiredCount = 0;

      // Verificar cada key
      keysToCheck.forEach(key => {
        const cacheKey = key.replace(this.CACHE_PREFIX, '');
        if (!this.has(cacheKey)) {
          expiredCount++;
        }
      });

      if (expiredCount > 0) {
        console.log(`🧹 Cache expirado limpiado: ${expiredCount} entradas`);
      }
    } catch (error) {
      console.error('❌ Error limpiando cache expirado:', error);
    }
  }
}
