import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthedUser } from '../common/types';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthedUser) {
    return this.users.getMe(user.id);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthedUser, @Body() dto: UpdateUserDto) {
    return this.users.update(user.id, dto);
  }
}
