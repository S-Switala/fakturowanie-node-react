import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // do 5 prób połączenia, rosnący backoff
    for (let i = 0; i < 5; i++) {
      try {
        await this.$connect();
        return;
      } catch (e: any) {
        if (e?.code !== 'P1001') throw e; // inne błędy wypuść
        const ms = 500 * (i + 1);
        console.warn(`[Prisma] P1001, retry in ${ms}ms...`);
        await sleep(ms);
      }
    }
    // ostatnia próba — jeśli się nie uda, niech poleci błąd
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
