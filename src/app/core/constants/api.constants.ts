export const API_CONFIG = {
    BASE_URL: 'http://localhost:3000',
   // BASE_URL: 'http://10.10.250.168:3012',
    ENDPOINTS: {
        MENU: {CRUD: '/api/menu/v1'},
        SPCONFIG: {GET: '/api/spconfig/v1'},
        APIC: {CONFIG: '/apic/config'},
        COLL: {CRUD: '/api/admcoll/v1'},
        COLLD: {CRUD: '/api/admcolld/v1'}
    }
};

// URLs completas
export const API_URLS = {
    MENU_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MENU.CRUD}`,
    SPCONFIG_GET: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPCONFIG.GET}`,
    APIC_CONFIG: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APIC.CONFIG}`,
    COLL_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLL.CRUD}`,
    COLLD_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COLLD.CRUD}`
};


