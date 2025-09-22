/**
 * Configuración de entorno para PRODUCCIÓN
 * Este archivo se usa cuando se ejecuta en modo producción
 */
export const environment = {
  production: true,
  
  // URLs de la API
  apiUrl: 'https://ec.calimax.digital',
  apiUrlImg: 'https://ec.calimax.digital',
  //apiUrlImg: 'http://10.10.254.127:3013',
  
  // Configuración de autenticación
  bypassAuth: false,  // NO bypass en producción - autenticación requerida
  
  // Configuración de debug
  debugMode: false,
  enableLogs: false,
  
  // Configuración de cache
  cacheEnabled: true,
  cacheExpiryMinutes: 60,
  
  // Configuración de interceptors
  enableApiMonitor: false,
  enableHttpLogging: false,
  
  // Configuración de desarrollo
  mockDataEnabled: false,
  devToolsEnabled: false,
  
  // Configuración de timeouts
  apiTimeout: 15000, // 15 segundos
  uploadTimeout: 30000, // 30 segundos para uploads
  
  // Configuración de paginación
  defaultPageSize: 20,
  maxPageSize: 200,
  
  // Configuración de validación
  enableFormValidation: true,
  enableRealTimeValidation: false
};
