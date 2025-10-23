// scripts/seed_tipos.js
// Inserta/actualiza (upsert) tipos de examen y tipos de muestra
require('dotenv').config();

const { connectDB } = require('../model/db');
const models = require('../model/initModels');

async function main() {
    try {
        await connectDB({ alter: false });

        // Tipos de examen
        const tiposExamen = [
            {
                id: 1,
                nombre: 'Laboratorio',
                descripcion: 'Exámenes de laboratorio clínico',
            },
            {
                id: 2,
                nombre: 'Imagen',
                descripcion: 'Exámenes de diagnóstico por imagen',
            },
        ];

        for (const data of tiposExamen) {
            await models.TipoExamen.upsert(data);
            console.log(
                `✔️  Upsert tipo_examen: ${data.nombre} (id=${data.id})`
            );
        }

        // Tipos de muestra
        const tiposMuestra = [
            {
                id: 1,
                nombre: 'Sangre',
                descripcion:
                    'Muestra de sangre (suero, plasma, sangre completa)',
            },
            {
                id: 2,
                nombre: 'Ecografía',
                descripcion: 'Imágenes obtenidas por ecografía',
            },
            {
                id: 3,
                nombre: 'Tejido',
                descripcion: 'Muestras de tejido óseo (espectroscopia FTIR)',
            },
        ];

        for (const data of tiposMuestra) {
            await models.TipoMuestra.upsert(data);
            console.log(
                `✔️  Upsert tipo_muestra: ${data.nombre} (id=${data.id})`
            );
        }

        console.log('✅ Seed de tipos completado');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error en seed de tipos:', err);
        process.exit(1);
    }
}

main();
