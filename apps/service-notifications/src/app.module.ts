import { Module } from '@nestjs/common';
import { KafkaModule } from '@shared/kafka';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'service-notifications',
      groupId: 'notifications-group',
      topics: {
        consume: ['customer.onboarded', 'customer.activated', 'customer.promoted']
      }
    })
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class AppModule {} 