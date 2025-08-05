const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api/v1';

async function testProfilingService() {
  console.log('🧪 Iniciando pruebas del Service Profiling...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Probando Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/profiling/health`);
    console.log('✅ Health Check exitoso:', healthResponse.data);
    console.log('');

    // Test 2: Promover customer con datos válidos
    console.log('2️⃣ Probando promoción de customer...');
    const promoteData = {
      customerId: 'cust_12345',
      age: 28,
      income: 75000,
      creditScore: 720,
      isFirstPayment: true,
    };

    const promoteResponse = await axios.post(`${BASE_URL}/profiling/promote`, promoteData);
    console.log('✅ Promoción exitosa:', promoteResponse.data);
    console.log('');

    // Test 3: Promover customer premium
    console.log('3️⃣ Probando promoción de customer premium...');
    const premiumData = {
      customerId: 'cust_67890',
      age: 35,
      income: 150000,
      creditScore: 800,
      isFirstPayment: false,
    };

    const premiumResponse = await axios.post(`${BASE_URL}/profiling/promote`, premiumData);
    console.log('✅ Promoción premium exitosa:', premiumResponse.data);
    console.log('');

    // Test 4: Promover customer joven
    console.log('4️⃣ Probando promoción de customer joven...');
    const youngData = {
      customerId: 'cust_11111',
      age: 22,
      income: 45000,
      creditScore: 650,
      isFirstPayment: true,
    };

    const youngResponse = await axios.post(`${BASE_URL}/profiling/promote`, youngData);
    console.log('✅ Promoción joven exitosa:', youngResponse.data);
    console.log('');

    console.log('🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Ejecutar las pruebas
testProfilingService(); 