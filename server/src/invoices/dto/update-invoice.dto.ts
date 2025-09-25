import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type { $Enums } from '@prisma/client';
import { InvoiceStatusDTO, PaymentMethodDTO } from './create-invoice.dto';

class InvoiceItemUpdateDto {
  @IsOptional()
  @IsString()
  id?: string; // OK – i tak ignorujesz w serwisie

  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  unit!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(InvoiceStatusDTO)
  status?: $Enums.InvoiceStatus;

  // '' -> undefined (nie aktualizuj w ogóle), null -> przejdzie do serwisu
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsEnum(PaymentMethodDTO)
  paymentMethod?: $Enums.PaymentMethod | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemUpdateDto)
  items!: InvoiceItemUpdateDto[];
}
