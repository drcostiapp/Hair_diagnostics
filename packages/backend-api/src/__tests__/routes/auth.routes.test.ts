import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { app } from '../../app.js'

vi.mock('../../db/connection.js', () => ({
  db: { query: vi.fn(), on: vi.fn() }
}))

vi.mock('uuid', () => ({ v4: () => 'new-user-id' }))

import { db } from '../../db/connection.js'

const mockQuery = vi.mocked(db.query)

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('JWT_SECRET', 'test-secret-key-for-auth')
  })

  describe('POST /api/auth/login', () => {
    it('returns tokens on valid email login', async () => {
      const hash = await bcrypt.hash('password123', 12)
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'p1', email: 'test@test.com', phone: null,
          password_hash: hash, first_name: 'John', last_name: 'Doe', language: 'en'
        }],
        rowCount: 1
      } as any)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
      expect(res.body.data.patient.firstName).toBe('John')
    })

    it('returns 401 on wrong password', async () => {
      const hash = await bcrypt.hash('correct', 12)
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'p1', email: 'a@b.com', password_hash: hash }],
        rowCount: 1
      } as any)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'a@b.com', password: 'wrong-password' })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('returns 401 when user not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'pass123' })

      expect(res.status).toBe(401)
    })

    it('returns 400 when email and phone are both missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'pass123' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/register', () => {
    it('creates a new patient and returns tokens', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any)

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@test.com',
          password: 'secure123',
          firstName: 'Jane',
          lastName: 'Smith'
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.patient.id).toBe('new-user-id')
      expect(res.body.data.accessToken).toBeDefined()
    })

    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'a@b.com' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('returns new tokens for a valid refresh token', async () => {
      const jwt = await import('jsonwebtoken')
      const refreshToken = jwt.default.sign(
        { sub: 'p1', type: 'refresh' },
        'test-secret-key-for-auth',
        { expiresIn: 604800 }
      )

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })

      expect(res.status).toBe(200)
      expect(res.body.data.accessToken).toBeDefined()
    })

    it('returns 400 when refresh token is missing', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({})

      expect(res.status).toBe(400)
    })
  })
})
