import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Response } from 'express';
import { PdfService } from '../pdf/pdf.service';
import { JwtService } from '@nestjs/jwt';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfService: PdfService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    body: {
      title: string;
      status: string;
      clientId: string;
      dueDate: string;
      items: {
        name: string;
        quantity: number;
        unit: string;
        price: number;
      }[];
    },
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.create(body, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.invoicesService.findAllByUser(user.userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body, @CurrentUser() user: any) {
    return this.invoicesService.update(id, user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.delete(id, user.userId);
  }

  @Get(':id/pdf')
  async generatePdf(
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      const invoice = await this.invoicesService.getInvoiceWithClient(
        id,
        userId,
      );

      if (!invoice || !invoice.user || !invoice.client) {
        return res
          .status(404)
          .send('Brak wymaganych danych do wygenerowania PDF');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=faktura.pdf');

      this.pdfService.generateInvoicePDF(invoice, res);
    } catch (err) {
      console.error('Błąd JWT lub PDF:', err.message);
      if (!res.headersSent) {
        return res.status(401).send('Unauthorized');
      }
    }
  }
}
