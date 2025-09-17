# Servicio de Carga de Imágenes - ImageUploadService

## Descripción
El servicio `ImageUploadService` permite cargar múltiples imágenes de banner al servidor siguiendo las especificaciones del proyecto.

## Características Principales
- ✅ Carga múltiple de imágenes (1 o varias)
- ✅ Validación de archivos (tipo, tamaño)
- ✅ Soporte para JPG, PNG, GIF
- ✅ Integración con sistema de sesiones
- ✅ Manejo de errores robusto
- ✅ Patrón de respuesta consistente del proyecto

## Especificaciones Técnicas

### Endpoint
- **Método**: POST
- **URL**: `{{base_url}}/upload_banner` (configurable via spconfig)
- **Content-Type**: multipart/form-data

### Formato del Body
```
FormData:
- multi-files: File[] (archivos de imagen)
- usr: string (usuario de sesión)
- id_session: string (ID de sesión)
```

## Ubicación del Servicio
```
src/app/core/services/img/image-upload.service.ts
```

## Uso del Servicio

### 1. Inyección del Servicio
```typescript
import { ImageUploadService } from '../../../core/services/img/image-upload.service';
// o desde el index:
import { ImageUploadService } from '../../../core/services/img/';

@Component({...})
export class BannerUploadComponent {
    private imageUploadService = inject(ImageUploadService);
}
```

### 2. Carga de Múltiples Imágenes
```typescript
onFileSelected(event: any) {
    const files = event.files as File[];

    this.imageUploadService.uploadBannerImages(files)
        .subscribe({
            next: (response) => {
                console.log('✅ Imágenes subidas:', response.data);
                // Manejar respuesta exitosa
            },
            error: (error) => {
                console.error('❌ Error al subir:', error.message);
                // Manejar error
            }
        });
}
```

### 3. Carga de Imagen Individual
```typescript
uploadSingleImage(file: File) {
    this.imageUploadService.uploadSingleBannerImage(file)
        .subscribe({
            next: (response) => {
                console.log('✅ Imagen subida:', response.data[0]);
            },
            error: (error) => {
                console.error('❌ Error:', error.message);
            }
        });
}
```

### 4. Validación Previa
```typescript
validateAndUpload(files: File[]) {
    const validation = this.imageUploadService.validateFiles(files);

    if (!validation.isValid) {
        console.error('Errores de validación:', validation.errors);
        return;
    }

    if (validation.warnings.length > 0) {
        console.warn('Advertencias:', validation.warnings);
    }

    // Proceder con la carga
    this.imageUploadService.uploadBannerImages(files)...
}
```

### 5. Acceso a URLs_IMG (⭐ IMPORTANTE)
```typescript
// Método recomendado para acceder a URLs_IMG
uploadImages(files: File[]) {
    this.imageUploadService.uploadBannerImages(files)
        .subscribe({
            next: (response) => {
                // ✅ FORMA MÁS SENCILLA: Obtener todas las URLs_IMG exitosas
                const urlsImg = this.imageUploadService.getSuccessfulUrlImgs(response);
                console.log('URLs_IMG para usar en páginas:', urlsImg);

                // ✅ Para banner único: Obtener primera URL_IMG exitosa
                const firstUrlImg = this.imageUploadService.getFirstSuccessfulUrlImg(response);
                console.log('Primera URL_IMG:', firstUrlImg);

                // ✅ Información detallada de cada imagen
                const urlInfos = this.imageUploadService.getUrlImgsInfo(response);
                urlInfos.forEach(info => {
                    if (info.uploadStatus === 'success') {
                        console.log(`${info.originalName} → ${info.urlImg}`);
                    }
                });

                // ✅ Estadísticas del proceso
                const stats = this.imageUploadService.formatUploadStats(response);
                console.log('Resultado:', stats);
            },
            error: (error) => {
                console.error('❌ Error:', error.message);
            }
        });
}
```

