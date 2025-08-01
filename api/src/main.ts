import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase global body size limit BEFORE applying global pipes or middlewares
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  // Enable CORS (must be first middleware)
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Add global validation pipe with transform enabled
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Serve static files from uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // DO NOT add bodyParser.json or bodyParser.urlencoded here!

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('RestoLover API')
    .setDescription('The RestoLover API description')
    .setVersion('1.0')
    .addTag('restaurants')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}
bootstrap(); 