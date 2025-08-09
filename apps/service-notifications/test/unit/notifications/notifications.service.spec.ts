import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NotificationsService } from '../../../src/notifications/notifications.service';
import { KafkaService } from '@shared/kafka';
import { SendEmailDto } from '../../../src/notifications/dto/send-email.dto';
import { SendSmsDto } from '../../../src/notifications/dto/send-sms.dto';
import {
  CustomerOnboardedMessage,
  CustomerActivatedMessage,
  CustomerPromotedMessage,
} from '../../../src/notifications/interfaces/message.interface';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let kafkaService: jest.Mocked<KafkaService>;

  const mockKafkaService = {
    subscribe: jest.fn() as <T>(
      topic: string,
      handler: (message: T) => Promise<void>,
    ) => Promise<void>,
    subscribeToMultiple: jest.fn() as <T>(
      topics: Array<{ topic: string; handler: (message: T) => Promise<void> }>,
    ) => Promise<void>,
    emit: jest.fn() as <T>(
      topic: string,
      message: T,
      key?: string,
    ) => Promise<T>,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    kafkaService = module.get(KafkaService);

    // Mock del logger para evitar ruido en los tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize kafka subscriptions', () => {
      expect(kafkaService.subscribe).toHaveBeenCalledWith(
        'customer.onboarded',
        expect.any(Function),
      );
      expect(kafkaService.subscribe).toHaveBeenCalledWith(
        'customer.activated',
        expect.any(Function),
      );
      expect(kafkaService.subscribe).toHaveBeenCalledWith(
        'customer.promoted',
        expect.any(Function),
      );
      expect(kafkaService.subscribe).toHaveBeenCalledWith(
        'customer.promotion.activated',
        expect.any(Function),
      );
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const sendEmailDto: SendEmailDto = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'welcome',
        data: { name: 'John Doe' },
      };

      const result = await service.sendEmail(sendEmailDto);

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^email_\d+$/);
      expect(result.recipient).toBe('test@example.com');
      expect(result.message).toBe('Email enviado exitosamente');
    });

    it('should send email with customerId', async () => {
      const sendEmailDto: SendEmailDto = {
        customerId: '1234567890',
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'welcome',
        data: { name: 'John Doe' },
      };

      const result = await service.sendEmail(sendEmailDto);

      expect(result.success).toBe(true);
      expect(result.recipient).toBe('test@example.com');
    });
  });

  describe('sendSms', () => {
    it('should send SMS successfully', async () => {
      const sendSmsDto: SendSmsDto = {
        to: '+1234567890',
        message: 'Test message',
        template: 'welcome',
        data: { name: 'John Doe' },
      };

      const result = await service.sendSms(sendSmsDto);

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^sms_\d+$/);
      expect(result.recipient).toBe('+1234567890');
      expect(result.message).toBe('SMS enviado exitosamente');
    });

    it('should send SMS with customerId', async () => {
      const sendSmsDto: SendSmsDto = {
        customerId: '1234567890',
        to: '+1234567890',
        message: 'Test message',
        template: 'welcome',
        data: { name: 'John Doe' },
      };

      const result = await service.sendSms(sendSmsDto);

      expect(result.success).toBe(true);
      expect(result.recipient).toBe('+1234567890');
    });
  });

  describe('handleCustomerOnboarded', () => {
    it('should handle customer onboarded message and send welcome email', async () => {
      const message: CustomerOnboardedMessage = {
        customerId: '1234567890',
        customer: {
          id: '1234567890',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'onboarded',
        },
        timestamp: new Date().toISOString(),
      };

      // Mock del método sendEmail
      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'email_123',
        recipient: 'john@example.com',
        message: 'Email enviado exitosamente',
      });

      await (service as any).handleCustomerOnboarded(message);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'john@example.com',
        subject: '¡Bienvenido a nuestra plataforma!',
        template: 'welcome',
        data: {
          customerName: 'John Doe',
          customerId: '1234567890',
        },
      });

      expect(kafkaService.emit).toHaveBeenCalledWith('notification.sent', {
        customerId: '1234567890',
        type: 'email',
        template: 'welcome',
        recipient: 'john@example.com',
        timestamp: expect.any(String),
      });
    });

    it('should handle customer onboarded message without customer email', async () => {
      const message: CustomerOnboardedMessage = {
        customerId: '1234567890',
        customer: {
          id: '1234567890',
          name: 'John Doe',
          email: undefined,
          status: 'onboarded',
        },
        timestamp: new Date().toISOString(),
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'email_123',
        recipient: 'cliente@example.com',
        message: 'Email enviado exitosamente',
      });

      await (service as any).handleCustomerOnboarded(message);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'cliente@example.com',
        subject: '¡Bienvenido a nuestra plataforma!',
        template: 'welcome',
        data: {
          customerName: 'John Doe',
          customerId: '1234567890',
        },
      });
    });
  });

  describe('handleCustomerActivated', () => {
    it('should handle customer activated message and send activation email', async () => {
      const message: CustomerActivatedMessage = {
        customerId: '1234567890',
        customer: {
          id: '1234567890',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'activated',
          activatedAt: '2024-01-01T00:00:00.000Z',
        },
        timestamp: new Date().toISOString(),
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'email_123',
        recipient: 'john@example.com',
        message: 'Email enviado exitosamente',
      });

      await (service as any).handleCustomerActivated(message);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'john@example.com',
        subject: 'Tu cuenta ha sido activada',
        template: 'account-activated',
        data: {
          customerName: 'John Doe',
          customerId: '1234567890',
          activationDate: '2024-01-01T00:00:00.000Z',
        },
      });

      expect(kafkaService.emit).toHaveBeenCalledWith('notification.sent', {
        customerId: '1234567890',
        type: 'email',
        template: 'account-activated',
        recipient: 'john@example.com',
        timestamp: expect.any(String),
      });
    });
  });

  describe('handleCustomerPromoted', () => {
    it('should handle customer promoted message and send promotion email', async () => {
      const message: CustomerPromotedMessage = {
        customerId: '1234567890',
        customer: {
          id: '1234567890',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'premium',
        },
        timestamp: new Date().toISOString(),
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'email_123',
        recipient: 'john@example.com',
        message: 'Email enviado exitosamente',
      });

      await (service as any).handleCustomerPromoted(message);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'john@example.com',
        subject: '¡Felicidades! Has sido promovido',
        template: 'promotion',
        data: {
          customerName: 'John Doe',
          customerId: '1234567890',
          newStatus: 'premium',
        },
      });

      expect(kafkaService.emit).toHaveBeenCalledWith('notification.sent', {
        customerId: '1234567890',
        type: 'email',
        template: 'promotion',
        recipient: 'john@example.com',
        timestamp: expect.any(String),
      });
    });
  });

  describe('handlePromotionActivated', () => {
    it('should handle promotion activated message and send bonus email', async () => {
      const message = {
        customerId: '1234567890',
        customer: {
          id: '1234567890',
          name: 'John Doe',
          email: 'john@example.com',
        },
        promotion: {
          discount: 60,
          validUntil: '2024-12-31',
          paymentAmount: 100,
        },
      };

      const sendEmailSpy = jest.spyOn(service, 'sendEmail').mockResolvedValue({
        success: true,
        messageId: 'email_123',
        recipient: 'john@example.com',
        message: 'Email enviado exitosamente',
      });

      await (service as any).handlePromotionActivated(message);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: 'john@example.com',
        subject: '¡Bonificación del 60% activada!',
        template: 'first-payment-bonus',
        data: {
          customerName: 'John Doe',
          customerId: '1234567890',
          discount: 60,
          validUntil: '2024-12-31',
          paymentAmount: 100,
        },
      });

      expect(kafkaService.emit).toHaveBeenCalledWith('notification.sent', {
        customerId: '1234567890',
        type: 'email',
        template: 'first-payment-bonus',
        recipient: 'john@example.com',
        timestamp: expect.any(String),
      });
    });
  });
});
