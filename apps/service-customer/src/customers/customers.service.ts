import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnboardCustomerDto, ActivateCustomerDto, DeactivateCustomerDto } from './dto';
import { KafkaService } from '../kafka/kafka.service';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  country?: string;
  status: 'pending' | 'active' | 'inactive';
  tier: 'basic' | 'premium' | 'vip';
  onboardingDate: string;
  activationDate?: string;
  deactivationDate?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CustomersService implements OnModuleInit {
  private readonly logger = new Logger(CustomersService.name);
  private customers: Map<string, Customer> = new Map();

  constructor(private readonly kafkaService: KafkaService) {}

  async onModuleInit() {
    // Suscribirse a eventos de otros servicios
    await this.setupEventListeners();
  }

  private async setupEventListeners() {
    // Suscribirse a eventos de notificaciones
    await this.kafkaService.subscribeToMultiple([
      {
        topic: 'notification.sent',
        handler: async (message) => {
          await this.handleNotificationSent(message);
        },
      },
    ]);

    this.logger.log('🎧 Event listeners configurados exitosamente');
  }

  private async handleNotificationSent(message: any) {
    this.logger.log(
      `📧 Notificación enviada para cliente: ${message.customerId}`,
    );

    // Aquí podrías actualizar el estado del cliente o registrar la notificación
    const customer = this.customers.get(message.customerId);
    if (customer) {
      this.logger.log(
        `✅ Notificación ${message.type} enviada exitosamente a ${message.recipient}`,
      );
    }
  }

  async onboardCustomer(onboardCustomerDto: OnboardCustomerDto): Promise<any> {
    this.logger.log(`Onboarding cliente: ${onboardCustomerDto.email}`);

    const customerId = `cust_${Date.now()}`;
    const now = new Date().toISOString();

    const customer: Customer = {
      id: customerId,
      name: onboardCustomerDto.name,
      email: onboardCustomerDto.email,
      phone: onboardCustomerDto.phone,
      documentType: onboardCustomerDto.documentType,
      documentNumber: onboardCustomerDto.documentNumber,
      birthDate: onboardCustomerDto.birthDate,
      address: onboardCustomerDto.address,
      city: onboardCustomerDto.city,
      country: onboardCustomerDto.country,
      status: 'pending',
      tier: 'basic',
      onboardingDate: now,
      createdAt: now,
      updatedAt: now,
    };

    // Guardar cliente en memoria (en producción sería una base de datos)
    this.customers.set(customerId, customer);

    // Emitir evento de cliente onboarded
    await this.kafkaService.emit('customer.onboarded', {
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      tier: customer.tier,
      onboardingDate: customer.onboardingDate,
    });

    this.logger.log(`Cliente onboarded exitosamente: ${customerId}`);

    return {
      success: true,
      customerId: customer.id,
      message: 'Cliente onboarded exitosamente',
      data: customer,
    };
  }

  async activateCustomer(activateCustomerDto: ActivateCustomerDto): Promise<any> {
    this.logger.log(`Activando cliente: ${activateCustomerDto.customerId}`);

    const customer = this.customers.get(activateCustomerDto.customerId);
    if (!customer) {
      throw new Error(`Cliente no encontrado: ${activateCustomerDto.customerId}`);
    }

    if (customer.status === 'active') {
      throw new Error(`Cliente ya está activo: ${activateCustomerDto.customerId}`);
    }

    const now = new Date().toISOString();
    customer.status = 'active';
    customer.activationDate = now;
    customer.updatedAt = now;

    // Actualizar cliente
    this.customers.set(activateCustomerDto.customerId, customer);

    // Emitir evento de cliente activado
    await this.kafkaService.emit('customer.activated', {
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      tier: customer.tier,
      activationDate: customer.activationDate,
      activationReason: activateCustomerDto.activationReason,
    });

    this.logger.log(`Cliente activado exitosamente: ${customer.id}`);

    return {
      success: true,
      customerId: customer.id,
      message: 'Cliente activado exitosamente',
      data: customer,
    };
  }

  async deactivateCustomer(deactivateCustomerDto: DeactivateCustomerDto): Promise<any> {
    this.logger.log(`Desactivando cliente: ${deactivateCustomerDto.customerId}`);

    const customer = this.customers.get(deactivateCustomerDto.customerId);
    if (!customer) {
      throw new Error(`Cliente no encontrado: ${deactivateCustomerDto.customerId}`);
    }

    if (customer.status === 'inactive') {
      throw new Error(`Cliente ya está inactivo: ${deactivateCustomerDto.customerId}`);
    }

    const now = new Date().toISOString();
    customer.status = 'inactive';
    customer.deactivationDate = now;
    customer.updatedAt = now;

    // Actualizar cliente
    this.customers.set(deactivateCustomerDto.customerId, customer);

    // Emitir evento de cliente desactivado
    await this.kafkaService.emit('customer.deactivated', {
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      tier: customer.tier,
      deactivationDate: customer.deactivationDate,
      deactivationReason: deactivateCustomerDto.deactivationReason,
    });

    this.logger.log(`Cliente desactivado exitosamente: ${customer.id}`);

    return {
      success: true,
      customerId: customer.id,
      message: 'Cliente desactivado exitosamente',
      data: customer,
    };
  }

  async getCustomer(customerId: string): Promise<any> {
    this.logger.log(`Obteniendo cliente: ${customerId}`);

    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Cliente no encontrado: ${customerId}`);
    }

    return {
      success: true,
      data: customer,
    };
  }

  async getAllCustomers(): Promise<any> {
    this.logger.log('Obteniendo todos los clientes');

    const customers = Array.from(this.customers.values());

    return {
      success: true,
      count: customers.length,
      data: customers,
    };
  }

  // Método para promocionar cliente (ejemplo de funcionalidad adicional)
  async promoteCustomer(customerId: string, newTier: 'basic' | 'premium' | 'vip'): Promise<any> {
    this.logger.log(`Promocionando cliente: ${customerId} a tier: ${newTier}`);

    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Cliente no encontrado: ${customerId}`);
    }

    if (customer.tier === newTier) {
      throw new Error(`Cliente ya tiene el tier: ${newTier}`);
    }

    const oldTier = customer.tier;
    const now = new Date().toISOString();
    customer.tier = newTier;
    customer.updatedAt = now;

    // Actualizar cliente
    this.customers.set(customerId, customer);

    // Emitir evento de cliente promocionado
    await this.kafkaService.emit('customer.promoted', {
      customerId: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      oldTier,
      newTier: customer.tier,
      promotionDate: now,
    });

    this.logger.log(`Cliente promocionado exitosamente: ${customer.id} de ${oldTier} a ${newTier}`);

    return {
      success: true,
      customerId: customer.id,
      message: 'Cliente promocionado exitosamente',
      data: customer,
    };
  }
} 