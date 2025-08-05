# Service Customer

Servicio de gestión de clientes para fintech que maneja el ciclo de vida completo de los clientes, desde el onboarding hasta la desactivación.

## 🚀 Características

- **Onboarding de Clientes**: Registro inicial de nuevos clientes
- **Activación de Clientes**: Activación de cuentas pendientes
- **Desactivación de Clientes**: Desactivación de cuentas activas
- **Gestión de Tiers**: Sistema de niveles (basic, premium, vip)
- **Eventos Kafka**: Comunicación asíncrona con otros servicios
- **Validación de Datos**: Validación automática de entrada

## 📋 Endpoints

### Health Check

- `GET /api/v1/customers/health` - Estado del servicio

### Gestión de Clientes

- `POST /api/v1/customers/onboard` - Onboarding de nuevo cliente
- `POST /api/v1/customers/activate` - Activación de cliente
- `POST /api/v1/customers/deactivate` - Desactivación de cliente
- `GET /api/v1/customers/:customerId` - Obtener cliente específico
- `GET /api/v1/customers` - Listar todos los clientes

## 🔄 Eventos Kafka

### Eventos Emitidos

- `customer.onboarded` - Cliente registrado exitosamente
- `customer.activated` - Cliente activado
- `customer.deactivated` - Cliente desactivado
- `customer.promoted` - Cliente promocionado de tier

### Eventos Consumidos

- `notification.sent` - Notificación enviada por el servicio de notificaciones

## 🛠️ Instalación y Ejecución

### Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm run start:dev
```

### Producción

```bash
# Construir la aplicación
pnpm run build

# Ejecutar en producción
pnpm run start:prod
```

### Docker

```bash
# Construir imagen
docker build -t service-customer .

# Ejecutar contenedor
docker run -p 3001:3001 service-customer
```

## 📊 Variables de Entorno

- `PORT` - Puerto del servicio (default: 3001)
- `KAFKA_BROKERS` - Brokers de Kafka (default: localhost:9092)

## 🔧 Configuración Kafka

El servicio se conecta automáticamente a Kafka con la siguiente configuración:

- **Client ID**: `service-customer`
- **Group ID**: `customers-group`
- **Brokers**: Configurados via variable de entorno `KAFKA_BROKERS`

## 📝 Ejemplos de Uso

### Onboarding de Cliente

```bash
curl -X POST http://localhost:3001/api/v1/customers/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan.perez@email.com",
    "phone": "+1234567890",
    "documentType": "DNI",
    "documentNumber": "12345678",
    "birthDate": "1990-01-01",
    "address": "Calle Principal 123",
    "city": "Madrid",
    "country": "España"
  }'
```

### Activación de Cliente

```bash
curl -X POST http://localhost:3001/api/v1/customers/activate \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_1234567890",
    "activationReason": "Documentación verificada"
  }'
```

### Desactivación de Cliente

```bash
curl -X POST http://localhost:3001/api/v1/customers/deactivate \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_1234567890",
    "deactivationReason": "Solicitud del cliente"
  }'
```

## 🔗 Integración con Otros Servicios

Este servicio está diseñado para trabajar en conjunto con:

- **Service Notifications**: Recibe eventos de notificaciones enviadas
- **Kafka**: Sistema de mensajería para comunicación asíncrona
- **Otros servicios**: Puede emitir eventos para otros servicios del ecosistema