### 6. Manejo Avanzado de URLs_IMG
```typescript
// Verificar si todas las imágenes se cargaron correctamente
isCompletelySuccessful(response: ImageUploadResponse): boolean {
    return this.imageUploadService.isUploadCompletelySuccessful(response);
}

// Obtener estadísticas detalladas
getDetailedStats(response: ImageUploadResponse) {
    const stats = this.imageUploadService.getUploadStats(response);
    console.log(`Total: ${stats.total}, Exitosas: ${stats.successful}, Fallidas: ${stats.failed}`);
    console.log(`Tasa de éxito: ${stats.successRate.toFixed(1)}%`);
}
```

## Métodos Disponibles

### `uploadBannerImages(files: File[]): Observable<ImageUploadResponse>`
Carga múltiples imágenes al servidor.

**Parámetros:**
- `files`: Array de archivos File

**Retorna:** Observable con respuesta del servidor

### `uploadSingleBannerImage(file: File): Observable<ImageUploadResponse>`
Carga una sola imagen al servidor.

**Parámetros:**
- `file`: Archivo File individual

**Retorna:** Observable con respuesta del servidor

### `validateFiles(files: File[]): FileValidationResult`
Valida archivos antes de subirlos.

**Parámetros:**
- `files`: Array de archivos a validar

**Retorna:** Objeto con resultado de validación

### `getFileInfo(files: File[]): ImageFile[]`
Obtiene información detallada de archivos.

### `isValidImageType(file: File): boolean`
Verifica si un archivo es de tipo imagen válido.

### `isValidFileSize(file: File): boolean`
Verifica si un archivo no excede el tamaño máximo.

### `formatFileSize(bytes: number): string`
Formatea el tamaño de archivo en formato legible.

## Métodos para URLs_IMG (⭐ NUEVO)

### `getSuccessfulUrlImgs(response: ImageUploadResponse): string[]`
Obtiene solo las URLs_IMG de imágenes que se cargaron exitosamente.

### `getFirstSuccessfulUrlImg(response: ImageUploadResponse): string | null`
Obtiene la primera URL_IMG exitosa (útil para banner único).

### `getUrlImgsInfo(response: ImageUploadResponse): ImageUrlInfo[]`
Obtiene información detallada de todas las URLs_IMG con estado de carga.

### `extractUrlImgs(response: ImageUploadResponse): string[]`
Extrae todas las URLs_IMG del response.

### `isUploadCompletelySuccessful(response: ImageUploadResponse): boolean`
Verifica si todas las imágenes se cargaron sin errores.

### `getUploadStats(response: ImageUploadResponse)`
Retorna estadísticas detalladas: total, successful, failed, successRate.

### `formatUploadStats(response: ImageUploadResponse): string`
Formatea estadísticas en mensaje legible para el usuario.

## Configuración de Validación

```typescript
// Configuración por defecto
const FILE_VALIDATION_CONFIG = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFilesCount: 10
};
```

## Manejo de Errores

### Errores Comunes
- **Archivo demasiado grande**: 413 Payload Too Large
- **Tipo no soportado**: 415 Unsupported Media Type
- **Error de conexión**: Error de red
- **Sesión expirada**: Error de autenticación

### Ejemplo de Manejo de Errores
```typescript
this.imageUploadService.uploadBannerImages(files)
    .subscribe({
        next: (response) => {
            // Éxito
        },
        error: (error) => {
            switch(error.status) {
                case 413:
                    this.showError('Archivos demasiado grandes');
                    break;
                case 415:
                    this.showError('Tipo de archivo no soportado');
                    break;
                default:
                    this.showError(error.message);
            }
        }
    });
```

## Integración con Componentes Angular

### Ejemplo con PrimeNG FileUpload
```typescript
<p-fileUpload
    name="multi-files"
    (onSelect)="onFileSelected($event)"
    (onUpload)="onUploadComplete($event)"
    [multiple]="true"
    accept="image/*"
    [maxFileSize]="5000000"
    [customUpload]="true">
</p-fileUpload>
```

