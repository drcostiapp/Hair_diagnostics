import { IsUUID } from 'class-validator';

export class PurchaseTicketDto {
  @IsUUID()
  event_id: string;
}
