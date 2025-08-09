import { Injectable, Logger } from '@nestjs/common'
import { KafkaService } from '@shared/kafka'
import { OnboardCustomerDto } from './dto/onboard-customer.dto'
import { ActivateCustomerDto } from './dto/activate-customer.dto'
import { DeactivateCustomerDto } from './dto/deactivate-customer.dto'
import { FirstPaymentDto } from './dto/first-payment.dto'
import { Customer } from './interfaces/customer.interface'
import {
  CustomerActivatedMessage,
  CustomerDeactivatedMessage,
  CustomerOnboardedMessage,
  CustomerPromotedMessage,
  FirstPaymentMessage,
  NotificationSentMessage
} from './interfaces/message.interface'

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name)
  private customers = new Map<string, any>()

  constructor(private readonly kafkaService: KafkaService) {
    this.initializeKafkaSubscriptions()
  }

  private async initializeKafkaSubscriptions() {
    // Suscribirse a eventos de notificaciones
    await this.kafkaService.subscribe<NotificationSentMessage>(
      'notification.sent',
      async (message) => {
        this.logger.log(`📧 Notificación enviada: ${JSON.stringify(message)}`)
      }
    )
  }

  async onboardCustomer(dto: OnboardCustomerDto) {
    this.logger.log(`🚀 Onboarding cliente: ${JSON.stringify(dto)}`)

    // Simular procesamiento
    const customerId = Date.now().toString()
    const customer: Customer = {
      id: customerId,
      ...dto,
      status: 'onboarded',
      createdAt: new Date().toISOString()
    }

    // Guardar en memoria (en producción sería una base de datos)
    this.customers.set(customerId, customer)

    // Emitir evento de cliente onboarded
    await this.kafkaService.emit<CustomerOnboardedMessage>(
      'customer.onboarded',
      {
        customerId,
        customer,
        timestamp: new Date().toISOString()
      }
    )

    return {
      success: true,
      customerId,
      message: 'Cliente onboarded exitosamente'
    }
  }

  async activateCustomer(dto: ActivateCustomerDto) {
    this.logger.log(`✅ Activando cliente: ${JSON.stringify(dto)}`);

    const existingCustomer = this.customers.get(dto.customerId);
    if (!existingCustomer) {
      // Opcional: manejar el caso en que el cliente no existe
      this.logger.error(`Cliente no encontrado para activar: ${dto.customerId}`);
      throw new Error('Cliente no encontrado');
    }

    // Simular procesamiento
    const customer: Customer = {
      ...existingCustomer,
      status: 'active',
      activatedAt: new Date().toISOString(),
    };

    // Actualizar en memoria
    this.customers.set(dto.customerId, customer);

    // Emitir evento de cliente activado
    await this.kafkaService.emit<CustomerActivatedMessage>('customer.activated', {
      customerId: dto.customerId,
      customer,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      customerId: dto.customerId,
      message: 'Cliente activado exitosamente',
    };
  }

  async deactivateCustomer(dto: DeactivateCustomerDto) {
    this.logger.log(`❌ Desactivando cliente: ${JSON.stringify(dto)}`);

    const existingCustomer = this.customers.get(dto.customerId);
    if (!existingCustomer) {
      this.logger.error(
        `Cliente no encontrado para desactivar: ${dto.customerId}`,
      );
      throw new Error('Cliente no encontrado');
    }

    // Simular procesamiento
    const customer: Customer = {
      ...existingCustomer,
      status: 'inactive',
      deactivatedAt: new Date().toISOString(),
    };

    // Actualizar en memoria
    this.customers.set(dto.customerId, customer);

    // Emitir evento de cliente desactivado
    await this.kafkaService.emit<CustomerDeactivatedMessage>(
      'customer.deactivated',
      {
        customerId: dto.customerId,
        customer,
        timestamp: new Date().toISOString(),
      },
    );

    return {
      success: true,
      customerId: dto.customerId,
      message: 'Cliente desactivado exitosamente',
    };
  }

  async firstPayment(dto: FirstPaymentDto) {
    this.logger.log(`💳 Primer pago del cliente: ${JSON.stringify(dto)}`);

    // Verificar que el cliente existe
    const existingCustomer = this.customers.get(dto.customerId);
    if (!existingCustomer) {
      return {
        success: false,
        message: 'Cliente no encontrado',
      };
    }

    // Simular procesamiento del pago
    const payment = {
      customerId: dto.customerId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod || 'credit_card',
      description: dto.description || 'Primer pago del cliente',
      processedAt: new Date().toISOString(),
    };

    // Actualizar cliente con información del primer pago
    const updatedCustomer: Customer = {
      ...existingCustomer,
      firstPaymentAt: new Date().toISOString(),
    };
    this.customers.set(dto.customerId, updatedCustomer);

    // Emitir evento de primer pago
    await this.kafkaService.emit<FirstPaymentMessage>('customer.firstPayment', {
      customerId: dto.customerId,
      payment,
      customer: updatedCustomer,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      customerId: dto.customerId,
      payment,
      message: 'Primer pago procesado exitosamente',
    };
  }

  async promoteCustomer(customerId: string) {
    this.logger.log(`⭐ Promoviendo cliente: ${customerId}`);

    const existingCustomer = this.customers.get(customerId);
    if (!existingCustomer) {
      this.logger.error(`Cliente no encontrado para promover: ${customerId}`);
      throw new Error('Cliente no encontrado');
    }

    // Simular procesamiento
    const customer: Customer = {
      ...existingCustomer,
      status: 'premium',
      promotedAt: new Date().toISOString(),
    };

    // Actualizar en memoria
    this.customers.set(customerId, customer);

    // Emitir evento de cliente promovido
    await this.kafkaService.emit<CustomerPromotedMessage>('customer.promoted', {
      customerId,
      customer,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      customerId,
      message: 'Cliente promovido exitosamente',
    };
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
