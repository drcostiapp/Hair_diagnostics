import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AdminGuard } from '../common/admin.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthedUser } from '../common/types';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list() {
    return this.events.list();
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.events.getById(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@CurrentUser() user: AuthedUser, @Body() dto: CreateEventDto) {
    return this.events.create(user.id, dto);
  }

  @Get(':id/attendees')
  attendees(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthedUser,
  ) {
    return this.events.getAttendees(id, user.id);
  }

  @Post(':id/checkin')
  checkin(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthedUser,
  ) {
    return this.events.checkin(id, user.id);
  }
}
