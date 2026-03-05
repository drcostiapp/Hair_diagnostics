import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { db } from '../db/connection.js'

export const productRouter = Router()

// GET /api/products - List products
productRouter.get('/', async (req, res, next) => {
  try {
    const { category } = req.query
    let query = 'SELECT * FROM products'
    const params: string[] = []

    if (category) {
      query += ' WHERE category = $1'
      params.push(category as string)
    }

    query += ' ORDER BY name'
    const result = await db.query(query, params)

    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id - Get product by ID
productRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/recommendations/:conversationId - Get product recommendations
productRouter.get('/recommendations/:conversationId', authenticate, async (req, res, next) => {
  try {
    // Fetch conversation topics to match products
    const convResult = await db.query(
      'SELECT topics FROM conversations WHERE id = $1 AND patient_id = $2',
      [req.params.conversationId, req.userId]
    )

    if (convResult.rows.length === 0) {
      return res.json({ success: true, data: [] })
    }

    const topics = convResult.rows[0].topics || []

    // Simple keyword-based product matching
    const result = await db.query(
      `SELECT * FROM products
       WHERE indications && $1::text[]
       ORDER BY name LIMIT 10`,
      [topics]
    )

    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})
