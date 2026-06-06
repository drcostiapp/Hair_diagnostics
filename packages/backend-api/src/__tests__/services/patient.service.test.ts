import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../db/connection.js', () => ({
  db: { query: vi.fn() }
}))

import { patientService } from '../../services/patient.service.js'
import { db } from '../../db/connection.js'

const mockQuery = vi.mocked(db.query)

describe('PatientService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getById', () => {
    it('returns patient when found', async () => {
      const patient = { id: 'p1', email: 'test@example.com', first_name: 'John' }
      mockQuery.mockResolvedValueOnce({ rows: [patient], rowCount: 1 } as any)

      const result = await patientService.getById('p1')

      expect(result).toEqual(patient)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM patients WHERE id'),
        ['p1']
      )
    })

    it('throws 404 when patient not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      await expect(patientService.getById('missing'))
        .rejects.toThrow('Patient not found')
    })
  })

  describe('update', () => {
    it('updates allowed fields with camelCase to snake_case conversion', async () => {
      const updated = { id: 'p1', first_name: 'Jane', last_name: 'Doe' }
      mockQuery.mockResolvedValueOnce({ rows: [updated], rowCount: 1 } as any)

      const result = await patientService.update('p1', {
        firstName: 'Jane',
        lastName: 'Doe'
      })

      const query = mockQuery.mock.calls[0][0] as string
      expect(query).toContain('first_name')
      expect(query).toContain('last_name')
      expect(result).toEqual(updated)
    })

    it('ignores unknown fields', async () => {
      const patient = { id: 'p1', first_name: 'John' }
      // First call for getById fallback (no valid fields)
      mockQuery.mockResolvedValueOnce({ rows: [patient], rowCount: 1 } as any)

      const result = await patientService.update('p1', {
        hackField: 'malicious',
        password_hash: 'should-be-ignored'
      })

      // Should call getById instead of UPDATE since no valid fields
      expect(result).toEqual(patient)
    })

    it('updates only allowed fields from mixed input', async () => {
      const updated = { id: 'p1', city: 'Beirut' }
      mockQuery.mockResolvedValueOnce({ rows: [updated], rowCount: 1 } as any)

      await patientService.update('p1', {
        city: 'Beirut',
        role: 'admin', // not allowed
        id: 'changed' // not allowed
      })

      const query = mockQuery.mock.calls[0][0] as string
      expect(query).toContain('city')
      expect(query).not.toContain('role')
    })
  })
})
