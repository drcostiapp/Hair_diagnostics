import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { patientService } from '../services/patient.service.js'

export const patientRouter = Router()

// GET /api/patients/me - Get current patient profile
patientRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const patient = await patientService.getById(req.userId!)
    res.json({ success: true, data: patient })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/patients/me - Update patient profile
patientRouter.patch('/me', authenticate, async (req, res, next) => {
  try {
    const updated = await patientService.update(req.userId!, req.body)
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})
