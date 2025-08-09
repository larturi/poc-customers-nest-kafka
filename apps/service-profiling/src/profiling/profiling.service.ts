import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '@shared/kafka';
import { PromoteCustomerDto } from './dto/promote-customer.dto';
import {
  CustomerActivatedMessage,
  CustomerOnboardedMessage,
  CustomerProfiledMessage,
  FirstPaymentMessage,
  Promotion,
  PromotionActivatedMessage,
} from './interfaces/message.interface';

@Injectable()
export class ProfilingService {
  private readonly logger = new Logger(ProfilingService.name);

  constructor(private readonly kafkaService: KafkaService) {
    this.initializeKafkaSubscriptions();
  }

  private async initializeKafkaSubscriptions() {
    // Suscribirse a eventos de clientes
    await this.kafkaService.subscribeToMultiple([
      {
        topic: 'customer.onboarded',
        handler: async (message: CustomerOnboardedMessage) => {
          this.logger.log(
            `🚀 Cliente onboarded recibido: ${JSON.stringify(message)}`,
          );
          await this.processCustomerOnboarded(message);
        },
      },
      {
        topic: 'customer.activated',
        handler: async (message: CustomerActivatedMessage) => {
          this.logger.log(
            `✅ Cliente activado recibido: ${JSON.stringify(message)}`,
          );
          await this.processCustomerActivated(message);
        },
      },
      {
        topic: 'customer.firstPayment',
        handler: async (message: FirstPaymentMessage) => {
          this.logger.log(
            `💳 Primer pago recibido: ${JSON.stringify(message)}`,
          );
          await this.processFirstPayment(message);
        },
      },
    ]);
  }

  private async processCustomerOnboarded(message: CustomerOnboardedMessage) {
    this.logger.log(
      `📊 Procesando perfil de cliente onboarded: ${message.customerId}`,
    );

    // Simular análisis de perfil
    const profile = {
      customerId: message.customerId,
      riskScore: Math.floor(Math.random() * 100),
      segment: this.calculateSegment(message),
      recommendations: this.generateRecommendations(message),
      createdAt: new Date().toISOString(),
    };

    // Emitir evento de cliente perfilado
    await this.kafkaService.emit<CustomerProfiledMessage>('customer.profiled', {
      customerId: message.customerId,
      profile,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`📈 Perfil generado para cliente: ${message.customerId}`);
  }

  private async processCustomerActivated(message: CustomerActivatedMessage) {
    this.logger.log(
      `📊 Actualizando perfil de cliente activado: ${message.customerId}`,
    );

    // Simular actualización de perfil
    const updatedProfile = {
      customerId: message.customerId,
      riskScore: Math.floor(Math.random() * 100),
      segment: 'active',
      recommendations: [],
      lastUpdated: new Date().toISOString(),
    };

    // Emitir evento de cliente perfilado actualizado
    await this.kafkaService.emit<CustomerProfiledMessage>('customer.profiled', {
      customerId: message.customerId,
      profile: updatedProfile,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `📈 Perfil actualizado para cliente: ${message.customerId}`,
    );
  }

  private async processFirstPayment(message: FirstPaymentMessage) {
    this.logger.log(
      `💳 Procesando primer pago para cliente: ${message.customerId}`,
    );

    // Activar promoción del 60% de bonificación
    const promotion: Promotion = {
      customerId: message.customerId,
      type: 'first_payment_bonus',
      discount: 60,
      description: 'Bonificación del 60% por primer pago',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      activatedAt: new Date().toISOString(),
      paymentAmount: message.payment.amount,
    };

    // Emitir evento de promoción activada
    await this.kafkaService.emit<PromotionActivatedMessage>(
      'customer.promotion.activated',
      {
        customerId: message.customerId,
        customer: message.customer,
        promotion,
        timestamp: new Date().toISOString(),
      },
    );

    this.logger.log(
      `🎉 Promoción del 60% activada para cliente: ${message.customerId}`,
    );
  }

  private calculateSegment(message: CustomerOnboardedMessage): string {
    // Lógica simple para calcular segmento basado en datos del cliente
    const segments = ['basic', 'premium', 'vip'];
    return segments[Math.floor(Math.random() * segments.length)];
  }

  private generateRecommendations(message: CustomerOnboardedMessage): string[] {
    // Simular generación de recomendaciones
    const recommendations = [
      'Considerar productos de inversión',
      'Evaluar seguros de vida',
      'Revisar opciones de crédito',
      'Explorar servicios premium',
    ];

    return recommendations.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  async promoteCustomer(dto: PromoteCustomerDto) {
    this.logger.log(
      `⭐ Promoviendo cliente manualmente: ${JSON.stringify(dto)}`,
    );

    // Simular proceso de promoción
    const promotion: Promotion = {
      customerId: dto.customerId,
      newTier: dto.newTier,
      reason: dto.reason,
      type: 'tier_promotion',
      discount: 0,
      description: `Promotion to tier ${dto.newTier}`,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      activatedAt: new Date().toISOString(),
    };

    // Emitir evento de cliente promovido
    await this.kafkaService.emit<CustomerProfiledMessage>('customer.profiled', {
      customerId: dto.customerId,
      promotion,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      customerId: dto.customerId,
      message: `Cliente promovido a ${dto.newTier} exitosamente`,
    };
  }
}
