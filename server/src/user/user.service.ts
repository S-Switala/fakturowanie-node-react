import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
        updatedAt: true,
      },
    });
  }

  private toTrimmed(v?: string) {
    return typeof v === 'string' ? v.trim() : undefined;
  }
  private toNullable(v?: string | null) {
    const t = typeof v === 'string' ? v.trim() : (v ?? null);
    return t === '' ? null : t;
  }

  async updateUser(id: string, data: Partial<UpdateUserDto>) {
    // zbuduj obiekt tylko z przesłanych pól (Prisma ignoruje `undefined`)
    const normalized: Prisma.UserUpdateInput = {
      // wymagane w modelu
      ...(data.fullName !== undefined && {
        fullName: this.toTrimmed(data.fullName),
      }),
      ...(data.street !== undefined && { street: this.toTrimmed(data.street) }),
      ...(data.houseNumber !== undefined && {
        houseNumber: this.toTrimmed(data.houseNumber),
      }),
      ...(data.postalCode !== undefined && {
        postalCode: this.toTrimmed(data.postalCode),
      }),
      ...(data.city !== undefined && { city: this.toTrimmed(data.city) }),

      // opcjonalne: "" -> null (m.in. NIP)
      ...(data.companyName !== undefined && {
        companyName: this.toNullable(data.companyName),
      }),
      ...(data.nip !== undefined && { nip: this.toNullable(data.nip) }),
      ...(data.bank !== undefined && { bank: this.toNullable(data.bank) }),
      ...(data.account !== undefined && {
        account: this.toNullable(data.account),
      }),
      ...(data.phoneNumber !== undefined && {
        phoneNumber: this.toNullable(data.phoneNumber),
      }),
    };

    // jeśli nic nie przyszło – zwróć aktualny stan
    if (Object.keys(normalized).length === 0) {
      return this.getUserById(id);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: normalized,
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
          updatedAt: true,
        },
      });
    } catch (err: any) {
      // ładne mapowanie konfliktów unikalności
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const target = Array.isArray(err.meta?.target)
          ? err.meta.target[0]
          : err.meta?.target;
        if (target === 'email')
          throw new ConflictException('E-mail jest już zajęty');
        if (target === 'nip')
          throw new ConflictException('NIP jest już używany');
        throw new ConflictException('Konflikt unikalności danych');
      }
      throw err;
    }
  }
}
