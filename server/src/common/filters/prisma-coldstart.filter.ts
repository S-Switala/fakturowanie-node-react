// src/common/filters/prisma-coldstart.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientKnownRequestError,
)
export class PrismaColdStartFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // P1001 = DB niedostępna (zimny start / brak połączenia)
    const isColdStart =
      exception?.code === 'P1001' ||
      exception instanceof Prisma.PrismaClientInitializationError;

    if (!isColdStart) {
      // nie dotykamy innych błędów – pozwalamy innym handlerom je obsłużyć
      throw exception;
    }

    const res = host.switchToHttp().getResponse();
    return res
      .status(503)
      .json({ message: 'Service warming up, retry shortly' });
  }
}
