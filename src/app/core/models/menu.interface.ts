// Interfaces para el CRUD de menú basadas en los JSONs proporcionados

export interface MenuCrudItem {
    id_menu: number;
    id_padre: number;
    orden: number;
    nivel: number;
    label: string;
    icon: string;
    swItenms: boolean;
    routerLink: string | null;
    visible: boolean;
    disable: boolean | null;
    tooltip: string | null;
    separator: boolean | null;
    fecha_m: string;
    usu_a: string;
}

export interface MenuCrudResponse {
    statuscode: number;
    mensaje: string;
    data: MenuCrudItem[];
}

// Interface para respuestas individuales (POST, DELETE)
export interface MenuCrudSingleResponse {
    statuscode: number;
    mensaje: string;
    data: MenuCrudItem;
}

export interface MenuApiItem {
    icon: string;
    label: string;
    items?: MenuApiItem[];  // Hacer opcional
    routerLink?: string;    // Hacer opcional
    visible: boolean;
    disable: boolean;
    separator: boolean;
    tooltip: string;
}

export interface MenuApiResponse {
    statuscode: number;
    mensaje: string;
    data: MenuApiItem[];
}

// Interface para respuesta HTTP cruda (puede ser array o objeto)
export interface MenuHttpResponse {
    statuscode?: number;
    mensaje?: string;
    data?: MenuApiItem[];
    executionId?: string;
    procedureName?: string;
}

// Interface para el formulario
export interface MenuFormItem {
    id_menu?: number | null;
    id_padre: number | null;
    orden: number | null;
    nivel: number | null;
    label: string | null;
    icon: string | null;
    swItenms: boolean | null;
    routerLink: string | null;
    visible: boolean | null;
    disable: boolean | null;
    tooltip: string | null;
    separator: boolean | null;
}
