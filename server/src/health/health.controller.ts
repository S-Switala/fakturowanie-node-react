import { Controller, Get, Query, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health(@Query('deep') deep?: string) {
    try {
      // szybki ping (otwiera połączenie)
      await this.prisma.$queryRaw`SELECT 1`;

      if (deep) {
        // „cięższe” zapytanie – sprawia, że Query Engine jest w pełni gotowy
        await this.prisma.user.count();
      }
      return { ok: true };
    } catch {
      throw new ServiceUnavailableException('Service warming up');
    }
  }
}
