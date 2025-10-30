#!/usr/bin/env node
/**
 * Script de recálculo masivo de indicadores de riesgo
 * 
 * Este script procesa todos los resultados de laboratorio y calcula
 * los indicadores de riesgo basados en los parámetros medidos, 
 * almacenándolos en la tabla indicador_riesgo.
 * 
 * Uso:
 *   node scripts/recalcular_indicadores_riesgo.js
 *   node scripts/recalcular_indicadores_riesgo.js --dry-run
 *   node scripts/recalcular_indicadores_riesgo.js --resultado-id=123
 *   node scripts/recalcular_indicadores_riesgo.js --episodio-id=456
 *   node scripts/recalcular_indicadores_riesgo.js --limit=100
 */

const models = require('../model/initModels');

// ============================================================================
// CONFIGURACIÓN DE UMBRALES Y CRITERIOS
// ============================================================================

const CRITERIOS_RIESGO = {
  // Parámetros bioquímicos
  VITAMINA_D: {
    parametro: 'VITD',
    criterio: (valor) => valor < 20,
    descripcion: 'Vitamina D < 20 ng/mL - Deficiencia de vitamina D',
    puntaje: 2,
    mensaje: 'Deficiencia de vitamina D. Iniciar suplementación y control metabólico óseo.',
  },
  ALBUMINA: {
    parametro: 'ALBUMINA',
    criterio: (valor) => valor < 3.5,
    descripcion: 'Albúmina < 3.5 g/dL - Riesgo nutricional',
    puntaje: 1,
    mensaje: 'Riesgo nutricional. Solicitar evaluación nutricional y corrección.',
  },
  HEMOGLOBINA: {
    parametro: 'HB',
    criterio: (valor) => valor < 11,
    descripcion: 'Hemoglobina < 11 g/dL - Anemia',
    puntaje: 1,
    mensaje: 'Anemia que afecta tolerancia y complicaciones. Corregir y monitorizar.',
  },
  CREATININA: {
    parametro: 'CREATININA',
    criterio: (valor) => valor >= 1.3,
    descripcion: 'Creatinina >= 1.3 mg/dL - Compromiso renal',
    puntaje: 1,
    mensaje: 'Compromiso de función renal. Ajustar fármacos y vigilar complicaciones.',
  },
  CALCIO: {
    parametro: 'CALCIO',
    criterio: (valor) => valor < 8.5,
    descripcion: 'Calcio < 8.5 mg/dL - Hipocalcemia',
    puntaje: 1,
    mensaje: 'Hipocalcemia. Evaluar causa y corregir según necesidad.',
  },
  CALCIO_CORREGIDO: {
    parametro: 'CALCIO_CORREGIDO',
    criterio: (valor) => valor < 8.5,
    descripcion: 'Calcio corregido < 8.5 mg/dL - Hipocalcemia',
    puntaje: 1,
    mensaje: 'Hipocalcemia corregida por albúmina. Evaluar y corregir.',
  },
  INR: {
    parametro: 'INR',
    criterio: (valor) => valor > 1.5,
    descripcion: 'INR > 1.5 - Riesgo hemorrágico',
    puntaje: 1,
    mensaje: 'Coagulación alterada. Vigilar sangrado y ajustar anticoagulación.',
  },
  // Ratios inflamatorios
  NLR: {
    parametro: 'NLR',
    criterio: (valor) => valor > 4.5,
    descripcion: 'NLR > 4.5 - Inflamación elevada',
    puntaje: 1,
    mensaje: 'Inflamación elevada, peor pronóstico. Intensificar vigilancia clínica.',
  },
  MLR: {
    parametro: 'MLR',
    criterio: (valor) => valor > 0.35,
    descripcion: 'MLR > 0.35 - Inmunosenescencia',
    puntaje: 1,
    mensaje: 'Inmunosenescencia o inflamación. Monitorizar de cerca.',
  },
  PLR: {
    parametro: 'PLR',
    criterio: (valor) => valor > 200,
    descripcion: 'PLR > 200 - Actividad plaquetaria aumentada',
    puntaje: 1,
    mensaje: 'Actividad plaquetaria aumentada. Monitorizar estado inflamatorio.',
  },
};

