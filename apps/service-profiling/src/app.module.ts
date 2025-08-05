import { Module } from '@nestjs/common';
import { KafkaModule } from '@shared/kafka';
import { ProfilingController } from './profiling/profiling.controller';
import { ProfilingService } from './profiling/profiling.service';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'service-profiling',
      groupId: 'profiling-group',
      topics: {
        emit: ['customer.profiled'],
        consume: ['customer.onboarded', 'customer.activated']
      }
    })
  ],
  controllers: [ProfilingController],
  providers: [ProfilingService],
})
export class AppModule {} 