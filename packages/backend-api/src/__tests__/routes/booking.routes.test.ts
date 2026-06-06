import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { app } from '../../app.js'

vi.mock('../../db/connection.js', () => ({
  db: { query: vi.fn(), on: vi.fn() }
}))

vi.mock('../../services/notification.service.js', () => ({
  notificationService: {
    sendBookingConfirmation: vi.fn()
  }
}))

vi.mock('uuid', () => ({ v4: () => 'booking-id-1' }))

import { db } from '../../db/connection.js'
import { notificationService } from '../../services/notification.service.js'

const mockQuery = vi.mocked(db.query)
const SECRET = 'test-booking-secret'

function authToken(userId = 'patient-1') {
  return jwt.sign({ sub: userId, email: 'p@test.com' }, SECRET)
}

describe('Booking Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('JWT_SECRET', SECRET)
  })

  describe('POST /api/bookings', () => {
    it('creates a booking and triggers notification', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any)

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken()}`)
        .send({
          preferredDate: '2025-04-01',
          preferredTime: '14:00',
          location: 'Beirut Clinic',
          notes: 'First visit'
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe('booking-id-1')
      expect(res.body.data.status).toBe('pending')

      expect(notificationService.sendBookingConfirmation).toHaveBeenCalledWith(
        'patient-1',
        expect.objectContaining({
          bookingId: 'booking-id-1',
          location: 'Beirut Clinic'
        })
      )
    })

    it('returns 401 without auth token', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          preferredDate: '2025-04-01',
          preferredTime: '14:00',
          location: 'Clinic'
        })

      expect(res.status).toBe(401)
    })

    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken()}`)
        .send({ notes: 'only notes' })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/bookings', () => {
    it('lists bookings for authenticated patient', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { id: 'b1', status: 'pending', scheduled_at: '2025-04-01T14:00', location: 'Beirut' }
        ],
        rowCount: 1
      } as any)

      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${authToken()}`)

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].id).toBe('b1')
    })
  })
})
