import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors();
  
  // Configurar prefijo global
  app.setGlobalPrefix('api/v1');
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`🚀 Service Profiling ejecutándose en puerto ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap(); 