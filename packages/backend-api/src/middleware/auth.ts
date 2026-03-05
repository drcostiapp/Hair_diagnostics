import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { JWTPayload } from 'shared-types'
import { AppError } from './errorHandler.js'

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      userId?: string
      userEmail?: string
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Authentication required')
  }

  const token = authHeader.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new AppError(500, 'CONFIG_ERROR', 'JWT secret not configured')
  }

  try {
    const payload = jwt.verify(token, secret) as JWTPayload
    req.userId = payload.sub
    req.userEmail = payload.email
    next()
  } catch {
    throw new AppError(401, 'AUTH_INVALID', 'Invalid or expired token')
  }
}
