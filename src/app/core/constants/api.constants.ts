export const API_CONFIG = {
   // BASE_URL: 'http://localhost:3000',
    //BASE_URL: 'http://10.10.250.168:3012',
   // BASE_URL: 'http://10.10.254.127:3012',
    BASE_URL: 'https://ec.calimax.digital',
    BASE_URL_IMG: 'http://10.10.254.127:3013',
    ENDPOINTS: {
        MENU: {CRUD: '/api/menu/v1'},
        SPCONFIG: {GET: '/api/spconfig/v1'},
        APIC: {CONFIG: '/apic/config'},
        COLL: {CRUD: '/api/admcoll/v1'},
        COLLD: {CRUD: '/api/admcolld/v1'},
        SUC: {CRUD: '/api/admsuc/v1'},
        BANNER: {UPLOAD: '/upload_banner'},
        SUCURSAL: {CRUD: '/api/admsucursal/v1'},
        PROYECTO: {CRUD: '/api/admproy/v1'}
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
    PROYECTO_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROYECTO.CRUD}`
};


