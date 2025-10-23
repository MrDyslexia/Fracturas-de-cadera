// scripts/migrate_add_tipos_to_parametro_lab.js
// Migración para agregar columnas tipo_examen_id y tipo_muestra_id a parametro_lab
require('dotenv').config();

const { sequelize, connectDB } = require('../model/db');

async function main() {
    try {
        await connectDB({ alter: false });

        console.log(
            '🔄 Agregando columnas tipo_examen_id y tipo_muestra_id a parametro_lab...'
        );

        // Agregar columna tipo_examen_id
        await sequelize.query(`
      ALTER TABLE parametro_lab 
      ADD COLUMN IF NOT EXISTS tipo_examen_id INTEGER 
      REFERENCES tipo_examen(id) ON DELETE SET NULL;
    `);
        console.log('✔️  Columna tipo_examen_id agregada');

        // Agregar columna tipo_muestra_id
        await sequelize.query(`
      ALTER TABLE parametro_lab 
      ADD COLUMN IF NOT EXISTS tipo_muestra_id INTEGER 
      REFERENCES tipo_muestra(id) ON DELETE SET NULL;
    `);
        console.log('✔️  Columna tipo_muestra_id agregada');

        console.log('✅ Migración completada');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en migración:', err);
        process.exit(1);
    }
}

main();
