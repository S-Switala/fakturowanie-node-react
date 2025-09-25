import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    companyName: string;
    nip: string;
    bank?: string;
    account?: string;
    phoneNumber?: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const hashed = await bcrypt.hash(data.password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashed,
          fullName: data.fullName,
          street: data.street,
          houseNumber: data.houseNumber,
          postalCode: data.postalCode,
          city: data.city,
          companyName: data.companyName,
          nip: data.nip,
          bank: data.bank,
          account: data.account,
          phoneNumber: data.phoneNumber,
        },
        select: { id: true, email: true },
      });

      return this.signToken(user.id, user.email);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Użytkownik z tym e-mailem już istnieje');
      }
      throw err;
    }
  }

  async login(emailInput: string, password: string) {
    const email = emailInput.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true }, // nie pobieraj nieistniejących kolumn
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    const accessToken = this.jwtService.sign({ sub: userId, email });
    // Zwracamy pod trzema kluczami, żeby frontend „jakikolwiek” był szczęśliwy
    return {
      access_token: accessToken,
      accessToken,
      token: accessToken,
    };
  }
}
