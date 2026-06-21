import { IsUUID } from 'class-validator';

export class SwipeDto {
  @IsUUID()
  event_id: string;

  @IsUUID()
  target_user_id: string;
}
