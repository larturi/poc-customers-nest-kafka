import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PromoteCustomerDto } from './dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class ProfilingService implements OnModuleInit {
  private readonly logger = new Logger(ProfilingService.name);

  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    // Suscribirse a eventos de otros servicios
    await this.setupEventListeners();
  }

  private async setupEventListeners() {
    // Suscribirse a todos los topics de una sola vez
    await this.kafkaService.subscribeToMultiple([
      {
        topic: 'customer.onboarded',
        handler: async (message) => {
          await this.handleCustomerOnboarded(message);
        },
      },
      {
        topic: 'customer.activated',
        handler: async (message) => {
          await this.handleCustomerActivated(message);
        },
      },
    ]);

    this.logger.log('🎧 Event listeners configurados exitosamente');
  }

  private async handleCustomerOnboarded(message: any) {
    this.logger.log(
      `📊 Procesando evento de onboarding para cliente: ${message.customerId}`,
    );

    // Simular perfilado automático después del onboarding
    const profile = {
      customerId: message.customerId,
      riskLevel: 'MEDIUM', // Valor por defecto para nuevos clientes
      eligibility: true,
      promotions: ['WELCOME_BONUS'],
      profiledAt: new Date().toISOString(),
    };

    // Emitir evento de customer perfilado
    await this.kafkaService.emit('customer.profiled', {
      customerId: profile.customerId,
      riskLevel: profile.riskLevel,
      eligibility: profile.eligibility,
      promotions: profile.promotions,
      timestamp: new Date().toISOString(),
    });
  }

  private async handleCustomerActivated(message: any) {
    this.logger.log(
      `📊 Procesando evento de activación para cliente: ${message.customerId}`,
    );

    // Simular perfilado mejorado después de la activación
    const profile = {
      customerId: message.customerId,
      riskLevel: 'LOW', // Clientes activados tienen menor riesgo
      eligibility: true,
      promotions: ['ACTIVATION_BONUS', 'LOYALTY_PROGRAM'],
      profiledAt: new Date().toISOString(),
    };

    // Emitir evento de customer perfilado
    await this.kafkaService.emit('customer.profiled', {
      customerId: profile.customerId,
      riskLevel: profile.riskLevel,
      eligibility: profile.eligibility,
      promotions: profile.promotions,
      timestamp: new Date().toISOString(),
    });
  }

  async promote(promoteDto: PromoteCustomerDto) {
    this.logger.log(`Iniciando perfilado para customer: ${promoteDto.customerId}`);
    
    // Simular perfilado del customer
    const profile = {
      customerId: promoteDto.customerId,
      riskLevel: this.calculateRiskLevel(promoteDto),
      eligibility: this.checkEligibility(promoteDto),
      promotions: this.generatePromotions(promoteDto),
      profiledAt: new Date().toISOString(),
    };

    // Emitir evento de customer perfilado
    await this.kafkaService.emit('customer.profiled', {
      customerId: profile.customerId,
      riskLevel: profile.riskLevel,
      eligibility: profile.eligibility,
      promotions: profile.promotions,
      timestamp: new Date().toISOString(),
    });

    // Si el customer es elegible y tiene promociones, emitir evento de promoción
    if (profile.eligibility && profile.promotions.length > 0) {
      const newTier = this.determineCustomerTier(profile);
      
      await this.kafkaService.emit('customer.promoted', {
        customerId: profile.customerId,
        newTier: newTier,
        promotions: profile.promotions,
        riskLevel: profile.riskLevel,
        promotionDate: profile.profiledAt,
        timestamp: new Date().toISOString(),
      });
    }

    this.logger.log(`Customer perfilado exitosamente: ${profile.customerId}`);
    
    return {
      success: true,
      customerId: profile.customerId,
      message: 'Customer perfilado exitosamente',
      data: profile,
    };
  }

  private calculateRiskLevel(data: PromoteCustomerDto): string {
    // Lógica simplificada para calcular nivel de riesgo
    const factors = [
      data.age < 25 ? 2 : 1,
      data.income < 50000 ? 2 : 1,
      data.creditScore < 600 ? 3 : 1,
    ];
    
    const totalRisk = factors.reduce((sum, factor) => sum + factor, 0);
    
    if (totalRisk >= 5) return 'HIGH';
    if (totalRisk >= 3) return 'MEDIUM';
    return 'LOW';
  }

  private checkEligibility(data: PromoteCustomerDto): boolean {
    // Lógica simplificada para verificar elegibilidad
    return data.age >= 18 && 
           data.income >= 20000 && 
           data.creditScore >= 500;
  }

  private generatePromotions(data: PromoteCustomerDto): string[] {
    const promotions = [];
    
    // Promoción para primer pago
    if (data.isFirstPayment) {
      promotions.push('FIRST_PAYMENT_DISCOUNT_20');
    }
    
    // Promoción por edad
    if (data.age < 30) {
      promotions.push('YOUNG_CUSTOMER_BONUS');
    }
    
    // Promoción por ingresos
    if (data.income >= 100000) {
      promotions.push('PREMIUM_CUSTOMER_REWARDS');
    }
    
    return promotions;
  }

  private determineCustomerTier(profile: any): string {
    // Determinar el tier del customer basado en el perfil
    if (profile.promotions.includes('PREMIUM_CUSTOMER_REWARDS')) {
      return 'PREMIUM';
    } else if (profile.promotions.includes('YOUNG_CUSTOMER_BONUS')) {
      return 'GOLD';
    } else if (profile.promotions.includes('FIRST_PAYMENT_DISCOUNT_20')) {
      return 'SILVER';
    } else {
      return 'BRONZE';
    }
  }
} 