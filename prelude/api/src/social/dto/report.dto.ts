import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ReportDto {
  @IsUUID()
  event_id: string;

  @IsUUID()
  target_user_id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason: string;
}
