import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { authenticate } from '../../middleware/auth.js'

const TEST_SECRET = 'test-jwt-secret-key'

function mockReq(authHeader?: string): Request {
  return { headers: { authorization: authHeader } } as Request
}

function mockRes(): Response {
  return {} as Response
}

describe('authenticate middleware', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', TEST_SECRET)
  })

  it('sets userId and userEmail from a valid token', () => {
    const token = jwt.sign({ sub: 'user-1', email: 'test@example.com' }, TEST_SECRET)
    const req = mockReq(`Bearer ${token}`)
    const next = vi.fn()

    authenticate(req, mockRes(), next)

    expect(req.userId).toBe('user-1')
    expect(req.userEmail).toBe('test@example.com')
    expect(next).toHaveBeenCalledOnce()
  })

  it('throws when Authorization header is missing', () => {
    const req = mockReq(undefined)
    const next = vi.fn()

    expect(() => authenticate(req, mockRes(), next)).toThrow('Authentication required')
    expect(next).not.toHaveBeenCalled()
  })

  it('throws when Authorization header has wrong scheme', () => {
    const req = mockReq('Basic abc123')
    const next = vi.fn()

    expect(() => authenticate(req, mockRes(), next)).toThrow('Authentication required')
  })

  it('throws on an expired token', () => {
    const token = jwt.sign({ sub: 'user-1' }, TEST_SECRET, { expiresIn: -10 })
    const req = mockReq(`Bearer ${token}`)
    const next = vi.fn()

    expect(() => authenticate(req, mockRes(), next)).toThrow('Invalid or expired token')
  })

  it('throws on a token signed with wrong secret', () => {
    const token = jwt.sign({ sub: 'user-1' }, 'wrong-secret')
    const req = mockReq(`Bearer ${token}`)
    const next = vi.fn()

    expect(() => authenticate(req, mockRes(), next)).toThrow('Invalid or expired token')
  })

  it('throws when JWT_SECRET is not configured', () => {
    vi.stubEnv('JWT_SECRET', '')
    const token = jwt.sign({ sub: 'user-1' }, 'any')
    const req = mockReq(`Bearer ${token}`)
    const next = vi.fn()

    expect(() => authenticate(req, mockRes(), next)).toThrow('JWT secret not configured')
  })
})
