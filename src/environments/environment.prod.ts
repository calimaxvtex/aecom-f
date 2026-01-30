export const environment = {
  production: true,
  mode: 'production',

  // URLs de API
  apiUrl: 'https://ec.calimax.digital',
  apiUrlImg: 'https://ec.calimax.digital',

  // Configuración de autenticación
  bypassAuth: false,
  mockDataEnabled: false,

  // Configuración de debug
  debugMode: false,
  enableLogs: false,

  // Configuración de cache
  cacheExpiryMinutes: 60,

  // Configuración de interceptors
  enableApiMonitor: false,
  enableHttpLogging: false,

  // Herramientas de desarrollo
  devToolsEnabled: false,
  errorReportingEnabled: true,
  performanceMonitoring: true,

  // Configuración específica de producción
  productionMode: true,
  allowTestData: false,
  enableExtraLogging: false,

  // Configuración de caché
  cacheEnabled: true,
  cacheTimeout: 1800000, // 30 minutos

  // Configuración de timeouts
  apiTimeout: 30000,
  requestTimeout: 15000,

  // Configuración de paginación
  defaultPageSize: 20,
  maxPageSize: 100,

  // Configuración de validación
  enableFormValidation: true,
  enableRealTimeValidation: false,

  // Configuración de notificaciones
  enableNotifications: true,
  notificationTimeout: 3000,

  // Configuración de analytics
  enableAnalytics: true,
  analyticsId: 'PROD-ANALYTICS-ID'
};