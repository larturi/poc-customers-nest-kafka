import { Test, TestingModule } from '@nestjs/testing';
import { ProfilingController } from '../../../src/profiling/profiling.controller';
import { ProfilingService } from '../../../src/profiling/profiling.service';
import { PromoteCustomerDto } from '../../../src/profiling/dto/promote-customer.dto';

describe('ProfilingController', () => {
  let controller: ProfilingController;
  let service: jest.Mocked<ProfilingService>;

  const mockProfilingService = {
    promoteCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilingController],
      providers: [
        {
          provide: ProfilingService,
          useValue: mockProfilingService,
        },
      ],
    }).compile();

    controller = module.get<ProfilingController>(ProfilingController);
    service = module.get(ProfilingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const result = await controller.healthCheck();

      expect(result).toEqual({
        status: 'ok',
        service: 'service-profiling',
        timestamp: expect.any(String),
        version: '1.0.0',
      });
    });
  });

  describe('promote', () => {
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

      const expectedResult = {
        success: true,
        customerId: '1234567890',
        message: 'Cliente promovido a premium exitosamente',
      };

      service.promoteCustomer.mockResolvedValue(expectedResult);

      const result = await controller.promote(promoteDto);

      expect(service.promoteCustomer).toHaveBeenCalledWith(promoteDto);
      expect(result).toEqual(expectedResult);
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

      const expectedResult = {
        success: true,
        customerId: '9876543210',
        message: 'Cliente promovido a vip exitosamente',
      };

      service.promoteCustomer.mockResolvedValue(expectedResult);

      const result = await controller.promote(promoteDto);

      expect(service.promoteCustomer).toHaveBeenCalledWith(promoteDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const promoteDto: PromoteCustomerDto = {
        customerId: '1234567890',
        age: 25,
        income: 50000,
        creditScore: 700,
        isFirstPayment: true,
        newTier: 'premium',
        reason: 'Cliente de alto valor',
      };

      const errorMessage = 'Error interno del servicio';
      service.promoteCustomer.mockRejectedValue(new Error(errorMessage));

      await expect(controller.promote(promoteDto)).rejects.toThrow(
        errorMessage,
      );
      expect(service.promoteCustomer).toHaveBeenCalledWith(promoteDto);
    });
  });
});
