import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ProfilingService } from './profiling.service';
import { PromoteCustomerDto } from './dto';

@Controller('profiling')
export class ProfilingController {
  constructor(private readonly profilingService: ProfilingService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      status: 'ok',
      service: 'service-profiling',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Post('promote')
  @HttpCode(HttpStatus.OK)
  async promote(@Body() promoteDto: PromoteCustomerDto) {
    return this.profilingService.promote(promoteDto);
  }
} 