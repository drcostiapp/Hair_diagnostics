/** Conversation and messaging types */

export interface ConversationMessage {
  id: string
  conversationId: string
  role: 'patient' | 'avatar' | 'system'
  content: string
  contentType: 'text' | 'audio' | 'recommendation'
  timestamp: string
  metadata?: MessageMetadata
}

export interface MessageMetadata {
  audioUrl?: string
  audioDuration?: number
  language?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
  topics?: string[]
  citations?: string[]
  productRecommendations?: string[]
  bookingPrompt?: boolean
}

export interface Conversation {
  id: string
  patientId: string
  status: 'active' | 'completed' | 'archived'
  language: 'en' | 'ar'
  startedAt: string
  endedAt?: string
  summary?: string
  topics: string[]
  messages: ConversationMessage[]
  metadata?: ConversationMetadata
}

export interface ConversationMetadata {
  deviceType: string
  arModeUsed: boolean
  totalDuration: number
  messageCount: number
  bookingCreated: boolean
  productsRecommended: string[]
}

export interface ConversationListItem {
  id: string
  startedAt: string
  endedAt?: string
  status: Conversation['status']
  summary?: string
  topics: string[]
  messageCount: number
}

export interface ConversationState {
  currentConversation: Conversation | null
  messages: ConversationMessage[]
  isLoading: boolean
  isSending: boolean
  error: string | null
}
