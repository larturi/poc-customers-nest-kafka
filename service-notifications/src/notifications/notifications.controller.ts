import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendEmailDto, SendSmsDto } from './dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      status: 'ok',
      service: 'service-notifications',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Post('email')
  @HttpCode(HttpStatus.CREATED)
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return await this.notificationsService.sendEmail(sendEmailDto);
  }

  @Post('sms')
  @HttpCode(HttpStatus.CREATED)
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    return await this.notificationsService.sendSms(sendSmsDto);
  }
} 