// ============================================================================
// UTILIDADES
// ============================================================================

function toNumber(value) {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseCmdArgs() {
  const args = process.argv.slice(2);
  const config = {
    dryRun: false,
    resultadoId: null,
    episodioId: null,
    limit: null,
    verbose: false,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg.startsWith('--resultado-id=')) {
      config.resultadoId = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--episodio-id=')) {
      config.episodioId = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--limit=')) {
      config.limit = parseInt(arg.split('=')[1], 10);
    }
  }

  return config;
}

// ============================================================================
// LÓGICA DE EVALUACIÓN
// ============================================================================

function evaluarRiesgo(resultado) {
  const { parametro, valor } = resultado;
  const numericValue = toNumber(valor);
  
  if (numericValue === null) {
    return null;
  }

  // Buscar criterio correspondiente al parámetro
  for (const [key, criterio] of Object.entries(CRITERIOS_RIESGO)) {
    if (criterio.parametro === parametro) {
      const cumpleCriterio = criterio.criterio(numericValue);
      
      if (cumpleCriterio) {
        return {
          descripcion: criterio.descripcion,
          puntaje: criterio.puntaje,
          mensaje: criterio.mensaje,
          valor_medido: numericValue,
          parametro: parametro,
        };
      }
      
      // No cumple el criterio, pero es un parámetro monitoreado
      return null;
    }
  }

  // Parámetro no tiene criterio de riesgo definido
  return null;
}

// ============================================================================
// PROCESAMIENTO
// ============================================================================

async function procesarResultado(resultado, config) {
  const { resultado_id, parametro, valor, episodio_id } = resultado;
  
  if (config.verbose) {
    console.log(`  → Procesando resultado ${resultado_id}: ${parametro} = ${valor}`);
  }

  const riesgo = evaluarRiesgo(resultado);

  if (!riesgo) {
    if (config.verbose) {
      console.log(`    ✓ No cumple criterios de riesgo`);
    }
    return { procesado: true, creado: false };
  }

  if (config.dryRun) {
    console.log(`    [DRY-RUN] Se crearía indicador de riesgo:`);
    console.log(`      - Descripción: ${riesgo.descripcion}`);
    console.log(`      - Puntaje: ${riesgo.puntaje}`);
    console.log(`      - Valor medido: ${riesgo.valor_medido}`);
    return { procesado: true, creado: false, dryRun: true };
  }

  // Verificar si ya existe un indicador para este resultado
  const existente = await models.IndicadorRiesgo.findOne({
    where: { resultado_id },
  });

  if (existente) {
    // Actualizar si cambió
    const cambios = {};
    if (existente.descripcion !== riesgo.descripcion) {
      cambios.descripcion = riesgo.descripcion;
    }
    if (existente.puntaje !== riesgo.puntaje) {
      cambios.puntaje = riesgo.puntaje;
    }

    if (Object.keys(cambios).length > 0) {
      await existente.update(cambios);
      if (config.verbose) {
        console.log(`    ↻ Actualizado indicador ${existente.indicador_id}`);
      }
      return { procesado: true, creado: false, actualizado: true };
    } else {
      if (config.verbose) {
        console.log(`    ✓ Indicador ${existente.indicador_id} ya existe y está actualizado`);
      }
      return { procesado: true, creado: false };
    }
  }

  // Crear nuevo indicador
  const nuevo = await models.IndicadorRiesgo.create({
    descripcion: riesgo.descripcion,
    puntaje: riesgo.puntaje,
    resultado_id,
  });

  if (config.verbose) {
    console.log(`    ✓ Creado indicador ${nuevo.indicador_id}`);
  }

  return { procesado: true, creado: true, indicador_id: nuevo.indicador_id };
}

