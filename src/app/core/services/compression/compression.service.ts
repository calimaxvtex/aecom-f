import { Injectable, inject } from '@angular/core';
import * as pako from 'pako';
import {
  CompressionAlgorithm,
  CompressionOptions,
  CompressionAlgorithmHandler,
  CompressionConfig,
  DecompressionResult
} from '@/features/productos/models/subcategoria.interface';

/**
 * Servicio genérico de compresión/descompresión
 * Diseñado para ser reutilizado por múltiples servicios (subcategorías, artículos, etc.)
 *
 * Características:
 * - Soporte múltiple algoritmos (gzip, zlib, lz, none)
 * - Detección automática de algoritmo
 * - Métricas de rendimiento
 * - Logging detallado
 * - Manejo robusto de errores
 * - Configurable y extensible
 */
@Injectable({
  providedIn: 'root'
})
export class CompressionService {

  // Configuración por defecto
  private config: CompressionConfig = {
    defaultAlgorithm: 'gzip',
    algorithms: ['gzip', 'zlib', 'lz', 'none'],
    enableMetrics: true,
    enableLogging: true,
    fallbackToNone: true
  };

  // Handlers de algoritmos registrados
  private algorithmHandlers: Map<CompressionAlgorithm, CompressionAlgorithmHandler> = new Map();

  constructor() {
    this.initializeAlgorithms();
  }

  /**
   * Inicializar todos los algoritmos disponibles
   */
  private initializeAlgorithms(): void {
    // GZIP/ZLIB Handler (usando Pako)
    this.registerAlgorithm({
      name: 'gzip',
      compress: (data: any, options?: CompressionOptions): string => {
        const jsonString = JSON.stringify(data);
        const level = (options?.level || 6) as pako.DeflateOptions['level'];
        const compressed = pako.gzip(jsonString, { level });
        return btoa(String.fromCharCode(...compressed));
      },
      decompress: (data: any, options?: CompressionOptions): any => {
        try {
          let compressedArray: Uint8Array;

          // Formato 1: Buffer de Node.js (nuevo formato del backend)
          if (typeof data === 'object' &&
              data.type === 'Buffer' &&
              Array.isArray(data.data)) {

            if (this.config.enableLogging) {
              console.log('📦 Detectado formato Buffer de Node.js, convirtiendo a Uint8Array...');
            }

            // Convertir array de bytes a Uint8Array
            compressedArray = new Uint8Array(data.data);

            if (this.config.enableLogging) {
              console.log(`🔢 Array de bytes convertido: ${compressedArray.length} bytes`);
            }
          }
          // Formato 2: String base64 (formato anterior)
          else if (typeof data === 'string') {
            if (this.config.enableLogging) {
              console.log('📦 Detectado formato base64, decodificando...');
            }

            // Decodificar base64
            const binaryString = atob(data);

            // Convertir a Uint8Array
            compressedArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              compressedArray[i] = binaryString.charCodeAt(i);
            }
          }
          // Formato 3: Array directo de números
          else if (Array.isArray(data)) {
            if (this.config.enableLogging) {
              console.log('📦 Detectado array directo de bytes, convirtiendo...');
            }

            compressedArray = new Uint8Array(data);
          }
          else {
            throw new Error('Formato de datos comprimidos no reconocido');
          }

          // Verificar si realmente está comprimido antes de intentar descomprimir
          if (!this.isLikelyCompressed(compressedArray)) {
            if (this.config.enableLogging) {
              console.warn('⚠️ Los datos no parecen estar comprimidos con GZIP');
              console.log('🔍 Bytes iniciales:', compressedArray.slice(0, 10));
              console.log('📄 Intentando tratar como texto plano...');
            }

            // Intentar convertir directamente a string (podría ser texto plano)
            const textContent = new TextDecoder('utf-8').decode(compressedArray);

            if (this.config.enableLogging) {
              console.log('📄 Contenido como texto plano (primeros 200 chars):', textContent.substring(0, 200));
            }

            return textContent;
          }

          // Descomprimir usando pako
          if (this.config.enableLogging) {
            console.log('🗜️ Descomprimiendo con Pako...');
          }

          const decompressed = pako.ungzip(compressedArray, { to: 'string' });

          if (this.config.enableLogging) {
            console.log(`✅ Datos descomprimidos: ${decompressed.length} caracteres`);
          }

          // Intentar parsear JSON
          let parsedData: any;
          try {
            parsedData = JSON.parse(decompressed);

            if (this.config.enableLogging) {
              console.log('📋 JSON parseado exitosamente');
            }
          } catch (jsonError) {
            if (this.config.enableLogging) {
              console.warn('⚠️ Contenido descomprimido no es JSON válido:', jsonError);
              console.log('📄 Contenido descomprimido (primeros 200 chars):', decompressed.substring(0, 200));
              console.log('📄 Contenido descomprimido (últimos 200 chars):', decompressed.substring(Math.max(0, decompressed.length - 200)));
            }

            // Si no es JSON válido, devolver el string descomprimido
            parsedData = decompressed;
          }

          return parsedData;

        } catch (error) {
          if (this.config.enableLogging) {
            console.error('❌ Error descomprimiendo GZIP:', error);
            console.error('📋 Datos de entrada:', data);
          }
          throw error;
        }
      },
      detect: (data: string): boolean => {
        try {
          // Intentar detectar formato GZIP
          const binaryString = atob(data);
          return binaryString.length > 0 && binaryString.charCodeAt(0) === 0x1f;
        } catch {
          return false;
        }
      }
    });

  

