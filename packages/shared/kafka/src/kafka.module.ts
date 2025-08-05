import { Module, DynamicModule } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaModuleOptions } from './interfaces/kafka-options.interface';

@Module({})
export class KafkaModule {
  /**
   * Configura el módulo Kafka con opciones específicas
   * @param options - Configuración del módulo Kafka
   * @returns DynamicModule configurado
   */
  static forRoot(options?: KafkaModuleOptions): DynamicModule {
    const defaultOptions: KafkaModuleOptions = {
      clientId: 'default-kafka-client',
      groupId: 'default-kafka-group',
    };

    const finalOptions = options || defaultOptions;

    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useValue: finalOptions,
        },
        KafkaService,
      ],
      exports: [KafkaService],
    };
  }
} 