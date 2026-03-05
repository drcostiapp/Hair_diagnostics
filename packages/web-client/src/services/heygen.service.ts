import type { HeyGenConfig, StreamingSession, HeyGenDataMessage, HeyGenResponseMessage } from 'shared-types'

export class HeyGenService {
  private config: HeyGenConfig
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private onResponseCallback: ((msg: HeyGenResponseMessage) => void) | null = null

  constructor(config: HeyGenConfig) {
    this.config = config
  }

  onResponse(callback: (msg: HeyGenResponseMessage) => void) {
    this.onResponseCallback = callback
  }

  async createSession(): Promise<StreamingSession> {
    const response = await fetch('https://api.heygen.com/v1/streaming/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        avatar_id: this.config.avatarId,
        voice_id: this.config.voiceId,
        quality: 'high',
        knowledge_base_id: this.config.knowledgeBaseId
      })
    })

    if (!response.ok) {
      throw new Error(`HeyGen session creation failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      sessionId: data.session_id,
      streamUrl: data.stream_url,
      iceServers: data.ice_servers || []
    }
  }

  async setupPeerConnection(session: StreamingSession): Promise<MediaStream> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: session.iceServers
    })

    // Create data channel for bidirectional messaging
    this.dataChannel = this.peerConnection.createDataChannel('conversation', {
      ordered: true
    })

    this.dataChannel.onopen = () => {
      console.log('[HeyGen] Data channel opened')
    }

    this.dataChannel.onmessage = (event) => {
      try {
        const message: HeyGenResponseMessage = JSON.parse(event.data)
        this.onResponseCallback?.(message)
      } catch (err) {
        console.error('[HeyGen] Failed to parse response:', err)
      }
    }

    this.dataChannel.onerror = (event) => {
      console.error('[HeyGen] Data channel error:', event)
    }

    // Collect remote media stream
    const remoteStream = new MediaStream()
    this.peerConnection.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        remoteStream.addTrack(track)
      })
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        await fetch(`https://api.heygen.com/v1/streaming/${session.sessionId}/ice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            candidate: event.candidate.toJSON()
          })
        })
      }
    }

    // Create and send SDP offer
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    })
    await this.peerConnection.setLocalDescription(offer)

    const startResponse = await fetch(
      `https://api.heygen.com/v1/streaming/${session.sessionId}/start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({ sdp: offer.sdp })
      }
    )

    if (!startResponse.ok) {
      throw new Error(`HeyGen session start failed: ${startResponse.statusText}`)
    }

    const { sdp } = await startResponse.json()
    await this.peerConnection.setRemoteDescription({
      type: 'answer',
      sdp
    })

    return remoteStream
  }

  async sendMessage(text: string): Promise<void> {
    this.ensureDataChannel()
    const message: HeyGenDataMessage = { type: 'text', content: text }
    this.dataChannel!.send(JSON.stringify(message))
  }

  async sendAudio(audioBlob: Blob): Promise<void> {
    this.ensureDataChannel()
    const base64 = await this.blobToBase64(audioBlob)
    const message: HeyGenDataMessage = { type: 'audio', content: base64 }
    this.dataChannel!.send(JSON.stringify(message))
  }

  async endSession(sessionId: string): Promise<void> {
    this.dataChannel?.close()
    this.dataChannel = null

    this.peerConnection?.close()
    this.peerConnection = null

    await fetch(`https://api.heygen.com/v1/streaming/${sessionId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`
      }
    }).catch(console.error)
  }

  private ensureDataChannel() {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel not ready. Ensure session is started.')
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result.split(',')[1])
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}
