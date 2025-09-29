import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
    InvoicesModule,
    PrismaModule,
    UserModule,
    HealthModule,
  ],
})
export class AppModule {}
