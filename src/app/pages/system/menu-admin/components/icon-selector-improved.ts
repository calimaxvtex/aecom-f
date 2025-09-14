import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

interface IconItem {
    class: string;
    name: string;
    keywords: string[];
    category: string;
}

interface IconCategory {
    name: string;
    label: string;
    icons: IconItem[];
}

@Component({
    selector: 'app-icon-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, TabsModule, ButtonModule, TooltipModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IconSelectorImproved),
            multi: true
        }
    ],
    template: `
        <div class="icon-selector">
            <!-- Búsqueda mejorada -->
            <div class="mb-3">
                <div class="flex gap-2">
                    <input 
                        pInputText 
                        [(ngModel)]="searchText"
                        placeholder="Buscar icono... (ej: usuario, casa, configuración)"
                        class="flex-1"
                        (input)="filterIcons()"
                    />
                    <button 
                        pButton 
                        icon="pi pi-times" 
                        class="p-button-text p-button-sm"
                        (click)="clearSearch()"
                        *ngIf="searchText"
                        pTooltip="Limpiar búsqueda"
                    ></button>
                </div>
                <!-- Sugerencias rápidas -->
                <div class="mt-2" *ngIf="suggestedIcons.length > 0 && !searchText">
                    <small class="text-gray-600">💡 Sugeridos para "{{currentLabel}}":</small>
                    <div class="flex gap-1 mt-1">
                        <button 
                            *ngFor="let icon of suggestedIcons" 
                            pButton 
                            class="p-button-sm p-button-outlined p-button-text"
                            (click)="selectIcon(icon)"
                            [pTooltip]="icon"
                        >
                            <i [class]="icon" class="text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Pestañas por categorías -->
            <p-tabs>
                <p-tabPanel header="Todos" *ngIf="searchText">
                    <div class="icon-grid">
                        <div *ngFor="let icon of filteredIcons" 
                             class="icon-item"
                             [class.selected]="_value === icon.class"
                             (click)="selectIcon(icon.class)"
                             [title]="icon.name + ' - ' + icon.keywords.join(', ')">
                            <i [class]="icon.class"></i>
                            <span class="icon-name">{{icon.name}}</span>
                        </div>
                    </div>
                </p-tabPanel>
                
                <p-tabPanel *ngFor="let category of categories" [header]="category.label">
                    <div class="icon-grid">
                        <div *ngFor="let icon of category.icons" 
                             class="icon-item"
                             [class.selected]="_value === icon.class"
                             (click)="selectIcon(icon.class)"
                             [title]="icon.name + ' - ' + icon.keywords.join(', ')">
                            <i [class]="icon.class"></i>
                            <span class="icon-name">{{icon.name}}</span>
                        </div>
                    </div>
                </p-tabPanel>
            </p-tabs>
        </div>
    `,
    styles: [`
        .icon-selector {
            max-height: 450px;
            overflow-y: auto;
        }
        
        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.5rem;
            padding: 0.5rem 0;
        }
        
        .icon-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.2s ease;
            background: white;
        }
        
        .icon-item:hover {
            border-color: var(--primary-color);
            background: #f8fafc;
            transform: translateY(-1px);
        }
        
        .icon-item.selected {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        
        .icon-item i {
            font-size: 1.25rem;
            margin-bottom: 0.25rem;
        }
        
        .icon-name {
            font-size: 0.7rem;
            text-align: center;
            word-break: break-word;
            line-height: 1.2;
        }

        .p-tabs .p-tabpanel {
            padding: 0.5rem 0;
        }

        .p-tabs .p-tablist .p-tab {
            margin-right: 0.25rem;
        }
    `]
})
export class IconSelectorImproved implements ControlValueAccessor, OnInit {
    @Input() selectedIcon: string = '';
    @Input() currentLabel: string = ''; // Para sugerencias
    @Output() selectedIconChange = new EventEmitter<string>();

    // ControlValueAccessor implementation
    _value: string = '';
    private _onChange = (value: string) => {};
    private _onTouched = () => {};
    disabled = false;

    searchText = '';
    filteredIcons: IconItem[] = [];
    suggestedIcons: string[] = [];
    categories: IconCategory[] = [];

