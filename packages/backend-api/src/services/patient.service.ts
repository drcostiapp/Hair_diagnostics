import { db } from '../db/connection.js'
import { AppError } from '../middleware/errorHandler.js'

class PatientService {
  async getById(id: string) {
    const result = await db.query(
      `SELECT id, email, phone, first_name, last_name, date_of_birth, gender,
              language, city, country, clinic, consent_given, consent_date,
              created_at, updated_at, last_visit
       FROM patients WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Patient not found')
    }

    return result.rows[0]
  }

  async update(id: string, data: Record<string, unknown>) {
    // Allowlist of updatable fields
    const allowedFields = [
      'first_name', 'last_name', 'date_of_birth', 'gender',
      'language', 'city', 'country', 'clinic'
    ]

    const updates: string[] = []
    const values: unknown[] = []
    let paramIdx = 1

    for (const [key, value] of Object.entries(data)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
      if (allowedFields.includes(snakeKey)) {
        updates.push(`${snakeKey} = $${paramIdx}`)
        values.push(value)
        paramIdx++
      }
    }

    if (updates.length === 0) {
      return this.getById(id)
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const result = await db.query(
      `UPDATE patients SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    )

    return result.rows[0]
  }
}

export const patientService = new PatientService()
