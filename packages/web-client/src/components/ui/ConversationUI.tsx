import { useState, useRef, useEffect } from 'react'
import { useAudioRecording } from '../../hooks/useAudioRecording'
import type { ConversationMessage } from 'shared-types'

interface ConversationUIProps {
  onSendMessage: (text: string) => void
  onSendAudio: (audioBlob: Blob) => void
  isProcessing: boolean
  messages: ConversationMessage[]
}

export function ConversationUI({
  onSendMessage,
  onSendAudio,
  isProcessing,
  messages
}: ConversationUIProps) {
  const [textInput, setTextInput] = useState('')
  const [showTranscript, setShowTranscript] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isRecording, audioLevel, startRecording, stopRecording } = useAudioRecording()

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleVoiceToggle = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording()
      if (audioBlob) {
        onSendAudio(audioBlob)
      }
    } else {
      await startRecording()
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = textInput.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setTextInput('')
  }

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-gray-200">
      {/* Transcript toggle */}
      {messages.length > 0 && (
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full px-4 py-2 text-xs text-gray-500 text-center border-b border-gray-100"
        >
          {showTranscript ? 'Hide' : 'Show'} transcript ({messages.length} messages)
        </button>
      )}

      {/* Message transcript */}
      {showTranscript && (
        <div className="max-h-48 overflow-y-auto px-4 py-2 space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`text-sm ${
                msg.role === 'patient' ? 'text-right' : 'text-left'
              }`}
            >
              <span
                className={`inline-block px-3 py-1.5 rounded-lg max-w-[80%] ${
                  msg.role === 'patient'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Audio level indicator */}
      {isRecording && (
        <div className="px-4 py-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-100"
              style={{ width: `${Math.max(audioLevel * 100, 5)}%` }}
            />
          </div>
          <p className="text-xs text-red-500 text-center mt-1">Recording...</p>
        </div>
      )}

      {/* Input controls */}
      <div className="p-4 space-y-2">
        {/* Voice button */}
        <button
          onClick={handleVoiceToggle}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-medium text-white text-lg transition-all ${
            isRecording
              ? 'bg-red-500 animate-pulse'
              : isProcessing
                ? 'bg-gray-400'
                : 'bg-gradient-to-r from-primary-500 to-accent-500'
          }`}
        >
          {isProcessing
            ? 'Dr. Costi is responding...'
            : isRecording
              ? 'Tap to Stop & Send'
              : 'Tap to Speak'}
        </button>

        {/* Text input fallback */}
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type your question..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isProcessing}
            className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
