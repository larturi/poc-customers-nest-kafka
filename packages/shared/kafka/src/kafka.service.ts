import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject
} from '@nestjs/common'
import { Kafka, Producer, Consumer, KafkaConfig, logLevel } from 'kafkajs'
import { KafkaModuleOptions } from './interfaces/kafka-options.interface'

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name)
  private kafka: Kafka
  private producer: Producer
  private consumer: Consumer
  private isConsumerRunning = false

  constructor(
    @Inject('KAFKA_OPTIONS') private readonly options: KafkaModuleOptions
  ) {
    const config = this.options.config || {}

    const kafkaConfig: KafkaConfig = {
      clientId: this.options.clientId,
      brokers:
        this.options.brokers ||
        (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      // Configurar timeouts para evitar demoras
      connectionTimeout: config.connectionTimeout || 3000, // 3 segundos
      requestTimeout: config.requestTimeout || 30000, // 30 segundos
      // Configurar el logger personalizado para kafkajs
      logLevel: logLevel.ERROR, // Solo mostrar errores críticos
      logCreator: () => {
        return ({ namespace, level, label, log }) => {
          // Personalizar los logs de kafkajs para que sean más bonitos
          const { message, ...extra } = log

          // Solo mostrar logs importantes
          if (level === logLevel.ERROR) {
            this.logger.error(`🔴 [Kafka] ${message}`, extra)
          } else if (level === logLevel.WARN) {
            this.logger.warn(`🟡 [Kafka] ${message}`, extra)
          } else if (
            level === logLevel.INFO &&
            message.includes('Consumer has joined the group')
          ) {
            // Hacer bonito el log de conexión del consumidor
            this.logger.log(
              `🎧 [Kafka] Consumidor conectado al grupo '${extra.groupId}'`
            )
          }
          // Ignorar logs de DEBUG y otros logs menos importantes
        }
      }
    }

    this.kafka = new Kafka(kafkaConfig)
    this.producer = this.kafka.producer()
    this.consumer = this.kafka.consumer({
      groupId: this.options.groupId,
      // Configuraciones para mejorar el rendimiento
      sessionTimeout: config.sessionTimeout || 30000, // 30 segundos
      heartbeatInterval: config.heartbeatInterval || 3000, // 3 segundos
      rebalanceTimeout: config.rebalanceTimeout || 60000, // 60 segundos
      maxBytesPerPartition: config.maxBytesPerPartition || 1048576, // 1MB
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    })
  }

  async onModuleInit() {
    try {
      this.logger.log(`🔌 Conectando productor y consumidor de Kafka...`)

      // Conectar productor y consumidor en paralelo para mayor velocidad
      const [producerResult, consumerResult] = await Promise.allSettled([
        this.producer.connect(),
        this.consumer.connect()
      ])

      // Verificar resultados
      if (producerResult.status === 'rejected') {
        throw new Error(`Error conectando productor: ${producerResult.reason}`)
      }

      if (consumerResult.status === 'rejected') {
        throw new Error(`Error conectando consumidor: ${consumerResult.reason}`)
      }

      this.logger.log(
        `✅ Productor y consumidor de Kafka conectados exitosamente`
      )
    } catch (error) {
      this.logger.error(`❌ Error conectando Kafka:`, error)
      throw error // Re-lanzar para que NestJS maneje el error
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect()
      await this.consumer.disconnect()
      this.logger.log(`🔌 Productor y consumidor de Kafka desconectados`)
    } catch (error) {
      this.logger.error(`❌ Error desconectando Kafka:`, error)
    }
  }

  /**
   * Emite un evento a un topic específico
   * @param topic - Nombre del topic
   * @param message - Mensaje a emitir
   * @param key - Clave opcional para el mensaje (por defecto usa customerId o timestamp)
   */
  async emit(topic: string, message: any, key?: string) {
    try {
      // Validar que el topic esté en la lista de topics permitidos para emitir
      if (
        this.options.topics?.emit &&
        !this.options.topics.emit.includes(topic)
      ) {
        this.logger.warn(
          `⚠️ Topic '${topic}' no está en la lista de topics permitidos para emitir`
        )
      }

      await this.producer.send({
        topic,
        messages: [
          {
            key: key || message.customerId || Date.now().toString(),
            value: JSON.stringify(message),
            timestamp: Date.now().toString()
          }
        ]
      })

      this.logger.log(
        `📤 Evento emitido en topic '${topic}': ${JSON.stringify(message)}`
      )
    } catch (error) {
      this.logger.error(`❌ Error emitiendo evento en topic '${topic}':`, error)
      throw error
    }
  }

  /**
   * Suscribe a múltiples topics con sus respectivos handlers
   * @param topics - Array de objetos con topic y handler
   */
  async subscribeToMultiple(
    topics: Array<{ topic: string; handler: (message: any) => Promise<void> }>
  ) {
    try {
      this.logger.log(`🔄 Iniciando suscripción a ${topics.length} topics...`)

      // Validar que los topics estén en la lista de topics permitidos para consumir
      const invalidTopics = topics.filter(
        ({ topic }) =>
          this.options.topics?.consume &&
          !this.options.topics.consume.includes(topic)
      )

      if (invalidTopics.length > 0) {
        this.logger.warn(
          `⚠️ Los siguientes topics no están en la lista de topics permitidos para consumir: ${invalidTopics
            .map((t) => t.topic)
            .join(', ')}`
        )
      }

      // Suscribirse a todos los topics primero (en paralelo para mayor velocidad)
      const subscribePromises = topics.map(({ topic }) =>
        this.consumer.subscribe({ topic, fromBeginning: true })
      )
      await Promise.all(subscribePromises)

      // Crear un mapa de handlers por topic
      const handlers = new Map(
        topics.map(({ topic, handler }) => [topic, handler])
      )

      // Solo ejecutar el consumidor si no está ya ejecutándose
      if (!this.isConsumerRunning) {
        this.logger.log(`🚀 Iniciando consumidor de Kafka...`)

        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              if (!message.value) {
                this.logger.warn(
                  `⚠️ Mensaje recibido sin valor en topic '${topic}'`
                )
                return
              }

              const value = JSON.parse(message.value.toString())
              this.logger.log(
                `📥 Mensaje recibido en topic '${topic}': ${JSON.stringify(
                  value
                )}`
              )

              const handler = handlers.get(topic)
              if (handler) {
                await handler(value)
              } else {
                this.logger.warn(
                  `⚠️ No hay handler registrado para el topic '${topic}'`
                )
              }
            } catch (error) {
              this.logger.error(
                `❌ Error procesando mensaje del topic '${topic}':`,
                error
              )
            }
          }
        })
        this.isConsumerRunning = true
        this.logger.log(`✅ Consumidor de Kafka iniciado exitosamente`)
      }

      this.logger.log(
        `🎧 Suscrito a ${topics.length} topics: ${topics
          .map((t) => t.topic)
          .join(', ')}`
      )
    } catch (error) {
      this.logger.error(`❌ Error suscribiéndose a múltiples topics:`, error)
      throw error
    }
  }

  /**
   * Suscribe a un topic específico con su handler
   * @param topic - Nombre del topic
   * @param handler - Función que maneja los mensajes del topic
   */
  async subscribe(topic: string, handler: (message: any) => Promise<void>) {
    try {
      // Validar que el topic esté en la lista de topics permitidos para consumir
      if (
        this.options.topics?.consume &&
        !this.options.topics.consume.includes(topic)
      ) {
        this.logger.warn(
          `⚠️ Topic '${topic}' no está en la lista de topics permitidos para consumir`
        )
      }

      await this.consumer.subscribe({ topic, fromBeginning: true })

      // Solo ejecutar el consumidor si no está ya ejecutándose
      if (!this.isConsumerRunning) {
        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              if (!message.value) {
                this.logger.warn(
                  `⚠️ Mensaje recibido sin valor en topic '${topic}'`
                )
                return
              }

              const value = JSON.parse(message.value.toString())
              this.logger.log(
                `📥 Mensaje recibido en topic '${topic}': ${JSON.stringify(
                  value
                )}`
              )
              await handler(value)
            } catch (error) {
              this.logger.error(
                `❌ Error procesando mensaje del topic '${topic}':`,
                error
              )
            }
          }
        })
        this.isConsumerRunning = true
      }

      this.logger.log(`🎧 Suscrito al topic '${topic}'`)
    } catch (error) {
      this.logger.error(`❌ Error suscribiéndose al topic '${topic}':`, error)
      throw error
    }
  }

  /**
   * Obtiene la configuración actual del servicio
   */
  getConfig() {
    return {
      clientId: this.options.clientId,
      groupId: this.options.groupId,
      topics: this.options.topics,
      isConsumerRunning: this.isConsumerRunning
    }
  }
}
