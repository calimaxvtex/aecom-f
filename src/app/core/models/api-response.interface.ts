export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    errors?: string[];
    pagination?: PaginationInfo;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: any;
    timestamp?: string;
}

export interface ApiSuccess<T> {
    data: T;
    message: string;
    timestamp: string;
}



