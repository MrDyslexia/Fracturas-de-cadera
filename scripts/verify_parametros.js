// scripts/verify_parametros.js
// Verifica los parámetros insertados con sus tipos asociados
require('dotenv').config();

const { connectDB } = require('../model/db');
const models = require('../model/initModels');

async function main() {
    try {
        await connectDB({ alter: false });

        console.log('\n📊 Verificación de parámetros por tipo:\n');

        // Parámetros de Laboratorio - Sangre
        const labSangre = await models.ParametroLab.findAll({
            where: { tipo_examen_id: 1, tipo_muestra_id: 1 },
            order: [['codigo', 'ASC']],
        });
        console.log(`✅ Laboratorio + Sangre: ${labSangre.length} parámetros`);
        labSangre
            .slice(0, 3)
            .forEach((p) => console.log(`   - ${p.codigo}: ${p.nombre}`));
        if (labSangre.length > 3)
            console.log(`   ... y ${labSangre.length - 3} más`);

        // Parámetros de Imagen - Ecografía
        const imgEco = await models.ParametroLab.findAll({
            where: { tipo_examen_id: 2, tipo_muestra_id: 2 },
            order: [['codigo', 'ASC']],
        });
        console.log(`\n✅ Imagen + Ecografía: ${imgEco.length} parámetros`);
        imgEco.forEach((p) => console.log(`   - ${p.codigo}: ${p.nombre}`));

        // Parámetros de Laboratorio - Tejido
        const labTejido = await models.ParametroLab.findAll({
            where: { tipo_examen_id: 1, tipo_muestra_id: 3 },
            order: [['codigo', 'ASC']],
        });
        console.log(
            `\n✅ Laboratorio + Tejido (espectroscopia FTIR): ${labTejido.length} parámetros`
        );
        labTejido.forEach((p) => console.log(`   - ${p.codigo}: ${p.nombre}`));

        // Total
        const total = await models.ParametroLab.count();
        console.log(`\n📈 Total de parámetros en la base de datos: ${total}\n`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error en verificación:', err);
        process.exit(1);
    }
}

main();
