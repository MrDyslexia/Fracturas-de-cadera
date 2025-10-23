#!/bin/bash
# scripts/help.sh
# Script de ayuda con comandos comunes para el proyecto

echo "
╔════════════════════════════════════════════════════════════════╗
║          Fracturas de Cadera - Scripts de Ayuda               ║
╚════════════════════════════════════════════════════════════════╝

📦 INSTALACIÓN INICIAL
────────────────────────────────────────────────────────────────
  npm install                    # Instalar dependencias
  npm run seed:all              # Crear tablas y poblar datos
  npm run dev                   # Iniciar servidor desarrollo

📊 BASE DE DATOS
────────────────────────────────────────────────────────────────
  npm run seed:tipos            # Solo tipos de examen/muestra
  npm run migrate:tipos         # Solo migración de FK
  npm run seed:parametros       # Solo parámetros (37 items)
  npm run seed:all              # Todo en orden (recomendado)
  npm run verify:parametros     # Verificar datos insertados

🧪 TESTING
────────────────────────────────────────────────────────────────
  npm test                      # Tests unitarios (Vitest)
  npm run test:watch            # Tests en modo watch
  npm run coverage              # Tests con cobertura
  npm run test:api:parametros   # Probar endpoints de parámetros

🚀 DESARROLLO
────────────────────────────────────────────────────────────────
  npm run dev                   # Servidor con nodemon (auto-reload)
  npm start                     # Servidor en producción

📝 VERIFICACIÓN RÁPIDA
────────────────────────────────────────────────────────────────
  # Verificar que el servidor está corriendo
  curl http://localhost:3001/api/v1/tipos-examen

  # Ver parámetros espectroscópicos
  curl http://localhost:3001/api/v1/parametros/AMIDA_I

  # Verificar estadísticas en DB
  node scripts/verify_parametros.js

📚 DOCUMENTACIÓN
────────────────────────────────────────────────────────────────
  README.md                           # Inicio rápido
  docs/PARAMETROS_LAB.md              # Sistema de parámetros
  docs/MIGRACION_TIPOS.md             # Detalles técnicos
  docs/RESUMEN_IMPLEMENTACION.md      # Resumen completo

🔗 ENDPOINTS PRINCIPALES
────────────────────────────────────────────────────────────────
  GET  /api/v1/tipos-examen           # 2 tipos
  GET  /api/v1/tipos-muestra          # 3 tipos
  GET  /api/v1/parametros             # 37 parámetros

  GET  /api/v1/parametros/:codigo     # Parámetro específico
  POST /api/v1/parametros             # Crear parámetro
  PUT  /api/v1/parametros/:codigo     # Actualizar parámetro

🎯 DATOS CARGADOS
────────────────────────────────────────────────────────────────
  Laboratorio + Sangre:    23 parámetros
  Imagen + Ecografía:       8 parámetros
  Laboratorio + Tejido:     6 parámetros (FTIR)
  ─────────────────────────────────────
  TOTAL:                   37 parámetros

💡 EJEMPLOS DE PARÁMETROS FTIR
────────────────────────────────────────────────────────────────
  AMIDA_I              → Banda 1710–1590 cm⁻¹
  AMIDA_II             → Banda ~1580–1500 cm⁻¹
  FOSFATOS_APATITA     → ν₃: 1110–940; ν₄: 603/565 cm⁻¹
  CARBONATOS_APATITA   → ν₃: 1455–1415; ν₂: ~872 cm⁻¹
  PO4_CO3              → Relación fosfato/carbonato
  CI_IRSF              → Índice de cristalinidad

🔧 TROUBLESHOOTING
────────────────────────────────────────────────────────────────
  Error: column does not exist
  → Ejecutar: npm run migrate:tipos

  Error: relation does not exist
  → Ejecutar: npm run seed:tipos

  Error: duplicate key value
  → Normal en seeds idempotentes (upsert)

  Puerto 3001 en uso
  → Cambiar PORT en .env

📞 AYUDA
────────────────────────────────────────────────────────────────
  Para ver este mensaje nuevamente:
    bash scripts/help.sh

  Para más información:
    cat docs/RESUMEN_IMPLEMENTACION.md

╚════════════════════════════════════════════════════════════════╝
"
