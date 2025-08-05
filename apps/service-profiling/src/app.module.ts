import { Module } from '@nestjs/common';
import { ProfilingController } from './profiling/profiling.controller';
import { ProfilingService } from './profiling/profiling.service';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    KafkaModule.forRoot({
      clientId: 'service-profiling',
      groupId: 'profiling-group',
    }),
  ],
  controllers: [ProfilingController],
  providers: [ProfilingService],
})
export class AppModule {} 