import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name: string;

  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'phone must be a valid phone number' })
  phone: string;

  @IsInt()
  @Min(18)
  @Max(120)
  age: number;

  @IsString()
  @MaxLength(40)
  gender: string;

  @IsString()
  @MaxLength(40)
  orientation: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(30)
  @IsOptional()
  interests?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}
