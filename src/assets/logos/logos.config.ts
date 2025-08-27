export interface LogoConfig {
    name: string;
    path: string;
    alt: string;
    type: 'logo' | 'banner' | 'image';
    dimensions?: {
        width?: string;
        height?: string;
    };
}

export const LOGOS_CONFIG: LogoConfig[] = [
    {
        name: 'calimax-logo',
        path: 'assets/logos/ic_calimax_logo.svg',
        alt: 'Logo Calimax',
        type: 'logo',
        dimensions: {
            width: '120px',
            height: 'auto'
        }
    },
    {
        name: 'calimax-banner',
        path: 'assets/logos/ic_calimax_banner.svg',
        alt: 'Banner Calimax',
        type: 'banner',
        dimensions: {
            width: '200px',
            height: 'auto'
        }
    },
    {
        name: 'sucursal-cxpen-27',
        path: 'assets/logos/Banco_Sucursal_CXPEN_27.jpg',
        alt: 'Sucursal CXPEN 27',
        type: 'image',
        dimensions: {
            width: '100%',
            height: 'auto'
        }
    },
    {
        name: 'sucursal-cxpen-31',
        path: 'assets/logos/Banco_Sucursal_CXPEN_31.jpg',
        alt: 'Sucursal CXPEN 31',
        type: 'image',
        dimensions: {
            width: '100%',
            height: 'auto'
        }
    },
    {
        name: 'sucursal-cxpen-41',
        path: 'assets/logos/Banco_Sucursal_CXPEN_41.jpg',
        alt: 'Sucursal CXPEN 41',
        type: 'image',
        dimensions: {
            width: '100%',
            height: 'auto'
        }
    },
    {
        name: 'sucursal-cxpen-52',
        path: 'assets/logos/Banco_Sucursal_CXPEN_52.jpg',
        alt: 'Sucursal CXPEN 52',
        type: 'image',
        dimensions: {
            width: '100%',
            height: 'auto'
        }
    },
    {
        name: 'sucursal-cxpen-58',
        path: 'assets/logos/Banco_Sucursal_CXPEN_58.jpg',
        alt: 'Sucursal CXPEN 58',
        type: 'image',
        dimensions: {
            width: '100%',
            height: 'auto'
        }
    },
    {
        name: 'fachada-popotla',
        path: 'assets/logos/Fachada CX Popotla',
        alt: 'Fachada CX Popotla',
        type: 'image',
        dimensions: {
            width: '100%',
            height: 'auto'
        }
    }
];

export const getLogoByName = (name: string): LogoConfig | undefined => {
    return LOGOS_CONFIG.find(logo => logo.name === name);
};

export const getLogosByType = (type: 'logo' | 'banner' | 'image'): LogoConfig[] => {
    return LOGOS_CONFIG.filter(logo => logo.type === type);
};
