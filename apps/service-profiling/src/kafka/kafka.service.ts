import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { Kafka, Producer, Consumer, KafkaConfig } from 'kafkajs';

export interface KafkaModuleOptions {
  clientId: string;
  groupId: string;
  brokers?: string[];
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private isConsumerRunning = false;

  constructor(
    @Inject('KAFKA_OPTIONS') private readonly options: KafkaModuleOptions,
  ) {
    const kafkaConfig: KafkaConfig = {
      clientId: this.options.clientId,
      brokers:
        this.options.brokers ||
        (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    };

    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId: this.options.groupId,
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.logger.log(
        `✅ Productor y consumidor de Kafka conectados exitosamente`,
      );
    } catch (error) {
      this.logger.error(`❌ Error conectando Kafka:`, error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log(`🔌 Productor y consumidor de Kafka desconectados`);
    } catch (error) {
      this.logger.error(`❌ Error desconectando Kafka:`, error);
    }
  }

  async emit(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.customerId || Date.now().toString(),
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });

      this.logger.log(
        `📤 Evento emitido en topic '${topic}': ${JSON.stringify(message)}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error emitiendo evento en topic '${topic}':`,
        error,
      );
      throw error;
    }
  }

  async subscribeToMultiple(
    topics: Array<{ topic: string; handler: (message: any) => Promise<void> }>,
  ) {
    try {
      // Suscribirse a todos los topics primero
      for (const { topic } of topics) {
        await this.consumer.subscribe({ topic, fromBeginning: true });
      }

      // Crear un mapa de handlers por topic
      const handlers = new Map(
        topics.map(({ topic, handler }) => [topic, handler]),
      );

      // Solo ejecutar el consumidor si no está ya ejecutándose
      if (!this.isConsumerRunning) {
        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              if (!message.value) {
                this.logger.warn(
                  `⚠️ Mensaje recibido sin valor en topic '${topic}'`,
                );
                return;
              }

              const value = JSON.parse(message.value.toString());
              this.logger.log(
                `📥 Mensaje recibido en topic '${topic}': ${JSON.stringify(
                  value,
                )}`,
              );

              const handler = handlers.get(topic);
              if (handler) {
                await handler(value);
              } else {
                this.logger.warn(
                  `⚠️ No hay handler registrado para el topic '${topic}'`,
                );
              }
            } catch (error) {
              this.logger.error(
                `❌ Error procesando mensaje del topic '${topic}':`,
                error,
              );
            }
          },
        });
        this.isConsumerRunning = true;
      }

      this.logger.log(
        `🎧 Suscrito a ${topics.length} topics: ${topics.map((t) => t.topic).join(', ')}`,
      );
    } catch (error) {
      this.logger.error(`❌ Error suscribiéndose a múltiples topics:`, error);
      throw error;
    }
  }

  async subscribe(topic: string, handler: (message: any) => Promise<void>) {
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });

      // Solo ejecutar el consumidor si no está ya ejecutándose
      if (!this.isConsumerRunning) {
        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              if (!message.value) {
                this.logger.warn(
                  `⚠️ Mensaje recibido sin valor en topic '${topic}'`,
                );
                return;
              }

              const value = JSON.parse(message.value.toString());
              this.logger.log(
                `📥 Mensaje recibido en topic '${topic}': ${JSON.stringify(
                  value,
                )}`,
              );
              await handler(value);
            } catch (error) {
              this.logger.error(
                `❌ Error procesando mensaje del topic '${topic}':`,
                error,
              );
            }
          },
        });
        this.isConsumerRunning = true;
      }

      this.logger.log(`🎧 Suscrito al topic '${topic}'`);
    } catch (error) {
      this.logger.error(`❌ Error suscribiéndose al topic '${topic}':`, error);
      throw error;
    }
  }
} 