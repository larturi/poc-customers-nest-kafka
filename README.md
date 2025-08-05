# POC Customers Nest Kafka

POC (Proof of Concept) de una arquitectura de microservicios usando NestJS y Kafka para la gestión de clientes en una fintech.

## 🏗️ Arquitectura

Este proyecto implementa una arquitectura de microservicios con comunicación asíncrona usando Apache Kafka:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Service-Customer│    │Service-Profiling│    │Service-Notifications│
│                 │    │                 │    │                 │
│ • Onboard       │    │ • Profile       │    │ • Send Email    │
│ • Activate      │    │ • Promote       │    │ • Send SMS      │
│ • Deactivate    │    │ • Analyze       │    │ • Templates     │
│ • Promote       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Apache Kafka  │
                    │                 │
                    │ • Event Bus     │
                    │ • Message Queue │
                    │ • Streams       │
                    └─────────────────┘
```

## 📦 Servicios

### 1. **Service-Customer** (`apps/service-customer/`)
- **Responsabilidad**: Gestión del ciclo de vida de clientes
- **Eventos emitidos**: `customer.onboarded`, `customer.activated`, `customer.deactivated`, `customer.promoted`
- **Eventos consumidos**: `notification.sent`
- **Puerto**: 3001

### 2. **Service-Profiling** (`apps/service-profiling/`)
- **Responsabilidad**: Análisis y perfilado de clientes
- **Eventos emitidos**: `customer.profiled`
- **Eventos consumidos**: `customer.onboarded`, `customer.activated`
- **Puerto**: 3002

### 3. **Service-Notifications** (`apps/service-notifications/`)
- **Responsabilidad**: Envío de notificaciones (email, SMS)
- **Eventos emitidos**: `notification.sent`
- **Eventos consumidos**: `customer.onboarded`, `customer.activated`, `customer.promoted`
- **Puerto**: 3003

## 🔧 Módulo Compartido de Kafka

### 📦 **@shared/kafka** (`packages/shared/kafka/`)

Módulo unificado de Kafka que reemplaza las implementaciones duplicadas en cada servicio:

#### ✅ **Ventajas de la unificación:**

- **DRY (Don't Repeat Yourself)**: Eliminación de código duplicado
- **Mantenimiento**: Un solo lugar para actualizaciones
- **Consistencia**: Misma configuración y comportamiento en todos los servicios
- **Calidad**: Implementación robusta con logging personalizado y manejo de errores

#### 🚀 **Características:**

- ✅ **Configuración flexible**: Soporte para configuración específica por servicio
- ✅ **Logging personalizado**: Logs con emojis y formato legible
- ✅ **Manejo robusto de errores**: Reintentos automáticos y recuperación
- ✅ **Validación de topics**: Verificación de topics permitidos
- ✅ **Rendimiento optimizado**: Configuraciones para alta concurrencia
- ✅ **TypeScript**: Soporte completo de tipos

#### 📋 **Configuración por servicio:**

```typescript
// Service-Customer
KafkaModule.forRoot({
  clientId: 'service-customer',
  groupId: 'customers-group',
  topics: {
    emit: ['customer.onboarded', 'customer.activated', 'customer.deactivated', 'customer.promoted'],
    consume: ['notification.sent']
  }
})

// Service-Profiling
KafkaModule.forRoot({
  clientId: 'service-profiling',
  groupId: 'profiling-group',
  topics: {
    emit: ['customer.profiled'],
    consume: ['customer.onboarded', 'customer.activated']
  }
})

// Service-Notifications
KafkaModule.forRoot({
  clientId: 'service-notifications',
  groupId: 'notifications-group',
  topics: {
    consume: ['customer.onboarded', 'customer.activated', 'customer.promoted']
  }
})
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- pnpm (recomendado) o npm

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd poc-customers-nest-kafka
```

### 2. Instalar dependencias

```bash
# Instalar dependencias del paquete compartido
cd packages/shared/kafka
npm install
npm run build

# Volver al directorio raíz
cd ../../

