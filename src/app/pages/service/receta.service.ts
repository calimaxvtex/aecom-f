import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Receta } from '@/types/receta';

@Injectable({
    providedIn: 'root'
})
export class RecetaMockService {

    getRecetasData() {
        return [
            {
                id_receta: 1,
                title: 'Tacos al Pastor',
                title_min: 'Tacos Pastor',
                description: 'Deliciosos tacos al pastor con piña, cilantro y cebolla. Una receta tradicional mexicana que combina sabores únicos.',
                ingredients: 'Carne de cerdo, piña, achiote, chiles guajillo, cilantro, cebolla, tortillas de maíz',
                instructions: '1. Marinar la carne con achiote y chiles. 2. Asar en trompo. 3. Cortar en tacos. 4. Servir con piña y cilantro.',
                id_coll: 1,
                url_banner: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop',
                url_mini: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
                time: '45 min',
                servings: 4,
                status: 'activo' as const,
                estado: 'AC',
                difficulty: 'medio' as const,
                category: 'Mexicana',
                created_at: new Date('2024-01-15'),
                updated_at: new Date('2024-01-20')
            },
            {
                id_receta: 2,
                title: 'Enchiladas Verdes',
                title_min: 'Enchiladas V.',
                description: 'Enchiladas suaves bañadas en salsa verde de tomatillos, rellenas de pollo deshebrado y queso.',
                ingredients: 'Tomatillos, chiles serranos, pollo, queso, tortillas de maíz, crema, cilantro',
                instructions: '1. Cocer tomatillos y chiles. 2. Licuar la salsa. 3. Rellenar tortillas con pollo. 4. Bañar en salsa y hornear.',
                id_coll: 2,
                url_banner: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=400&fit=crop',
                url_mini: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=100&h=100&fit=crop',
                time: '60 min',
                servings: 6,
                status: 'activo' as const,
                estado: 'AC',
                difficulty: 'medio' as const,
                category: 'Mexicana',
                created_at: new Date('2024-01-10'),
                updated_at: new Date('2024-01-18')
            },
            {
                id_receta: 3,
                title: 'Pozole Rojo',
                title_min: 'Pozole Rojo',
                description: 'Sopa tradicional mexicana hecha con maíz cacahuazintle, carne de cerdo y chile rojo.',
                ingredients: 'Maíz cacahuazintle, carne de cerdo, chiles guajillo, ancho, rábanos, lechuga, limón',
                instructions: '1. Cocer el maíz. 2. Preparar la carne. 3. Hacer el caldo con chiles. 4. Servir con garnachas.',
                id_coll: 3,
                url_banner: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&h=400&fit=crop',
                url_mini: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=100&h=100&fit=crop',
                time: '180 min',
                servings: 8,
                status: 'inactivo' as const,
                estado: 'IN',
                difficulty: 'dificil' as const,
                category: 'Sopas',
                created_at: new Date('2024-01-05'),
                updated_at: new Date('2024-01-12')
            },
            {
                id_receta: 4,
                title: 'Tamales de Pollo',
                title_min: 'Tamales Pollo',
                description: 'Tamales tradicionales rellenos de pollo en salsa verde, envueltos en hojas de maíz.',
                ingredients: 'Masa de maíz, pollo, salsa verde, hojas de maíz, manteca, sal',
                instructions: '1. Preparar la masa. 2. Cocer el pollo con salsa. 3. Rellenar las hojas. 4. Cocer al vapor.',
                id_coll: 4,
                url_banner: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=400&fit=crop',
                url_mini: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=100&h=100&fit=crop',
                time: '120 min',
                servings: 10,
                status: 'borrador' as const,
                estado: 'BO',
                difficulty: 'dificil' as const,
                category: 'Mexicana',
                created_at: new Date('2024-01-01'),
                updated_at: new Date('2024-01-08')
            },
            {
                id_receta: 5,
                title: 'Chiles Rellenos',
                title_min: 'Chiles Rell.',
                description: 'Chiles poblanos rellenos de queso, rebozados y fritos, bañados en salsa de jitomate.',
                ingredients: 'Chiles poblanos, queso, jitomate, cebolla, huevo, harina, aceite',
                instructions: '1. Asar y pelar chiles. 2. Rellenar con queso. 3. Rebozar. 4. Freír y bañar en salsa.',
                id_coll: 5,
                url_banner: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop',
                url_mini: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
                time: '75 min',
                servings: 4,
                status: 'activo' as const,
                estado: 'AC',
                difficulty: 'medio' as const,
                category: 'Mexicana',
                created_at: new Date('2023-12-20'),
                updated_at: new Date('2024-01-05')
            },
            {
                id_receta: 6,
                title: 'Mole Poblano',
                title_min: 'Mole Poblano',
                description: 'Salsa compleja y aromática que combina chiles, chocolate y especias, típica de Puebla.',
                ingredients: 'Chiles mulatos, pasilla, ancho, almendras, chocolate, canela, clavo, pollo',
                instructions: '1. Tostar y remojar chiles. 2. Moler todos los ingredientes. 3. Cocer el mole. 4. Servir con pollo.',
                id_coll: 6,
                url_banner: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&h=400&fit=crop',
                url_mini: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=100&h=100&fit=crop',
                time: '150 min',
                servings: 6,
                status: 'activo' as const,
                estado: 'AC',
                difficulty: 'dificil' as const,
                category: 'Salsas',
                created_at: new Date('2023-12-15'),
                updated_at: new Date('2024-01-02')
            },
            {
                id_receta: 7,
                title: 'Guacamole Casero',
                title_min: 'Guacamole',
                description: 'Dip cremoso hecho con aguacates frescos, limón, cilantro y chile, perfecto como botana.',
                ingredients: 'Aguacates, limón, cilantro, chile serrano, cebolla, jitomate, sal',
                instructions: '1. Madurar aguacates. 2. Moler cilantro y chile. 3. Mezclar todo. 4. Servir inmediatamente.',
                id_coll: 7,
                url_banner: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&h=400&fit=crop',
                url_mini: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=100&h=100&fit=crop',
                time: '15 min',
                servings: 4,
                status: 'inactivo' as const,
                estado: 'IN',
                difficulty: 'facil' as const,
                category: 'Botanas',
                created_at: new Date('2023-12-10'),
                updated_at: new Date('2023-12-25')
            },
            {
                id_receta: 8,
                title: 'Ceviche de Camarón',
                title_min: 'Ceviche Cam.',
                description: 'Ceviche refrescante de camarones marinados en limón, con cilantro, cebolla y chile.',
                ingredients: 'Camarones, limón, cilantro, cebolla morada, chile serrano, aguacate, sal',
                instructions: '1. Cocer camarones. 2. Marinar en limón. 3. Mezclar con verduras. 4. Enfriar y servir.',
                id_coll: 8,
                url_banner: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop',
                url_mini: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
                time: '30 min',
                servings: 4,
                status: 'borrador' as const,
                estado: 'BO',
                difficulty: 'medio' as const,
                category: 'Mariscos',
                created_at: new Date('2023-12-05'),
                updated_at: new Date('2023-12-20')
            }
        ];
    }