    // Base de datos completa de iconos con metadata
    private allIconsData: IconItem[] = [
        // NAVEGACIÓN Y LAYOUT
        { class: 'pi pi-home', name: 'Inicio', keywords: ['casa', 'inicio', 'principal', 'home'], category: 'navigation' },
        { class: 'pi pi-th-large', name: 'Dashboard', keywords: ['panel', 'tablero', 'dashboard', 'cuadros'], category: 'navigation' },
        { class: 'pi pi-bars', name: 'Menú', keywords: ['menu', 'hamburguesa', 'lista', 'opciones'], category: 'navigation' },
        { class: 'pi pi-sitemap', name: 'Mapa del sitio', keywords: ['estructura', 'organigrama', 'jerarquia'], category: 'navigation' },
        { class: 'pi pi-compass', name: 'Brújula', keywords: ['direccion', 'navegacion', 'orientacion'], category: 'navigation' },
        { class: 'pi pi-map', name: 'Mapa', keywords: ['ubicacion', 'geografia', 'lugar'], category: 'navigation' },
        { class: 'pi pi-directions', name: 'Direcciones', keywords: ['ruta', 'camino', 'navegacion'], category: 'navigation' },
        { class: 'pi pi-arrow-up', name: 'Arriba', keywords: ['subir', 'superior', 'norte'], category: 'navigation' },
        { class: 'pi pi-arrow-down', name: 'Abajo', keywords: ['bajar', 'inferior', 'sur'], category: 'navigation' },
        { class: 'pi pi-arrow-left', name: 'Izquierda', keywords: ['atras', 'oeste', 'anterior'], category: 'navigation' },
        { class: 'pi pi-arrow-right', name: 'Derecha', keywords: ['adelante', 'este', 'siguiente'], category: 'navigation' },
        { class: 'pi pi-chevron-up', name: 'Flecha arriba', keywords: ['expandir', 'mostrar', 'subir'], category: 'navigation' },
        { class: 'pi pi-chevron-down', name: 'Flecha abajo', keywords: ['colapsar', 'ocultar', 'bajar'], category: 'navigation' },
        { class: 'pi pi-chevron-left', name: 'Flecha izquierda', keywords: ['retroceder', 'anterior', 'atras'], category: 'navigation' },
        { class: 'pi pi-chevron-right', name: 'Flecha derecha', keywords: ['avanzar', 'siguiente', 'adelante'], category: 'navigation' },
        
        // USUARIOS Y PERSONAS
        { class: 'pi pi-user', name: 'Usuario', keywords: ['persona', 'perfil', 'cuenta', 'individual'], category: 'users' },
        { class: 'pi pi-users', name: 'Usuarios', keywords: ['personas', 'grupo', 'equipo', 'multiple'], category: 'users' },
        { class: 'pi pi-user-plus', name: 'Agregar usuario', keywords: ['nuevo', 'añadir', 'crear', 'invitar'], category: 'users' },
        { class: 'pi pi-user-minus', name: 'Quitar usuario', keywords: ['eliminar', 'remover', 'borrar'], category: 'users' },
        { class: 'pi pi-user-edit', name: 'Editar usuario', keywords: ['modificar', 'cambiar', 'actualizar'], category: 'users' },
        { class: 'pi pi-id-card', name: 'Identificación', keywords: ['credencial', 'documento', 'carnet'], category: 'users' },
        { class: 'pi pi-crown', name: 'Administrador', keywords: ['admin', 'jefe', 'corona', 'privilegios'], category: 'users' },
        { class: 'pi pi-shield', name: 'Seguridad', keywords: ['proteccion', 'escudo', 'seguro'], category: 'users' },
        
        // ARCHIVOS Y DOCUMENTOS  
        { class: 'pi pi-file', name: 'Archivo', keywords: ['documento', 'fichero', 'paper'], category: 'files' },
        { class: 'pi pi-file-o', name: 'Archivo vacío', keywords: ['nuevo', 'vacio', 'crear'], category: 'files' },
        { class: 'pi pi-file-pdf', name: 'PDF', keywords: ['documento', 'adobe', 'portatil'], category: 'files' },
        { class: 'pi pi-file-word', name: 'Word', keywords: ['documento', 'texto', 'microsoft'], category: 'files' },
        { class: 'pi pi-file-excel', name: 'Excel', keywords: ['hoja', 'calculo', 'tabla'], category: 'files' },
        { class: 'pi pi-folder', name: 'Carpeta', keywords: ['directorio', 'contenedor', 'organizacion'], category: 'files' },
        { class: 'pi pi-folder-open', name: 'Carpeta abierta', keywords: ['explorar', 'ver', 'contenido'], category: 'files' },
        { class: 'pi pi-copy', name: 'Copiar', keywords: ['duplicar', 'clonar', 'replicar'], category: 'files' },
        { class: 'pi pi-clone', name: 'Clonar', keywords: ['duplicar', 'copiar', 'replicar'], category: 'files' },
        
        // ACCIONES Y OPERACIONES
        { class: 'pi pi-plus', name: 'Agregar', keywords: ['añadir', 'crear', 'nuevo', 'sumar'], category: 'actions' },
        { class: 'pi pi-minus', name: 'Quitar', keywords: ['eliminar', 'restar', 'remover'], category: 'actions' },
        { class: 'pi pi-pencil', name: 'Editar', keywords: ['modificar', 'escribir', 'cambiar'], category: 'actions' },
        { class: 'pi pi-trash', name: 'Eliminar', keywords: ['borrar', 'basura', 'delete'], category: 'actions' },
        { class: 'pi pi-save', name: 'Guardar', keywords: ['almacenar', 'conservar', 'grabar'], category: 'actions' },
        { class: 'pi pi-undo', name: 'Deshacer', keywords: ['revertir', 'atras', 'cancelar'], category: 'actions' },
        { class: 'pi pi-redo', name: 'Rehacer', keywords: ['repetir', 'adelante', 'restaurar'], category: 'actions' },
        { class: 'pi pi-refresh', name: 'Actualizar', keywords: ['recargar', 'renovar', 'sincronizar'], category: 'actions' },
        { class: 'pi pi-sync', name: 'Sincronizar', keywords: ['actualizar', 'coordinar', 'unificar'], category: 'actions' },
        { class: 'pi pi-download', name: 'Descargar', keywords: ['bajar', 'obtener', 'recibir'], category: 'actions' },
        { class: 'pi pi-upload', name: 'Subir', keywords: ['cargar', 'enviar', 'publicar'], category: 'actions' },
        { class: 'pi pi-search', name: 'Buscar', keywords: ['encontrar', 'localizar', 'filtrar'], category: 'actions' },
        { class: 'pi pi-filter', name: 'Filtrar', keywords: ['seleccionar', 'cribar', 'buscar'], category: 'actions' },
        { class: 'pi pi-sort', name: 'Ordenar', keywords: ['clasificar', 'organizar', 'acomodar'], category: 'actions' },
        { class: 'pi pi-print', name: 'Imprimir', keywords: ['papel', 'documento', 'fisico'], category: 'actions' },
        { class: 'pi pi-send', name: 'Enviar', keywords: ['mandar', 'transmitir', 'despachar'], category: 'actions' },
        
        // ESTADOS Y FEEDBACK
        { class: 'pi pi-check', name: 'Correcto', keywords: ['ok', 'bien', 'aprobado', 'si'], category: 'status' },
        { class: 'pi pi-times', name: 'Error', keywords: ['mal', 'incorrecto', 'no', 'cerrar'], category: 'status' },
        { class: 'pi pi-exclamation-triangle', name: 'Advertencia', keywords: ['alerta', 'cuidado', 'atencion'], category: 'status' },
        { class: 'pi pi-info-circle', name: 'Información', keywords: ['ayuda', 'detalles', 'datos'], category: 'status' },
        { class: 'pi pi-question-circle', name: 'Pregunta', keywords: ['duda', 'ayuda', 'consulta'], category: 'status' },
        { class: 'pi pi-check-circle', name: 'Aprobado', keywords: ['correcto', 'completado', 'exitoso'], category: 'status' },
        { class: 'pi pi-times-circle', name: 'Rechazado', keywords: ['error', 'fallido', 'incorrecto'], category: 'status' },
        { class: 'pi pi-spin pi-spinner', name: 'Cargando', keywords: ['esperar', 'procesando', 'loading'], category: 'status' },
        { class: 'pi pi-clock', name: 'Tiempo', keywords: ['reloj', 'hora', 'cronometro'], category: 'status' },
        { class: 'pi pi-calendar', name: 'Fecha', keywords: ['dia', 'mes', 'año', 'evento'], category: 'status' },
        
        // CONFIGURACIÓN Y HERRAMIENTAS
        { class: 'pi pi-cog', name: 'Configuración', keywords: ['ajustes', 'opciones', 'preferencias'], category: 'settings' },
        { class: 'pi pi-cogs', name: 'Configuraciones', keywords: ['ajustes', 'multiples', 'sistema'], category: 'settings' },
        { class: 'pi pi-wrench', name: 'Herramientas', keywords: ['utilidades', 'reparar', 'ajustar'], category: 'settings' },
        { class: 'pi pi-sliders-h', name: 'Controles', keywords: ['ajustes', 'deslizadores', 'parametros'], category: 'settings' },
        { class: 'pi pi-sliders-v', name: 'Controles verticales', keywords: ['ajustes', 'parametros', 'configurar'], category: 'settings' },
        { class: 'pi pi-palette', name: 'Colores', keywords: ['diseño', 'tema', 'personalizar'], category: 'settings' },
        { class: 'pi pi-desktop', name: 'Escritorio', keywords: ['computadora', 'pantalla', 'monitor'], category: 'settings' },
        { class: 'pi pi-mobile', name: 'Móvil', keywords: ['telefono', 'celular', 'smartphone'], category: 'settings' },
        { class: 'pi pi-tablet', name: 'Tablet', keywords: ['ipad', 'dispositivo', 'tactil'], category: 'settings' },
        
        // COMUNICACIÓN Y SOCIAL
        { class: 'pi pi-envelope', name: 'Email', keywords: ['correo', 'mensaje', 'carta'], category: 'communication' },
        { class: 'pi pi-phone', name: 'Teléfono', keywords: ['llamar', 'contacto', 'numero'], category: 'communication' },
        { class: 'pi pi-comment', name: 'Comentario', keywords: ['mensaje', 'opinion', 'chat'], category: 'communication' },
        { class: 'pi pi-comments', name: 'Conversación', keywords: ['chat', 'dialogo', 'multiple'], category: 'communication' },
        { class: 'pi pi-inbox', name: 'Bandeja', keywords: ['recibidos', 'mensajes', 'correos'], category: 'communication' },
        { class: 'pi pi-share-alt', name: 'Compartir', keywords: ['enviar', 'distribuir', 'difundir'], category: 'communication' },
        { class: 'pi pi-link', name: 'Enlace', keywords: ['url', 'vinculo', 'conexion'], category: 'communication' },
        { class: 'pi pi-at', name: 'Arroba', keywords: ['email', 'mencion', 'direccion'], category: 'communication' },
        
        // COMERCIO Y FINANZAS EXPANDIDO
        { class: 'pi pi-shopping-cart', name: 'Carrito', keywords: ['compras', 'productos', 'tienda'], category: 'commerce' },
        { class: 'pi pi-shopping-bag', name: 'Bolsa de compras', keywords: ['productos', 'tienda', 'mercado'], category: 'commerce' },
        { class: 'pi pi-credit-card', name: 'Tarjeta', keywords: ['pago', 'credito', 'dinero'], category: 'commerce' },
        { class: 'pi pi-money-bill', name: 'Dinero', keywords: ['efectivo', 'billete', 'pago'], category: 'commerce' },
        { class: 'pi pi-dollar', name: 'Dólar', keywords: ['dinero', 'precio', 'costo'], category: 'commerce' },
        { class: 'pi pi-percentage', name: 'Porcentaje', keywords: ['descuento', 'oferta', 'promocion'], category: 'commerce' },
        { class: 'pi pi-gift', name: 'Regalo', keywords: ['presente', 'obsequio', 'promocion'], category: 'commerce' },
        { class: 'pi pi-tag', name: 'Etiqueta', keywords: ['precio', 'categoria', 'marca'], category: 'commerce' },
        { class: 'pi pi-tags', name: 'Etiquetas', keywords: ['categorias', 'clasificacion', 'multiple'], category: 'commerce' },

        // ICONOS E-COMMERCE ADICIONALES
        { class: 'pi pi-box', name: 'Paquete', keywords: ['caja', 'producto', 'envio', 'empaque'], category: 'commerce' },
        { class: 'pi pi-briefcase', name: 'Maletín', keywords: ['negocios', 'portafolio', 'trabajo'], category: 'commerce' },
        { class: 'pi pi-building', name: 'Edificio', keywords: ['empresa', 'oficina', 'corporativo'], category: 'commerce' },
        { class: 'pi pi-chart-line', name: 'Gráfico de línea', keywords: ['estadisticas', 'ventas', 'analisis'], category: 'commerce' },
        { class: 'pi pi-chart-bar', name: 'Gráfico de barras', keywords: ['estadisticas', 'datos', 'metricas'], category: 'commerce' },
        { class: 'pi pi-chart-pie', name: 'Gráfico circular', keywords: ['estadisticas', 'proporciones', 'analisis'], category: 'commerce' },
        { class: 'pi pi-truck', name: 'Camión', keywords: ['envio', 'transporte', 'logistica', 'delivery'], category: 'commerce' },
        { class: 'pi pi-map-marker', name: 'Ubicación', keywords: ['mapa', 'direccion', 'localizacion'], category: 'commerce' },
        { class: 'pi pi-globe', name: 'Internet', keywords: ['web', 'online', 'global'], category: 'commerce' },
        { class: 'pi pi-store', name: 'Tienda', keywords: ['comercio', 'local', 'negocio'], category: 'commerce' },
        { class: 'pi pi-receipt', name: 'Recibo', keywords: ['factura', 'compra', 'ticket'], category: 'commerce' },
        { class: 'pi pi-calculator', name: 'Calculadora', keywords: ['matematicas', 'precio', 'calculo'], category: 'commerce' },
        { class: 'pi pi-euro', name: 'Euro', keywords: ['moneda', 'dinero', 'precio'], category: 'commerce' },
        { class: 'pi pi-pound', name: 'Libra', keywords: ['moneda', 'dinero', 'precio'], category: 'commerce' },
        { class: 'pi pi-yen', name: 'Yen', keywords: ['moneda', 'dinero', 'precio'], category: 'commerce' },
        { class: 'pi pi-bitcoin', name: 'Bitcoin', keywords: ['criptomoneda', 'dinero', 'digital'], category: 'commerce' },
        { class: 'pi pi-wallet', name: 'Billetera', keywords: ['dinero', 'pago', 'tarjeta'], category: 'commerce' },
        { class: 'pi pi-shipping-fast', name: 'Envío rápido', keywords: ['delivery', 'rapido', 'express'], category: 'commerce' },
        { class: 'pi pi-star-fill', name: 'Estrella llena', keywords: ['favorito', 'calificacion', 'mejor'], category: 'commerce' },
        { class: 'pi pi-star-half', name: 'Estrella media', keywords: ['calificacion', 'media', 'valoracion'], category: 'commerce' },
        { class: 'pi pi-thumbs-up', name: 'Me gusta', keywords: ['positivo', 'bueno', 'aprobado'], category: 'commerce' },
        { class: 'pi pi-thumbs-down', name: 'No me gusta', keywords: ['negativo', 'malo', 'rechazado'], category: 'commerce' },
        { class: 'pi pi-trophy', name: 'Trofeo', keywords: ['premio', 'ganador', 'mejor'], category: 'commerce' },
        { class: 'pi pi-award', name: 'Premio', keywords: ['reconocimiento', 'logro', 'distincion'], category: 'commerce' },
        { class: 'pi pi-medal', name: 'Medalla', keywords: ['premio', 'logro', 'distincion'], category: 'commerce' },
        { class: 'pi pi-crown', name: 'Corona', keywords: ['rey', 'mejor', 'premium'], category: 'commerce' },
        { class: 'pi pi-shield', name: 'Escudo', keywords: ['proteccion', 'seguridad', 'premium'], category: 'commerce' },
        { class: 'pi pi-verified', name: 'Verificado', keywords: ['confirmado', 'autentico', 'original'], category: 'commerce' },
        { class: 'pi pi-check-square', name: 'Checkbox', keywords: ['seleccion', 'marcado', 'elegido'], category: 'commerce' },
        { class: 'pi pi-list', name: 'Lista', keywords: ['inventario', 'productos', 'catalogo'], category: 'commerce' },
        { class: 'pi pi-table', name: 'Tabla', keywords: ['datos', 'informacion', 'organizado'], category: 'commerce' },
        { class: 'pi pi-grid', name: 'Cuadrícula', keywords: ['productos', 'galeria', 'organizado'], category: 'commerce' },
        { class: 'pi pi-list-check', name: 'Lista de tareas', keywords: ['checklist', 'tareas', 'pendientes'], category: 'commerce' },
        { class: 'pi pi-spinner-dotted', name: 'Cargando puntos', keywords: ['procesando', 'espera', 'loading'], category: 'commerce' },
        { class: 'pi pi-spinner', name: 'Cargando', keywords: ['procesando', 'espera', 'loading'], category: 'commerce' },
        { class: 'pi pi-circle-fill', name: 'Círculo lleno', keywords: ['punto', 'marcador', 'seleccionado'], category: 'commerce' },
        { class: 'pi pi-circle', name: 'Círculo', keywords: ['punto', 'marcador', 'opcion'], category: 'commerce' },
        { class: 'pi pi-square', name: 'Cuadrado', keywords: ['forma', 'geometria', 'bloque'], category: 'commerce' },
        { class: 'pi pi-square-fill', name: 'Cuadrado lleno', keywords: ['forma', 'geometria', 'seleccionado'], category: 'commerce' },

        // ICONOS E-COMMERCE AVANZADOS ADICIONALES
        { class: 'pi pi-cart-plus', name: 'Agregar al carrito', keywords: ['añadir', 'compra', 'seleccionar'], category: 'commerce' },
        { class: 'pi pi-cart-minus', name: 'Quitar del carrito', keywords: ['eliminar', 'restar', 'quitar'], category: 'commerce' },
        { class: 'pi pi-cart-x', name: 'Vaciar carrito', keywords: ['limpiar', 'borrar', 'vaciar'], category: 'commerce' },
        { class: 'pi pi-package', name: 'Paquete entregado', keywords: ['envio', 'entrega', 'recibido'], category: 'commerce' },
        { class: 'pi pi-box-open', name: 'Caja abierta', keywords: ['abrir', 'desempaquetar', 'contenido'], category: 'commerce' },
        { class: 'pi pi-truck-loading', name: 'Cargando camión', keywords: ['carga', 'preparando', 'envio'], category: 'commerce' },
        { class: 'pi pi-warehouse', name: 'Almacén', keywords: ['inventario', 'almacen', 'stock'], category: 'commerce' },
        { class: 'pi pi-barcode', name: 'Código de barras', keywords: ['codigo', 'producto', 'identificador'], category: 'commerce' },
        { class: 'pi pi-qrcode', name: 'Código QR', keywords: ['codigo', 'qr', 'digital'], category: 'commerce' },
        { class: 'pi pi-scale', name: 'Balanza', keywords: ['peso', 'medida', 'cantidad'], category: 'commerce' },
        { class: 'pi pi-weight-hanging', name: 'Peso', keywords: ['masa', 'kilogramos', 'medida'], category: 'commerce' },
        { class: 'pi pi-ruler', name: 'Regla', keywords: ['medida', 'dimension', 'tamaño'], category: 'commerce' },
        { class: 'pi pi-palette', name: 'Paleta de colores', keywords: ['color', 'diseño', 'personalizacion'], category: 'commerce' },
        { class: 'pi pi-paint-brush', name: 'Pincel', keywords: ['diseño', 'arte', 'creativo'], category: 'commerce' },
        { class: 'pi pi-paint-roller', name: 'Rodillo', keywords: ['pintura', 'diseño', 'acabado'], category: 'commerce' },
        { class: 'pi pi-magic-wand', name: 'Varita mágica', keywords: ['magia', 'efecto', 'especial'], category: 'commerce' },
        { class: 'pi pi-sparkles', name: 'Chispas', keywords: ['brillo', 'especial', 'premium'], category: 'commerce' },
        { class: 'pi pi-gem', name: 'Gema', keywords: ['joya', 'precioso', 'lujo'], category: 'commerce' },
        { class: 'pi pi-diamond', name: 'Diamante', keywords: ['lujo', 'premium', 'exclusivo'], category: 'commerce' },
        { class: 'pi pi-camera', name: 'Cámara', keywords: ['foto', 'imagen', 'multimedia'], category: 'commerce' },
        { class: 'pi pi-images', name: 'Imágenes', keywords: ['galeria', 'fotos', 'multimedia'], category: 'commerce' },
        { class: 'pi pi-video-call', name: 'Videollamada', keywords: ['video', 'llamada', 'comunicacion'], category: 'commerce' },
        { class: 'pi pi-volume-up', name: 'Volumen alto', keywords: ['audio', 'sonido', 'multimedia'], category: 'commerce' },
        { class: 'pi pi-volume-down', name: 'Volumen bajo', keywords: ['audio', 'silencio', 'multimedia'], category: 'commerce' },
        { class: 'pi pi-volume-off', name: 'Sin volumen', keywords: ['mute', 'silencio', 'multimedia'], category: 'commerce' },
        { class: 'pi pi-headphones', name: 'Audífonos', keywords: ['audio', 'musica', 'escuchar'], category: 'commerce' },
        { class: 'pi pi-microphone', name: 'Micrófono', keywords: ['audio', 'grabacion', 'voz'], category: 'commerce' },
        { class: 'pi pi-speaker', name: 'Altavoz', keywords: ['audio', 'sonido', 'musica'], category: 'commerce' },
        { class: 'pi pi-music', name: 'Música', keywords: ['nota', 'audio', 'entretenimiento'], category: 'commerce' },
        { class: 'pi pi-film', name: 'Película', keywords: ['video', 'cine', 'multimedia'], category: 'commerce' },
        { class: 'pi pi-clapperboard', name: 'Claqueta', keywords: ['cine', 'produccion', 'video'], category: 'commerce' },
        { class: 'pi pi-television', name: 'Televisión', keywords: ['tv', 'pantalla', 'multimedia'], category: 'commerce' },
        { class: 'pi pi-desktop-monitor', name: 'Monitor', keywords: ['pantalla', 'computadora', 'display'], category: 'commerce' },
        { class: 'pi pi-laptop', name: 'Laptop', keywords: ['computadora', 'portatil', 'dispositivo'], category: 'commerce' },
        { class: 'pi pi-mouse', name: 'Mouse', keywords: ['raton', 'computadora', 'dispositivo'], category: 'commerce' },
        { class: 'pi pi-keyboard', name: 'Teclado', keywords: ['teclas', 'computadora', 'dispositivo'], category: 'commerce' },
        { class: 'pi pi-usb-drive', name: 'USB', keywords: ['memoria', 'almacenamiento', 'dispositivo'], category: 'commerce' },
        { class: 'pi pi-sd-card', name: 'Tarjeta SD', keywords: ['memoria', 'almacenamiento', 'dispositivo'], category: 'commerce' },
        { class: 'pi pi-hard-drive', name: 'Disco duro', keywords: ['almacenamiento', 'disco', 'memoria'], category: 'commerce' },
        { class: 'pi pi-sim-card', name: 'SIM', keywords: ['celular', 'telefono', 'comunicacion'], category: 'commerce' },
        { class: 'pi pi-wifi-signal', name: 'Señal WiFi', keywords: ['internet', 'conexion', 'red'], category: 'commerce' },
        { class: 'pi pi-bluetooth', name: 'Bluetooth', keywords: ['conexion', 'inalambrico', 'dispositivo'], category: 'commerce' },
        { class: 'pi pi-battery-full', name: 'Batería llena', keywords: ['energia', 'carga', 'power'], category: 'commerce' },
        { class: 'pi pi-battery-half', name: 'Batería media', keywords: ['energia', 'carga', 'medio'], category: 'commerce' },
        { class: 'pi pi-battery-empty', name: 'Batería vacía', keywords: ['energia', 'carga', 'baja'], category: 'commerce' },
        { class: 'pi pi-plug', name: 'Enchufe', keywords: ['energia', 'carga', 'electricidad'], category: 'commerce' },
        { class: 'pi pi-lightbulb', name: 'Bombilla', keywords: ['luz', 'idea', 'iluminacion'], category: 'commerce' },
        { class: 'pi pi-flash', name: 'Relámpago', keywords: ['rapido', 'energia', 'flash'], category: 'commerce' },
        { class: 'pi pi-bolt', name: 'Rayo', keywords: ['energia', 'electricidad', 'power'], category: 'commerce' },
        { class: 'pi pi-sun', name: 'Sol', keywords: ['luz', 'dia', 'energia'], category: 'commerce' },
        { class: 'pi pi-moon', name: 'Luna', keywords: ['noche', 'modo', 'oscuro'], category: 'commerce' },
        { class: 'pi pi-cloud', name: 'Nube', keywords: ['almacenamiento', 'cloud', 'internet'], category: 'commerce' },
        { class: 'pi pi-cloud-upload', name: 'Subir a nube', keywords: ['cloud', 'upload', 'guardar'], category: 'commerce' },
        { class: 'pi pi-cloud-download', name: 'Descargar nube', keywords: ['cloud', 'download', 'obtener'], category: 'commerce' },
        { class: 'pi pi-shield-check', name: 'Escudo verificado', keywords: ['seguridad', 'protegido', 'verificado'], category: 'commerce' },
        { class: 'pi pi-lock-open', name: 'Candado abierto', keywords: ['abierto', 'desbloqueado', 'acceso'], category: 'commerce' },
        { class: 'pi pi-shield-alt', name: 'Escudo alternativo', keywords: ['seguridad', 'proteccion', 'defensa'], category: 'commerce' },
        { class: 'pi pi-exclamation-shield', name: 'Escudo advertencia', keywords: ['alerta', 'seguridad', 'cuidado'], category: 'commerce' },
        { class: 'pi pi-bell-ring', name: 'Campana sonora', keywords: ['notificacion', 'alerta', 'sonido'], category: 'commerce' },
        { class: 'pi pi-bell-slash', name: 'Campana silenciada', keywords: ['mute', 'silencio', 'sin sonido'], category: 'commerce' },
        { class: 'pi pi-flag-checkered', name: 'Bandera a cuadros', keywords: ['meta', 'objetivo', 'completado'], category: 'commerce' },
        { class: 'pi pi-target', name: 'Objetivo', keywords: ['meta', 'blanco', 'destino'], category: 'commerce' },
        { class: 'pi pi-crosshairs', name: 'Punto de mira', keywords: ['apuntar', 'precision', 'foco'], category: 'commerce' },
        { class: 'pi pi-bullseye', name: 'Diana', keywords: ['objetivo', 'meta', 'preciso'], category: 'commerce' },
        { class: 'pi pi-bullhorn', name: 'Megáfono', keywords: ['anuncio', 'publicidad', 'marketing'], category: 'commerce' },
        { class: 'pi pi-megaphone', name: 'Altavoz publicitario', keywords: ['anuncio', 'marketing', 'publicidad'], category: 'commerce' },
        { class: 'pi pi-megaphone-filled', name: 'Megáfono lleno', keywords: ['anuncio', 'marketing', 'importante'], category: 'commerce' },
        { class: 'pi pi-rocket', name: 'Cohete', keywords: ['rapido', 'lanzamiento', 'acelerar'], category: 'commerce' },
        { class: 'pi pi-rocket-launch', name: 'Lanzamiento', keywords: ['lanzar', 'iniciar', 'despegar'], category: 'commerce' },
        { class: 'pi pi-jet', name: 'Jet', keywords: ['avion', 'rapido', 'viaje'], category: 'commerce' },
        { class: 'pi pi-plane', name: 'Avión', keywords: ['viaje', 'transporte', 'aereo'], category: 'commerce' },
        { class: 'pi pi-helicopter', name: 'Helicóptero', keywords: ['aereo', 'rapido', 'transporte'], category: 'commerce' },
        { class: 'pi pi-car', name: 'Auto', keywords: ['vehiculo', 'transporte', 'carro'], category: 'commerce' },
        { class: 'pi pi-car-side', name: 'Auto lateral', keywords: ['vehiculo', 'transporte', 'carro'], category: 'commerce' },
        { class: 'pi pi-bus', name: 'Bus', keywords: ['transporte', 'publico', 'viaje'], category: 'commerce' },
        { class: 'pi pi-subway', name: 'Metro', keywords: ['transporte', 'subterraneo', 'ciudad'], category: 'commerce' },
        { class: 'pi pi-train', name: 'Tren', keywords: ['transporte', 'ferrocarril', 'viaje'], category: 'commerce' },
        { class: 'pi pi-ship', name: 'Barco', keywords: ['maritimo', 'transporte', 'viaje'], category: 'commerce' },
        { class: 'pi pi-anchor', name: 'Ancla', keywords: ['mar', 'barco', 'estabilidad'], category: 'commerce' },
        { class: 'pi pi-life-ring', name: 'Salvavidas', keywords: ['seguridad', 'emergencia', 'rescate'], category: 'commerce' },
        { class: 'pi pi-umbrella', name: 'Paraguas', keywords: ['proteccion', 'lluvia', 'clima'], category: 'commerce' },
        { class: 'pi pi-thermometer', name: 'Termómetro', keywords: ['temperatura', 'clima', 'medida'], category: 'commerce' },
        { class: 'pi pi-wind', name: 'Viento', keywords: ['clima', 'aire', 'viento'], category: 'commerce' },
        { class: 'pi pi-snowflake', name: 'Copo de nieve', keywords: ['invierno', 'frio', 'clima'], category: 'commerce' },
        { class: 'pi pi-fire', name: 'Fuego', keywords: ['calor', 'energia', 'quemado'], category: 'commerce' },
        { class: 'pi pi-leaf', name: 'Hoja', keywords: ['naturaleza', 'ecologico', 'verde'], category: 'commerce' },
        { class: 'pi pi-seedling', name: 'Planta joven', keywords: ['naturaleza', 'crecimiento', 'ecologico'], category: 'commerce' },
        { class: 'pi pi-tree', name: 'Árbol', keywords: ['naturaleza', 'bosque', 'ecologico'], category: 'commerce' },
        { class: 'pi pi-flower', name: 'Flor', keywords: ['naturaleza', 'belleza', 'decoracion'], category: 'commerce' },
        { class: 'pi pi-apple', name: 'Manzana', keywords: ['fruta', 'comida', 'saludable'], category: 'commerce' },
        { class: 'pi pi-utensils', name: 'Utensilios', keywords: ['comida', 'cocina', 'restaurante'], category: 'commerce' },
        { class: 'pi pi-glass-martini', name: 'Copa', keywords: ['bebida', 'bar', 'alcohol'], category: 'commerce' },
        { class: 'pi pi-coffee', name: 'Café', keywords: ['bebida', 'caliente', 'desayuno'], category: 'commerce' },
        { class: 'pi pi-beer', name: 'Cerveza', keywords: ['bebida', 'alcohol', 'bar'], category: 'commerce' },
        { class: 'pi pi-wine', name: 'Vino', keywords: ['bebida', 'alcohol', 'gourmet'], category: 'commerce' },
        { class: 'pi pi-cookie', name: 'Galleta', keywords: ['dulce', 'comida', 'postre'], category: 'commerce' },
        { class: 'pi pi-birthday-cake', name: 'Pastel cumpleaños', keywords: ['cumpleaños', 'fiesta', 'postre'], category: 'commerce' },
        { class: 'pi pi-ice-cream', name: 'Helado', keywords: ['postre', 'frio', 'dulce'], category: 'commerce' },
        { class: 'pi pi-pizza', name: 'Pizza', keywords: ['comida', 'italiana', 'restaurante'], category: 'commerce' },
        { class: 'pi pi-hamburger', name: 'Hamburguesa', keywords: ['comida', 'fastfood', 'restaurante'], category: 'commerce' },
        { class: 'pi pi-hot-dog', name: 'Hot dog', keywords: ['comida', 'fastfood', 'caliente'], category: 'commerce' },
        { class: 'pi pi-taco', name: 'Taco', keywords: ['comida', 'mexicana', 'restaurante'], category: 'commerce' },
        { class: 'pi pi-sushi', name: 'Sushi', keywords: ['comida', 'japonesa', 'restaurante'], category: 'commerce' },
        { class: 'pi pi-drumstick', name: 'Muslo de pollo', keywords: ['comida', 'carne', 'restaurante'], category: 'commerce' },
        { class: 'pi pi-bread', name: 'Pan', keywords: ['comida', 'horno', 'desayuno'], category: 'commerce' },
        { class: 'pi pi-cheese', name: 'Queso', keywords: ['lacteo', 'comida', 'gourmet'], category: 'commerce' },
        { class: 'pi pi-egg', name: 'Huevo', keywords: ['comida', 'desayuno', 'proteina'], category: 'commerce' },
        { class: 'pi pi-carrot', name: 'Zanahoria', keywords: ['verdura', 'comida', 'saludable'], category: 'commerce' },
        { class: 'pi pi-lemon', name: 'Limón', keywords: ['fruta', 'acido', 'bebida'], category: 'commerce' },
        { class: 'pi pi-pepper-hot', name: 'Chile picante', keywords: ['especia', 'picante', 'comida'], category: 'commerce' },
        { class: 'pi pi-strawberry', name: 'Fresa', keywords: ['fruta', 'roja', 'dulce'], category: 'commerce' },
        { class: 'pi pi-cherry', name: 'Cereza', keywords: ['fruta', 'roja', 'dulce'], category: 'commerce' },
        { class: 'pi pi-watermelon', name: 'Sandía', keywords: ['fruta', 'verano', 'refrescante'], category: 'commerce' },
        { class: 'pi pi-grapes', name: 'Uvas', keywords: ['fruta', 'racimo', 'vino'], category: 'commerce' },
        { class: 'pi pi-banana', name: 'Banana', keywords: ['fruta', 'amarilla', 'tropical'], category: 'commerce' },
        { class: 'pi pi-orange', name: 'Naranja', keywords: ['fruta', 'citrico', 'vitamina'], category: 'commerce' },
        { class: 'pi pi-coconut', name: 'Coco', keywords: ['fruta', 'tropical', 'exotico'], category: 'commerce' },
        { class: 'pi pi-pineapple', name: 'Piña', keywords: ['fruta', 'tropical', 'dulce'], category: 'commerce' },
        { class: 'pi pi-mango', name: 'Mango', keywords: ['fruta', 'tropical', 'exotico'], category: 'commerce' },
        { class: 'pi pi-broccoli', name: 'Brócoli', keywords: ['verdura', 'verde', 'saludable'], category: 'commerce' },
        { class: 'pi pi-tomato', name: 'Tomate', keywords: ['verdura', 'roja', 'ensalada'], category: 'commerce' },
        { class: 'pi pi-onion', name: 'Cebolla', keywords: ['verdura', 'cocina', 'sazonador'], category: 'commerce' },
        { class: 'pi pi-garlic', name: 'Ajo', keywords: ['especia', 'cocina', 'sazonador'], category: 'commerce' },
        { class: 'pi pi-potato', name: 'Papa', keywords: ['verdura', 'tuberculo', 'comida'], category: 'commerce' },
        { class: 'pi pi-corn', name: 'Maíz', keywords: ['verdura', 'grano', 'amarillo'], category: 'commerce' },
        { class: 'pi pi-wheat', name: 'Trigo', keywords: ['grano', 'cereal', 'agricultura'], category: 'commerce' },
        { class: 'pi pi-seed', name: 'Semilla', keywords: ['agricultura', 'plantar', 'crecimiento'], category: 'commerce' },
        { class: 'pi pi-fish', name: 'Pez', keywords: ['marisco', 'comida', 'pescado'], category: 'commerce' },
        { class: 'pi pi-shrimp', name: 'Camarón', keywords: ['marisco', 'comida', 'mar'], category: 'commerce' },
        { class: 'pi pi-crab', name: 'Cangrejo', keywords: ['marisco', 'comida', 'mar'], category: 'commerce' },
        { class: 'pi pi-lobster', name: 'Langosta', keywords: ['marisco', 'gourmet', 'luxury'], category: 'commerce' },
        { class: 'pi pi-bone', name: 'Hueso', keywords: ['carne', 'perro', 'animal'], category: 'commerce' },
        { class: 'pi pi-paw', name: 'Huella de pata', keywords: ['animal', 'mascota', 'perro'], category: 'commerce' },
        { class: 'pi pi-cat', name: 'Gato', keywords: ['mascota', 'animal', 'felino'], category: 'commerce' },
        { class: 'pi pi-dog', name: 'Perro', keywords: ['mascota', 'animal', 'canino'], category: 'commerce' },
        { class: 'pi pi-bird', name: 'Pájaro', keywords: ['animal', 'ave', 'naturaleza'], category: 'commerce' },
        { class: 'pi pi-butterfly', name: 'Mariposa', keywords: ['insecto', 'naturaleza', 'belleza'], category: 'commerce' },
        { class: 'pi pi-bug', name: 'Bicho', keywords: ['insecto', 'error', 'programacion'], category: 'commerce' },
        { class: 'pi pi-spider', name: 'Araña', keywords: ['insecto', 'animal', 'web'], category: 'commerce' },
        { class: 'pi pi-ribbon', name: 'Cinta', keywords: ['decoracion', 'premio', 'regalo'], category: 'commerce' },
        { class: 'pi pi-ribbon-filled', name: 'Cinta llena', keywords: ['decoracion', 'premio', 'especial'], category: 'commerce' },
        { class: 'pi pi-balloon', name: 'Globo', keywords: ['fiesta', 'celebracion', 'colorido'], category: 'commerce' },
        { class: 'pi pi-confetti', name: 'Confeti', keywords: ['fiesta', 'celebracion', 'diversion'], category: 'commerce' },
        { class: 'pi pi-cake', name: 'Pastel', keywords: ['postre', 'fiesta', 'cumpleaños'], category: 'commerce' },
        { class: 'pi pi-puzzle', name: 'Rompecabezas', keywords: ['juego', 'resolver', 'inteligencia'], category: 'commerce' },
        { class: 'pi pi-gamepad', name: 'Control', keywords: ['juego', 'videojuego', 'entretenimiento'], category: 'commerce' },
        { class: 'pi pi-headset', name: 'Auriculares gaming', keywords: ['audio', 'gaming', 'juego'], category: 'commerce' },
        { class: 'pi pi-trophy-filled', name: 'Trofeo lleno', keywords: ['premio', 'ganador', 'logro'], category: 'commerce' },
        { class: 'pi pi-medal-filled', name: 'Medalla llena', keywords: ['premio', 'reconocimiento', 'logro'], category: 'commerce' },
        { class: 'pi pi-crown-filled', name: 'Corona llena', keywords: ['rey', 'mejor', 'premium'], category: 'commerce' },
        { class: 'pi pi-shield-filled', name: 'Escudo lleno', keywords: ['seguridad', 'proteccion', 'premium'], category: 'commerce' },
        
        // OTROS ÚTILES
        { class: 'pi pi-star', name: 'Estrella', keywords: ['favorito', 'importante', 'destacado'], category: 'other' },
        { class: 'pi pi-heart', name: 'Corazón', keywords: ['me gusta', 'amor', 'favorito'], category: 'other' },
        { class: 'pi pi-bookmark', name: 'Marcador', keywords: ['guardar', 'recordar', 'señalar'], category: 'other' },
        { class: 'pi pi-flag', name: 'Bandera', keywords: ['pais', 'marca', 'señal'], category: 'other' },
        { class: 'pi pi-bell', name: 'Campana', keywords: ['notificacion', 'alerta', 'aviso'], category: 'other' },
        { class: 'pi pi-eye', name: 'Ver', keywords: ['mostrar', 'visible', 'mirar'], category: 'other' },
        { class: 'pi pi-eye-slash', name: 'Ocultar', keywords: ['esconder', 'invisible', 'privado'], category: 'other' },
        { class: 'pi pi-lock', name: 'Bloqueado', keywords: ['cerrado', 'seguro', 'privado'], category: 'other' },
        { class: 'pi pi-unlock', name: 'Desbloqueado', keywords: ['abierto', 'publico', 'accesible'], category: 'other' },
        { class: 'pi pi-key', name: 'Llave', keywords: ['acceso', 'clave', 'password'], category: 'other' },
        { class: 'pi pi-database', name: 'Base de datos', keywords: ['datos', 'almacen', 'servidor'], category: 'other' },
        { class: 'pi pi-server', name: 'Servidor', keywords: ['computadora', 'hosting', 'backend'], category: 'other' },
        { class: 'pi pi-wifi', name: 'WiFi', keywords: ['internet', 'conexion', 'red'], category: 'other' },
        { class: 'pi pi-globe', name: 'Mundo', keywords: ['internet', 'global', 'web'], category: 'other' },
        { class: 'pi pi-image', name: 'Imagen', keywords: ['foto', 'picture', 'grafico'], category: 'other' },
        { class: 'pi pi-video', name: 'Video', keywords: ['pelicula', 'multimedia', 'grabacion'], category: 'other' },
        { class: 'pi pi-volume-up', name: 'Audio alto', keywords: ['sonido', 'musica', 'volumen'], category: 'other' },
        { class: 'pi pi-play', name: 'Reproducir', keywords: ['iniciar', 'comenzar', 'play'], category: 'other' },
        { class: 'pi pi-pause', name: 'Pausar', keywords: ['detener', 'parar', 'pausa'], category: 'other' },
        { class: 'pi pi-stop', name: 'Parar', keywords: ['detener', 'finalizar', 'stop'], category: 'other' }
    ];

