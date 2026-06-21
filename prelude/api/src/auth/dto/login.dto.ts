import { IsString, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, { message: 'phone must be a valid phone number' })
  phone: string;

  @IsString()
  @MaxLength(10)
  otp: string;
}
