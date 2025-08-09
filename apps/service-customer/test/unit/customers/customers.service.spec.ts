import { Test, TestingModule } from '@nestjs/testing'
import { Logger } from '@nestjs/common'
import { CustomersService } from '../../../src/customers/customers.service'
import { KafkaService } from '@shared/kafka'
import { OnboardCustomerDto } from '../../../src/customers/dto/onboard-customer.dto'
import { ActivateCustomerDto } from '../../../src/customers/dto/activate-customer.dto'
import { DeactivateCustomerDto } from '../../../src/customers/dto/deactivate-customer.dto'
import { FirstPaymentDto } from '../../../src/customers/dto/first-payment.dto'

describe('CustomersService', () => {
  let service: CustomersService
  let kafkaService: jest.Mocked<KafkaService>

  const mockKafkaService = {
    subscribe: jest.fn(),
    emit: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: KafkaService,
          useValue: mockKafkaService
        }
      ]
    }).compile()

    service = module.get<CustomersService>(CustomersService)
    kafkaService = module.get(KafkaService)

    // Limpiar el mapa de customers antes de cada test
    ;(service as any).customers.clear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
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

      const result = await service.onboardCustomer(onboardDto)

      expect(result.success).toBe(true)
      expect(result.customerId).toBeDefined()
      expect(result.message).toBe('Cliente onboarded exitosamente')
      expect(kafkaService.emit).toHaveBeenCalledWith('customer.onboarded', {
        customerId: result.customerId,
        customer: expect.objectContaining({
          id: result.customerId,
          ...onboardDto,
          status: 'onboarded',
          createdAt: expect.any(String)
        }),
        timestamp: expect.any(String)
      })
    })
  })

  describe('activateCustomer', () => {
    it('should activate an existing customer', async () => {
      const onboardDto: OnboardCustomerDto = {
        name: 'Carlos López',
        email: 'carlos@example.com',
        phone: '+1122334455'
      }
      const onboardResult = await service.onboardCustomer(onboardDto)

      const activateDto: ActivateCustomerDto = {
        customerId: onboardResult.customerId,
        activationReason: 'Documentación verificada'
      }

      const result = await service.activateCustomer(activateDto)

      expect(result.success).toBe(true)
      expect(result.customerId).toBe(onboardResult.customerId)
      expect(result.message).toBe('Cliente activado exitosamente')
    })
  })

  describe('firstPayment', () => {
    it('should process first payment for existing customer', async () => {
      const onboardDto: OnboardCustomerDto = {
        name: 'Pedro Sánchez',
        email: 'pedro@example.com',
        phone: '+9988776655'
      }
      const onboardResult = await service.onboardCustomer(onboardDto)

      const paymentDto: FirstPaymentDto = {
        customerId: onboardResult.customerId,
        amount: 100.5,
        paymentMethod: 'credit_card',
        description: 'Primer pago mensual'
      }

      const result = await service.firstPayment(paymentDto)

      expect(result.success).toBe(true)
      expect(result.customerId).toBe(onboardResult.customerId)
      expect(result.payment).toEqual({
        customerId: onboardResult.customerId,
        amount: 100.5,
        paymentMethod: 'credit_card',
        description: 'Primer pago mensual',
        processedAt: expect.any(String)
      })
    })

    it('should return error for non-existing customer', async () => {
      const paymentDto: FirstPaymentDto = {
        customerId: 'non-existing-id',
        amount: 50.0
      }

      const result = await service.firstPayment(paymentDto)

      expect(result.success).toBe(false)
      expect(result.message).toBe('Cliente no encontrado')
    })
  })

  describe('getCustomer', () => {
    it('should return existing customer', async () => {
      const onboardDto: OnboardCustomerDto = {
        name: 'Roberto Díaz',
        email: 'roberto@example.com',
        phone: '+5544332211'
      }
      const onboardResult = await service.onboardCustomer(onboardDto)

      const result = await service.getCustomer(onboardResult.customerId)

      expect(result.success).toBe(true)
      expect(result.customer).toEqual(
        expect.objectContaining({
          id: onboardResult.customerId,
          name: 'Roberto Díaz',
          email: 'roberto@example.com',
          phone: '+5544332211'
        })
      )
    })

    it('should return error for non-existing customer', async () => {
      const result = await service.getCustomer('non-existing-id')

      expect(result.success).toBe(false)
      expect(result.message).toBe('Cliente no encontrado')
    })
  })

  describe('getAllCustomers', () => {
    it('should return all customers', async () => {
      // Crear un nuevo módulo para este test específico
      const testModule: TestingModule = await Test.createTestingModule({
        providers: [
          CustomersService,
          {
            provide: KafkaService,
            useValue: mockKafkaService
          }
        ]
      }).compile()

      const testService = testModule.get<CustomersService>(CustomersService)

      // Crear los clientes uno por uno con un pequeño delay para evitar IDs duplicados
      const customer1 = await testService.onboardCustomer({
        name: 'Cliente 1',
        email: 'cliente1@example.com',
        phone: '+1111111111'
      } as OnboardCustomerDto)

      // Pequeño delay para asegurar IDs únicos
      await new Promise((resolve) => setTimeout(resolve, 1))

      const customer2 = await testService.onboardCustomer({
        name: 'Cliente 2',
        email: 'cliente2@example.com',
        phone: '+2222222222'
      } as OnboardCustomerDto)

      const result = await testService.getAllCustomers()

      expect(result.success).toBe(true)
      expect(result.customers).toHaveLength(2)
      expect(result.total).toBe(2)

      // Verificar que los clientes están en el resultado
      const customerNames = result.customers.map((c: any) => c.name)
      expect(customerNames).toContain('Cliente 1')
      expect(customerNames).toContain('Cliente 2')
    })

    it('should return empty array when no customers exist', async () => {
      // Crear un nuevo módulo para este test específico
      const testModule: TestingModule = await Test.createTestingModule({
        providers: [
          CustomersService,
          {
            provide: KafkaService,
            useValue: mockKafkaService
          }
        ]
      }).compile()

      const testService = testModule.get<CustomersService>(CustomersService)

      const result = await testService.getAllCustomers()

      expect(result.success).toBe(true)
      expect(result.customers).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })
})
