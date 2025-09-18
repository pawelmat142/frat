/** Created by Pawel Malek **/
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './AppModule';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    credentials: true,
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
  // TODO po co i co to ten swagger
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

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
