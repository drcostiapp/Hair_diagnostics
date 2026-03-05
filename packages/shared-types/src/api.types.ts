/** API request/response types */

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiMeta {
  page?: number
  pageSize?: number
  total?: number
  timestamp: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/** Avatar session API */
export interface CreateAvatarSessionRequest {
  language?: 'en' | 'ar'
  quality?: 'low' | 'medium' | 'high'
}

export interface CreateAvatarSessionResponse {
  sessionId: string
  streamUrl: string
  iceServers: RTCIceServer[]
  conversationId: string
}

/** Booking API */
export interface CreateBookingRequest {
  patientId: string
  treatmentId?: string
  preferredDate: string
  preferredTime: string
  notes?: string
  location: string
}

export interface Booking {
  id: string
  patientId: string
  treatmentId?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  scheduledAt: string
  location: string
  notes?: string
  createdAt: string
}

/** Product recommendation API */
export interface ProductRecommendation {
  productId: string
  product: import('./medical.types').Product
  reason: string
  relevanceScore: number
}
