/**
 * Configuración de entorno para STAGING/PRUEBAS
 * Este archivo se usa para ambiente de pruebas
 */
export const environment = {
  production: false,
  
  // URLs de la API
  apiUrl: 'https://staging-ec.calimax.digital',
  apiUrlImg: 'http://10.10.254.127:3013',
  
  // Configuración de autenticación
  bypassAuth: false,  // Autenticación requerida en staging
  
  // Configuración de debug
  debugMode: true,
  enableLogs: true,
  
  // Configuración de cache
  cacheEnabled: true,
  cacheExpiryMinutes: 30,
  
  // Configuración de interceptors
  enableApiMonitor: true,
  enableHttpLogging: true,
  
  // Configuración de desarrollo
  mockDataEnabled: false,
  devToolsEnabled: true,
  
  // Configuración de timeouts
  apiTimeout: 20000, // 20 segundos
  uploadTimeout: 45000, // 45 segundos para uploads
  
  // Configuración de paginación
  defaultPageSize: 15,
  maxPageSize: 150,
  
  // Configuración de validación
  enableFormValidation: true,
  enableRealTimeValidation: true
};
