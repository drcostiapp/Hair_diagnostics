/** Medical knowledge base types */

export interface Treatment {
  id: string
  name: string
  category: TreatmentCategory
  description: string
  indications: string[]
  contraindications: string[]
  procedure: string
  duration: string
  downtime: string
  resultsTimeline: string
  longevity: string
  priceRange: string
  aftercare: string[]
  drCostiApproach: string
  tags: string[]
  relatedTreatments: string[]
}

export type TreatmentCategory =
  | 'neuromodulators'
  | 'dermal_fillers'
  | 'laser_treatments'
  | 'skin_rejuvenation'
  | 'body_contouring'
  | 'hair_restoration'
  | 'chemical_peels'
  | 'microneedling'
  | 'thread_lifts'
  | 'prp_therapy'

export interface Product {
  id: string
  name: string
  brand: string
  category: ProductCategory
  skinperfectionUrl: string
  priceUsd: number
  description: string
  indications: string[]
  howToUse: string
  drCostiRecommendation: string
  ingredients?: string[]
  skinTypes?: string[]
  imageUrl?: string
}

export type ProductCategory =
  | 'cleanser'
  | 'serum'
  | 'moisturizer'
  | 'sunscreen'
  | 'retinoid'
  | 'exfoliant'
  | 'mask'
  | 'eye_cream'
  | 'toner'
  | 'supplement'

export interface FAQ {
  id: string
  question: string
  answerShort: string
  answerDetailed: string
  category: string
  tags: string[]
  relatedQuestions: string[]
  language: 'en' | 'ar'
}

export interface KnowledgeBase {
  treatments: Treatment[]
  products: Product[]
  faqs: FAQ[]
  lastUpdated: string
  version: string
}

export interface MedicalDisclaimer {
  text: string
  language: 'en' | 'ar'
  version: string
  requiredAcceptance: boolean
}
