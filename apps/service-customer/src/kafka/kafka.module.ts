import { Module, DynamicModule } from '@nestjs/common';
import { KafkaService } from './kafka.service';

export interface KafkaModuleOptions {
  clientId: string;
  groupId: string;
  brokers?: string[];
}

@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useValue: options,
        },
        KafkaService,
      ],
      exports: [KafkaService],
    };
  }
} 