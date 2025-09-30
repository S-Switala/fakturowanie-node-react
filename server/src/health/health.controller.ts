// src/health/health.controller.ts
import {
  Controller,
  Get,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health(@Query('deep') deep?: string) {
    try {
      // szybki ping (króciutki, żeby od razu zwrócić 200)
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      // jeśli nawet SELECT 1 nie przechodzi — powiedz frontowi, by spróbował ponownie
      throw new ServiceUnavailableException('Service warming up');
    }

    // „głębszy” warmup — NIE BLOKUJ ODPOWIEDZI
    if (deep) {
      setTimeout(() => {
        void this.prisma.user.count().catch(() => {
          // ignoruj błąd: to tylko rozgrzewka
        });
      }, 0);
    }

    return { ok: true };
  }
}
