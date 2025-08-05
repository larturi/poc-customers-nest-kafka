import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'service-notifications',
      groupId: 'notifications-group',
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class AppModule {} 