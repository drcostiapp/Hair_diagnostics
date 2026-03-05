import { useState } from 'react'
import { ARScene } from '../components/ar/ARScene'
import { ConversationUI } from '../components/ui/ConversationUI'
import { useHeyGen } from '../hooks/useHeyGen'
import { useConversation } from '../hooks/useConversation'
import { checkWebXRSupport } from '../utils/webxrUtils'

export function ARSessionPage() {
  const [_arSupported] = useState(() => checkWebXRSupport())
  const [_arActive, setArActive] = useState(false)
  const heygen = useHeyGen()
  const conversation = useConversation()

  const handleStartSession = async () => {
    await heygen.startSession()
    await conversation.startConversation()
  }

  const handleEndSession = async () => {
    await heygen.endSession()
    conversation.endConversation()
  }

  const handleSendMessage = async (text: string) => {
    conversation.addMessage({
      role: 'patient',
      content: text,
      contentType: 'text'
    })
    await heygen.sendMessage(text)
  }

  const handleSendAudio = async (audioBlob: Blob) => {
    conversation.addMessage({
      role: 'patient',
      content: '[Voice message]',
      contentType: 'audio'
    })
    await heygen.sendAudio(audioBlob)
  }

  return (
    <div className="w-full h-full relative">
      {/* 3D/AR Canvas */}
      <ARScene
        isStreaming={heygen.isStreaming}
        streamUrl={heygen.streamUrl}
        onARSessionStart={() => setArActive(true)}
        onARSessionEnd={() => setArActive(false)}
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        {/* Top bar */}
        <div className="p-4 pointer-events-auto flex items-center justify-between">
          <a
            href="/"
            className="bg-white/90 backdrop-blur rounded-full px-4 py-2 text-sm font-medium shadow"
          >
            &larr; Back
          </a>
          {heygen.isStreaming && (
            <button
              onClick={handleEndSession}
              className="bg-red-500 text-white rounded-full px-4 py-2 text-sm font-medium shadow"
            >
              End Session
            </button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom controls */}
        <div className="pointer-events-auto">
          {!heygen.isStreaming ? (
            <div className="p-4 space-y-3">
              <button
                onClick={handleStartSession}
                className="w-full py-4 rounded-xl font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg hover:shadow-xl transition-shadow"
              >
                {heygen.isInitialized ? 'Resume Consultation' : 'Start Consultation'}
              </button>
            </div>
          ) : (
            <ConversationUI
              onSendMessage={handleSendMessage}
              onSendAudio={handleSendAudio}
              isProcessing={heygen.isStreaming && !heygen.isInitialized}
              messages={conversation.messages}
            />
          )}
        </div>
      </div>

      {/* Error display */}
      {heygen.error && (
        <div className="absolute top-20 left-4 right-4 bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 text-sm">
          {heygen.error.message}
        </div>
      )}
    </div>
  )
}
