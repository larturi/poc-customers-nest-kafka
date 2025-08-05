import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SendEmailDto, SendSmsDto } from './dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

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
      {
        topic: 'customer.promoted',
        handler: async (message) => {
          await this.handleCustomerPromoted(message);
        },
      },
    ]);

    this.logger.log('🎧 Event listeners configurados exitosamente');
  }

  private async handleCustomerOnboarded(message: any) {
    this.logger.log(
      `📧 Procesando evento de onboarding para cliente: ${message.customerId}`,
    );

    // Enviar email de bienvenida
    await this.sendEmail({
      customerId: message.customerId,
      email: message.email,
      template: 'welcome',
      data: {
        customerName: message.name,
        onboardingDate: message.onboardingDate,
      },
    });
  }

  private async handleCustomerActivated(message: any) {
    this.logger.log(
      `📧 Procesando evento de activación para cliente: ${message.customerId}`,
    );

    // Enviar email de confirmación de activación
    await this.sendEmail({
      customerId: message.customerId,
      email: message.email,
      template: 'account-activated',
      data: {
        customerName: message.name,
        activationDate: message.activationDate,
      },
    });
  }

  private async handleCustomerPromoted(message: any) {
    this.logger.log(
      `📧 Procesando evento de promoción para cliente: ${message.customerId}`,
    );

    // Enviar email de felicitaciones por la promoción
    await this.sendEmail({
      customerId: message.customerId,
      email: message.email,
      template: 'promotion-congratulations',
      data: {
        customerName: message.name,
        newTier: message.newTier,
        promotionDate: message.promotionDate,
      },
    });
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    this.logger.log(`Enviando email a: ${sendEmailDto.email}`);

    // Simular envío de email
    const notification = {
      id: `notif_${Date.now()}`,
      customerId: sendEmailDto.customerId,
      type: 'email',
      template: sendEmailDto.template,
      recipient: sendEmailDto.email,
      status: 'sent',
      sentAt: new Date().toISOString(),
      data: sendEmailDto.data,
    };

    // Emitir evento de notificación enviada
    await this.kafkaService.emit('notification.sent', {
      notificationId: notification.id,
      customerId: notification.customerId,
      type: notification.type,
      template: notification.template,
      recipient: notification.recipient,
      status: notification.status,
      sentAt: notification.sentAt,
    });

    this.logger.log(`Email enviado exitosamente: ${notification.id}`);

    return {
      success: true,
      notificationId: notification.id,
      message: 'Email enviado exitosamente',
      data: notification,
    };
  }

  async sendSms(sendSmsDto: SendSmsDto) {
    this.logger.log(`Enviando SMS a: ${sendSmsDto.phone}`);

    // Simular envío de SMS
    const notification = {
      id: `notif_${Date.now()}`,
      customerId: sendSmsDto.customerId,
      type: 'sms',
      template: sendSmsDto.template,
      recipient: sendSmsDto.phone,
      status: 'sent',
      sentAt: new Date().toISOString(),
      data: sendSmsDto.data,
    };

    // Emitir evento de notificación enviada
    await this.kafkaService.emit('notification.sent', {
      notificationId: notification.id,
      customerId: notification.customerId,
      type: notification.type,
      template: notification.template,
      recipient: notification.recipient,
      status: notification.status,
      sentAt: notification.sentAt,
    });

    this.logger.log(`SMS enviado exitosamente: ${notification.id}`);

    return {
      success: true,
      notificationId: notification.id,
      message: 'SMS enviado exitosamente',
      data: notification,
    };
  }
}
