// scripts/test_api_parametros.js
// Script simple para probar los endpoints de parámetros, tipos de examen y tipos de muestra
require('dotenv').config();

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

async function testEndpoint(url, description) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(`✅ ${description}`);
        console.log(`   Status: ${response.status}`);
        console.log(
            `   Items: ${Array.isArray(data) ? data.length : 'objeto único'}`
        );
        if (Array.isArray(data) && data.length > 0) {
            console.log(
                `   Ejemplo:`,
                JSON.stringify(data[0], null, 2).substring(0, 150) + '...'
            );
        }
        return true;
    } catch (error) {
        console.error(`❌ ${description} - Error:`, error.message);
        return false;
    }
}

async function main() {
    console.log('\n🔍 Probando endpoints de la API...\n');

    await testEndpoint(`${BASE_URL}/tipos-examen`, 'GET /tipos-examen');
    await testEndpoint(`${BASE_URL}/tipos-muestra`, 'GET /tipos-muestra');
    await testEndpoint(
        `${BASE_URL}/parametros`,
        'GET /parametros (con tipos asociados)'
    );

    console.log('\n🔍 Probando parámetros específicos:\n');

    await testEndpoint(
        `${BASE_URL}/parametros/AMIDA_I`,
        'GET /parametros/AMIDA_I (espectroscopia)'
    );
    await testEndpoint(
        `${BASE_URL}/parametros/GLUCOSA`,
        'GET /parametros/GLUCOSA (laboratorio)'
    );
    await testEndpoint(
        `${BASE_URL}/parametros/ESPESOR_CORTICAL`,
        'GET /parametros/ESPESOR_CORTICAL (ecografía)'
    );

    console.log('\n✅ Pruebas completadas\n');
}

main();
