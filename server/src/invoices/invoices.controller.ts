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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfService: PdfService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.create(dto, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.invoicesService.findAllByUser(user.userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.updateInvoiceWithItems(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.delete(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/pdf')
  async generatePdf(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const invoice = await this.invoicesService.getInvoiceWithClient(
      id,
      user.userId,
    );
    if (!invoice || !invoice.user || !invoice.client) {
      return res
        .status(404)
        .json({ error: 'Invoice not found or missing relations' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=faktura-${invoice.number}.pdf`,
    );

    this.pdfService.generateInvoicePDF(invoice, res);
  }
}
