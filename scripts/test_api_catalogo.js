// scripts/test_api_catalogo.js
require('dotenv').config();

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

async function main() {
    const url = `${BASE_URL}/parametros/catalogo`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Keys:', Object.keys(data));
        console.log(
            'Examenes count:',
            Array.isArray(data.examenes) ? data.examenes.length : 'N/A'
        );
        // Print a brief summary
        if (Array.isArray(data.examenes)) {
            data.examenes.slice(0, 2).forEach((ex) => {
                console.log(
                    `- ${ex.tipo_examen} => muestras: ${ex.muestras.length}`
                );
                ex.muestras.slice(0, 2).forEach((m) => {
                    console.log(
                        `   * ${m.tipo_muestra}: ${m.parametros.length} parámetros`
                    );
                });
            });
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();
