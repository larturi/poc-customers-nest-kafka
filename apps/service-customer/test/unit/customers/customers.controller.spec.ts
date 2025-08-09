import { Test, TestingModule } from '@nestjs/testing'
import { CustomersController } from '../../../src/customers/customers.controller'
import { CustomersService } from '../../../src/customers/customers.service'
import { OnboardCustomerDto } from '../../../src/customers/dto/onboard-customer.dto'
import { ActivateCustomerDto } from '../../../src/customers/dto/activate-customer.dto'
import { DeactivateCustomerDto } from '../../../src/customers/dto/deactivate-customer.dto'
import { FirstPaymentDto } from '../../../src/customers/dto/first-payment.dto'
import { PromoteCustomerDto } from '../../../src/customers/dto'

describe('CustomersController', () => {
  let controller: CustomersController
  let service: jest.Mocked<CustomersService>

  const mockCustomersService = {
    onboardCustomer: jest.fn(),
    activateCustomer: jest.fn(),
    deactivateCustomer: jest.fn(),
    firstPayment: jest.fn(),
    getCustomer: jest.fn(),
    getAllCustomers: jest.fn(),
    promoteCustomer: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService
        }
      ]
    }).compile()

    controller = module.get<CustomersController>(CustomersController)
    service = module.get(CustomersService)
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
        service: 'service-customer',
        timestamp: expect.any(String),
        version: '1.0.0'
      })
    })
  })

  describe('onboardCustomer', () => {
    it('should onboard a customer successfully', async () => {
      const onboardDto: OnboardCustomerDto = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        phone: '+1234567890',
        documentType: 'DNI',
        documentNumber: '12345678',
        birthDate: '1990-01-01'
      }

      const expectedResult = {
        success: true,
        customerId: '1234567890',
        message: 'Cliente onboarded exitosamente'
      }

      service.onboardCustomer.mockResolvedValue(expectedResult)

      const result = await controller.onboardCustomer(onboardDto)

      expect(service.onboardCustomer).toHaveBeenCalledWith(onboardDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('activateCustomer', () => {
    it('should activate a customer successfully', async () => {
      const activateDto: ActivateCustomerDto = {
        customerId: '1234567890',
        activationReason: 'Documentación verificada'
      }

      const expectedResult = {
        success: true,
        customerId: '1234567890',
        message: 'Cliente activado exitosamente'
      }

      service.activateCustomer.mockResolvedValue(expectedResult)

      const result = await controller.activateCustomer(activateDto)

      expect(service.activateCustomer).toHaveBeenCalledWith(activateDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('deactivateCustomer', () => {
    it('should deactivate a customer successfully', async () => {
      const deactivateDto: DeactivateCustomerDto = {
        customerId: '1234567890',
        deactivationReason: 'Cliente solicitó desactivación'
      }

      const expectedResult = {
        success: true,
        customerId: '1234567890',
        message: 'Cliente desactivado exitosamente'
      }

      service.deactivateCustomer.mockResolvedValue(expectedResult)

      const result = await controller.deactivateCustomer(deactivateDto)

      expect(service.deactivateCustomer).toHaveBeenCalledWith(deactivateDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('firstPayment', () => {
    it('should process first payment successfully', async () => {
      const paymentDto: FirstPaymentDto = {
        customerId: '1234567890',
        amount: 100.5,
        paymentMethod: 'credit_card',
        description: 'Primer pago mensual'
      }

      const expectedResult = {
        success: true,
        customerId: '1234567890',
        payment: {
          customerId: '1234567890',
          amount: 100.5,
          paymentMethod: 'credit_card',
          description: 'Primer pago mensual',
          processedAt: '2024-01-01T00:00:00.000Z'
        },
        message: 'Primer pago procesado exitosamente'
      }

      service.firstPayment.mockResolvedValue(expectedResult)

      const result = await controller.firstPayment(paymentDto)

      expect(service.firstPayment).toHaveBeenCalledWith(paymentDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('promoteCustomer', () => {
    it('should promote a customer successfully', async () => {
      const promoteDto: PromoteCustomerDto = {
        customerId: '1234567890'
      }

      const expectedResult = {
        success: true,
        customerId: '1234567890',
        message: 'Cliente promocionado exitosamente'
      }

      service.promoteCustomer.mockResolvedValue(expectedResult)

      const result = await controller.promoteCustomer(promoteDto)

      expect(service.promoteCustomer).toHaveBeenCalledWith(
        promoteDto.customerId
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe('getCustomer', () => {
    it('should return customer by id', async () => {
      const customerId = '1234567890'
      const expectedResult = {
        success: true,
        customer: {
          id: '1234567890',
          name: 'Juan Pérez',
          email: 'juan@example.com',
          phone: '+1234567890',
          status: 'active'
        }
      }

      service.getCustomer.mockResolvedValue(expectedResult)

      const result = await controller.getCustomer(customerId)

      expect(service.getCustomer).toHaveBeenCalledWith(customerId)
      expect(result).toEqual(expectedResult)
    })
  })

  describe('getAllCustomers', () => {
    it('should return all customers', async () => {
      const expectedResult = {
        success: true,
        customers: [
          {
            id: '1234567890',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            phone: '+1234567890',
            status: 'active'
          },
          {
            id: '0987654321',
            name: 'María García',
            email: 'maria@example.com',
            phone: '+0987654321',
            status: 'active'
          }
        ],
        total: 2
      }

      service.getAllCustomers.mockResolvedValue(expectedResult)

      const result = await controller.getAllCustomers()

      expect(service.getAllCustomers).toHaveBeenCalled()
      expect(result).toEqual(expectedResult)
    })
  })
})
