# POC Customers Nest Kafka

POC (Proof of Concept) de una arquitectura de microservicios usando NestJS y Kafka para la gestión de clientes en una fintech.

## 🏗️ Arquitectura

Este proyecto implementa una arquitectura de microservicios con comunicación asíncrona usando Apache Kafka:

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

## 🔄 Flujo de Eventos

### 1. **Onboarding de Cliente**

```bash
Service-Customer → customer.onboarded → Service-Profiling, Service-Notifications
```

### 2. **Activación de Cliente**

```bash
Service-Customer → customer.activated → Service-Profiling, Service-Notifications
```

### 3. **Promoción de Cliente**

```bash
Service-Customer → customer.promoted → Service-Notifications
Service-Profiling → customer.profiled → (otros servicios)
```

### 4. **Notificaciones**

```bash
Service-Notifications → notification.sent → Service-Customer
```

### Kafka UI

Acceder a la interfaz web de Kafka:

```bash
http://localhost:8080
```