# Instalar dependencias de todos los servicios
cd apps/service-customer && npm install && cd ../..
cd apps/service-profiling && npm install && cd ../..
cd apps/service-notifications && npm install && cd ../..
```

### 3. Iniciar Kafka con Docker

```bash
docker-compose -f docker-compose.kafka.yml up -d
```

### 4. Iniciar los servicios

```bash
# Terminal 1 - Service Customer
cd apps/service-customer
npm run start:dev

# Terminal 2 - Service Profiling
cd apps/service-profiling
npm run start:dev

# Terminal 3 - Service Notifications
cd apps/service-notifications
npm run start:dev
```

## 📡 API Endpoints

### Service-Customer (Puerto 3001)

```bash
# Onboard customer
POST http://localhost:3001/customers/onboard
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+1234567890"
}

# Activate customer
POST http://localhost:3001/customers/activate
{
  "customerId": "1234567890"
}

# Deactivate customer
POST http://localhost:3001/customers/deactivate
{
  "customerId": "1234567890"
}

# Promote customer
POST http://localhost:3001/customers/promote/1234567890
```

### Service-Profiling (Puerto 3002)

```bash
# Promote customer manually
POST http://localhost:3002/profiling/promote
{
  "customerId": "1234567890",
  "newTier": "premium",
  "reason": "High value customer"
}
```

### Service-Notifications (Puerto 3003)

```bash
# Send email
POST http://localhost:3003/notifications/email
{
  "to": "cliente@example.com",
  "subject": "Bienvenido",
  "template": "welcome",
  "data": {
    "customerName": "Juan Pérez"
  }
}

# Send SMS
POST http://localhost:3003/notifications/sms
{
  "to": "+1234567890",
  "message": "Tu cuenta ha sido activada"
}
```

## 🔄 Flujo de Eventos

### 1. **Onboarding de Cliente**
```
Service-Customer → customer.onboarded → Service-Profiling, Service-Notifications
```

### 2. **Activación de Cliente**
```
Service-Customer → customer.activated → Service-Profiling, Service-Notifications
```

### 3. **Promoción de Cliente**
```
Service-Customer → customer.promoted → Service-Notifications
Service-Profiling → customer.profiled → (otros servicios)
```

### 4. **Notificaciones**
```
Service-Notifications → notification.sent → Service-Customer
```

## 🧪 Testing

### Scripts de prueba disponibles

```bash
# Service-Customer
cd apps/service-customer
node scripts/test-customers.js

# Service-Profiling
cd apps/service-profiling
node scripts/test-profiling.js
```

### Testing manual con curl

```bash
# Onboard customer
curl -X POST http://localhost:3001/customers/onboard \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","email":"juan@example.com","phone":"+1234567890"}'

# Activate customer
curl -X POST http://localhost:3001/customers/activate \
  -H "Content-Type: application/json" \
  -d '{"customerId":"1234567890"}'
```

## 📊 Monitoreo

### Logs de Kafka

Los servicios incluyen logging detallado con emojis para facilitar el debugging:

- 🔌 **Conexión**: Logs de conexión/desconexión
- 📤 **Emisión**: Logs de eventos emitidos
- 📥 **Recepción**: Logs de mensajes recibidos
- ❌ **Errores**: Logs detallados de errores
- ⚠️ **Advertencias**: Logs de validación

### Kafka UI

Acceder a la interfaz web de Kafka:
```
http://localhost:8080
```

## 🏗️ Desarrollo

### Estructura del proyecto

```
poc-customers-nest-kafka/
├── apps/
│   ├── service-customer/          # Servicio de gestión de clientes
│   ├── service-profiling/         # Servicio de perfilado
│   └── service-notifications/     # Servicio de notificaciones
├── packages/
│   └── shared/
│       └── kafka/                 # Módulo compartido de Kafka
├── docker-compose.yml             # Configuración de servicios
├── docker-compose.kafka.yml       # Configuración de Kafka
└── README.md
```

### Comandos útiles

```bash
# Construir el paquete compartido
cd packages/shared/kafka
npm run build

# Limpiar builds
npm run clean

# Ver logs de Kafka
docker-compose -f docker-compose.kafka.yml logs -f kafka

