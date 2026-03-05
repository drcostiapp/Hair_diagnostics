import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { conversationService } from '../services/conversation.service.js'

export const conversationRouter = Router()

// GET /api/conversations - List patient conversations
conversationRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    const result = await conversationService.listByPatient(req.userId!, page, pageSize)

    res.json({
      success: true,
      data: result.conversations,
      meta: {
        page,
        pageSize,
        total: result.total,
        timestamp: new Date().toISOString()
      }
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/conversations/:id - Get conversation with messages
conversationRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const conversation = await conversationService.getById(req.params.id, req.userId!)
    res.json({ success: true, data: conversation })
  } catch (err) {
    next(err)
  }
})

// POST /api/conversations/:id/messages - Add message to conversation
conversationRouter.post('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { role, content, contentType } = req.body
    const message = await conversationService.addMessage(req.params.id, {
      role,
      content,
      contentType
    })
    res.status(201).json({ success: true, data: message })
  } catch (err) {
    next(err)
  }
})
