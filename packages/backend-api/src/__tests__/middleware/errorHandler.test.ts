import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { AppError, errorHandler } from '../../middleware/errorHandler.js'

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  }
  return res as unknown as Response
}

const mockReq = {} as Request
const mockNext = vi.fn() as NextFunction

describe('AppError', () => {
  it('stores statusCode, code, and message', () => {
    const err = new AppError(404, 'NOT_FOUND', 'Resource not found')

    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('Resource not found')
    expect(err.name).toBe('AppError')
    expect(err).toBeInstanceOf(Error)
  })
})

describe('errorHandler', () => {
  it('formats AppError correctly', () => {
    const err = new AppError(422, 'INVALID_INPUT', 'Bad data')
    const res = createMockRes()

    errorHandler(err, mockReq, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Bad data' }
    })
  })

  it('formats ZodError as 400 VALIDATION_ERROR', () => {
    const err = new Error('Validation failed')
    err.name = 'ZodError'
    ;(err as any).errors = [{ path: ['email'], message: 'Required' }]
    const res = createMockRes()

    errorHandler(err, mockReq, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: [{ path: ['email'], message: 'Required' }]
      }
    })
  })

  it('formats JWT errors as 401', () => {
    const err = new Error('jwt expired')
    err.name = 'TokenExpiredError'
    const res = createMockRes()

    errorHandler(err, mockReq, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Invalid or expired token' }
    })
  })

  it('returns 500 for unknown errors', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const err = new Error('Something broke')
    const res = createMockRes()

    errorHandler(err, mockReq, res, mockNext)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Something broke' }
    })
  })

  it('hides error message in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const err = new Error('Sensitive details')
    const res = createMockRes()

    errorHandler(err, mockReq, res, mockNext)

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
    })
  })
})
