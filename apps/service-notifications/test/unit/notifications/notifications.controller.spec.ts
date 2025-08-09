import { Test, TestingModule } from '@nestjs/testing'
import { NotificationsController } from '../../../src/notifications/notifications.controller'
import { NotificationsService } from '../../../src/notifications/notifications.service'
import { SendEmailDto } from '../../../src/notifications/dto/send-email.dto'
import { SendSmsDto } from '../../../src/notifications/dto/send-sms.dto'

describe('NotificationsController', () => {
  let controller: NotificationsController
  let service: jest.Mocked<NotificationsService>

  const mockNotificationsService = {
    sendEmail: jest.fn(),
    sendSms: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService
        }
      ]
    }).compile()

    controller = module.get<NotificationsController>(NotificationsController)
    service = module.get(NotificationsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const result = await controller.healthCheck()

      expect(result).toEqual({
        status: 'ok',
        service: 'service-notifications',
        timestamp: expect.any(String),
        version: '1.0.0'
      })
    })
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const sendEmailDto: SendEmailDto = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'welcome',
        data: { name: 'John Doe' }
      }

      const expectedResult = {
        success: true,
        messageId: 'email_1234567890',
        recipient: 'test@example.com',
        message: 'Email enviado exitosamente'
      }

      service.sendEmail.mockResolvedValue(expectedResult)

      const result = await controller.sendEmail(sendEmailDto)

      expect(service.sendEmail).toHaveBeenCalledWith(sendEmailDto)
      expect(result).toEqual(expectedResult)
    })

    it('should send email with customerId', async () => {
      const sendEmailDto: SendEmailDto = {
        customerId: '1234567890',
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'welcome',
        data: { name: 'John Doe' }
      }

      const expectedResult = {
        success: true,
        messageId: 'email_1234567890',
        recipient: 'test@example.com',
        message: 'Email enviado exitosamente'
      }

      service.sendEmail.mockResolvedValue(expectedResult)

      const result = await controller.sendEmail(sendEmailDto)

      expect(service.sendEmail).toHaveBeenCalledWith(sendEmailDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle service errors', async () => {
      const sendEmailDto: SendEmailDto = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: 'welcome',
        data: { name: 'John Doe' }
      }

      const error = new Error('Email service unavailable')
      service.sendEmail.mockRejectedValue(error)

      await expect(controller.sendEmail(sendEmailDto)).rejects.toThrow('Email service unavailable')
      expect(service.sendEmail).toHaveBeenCalledWith(sendEmailDto)
    })
  })

  describe('sendSms', () => {
    it('should send SMS successfully', async () => {
      const sendSmsDto: SendSmsDto = {
        to: '+1234567890',
        message: 'Test message',
        template: 'welcome',
        data: { name: 'John Doe' }
      }

      const expectedResult = {
        success: true,
        messageId: 'sms_1234567890',
        recipient: '+1234567890',
        message: 'SMS enviado exitosamente'
      }

      service.sendSms.mockResolvedValue(expectedResult)

      const result = await controller.sendSms(sendSmsDto)

      expect(service.sendSms).toHaveBeenCalledWith(sendSmsDto)
      expect(result).toEqual(expectedResult)
    })

    it('should send SMS with customerId', async () => {
      const sendSmsDto: SendSmsDto = {
        customerId: '1234567890',
        to: '+1234567890',
        message: 'Test message',
        template: 'welcome',
        data: { name: 'John Doe' }
      }

      const expectedResult = {
        success: true,
        messageId: 'sms_1234567890',
        recipient: '+1234567890',
        message: 'SMS enviado exitosamente'
      }

      service.sendSms.mockResolvedValue(expectedResult)

      const result = await controller.sendSms(sendSmsDto)

      expect(service.sendSms).toHaveBeenCalledWith(sendSmsDto)
      expect(result).toEqual(expectedResult)
    })

    it('should handle service errors', async () => {
      const sendSmsDto: SendSmsDto = {
        to: '+1234567890',
        message: 'Test message',
        template: 'welcome',
        data: { name: 'John Doe' }
      }

      const error = new Error('SMS service unavailable')
      service.sendSms.mockRejectedValue(error)

      await expect(controller.sendSms(sendSmsDto)).rejects.toThrow('SMS service unavailable')
      expect(service.sendSms).toHaveBeenCalledWith(sendSmsDto)
    })
  })
})
