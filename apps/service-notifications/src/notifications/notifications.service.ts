import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '@shared/kafka';
import { SendEmailDto } from './dto/send-email.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import {
  CustomerOnboardedMessage,
  CustomerActivatedMessage,
  CustomerPromotedMessage,
  PromotionActivatedMessage,
  NotificationSentMessage,
} from './interfaces/message.interface';

// Helper function para formatear logs con objetos JSON
function formatLogMessage(message: string, data?: any): string {
  if (data) {
    return `${message}\n${JSON.stringify(data, null, 2)}`;
  }
  return message;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly kafkaService: KafkaService) {
    this.initializeKafkaSubscriptions();
  }

  private async initializeKafkaSubscriptions() {
    const topics = [
      {
        topic: 'customer.onboarded',
        handler: async (message: CustomerOnboardedMessage) => {
          this.logger.log(formatLogMessage(' Cliente onboarded recibido:', message));
          await this.handleCustomerOnboarded(message);
        },
      },
      {
        topic: 'customer.activated',
        handler: async (message: CustomerActivatedMessage) => {
          this.logger.log(formatLogMessage('✅ Cliente activado recibido:', message));
          await this.handleCustomerActivated(message);
        },
      },
      {
        topic: 'customer.promoted',
        handler: async (message: CustomerPromotedMessage) => {
          this.logger.log(formatLogMessage('⭐ Cliente promovido recibido:', message));
          await this.handleCustomerPromoted(message);
        },
      },
      {
        topic: 'customer.promotion.activated',
        handler: async (message: PromotionActivatedMessage) => {
          this.logger.log(formatLogMessage(' Promoción activada recibida:', message));
          await this.handlePromotionActivated(message);
        },
      },
    ];
    await this.kafkaService.subscribeToMultiple(topics);
  }

  private async handleCustomerOnboarded(message: CustomerOnboardedMessage) {
    this.logger.log(
      ` Enviando email de bienvenida a: ${message.customer?.email || 'cliente'}`,
    );

    // Simular envío de email de bienvenida
    const emailData = {
      to: message.customer?.email || 'cliente@example.com',
      subject: '¡Bienvenido a nuestra plataforma!',
      template: 'welcome',
      data: {
        customerName: message.customer?.name || 'Cliente',
        customerId: message.customerId,
      },
    };

    await this.sendEmail(emailData);

    // Emitir evento de notificación enviada
    await this.kafkaService.emit<NotificationSentMessage>('notification.sent', {
      customerId: message.customerId,
      type: 'email',
      template: 'welcome',
      recipient: emailData.to,
      timestamp: new Date().toISOString(),
    });
  }

  private async handleCustomerActivated(message: CustomerActivatedMessage) {
    this.logger.log(
      ` Enviando email de activación a: ${message.customer?.email || 'cliente'}`,
    );

    // Simular envío de email de activación
    const emailData = {
      to: message.customer?.email || 'cliente@example.com',
      subject: 'Tu cuenta ha sido activada',
      template: 'account-activated',
      data: {
        customerName: message.customer?.name || 'Cliente',
        customerId: message.customerId,
        activationDate: message.customer?.activatedAt,
      },
    };

    await this.sendEmail(emailData);

    // Emitir evento de notificación enviada
    await this.kafkaService.emit<NotificationSentMessage>('notification.sent', {
      customerId: message.customerId,
      type: 'email',
      template: 'account-activated',
      recipient: emailData.to,
      timestamp: new Date().toISOString(),
    });
  }

  private async handleCustomerPromoted(message: CustomerPromotedMessage) {
    this.logger.log(
      ` Enviando email de promoción a: ${message.customer?.email || 'cliente'}`,
    );

    // Simular envío de email de promoción
    const emailData = {
      to: message.customer?.email || 'cliente@example.com',
      subject: '¡Felicidades! Has sido promovido',
      template: 'promotion',
      data: {
        customerName: message.customer?.name || 'Cliente',
        customerId: message.customerId,
        newStatus: message.customer?.status || 'premium',
      },
    };

    await this.sendEmail(emailData);

    // Emitir evento de notificación enviada
    await this.kafkaService.emit<NotificationSentMessage>('notification.sent', {
      customerId: message.customerId,
      type: 'email',
      template: 'promotion',
      recipient: emailData.to,
      timestamp: new Date().toISOString(),
    });
  }

  private async handlePromotionActivated(message: PromotionActivatedMessage) {
    this.logger.log(
      ` Enviando email de bonificación a: ${message.customer?.email || 'cliente'}`,
    );

    // Simular envío de email de bonificación
    const emailData = {
      to: message.customer?.email || 'cliente@example.com',
      subject: '¡Bonificación del 60% activada!',
      template: 'first-payment-bonus',
      data: {
        customerName: message.customer?.name || 'Cliente',
        customerId: message.customerId,
        discount: message.promotion.discount,
        validUntil: message.promotion.validUntil,
        paymentAmount: message.promotion.paymentAmount,
      },
    };

    await this.sendEmail(emailData);

    // Emitir evento de notificación enviada
    await this.kafkaService.emit<NotificationSentMessage>('notification.sent', {
      customerId: message.customerId,
      type: 'email',
      template: 'first-payment-bonus',
      recipient: emailData.to,
      timestamp: new Date().toISOString(),
    });
  }

  async sendEmail(dto: SendEmailDto) {
    this.logger.log(formatLogMessage(' Enviando email:', dto));

    // Simular envío de email
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simular delay

    this.logger.log(`✅ Email enviado exitosamente a: ${dto.to}`);

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      recipient: dto.to,
      message: 'Email enviado exitosamente',
    };
  }

  async sendSms(dto: SendSmsDto) {
    this.logger.log(formatLogMessage(' Enviando SMS:', dto));

    // Simular envío de SMS
    await new Promise((resolve) => setTimeout(resolve, 50)); // Simular delay

    this.logger.log(`✅ SMS enviado exitosamente a: ${dto.to}`);

    return {
      success: true,
      messageId: `sms_${Date.now()}`,
      recipient: dto.to,
      message: 'SMS enviado exitosamente',
    };
  }
}
