# @shared/kafka

Módulo compartido de Kafka para servicios NestJS. Este paquete proporciona una implementación unificada y optimizada del cliente Kafka con configuración flexible y manejo robusto de errores.

## 📦 Instalación

```bash
# En el directorio del paquete
npm install
npm run build
```

## 🔧 Uso Básico

### 1. Importar el módulo en tu aplicación

```typescript
import { KafkaModule } from '@shared/kafka';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'mi-servicio',
      groupId: 'mi-grupo',
      topics: {
        emit: ['evento.creado', 'evento.actualizado'],
        consume: ['evento.procesado']
      }
    })
  ]
})
export class AppModule {}
```

### 2. Usar el servicio

```typescript
import { KafkaService } from '@shared/kafka';

@Injectable()
export class MiServicio {
  constructor(private readonly kafkaService: KafkaService) {}

  async emitirEvento() {
    await this.kafkaService.emit('evento.creado', {
      id: 123,
      mensaje: 'Evento creado exitosamente'
    });
  }

  async suscribirseAEventos() {
    await this.kafkaService.subscribe('evento.procesado', async (mensaje) => {
      console.log('Evento procesado recibido:', mensaje);
    });
  }
}
```

## ⚙️ Configuración Avanzada

### Opciones de Configuración

```typescript
KafkaModule.forRoot({
  clientId: 'mi-servicio',
  groupId: 'mi-grupo',
  brokers: ['localhost:9092', 'localhost:9093'], // Opcional
  topics: {
    emit: ['evento.creado', 'evento.actualizado'],
    consume: ['evento.procesado', 'evento.completado']
  },
  config: {
    connectionTimeout: 5000,        // 5 segundos
    requestTimeout: 60000,          // 60 segundos
    sessionTimeout: 45000,          // 45 segundos
    heartbeatInterval: 5000,        // 5 segundos
    rebalanceTimeout: 90000,        // 90 segundos
    maxBytesPerPartition: 2097152   // 2MB
  }
})
```

### Suscripción a Múltiples Topics

```typescript
await this.kafkaService.subscribeToMultiple([
  {
    topic: 'evento.creado',
    handler: async (mensaje) => {
      console.log('Evento creado:', mensaje);
    }
  },
  {
    topic: 'evento.actualizado',
    handler: async (mensaje) => {
      console.log('Evento actualizado:', mensaje);
    }
  }
]);
```
