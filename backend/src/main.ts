/** Created by Pawel Malek **/
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './AppModule';
import { createMyLogger } from 'global/Logger';

export const GlobalLogger = new Logger('GLOBAL');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: createMyLogger(),
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : true,
      exposedHeaders: ['Content-Disposition'],
      credentials: true,
    },
  });


  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('JobHigh API')
    .setDescription('High-Altitude Work Professional Network Platform API')
    .setVersion('1.0')
    .addTag('dictionaries')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3100;
  await app.listen(port);

  GlobalLogger.log(`Application is running on port ${port}`);
}

bootstrap();
