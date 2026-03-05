import { AppError } from '../middleware/errorHandler.js'

interface StreamingSessionResponse {
  sessionId: string
  streamUrl: string
  iceServers: RTCIceServer[]
}

class HeyGenServerService {
  private apiKey: string
  private avatarId: string
  private voiceId: string
  private knowledgeBaseId: string
  private baseUrl = 'https://api.heygen.com/v1'

  constructor() {
    this.apiKey = process.env.HEYGEN_API_KEY || ''
    this.avatarId = process.env.HEYGEN_AVATAR_ID || ''
    this.voiceId = process.env.HEYGEN_VOICE_ID || ''
    this.knowledgeBaseId = process.env.HEYGEN_KNOWLEDGE_BASE_ID || ''
  }

  async createStreamingSession(opts: {
    language?: string
    quality?: string
  }): Promise<StreamingSessionResponse> {
    if (!this.apiKey) {
      throw new AppError(500, 'CONFIG_ERROR', 'HeyGen API key not configured')
    }

    const response = await fetch(`${this.baseUrl}/streaming/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        avatar_id: this.avatarId,
        voice_id: this.voiceId,
        quality: opts.quality || 'high',
        knowledge_base_id: this.knowledgeBaseId,
        language: opts.language || 'en'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new AppError(502, 'HEYGEN_ERROR', `HeyGen API error: ${errorText}`)
    }

    const data = await response.json()
    return {
      sessionId: data.session_id,
      streamUrl: data.stream_url,
      iceServers: data.ice_servers || []
    }
  }

  async endStreamingSession(sessionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/streaming/${sessionId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
  }
}

export const heygenService = new HeyGenServerService()
