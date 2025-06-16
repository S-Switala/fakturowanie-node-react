import { Injectable } from '@nestjs/common';
import { PrismaClient, Invoice, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class InvoicesService {
  async create(
    data: {
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
    userId: string,
  ) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    let attempts = 0;

    while (attempts < 5) {
      const count = await prisma.invoice.count({
        where: {
          userId,
          number: {
            endsWith: `/${month}/${year}`,
          },
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
            status: data.status,
            clientId: data.clientId,
            userId,
            number,
            dueDate: parsedDueDate,
            amount: totalAmount,
            items: {
              create: itemsWithTotals,
            },
          },
          include: {
            items: true,
          },
        });
      } catch (err) {
        if (err.code === 'P2002' && err.meta?.target?.includes('number')) {
          attempts++;
          continue;
        }
        throw err;
      }
    }

    throw new Error('Nie udało się wygenerować unikalnego numeru faktury');
  }

  async update(id: string, userId: string, data: Partial<Invoice>) {
    return prisma.invoice.updateMany({
      where: { id, userId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paymentMethod: data.paymentMethod ?? undefined,
      },
    });
  }

  async delete(id: string, userId: string) {
    return prisma.invoice.deleteMany({
      where: { id, userId },
    });
  }

  async findAll(userId: string) {
    return prisma.invoice.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByUser(userId: string, query: any) {
    const { status, clientId, sortBy, order } = query;

    const whereClause: any = { userId };

    if (status && status !== '') {
      whereClause.status = status;
    }

    if (clientId && clientId !== '') {
      whereClause.clientId = clientId;
    }

    const sortOptions =
      sortBy && order
        ? {
            [sortBy]: order === 'desc' ? 'desc' : 'asc',
          }
        : undefined;

    console.log('WHERE:', whereClause);
    console.log('ORDER:', sortOptions);

    return prisma.invoice.findMany({
      where: whereClause,
      orderBy: sortOptions,
      include: {
        client: true,
      },
    });
  }

  async getInvoiceWithClient(id: string, userId: string) {
    return prisma.invoice.findFirst({
      where: { id, userId },
      include: { client: true, user: true },
    });
  }
}
