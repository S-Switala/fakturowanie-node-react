import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { Prisma, $Enums } from '@prisma/client';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

const prisma = new PrismaClient();
// (Docelowo lepiej wstrzykiwać PrismaService, ale zostawiam Twoją strukturę)

@Injectable()
export class InvoicesService {
  async create(data: CreateInvoiceDto, userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    let attempts = 0;

    while (attempts < 5) {
      const count = await prisma.invoice.count({
        where: {
          userId,
          number: { endsWith: `/${month}/${year}` },
        },
      });

      const serial = String(count + 1 + attempts).padStart(4, '0');
      const number = `${serial}/${month}/${year}`;

      const parsedDueDate = new Date(data.dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        throw new Error('Nieprawidłowy termin płatności');
      }

      const itemsWithTotals = data.items.map((item, i) => ({
        ...item,
        lp: i + 1,
        total: item.price * item.quantity,
      }));

      const totalAmount = itemsWithTotals.reduce(
        (sum, item) => sum + item.total,
        0,
      );

      try {
        return await prisma.invoice.create({
          data: {
            title: data.title,
            status: data.status, // $Enums.InvoiceStatus
            clientId: data.clientId,
            userId,
            number,
            dueDate: parsedDueDate,
            amount: totalAmount,
            paymentMethod: data.paymentMethod ?? null, // | null w create
            items: { create: itemsWithTotals },
          },
          include: { items: true },
        });
      } catch (err) {
        if (err?.code === 'P2002' && err?.meta?.target?.includes('number')) {
          attempts++;
          continue;
        }
        throw err;
      }
    }

    throw new Error('Nie udało się wygenerować unikalnego numeru faktury');
  }

  async updateInvoiceWithItems(
    id: string,
    userId: string,
    data: UpdateInvoiceDto,
  ) {
    const itemsWithTotals = data.items.map((item, i) => {
      const cleaned: any = { ...item };
      delete cleaned.id;
      delete cleaned.invoiceId;
      delete cleaned.createdAt;

      return {
        ...cleaned,
        lp: i + 1,
        total: cleaned.price * cleaned.quantity,
      };
    });

    if (itemsWithTotals.length === 0) {
      throw new Error('Faktura musi zawierać co najmniej jedną pozycję.');
    }

    const totalAmount = itemsWithTotals.reduce(
      (sum, item) => sum + item.total,
      0,
    );

    return prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

      return tx.invoice.update({
        where: { id, userId },
        data: {
          title: data.title,
          status: data.status, // $Enums.InvoiceStatus | undefined
          dueDate:
            data.dueDate === undefined
              ? undefined
              : data.dueDate
                ? new Date(data.dueDate)
                : null,
          paymentMethod:
            data.paymentMethod === undefined
              ? undefined // nie aktualizuj pola
              : data.paymentMethod, // $Enums.PaymentMethod | null
          amount: totalAmount,
          items: { create: itemsWithTotals },
        },
        include: { items: true },
      });
    });
  }

  async delete(id: string, userId: string) {
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    return prisma.invoice.deleteMany({ where: { id, userId } });
  }

  async findAll(userId: string) {
    return prisma.invoice.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByUser(userId: string, query: any) {
    const { status, clientId, sortBy, order } = query as {
      status?: string;
      clientId?: string;
      sortBy?: string;
      order?: 'asc' | 'desc';
    };

    const whereClause: Prisma.InvoiceWhereInput = { userId };

    if (typeof status === 'string' && status !== '') {
      // jeśli chcesz twardą walidację, zmapuj/zweryfikuj do jednego z dozwolonych
      whereClause.status = status as $Enums.InvoiceStatus;
    }

    if (typeof clientId === 'string' && clientId !== '') {
      whereClause.clientId = clientId;
    }

    const sortOptions =
      sortBy && order
        ? ({
            [sortBy]: order === 'desc' ? 'desc' : 'asc',
          } as Prisma.InvoiceOrderByWithRelationInput)
        : undefined;

    return prisma.invoice.findMany({
      where: whereClause,
      orderBy: sortOptions,
      include: { client: true, items: true },
    });
  }

  async getInvoiceWithClient(id: string, userId: string) {
    return prisma.invoice.findFirst({
      where: { id, userId },
      include: { client: true, user: true, items: true },
    });
  }
}
