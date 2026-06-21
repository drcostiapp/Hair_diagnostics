import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserRecord } from '../common/types';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<UserRecord> {
    const user = await this.db.one<UserRecord>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getMe(id: string) {
    return this.sanitize(await this.findById(id));
  }

  async update(id: string, dto: UpdateUserDto) {
    const allowed = ['name', 'age', 'gender', 'orientation', 'interests', 'bio'];
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const key of allowed) {
      const value = (dto as Record<string, any>)[key];
      if (value === undefined) continue;
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }

    if (fields.length === 0) {
      return this.getMe(id);
    }

    values.push(id);
    const user = await this.db.one<UserRecord>(
      `UPDATE users SET ${fields.join(', ')}, updated_at = now()
       WHERE id = $${idx} RETURNING *`,
      values,
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitize(user);
  }

  sanitize(user: UserRecord) {
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
