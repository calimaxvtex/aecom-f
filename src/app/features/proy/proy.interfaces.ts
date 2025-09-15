// =============================================================================
// PROY INTERFACES - Catálogos de Proyectos
// =============================================================================
// Fecha de creación: ${new Date().toISOString().split('T')[0]}
// Descripción: Interfaces para el módulo de proyectos
// =============================================================================

/**
 * Interface principal para un Proyecto
 * Representa la estructura de datos de un proyecto en el sistema
 */
export interface ProyItem {
    /** Identificador único del proyecto */
    id_proy: number;

    /** Descripción del proyecto */
    descripcion: string;

    /** Estado del proyecto (A=Activo, I=Inactivo) */
    estado: 'A' | 'I';

    /** Usuario que creó/modificó el proyecto */
    usuario: string;

    /** Fecha de creación/modificación en formato YYYY-MM-DD */
    fecha: string;

    /** Indicador de imagen (0=No tiene, 1=Si tiene) */
    imagen: number;

    /** Estado de alta del proyecto (1=Activo, 0=Inactivo) */
    edo_Alta: number;
}

/**
 * Interface para la respuesta de la API de proyectos
 * Patrón estándar de respuesta utilizado en todo el proyecto
 */
export interface ProyResponse {
    /** Código de estado HTTP (200=éxito) */
    statuscode: number;

    /** Mensaje descriptivo de la respuesta */
    mensaje: string;

    /** Array de datos de proyectos */
    data: ProyItem[];
}

/**
 * Interface para respuesta de array de proyectos
 * Utilizada cuando la API retorna directamente un array
 */
export interface ProyArrayResponse {
    /** Código de estado HTTP */
    statuscode: number;

    /** Mensaje descriptivo */
    mensaje: string;

    /** Array directo de proyectos */
    data: ProyItem[];
}

/**
 * Interface para respuesta de un solo proyecto
 * Utilizada en operaciones que retornan un solo registro
 */
export interface ProySingleResponse {
    /** Código de estado HTTP */
    statuscode: number;

    /** Mensaje descriptivo */
    mensaje: string;

    /** Datos del proyecto individual */
    data: ProyItem;
}

/**
 * Interface para crear un nuevo proyecto
 * Contiene solo los campos necesarios para la creación
 */
export interface CreateProyRequest {
    /** Acción a realizar (IN=Insert) */
    action: 'IN';

    /** Descripción del proyecto */
    descripcion: string;

    /** Estado inicial del proyecto (por defecto 'A') */
    estado?: 'A' | 'I';

    /** Usuario que crea el proyecto */
    usr: string | number;

    /** ID de sesión del usuario */
    id_session: number;

    /** Fecha del proyecto */
    fecha?: string;

    /** Indicador de imagen (0=No tiene, 1=Si tiene) */
    imagen?: number;

    /** Estado de alta del proyecto (1=Activo, 0=Inactivo) */
    edo_Alta?: number;
}

/**
 * Interface para actualizar un proyecto existente
 * Contiene campos para actualización con ID del proyecto
 */
export interface UpdateProyRequest {
    /** Acción a realizar (UP=Update) */
    action: 'UP';

    /** ID del proyecto a actualizar */
    id_proy: number;

    /** Descripción del proyecto */
    descripcion?: string;

    /** Estado del proyecto */
    estado?: 'A' | 'I';

    /** Indicador de imagen */
    imagen?: number;

    /** Estado de alta */
    edo_Alta?: number;

    /** Usuario que realiza la actualización */
    usr: string | number;

    /** ID de sesión del usuario */
    id_session: number;
}

/**
 * Interface para eliminar un proyecto
 * Contiene solo el ID necesario para eliminación
 */
export interface DeleteProyRequest {
    /** Acción a realizar (DL=Delete) */
    action: 'DL';

    /** ID del proyecto a eliminar */
    id_proy: number;

    /** Usuario que realiza la eliminación */
    usr: string | number;

    /** ID de sesión del usuario */
    id_session: number;
}

/**
 * Interface para consultar proyectos
 * Utilizada para filtros y búsquedas
 */
export interface QueryProyRequest {
    /** Acción a realizar (SL=Select/Query) */
    action: 'SL';

    /** ID específico del proyecto (opcional para consulta individual) */
    id_proy?: number;

    /** Filtro por estado */
    estado?: 'A' | 'I';

    /** Usuario que realiza la consulta */
    usr: string | number;

    /** ID de sesión del usuario */
    id_session: number;
}

/**
 * Interface para filtros de búsqueda de proyectos
 * Utilizada en la interfaz de usuario para filtros avanzados
 */
export interface ProyFilters {
    /** Búsqueda por descripción */
    descripcion?: string;

    /** Filtro por estado */
    estado?: 'A' | 'I';

    /** Filtro por usuario */
    usuario?: string;

    /** Filtro por fecha desde */
    fechaDesde?: string;

    /** Filtro por fecha hasta */
    fechaHasta?: string;
}

/**
 * Tipos de utilidad para el manejo de proyectos
 */
export type ProyEstado = 'A' | 'I';
export type ProyAccion = 'IN' | 'UP' | 'DL' | 'SL';

/**
 * Constantes para estados de proyecto
 */
export const PROY_ESTADOS = {
    ACTIVO: 'A' as const,
    INACTIVO: 'I' as const
} as const;

/**
 * Constantes para acciones de API
 */
export const PROY_ACCIONES = {
    CREAR: 'IN' as const,
    ACTUALIZAR: 'UP' as const,
    ELIMINAR: 'DL' as const,
    CONSULTAR: 'SL' as const
} as const;

/**
 * Labels descriptivos para estados
 */
export const PROY_ESTADO_LABELS: Record<ProyEstado, string> = {
    A: 'Activo',
    I: 'Inactivo'
};

/**
 * Severidades para estados (compatible con PrimeNG)
 */
export const PROY_ESTADO_SEVERITIES: Record<ProyEstado, 'success' | 'danger'> = {
    A: 'success',
    I: 'danger'
};

// =============================================================================
// FIN DE INTERFACES DE PROYECTOS
// =============================================================================
