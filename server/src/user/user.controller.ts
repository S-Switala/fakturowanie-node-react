import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getProfile(@CurrentUser() user: any) {
    console.log('Profil żądany przez:', user);
    return this.userService.getUserById(user.userId);
  }

  @Put()
  updateProfile(
    @CurrentUser() user: any,
    @Body() data: Partial<UpdateUserDto>,
  ) {
    return this.userService.updateUser(user.userId, data);
  }
}
