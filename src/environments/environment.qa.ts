export const environment = {
  production: false,
  mode: 'qa',
  
  // URLs de API
  apiUrl: 'http://10.10.250.168:3012',
  apiUrlImg: 'http://10.10.254.127:3013',
  
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
  
  // Configuración específica de QA
  qaMode: true,
  allowTestData: true,
  enableExtraLogging: true,
  testMode: true,
  
  // Configuración de caché
  cacheEnabled: true,
  cacheTimeout: 300000, // 5 minutos
  
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
  enableAnalytics: false,
  analyticsId: 'QA-ANALYTICS-ID'
};