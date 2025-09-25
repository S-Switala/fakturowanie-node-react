import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Length,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { $Enums } from '@prisma/client'; // typy Prisma (compile-time)

// DOPASUJ do schema.prisma:
export enum InvoiceStatusDTO {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethodDTO {
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

class InvoiceItemInputDto {
  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  unit!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateInvoiceDto {
  @IsString()
  title!: string;

  @IsEnum(InvoiceStatusDTO)
  status!: $Enums.InvoiceStatus;

  @IsString()
  clientId!: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsEnum(PaymentMethodDTO)
  paymentMethod?: $Enums.PaymentMethod | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemInputDto)
  items!: InvoiceItemInputDto[];
}
