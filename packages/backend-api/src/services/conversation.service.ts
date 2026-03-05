import { v4 as uuid } from 'uuid'
import { db } from '../db/connection.js'
import { AppError } from '../middleware/errorHandler.js'

class ConversationService {
  async create(params: {
    patientId: string
    language?: string
    metadata?: Record<string, unknown>
  }) {
    const id = uuid()
    const result = await db.query(
      `INSERT INTO conversations (id, patient_id, language, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING id, patient_id, status, language, started_at`,
      [id, params.patientId, params.language || 'en', JSON.stringify(params.metadata || {})]
    )
    return result.rows[0]
  }

  async getById(id: string, patientId: string) {
    const convResult = await db.query(
      `SELECT * FROM conversations WHERE id = $1 AND patient_id = $2`,
      [id, patientId]
    )

    if (convResult.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found')
    }

    const messagesResult = await db.query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at`,
      [id]
    )

    return {
      ...convResult.rows[0],
      messages: messagesResult.rows
    }
  }

  async listByPatient(patientId: string, page: number, pageSize: number) {
    const offset = (page - 1) * pageSize

    const countResult = await db.query(
      'SELECT COUNT(*) FROM conversations WHERE patient_id = $1',
      [patientId]
    )

    const result = await db.query(
      `SELECT c.id, c.status, c.language, c.summary, c.topics, c.started_at, c.ended_at,
              (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count
       FROM conversations c
       WHERE c.patient_id = $1
       ORDER BY c.started_at DESC
       LIMIT $2 OFFSET $3`,
      [patientId, pageSize, offset]
    )

    return {
      conversations: result.rows,
      total: parseInt(countResult.rows[0].count)
    }
  }

  async addMessage(conversationId: string, msg: {
    role: string
    content: string
    contentType?: string
  }) {
    const id = uuid()
    const result = await db.query(
      `INSERT INTO messages (id, conversation_id, role, content, content_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, conversationId, msg.role, msg.content, msg.contentType || 'text']
    )
    return result.rows[0]
  }

  async endConversation(id: string) {
    await db.query(
      `UPDATE conversations SET status = 'completed', ended_at = NOW() WHERE id = $1`,
      [id]
    )
  }
}

export const conversationService = new ConversationService()
