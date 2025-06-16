import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PdfService } from '../pdf/pdf.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule, // <-- dodaj moduł, który eksportuje JwtModule
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, PdfService],
})
export class InvoicesModule {}
