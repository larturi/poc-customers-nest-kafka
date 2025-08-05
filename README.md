# POC Customers Nest Kafka

Un sistema de microservicios construido con NestJS y Kafka para gestionar el ciclo de vida completo de clientes, incluyendo onboarding, activación, profiling y notificaciones.

## 🏗️ Arquitectura

El sistema está compuesto por tres microservicios principales:

### 1. Service Customer (`:3001`)

- **Responsabilidad**: Gestión del ciclo de vida de clientes
  
- **Endpoints**:
  - `POST /customers/onboard` - Crear nuevo cliente
  - `POST /customers/activate` - Activar cliente
  - `POST /customers/deactivate` - Desactivar cliente
  
- **Eventos emitidos**:
  - `customer.registered` - Cliente registrado
  - `customer.onboarded` - Onboarding completado
  - `customer.activated` - Cliente activado
  - `customer.deactivated` - Cliente desactivado

### 2. Service Profiling (`:3002`)

- **Responsabilidad**: Análisis y perfilado de clientes

- **Endpoints**:
  - `POST /profiling/promote` - Realizar profiling y promoción

- **Eventos emitidos**:
  - `customer.profiled` - Cliente perfilado
  - `customer.promoted` - Cliente promovido

### 3. Service Notifications (`:3003`)

- **Responsabilidad**: Envío de notificaciones por email y SMS

- **Endpoints**:
  - `POST /notifications/email` - Enviar email
  - `POST /notifications/sms` - Enviar SMS

- **Eventos escuchados**:
  - `customer.onboarded` - Enviar email de bienvenida
  - `customer.activated` - Enviar email de confirmación
  - `customer.promoted` - Enviar email de felicitaciones

- **Eventos emitidos**:
  - `notification.sent` - Notificación enviada

## 🚀 Tecnologías

- **Framework**: NestJS
- **Message Broker**: Apache Kafka
- **Contenedores**: Docker & Docker Compose
- **UI Kafka**: Kafdrop (Kafka UI)

## 📋 Prerrequisitos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- pnpm

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd poc-customers-nest-kafka
```

### 2. Levantar la infraestructura con docker

```bash
docker-compose up -d
```

Esto levantará:

- **Zookeeper** (puerto 2181)
- **Kafka** (puerto 9092)
- **Kafka UI** (puerto 8080)
- **Service Customer** (puerto 3001)
- **Service Profiling** (puerto 3002)
- **Service Notifications** (puerto 3003)

### Levantar Kafka con Docker y Servicios manualmente

```bash
# Levanta Kafka
docker-compose -f docker-compose.kafka.yml up -d

# Levanta service-customer
cd apps/service-customer
pnpm i
pnpm run start:dev

# Levanta service-notifications
cd apps/service-notifications
pnpm i
pnpm run start:dev
```

## 3. Verificar que todo esté funcionando

```bash
# Verificar contenedores
docker-compose ps

# Verificar logs
docker-compose logs -f
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
