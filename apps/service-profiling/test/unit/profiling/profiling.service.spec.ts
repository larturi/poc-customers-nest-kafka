import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ProfilingService } from '../../../src/profiling/profiling.service';
import { KafkaService } from '@shared/kafka';
import { PromoteCustomerDto } from '../../../src/profiling/dto/promote-customer.dto';

describe('ProfilingService', () => {
  let service: ProfilingService;
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
        ProfilingService,
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
      ],
    }).compile();

    service = module.get<ProfilingService>(ProfilingService);
    kafkaService = module.get(KafkaService);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should be able to create service instance', () => {
      expect(service).toBeInstanceOf(ProfilingService);
    });
  });

  describe('promoteCustomer', () => {
    it('should promote a customer successfully', async () => {
      const promoteDto: PromoteCustomerDto = {
        customerId: '1234567890',
        age: 25,
        income: 50000,
        creditScore: 700,
        isFirstPayment: true,
        newTier: 'premium',
        reason: 'Cliente de alto valor',
      };

      const result = await service.promoteCustomer(promoteDto);

      expect(result.success).toBe(true);
      expect(result.customerId).toBe(promoteDto.customerId);
      expect(result.message).toBe(
        `Cliente promovido a ${promoteDto.newTier} exitosamente`,
      );
      expect(kafkaService.emit).toHaveBeenCalledWith('customer.profiled', {
        customerId: promoteDto.customerId,
        promotion: expect.objectContaining({
          customerId: promoteDto.customerId,
          newTier: promoteDto.newTier,
          reason: promoteDto.reason,
          type: 'tier_promotion',
          discount: 0,
          description: `Promotion to tier ${promoteDto.newTier}`,
          validUntil: expect.any(String),
          activatedAt: expect.any(String),
        }),
        timestamp: expect.any(String),
      });
    });

    it('should handle promotion with different tier', async () => {
      const promoteDto: PromoteCustomerDto = {
        customerId: '9876543210',
        age: 35,
        income: 100000,
        creditScore: 800,
        isFirstPayment: false,
        newTier: 'vip',
        reason: 'Cliente VIP',
      };

      const result = await service.promoteCustomer(promoteDto);

      expect(result.success).toBe(true);
      expect(result.customerId).toBe(promoteDto.customerId);
      expect(result.message).toBe(
        `Cliente promovido a ${promoteDto.newTier} exitosamente`,
      );
    });
  });

  describe('private methods', () => {
    describe('processCustomerOnboarded', () => {
      it('should process customer onboarded event', async () => {
        const message = {
          customerId: '1234567890',
          customer: {
            name: 'Juan Pérez',
            email: 'juan@example.com',
          },
        };

        // Acceder al método privado usando any
        const processMethod = (service as any).processCustomerOnboarded.bind(
          service,
        );
        await processMethod(message);

        expect(kafkaService.emit).toHaveBeenCalledWith('customer.profiled', {
          customerId: message.customerId,
          profile: expect.objectContaining({
            customerId: message.customerId,
            riskScore: expect.any(Number),
            segment: expect.any(String),
            recommendations: expect.any(Array),
            createdAt: expect.any(String),
          }),
          timestamp: expect.any(String),
        });
      });
    });

    describe('processCustomerActivated', () => {
      it('should process customer activated event', async () => {
        const message = {
          customerId: '1234567890',
          activationReason: 'Documentación verificada',
        };

        // Acceder al método privado usando any
        const processMethod = (service as any).processCustomerActivated.bind(
          service,
        );
        await processMethod(message);

        expect(kafkaService.emit).toHaveBeenCalledWith('customer.profiled', {
          customerId: message.customerId,
          profile: expect.objectContaining({
            customerId: message.customerId,
            riskScore: expect.any(Number),
            segment: 'active',
            lastUpdated: expect.any(String),
          }),
          timestamp: expect.any(String),
        });
      });
    });

    describe('processFirstPayment', () => {
      it('should process first payment event', async () => {
        const message = {
          customerId: '1234567890',
          payment: {
            amount: 1000,
            currency: 'USD',
          },
        };

        // Acceder al método privado usando any
        const processMethod = (service as any).processFirstPayment.bind(
          service,
        );
        await processMethod(message);

        expect(kafkaService.emit).toHaveBeenCalledWith(
          'customer.promotion.activated',
          {
            customerId: message.customerId,
            promotion: expect.objectContaining({
              customerId: message.customerId,
              type: 'first_payment_bonus',
              discount: 60,
              description: 'Bonificación del 60% por primer pago',
              validUntil: expect.any(String),
              activatedAt: expect.any(String),
              paymentAmount: message.payment.amount,
            }),
            timestamp: expect.any(String),
          },
        );
      });
    });

    describe('calculateSegment', () => {
      it('should return a valid segment', () => {
        const message = { customerId: '1234567890' };

        // Acceder al método privado usando any
        const calculateMethod = (service as any).calculateSegment.bind(service);
        const segment = calculateMethod(message);

        expect(['basic', 'premium', 'vip']).toContain(segment);
      });
    });

    describe('generateRecommendations', () => {
      it('should return recommendations array', () => {
        const message = { customerId: '1234567890' };

        // Acceder al método privado usando any
        const generateMethod = (service as any).generateRecommendations.bind(
          service,
        );
        const recommendations = generateMethod(message);

        expect(Array.isArray(recommendations)).toBe(true);
        expect(recommendations.length).toBeGreaterThan(0);
        expect(recommendations.length).toBeLessThanOrEqual(4);
      });
    });
  });

  describe('error handling', () => {
    it('should handle kafka emit errors gracefully', async () => {
      const promoteDto: PromoteCustomerDto = {
        customerId: '1234567890',
        age: 25,
        income: 50000,
        creditScore: 700,
        isFirstPayment: true,
        newTier: 'premium',
        reason: 'Cliente de alto valor',
      };

      // Simular error en kafka emit
      kafkaService.emit.mockRejectedValueOnce(new Error('Kafka error'));

      await expect(service.promoteCustomer(promoteDto)).rejects.toThrow(
        'Kafka error',
      );
    });
  });
});