# Reiniciar servicios
docker-compose -f docker-compose.kafka.yml restart
```

## 🔧 Configuración Avanzada

### Variables de entorno

```bash
# Kafka brokers (por defecto: localhost:9092)
KAFKA_BROKERS=localhost:9092,localhost:9093

# Configuración específica por servicio
KAFKA_CLIENT_ID=service-customer
KAFKA_GROUP_ID=customers-group
```

### Configuración de Kafka

```typescript
KafkaModule.forRoot({
  clientId: 'mi-servicio',
  groupId: 'mi-grupo',
  brokers: ['localhost:9092', 'localhost:9093'],
  topics: {
    emit: ['evento.creado'],
    consume: ['evento.procesado']
  },
  config: {
    connectionTimeout: 5000,
    requestTimeout: 60000,
    sessionTimeout: 45000,
    heartbeatInterval: 5000,
    rebalanceTimeout: 90000,
    maxBytesPerPartition: 2097152
  }
})
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Troubleshooting

### Problemas comunes

1. **Kafka no se conecta**
   ```bash
   # Verificar que Kafka esté corriendo
   docker-compose -f docker-compose.kafka.yml ps
   
   # Reiniciar Kafka
   docker-compose -f docker-compose.kafka.yml restart
   ```

2. **Servicios no se inician**
   ```bash
   # Verificar dependencias
   npm install
   
   # Verificar puertos
   lsof -i :3001
   lsof -i :3002
   lsof -i :3003
   ```

3. **Errores de TypeScript**
   ```bash
   # Reconstruir el paquete compartido
   cd packages/shared/kafka
   npm run build
   ```

### Logs útiles

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs específicos de Kafka
docker-compose -f docker-compose.kafka.yml logs -f kafka

# Logs de un servicio específico
docker-compose logs -f service-customer
```



### Pruebas manuales

#### 1. Crear un cliente

```bash
curl -X POST http://localhost:3001/customers/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

#### 2. Activar un cliente

```bash
curl -X POST http://localhost:3001/customers/activate \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_1234567890"
  }'
```

#### 3. Realizar profiling

```bash
curl -X POST http://localhost:3002/profiling/promote \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_1234567890",
    "age": 28,
    "income": 75000,
    "creditScore": 720,
    "isFirstPayment": true
  }'
```

#### 4. Enviar notificación

```bash
curl -X POST http://localhost:3003/notifications/email \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_1234567890",
    "email": "john.doe@example.com",
    "template": "welcome",
    "data": {
      "customerName": "John Doe"
    }
  }'
```

## 📊 Monitoreo

### Kafka UI

Accede a la interfaz web de Kafka en: <http://localhost:8080>

Aquí podrás:

- Ver todos los topics creados
- Explorar mensajes en tiempo real
- Monitorear grupos de consumidores
- Ver métricas de Kafka

### Logs de los servicios

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f service-customer
docker-compose logs -f service-profiling
docker-compose logs -f service-notifications
```

## 🔄 Flujo de Eventos

### Flujo de Onboarding

1. Cliente llama a `POST /customers/onboard`
2. Service Customer crea el cliente y emite `customer.registered`
3. Service Customer emite `customer.onboarded`
4. Service Notifications recibe `customer.onboarded` y envía email de bienvenida
5. Service Notifications emite `notification.sent`

### Flujo de Activación

1. Cliente llama a `POST /customers/activate`
2. Service Customer activa el cliente y emite `customer.activated`
3. Service Notifications recibe `customer.activated` y envía email de confirmación
4. Service Notifications emite `notification.sent`

### Flujo de Profiling

1. Cliente llama a `POST /profiling/promote`
2. Service Profiling analiza el cliente y emite `customer.profiled`
3. Si el cliente es elegible, Service Profiling emite `customer.promoted`
4. Service Notifications recibe `customer.promoted` y envía email de felicitaciones
5. Service Notifications emite `notification.sent`

## 🏗️ Desarrollo

### Comandos de desarrollo

```bash
# Ejecutar un servicio específico en modo desarrollo
npm run start:dev service-customer
npm run start:dev service-profiling
npm run start:dev service-notifications

```