/**
 * Configuración de entorno para QA (Quality Assurance)
 * Este archivo se usa para ambiente de pruebas de calidad
 */
export const environment = {
  production: false,
  mode: 'qa',  // Identificador del modo

  // URLs de la API
  apiUrl: 'http://10.10.250.168:3012',
  apiUrlImg: 'http://10.10.254.127:3013',

  // Configuración de autenticación
  bypassAuth: false,  // ❌ QA requiere autenticación real para testing

  // Configuración de debug
  debugMode: true,
  enableLogs: true,

  // Configuración de cache
  cacheEnabled: true,
  cacheExpiryMinutes: 15,  // Cache más corto para QA

  // Configuración de interceptors
  enableApiMonitor: true,  // ✅ Monitor activo para debugging
  enableHttpLogging: true, // ✅ Logging activo para debugging

  // Configuración de desarrollo
  mockDataEnabled: false,  // ❌ QA usa datos reales
  devToolsEnabled: true,   // ✅ DevTools visible para debugging

  // Configuración de QA específica
  qaMode: true,           // ✅ Modo QA activado
  allowTestData: true,    // ✅ Permite datos de prueba
  enableExtraLogging: true, // ✅ Logging extra para QA

  // Configuración de timeouts
  apiTimeout: 25000,  // 25 segundos (entre dev y prod)
  uploadTimeout: 50000, // 50 segundos para uploads

  // Configuración de paginación
  defaultPageSize: 10,
  maxPageSize: 100,

  // Configuración de validación
  enableFormValidation: true,
  enableRealTimeValidation: true,

  // Configuración específica de QA
  testUserEnabled: true,      // ✅ Usuario de prueba disponible
  errorReportingEnabled: true, // ✅ Reporte de errores activo
  performanceMonitoring: true, // ✅ Monitoreo de performance
  featureFlagsEnabled: true    // ✅ Feature flags para testing
};
