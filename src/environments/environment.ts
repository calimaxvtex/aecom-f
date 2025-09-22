/**
 * Configuración de entorno para DESARROLLO
 * Este archivo se usa cuando se ejecuta en modo desarrollo
 */
export const environment = {
  production: false,
  
  // URLs de la API
  apiUrl: 'https://ec.calimax.digital',
 // apiUrlImg: 'http://10.10.254.127:3013',
  apiUrlImg: 'https://ec.calimax.digital',
  
  // Configuración de autenticación
  bypassAuth: true,  // Bypass para desarrollo - permite acceso sin login
  
  // Configuración de debug
  debugMode: true,
  enableLogs: true,
  
  // Configuración de cache
  cacheEnabled: false,
  cacheExpiryMinutes: 5,
  
  // Configuración de interceptors
  enableApiMonitor: true,
  enableHttpLogging: true,
  
  // Configuración de desarrollo
  mockDataEnabled: true,
  devToolsEnabled: true,
  
  // Configuración de timeouts
  apiTimeout: 30000, // 30 segundos
  uploadTimeout: 60000, // 60 segundos para uploads
  
  // Configuración de paginación
  defaultPageSize: 10,
  maxPageSize: 100,
  
  // Configuración de validación
  enableFormValidation: true,
  enableRealTimeValidation: true
};
