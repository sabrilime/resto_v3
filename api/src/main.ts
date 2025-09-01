import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const loggerLevels: (keyof typeof Logger['prototype'])[] = isProd
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug', 'verbose'];

  const app = await NestFactory.create(AppModule, { logger: loggerLevels as any });
  const logger = new Logger('Bootstrap');

  // Increase global body size limit BEFORE applying global pipes or middlewares
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  // Enable CORS (must be first middleware)
  // Get CORS origins from environment variables
  const corsOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001']; // fallback for development
  
  app.enableCors({
    origin: corsOrigins,
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
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation is available at: http://localhost:${port}/api`);
}
bootstrap(); 
