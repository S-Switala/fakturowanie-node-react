import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    try {
      // Lekki ping do bazy — „budzi” połączenie przy zimnym starcie
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch {
      // Front może wtedy zrobić retry po chwili
      throw new ServiceUnavailableException('Service warming up');
    }
  }
}
