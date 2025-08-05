import { Module } from '@nestjs/common';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'service-customer',
      groupId: 'customers-group',
    }),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class AppModule {} 