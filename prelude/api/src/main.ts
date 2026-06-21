import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({ origin: '*' });

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
  Logger.log(`PRELUDE API listening on :${port}`, 'Bootstrap');
}

bootstrap();
