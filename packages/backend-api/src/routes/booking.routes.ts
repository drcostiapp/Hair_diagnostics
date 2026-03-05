import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { authenticate } from '../middleware/auth.js'
import { db } from '../db/connection.js'
import { notificationService } from '../services/notification.service.js'

export const bookingRouter = Router()

const createBookingSchema = z.object({
  treatmentId: z.string().optional(),
  preferredDate: z.string(),
  preferredTime: z.string(),
  notes: z.string().optional(),
  location: z.string()
})

// POST /api/bookings - Create a booking
bookingRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const body = createBookingSchema.parse(req.body)
    const id = uuid()
    const scheduledAt = `${body.preferredDate}T${body.preferredTime}`

    await db.query(
      `INSERT INTO bookings (id, patient_id, treatment_id, status, scheduled_at, location, notes)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6)`,
      [id, req.userId, body.treatmentId || null, scheduledAt, body.location, body.notes || null]
    )

    // Send confirmation notification
    await notificationService.sendBookingConfirmation(req.userId!, {
      bookingId: id,
      scheduledAt,
      location: body.location
    })

    res.status(201).json({
      success: true,
      data: {
        id,
        patientId: req.userId,
        status: 'pending',
        scheduledAt,
        location: body.location
      }
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/bookings - List patient bookings
bookingRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, treatment_id, status, scheduled_at, location, notes, created_at
       FROM bookings WHERE patient_id = $1 ORDER BY scheduled_at DESC`,
      [req.userId]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})