### Ejemplo con Input Nativo
```html
<input
    type="file"
    multiple
    accept="image/jpeg,image/png,image/gif"
    (change)="onFileChange($event)">
```

```typescript
onFileChange(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.uploadImages(files);
}
```

## Respuestas del Servidor

### Respuesta Exitosa (Formato Real del Backend)
```json
{
    "images": [
        {
            "name": "PLP.png",
            "codigo": 200,
            "mensaje": "Imagen insertada",
            "img": "https://cdzeyqsgba.cloudimg.io/img/banners/upload_banner20250915/PLP.png"
        }
    ],
    "procesados": 1,
    "errores": 0,
    "codigo": 200,
    "mensaje": "Proceso de carga finalizado!"
}
```

### Campos Importantes
- **`images[]`**: Array con información de cada imagen subida
- **`images[].img`**: ⭐ **URL_IMG que se utiliza en las páginas**
- **`procesados`**: Número de archivos procesados exitosamente
- **`errores`**: Número de archivos que fallaron
- **`codigo`**: Código de estado general (200 = éxito)

### Respuesta de Error
```json
{
    "statuscode": 400,
    "mensaje": "Error al procesar archivos",
    "errors": [
        {
            "file_name": "banner1.exe",
            "error": "Tipo de archivo no permitido",
            "code": "INVALID_TYPE"
        }
    ]
}
```

## Configuración del Endpoint

### Opción 1: Configuración estática (Actual)
El servicio está configurado para usar una URL estática definida en `api.constants.ts`:

```typescript
// En src/app/core/constants/api.constants.ts
export const API_CONFIG = {
    BASE_URL: 'http://localhost:3000',        // API principal
    BASE_URL_IMG: 'http://10.10.254.127:3013', // Servidor de imágenes ⭐
    ENDPOINTS: {
        BANNER: {UPLOAD: '/upload_banner'}
    }
};

export const API_URLS = {
    // Otros servicios usan BASE_URL...
    MENU_CRUD: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MENU.CRUD}`,

    // El servicio de imágenes usa BASE_URL_IMG ⭐
    BANNER_UPLOAD: `${API_CONFIG.BASE_URL_IMG}${API_CONFIG.ENDPOINTS.BANNER.UPLOAD}`
    // Resultado: http://10.10.254.127:3013/upload_banner
};
```

#### 🔍 **¿Por qué BASE_URL_IMG?**
- **Separación de responsabilidades**: Las imágenes pueden estar en un servidor diferente (CDN, servicio de archivos)
- **Optimización**: Mejor distribución de carga entre servidores
- **Escalabilidad**: Permite escalar el almacenamiento de imágenes independientemente
- **Flexibilidad**: Facilita migraciones o cambios en la infraestructura de imágenes

### Opción 2: Configuración dinámica (Alternativa)
Si prefieres usar configuración dinámica via spconfig, puedes cambiar el servicio para usar `ApiConfigService` con:
- **ID**: 20 (configurable en el servicio)
- **Route**: upload_banner
- **URL**: La URL completa del endpoint

## Consideraciones de Seguridad

- ✅ Validación de tipos de archivo en cliente y servidor
- ✅ Límites de tamaño de archivo
- ✅ Autenticación requerida (sesión)
- ✅ Sanitización de nombres de archivo
- ⚠️ Considerar implementar límites de tasa (rate limiting)

## Testing

### Pruebas Unitarias
```typescript
describe('ImageUploadService', () => {
    let service: ImageUploadService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ImageUploadService);
    });

    it('debería validar archivos correctamente', () => {
        const files = [new File([''], 'test.jpg')];
        const result = service.validateFiles(files);
        expect(result.isValid).toBeTruthy();
    });
});
```