async function procesarResultados(config) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RECÁLCULO DE INDICADORES DE RIESGO');
  console.log('═══════════════════════════════════════════════════════\n');

  if (config.dryRun) {
    console.log('⚠️  MODO DRY-RUN: No se guardarán cambios\n');
  }

  // Construir filtro
  const where = {};
  if (config.resultadoId) {
    where.resultado_id = config.resultadoId;
    console.log(`📊 Procesando resultado específico: ${config.resultadoId}\n`);
  } else if (config.episodioId) {
    where.episodio_id = config.episodioId;
    console.log(`📊 Procesando resultados del episodio: ${config.episodioId}\n`);
  } else {
    console.log('📊 Procesando TODOS los resultados de laboratorio\n');
  }

  // Obtener resultados
  const queryOptions = {
    where,
    order: [['resultado_id', 'ASC']],
  };

  if (config.limit) {
    queryOptions.limit = config.limit;
    console.log(`⚙️  Límite establecido: ${config.limit} resultados\n`);
  }

  const resultados = await models.Resultado.findAll(queryOptions);

  if (resultados.length === 0) {
    console.log('⚠️  No se encontraron resultados para procesar.\n');
    return {
      total: 0,
      procesados: 0,
      creados: 0,
      actualizados: 0,
      errores: 0,
    };
  }

  console.log(`📋 Total de resultados a procesar: ${resultados.length}\n`);
  console.log('─────────────────────────────────────────────────────\n');

  const stats = {
    total: resultados.length,
    procesados: 0,
    creados: 0,
    actualizados: 0,
    errores: 0,
  };

  for (const resultado of resultados) {
    try {
      const result = await procesarResultado(resultado, config);
      stats.procesados++;
      if (result.creado) stats.creados++;
      if (result.actualizado) stats.actualizados++;
    } catch (error) {
      stats.errores++;
      console.error(`❌ Error procesando resultado ${resultado.resultado_id}:`, error.message);
      if (config.verbose) {
        console.error(error);
      }
    }
  }

  return stats;
}

// ============================================================================
// REPORTE
// ============================================================================

function mostrarReporte(stats, config) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESUMEN DE EJECUCIÓN');
  console.log('═══════════════════════════════════════════════════════\n');

  if (config.dryRun) {
    console.log('⚠️  MODO DRY-RUN: No se guardaron cambios\n');
  }

  console.log(`Total de resultados:          ${stats.total}`);
  console.log(`Procesados exitosamente:      ${stats.procesados}`);
  console.log(`Indicadores creados:          ${stats.creados}`);
  console.log(`Indicadores actualizados:     ${stats.actualizados}`);
  console.log(`Errores:                      ${stats.errores}`);

  const tasa = stats.total > 0 
    ? ((stats.procesados / stats.total) * 100).toFixed(1) 
    : 0;
  console.log(`\nTasa de éxito:                ${tasa}%`);

  if (stats.creados > 0 || stats.actualizados > 0) {
    console.log(`\n✅ Se ${config.dryRun ? 'crearían/actualizarían' : 'crearon/actualizaron'} ${stats.creados + stats.actualizados} indicadores de riesgo`);
  }

  if (stats.errores > 0) {
    console.log(`\n⚠️  Se encontraron ${stats.errores} errores durante el procesamiento`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const config = parseCmdArgs();

  try {
    const stats = await procesarResultados(config);
    mostrarReporte(stats, config);

    if (!config.dryRun && (stats.creados > 0 || stats.actualizados > 0)) {
      console.log('✅ Operación completada exitosamente\n');
    } else if (config.dryRun) {
      console.log('ℹ️  Para aplicar los cambios, ejecuta sin --dry-run\n');
    }

    process.exit(stats.errores > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  main();
}

module.exports = { procesarResultados, evaluarRiesgo, CRITERIOS_RIESGO };
