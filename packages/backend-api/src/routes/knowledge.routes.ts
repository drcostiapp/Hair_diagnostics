import { Router } from 'express'
import { db } from '../db/connection.js'

export const knowledgeRouter = Router()

// GET /api/knowledge/search - Search knowledge base
knowledgeRouter.get('/search', async (req, res, next) => {
  try {
    const query = req.query.q as string
    if (!query || query.length < 2) {
      return res.json({ success: true, data: { treatments: [], faqs: [], products: [] } })
    }

    const searchTerm = `%${query.toLowerCase()}%`

    // Search treatments
    const treatments = await db.query(
      `SELECT id, name, category, description, tags
       FROM treatments
       WHERE LOWER(name) LIKE $1
          OR LOWER(description) LIKE $1
          OR $2 = ANY(tags)
       LIMIT 5`,
      [searchTerm, query.toLowerCase()]
    )

    // Search FAQs
    const faqs = await db.query(
      `SELECT id, question, answer_short, category
       FROM faqs
       WHERE LOWER(question) LIKE $1
          OR LOWER(answer_short) LIKE $1
       LIMIT 5`,
      [searchTerm]
    )

    // Search products
    const products = await db.query(
      `SELECT id, name, brand, category, price_usd
       FROM products
       WHERE LOWER(name) LIKE $1
          OR LOWER(description) LIKE $1
       LIMIT 5`,
      [searchTerm]
    )

    res.json({
      success: true,
      data: {
        treatments: treatments.rows,
        faqs: faqs.rows,
        products: products.rows
      }
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/knowledge/treatments - List all treatments
knowledgeRouter.get('/treatments', async (_req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM treatments ORDER BY category, name'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})

// GET /api/knowledge/faqs - List FAQs
knowledgeRouter.get('/faqs', async (req, res, next) => {
  try {
    const category = req.query.category as string
    let query = 'SELECT * FROM faqs'
    const params: string[] = []

    if (category) {
      query += ' WHERE category = $1'
      params.push(category)
    }

    query += ' ORDER BY question'
    const result = await db.query(query, params)
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
})
