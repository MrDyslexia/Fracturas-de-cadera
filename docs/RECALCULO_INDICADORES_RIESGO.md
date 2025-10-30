# Script de Recálculo de Indicadores de Riesgo

## Descripción

Este script recorre todos los resultados de laboratorio en la base de datos y calcula los indicadores de riesgo basándose en criterios clínicos predefinidos, almacenándolos en la tabla `indicador_riesgo`.

## Ubicación

```
Backend/Fracturas-de-cadera/scripts/recalcular_indicadores_riesgo.js
Backend/Fracturas-de-cadera/scripts/test_indicadores_riesgo.js
```

## Criterios de Riesgo Implementados

### Parámetros Bioquímicos

| Parámetro | Criterio | Puntaje | Descripción |
|-----------|----------|---------|-------------|
| VITAMINA D | < 20 ng/mL | 2 | Deficiencia de vitamina D |
| ALBÚMINA | < 3.5 g/dL | 1 | Riesgo nutricional |
| HEMOGLOBINA | < 11 g/dL | 1 | Anemia |
| CREATININA | >= 1.3 mg/dL | 1 | Compromiso renal |
| CALCIO | < 8.5 mg/dL | 1 | Hipocalcemia |
| CALCIO CORREGIDO | < 8.5 mg/dL | 1 | Hipocalcemia corregida |
| INR | > 1.5 | 1 | Riesgo hemorrágico |

### Ratios Inflamatorios

| Parámetro | Criterio | Puntaje | Descripción |
|-----------|----------|---------|-------------|
| NLR | > 4.5 | 1 | Inflamación elevada |
| MLR | > 0.35 | 1 | Inmunosenescencia |
| PLR | > 200 | 1 | Actividad plaquetaria aumentada |

## Uso

### 1. Ejecutar Test de Validación

Antes de ejecutar el script completo, se recomienda ejecutar el test para verificar que todo funciona correctamente:

```bash
cd Backend/Fracturas-de-cadera
node scripts/test_indicadores_riesgo.js
```

Este test:
- ✅ Verifica la lógica de evaluación de riesgos
- ✅ Consulta la base de datos para obtener estadísticas
- ✅ Muestra ejemplos de resultados que cumplirían criterios
- ✅ No modifica ningún dato

### 2. Modo Dry-Run (Simulación)

Para ver qué cambios se realizarían sin guardarlos:

```bash
node scripts/recalcular_indicadores_riesgo.js --dry-run
```

### 3. Procesar Todos los Resultados

Para recalcular indicadores de riesgo para TODOS los resultados:

```bash
node scripts/recalcular_indicadores_riesgo.js
```

### 4. Procesar un Resultado Específico

Para procesar un único resultado:

```bash
node scripts/recalcular_indicadores_riesgo.js --resultado-id=123
```

### 5. Procesar Resultados de un Episodio

Para procesar todos los resultados de un episodio específico:

```bash
node scripts/recalcular_indicadores_riesgo.js --episodio-id=456
```

### 6. Procesar con Límite

Para procesar solo los primeros N resultados (útil para pruebas):

```bash
node scripts/recalcular_indicadores_riesgo.js --limit=100
```

### 7. Modo Verbose

Para ver información detallada durante el procesamiento:

```bash
node scripts/recalcular_indicadores_riesgo.js --verbose
```

## Opciones Combinadas

Puedes combinar múltiples opciones:

```bash
# Dry-run con verbose para un episodio específico
node scripts/recalcular_indicadores_riesgo.js --dry-run --verbose --episodio-id=456

# Procesar primeros 50 resultados con detalles
node scripts/recalcular_indicadores_riesgo.js --limit=50 --verbose

# Procesar un resultado en modo dry-run con verbose
node scripts/recalcular_indicadores_riesgo.js --dry-run --verbose --resultado-id=123
```

## Funcionalidad

### ¿Qué hace el script?

1. **Consulta resultados**: Obtiene los resultados de laboratorio según los filtros especificados
2. **Evalúa criterios**: Para cada resultado, verifica si cumple algún criterio de riesgo
3. **Calcula indicadores**: Si cumple el criterio, calcula el puntaje y descripción
4. **Almacena datos**: Crea o actualiza el registro en `indicador_riesgo`
5. **Reporta estadísticas**: Muestra resumen de la operación

### Lógica de Evaluación

Para cada resultado de laboratorio:

```javascript
1. Obtener parámetro y valor
2. Buscar criterio correspondiente
3. Si cumple el criterio:
   - Generar descripción
   - Asignar puntaje
   - Crear/actualizar indicador_riesgo
4. Si no cumple:
   - No crear indicador (parámetro en rango normal)
```

### Manejo de Duplicados

- Si ya existe un indicador para el resultado: **actualiza** si cambió
- Si no existe: **crea** nuevo registro
- Los indicadores obsoletos no se eliminan automáticamente

## Estructura de la Tabla indicador_riesgo

```sql
CREATE TABLE indicador_riesgo (
  indicador_id INT PRIMARY KEY AUTO_INCREMENT,
  descripcion TEXT,
  puntaje FLOAT,
  resultado_id INT NOT NULL,
  FOREIGN KEY (resultado_id) REFERENCES resultado(resultado_id)
);
```

Ejemplo de registro creado:

```json
{
  "indicador_id": 123,
  "descripcion": "Vitamina D < 20 ng/mL - Deficiencia de vitamina D",
  "puntaje": 2,
  "resultado_id": 456
}
```

## Ejemplos de Salida

### Test de Validación