    // Mapeo de labels a iconos sugeridos
    private labelSuggestions: { [key: string]: string[] } = {
        // Básicos
        'inicio': ['pi pi-home'],
        'home': ['pi pi-home'],
        'casa': ['pi pi-home'],
        'usuario': ['pi pi-user', 'pi pi-users', 'pi pi-id-card'],
        'usuarios': ['pi pi-users', 'pi pi-user', 'pi pi-user-plus'],
        'perfil': ['pi pi-user', 'pi pi-id-card'],
        'configuracion': ['pi pi-cog', 'pi pi-cogs', 'pi pi-wrench'],
        'ajustes': ['pi pi-cog', 'pi pi-sliders-h', 'pi pi-wrench'],

        // E-commerce específico
        'productos': ['pi pi-shopping-cart', 'pi pi-shopping-bag', 'pi pi-box', 'pi pi-tag'],
        'productos-test': ['pi pi-shopping-cart', 'pi pi-box', 'pi pi-tag'],
        'tienda': ['pi pi-shopping-cart', 'pi pi-store', 'pi pi-shopping-bag'],
        'ventas': ['pi pi-dollar', 'pi pi-money-bill', 'pi pi-chart-line', 'pi pi-credit-card'],
        'pedidos': ['pi pi-receipt', 'pi pi-shopping-bag', 'pi pi-list-check'],
        'ordenes': ['pi pi-receipt', 'pi pi-list', 'pi pi-shopping-bag'],
        'ordenes-summary': ['pi pi-receipt', 'pi pi-chart-pie'],
        'checkout': ['pi pi-credit-card', 'pi pi-shopping-cart', 'pi pi-wallet'],
        'carrito': ['pi pi-shopping-cart', 'pi pi-shopping-bag'],
        'catalogo': ['pi pi-grid', 'pi pi-table', 'pi pi-tags'],
        'inventario': ['pi pi-box', 'pi pi-list', 'pi pi-warehouse'],
        'envios': ['pi pi-truck', 'pi pi-shipping-fast', 'pi pi-box'],
        'delivery': ['pi pi-truck', 'pi pi-shipping-fast', 'pi pi-map-marker'],
        'pagos': ['pi pi-credit-card', 'pi pi-dollar', 'pi pi-wallet'],
        'precios': ['pi pi-dollar', 'pi pi-tag', 'pi pi-calculator'],
        'descuentos': ['pi pi-percentage', 'pi pi-gift', 'pi pi-tag'],
        'promociones': ['pi pi-percentage', 'pi pi-gift', 'pi pi-trophy'],
        'clientes': ['pi pi-users', 'pi pi-user', 'pi pi-id-card'],
        'proveedores': ['pi pi-building', 'pi pi-briefcase', 'pi pi-truck'],
        'estadisticas': ['pi pi-chart-bar', 'pi pi-chart-line', 'pi pi-chart-pie'],
        'analisis': ['pi pi-chart-bar', 'pi pi-chart-line', 'pi pi-search'],
        'reportes': ['pi pi-file-pdf', 'pi pi-chart-bar', 'pi pi-table'],
        'dashboard': ['pi pi-th-large', 'pi pi-chart-bar', 'pi pi-chart-line'],

        // Administración
        'panel': ['pi pi-th-large', 'pi pi-desktop', 'pi pi-building'],
        'menu': ['pi pi-bars', 'pi pi-list'],
        'administracion': ['pi pi-crown', 'pi pi-cog', 'pi pi-shield'],
        'sistema': ['pi pi-cog', 'pi pi-wrench', 'pi pi-desktop'],

        // Comunicación y archivos
        'mensajes': ['pi pi-envelope', 'pi pi-comment', 'pi pi-inbox'],
        'correo': ['pi pi-envelope', 'pi pi-at', 'pi pi-inbox'],
        'contacto': ['pi pi-phone', 'pi pi-envelope', 'pi pi-user'],
        'archivos': ['pi pi-file', 'pi pi-folder', 'pi pi-copy'],
        'documentos': ['pi pi-file', 'pi pi-file-pdf', 'pi pi-folder'],

        // Soporte y ayuda
        'ayuda': ['pi pi-question-circle', 'pi pi-info-circle'],
        'soporte': ['pi pi-question-circle', 'pi pi-wrench', 'pi pi-shield'],
        'faq': ['pi pi-question-circle', 'pi pi-info-circle'],
        'tutorial': ['pi pi-question-circle', 'pi pi-play'],
        'guia': ['pi pi-question-circle', 'pi pi-file-pdf'],

        // Estados y feedback
        'favoritos': ['pi pi-heart', 'pi pi-star-fill'],
        'calificaciones': ['pi pi-star', 'pi pi-star-fill', 'pi pi-thumbs-up'],
        'reviews': ['pi pi-star', 'pi pi-comment', 'pi pi-thumbs-up'],

        // E-commerce avanzado
        'almacen': ['pi pi-warehouse', 'pi pi-box', 'pi pi-building'],
        'logistica': ['pi pi-truck', 'pi pi-shipping-fast', 'pi pi-warehouse'],
        'tracking': ['pi pi-map-marker', 'pi pi-truck', 'pi pi-search'],
        'codigos': ['pi pi-barcode', 'pi pi-qrcode', 'pi pi-tag'],
        'medidas': ['pi pi-ruler', 'pi pi-scale', 'pi pi-weight-hanging'],
        'diseno': ['pi pi-palette', 'pi pi-paint-brush', 'pi pi-sparkles'],
        'multimedia': ['pi pi-camera', 'pi pi-video', 'pi pi-music'],
        'electronica': ['pi pi-laptop', 'pi pi-mouse', 'pi pi-battery-full'],
        'seguridad': ['pi pi-shield', 'pi pi-lock', 'pi pi-shield-check'],
        'marketing': ['pi pi-bullhorn', 'pi pi-megaphone', 'pi pi-target'],
        'transporte': ['pi pi-car', 'pi pi-truck', 'pi pi-plane'],
        'comida': ['pi pi-utensils', 'pi pi-apple', 'pi pi-coffee'],
        'bebidas': ['pi pi-coffee', 'pi pi-beer', 'pi pi-wine'],
        'restaurante': ['pi pi-utensils', 'pi pi-store', 'pi pi-building'],
        'gastronomia': ['pi pi-utensils', 'pi pi-wine', 'pi pi-trophy'],
        'naturaleza': ['pi pi-leaf', 'pi pi-tree', 'pi pi-flower'],
        'ecologico': ['pi pi-leaf', 'pi pi-seedling', 'pi pi-recycle'],
        'animales': ['pi pi-dog', 'pi pi-cat', 'pi pi-paw'],
        'mascotas': ['pi pi-dog', 'pi pi-cat', 'pi pi-paw'],
        'juegos': ['pi pi-gamepad', 'pi pi-puzzle', 'pi pi-trophy'],
        'entretenimiento': ['pi pi-gamepad', 'pi pi-film', 'pi pi-music'],
        'premios': ['pi pi-trophy', 'pi pi-medal', 'pi pi-crown'],
        'reconocimientos': ['pi pi-trophy', 'pi pi-award', 'pi pi-star-fill'],
        'celebraciones': ['pi pi-cake', 'pi pi-balloon', 'pi pi-confetti'],
        'fiestas': ['pi pi-cake', 'pi pi-birthday-cake', 'pi pi-confetti'],
        'tecnologia': ['pi pi-laptop', 'pi pi-desktop-monitor', 'pi pi-mobile'],
        'dispositivos': ['pi pi-laptop', 'pi pi-mobile', 'pi pi-tablet'],
        'conectividad': ['pi pi-wifi-signal', 'pi pi-bluetooth', 'pi pi-cloud'],
        'nube': ['pi pi-cloud', 'pi pi-cloud-upload', 'pi pi-cloud-download'],
        'almacenamiento': ['pi pi-hard-drive', 'pi pi-cloud', 'pi pi-usb-drive'],
        'bateria': ['pi pi-battery-full', 'pi pi-battery-half', 'pi pi-plug'],
        'clima': ['pi pi-sun', 'pi pi-moon', 'pi pi-cloud'],
        'tiempo': ['pi pi-sun', 'pi pi-moon', 'pi pi-thermometer'],
        'agricultura': ['pi pi-seed', 'pi pi-wheat', 'pi pi-leaf'],
        'mariscos': ['pi pi-fish', 'pi pi-shrimp', 'pi pi-lobster'],
        'carnes': ['pi pi-drumstick', 'pi pi-bone'],
        'lacteos': ['pi pi-cheese', 'pi pi-glass-martini'],
        'frutas': ['pi pi-apple', 'pi pi-banana', 'pi pi-strawberry'],
        'verduras': ['pi pi-carrot', 'pi pi-broccoli', 'pi pi-lemon'],
        'especias': ['pi pi-pepper-hot', 'pi pi-garlic', 'pi pi-onion'],
        'panaderia': ['pi pi-bread', 'pi pi-cookie', 'pi pi-birthday-cake'],
        'postres': ['pi pi-ice-cream', 'pi pi-birthday-cake', 'pi pi-cookie'],
        'bebidas-calientes': ['pi pi-coffee', 'pi pi-glass-martini'],
        'bebidas-alcoholicas': ['pi pi-beer', 'pi pi-wine', 'pi pi-glass-martini'],
        'fastfood': ['pi pi-hamburger', 'pi pi-hot-dog', 'pi pi-pizza'],
        'cocina-internacional': ['pi pi-taco', 'pi pi-sushi', 'pi pi-pizza'],
        'saludable': ['pi pi-apple', 'pi pi-carrot', 'pi pi-leaf'],
        'premium': ['pi pi-crown', 'pi pi-diamond', 'pi pi-gem'],
        'lujo': ['pi pi-diamond', 'pi pi-crown', 'pi pi-gem'],
        'exclusivo': ['pi pi-crown', 'pi pi-shield', 'pi pi-verified']
    };