    // ZLIB Handler (similar a GZIP pero sin header)
    this.registerAlgorithm({
      name: 'zlib',
      compress: (data: any, options?: CompressionOptions): string => {
        const jsonString = JSON.stringify(data);
        const level = (options?.level || 6) as pako.DeflateOptions['level'];
        const compressed = pako.deflate(jsonString, { level });
        return btoa(String.fromCharCode(...compressed));
      },
      decompress: (data: any, options?: CompressionOptions): any => {
        try {
          let compressedArray: Uint8Array;

          // Formato 1: Buffer de Node.js
          if (typeof data === 'object' && data.type === 'Buffer' && Array.isArray(data.data)) {
            compressedArray = new Uint8Array(data.data);
          }
          // Formato 2: String base64
          else if (typeof data === 'string') {
            const binaryString = atob(data);
            compressedArray = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              compressedArray[i] = binaryString.charCodeAt(i);
            }
          }
          // Formato 3: Array directo de números
          else if (Array.isArray(data)) {
            compressedArray = new Uint8Array(data);
          }
          else {
            throw new Error('Formato de datos comprimidos no reconocido');
          }

          // Verificar si realmente está comprimido antes de intentar descomprimir
          if (!this.isLikelyCompressed(compressedArray)) {
            const textContent = new TextDecoder('utf-8').decode(compressedArray);
            return textContent;
          }

          // Descomprimir usando pako (inflate para ZLIB)
          const decompressed = pako.inflate(compressedArray, { to: 'string' });

          // Intentar parsear JSON
          let parsedData: any;
          try {
            parsedData = JSON.parse(decompressed);
          } catch (jsonError) {
            // Si no es JSON válido, devolver el string descomprimido
            parsedData = decompressed;
          }

          return parsedData;
        } catch (error) {
          if (this.config.enableLogging) {
            console.error('❌ Error descomprimiendo ZLIB:', error);
          }
          throw error;
        }
      },
      detect: (data: string): boolean => {
        try {
          const binaryString = atob(data);
          return binaryString.length > 0 && binaryString.charCodeAt(0) === 0x78;
        } catch {
          return false;
        }
      }
    });

    // LZ Handler (para compatibilidad futura)
    this.registerAlgorithm({
      name: 'lz',
      compress: (data: any, options?: CompressionOptions): string => {
        // Placeholder para LZ compression
        // Se puede implementar con lz-string si es necesario
        console.warn('⚠️ LZ compression no implementado aún');
        return JSON.stringify(data);
      },
      decompress: (data: string, options?: CompressionOptions): any => {
        // Placeholder para LZ decompression
        console.warn('⚠️ LZ decompression no implementado aún');
        return JSON.parse(data);
      },
      detect: (data: string): boolean => {
        // Placeholder para detección LZ
        return false;
      }
    });

    // NONE Handler (sin compresión)
    this.registerAlgorithm({
      name: 'none',
      compress: (data: any, options?: CompressionOptions): string => {
        return JSON.stringify(data);
      },
      decompress: (data: string, options?: CompressionOptions): any => {
        return JSON.parse(data);
      },
      detect: (data: string): boolean => {
        try {
          JSON.parse(data);
          return true;
        } catch {
          return false;
        }
      }
    });

    if (this.config.enableLogging) {
      console.log('✅ Servicio de compresión inicializado con algoritmos:', Array.from(this.algorithmHandlers.keys()));
    }
  }

  /**
   * Registrar un nuevo algoritmo de compresión
   */
  registerAlgorithm(handler: CompressionAlgorithmHandler): void {
    this.algorithmHandlers.set(handler.name, handler);
    if (this.config.enableLogging) {
      console.log(`🔧 Algoritmo registrado: ${handler.name}`);
    }
  }

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig: Partial<CompressionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.config.enableLogging) {
      console.log('⚙️ Configuración de compresión actualizada:', this.config);
    }
  }

  /**
   * Verificar si los datos parecen estar comprimidos con GZIP
   * Soporta múltiples formatos de entrada
   */
  private isLikelyCompressed(data: any): boolean {
    let bytes: Uint8Array;

    // Convertir diferentes formatos a Uint8Array para análisis
    if (data instanceof Uint8Array) {
      bytes = data;
    } else if (Array.isArray(data)) {
      bytes = new Uint8Array(data);
    } else if (typeof data === 'object' && data?.type === 'Buffer' && Array.isArray(data?.data)) {
      // Formato Buffer de Node.js
      bytes = new Uint8Array(data.data);
    } else {
      // No podemos analizar este formato
      if (this.config.enableLogging) {
        console.log('⚠️ Formato de datos no reconocible para análisis de compresión:', typeof data);
      }
      return false;
    }

    if (bytes.length < 2) {
      if (this.config.enableLogging) {
        console.log('⚠️ Array de bytes demasiado pequeño para análisis de compresión');
      }
      return false;
    }

    // Verificar múltiples algoritmos de compresión
    const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;        // GZIP
    const isZlib = bytes[0] === 0x78 && (bytes[1] === 0x01 || bytes[1] === 0x5e || bytes[1] === 0x9c || bytes[1] === 0xda); // ZLIB
    const isDeflate = bytes[0] === 0x08 && bytes[1] === 0x1d;     // DEFLATE (raramente usado directamente)

    // Verificar si parece ser texto plano (JSON o similar)
    const textSample = new TextDecoder('utf-8').decode(bytes.slice(0, Math.min(50, bytes.length)));
    const looksLikeText = /^[{\["\s]*$/.test(textSample.substring(0, 10));

    if (this.config.enableLogging) {
      console.log(`🔍 Análisis de compresión:`, {
        formatoEntrada: this.getDataFormatName(data),
        longitudBytes: bytes.length,
        primerosBytes: Array.from(bytes.slice(0, 4)),
        algoritmos: {
          gzip: isGzip,
          zlib: isZlib,
          deflate: isDeflate
        },
        pareceTextoPlano: looksLikeText,
        muestraTexto: textSample.substring(0, 20) + (textSample.length > 20 ? '...' : '')
      });
    }

    // Retornar true si detecta algún algoritmo de compresión conocido
    return isGzip || isZlib || isDeflate;
  }

  /**
   * Obtener el nombre del formato de datos para logging
   */
  private getDataFormatName(data: any): string {
    if (data instanceof Uint8Array) return 'Uint8Array';
    if (Array.isArray(data)) return 'Array<number>';
    if (typeof data === 'object' && data?.type === 'Buffer') return 'Buffer de Node.js';
    if (typeof data === 'string') return 'String';
    return typeof data;
  }

  /**
   * Función de diagnóstico robusta para múltiples formatos de datos
   * Reemplaza al anterior diagnoseByteArray con soporte completo para:
   * - Buffer de Node.js: { type: "Buffer", data: [...] }
   * - Uint8Array directo
   * - Array de números
   * - Strings
   */
  diagnoseData(data: any): {
    formato: string;
    length: number;
    firstBytes: number[];
    algoritmosDetectados: {
      gzip: boolean;
      zlib: boolean;
      deflate: boolean;
    };
    isLikelyCompressed: boolean;
    pareceTextoPlano: boolean;
    textPreview: string;
    hexPreview: string;
  } {
    let bytes: Uint8Array;
    let formato = this.getDataFormatName(data);

    // Convertir a Uint8Array para análisis
    try {
      if (data instanceof Uint8Array) {
        bytes = data;
      } else if (Array.isArray(data)) {
        bytes = new Uint8Array(data);
      } else if (typeof data === 'object' && data?.type === 'Buffer' && Array.isArray(data?.data)) {
        bytes = new Uint8Array(data.data);
      } else if (typeof data === 'string') {
        // Para strings, convertir a bytes
        const encoder = new TextEncoder();
        bytes = encoder.encode(data);
        formato = 'String (como bytes)';
      } else {
        return {
          formato,
          length: 0,
          firstBytes: [],
          algoritmosDetectados: { gzip: false, zlib: false, deflate: false },
          isLikelyCompressed: false,
          pareceTextoPlano: false,
          textPreview: 'Formato no soportado',
          hexPreview: 'N/A'
        };
      }

      // Análisis detallado
      const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
      const isZlib = bytes[0] === 0x78 && (bytes[1] === 0x01 || bytes[1] === 0x5e || bytes[1] === 0x9c || bytes[1] === 0xda);
      const isDeflate = bytes[0] === 0x08 && bytes[1] === 0x1d;

      const textSample = new TextDecoder('utf-8').decode(bytes.slice(0, Math.min(100, bytes.length)));
      const looksLikeText = /^[{\["\s]*$/.test(textSample.substring(0, 10));

      const hexPreview = Array.from(bytes.slice(0, Math.min(20, bytes.length)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');

      return {
        formato,
        length: bytes.length,
        firstBytes: Array.from(bytes.slice(0, Math.min(10, bytes.length))),
        algoritmosDetectados: {
          gzip: isGzip,
          zlib: isZlib,
          deflate: isDeflate
        },
        isLikelyCompressed: isGzip || isZlib || isDeflate,
        pareceTextoPlano: looksLikeText,
        textPreview: textSample.substring(0, 100) + (textSample.length > 100 ? '...' : ''),
        hexPreview
      };
    } catch (error) {
      return {
        formato,
        length: 0,
        firstBytes: [],
        algoritmosDetectados: { gzip: false, zlib: false, deflate: false },
        isLikelyCompressed: false,
        pareceTextoPlano: false,
        textPreview: `Error en diagnóstico: ${error}`,
        hexPreview: 'N/A'
      };
    }
  }

  /**
   * Detectar automáticamente el algoritmo y descomprimir
   * Soporta múltiples formatos de entrada de manera robusta:
   * - Strings (base64)
   * - Uint8Array directo
   * - Arrays de números
   * - Objetos Buffer de Node.js: { type: "Buffer", data: [...] }
   * - Objetos Buffer anidados (cualquier nivel de anidamiento)
   */
  detectAndDecompress<T = any>(compressedData: any, options?: CompressionOptions): DecompressionResult<T> {
    const startTime = performance.now();

    if (this.config.enableLogging) {
      console.log('🔍 Detectando algoritmo de compresión automáticamente...');
      console.log('📋 Formato de entrada:', this.getDataFormatName(compressedData));
    }

    // Calcular tamaño original
    const originalSize = this.calculateOriginalSize(compressedData);

    // 🔍 Verificar si los datos parecen estar comprimidos
    const shouldAttemptDecompression = this.shouldAttemptDecompression(compressedData);

    if (!shouldAttemptDecompression) {
      if (this.config.enableLogging) {
        console.log('ℹ️ Datos no parecen comprimidos o formato no soportado, retornando tal cual');
      }

      return {
        data: compressedData as T,
        algorithm: 'none',
        originalSize,
        decompressedSize: JSON.stringify(compressedData).length,
        compressionRatio: 0,
        processingTime: performance.now() - startTime
      };
    }

    // Intentar GZIP primero (algoritmo principal)
    try {
      if (this.config.enableLogging) {
        console.log('🎯 Intentando algoritmo GZIP...');
      }

      const handler = this.algorithmHandlers.get('gzip');
      if (handler) {
        const decompressedData = handler.decompress(compressedData, options);
        const decompressedSize = JSON.stringify(decompressedData).length;
        const compressionRatio = originalSize > 0 ?
          ((originalSize - decompressedSize) / originalSize * 100) : 0;

        const result: DecompressionResult<T> = {
          data: decompressedData,
          algorithm: 'gzip',
          originalSize,
          decompressedSize,
          compressionRatio: Math.round(compressionRatio * 100) / 100,
          processingTime: performance.now() - startTime
        };

        if (this.config.enableLogging) {
          console.log(`✅ Descompresión GZIP exitosa:`, {
            ratio: `${result.compressionRatio}%`,
            tiempo: `${result.processingTime.toFixed(2)}ms`
          });
        }

        return result;
      }
    } catch (gzipError) {
      if (this.config.enableLogging) {
        console.warn(`⚠️ Error con GZIP:`, gzipError);
      }
    }

    // Intentar ZLIB como alternativa
    try {
      if (this.config.enableLogging) {
        console.log('🎯 Intentando algoritmo ZLIB...');
      }

      const handler = this.algorithmHandlers.get('zlib');
      if (handler) {
        const decompressedData = handler.decompress(compressedData, options);
        const decompressedSize = JSON.stringify(decompressedData).length;
        const compressionRatio = originalSize > 0 ?
          ((originalSize - decompressedSize) / originalSize * 100) : 0;

        const result: DecompressionResult<T> = {
          data: decompressedData,
          algorithm: 'zlib',
          originalSize,
          decompressedSize,
          compressionRatio: Math.round(compressionRatio * 100) / 100,
          processingTime: performance.now() - startTime
        };

        if (this.config.enableLogging) {
          console.log(`✅ Descompresión ZLIB exitosa:`, {
            ratio: `${result.compressionRatio}%`,
            tiempo: `${result.processingTime.toFixed(2)}ms`
          });
        }

        return result;
      }
    } catch (zlibError) {
      if (this.config.enableLogging) {
        console.warn(`⚠️ Error con ZLIB:`, zlibError);
      }
    }

    // Si ningún algoritmo funcionó, intentar sin compresión como fallback
    if (this.config.fallbackToNone) {
      try {
        if (this.config.enableLogging) {
          console.log('🔄 Fallback: intentando sin compresión...');
        }

        const handler = this.algorithmHandlers.get('none');
        if (handler) {
          const decompressedData = handler.decompress(compressedData, options);
          const decompressedSize = JSON.stringify(decompressedData).length;

          return {
            data: decompressedData,
            algorithm: 'none',
            originalSize,
            decompressedSize,
            compressionRatio: 0,
            processingTime: performance.now() - startTime
          };
        }
      } catch (error) {
        if (this.config.enableLogging) {
          console.error('❌ Error en fallback sin compresión:', error);
        }
      }
    }

    // Si todo falló, devolver error
    const errorMsg = 'No se pudo descomprimir los datos con ningún algoritmo disponible';
    if (this.config.enableLogging) {
      console.error('❌ ' + errorMsg);
      console.error('📋 Datos que causaron el error:', compressedData);
    }
    throw new Error(errorMsg);
  }

  /**
   * Calcular el tamaño original de los datos comprimidos
   */
  private calculateOriginalSize(data: any): number {
    if (typeof data === 'string') {
      return data.length;
    } else if (data instanceof Uint8Array) {
      return data.length;
    } else if (Array.isArray(data)) {
      return data.length;
    } else if (typeof data === 'object') {
      // Para objetos (incluyendo Buffer), calcular el tamaño de su representación JSON
      try {
        return JSON.stringify(data).length;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  /**
   * Determinar si se debe intentar descomprimir los datos
   * Soporta todos los formatos mencionados, incluyendo objetos anidados
   */
  private shouldAttemptDecompression(data: any): boolean {
    // ✅ Formatos que definitivamente deben procesarse
    if (typeof data === 'string') return true; // String base64
    if (data instanceof Uint8Array) return true; // Uint8Array directo
    if (Array.isArray(data)) return true; // Array de números

    // ✅ Objetos Buffer de Node.js (incluso anidados)
    if (this.isBufferObject(data)) return true;

    // ❌ Otros tipos de objetos no se procesan
    if (typeof data === 'object' && data !== null) {
      if (this.config.enableLogging) {
        console.log('⚠️ Objeto no reconocido como dato comprimido:', typeof data, data);
      }
      return false;
    }

    // ❌ Tipos primitivos que no son strings
    return false;
  }

  /**
   * Verificar si un objeto es un Buffer de Node.js (incluso anidado)
   */
  private isBufferObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;

    // Caso directo: { type: "Buffer", data: [...] }
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return true;
    }

    // Caso anidado: buscar recursivamente objetos Buffer
    // Por ejemplo: { data: { type: "Buffer", data: [...] } }
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && this.isBufferObject(obj[key])) {
        return true;
      }
    }

    return false;
  }

  /**
   * Descomprimir usando un algoritmo específico
   */
  decompressWithAlgorithm<T = any>(
    compressedData: string,
    algorithm: CompressionAlgorithm,
    options?: CompressionOptions
  ): DecompressionResult<T> {
    const startTime = performance.now();

    if (this.config.enableLogging) {
      console.log(`🎯 Descomprimiendo con algoritmo específico: ${algorithm}`);
    }

    const originalSize = compressedData.length;
    const handler = this.algorithmHandlers.get(algorithm);

    if (!handler) {
      throw new Error(`Algoritmo no registrado: ${algorithm}`);
    }

    try {
      const decompressedData = handler.decompress(compressedData, options);
      const decompressedSize = JSON.stringify(decompressedData).length;
      const compressionRatio = originalSize > 0 ?
        ((originalSize - decompressedSize) / originalSize * 100) : 0;

      const result: DecompressionResult<T> = {
        data: decompressedData,
        algorithm,
        originalSize,
        decompressedSize,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        processingTime: performance.now() - startTime
      };

      if (this.config.enableLogging) {
        console.log(`✅ Descompresión exitosa con ${algorithm}:`, {
          ratio: `${result.compressionRatio}%`,
          tiempo: `${result.processingTime.toFixed(2)}ms`
        });
      }

      return result;
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(`❌ Error descomprimiendo con ${algorithm}:`, error);
      }
      throw error;
    }
  }

  /**
   * Comprimir datos usando un algoritmo específico
   */
  compressWithAlgorithm(
    data: any,
    algorithm: CompressionAlgorithm,
    options?: CompressionOptions
  ): string {
    const handler = this.algorithmHandlers.get(algorithm);

    if (!handler) {
      throw new Error(`Algoritmo no registrado: ${algorithm}`);
    }

    try {
      const compressed = handler.compress(data, options);

      if (this.config.enableLogging) {
        const originalSize = JSON.stringify(data).length;
        const compressedSize = compressed.length;
        const ratio = originalSize > 0 ?
          ((originalSize - compressedSize) / originalSize * 100) : 0;

        console.log(`📦 Compresión exitosa con ${algorithm}:`, {
          original: originalSize,
          comprimido: compressedSize,
          ratio: `${Math.round(ratio * 100) / 100}%`
        });
      }

      return compressed;
    } catch (error) {
      if (this.config.enableLogging) {
        console.error(`❌ Error comprimiendo con ${algorithm}:`, error);
      }
      throw error;
    }
  }

  /**
   * Obtener métricas de rendimiento
   */
  getMetrics(): {
    algorithms: string[];
    config: CompressionConfig;
    handlersCount: number;
  } {
    return {
      algorithms: Array.from(this.algorithmHandlers.keys()),
      config: this.config,
      handlersCount: this.algorithmHandlers.size
    };
  }

  /**
   * Verificar si un algoritmo está disponible
   */
  isAlgorithmAvailable(algorithm: CompressionAlgorithm): boolean {
    return this.algorithmHandlers.has(algorithm);
  }

  /**
   * Obtener lista de algoritmos disponibles
   */
  getAvailableAlgorithms(): CompressionAlgorithm[] {
    return Array.from(this.algorithmHandlers.keys());
  }
}
