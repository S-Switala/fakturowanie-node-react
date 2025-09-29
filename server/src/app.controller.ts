import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async health() {
    try {
      // lekki ping do DB — pomaga przy „cold start”
      await this.prisma.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch (e) {
      // front może wtedy spróbować ponownie (503)
      throw new ServiceUnavailableException('Service warming up');
    }
  }
}
