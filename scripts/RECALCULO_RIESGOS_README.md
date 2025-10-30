# Script de Recálculo de Indicadores de Riesgo

Este script permite recalcular todos los indicadores de riesgo de refractura para episodios y controles clínicos almacenándolos en la tabla `episodio_indicador`.

## 📋 Índice

- [Descripción](#descripción)
- [Uso](#uso)
- [Opciones](#opciones)
- [Ejemplos](#ejemplos)
- [Qué hace el script](#qué-hace-el-script)
- [Factores de riesgo evaluados](#factores-de-riesgo-evaluados)
- [Niveles de riesgo](#niveles-de-riesgo)
- [Salida del script](#salida-del-script)
- [Consideraciones](#consideraciones)

## 📝 Descripción

El script `recalcular-todos-los-riesgos.js` es una herramienta que permite:

1. **Recalcular indicadores de riesgo** para todos los episodios en la base de datos
2. **Procesar controles clínicos** asociados a cada episodio
3. **Generar alertas automáticas** cuando se detecta riesgo MODERADO o ALTO
4. **Almacenar resultados** en `episodio_indicador` con detalles completos
5. **Mostrar estadísticas** del proceso de cálculo

## 🚀 Uso

```bash
node scripts/recalcular-todos-los-riesgos.js [opciones]
```

O si el archivo es ejecutable:

```bash
./scripts/recalcular-todos-los-riesgos.js [opciones]
```

## ⚙️ Opciones

| Opción | Descripción |
|--------|-------------|
| `--dry-run` | Simula el proceso sin hacer cambios en la base de datos. Útil para verificar qué se procesaría. |
| `--episodio=ID` | Procesa únicamente el episodio especificado por su ID. |
| `--limit=N` | Procesa solo los primeros N episodios. |
| `--skip=N` | Omite los primeros N episodios antes de comenzar. |
| `--verbose` | Muestra información detallada de cada cálculo realizado. |
| `--quiet` | Solo muestra errores y el resumen final. |
| `--help`, `-h` | Muestra la ayuda del script. |

## 📚 Ejemplos

### Recalcular todos los episodios

```bash
node scripts/recalcular-todos-los-riesgos.js
```

### Modo de prueba (sin cambios en BD)

```bash
node scripts/recalcular-todos-los-riesgos.js --dry-run --verbose
```

Útil para ver qué se procesaría sin hacer cambios reales.

### Recalcular un episodio específico

```bash
node scripts/recalcular-todos-los-riesgos.js --episodio=123
```

### Procesar en lotes

Procesar episodios del 100 al 150:

```bash
node scripts/recalcular-todos-los-riesgos.js --skip=100 --limit=50
```

### Procesar con información detallada

```bash
node scripts/recalcular-todos-los-riesgos.js --verbose
```

### Procesar solo primeros 10 episodios

```bash
node scripts/recalcular-todos-los-riesgos.js --limit=10
```

## 🔍 Qué hace el script

1. **Conexión a BD**: Se conecta a la base de datos usando los modelos de Sequelize.

2. **Obtención de episodios**: 
   - Si se especifica `--episodio=ID`, solo procesa ese episodio
   - Si se usa `--limit` y `--skip`, procesa un rango específico
   - Por defecto, procesa todos los episodios

3. **Para cada episodio**:
   - **Si tiene controles clínicos**: Calcula riesgos para cada control
   - **Si no tiene controles**: Calcula riesgos a nivel de episodio

4. **Cálculo de riesgos**:
   - Evalúa cada factor de riesgo según criterios definidos
   - Asigna puntos por cada factor que cumple
   - Suma puntos totales y determina nivel de riesgo

5. **Almacenamiento**:
   - Elimina indicadores previos para evitar duplicados
   - Crea registros en `episodio_indicador` para cada factor
   - Crea un registro resumen con el puntaje total

6. **Generación de alertas**:
   - Si el nivel es MODERADO o ALTO, crea una alerta en la tabla `alerta`
   - Las alertas incluyen mensaje descriptivo y severidad

7. **Procesamiento por lotes**:
   - Procesa 10 episodios en paralelo para mejor rendimiento
   - Muestra progreso en tiempo real

8. **Resumen final**:
   - Muestra estadísticas completas del procesamiento
   - Indica errores si los hubo

## 📊 Factores de riesgo evaluados

El script evalúa **19 factores de riesgo** organizados en dominios:

### 🔹 Factores Generales

| Factor | Criterio | Puntos |
|--------|----------|--------|
| Edad | >= 80 años | 1 |
| Sexo | Femenino | 1 |
| Fractura previa | Por fragilidad | 2 |
| Fractura vertebral | Previa | 1 |
| Antecedente familiar | Fractura de cadera | 1 |

### 🔹 Factores Bioquímicos

| Factor | Criterio | Puntos |
|--------|----------|--------|
| Vitamina D | < 20 ng/mL | 2 |
| Albúmina | < 3.5 g/dL | 1 |
| Hemoglobina | < 11 g/dL | 1 |
| Creatinina | >= 1.3 mg/dL | 1 |
| NLR | > 4.5 | 1 |
| MLR | > 0.35 | 1 |

### 🔹 Factores Clínico-Funcionales

| Factor | Criterio | Puntos |
|--------|----------|--------|
| Comorbilidades | >= 2 | 1 |
| Índice de Barthel | <= 30 | 1 |
| IMC | <= 18.5 kg/m² | 1 |

### 🔹 Hábitos

| Factor | Criterio | Puntos |
|--------|----------|--------|
| Tabaquismo | Activo | 1 |
| Corticoides | Crónicos >= 3 meses | 1 |
| Alcohol | >= 3/día | 1 |

### 🔹 Factores Quirúrgicos

| Factor | Criterio | Puntos |
|--------|----------|--------|
| Tipo de fractura | Subcapital desplazada | 2 |
| Retraso quirúrgico | > 48 horas | 1 |

## 📈 Niveles de riesgo

Los niveles se calculan según el puntaje total:

| Nivel | Puntaje | Color | Acción |
|-------|---------|-------|--------|
| **BAJO** | 0-3 | 🟢 Verde | Seguimiento estándar |
| **MODERADO** | 4-7 | 🟡 Amarillo | Alerta informativa: monitorizar |
| **ALTO** | >= 8 | 🔴 Rojo | Alerta prioritaria: evaluación urgente |

## 📄 Salida del script

### Durante la ejecución

El script muestra:

```
═══════════════════════════════════════════════════════
  RECALCULO DE INDICADORES DE RIESGO
═══════════════════════════════════════════════════════

ℹ Obteniendo episodios a procesar...
ℹ Se procesarán 150 episodio(s)
ℹ Procesando 150 episodio(s) en lotes de 10...
Progreso: 150/150 (100.0%)
```

### Modo verbose

Con `--verbose` muestra detalles de cada episodio:

```
→ Procesando episodio 123...
  Control 456: Nivel MODERADO, Puntaje 5
  Control 457: Nivel ALTO, Puntaje 9
  ✓ Episodio 123 procesado. Nivel: ALTO, Alertas: 2
```

### Resumen final

Al terminar muestra estadísticas completas:

```
═══════════════════════════════════════════════════════
  RESUMEN DE PROCESAMIENTO
═══════════════════════════════════════════════════════

Episodios:
  Total procesados:       150
  Con controles:          120
  Sin controles:          30
  Controles procesados:   340

Niveles de riesgo:
  Riesgo BAJO:       85
  Riesgo MODERADO:   45
  Riesgo ALTO:       20

Alertas:
  Alertas generadas:      65

Rendimiento:
  Tiempo total:           45.32s
  Tiempo promedio/ep:     0.30s

✓ Proceso completado exitosamente
```

## 🔧 Consideraciones

### Antes de ejecutar

1. **Backup de la base de datos**: Siempre recomendado antes de operaciones masivas
2. **Modo dry-run**: Usa `--dry-run` primero para verificar
3. **Horario**: Ejecutar en horarios de bajo tráfico si es posible

### Durante la ejecución

1. **Memoria**: El script procesa 10 episodios en paralelo por defecto
2. **Tiempo**: Depende del número de episodios (aprox. 0.3s por episodio)
3. **Interrupción**: Se puede interrumpir con `Ctrl+C` - mostrará resumen parcial

### Después de ejecutar

1. **Verificar alertas**: Las alertas generadas estarán en la tabla `alerta`
2. **Revisar indicadores**: Los indicadores están en `episodio_indicador`
3. **Logs**: Revisa los errores si los hubo

### Errores comunes

- **Episodio no encontrado**: El episodio fue eliminado o no existe
- **Error de BD**: Problemas de conexión o permisos
- **Datos faltantes**: Algunos factores no pueden calcularse por falta de datos

Los datos faltantes NO generan error, simplemente ese factor no suma puntos.

## 💾 Base de datos afectada

### Tablas modificadas

1. **`episodio_indicador`**: 
   - Se eliminan indicadores previos del mismo episodio/control
   - Se crean nuevos indicadores con cálculos actualizados

2. **`alerta`**:
   - Se eliminan alertas asociadas a indicadores previos
   - Se crean nuevas alertas para riesgo MODERADO/ALTO

### Integridad de datos

- El script usa transacciones internas en el servicio
- Si hay error en un episodio, continúa con los siguientes
- Los errores se reportan al final

## 🔄 Recalcular vs Calcular inicial

Este script sirve tanto para:

- **Cálculo inicial**: Si los episodios nunca tuvieron indicadores calculados
- **Recálculo**: Si se modificaron datos base (resultados de lab, antropometría, etc.)
- **Migración**: Después de actualizar la lógica de cálculo

## 📞 Soporte

Si encuentras errores o comportamientos inesperados:

1. Ejecuta con `--verbose` para ver detalles
2. Revisa los logs de error
3. Verifica que los datos base existan (paciente, episodio, etc.)
4. Usa `--dry-run` para diagnosticar sin cambios

## 🎯 Casos de uso

### Migración de datos

```bash
# Primero verificar
node scripts/recalcular-todos-los-riesgos.js --dry-run --verbose --limit=10

# Luego ejecutar en lotes pequeños
node scripts/recalcular-todos-los-riesgos.js --limit=50
node scripts/recalcular-todos-los-riesgos.js --skip=50 --limit=50
# etc.
```

### Actualizar un paciente específico

Después de actualizar datos de laboratorio o antropometría:

```bash
node scripts/recalcular-todos-los-riesgos.js --episodio=123 --verbose
```

### Mantenimiento regular

Recalcular todos para actualizar con nuevos datos:

```bash
node scripts/recalcular-todos-los-riesgos.js --quiet
```

---

**Autor**: Sistema de Fracturas de Cadera  
**Versión**: 1.0  
**Última actualización**: Octubre 2025
