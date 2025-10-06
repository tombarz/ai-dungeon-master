import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn']
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(json({ limit: '1mb' }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((value) => value.trim()).filter(Boolean) ?? '*',
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS']
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`API server running at http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