    ngOnInit(): void {
        this.initializeCategories();
        this.generateSuggestions();
        this.filteredIcons = [...this.allIconsData];
    }

    private initializeCategories(): void {
        this.categories = [
            {
                name: 'navigation',
                label: '🧭 Navegación',
                icons: this.allIconsData.filter(icon => icon.category === 'navigation')
            },
            {
                name: 'users',
                label: '👥 Usuarios',
                icons: this.allIconsData.filter(icon => icon.category === 'users')
            },
            {
                name: 'files',
                label: '📁 Archivos',
                icons: this.allIconsData.filter(icon => icon.category === 'files')
            },
            {
                name: 'actions',
                label: '⚡ Acciones',
                icons: this.allIconsData.filter(icon => icon.category === 'actions')
            },
            {
                name: 'status',
                label: '🔔 Estados',
                icons: this.allIconsData.filter(icon => icon.category === 'status')
            },
            {
                name: 'settings',
                label: '⚙️ Configuración',
                icons: this.allIconsData.filter(icon => icon.category === 'settings')
            },
            {
                name: 'communication',
                label: '💬 Comunicación',
                icons: this.allIconsData.filter(icon => icon.category === 'communication')
            },
            {
                name: 'commerce',
                label: '🛒 Comercio',
                icons: this.allIconsData.filter(icon => icon.category === 'commerce')
            },
            {
                name: 'other',
                label: '🔧 Otros',
                icons: this.allIconsData.filter(icon => icon.category === 'other')
            }
        ];
    }

