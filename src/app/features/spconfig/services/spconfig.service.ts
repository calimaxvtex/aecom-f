import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { ApiConfigService } from '../../../core/services/api/api-config.service';

import {
  SPConfig,
  SPConfigApiResponse,
  SPConfigForm,
  SPConfigAction,
  SPConfigActionParams,
  SPConfigFilters,
  SPConfigPagination,
  SPConfigQuery,
  SPParam,
  APIConfig,
  ControllerConfig
} from '../models/spconfig.interface';

import { SPCONFIG_API_CONFIG, SPCONFIG_MESSAGES } from '../models/spconfig.constants';

/**
 * Servicio para la configuración de Stored Procedures
 * Endpoints dinámicos desde ApiConfigService:
 * - SPConfig: /api/spconfig/v1 (ID dinámico)
 * - Roles: /api/adminUsr/rol (ID 2)
 * - Usuarios: /api/admusr/v1 (ID 1)
 */
@Injectable({
  providedIn: 'root'
})
export class SPConfigService {
  // Endpoint names para ApiConfigService
  private readonly ENDPOINT_NAMES = {
    SPCONFIG: 'spconfig',      // Para operaciones de SPConfig
    ROLES: 'adminUsr',         // ID 2 - Roles
    USUARIOS: 'admusr',        // ID 1 - Usuarios
    ROL_DETALLE: 'admrold',    // ID 3 - Rol Detalle
    ROL_USUARIO: 'admrolu',    // ID 4 - Rol Usuario
    MENU: 'adminMenu'          // Para operaciones de menú
  };

