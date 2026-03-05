import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { authRouter } from './routes/auth.routes.js'
import { avatarRouter } from './routes/avatar.routes.js'
import { conversationRouter } from './routes/conversation.routes.js'
import { patientRouter } from './routes/patient.routes.js'
import { productRouter } from './routes/product.routes.js'
import { bookingRouter } from './routes/booking.routes.js'
import { knowledgeRouter } from './routes/knowledge.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

export const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api/', limiter)

// Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('short'))
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRouter)
app.use('/api/avatar', avatarRouter)
app.use('/api/conversations', conversationRouter)
app.use('/api/patients', patientRouter)
app.use('/api/products', productRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/knowledge', knowledgeRouter)

// Error handler
app.use(errorHandler)
