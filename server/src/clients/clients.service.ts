import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ClientsService {
  async create(
    clientData: {
      name: string;
      email: string;
      street: string;
      houseNumber: string;
      postalCode: string;
      city: string;
      pesel: string;
    },
    userId: string,
  ) {
    return prisma.client.create({
      data: {
        ...clientData,
        userId,
      },
    });
  }

  async findAllByUser(userId: string) {
    return prisma.client.findMany({
      where: { userId },
    });
  }

  async updateClient(
    id: string,
    userId: string,
    data: { name?: string; email?: string; address?: string },
  ) {
    return prisma.client.updateMany({
      where: { id, userId },
      data,
    });
  }

  async deleteClient(id: string, userId: string) {
    return prisma.client.deleteMany({
      where: { id, userId },
    });
  }
}
