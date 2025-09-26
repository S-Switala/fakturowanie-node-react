import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service'; // <- Twój serwis z extends PrismaClient

function toNullable(v?: string | null): string | null {
  const t = (v ?? '').trim();
  return t === '' ? null : t;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService, // <-- wstrzykiwany
  ) {}

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    companyName?: string;
    nip?: string;
    bank?: string;
    account?: string;
    phoneNumber?: string;
  }) {
    const email = data.email.trim().toLowerCase();
    const hashed = await bcrypt.hash(data.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: hashed, // @map("password") w schemacie
          fullName: data.fullName.trim(),
          street: data.street.trim(),
          houseNumber: data.houseNumber.trim(),
          postalCode: data.postalCode.trim(),
          city: data.city.trim(),

          companyName: toNullable(data.companyName),
          nip: toNullable(data.nip), // "" -> null, żeby @unique na NIP nie wywalał 409
          bank: toNullable(data.bank),
          account: toNullable(data.account),
          phoneNumber: toNullable(data.phoneNumber),
        },
        select: { id: true, email: true },
      });

      return this.signToken(user.id, user.email);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        // meta.target może być stringiem albo tablicą
        const target = Array.isArray(err.meta?.target)
          ? err.meta?.target[0]
          : (err.meta as any)?.target;
        if (target === 'email')
          throw new ConflictException('Użytkownik z tym e-mailem już istnieje');
        if (target === 'nip')
          throw new ConflictException('NIP jest już używany');
        throw new ConflictException('Konflikt danych (unikalność)');
      }
      throw err;
    }
  }

  async login(emailInput: string, password: string) {
    const email = emailInput.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email);
  }

  private signToken(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      // jeśli masz ConfigService/JWT_EXPIRES, możesz dodać { expiresIn: cfg.get('JWT_EXPIRES') }
    );
    return { access_token: accessToken, accessToken, token: accessToken };
  }
}