    getRecetas() {
        return Promise.resolve(this.getRecetasData());
    }

    getRecetaById(id: number) {
        const recetas = this.getRecetasData();
        return Promise.resolve(recetas.find(receta => receta.id_receta === id));
    }

    updateReceta(receta: Receta) {
        // Simular actualización en backend
        receta.updated_at = new Date();
        return Promise.resolve(receta);
    }

    deleteReceta(id: number) {
        // Simular eliminación en backend
        return Promise.resolve({ success: true });
    }

    createReceta(receta: Omit<Receta, 'id_receta'>) {
        const newReceta: Receta = {
            ...receta,
            id_receta: this.generateId(),
            created_at: new Date(),
            updated_at: new Date()
        };
        return Promise.resolve(newReceta);
    }

    toggleStatus(id: number) {
        const recetas = this.getRecetasData();
        const receta = recetas.find(r => r.id_receta === id);
        if (receta) {
            receta.estado = receta.estado === 'activo' ? 'inactivo' : 'activo';
            receta.updated_at = new Date();
            return Promise.resolve(receta);
        }
        return Promise.reject(new Error('Receta not found'));
    }

    private generateId(): number {
        const recetas = this.getRecetasData();
        const maxId = Math.max(...recetas.map(r => r.id_receta));
        return maxId + 1;
    }

    updateRecetaField(id: number, field: string, value: any, sessionBase: any): Observable<any> {
        // Simular actualización de campo específico en backend
        const recetas = this.getRecetasData();
        const receta = recetas.find(r => r.id_receta === id);
        if (receta) {
            (receta as any)[field] = value;
            receta.updated_at = new Date();
            return of({ success: true, message: 'Campo actualizado' });
        }
        return of({ success: false, message: 'Receta no encontrada' });
    }
}
