import { Controller, Post, Body, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { OnboardCustomerDto, ActivateCustomerDto, DeactivateCustomerDto } from './dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      status: 'ok',
      service: 'service-customer',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Post('onboard')
  @HttpCode(HttpStatus.CREATED)
  async onboardCustomer(@Body() onboardCustomerDto: OnboardCustomerDto) {
    return await this.customersService.onboardCustomer(onboardCustomerDto);
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activateCustomer(@Body() activateCustomerDto: ActivateCustomerDto) {
    return await this.customersService.activateCustomer(activateCustomerDto);
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateCustomer(@Body() deactivateCustomerDto: DeactivateCustomerDto) {
    return await this.customersService.deactivateCustomer(deactivateCustomerDto);
  }

  @Get(':customerId')
  @HttpCode(HttpStatus.OK)
  async getCustomer(@Param('customerId') customerId: string) {
    return await this.customersService.getCustomer(customerId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCustomers() {
    return await this.customersService.getAllCustomers();
  }
} 