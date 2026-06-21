import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { JwtPayload, UserRecord } from '../common/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private isAdminPhone(phone: string): boolean {
    const admins = this.config.get<string[]>('adminPhones') || [];
    return admins.includes(phone);
  }

  private async sign(user: UserRecord): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      is_admin: user.is_admin,
    };
    return this.jwt.signAsync(payload);
  }

  async register(dto: RegisterDto) {
    const existing = await this.db.one<UserRecord>(
      'SELECT id FROM users WHERE phone = $1',
      [dto.phone],
    );
    if (existing) {
      throw new ConflictException('Phone already registered');
    }

    const isAdmin = this.isAdminPhone(dto.phone);
    // OTP is mocked: registration self-verifies the phone in this demo.
    const user = await this.db.one<UserRecord>(
      `INSERT INTO users
         (name, phone, age, gender, orientation, interests, bio,
          verification_status, phone_verified, is_admin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'verified',true,$8)
       RETURNING *`,
      [
        dto.name,
        dto.phone,
        dto.age,
        dto.gender,
        dto.orientation,
        dto.interests ?? [],
        dto.bio ?? null,
        isAdmin,
      ],
    );
    if (!user) {
      throw new ConflictException('Could not create user');
    }

    const token = await this.sign(user);
    return { token, user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const requiredOtp = this.config.get<string | null>('mockOtp');
    // null => accept any code; otherwise the code must match.
    if (requiredOtp !== null && dto.otp !== requiredOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const user = await this.db.one<UserRecord>(
      'SELECT * FROM users WHERE phone = $1',
      [dto.phone],
    );
    if (!user) {
      throw new UnauthorizedException('No account for that phone');
    }

    // Promote to admin if the phone is now configured as admin.
    if (this.isAdminPhone(user.phone) && !user.is_admin) {
      await this.db.query('UPDATE users SET is_admin = true WHERE id = $1', [
        user.id,
      ]);
      user.is_admin = true;
    }

    const token = await this.sign(user);
    return { token, user: this.sanitize(user) };
  }

  private sanitize(user: UserRecord) {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
      orientation: user.orientation,
      interests: user.interests,
      bio: user.bio,
      verification_status: user.verification_status,
      phone_verified: user.phone_verified,
      is_admin: user.is_admin,
    };
  }
}
