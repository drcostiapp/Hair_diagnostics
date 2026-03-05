import 'dotenv/config'
import { db } from './connection.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function seed() {
  console.log('[seed] Seeding database...')

  try {
    // Load knowledge base data
    const knowledgePath = join(__dirname, '../../../../packages/medical-knowledge/data')

    const treatmentsRaw = readFileSync(join(knowledgePath, 'treatments.json'), 'utf8')
    const treatments = JSON.parse(treatmentsRaw)

    const productsRaw = readFileSync(join(knowledgePath, 'products.json'), 'utf8')
    const products = JSON.parse(productsRaw)

    const faqsRaw = readFileSync(join(knowledgePath, 'faqs.json'), 'utf8')
    const faqs = JSON.parse(faqsRaw)

    // Seed treatments
    for (const t of treatments) {
      await db.query(
        `INSERT INTO treatments (id, name, category, description, indications, contraindications,
         procedure_text, duration, downtime, results_timeline, longevity, price_range, aftercare,
         dr_costi_approach, tags, related_treatments)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (id) DO NOTHING`,
        [t.id, t.name, t.category, t.description, t.indications, t.contraindications,
         t.procedure, t.duration, t.downtime, t.resultsTimeline, t.longevity, t.priceRange,
         t.aftercare, t.drCostiApproach, t.tags, t.relatedTreatments]
      )
    }
    console.log(`[seed] Inserted ${treatments.length} treatments`)

    // Seed products
    for (const p of products) {
      await db.query(
        `INSERT INTO products (id, name, brand, category, skinperfection_url, price_usd,
         description, indications, how_to_use, dr_costi_recommendation, ingredients, skin_types)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.brand, p.category, p.skinperfectionUrl, p.priceUsd,
         p.description, p.indications, p.howToUse, p.drCostiRecommendation,
         p.ingredients || [], p.skinTypes || []]
      )
    }
    console.log(`[seed] Inserted ${products.length} products`)

    // Seed FAQs
    for (const f of faqs) {
      await db.query(
        `INSERT INTO faqs (id, question, answer_short, answer_detailed, category, tags,
         related_questions, language)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.question, f.answerShort, f.answerDetailed, f.category, f.tags,
         f.relatedQuestions, f.language || 'en']
      )
    }
    console.log(`[seed] Inserted ${faqs.length} FAQs`)

    console.log('[seed] Database seeding complete.')
  } catch (err) {
    console.error('[seed] Seeding failed:', err)
  }

  await db.end()
}

seed()
