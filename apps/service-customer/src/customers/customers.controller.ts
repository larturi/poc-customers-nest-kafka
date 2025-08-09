import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Param
} from '@nestjs/common'
import { CustomersService } from './customers.service'
import {
  OnboardCustomerDto,
  ActivateCustomerDto,
  DeactivateCustomerDto,
  FirstPaymentDto,
  PromoteCustomerDto
} from './dto'

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
      version: '1.0.0'
    }
  }

  @Post('onboard')
  @HttpCode(HttpStatus.CREATED)
  async onboardCustomer(@Body() onboardCustomerDto: OnboardCustomerDto) {
    return await this.customersService.onboardCustomer(onboardCustomerDto)
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activateCustomer(@Body() activateCustomerDto: ActivateCustomerDto) {
    return await this.customersService.activateCustomer(activateCustomerDto)
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateCustomer(
    @Body() deactivateCustomerDto: DeactivateCustomerDto
  ) {
    return await this.customersService.deactivateCustomer(deactivateCustomerDto)
  }

  @Post('first-payment')
  @HttpCode(HttpStatus.OK)
  async firstPayment(@Body() firstPaymentDto: FirstPaymentDto) {
    return await this.customersService.firstPayment(firstPaymentDto)
  }

  @Post('promote')
  @HttpCode(HttpStatus.OK)
  async promoteCustomer(@Body() promoteCustomerDto: PromoteCustomerDto) {
    return await this.customersService.promoteCustomer(
      promoteCustomerDto.customerId
    )
  }

  @Get(':customerId')
  @HttpCode(HttpStatus.OK)
  async getCustomer(@Param('customerId') customerId: string) {
    return await this.customersService.getCustomer(customerId)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllCustomers() {
    return await this.customersService.getAllCustomers()
  }
}
