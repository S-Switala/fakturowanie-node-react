import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module'; // ✅ zamiast './users.service'

@Module({
  imports: [
    UserModule, // ✅ wstrzyknie UsersService z UsersModule
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: process.env.JWT_EXPIRES ?? '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // ❌ bez UsersService tutaj
  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule {}
