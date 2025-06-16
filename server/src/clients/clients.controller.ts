import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(
    @Body()
    body: {
      name: string;
      email: string;
      street: string;
      houseNumber: string;
      postalCode: string;
      city: string;
      pesel: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.clientsService.create(body, user.userId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.clientsService.findAllByUser(user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; address?: string },
    @CurrentUser() user: any,
  ) {
    return this.clientsService.updateClient(id, user.userId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.clientsService.deleteClient(id, user.userId);
  }
}
