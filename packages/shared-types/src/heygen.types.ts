/** HeyGen Interactive Avatar API types */

export interface HeyGenConfig {
  apiKey: string
  avatarId: string
  voiceId: string
  knowledgeBaseId?: string
}

export interface HeyGenSessionRequest {
  avatar_id: string
  voice_id: string
  quality: 'low' | 'medium' | 'high'
  knowledge_base_id?: string
  language?: string
}

export interface HeyGenSessionResponse {
  session_id: string
  stream_url: string
  ice_servers: RTCConfiguration['iceServers']
  created_at: string
  expires_at: string
}

export interface StreamingSession {
  sessionId: string
  streamUrl: string
  iceServers: RTCIceServer[]
}

export interface HeyGenStartResponse {
  sdp: string
  type: 'answer'
}

export interface HeyGenDataMessage {
  type: 'text' | 'audio' | 'control'
  content: string
  metadata?: Record<string, unknown>
}

export interface HeyGenResponseMessage {
  type: 'response_text' | 'response_audio' | 'status' | 'error'
  content: string
  timestamp: number
  metadata?: {
    citations?: string[]
    confidence?: number
    language?: string
  }
}

export type AvatarQuality = 'low' | 'medium' | 'high'
export type AvatarLanguage = 'en' | 'ar'

export interface AvatarState {
  isInitialized: boolean
  isStreaming: boolean
  isSpeaking: boolean
  isListening: boolean
  currentEmotion: 'neutral' | 'smiling' | 'empathetic' | 'confident' | 'thinking'
}
