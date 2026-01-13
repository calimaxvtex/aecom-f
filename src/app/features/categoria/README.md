# Feature: Categorías

## Descripción
Módulo para la gestión de categorías jerárquicas en el sistema. Soporta hasta 3 niveles de categorización.

## Endpoint
- **URL**: `/api/admcat/v1`
- **Acciones**: `SL` (query), `UP` (update), `IN` (insert), `DL` (delete)

## Estructura Jerárquica
- **Nivel 1**: Categorías raíz (sin padre)
- **Nivel 2**: Subcategorías (con padre nivel 1)
- **Nivel 3**: Sub-subcategorías (con padre nivel 2)

## Estados
- **A**: Activo
- **R**: Retirado/Inactivo

## Filtros Principales
- `id_proy`: ID del proyecto
- `nivel`: Nivel jerárquico (1, 2, 3)
- `estado`: Estado de la categoría (A/R)
- `id_cat_padre`: ID de la categoría padre (requerido para niveles 2 y 3)

## Ejemplos de Payload

### Consulta inicial (nivel 1, proyecto 2, activas)
```json
{
    "action": "SL",
    "id_proy": 2,
    "nivel": 1,
    "estado": "A"
}
```

### Consulta con filtro de padre (nivel 2, padre específico)
```json
{
    "action": "SL",
    "id_proy": 2,
    "nivel": 2,
    "id_cat_padre": 1,
    "estado": "A"
}
```

### Obtener categorías padre disponibles
```json
{
    "action": "SL",
    "id_proy": 2,
    "nivel": 1,
    "estado": "A"
}
```
