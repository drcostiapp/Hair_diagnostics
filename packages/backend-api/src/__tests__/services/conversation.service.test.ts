import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../db/connection.js', () => ({
  db: { query: vi.fn() }
}))

vi.mock('uuid', () => ({ v4: () => 'test-uuid-1234' }))

import { conversationService } from '../../services/conversation.service.js'
import { db } from '../../db/connection.js'

const mockQuery = vi.mocked(db.query)

describe('ConversationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('inserts a conversation and returns the row', async () => {
      const row = { id: 'test-uuid-1234', patient_id: 'p1', status: 'active', language: 'en' }
      mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as any)

      const result = await conversationService.create({ patientId: 'p1' })

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO conversations'),
        ['test-uuid-1234', 'p1', 'en', '{}']
      )
      expect(result).toEqual(row)
    })

    it('passes language and metadata when provided', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{}], rowCount: 1 } as any)

      await conversationService.create({
        patientId: 'p1',
        language: 'ar',
        metadata: { source: 'ar-session' }
      })

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['test-uuid-1234', 'p1', 'ar', JSON.stringify({ source: 'ar-session' })]
      )
    })
  })

  describe('getById', () => {
    it('returns conversation with messages', async () => {
      const conv = { id: 'c1', patient_id: 'p1', status: 'active' }
      const msgs = [{ id: 'm1', content: 'Hello' }]
      mockQuery
        .mockResolvedValueOnce({ rows: [conv], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: msgs, rowCount: 1 } as any)

      const result = await conversationService.getById('c1', 'p1')

      expect(result).toEqual({ ...conv, messages: msgs })
    })

    it('throws 404 when conversation not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      await expect(conversationService.getById('missing', 'p1'))
        .rejects.toThrow('Conversation not found')
    })
  })

  describe('listByPatient', () => {
    it('returns paginated conversations with total', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '5' }], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [{ id: 'c1' }, { id: 'c2' }], rowCount: 2 } as any)

      const result = await conversationService.listByPatient('p1', 1, 10)

      expect(result.conversations).toHaveLength(2)
      expect(result.total).toBe(5)
    })

    it('calculates correct offset for page 2', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '20' }], rowCount: 1 } as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      await conversationService.listByPatient('p1', 2, 10)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        ['p1', 10, 10] // offset = (2-1)*10 = 10
      )
    })
  })

  describe('addMessage', () => {
    it('inserts a message with defaults', async () => {
      const msg = { id: 'test-uuid-1234', role: 'patient', content: 'Hi' }
      mockQuery.mockResolvedValueOnce({ rows: [msg], rowCount: 1 } as any)

      const result = await conversationService.addMessage('c1', {
        role: 'patient',
        content: 'Hi'
      })

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO messages'),
        ['test-uuid-1234', 'c1', 'patient', 'Hi', 'text']
      )
      expect(result).toEqual(msg)
    })
  })

  describe('endConversation', () => {
    it('updates status to completed', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any)

      await conversationService.endConversation('c1')

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("status = 'completed'"),
        ['c1']
      )
    })
  })
})
