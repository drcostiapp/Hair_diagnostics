import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthedUser } from '../common/types';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Post('purchase')
  async purchase(
    @CurrentUser() user: AuthedUser,
    @Body() dto: PurchaseTicketDto,
  ) {
    const ticket = await this.tickets.purchase(user.id, dto.event_id);
    return { ticket };
  }
}
