import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

// Silenciar advertencia del particionador de KafkaJS
process.env.KAFKAJS_NO_PARTITIONER_WARNING = '1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar CORS
  app.enableCors();

  // Configurar prefijo global
  app.setGlobalPrefix('api/v1');

  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 3002;
  await app.listen(port);

  logger.log(`🚀 Service Profiling ejecutándose en el puerto ${port}`);

  logger.log(
    `📊 Health check: http://localhost:${port}/api/v1/profiling/health`,
  );
}

bootstrap();
