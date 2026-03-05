import 'dotenv/config'
import { db } from './connection.js'

const migrations = [
  // Patients table
  `CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    language VARCHAR(5) DEFAULT 'en',
    city VARCHAR(100),
    country VARCHAR(100),
    clinic VARCHAR(100),
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_visit TIMESTAMPTZ
  )`,

  // Conversations table
  `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    status VARCHAR(20) DEFAULT 'active',
    language VARCHAR(5) DEFAULT 'en',
    summary TEXT,
    topics TEXT[] DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Messages table
  `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text',
    audio_url TEXT,
    audio_duration REAL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Treatments table
  `CREATE TABLE IF NOT EXISTS treatments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    indications TEXT[] DEFAULT '{}',
    contraindications TEXT[] DEFAULT '{}',
    procedure_text TEXT,
    duration VARCHAR(50),
    downtime VARCHAR(100),
    results_timeline VARCHAR(200),
    longevity VARCHAR(100),
    price_range VARCHAR(100),
    aftercare TEXT[] DEFAULT '{}',
    dr_costi_approach TEXT,
    tags TEXT[] DEFAULT '{}',
    related_treatments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Products table
  `CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50),
    skinperfection_url TEXT,
    price_usd DECIMAL(10,2),
    description TEXT,
    indications TEXT[] DEFAULT '{}',
    how_to_use TEXT,
    dr_costi_recommendation TEXT,
    ingredients TEXT[] DEFAULT '{}',
    skin_types TEXT[] DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // FAQs table
  `CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR(50) PRIMARY KEY,
    question TEXT NOT NULL,
    answer_short TEXT,
    answer_detailed TEXT,
    category VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    related_questions TEXT[] DEFAULT '{}',
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Bookings table
  `CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    treatment_id VARCHAR(50) REFERENCES treatments(id),
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ NOT NULL,
    location VARCHAR(200) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_patient ON bookings(patient_id)`,
  `CREATE INDEX IF NOT EXISTS idx_treatments_category ON treatments(category)`,
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`
]

async function migrate() {
  console.log('[migrate] Running database migrations...')
  for (const sql of migrations) {
    await db.query(sql)
  }
  console.log('[migrate] All migrations complete.')
  await db.end()
}

migrate().catch((err) => {
  console.error('[migrate] Migration failed:', err)
  process.exit(1)
})
