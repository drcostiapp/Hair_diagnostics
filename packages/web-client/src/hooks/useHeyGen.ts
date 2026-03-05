import { useState, useEffect, useCallback, useRef } from 'react'
import { HeyGenService } from '../services/heygen.service'
import { useConversationStore } from '../stores/conversationStore'
import { analytics } from '../services/analytics.service'

export function useHeyGen() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const addMessage = useConversationStore((s) => s.addMessage)
  const currentConversationId = useConversationStore((s) => s.currentConversationId)

  const serviceRef = useRef<HeyGenService>(
    new HeyGenService({
      apiKey: import.meta.env.VITE_HEYGEN_API_KEY,
      avatarId: import.meta.env.VITE_HEYGEN_AVATAR_ID,
      voiceId: import.meta.env.VITE_HEYGEN_VOICE_ID
    })
  )

  // Listen for avatar responses
  useEffect(() => {
    serviceRef.current.onResponse((msg) => {
      if (msg.type === 'response_text') {
        addMessage({
          id: crypto.randomUUID(),
          conversationId: currentConversationId || '',
          role: 'avatar',
          content: msg.content,
          contentType: 'text',
          timestamp: new Date().toISOString()
        })
      }
    })
  }, [addMessage, currentConversationId])

  const startSession = useCallback(async () => {
    try {
      setError(null)
      analytics.track('session_started')

      const session = await serviceRef.current.createSession()
      setSessionId(session.sessionId)

      const stream = await serviceRef.current.setupPeerConnection(session)

      // Use a video element to render the stream and extract the URL
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true
      video.playsInline = true

      setStreamUrl(video.src || 'stream-active')
      setIsStreaming(true)
      setIsInitialized(true)
    } catch (err) {
      const error = err as Error
      setError(error)
      analytics.track('error_occurred', { context: 'session_start', message: error.message })
    }
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    try {
      await serviceRef.current.sendMessage(text)
      analytics.track('message_sent', { type: 'text' })
    } catch (err) {
      setError(err as Error)
    }
  }, [])

  const sendAudio = useCallback(async (audioBlob: Blob) => {
    try {
      await serviceRef.current.sendAudio(audioBlob)
      analytics.track('voice_input_used')
    } catch (err) {
      setError(err as Error)
    }
  }, [])

  const endSession = useCallback(async () => {
    if (!sessionId) return

    try {
      await serviceRef.current.endSession(sessionId)
      setStreamUrl(null)
      setIsStreaming(false)
      setSessionId(null)
      analytics.track('session_ended')
    } catch (err) {
      setError(err as Error)
    }
  }, [sessionId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionId) {
        serviceRef.current.endSession(sessionId).catch(console.error)
      }
    }
  }, [sessionId])

  return {
    isInitialized,
    isStreaming,
    streamUrl,
    error,
    startSession,
    sendMessage,
    sendAudio,
    endSession
  }
}
