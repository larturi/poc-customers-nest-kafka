import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

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
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Service Customer ejecutándose en puerto ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/v1/customers/health`);
  console.log(`📋 API Documentation: http://localhost:${port}/api/v1/customers`);
}

bootstrap(); 