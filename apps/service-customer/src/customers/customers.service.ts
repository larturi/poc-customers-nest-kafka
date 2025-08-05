import { Injectable, Logger } from '@nestjs/common'
import { KafkaService } from '@shared/kafka'
import { OnboardCustomerDto } from './dto/onboard-customer.dto'
import { ActivateCustomerDto } from './dto/activate-customer.dto'
import { DeactivateCustomerDto } from './dto/deactivate-customer.dto'

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name)
  private customers = new Map<string, any>()

  constructor(private readonly kafkaService: KafkaService) {
    this.initializeKafkaSubscriptions()
  }

  private async initializeKafkaSubscriptions() {
    // Suscribirse a eventos de notificaciones
    await this.kafkaService.subscribe('notification.sent', async (message) => {
      this.logger.log(`📧 Notificación enviada: ${JSON.stringify(message)}`)
    })
  }

  async onboardCustomer(dto: OnboardCustomerDto) {
    this.logger.log(`🚀 Onboarding cliente: ${JSON.stringify(dto)}`)

    // Simular procesamiento
    const customerId = Date.now().toString()
    const customer = {
      id: customerId,
      ...dto,
      status: 'onboarded',
      createdAt: new Date().toISOString()
    }

    // Guardar en memoria (en producción sería una base de datos)
    this.customers.set(customerId, customer)

    // Emitir evento de cliente onboarded
    await this.kafkaService.emit('customer.onboarded', {
      customerId,
      customer,
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      customerId,
      message: 'Cliente onboarded exitosamente'
    }
  }

  async activateCustomer(dto: ActivateCustomerDto) {
    this.logger.log(`✅ Activando cliente: ${JSON.stringify(dto)}`)

    // Simular procesamiento
    const customer = {
      id: dto.customerId,
      status: 'active',
      activatedAt: new Date().toISOString()
    }

    // Actualizar en memoria
    const existingCustomer = this.customers.get(dto.customerId)
    if (existingCustomer) {
      this.customers.set(dto.customerId, { ...existingCustomer, ...customer })
    }

    // Emitir evento de cliente activado
    await this.kafkaService.emit('customer.activated', {
      customerId: dto.customerId,
      customer,
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      customerId: dto.customerId,
      message: 'Cliente activado exitosamente'
    }
  }

  async deactivateCustomer(dto: DeactivateCustomerDto) {
    this.logger.log(`❌ Desactivando cliente: ${JSON.stringify(dto)}`)

    // Simular procesamiento
    const customer = {
      id: dto.customerId,
      status: 'inactive',
      deactivatedAt: new Date().toISOString()
    }

    // Actualizar en memoria
    const existingCustomer = this.customers.get(dto.customerId)
    if (existingCustomer) {
      this.customers.set(dto.customerId, { ...existingCustomer, ...customer })
    }

    // Emitir evento de cliente desactivado
    await this.kafkaService.emit('customer.deactivated', {
      customerId: dto.customerId,
      customer,
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      customerId: dto.customerId,
      message: 'Cliente desactivado exitosamente'
    }
  }

  async promoteCustomer(customerId: string) {
    this.logger.log(`⭐ Promoviendo cliente: ${customerId}`)

    // Simular procesamiento
    const customer = {
      id: customerId,
      status: 'premium',
      promotedAt: new Date().toISOString()
    }

    // Actualizar en memoria
    const existingCustomer = this.customers.get(customerId)
    if (existingCustomer) {
      this.customers.set(customerId, { ...existingCustomer, ...customer })
    }

    // Emitir evento de cliente promovido
    await this.kafkaService.emit('customer.promoted', {
      customerId,
      customer,
      timestamp: new Date().toISOString()
    })

    return {
      success: true,
      customerId,
      message: 'Cliente promovido exitosamente'
    }
  }

  async getCustomer(customerId: string) {
    this.logger.log(`🔍 Obteniendo cliente: ${customerId}`)

    const customer = this.customers.get(customerId)
    if (!customer) {
      return {
        success: false,
        message: 'Cliente no encontrado'
      }
    }

    return {
      success: true,
      customer
    }
  }

  async getAllCustomers() {
    this.logger.log(`📋 Obteniendo todos los clientes`)

    const customers = Array.from(this.customers.values())

    return {
      success: true,
      customers,
      total: customers.length
    }
  }
}
