import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '@shared/kafka';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

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
          await this.handleCustomerOnboarded(message);
        }
      },
      {
        topic: 'customer.activated',
        handler: async (message) => {
          this.logger.log(`✅ Cliente activado recibido: ${JSON.stringify(message)}`);
          await this.handleCustomerActivated(message);
        }
      },
      {
        topic: 'customer.promoted',
        handler: async (message) => {
          this.logger.log(`⭐ Cliente promovido recibido: ${JSON.stringify(message)}`);
          await this.handleCustomerPromoted(message);
        }
      }
    ]);
  }

  private async handleCustomerOnboarded(message: any) {
    this.logger.log(`📧 Enviando email de bienvenida a: ${message.customer?.email || 'cliente'}`);
    
    // Simular envío de email de bienvenida
    const emailData = {
      to: message.customer?.email || 'cliente@example.com',
      subject: '¡Bienvenido a nuestra plataforma!',
      template: 'welcome',
      data: {
        customerName: message.customer?.name || 'Cliente',
        customerId: message.customerId
      }
    };

    await this.sendEmail(emailData);
    
    // Emitir evento de notificación enviada
    await this.kafkaService.emit('notification.sent', {
      customerId: message.customerId,
      type: 'email',
      template: 'welcome',
      recipient: emailData.to,
      timestamp: new Date().toISOString()
    });
  }

  private async handleCustomerActivated(message: any) {
    this.logger.log(`📧 Enviando email de activación a: ${message.customer?.email || 'cliente'}`);
    
    // Simular envío de email de activación
    const emailData = {
      to: message.customer?.email || 'cliente@example.com',
      subject: 'Tu cuenta ha sido activada',
      template: 'account-activated',
      data: {
        customerName: message.customer?.name || 'Cliente',
        customerId: message.customerId,
        activationDate: message.customer?.activatedAt
      }
    };

    await this.sendEmail(emailData);
    
    // Emitir evento de notificación enviada
    await this.kafkaService.emit('notification.sent', {
      customerId: message.customerId,
      type: 'email',
      template: 'account-activated',
      recipient: emailData.to,
      timestamp: new Date().toISOString()
    });
  }

  private async handleCustomerPromoted(message: any) {
    this.logger.log(`📧 Enviando email de promoción a: ${message.customer?.email || 'cliente'}`);
    
    // Simular envío de email de promoción
    const emailData = {
      to: message.customer?.email || 'cliente@example.com',
      subject: '¡Felicidades! Has sido promovido',
      template: 'promotion',
      data: {
        customerName: message.customer?.name || 'Cliente',
        customerId: message.customerId,
        newStatus: message.customer?.status || 'premium'
      }
    };

    await this.sendEmail(emailData);
    
    // Emitir evento de notificación enviada
    await this.kafkaService.emit('notification.sent', {
      customerId: message.customerId,
      type: 'email',
      template: 'promotion',
      recipient: emailData.to,
      timestamp: new Date().toISOString()
    });
  }

  async sendEmail(dto: SendEmailDto) {
    this.logger.log(`📧 Enviando email: ${JSON.stringify(dto)}`);

    // Simular envío de email
    await new Promise(resolve => setTimeout(resolve, 100)); // Simular delay

    this.logger.log(`✅ Email enviado exitosamente a: ${dto.to}`);

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      recipient: dto.to,
      message: 'Email enviado exitosamente'
    };
  }

  async sendSms(dto: SendSmsDto) {
    this.logger.log(`📱 Enviando SMS: ${JSON.stringify(dto)}`);

    // Simular envío de SMS
    await new Promise(resolve => setTimeout(resolve, 50)); // Simular delay

    this.logger.log(`✅ SMS enviado exitosamente a: ${dto.to}`);

    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      recipient: dto.to,
      message: 'SMS enviado exitosamente'
    };
  }
}
