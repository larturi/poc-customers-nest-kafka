import { Module } from '@nestjs/common';
import { KafkaModule } from '@shared/kafka';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'service-customer',
      groupId: 'customers-group',
      topics: {
        emit: ['customer.onboarded', 'customer.activated', 'customer.deactivated', 'customer.promoted'],
        consume: ['notification.sent']
      }
    })
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class AppModule {}
