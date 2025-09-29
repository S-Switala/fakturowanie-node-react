import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PrismaColdStartFilter } from './common/filters/prisma-coldstart.filter';

function parseList(name: string, fallback: string[] = []) {
  return (process.env[name]?.split(',') ?? fallback)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
  });

  app.set('trust proxy', 1);
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaColdStartFilter());

  const origins = parseList('CORS_ORIGINS', ['http://localhost:5173']);
  app.enableCors({
    origin: (origin, cb) =>
      !origin || origins.includes(origin)
        ? cb(null, true)
        : cb(new Error('CORS'), false),
    credentials: false, // Bearer: nie wysyłamy cookies
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization', // <— ważne
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
