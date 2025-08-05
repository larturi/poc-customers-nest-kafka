import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '@shared/kafka';
import { PromoteCustomerDto } from './dto/promote-customer.dto';

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
        handler: async (message) => {
          this.logger.log(`🚀 Cliente onboarded recibido: ${JSON.stringify(message)}`);
          await this.processCustomerOnboarded(message);
        }
      },
      {
        topic: 'customer.activated',
        handler: async (message) => {
          this.logger.log(`✅ Cliente activado recibido: ${JSON.stringify(message)}`);
          await this.processCustomerActivated(message);
        }
      }
    ]);
  }

  private async processCustomerOnboarded(message: any) {
    this.logger.log(`📊 Procesando perfil de cliente onboarded: ${message.customerId}`);
    
    // Simular análisis de perfil
    const profile = {
      customerId: message.customerId,
      riskScore: Math.floor(Math.random() * 100),
      segment: this.calculateSegment(message),
      recommendations: this.generateRecommendations(message),
      createdAt: new Date().toISOString()
    };

    // Emitir evento de cliente perfilado
    await this.kafkaService.emit('customer.profiled', {
      customerId: message.customerId,
      profile,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`📈 Perfil generado para cliente: ${message.customerId}`);
  }

  private async processCustomerActivated(message: any) {
    this.logger.log(`📊 Actualizando perfil de cliente activado: ${message.customerId}`);
    
    // Simular actualización de perfil
    const updatedProfile = {
      customerId: message.customerId,
      riskScore: Math.floor(Math.random() * 100),
      segment: 'active',
      lastUpdated: new Date().toISOString()
    };

    // Emitir evento de cliente perfilado actualizado
    await this.kafkaService.emit('customer.profiled', {
      customerId: message.customerId,
      profile: updatedProfile,
      timestamp: new Date().toISOString()
    });

    this.logger.log(`📈 Perfil actualizado para cliente: ${message.customerId}`);
  }

  private calculateSegment(message: any): string {
    // Lógica simple para calcular segmento basado en datos del cliente
    const segments = ['basic', 'premium', 'vip'];
    return segments[Math.floor(Math.random() * segments.length)];
  }

  private generateRecommendations(message: any): string[] {
    // Simular generación de recomendaciones
    const recommendations = [
      'Considerar productos de inversión',
      'Evaluar seguros de vida',
      'Revisar opciones de crédito',
      'Explorar servicios premium'
    ];
    
    return recommendations.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  async promoteCustomer(dto: PromoteCustomerDto) {
    this.logger.log(`⭐ Promoviendo cliente manualmente: ${JSON.stringify(dto)}`);

    // Simular proceso de promoción
    const promotion = {
      customerId: dto.customerId,
      newTier: dto.newTier,
      reason: dto.reason,
      promotedAt: new Date().toISOString()
    };

    // Emitir evento de cliente promovido
    await this.kafkaService.emit('customer.profiled', {
      customerId: dto.customerId,
      promotion,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      customerId: dto.customerId,
      message: `Cliente promovido a ${dto.newTier} exitosamente`
    };
  }
} 