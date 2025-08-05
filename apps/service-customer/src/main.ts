import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  // Configurar CORS
  app.enableCors()

  // Configurar prefijo global
  app.setGlobalPrefix('api/v1')

  const logger = new Logger('Bootstrap')

  const port = process.env.PORT || 3001
  await app.listen(port)

  logger.log(`🚀 Service Customer ejecutándose en puerto ${port}`)

  logger.log(
    `📊 Health check: http://localhost:${port}/api/v1/customers/health`
  )
}

bootstrap()
