# Scripts de Recálculo - Guía Rápida

## Resumen

Este directorio contiene scripts para recalcular indicadores de riesgo en el sistema de fracturas de cadera.

## Scripts Disponibles

### 1. Indicadores de Riesgo (tabla `indicador_riesgo`)

Calcula riesgos basados en **resultados de laboratorio individuales**.

```bash
# Test
node scripts/test_indicadores_riesgo.js

# Dry-run
node scripts/recalcular_indicadores_riesgo.js --dry-run

# Ejecución completa
node scripts/recalcular_indicadores_riesgo.js
```

📖 **Documentación completa**: `docs/RECALCULO_INDICADORES_RIESGO.md`

**Criterios evaluados**: Vitamina D, Albúmina, Hemoglobina, Creatinina, NLR, MLR, etc.

### 2. Episodio Indicador (tabla `episodio_indicador`)

Calcula riesgos a nivel de **episodio completo** (factores generales, bioquímicos, clínicos).

```bash
# Test
node scripts/test-recalculo-riesgos.js

# Dry-run
node scripts/recalcular-todos-los-riesgos.js --dry-run

# Ejecución completa
node scripts/recalcular-todos-los-riesgos.js
```

📖 **Documentación completa**: `docs/RECALCULO_MASIVO.md`

**Criterios evaluados**: Edad, sexo, fracturas previas, comorbilidades, índices funcionales, etc.

## ¿Cuál usar?

| Necesidad | Script a usar |
|-----------|---------------|
| Recalcular riesgos por resultados de lab | `recalcular_indicadores_riesgo.js` |
| Recalcular riesgos generales del episodio | `recalcular-todos-los-riesgos.js` |
| Recalcular TODO | Ejecutar ambos scripts |

## Flujo Recomendado

### Primera Vez

1. **Verificar conexión**:
   ```bash
   node scripts/test_indicadores_riesgo.js
   node scripts/test-recalculo-riesgos.js
   ```

2. **Simulación (dry-run)**:
   ```bash
   node scripts/recalcular_indicadores_riesgo.js --dry-run
   node scripts/recalcular-todos-los-riesgos.js --dry-run
   ```

3. **Prueba limitada**:
   ```bash
   node scripts/recalcular_indicadores_riesgo.js --limit=10
   node scripts/recalcular-todos-los-riesgos.js --limit=10
   ```

4. **Ejecución completa**:
   ```bash
   node scripts/recalcular_indicadores_riesgo.js
   node scripts/recalcular-todos-los-riesgos.js
   ```

### Actualización Rutinaria

Si cambian los criterios de riesgo:

```bash
# Recalcular todo
node scripts/recalcular_indicadores_riesgo.js
node scripts/recalcular-todos-los-riesgos.js
```

### Corrección de un Episodio

```bash
# Riesgos de laboratorio
node scripts/recalcular_indicadores_riesgo.js --episodio-id=123

# Riesgos generales
node scripts/recalcular-todos-los-riesgos.js --episodio-id=123
```

## Opciones Comunes

Ambos scripts soportan las mismas opciones:

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `--dry-run` | Simular sin guardar | `--dry-run` |
| `--verbose` | Mostrar detalles | `--verbose` |
| `--episodio-id=N` | Procesar episodio específico | `--episodio-id=123` |
| `--resultado-id=N` | Procesar resultado específico* | `--resultado-id=456` |
| `--control-id=N` | Procesar control específico** | `--control-id=789` |
| `--limit=N` | Limitar cantidad | `--limit=100` |

\* Solo en `recalcular_indicadores_riesgo.js`

\** Solo en `recalcular-todos-los-riesgos.js`

## Tablas Afectadas

```
indicador_riesgo
├── Almacena riesgos por resultado individual
└── Campos: indicador_id, descripcion, puntaje, resultado_id

episodio_indicador
├── Almacena riesgos agregados por episodio
└── Campos: id, episodio_id, factor_riesgo_id, cumple, puntaje, detalles, fecha_evaluacion
```

## Troubleshooting

### "No se encontraron datos"

Verificar que existan datos:

```bash
node scripts/test_indicadores_riesgo.js
node scripts/test-recalculo-riesgos.js
```

### "Error de conexión a BD"

Verificar configuración en `model/db.js` y que el servidor de BD esté activo.

### "Cannot find module"

Ejecutar desde el directorio correcto:

```bash
cd Backend/Fracturas-de-cadera
node scripts/[nombre-script].js
```

## Mantenimiento

### Agregar nuevos criterios de riesgo

1. **Para resultados de laboratorio**: 
   - Editar `CRITERIOS_RIESGO` en `recalcular_indicadores_riesgo.js`

2. **Para factores generales/clínicos**: 
   - Editar `config/riesgoFactores.js`

3. Ejecutar test y recalcular:
   ```bash
   node scripts/test_indicadores_riesgo.js
   node scripts/recalcular_indicadores_riesgo.js
   ```

## Documentación Completa

- 📄 `docs/RECALCULO_INDICADORES_RIESGO.md` - Indicadores por resultado
- 📄 `docs/RECALCULO_MASIVO.md` - Indicadores por episodio
- 📄 `docs/API_RECALCULO.md` - API de recálculo automático

## Contacto

Para dudas o problemas, revisar la documentación completa en el directorio `docs/`.
