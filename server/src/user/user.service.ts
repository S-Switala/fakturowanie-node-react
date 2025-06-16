import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        nip: true,
        street: true,
        houseNumber: true,
        postalCode: true,
        city: true,
        bank: true,
        account: true,
        phoneNumber: true,
      },
    });
  }

  async updateUser(id: string, data: Partial<UpdateUserDto>) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
