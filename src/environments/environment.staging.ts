export const environment = {
  production: false,
  mode: 'staging',
  
  // URLs de API
  apiUrl: 'https://staging-api.calimax.digital',
  apiUrlImg: 'https://staging-images.calimax.digital',
  
  // Configuración de autenticación
  bypassAuth: false,
  mockDataEnabled: false,
  
  // Configuración de debug
  debugMode: true,
  enableLogs: true,
  enableApiMonitor: true,
  enableHttpLogging: true,
  
  // Herramientas de desarrollo
  devToolsEnabled: true,
  errorReportingEnabled: true,
  performanceMonitoring: true,
  
  // Configuración específica de Staging
  stagingMode: true,
  allowTestData: true,
  enableExtraLogging: true,
  
  // Configuración de caché
  cacheEnabled: true,
  cacheTimeout: 600000, // 10 minutos
  
  // Configuración de timeouts
  apiTimeout: 30000,
  requestTimeout: 15000,
  
  // Configuración de paginación
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Configuración de validación
  enableFormValidation: true,
  enableRealTimeValidation: true,
  
  // Configuración de notificaciones
  enableNotifications: true,
  notificationTimeout: 5000,
  
  // Configuración de analytics
  enableAnalytics: true,
  analyticsId: 'STAGING-ANALYTICS-ID'
};