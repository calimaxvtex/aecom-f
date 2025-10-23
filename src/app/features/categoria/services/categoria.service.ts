import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api/api-config.service';
import { SessionService } from '../../../core/services/session.service';
import {
    Categoria,
    CategoriaResponse,
    CreateCategoriaRequest,
    UpdateCategoriaRequest,
    Proyecto
} from '../models/categoria.interface';

/**
 * Servicio para la gestión de categorías de productos
 * Soporta estructura jerárquica con niveles 1 y 2
 * Endpoint obtenido dinámicamente por ID usando ApiConfigService
 */
@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private http = inject(HttpClient);
    private apiConfigService = inject(ApiConfigService);
    private sessionService = inject(SessionService);

    /**
     * Obtiene todas las categorías según filtros
     */
    getAllCategorias(filters?: {
        id_proy?: number;
        nivel?: 1 | 2;
        estado?: 'A' | 'R' | 'B';
        id_cat_padre?: number;
    }): Observable<CategoriaResponse> {
        const categoriaUrl = this.apiConfigService.getCategoriaCrudUrl();

        const payload = {
            action: 'SL',
            ...this.sessionService.getApiPayloadBase(),
            ...filters
        };

        console.log('📊 Consultando categorías desde:', categoriaUrl);
        console.log('📊 Payload:', payload);
        return this.http.post<CategoriaResponse>(categoriaUrl, payload);
    }

    /**
     * Crea una nueva categoría
     */
    createCategoria(categoria: CreateCategoriaRequest): Observable<any> {
        const categoriaUrl = this.apiConfigService.getCategoriaCrudUrl();

        const payload = {
            action: 'IN',
            ...categoria,
            ...this.sessionService.getApiPayloadBase()
        };

        console.log('➕ Creando categoría:', categoria);
        return this.http.post(categoriaUrl, payload);
    }

    /**
     * Actualiza una categoría existente
     */
    updateCategoria(categoria: UpdateCategoriaRequest): Observable<any> {
        const categoriaUrl = this.apiConfigService.getCategoriaCrudUrl();

        // Crear payload base
        const basePayload = {
            action: 'UP',
            id_cat: categoria.id_categoria,  // ✅ Corregido: usar id_cat en lugar de id_categoria
            nombre: categoria.nombre,
            estado: categoria.estado,
            id_proy: categoria.id_proy,
            nivel: categoria.nivel,
            // Solo incluir campos opcionales si tienen valor
            ...(categoria.id_cat_padre !== null && categoria.id_cat_padre !== undefined && { id_cat_padre: categoria.id_cat_padre }),
            ...(categoria.url_img_web && { url_img_web: categoria.url_img_web }),
            ...(categoria.url_img_app && { url_img_app: categoria.url_img_app }),
            ...(categoria.url_min_web && { url_min_web: categoria.url_min_web }),
            ...(categoria.url_min_app && { url_min_app: categoria.url_min_app }),
            // Agregar datos de sesión
            ...this.sessionService.getApiPayloadBase()
        };

        console.log('📝 Actualizando categoría - Data original:', categoria);
        console.log('📝 URL:', categoriaUrl);
        console.log('📝 Payload final:', basePayload);

        return this.http.post(categoriaUrl, basePayload);
    }

    /**
     * Elimina una categoría
     */
    deleteCategoria(idCategoria: number): Observable<any> {
        const categoriaUrl = this.apiConfigService.getCategoriaCrudUrl();

        const payload = {
            action: 'DL',
            id_cat: idCategoria,  // ✅ Corregido: usar id_cat en lugar de id_categoria
            ...this.sessionService.getApiPayloadBase()
        };

        console.log('🗑️ Eliminando categoría ID:', idCategoria);
        console.log('🗑️ Payload:', payload);
        return this.http.post(categoriaUrl, payload);
    }

    /**
     * Actualiza un campo específico de una categoría
     */
    updateCategoriaField(idCategoria: number, field: string, value: any): Observable<any> {
        const categoriaUrl = this.apiConfigService.getCategoriaCrudUrl();

        const payload = {
            action: 'UP',
            id_cat: idCategoria,  // ✅ Corregido: usar id_cat en lugar de id_categoria
            [field]: value,
            ...this.sessionService.getApiPayloadBase()
        };

        console.log('🔄 Actualizando campo:', { idCategoria, field, value });
        console.log('🔄 Payload:', payload);
        return this.http.post(categoriaUrl, payload);
    }

    /**
     * Obtiene categorías por nivel y proyecto
     */
    getCategoriasByNivel(idProyecto: number, nivel: 1 | 2, idPadre?: number): Observable<CategoriaResponse> {
        const filters: any = {
            id_proy: idProyecto,
            nivel: nivel,
            estado: 'A'
        };

        if (idPadre && nivel === 2) {
            filters.id_cat_padre = idPadre;
        }

        return this.getAllCategorias(filters);
    }

    /**
     * Obtiene categorías padre (nivel 1) activas de un proyecto
     */
    getCategoriasPadre(idProyecto: number): Observable<CategoriaResponse> {
        return this.getCategoriasByNivel(idProyecto, 1);
    }

    /**
     * Obtiene subcategorías (nivel 2) de una categoría padre
     */
    getSubcategorias(idProyecto: number, idPadre: number): Observable<CategoriaResponse> {
        return this.getCategoriasByNivel(idProyecto, 2, idPadre);
    }
}