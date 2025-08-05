import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CustomersController } from './customers/customers.controller'
import { CustomersService } from './customers/customers.service'
import { KafkaModule } from './kafka/kafka.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    KafkaModule.forRoot({
      clientId: 'service-customer',
      groupId: 'customers-group'
    })
  ],
  controllers: [CustomersController],
  providers: [CustomersService]
})
export class AppModule {}