```
═══════════════════════════════════════════════════════
  TEST DE EVALUACIÓN DE RIESGOS
═══════════════════════════════════════════════════════

🧪 Ejecutando casos de prueba...

✅ Vitamina D baja: VITD=15
   → Vitamina D < 20 ng/mL - Deficiencia de vitamina D (puntaje: 2)
✅ Vitamina D normal: VITD=25
✅ Albúmina baja: ALBUMINA=3.0
   → Albúmina < 3.5 g/dL - Riesgo nutricional (puntaje: 1)

Resultados: 10 pasados, 0 fallados
```

### Ejecución Completa

```
═══════════════════════════════════════════════════════
  RECÁLCULO DE INDICADORES DE RIESGO
═══════════════════════════════════════════════════════

📊 Procesando TODOS los resultados de laboratorio

📋 Total de resultados a procesar: 1250

─────────────────────────────────────────────────────

  → Procesando resultado 1: VITD = 15
    ✓ Creado indicador 1
  → Procesando resultado 2: ALBUMINA = 4.0
    ✓ No cumple criterios de riesgo
  → Procesando resultado 3: HB = 10.5
    ✓ Creado indicador 2

═══════════════════════════════════════════════════════
  RESUMEN DE EJECUCIÓN
═══════════════════════════════════════════════════════

Total de resultados:          1250
Procesados exitosamente:      1250
Indicadores creados:          187
Indicadores actualizados:     23
Errores:                      0

Tasa de éxito:                100.0%

✅ Se crearon/actualizaron 210 indicadores de riesgo

✅ Operación completada exitosamente
```

## Casos de Uso

### Caso 1: Primera Implementación

Cuando se implementa por primera vez el sistema de indicadores de riesgo:

```bash
# 1. Verificar que funciona
node scripts/test_indicadores_riesgo.js

# 2. Ver qué se crearía
node scripts/recalcular_indicadores_riesgo.js --dry-run --verbose

# 3. Ejecutar con un límite pequeño para probar
node scripts/recalcular_indicadores_riesgo.js --limit=10

# 4. Si todo está bien, procesar todo
node scripts/recalcular_indicadores_riesgo.js
```

### Caso 2: Actualización de Criterios

Cuando se modifican los criterios de riesgo:

```bash
# Recalcular todos los indicadores con los nuevos criterios
node scripts/recalcular_indicadores_riesgo.js
```

### Caso 3: Corrección de un Episodio

Cuando hay un error en los datos de un episodio específico:

```bash
# Recalcular solo ese episodio
node scripts/recalcular_indicadores_riesgo.js --episodio-id=456
```

### Caso 4: Verificación de un Resultado

Para verificar si un resultado específico genera un indicador:

```bash
# Con verbose para ver detalles
node scripts/recalcular_indicadores_riesgo.js --resultado-id=123 --verbose
```

## Integración con el Sistema

### Recálculo Automático

El sistema ya recalcula automáticamente cuando se crean/actualizan resultados a través de la API, pero este script permite:

- Recalcular datos históricos
- Corregir errores masivos
- Actualizar criterios para todos los datos
- Sincronizar después de migraciones

### Monitoreo

Se recomienda ejecutar periódicamente para:

```bash
# Verificar integridad
node scripts/test_indicadores_riesgo.js

# Identificar resultados sin indicadores
# (aquellos que deberían tenerlos pero no)
```

## Consideraciones Técnicas

### Rendimiento

- Procesa resultados en secuencia (no en paralelo)
- Para grandes volúmenes (>10,000), usar `--limit` en bloques
- El modo `--verbose` genera mucha salida, usar solo para debugging

### Transacciones

- No usa transacciones por defecto
- Si falla un resultado, continúa con el siguiente
- Los errores se registran en el reporte final

### Seguridad

- ✅ No elimina datos existentes
- ✅ Solo crea/actualiza indicadores
- ✅ Modo dry-run para verificar antes de aplicar
- ✅ Reporte detallado de cambios

## Troubleshooting

### Error: "No se encontraron resultados"

**Causa**: No hay resultados que coincidan con los filtros

**Solución**: 
```bash
# Verificar que existen resultados
node scripts/test_indicadores_riesgo.js
```

### Error: "Cannot find module '../model/initModels'"

**Causa**: Ruta incorrecta o modelos no inicializados

**Solución**:
```bash
# Ejecutar desde el directorio correcto
cd Backend/Fracturas-de-cadera
node scripts/recalcular_indicadores_riesgo.js
```

### Muchos errores durante procesamiento

**Causa**: Datos inconsistentes o valores nulos

**Solución**:
```bash
# Ejecutar con verbose para ver detalles
node scripts/recalcular_indicadores_riesgo.js --verbose --limit=10
```

## Mantenimiento

### Agregar Nuevos Criterios

1. Editar `CRITERIOS_RIESGO` en el script
2. Agregar nuevo objeto con:
   - `parametro`: nombre del parámetro en tabla resultado
   - `criterio`: función que evalúa si cumple
   - `descripcion`: texto descriptivo
   - `puntaje`: puntos asignados
   - `mensaje`: recomendación clínica

3. Ejecutar test:
```bash
node scripts/test_indicadores_riesgo.js
```

4. Recalcular todos:
```bash
node scripts/recalcular_indicadores_riesgo.js
```

### Modificar Umbrales

Solo editar los valores en las funciones `criterio` de `CRITERIOS_RIESGO` y recalcular.

## Relación con Otros Scripts

- **recalcular_episodios_indicador.js**: Calcula riesgos a nivel de episodio (tabla `episodio_indicador`)
- **recalcular_indicadores_riesgo.js**: Calcula riesgos a nivel de resultado (tabla `indicador_riesgo`)

Ambos scripts son complementarios y manejan diferentes niveles de granularidad en el sistema de riesgos.

## Autor

Sistema de recálculo masivo de indicadores de riesgo para fracturas de cadera.

Fecha: Octubre 2025
