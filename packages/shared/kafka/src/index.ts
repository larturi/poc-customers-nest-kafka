// Exportar el módulo principal
export { KafkaModule } from './kafka.module';

// Exportar el servicio
export { KafkaService } from './kafka.service';

// Exportar interfaces
export { KafkaModuleOptions } from './interfaces/kafka-options.interface';

// Re-exportar tipos de kafkajs para conveniencia
export type { KafkaConfig, Producer, Consumer } from 'kafkajs'; 