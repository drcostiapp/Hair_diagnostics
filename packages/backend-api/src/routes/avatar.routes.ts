import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { heygenService } from '../services/heygen.service.js'
import { conversationService } from '../services/conversation.service.js'

export const avatarRouter = Router()

// POST /api/avatar/session - Create a new avatar streaming session
avatarRouter.post('/session', authenticate, async (req, res, next) => {
  try {
    const { language = 'en', quality = 'high' } = req.body

    // Create HeyGen session (server-side to protect API key)
    const session = await heygenService.createStreamingSession({ language, quality })

    // Create conversation record
    const conversation = await conversationService.create({
      patientId: req.userId!,
      language,
      metadata: { arModeUsed: false, deviceType: req.headers['user-agent'] || '' }
    })

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        streamUrl: session.streamUrl,
        iceServers: session.iceServers,
        conversationId: conversation.id
      }
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/avatar/session/:id/end - End an avatar session
avatarRouter.post('/session/:id/end', authenticate, async (req, res, next) => {
  try {
    await heygenService.endStreamingSession(req.params.id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