    private generateSuggestions(): void {
        if (!this.currentLabel) return;

        const label = this.currentLabel.toLowerCase();
        
        // Buscar coincidencias exactas
        if (this.labelSuggestions[label]) {
            this.suggestedIcons = this.labelSuggestions[label];
            return;
        }

        // Buscar coincidencias parciales
        for (const key in this.labelSuggestions) {
            if (label.includes(key) || key.includes(label)) {
                this.suggestedIcons = this.labelSuggestions[key];
                return;
            }
        }

        // Si no hay sugerencias específicas, usar los más comunes
        this.suggestedIcons = ['pi pi-home', 'pi pi-user', 'pi pi-cog', 'pi pi-file'];
    }

    filterIcons(): void {
        if (!this.searchText.trim()) {
            this.filteredIcons = [...this.allIconsData];
            return;
        }

        const searchLower = this.searchText.toLowerCase();
        this.filteredIcons = this.allIconsData.filter(icon => {
            return icon.name.toLowerCase().includes(searchLower) ||
                   icon.class.toLowerCase().includes(searchLower) ||
                   icon.keywords.some(keyword => keyword.toLowerCase().includes(searchLower));
        });
    }

    clearSearch(): void {
        this.searchText = '';
        this.filterIcons();
    }

    selectIcon(iconClass: string): void {
        this._value = iconClass;
        this.selectedIcon = iconClass;
        this.selectedIconChange.emit(iconClass);
        this._onChange(iconClass);
        this._onTouched();
    }

    // ControlValueAccessor implementation
    writeValue(value: string): void {
        this._value = value || '';
        this.selectedIcon = this._value;
    }

    registerOnChange(fn: (value: string) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
