# Service Profiling

Servicio de perfilado y promociones para la plataforma fintech. Este servicio se encarga de analizar el perfil de los clientes y determinar su elegibilidad para promociones y beneficios.

## 🚀 Características

- **Perfilado de Clientes**: Análisis automático del perfil de riesgo y elegibilidad
- **Sistema de Promociones**: Generación automática de promociones basadas en el perfil
- **Integración con Kafka**: Comunicación asíncrona con otros servicios
- **Eventos Automáticos**: Procesamiento de eventos de onboarding y activación
- **Validación de Datos**: Validación robusta de entrada con class-validator

## 📋 Endpoints

### Health Check

```bash
GET /api/v1/profiling/health
```

### Promover Cliente

```bash
POST /api/v1/profiling/promote
```

**Body:**

```json
{
  "customerId": "cust_12345",
  "age": 28,
  "income": 75000,
  "creditScore": 720,
  "isFirstPayment": true
}
```

## 🔧 Configuración

### Variables de Entorno

- `PORT`: Puerto del servicio (default: 3002)
- `KAFKA_BROKERS`: Brokers de Kafka (default: localhost:9092)

### Configuración de Kafka

El servicio se configura automáticamente con:

- **Client ID**: `service-profiling`
- **Group ID**: `profiling-group`

## 📊 Lógica de Perfilado

### Niveles de Riesgo

- **LOW**: Clientes con bajo riesgo
- **MEDIUM**: Clientes con riesgo medio
- **HIGH**: Clientes con alto riesgo

### Factores de Riesgo

- Edad menor a 25 años
- Ingresos menores a $50,000
- Score de crédito menor a 600

### Promociones Disponibles

- `FIRST_PAYMENT_DISCOUNT_20`: Descuento del 20% en primer pago
- `YOUNG_CUSTOMER_BONUS`: Bono para clientes jóvenes
- `PREMIUM_CUSTOMER_REWARDS`: Recompensas para clientes premium
- `WELCOME_BONUS`: Bono de bienvenida
- `ACTIVATION_BONUS`: Bono por activación
- `LOYALTY_PROGRAM`: Programa de lealtad

### Tiers de Cliente

- **BRONZE**: Tier básico
- **SILVER**: Tier con descuento en primer pago
- **GOLD**: Tier para clientes jóvenes
- **PREMIUM**: Tier para clientes premium

## 🎧 Eventos de Kafka

### Topics Escuchados

- `customer.onboarded`: Nuevos clientes registrados
- `customer.activated`: Clientes activados

### Topics Emitidos

- `customer.profiled`: Cliente perfilado
- `customer.promoted`: Cliente promovido

## 🏃‍♂️ Desarrollo

### Instalar Dependencias

```bash
npm install
```

### Ejecutar en Desarrollo

```bash
npm run start:dev
```

### Tests unitarios

```bash
pnpm run test:unit
```

### Construir para Producción

```bash
npm run build
npm run start:prod
```

### Linting y Formateo

```bash
npm run lint
npm run format
```

## 📦 Estructura del Proyecto

```
src/
├── app.module.ts              # Módulo principal
├── main.ts                    # Punto de entrada
├── kafka/
│   ├── kafka.module.ts        # Módulo de Kafka
│   └── kafka.service.ts       # Servicio de Kafka
└── profiling/
    ├── profiling.controller.ts # Controlador
    ├── profiling.service.ts    # Servicio
    └── dto/
        ├── index.ts           # Exportaciones de DTOs
        └── promote-customer.dto.ts # DTO de promoción
```

## 🔗 Integración con Otros Servicios

Este servicio se integra con:

- **Service Customer**: Recibe eventos de onboarding y activación
- **Service Notifications**: Envía eventos de promoción para notificaciones

## 📈 Monitoreo

El servicio incluye logs detallados para monitoreo:

- Conexión con Kafka
- Procesamiento de eventos
- Perfilado de clientes
- Emisión de eventos
