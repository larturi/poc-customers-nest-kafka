# Service Notifications

Servicio de notificaciones para la PoC de gestión del ciclo de vida del Cliente Ecosistémico de una Fintech.

## 🚀 Características

- **Notificaciones por Email**: Envío de emails transaccionales
- **Notificaciones por SMS**: Envío de SMS transaccionales
- **Integración con Kafka**: Escucha eventos de otros servicios y emite eventos de notificaciones
- **Health Check**: Endpoint para monitoreo del servicio

## 📋 Prerrequisitos

- Node.js 18+
- pnpm
- Docker y Docker Compose (para Kafka)

## 🛠️ Instalación

1. **Instalar dependencias:**

   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno:**

   ```bash
   cp env.example .env
   ```

3. **Iniciar Kafka (desde la raíz del proyecto):**

   ```bash
   docker-compose up -d
   ```

## 🏃‍♂️ Ejecución

### Desarrollo

```bash
pnpm start:dev

# Tests unitarios
pnpm run test:unit
```

### Producción

```bash
pnpm build
pnpm start:prod
```

## 📡 Endpoints

### Health Check

```http
GET /api/v1/notifications/health
```

### Enviar Email

```http
POST /api/v1/notifications/email
Content-Type: application/json

{
  "customerId": "cust_123",
  "email": "usuario@example.com",
  "template": "welcome",
  "data": {
    "customerName": "Juan Pérez",
    "onboardingDate": "2024-01-15T10:30:00Z"
  }
}
```

### Enviar SMS

```http
POST /api/v1/notifications/sms
Content-Type: application/json

{
  "customerId": "cust_123",
  "phone": "+1234567890",
  "template": "welcome-sms",
  "data": {
    "customerName": "Juan Pérez",
    "onboardingDate": "2024-01-15T10:30:00Z"
  }
}
```

## 🧪 Pruebas

### Ejecutar pruebas unitarias

```bash
pnpm test
```

### Probar endpoints manualmente

```bash
pnpm test:notifications
```

## 📊 Eventos Kafka

### Eventos que escucha

- `customer.onboarded`: Cliente registrado
- `customer.activated`: Cliente activado
- `customer.promoted`: Cliente promovido

### Eventos que emite

- `notification.sent`: Notificación enviada

## 🔧 Configuración

### Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servicio | `3003` |
| `KAFKA_BROKERS` | Brokers de Kafka | `localhost:9092` |
| `KAFKA_CLIENT_ID` | ID del cliente Kafka | `service-notifications` |
| `KAFKA_GROUP_ID` | ID del grupo Kafka | `notifications-group` |

## 📁 Estructura del Proyecto

```bash
src/
├── kafka/
│   ├── kafka.module.ts      # Módulo de Kafka
│   └── kafka.service.ts     # Servicio de Kafka
├── notifications/
│   ├── dto/
│   │   ├── index.ts         # Exportaciones de DTOs
│   │   ├── send-email.dto.ts # DTO para emails
│   │   └── send-sms.dto.ts  # DTO para SMS
│   ├── notifications.controller.ts # Controlador
│   └── notifications.service.ts    # Servicio
├── app.module.ts            # Módulo principal
└── main.ts                  # Punto de entrada
```

## 🐳 Docker

### Construir imagen

```bash
docker build -t service-notifications .
```

### Ejecutar contenedor

```bash
docker run -p 3003:3003 service-notifications
```

## 📝 Scripts Disponibles

- `pnpm start:dev`: Ejecutar en modo desarrollo
- `pnpm build`: Construir para producción
- `pnpm test`: Ejecutar pruebas unitarias
- `pnpm lint`: Ejecutar linter
- `pnpm format`: Formatear código
- `pnpm test:notifications`: Probar endpoints manualmente
