import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  venue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price_cents?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
