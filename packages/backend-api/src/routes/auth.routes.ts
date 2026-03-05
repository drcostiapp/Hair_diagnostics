import { Router } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { db } from '../db/connection.js'
import { AppError } from '../middleware/errorHandler.js'

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  password: z.string().min(6)
}).refine((d) => d.email || d.phone, { message: 'Email or phone required' })

const registerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(8).optional(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
}).refine((d) => d.email || d.phone, { message: 'Email or phone required' })

function generateTokens(userId: string, email?: string) {
  const secret = process.env.JWT_SECRET!
  // expiresIn in seconds: 24h = 86400, 7d = 604800
  const accessToken = jwt.sign(
    { sub: userId, email },
    secret,
    { expiresIn: 86400 }
  )
  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' },
    secret,
    { expiresIn: 604800 }
  )
  return { accessToken, refreshToken }
}

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const identifier = body.email || body.phone
    const field = body.email ? 'email' : 'phone'

    const result = await db.query(
      `SELECT id, email, phone, password_hash, first_name, last_name, language
       FROM patients WHERE ${field} = $1`,
      [identifier]
    )

    if (result.rows.length === 0) {
      throw new AppError(401, 'AUTH_FAILED', 'Invalid credentials')
    }

    const patient = result.rows[0]
    const validPassword = await bcrypt.compare(body.password, patient.password_hash)
    if (!validPassword) {
      throw new AppError(401, 'AUTH_FAILED', 'Invalid credentials')
    }

    const tokens = generateTokens(patient.id, patient.email)

    res.json({
      success: true,
      data: {
        ...tokens,
        expiresIn: 86400,
        patient: {
          id: patient.id,
          email: patient.email,
          phone: patient.phone,
          firstName: patient.first_name,
          lastName: patient.last_name,
          language: patient.language
        }
      }
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/register
authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)
    const passwordHash = await bcrypt.hash(body.password, 12)
    const id = uuid()

    await db.query(
      `INSERT INTO patients (id, email, phone, password_hash, first_name, last_name, consent_given)
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [id, body.email || null, body.phone || null, passwordHash, body.firstName, body.lastName]
    )

    const tokens = generateTokens(id, body.email)

    res.status(201).json({
      success: true,
      data: {
        ...tokens,
        expiresIn: 86400,
        patient: {
          id,
          email: body.email,
          phone: body.phone,
          firstName: body.firstName,
          lastName: body.lastName,
          language: 'en'
        }
      }
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      throw new AppError(400, 'MISSING_TOKEN', 'Refresh token required')
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any
    if (payload.type !== 'refresh') {
      throw new AppError(401, 'INVALID_TOKEN', 'Not a refresh token')
    }

    const tokens = generateTokens(payload.sub, payload.email)
    res.json({ success: true, data: tokens })
  } catch (err) {
    next(err)
  }
})
