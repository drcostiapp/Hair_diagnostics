import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthedUser } from './types';

/**
 * Requires JwtAuthGuard to have run first (populates req.user).
 * Admin = is_admin flag on the JWT (set when phone is in ADMIN_PHONE).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const user = (req as any).user as AuthedUser | undefined;
    if (!user || !user.is_admin) {
      throw new ForbiddenException('Admin privileges required');
    }
    return true;
  }
}