  private readonly httpOptions = {
    headers: new HttpHeaders(SPCONFIG_API_CONFIG.DEFAULT_HEADERS)
  };

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    console.log('🔧 SPConfigService inicializado con ApiConfigService');
  }

  /**
   * Configura la URL base del servicio (para compatibilidad)
   */
  setBaseUrl(url: string): void {
    console.log(`🔧 SPConfigService usa ApiConfigService - URL configurada: ${url}`);
    // Este método se mantiene por compatibilidad pero ahora usa ApiConfigService
  }

  /**
   * Obtiene la URL base actual desde ApiConfigService
   */
  getBaseUrl(): string {
    return this.apiConfig.getBaseUrl();
  }

  /**
   * Obtiene URL de endpoint por nombre
   */
  getEndpointUrl(endpointName: string): string {
    const endpoint = this.apiConfig.getEndpointByName(endpointName);
    if (!endpoint) {
      console.warn(`⚠️ Endpoint '${endpointName}' no encontrado en ApiConfigService`);
      return '';
    }
    return endpoint.url;
  }

  /**
   * Obtiene URL del endpoint con ID 2 (Roles) - Método solicitado
   */
  getRolesUrl(): string {
    return this.getEndpointUrl(this.ENDPOINT_NAMES.ROLES);
  }

  /**
   * Obtiene URL del endpoint de SPConfig
   */
  getSpconfigUrl(): string {
    return this.getEndpointUrl(this.ENDPOINT_NAMES.SPCONFIG);
  }

  /**
   * Obtiene URL del endpoint de Usuarios
   */
  getUsuariosUrl(): string {
    return this.getEndpointUrl(this.ENDPOINT_NAMES.USUARIOS);
  }

  /**
   * Obtiene URL del endpoint de Rol Detalle
   */
  getRolDetalleUrl(): string {
    return this.getEndpointUrl(this.ENDPOINT_NAMES.ROL_DETALLE);
  }

  /**
   * Obtiene URL del endpoint de Rol Usuario
   */
  getRolUsuarioUrl(): string {
    return this.getEndpointUrl(this.ENDPOINT_NAMES.ROL_USUARIO);
  }

  /**
   * Obtiene URL del endpoint de Menú
   */
  getMenuUrl(): string {
    return this.getEndpointUrl(this.ENDPOINT_NAMES.MENU);
  }

  /**
   * Método de debug para mostrar todas las URLs disponibles
   */
  debugUrls(): void {
    console.log('🔧 SPConfigService - URLs disponibles:');
    Object.entries(this.ENDPOINT_NAMES).forEach(([key, endpointName]) => {
      const url = this.getEndpointUrl(endpointName);
      console.log(`  ${key}: ${url || 'No disponible'}`);
    });
  }

  // ========================================
  // MÉTODOS ESPECÍFICOS PARA ENDPOINT ID 2 (ROLES)
  // ========================================

  /**
   * GET - Obtener todos los roles (ID 2)
   */
  getRoles(): Observable<any[]> {
    const url = this.getRolesUrl();
    console.log(`👥 Consultando roles desde: ${url}`);

    return this.http.get<any>(url, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          return Array.isArray(response.data) ? response.data : [response.data];
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST - Crear nuevo rol (ID 2)
   */
  createRol(rolData: any): Observable<any> {
    const url = this.getRolesUrl();
    console.log(`➕ Creando rol en: ${url}`);

    return this.http.post<any>(url, rolData, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Rol creado exitosamente`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Actualizar rol por ID (ID 2)
   */
  updateRol(id: number, rolData: any): Observable<any> {
    const baseUrl = this.getRolesUrl();
    const url = `${baseUrl}/${id}`;
    console.log(`🔄 Actualizando rol en: ${url}`);

    return this.http.put<any>(url, rolData, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Rol actualizado exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Eliminar rol por ID (ID 2)
   */
  deleteRol(id: number): Observable<any> {
    const baseUrl = this.getRolesUrl();
    const url = `${baseUrl}/${id}`;
    console.log(`🗑️ Eliminando rol en: ${url}`);

    return this.http.delete<any>(url, this.httpOptions).pipe(
      tap(response => {
        if (response.statuscode === 200) {
          console.log(`✅ Rol eliminado exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  // ========================================
  // MÉTODOS PARA OTROS ENDPOINTS ÚTILES
  // ========================================

  /**
   * GET - Obtener todos los usuarios (ID 1)
   */
  getUsuarios(): Observable<any[]> {
    const url = this.getUsuariosUrl();
    console.log(`👤 Consultando usuarios desde: ${url}`);

    return this.http.get<any>(url, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          return Array.isArray(response.data) ? response.data : [response.data];
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Obtener todos los permisos de roles (ID 4)
   */
  getPermisosRoles(): Observable<any[]> {
    const url = this.getRolUsuarioUrl();
    console.log(`🔐 Consultando permisos de roles desde: ${url}`);

    return this.http.get<any>(url, this.httpOptions).pipe(
      map(response => {
        if (response.statuscode === 200 && response.data) {
          return Array.isArray(response.data) ? response.data : [response.data];
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }


  /**
   * GET - Consulta de configuraciones de SP
   * Si no se especifica id, regresa todas las configuraciones
   */
  getSPConfigs(id?: number): Observable<SPConfig[]> {
    const baseUrl = this.getSpconfigUrl();
    let url = baseUrl;

    if (id) {
      url = `${baseUrl}/${id}`;
    }

    console.log(`🔍 Consultando SPConfigs desde: ${url}`);

    return this.http.get<SPConfigApiResponse>(url, this.httpOptions).pipe(
      map(response => {
        if (response.statusCode === 200 && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Obtiene una configuración específica por ID
   */
  getSPConfigById(id: number): Observable<SPConfig | null> {
    return this.getSPConfigs(id).pipe(
      map(configs => configs.length > 0 ? configs[0] : null)
    );
  }

  /**
   * POST - Crear nueva configuración de SP
   */
  createSPConfig(config: SPConfigForm): Observable<SPConfigApiResponse> {
    const url = this.getSpconfigUrl();

    console.log(`📝 Creando SPConfig en: ${url}`);

    return this.http.post<SPConfigApiResponse>(url, config, this.httpOptions).pipe(
      tap(response => {
        if (response.statusCode === 200) {
          console.log(`✅ Stored Procedure configurado exitosamente: ${config.nombre}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH - Actualizar atributos específicos de la configuración
   */
  updateSPConfig(id: number, config: Partial<SPConfigForm>): Observable<SPConfigApiResponse> {
    const baseUrl = this.getSpconfigUrl();
    const url = `${baseUrl}/${id}`;

    console.log(`🔄 Actualizando SPConfig en: ${url}`);

    return this.http.patch<SPConfigApiResponse>(url, config, this.httpOptions).pipe(
      tap(response => {
        if (response.statusCode === 200) {
          console.log(`✅ Configuración de SP actualizada exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Actualización completa de la configuración
   */
  updateSPConfigCompleto(id: number, config: SPConfigForm): Observable<SPConfigApiResponse> {
    const baseUrl = this.getSpconfigUrl();
    const url = `${baseUrl}/${id}`;

    console.log(`🔄 Actualizando SPConfig completamente en: ${url}`);

    return this.http.put<SPConfigApiResponse>(url, config, this.httpOptions).pipe(
      tap(response => {
        if (response.statusCode === 200) {
          console.log(`✅ Configuración de SP actualizada completamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Eliminar configuración de SP
   */
  deleteSPConfig(id: number): Observable<SPConfigApiResponse> {
    const baseUrl = this.getSpconfigUrl();
    const url = `${baseUrl}/${id}`;

    console.log(`🗑️ Eliminando SPConfig en: ${url}`);

    return this.http.delete<SPConfigApiResponse>(url, this.httpOptions).pipe(
      tap(response => {
        if (response.statusCode === 200) {
          console.log(`🗑️ Configuración de SP eliminada exitosamente: ID ${id}`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * POST UTILITARIO - Método universal con atributo "action"
   * SL -> consulta
   * UP -> actualizar el id definido
   * IN -> insert (si no se manda será insert o se puede poner explícito)
   * DL -> eliminar el registro señalado por el id
   */
  executeAction(action: SPConfigAction, data?: any): Observable<SPConfigApiResponse> {
    const url = this.getSpconfigUrl();
    const body = { action, ...data };

    console.log(`🔧 Ejecutando acción de SPConfig: ${action}`, body);
    console.log(`📍 URL: ${url}`);

    return this.http.post<SPConfigApiResponse>(url, body, this.httpOptions).pipe(
      tap(response => {
        if (response.statusCode === 200) {
          console.log(`✅ Acción de SPConfig ${action} ejecutada exitosamente`);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Métodos de utilidad usando executeAction
   */
  
  /**
   * SL - Consulta de configuraciones usando executeAction
   */
  selectSPConfigs(filters?: SPConfigFilters): Observable<SPConfig[]> {
    return this.executeAction('SL', { filters }).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * IN - Insertar configuración usando executeAction
   */
  insertSPConfig(config: SPConfigForm): Observable<SPConfigApiResponse> {
    return this.executeAction('IN', { data: config });
  }

  /**
   * UP - Actualizar configuración usando executeAction
   */
  updateSPConfigAction(id: number, config: Partial<SPConfigForm>): Observable<SPConfigApiResponse> {
    return this.executeAction('UP', { id, data: config });
  }

  /**
   * DL - Eliminar configuración usando executeAction
   */
  deleteSPConfigAction(id: number): Observable<SPConfigApiResponse> {
    return this.executeAction('DL', { id });
  }

  /**
   * Métodos específicos para gestión de SPs
   */

  /**
   * Obtener SPs por base de datos
   */
  getSPsPorBaseDatos(db: string): Observable<SPConfig[]> {
    return this.getSPConfigs().pipe(
      map(configs => configs.filter(config => config.db === db))
    );
  }

  /**
   * Obtener SPs por estado
   */
  getSPsPorEstado(estado: string): Observable<SPConfig[]> {
    return this.getSPConfigs().pipe(
      map(configs => configs.filter(config => config.estado === estado))
    );
  }

  /**
   * Obtener SPs habilitados para API (swApi = 1)
   */
  getSPsHabilitadosParaAPI(): Observable<SPConfig[]> {
    return this.getSPConfigs().pipe(
      map(configs => configs.filter(config => config.swApi === 1))
    );
  }

  /**
   * Obtener SPs por método HTTP
   */
  getSPsPorMetodo(metodo: string): Observable<SPConfig[]> {
    return this.getSPConfigs().pipe(
      map(configs => configs.filter(config => config.metodo === metodo))
    );
  }

  /**
   * Obtener SPs por ruta
   */
  getSPsPorRuta(ruta: string): Observable<SPConfig[]> {
    return this.getSPConfigs().pipe(
      map(configs => configs.filter(config => config.ruta === ruta))
    );
  }

  /**
   * Verificar si existe un SP con el mismo nombre
   */
  checkSPExists(nombre: string, excludeId?: number): Observable<boolean> {
    return this.getSPConfigs().pipe(
      map(configs => {
        return configs.some(config => 
          config.nombre.toLowerCase() === nombre.toLowerCase() && 
          config.id_sp !== excludeId
        );
      })
    );
  }

  /**
   * Validar parámetros JSON de SP
   */
  validateSPParams(params: string): boolean {
    try {
      const parsedParams = JSON.parse(params);
      return Array.isArray(parsedParams) && parsedParams.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parsear parámetros JSON de SP
   */
  parseSPParams(params: string): SPParam[] {
    try {
      return JSON.parse(params);
    } catch (error) {
      console.error('Error al parsear parámetros del SP:', error);
      return [];
    }
  }

  /**
   * Generar configuración de API desde SP
   */
  generateAPIConfig(spConfig: SPConfig): APIConfig {
    return {
      ruta: spConfig.ruta,
      apiName: spConfig.apiName,
      metodo: spConfig.metodo,
      keyId: spConfig.keyId,
      swApi: spConfig.swApi
    };
  }

  /**
   * Generar configuración de controlador
   */
  generateControllerConfig(spConfig: SPConfig): ControllerConfig {
    const apiConfig = this.generateAPIConfig(spConfig);
    const parameters = this.parseSPParams(spConfig.params);

    return {
      spName: spConfig.nombre,
      dbName: spConfig.db,
      apiConfig: apiConfig,
      parameters: parameters,
      estado: spConfig.estado
    };
  }

  /**
   * Generar código de controlador para un SP
   */
  generateControllerCode(spConfig: SPConfig): string {
    const controllerConfig = this.generateControllerConfig(spConfig);
    
    // Plantilla básica de controlador
    let controllerCode = `// Controlador generado para: ${controllerConfig.spName}\n`;
    controllerCode += `// Base de datos: ${controllerConfig.dbName}\n`;
    controllerCode += `// Método HTTP: ${controllerConfig.apiConfig.metodo}\n\n`;
    
    controllerCode += `@Controller('${controllerConfig.apiConfig.ruta}')\n`;
    controllerCode += `export class ${controllerConfig.spName}Controller {\n\n`;
    
    // Método principal
    controllerCode += `  @${controllerConfig.apiConfig.metodo}('${controllerConfig.apiConfig.apiName}')\n`;
    controllerCode += `  async execute(@Body() data: any): Promise<any> {\n`;
    controllerCode += `    // Implementar lógica del SP\n`;
    controllerCode += `    return { message: 'SP ${controllerConfig.spName} ejecutado' };\n`;
    controllerCode += `  }\n\n`;
    
    controllerCode += `}\n`;
    
    return controllerCode;
  }

  /**
   * Métodos de búsqueda y filtrado
   */

  /**
   * Buscar SPs por nombre o ruta
   */
  searchSPConfigs(query: string): Observable<SPConfig[]> {
    if (!query || query.trim().length === 0) {
      return this.getSPConfigs();
    }

    return this.getSPConfigs().pipe(
      map(configs => 
        configs.filter(config => 
          config.nombre.toLowerCase().includes(query.toLowerCase()) ||
          config.ruta.toLowerCase().includes(query.toLowerCase()) ||
          config.apiName.toLowerCase().includes(query.toLowerCase()) ||
          config.db.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }

  /**
   * Obtener SPs activos (estado = 'A')
   */
  getSPsActivos(): Observable<SPConfig[]> {
    return this.getSPsPorEstado('A');
  }

  /**
   * Obtener SPs inactivos (estado = 'I')
   */
  getSPsInactivos(): Observable<SPConfig[]> {
    return this.getSPsPorEstado('I');
  }

  /**
   * Obtener SPs en desarrollo (estado = 'D')
   */
  getSPsEnDesarrollo(): Observable<SPConfig[]> {
    return this.getSPsPorEstado('D');
  }

  /**
   * Obtener SPs con paginación
   */
  getSPsPaginados(pagination: SPConfigPagination): Observable<{ sps: SPConfig[], total: number }> {
    return this.getSPConfigs().pipe(
      map(configs => {
        const { page, limit, sortBy, sortOrder } = pagination;
        
        // Aplicar ordenamiento
        let sortedConfigs = [...configs];
        if (sortBy) {
          sortedConfigs.sort((a, b) => {
            const aValue = a[sortBy as keyof SPConfig];
            const bValue = b[sortBy as keyof SPConfig];
            
            if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
            if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
            return 0;
          });
        }
        
        // Aplicar paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedConfigs = sortedConfigs.slice(startIndex, endIndex);
        
        return {
          sps: paginatedConfigs,
          total: configs.length
        };
      })
    );
  }

  /**
   * Obtener SPs ordenados por nombre
   */
  getSPsOrdenadosPorNombre(ascendente: boolean = true): Observable<SPConfig[]> {
    return this.getSPConfigs().pipe(
      map(configs => {
        return configs.sort((a, b) => {
          if (ascendente) {
            return a.nombre.localeCompare(b.nombre);
          } else {
            return b.nombre.localeCompare(a.nombre);
          }
        });
      })
    );
  }

  /**
   * Obtener SPs por rango de fechas de modificación
   */
  getSPsPorRangoFechas(fechaDesde: string, fechaHasta: string): Observable<SPConfig[]> {
    return this.getSPConfigs().pipe(
      map(configs => {
        const desde = new Date(fechaDesde);
        const hasta = new Date(fechaHasta);
        
        return configs.filter(config => {
          const fechaModificacion = new Date(config.fecha_m);
          return fechaModificacion >= desde && fechaModificacion <= hasta;
        });
      })
    );
  }

  /**
   * Probar conectividad con la API
   */
  testConnection(): Observable<boolean> {
    const url = this.getSpconfigUrl();
    console.log(`🔍 Probando conexión con: ${url}`);

    return this.http.get<SPConfigApiResponse>(url, this.httpOptions).pipe(
      map(response => {
        console.log('✅ Conexión exitosa con la API de SPConfig');
        return true;
      }),
      catchError(error => {
        console.error('❌ Error de conexión con la API de SPConfig:', error);
        return of(false);
      })
    );
  }

  /**
   * Obtener estadísticas de SPs
   */
  getEstadisticasSPs(): Observable<{
    total: number;
    activos: number;
    inactivos: number;
    suspendidos: number;
    bloqueados: number;
    enDesarrollo: number;
    habilitadosParaAPI: number;
    porBaseDatos: { [key: string]: number };
    porMetodo: { [key: string]: number };
  }> {
    return this.getSPConfigs().pipe(
      map(configs => {
        const total = configs.length;
        const activos = configs.filter(sp => sp.estado === 'A').length;
        const inactivos = configs.filter(sp => sp.estado === 'I').length;
        const suspendidos = configs.filter(sp => sp.estado === 'S').length;
        const bloqueados = configs.filter(sp => sp.estado === 'B').length;
        const enDesarrollo = configs.filter(sp => sp.estado === 'D').length;
        const habilitadosParaAPI = configs.filter(sp => sp.swApi === 1).length;

        // Agrupar por base de datos
        const porBaseDatos: { [key: string]: number } = {};
        configs.forEach(sp => {
          porBaseDatos[sp.db] = (porBaseDatos[sp.db] || 0) + 1;
        });

        // Agrupar por método HTTP
        const porMetodo: { [key: string]: number } = {};
        configs.forEach(sp => {
          porMetodo[sp.metodo] = (porMetodo[sp.metodo] || 0) + 1;
        });

        return {
          total,
          activos,
          inactivos,
          suspendidos,
          bloqueados,
          enDesarrollo,
          habilitadosParaAPI,
          porBaseDatos,
          porMetodo
        };
      })
    );
  }

  /**
   * Exportar configuración de SPs a JSON
   */
  exportSPConfigsToJSON(): Observable<string> {
    return this.getSPConfigs().pipe(
      map(configs => {
        const exportData = {
          exportDate: new Date().toISOString(),
          totalSPs: configs.length,
          sps: configs
        };
        return JSON.stringify(exportData, null, 2);
      })
    );
  }

  /**
   * Importar configuración de SPs desde JSON
   */
  importSPConfigsFromJSON(jsonData: string): Observable<SPConfig[]> {
    try {
      const importData = JSON.parse(jsonData);
      if (importData.sps && Array.isArray(importData.sps)) {
        return of(importData.sps);
      } else {
        throw new Error('Formato de importación inválido');
      }
    } catch (error) {
      return throwError(() => new Error('Error al parsear JSON de importación'));
    }
  }

  /**
   * Manejo de errores centralizado
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en el servicio de SPConfig';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status) {
      // Error del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
    } else if (error.message) {
      // Error personalizado
      errorMessage = error.message;
    }
    
    console.error('❌ Error en SPConfigService:', error);
    
    return throwError(() => ({
      message: errorMessage,
      originalError: error
    }));
  }
}
