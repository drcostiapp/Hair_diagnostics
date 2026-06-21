import { IsUUID } from 'class-validator';

export class BlockDto {
  @IsUUID()
  target_user_id: string;
}
