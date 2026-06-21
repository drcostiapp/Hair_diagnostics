import { IsUUID } from 'class-validator';

export class FeedQueryDto {
  @IsUUID()
  event_id: string;
}
