import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PrismaColdStartFilter } from './common/filters/prisma-coldstart.filter';

function parseList(name: string, fallback: string[] = []) {
  const raw = process.env[name];
  if (!raw || !raw.trim()) return fallback;
  return raw
    .split(',')
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

  // jawna lista z ENV + domyślnie Netlify prod
  const allowed = parseList('CORS_ORIGINS', [
    'http://localhost:5173',
    'https://fakturowanie.netlify.app',
  ]);

  // pozwól też na Netlify deploy/branch previews dla tej domeny
  const netlifyAny =
    /^https:\/\/(?:deploy-preview-\d+--|[a-z0-9-]+--)fakturowanie\.netlify\.app$/;

  app.enableCors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/Postman
      if (allowed.includes(origin) || netlifyAny.test(origin))
        return cb(null, true);
      return cb(new Error(`CORS: ${origin} not allowed`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // używasz Bearer, więc cookies niepotrzebne
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
