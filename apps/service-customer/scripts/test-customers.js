const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1/customers';

async function testCustomerService() {
  console.log('🧪 Iniciando pruebas del servicio de clientes...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Probando Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // 2. Onboarding de cliente
    console.log('2️⃣ Probando Onboarding de cliente...');
    const onboardData = {
      name: 'María García',
      email: 'maria.garcia@email.com',
      phone: '+34612345678',
      documentType: 'DNI',
      documentNumber: '87654321A',
      birthDate: '1985-05-15',
      address: 'Calle Mayor 456',
      city: 'Barcelona',
      country: 'España'
    };

    const onboardResponse = await axios.post(`${BASE_URL}/onboard`, onboardData);
    console.log('✅ Cliente onboarded:', onboardResponse.data);
    const customerId = onboardResponse.data.customerId;
    console.log('');

    // 3. Obtener cliente específico
    console.log('3️⃣ Probando obtener cliente específico...');
    const getCustomerResponse = await axios.get(`${BASE_URL}/${customerId}`);
    console.log('✅ Cliente obtenido:', getCustomerResponse.data);
    console.log('');

    // 4. Obtener todos los clientes
    console.log('4️⃣ Probando obtener todos los clientes...');
    const getAllCustomersResponse = await axios.get(`${BASE_URL}`);
    console.log('✅ Todos los clientes:', getAllCustomersResponse.data);
    console.log('');

    // 5. Activar cliente
    console.log('5️⃣ Probando activación de cliente...');
    const activateData = {
      customerId: customerId,
      activationReason: 'Documentación verificada correctamente'
    };

    const activateResponse = await axios.post(`${BASE_URL}/activate`, activateData);
    console.log('✅ Cliente activado:', activateResponse.data);
    console.log('');

    // 6. Verificar estado después de activación
    console.log('6️⃣ Verificando estado después de activación...');
    const updatedCustomerResponse = await axios.get(`${BASE_URL}/${customerId}`);
    console.log('✅ Cliente actualizado:', updatedCustomerResponse.data);
    console.log('');

    // 7. Desactivar cliente
    console.log('7️⃣ Probando desactivación de cliente...');
    const deactivateData = {
      customerId: customerId,
      deactivationReason: 'Solicitud del cliente'
    };

    const deactivateResponse = await axios.post(`${BASE_URL}/deactivate`, deactivateData);
    console.log('✅ Cliente desactivado:', deactivateResponse.data);
    console.log('');

    // 8. Verificar estado final
    console.log('8️⃣ Verificando estado final...');
    const finalCustomerResponse = await axios.get(`${BASE_URL}/${customerId}`);
    console.log('✅ Estado final del cliente:', finalCustomerResponse.data);
    console.log('');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');
    console.log('📊 Resumen:');
    console.log('   - Health Check: ✅');
    console.log('   - Onboarding: ✅');
    console.log('   - Obtener cliente: ✅');
    console.log('   - Listar clientes: ✅');
    console.log('   - Activación: ✅');
    console.log('   - Desactivación: ✅');
    console.log('   - Verificación de estados: ✅');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    if (error.response) {
      console.error('📋 Detalles del error:', error.response.data);
    }
    process.exit(1);
  }
}

// Ejecutar pruebas
testCustomerService(); 