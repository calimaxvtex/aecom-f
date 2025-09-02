export const API_CONFIG = {
    BASE_URL: 'http://localhost:3000',
    ENDPOINTS: {
        MENU: {
            CRUD: '/api/menu/v1'
        }
    }
};

// URLs completas
export const API_URLS = {
    MENU_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MENU.CRUD}`
};


