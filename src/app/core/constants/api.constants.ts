import { environment } from '../../../environments/environment';

export const API_CONFIG = {
    BASE_URL: environment.apiUrl,
    BASE_URL_IMG: environment.apiUrlImg,
    ENDPOINTS: {
        MENU: { CRUD: '/api/menu/v1' },
        SPCONFIG: { GET: '/api/spconfig/v1' },
        APIC: { CONFIG: '/apic/config' },
        COLL: { CRUD: '/api/admcoll/v1' },
        COLLD: { CRUD: '/api/admcolld/v1' },
        SUC: { CRUD: '/api/admsuc/v1' },
        BANNER: { UPLOAD: '/upload_banner' },
        SUCURSAL: { CRUD: '/api/admsucursal/v1' },
        PROYECTO: { CRUD: '/api/admproy/v1' },
        RECETA: { CRUD: '/api/admrcta/v1' }
    }
};

// URLs completas
export const API_URLS = {
    MENU_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MENU.CRUD}`,
    SPCONFIG_GET: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPCONFIG.GET}`,
    APIC_CONFIG: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APIC.CONFIG}`,
    COLL_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLL.CRUD}`,
    COLLD_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLLD.CRUD}`,
    SUC_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUC.CRUD}`,
    BANNER_UPLOAD: `${API_CONFIG.BASE_URL_IMG}${API_CONFIG.ENDPOINTS.BANNER.UPLOAD}`,  // ✅ Usa BASE_URL_IMG
    SUCURSAL_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUCURSAL.CRUD}`,
    PROYECTO_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROYECTO.CRUD}`,
    RECETA_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RECETA.CRUD}`
};


