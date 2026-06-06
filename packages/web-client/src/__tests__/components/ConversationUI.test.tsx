import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConversationUI } from '../../components/ui/ConversationUI'
import type { ConversationMessage } from 'shared-types'

vi.mock('../../hooks/useAudioRecording', () => ({
  useAudioRecording: () => ({
    isRecording: false,
    audioLevel: 0,
    startRecording: vi.fn(),
    stopRecording: vi.fn().mockResolvedValue(new Blob(['audio'])),
    error: null
  })
}))

const defaultProps = {
  onSendMessage: vi.fn(),
  onSendAudio: vi.fn(),
  isProcessing: false,
  messages: [] as ConversationMessage[]
}

describe('ConversationUI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the voice button', () => {
    render(<ConversationUI {...defaultProps} />)
    expect(screen.getByText('Tap to Speak')).toBeInTheDocument()
  })

  it('renders text input', () => {
    render(<ConversationUI {...defaultProps} />)
    expect(screen.getByPlaceholderText(/type your question/i)).toBeInTheDocument()
  })

  it('submits text input and clears the field', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()
    render(<ConversationUI {...defaultProps} onSendMessage={onSendMessage} />)

    const input = screen.getByPlaceholderText(/type your question/i)
    await user.type(input, 'What is Botox?')
    await user.click(screen.getByText('Send'))

    expect(onSendMessage).toHaveBeenCalledWith('What is Botox?')
    expect(input).toHaveValue('')
  })

  it('does not submit empty text', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn()
    render(<ConversationUI {...defaultProps} onSendMessage={onSendMessage} />)

    await user.click(screen.getByText('Send'))
    expect(onSendMessage).not.toHaveBeenCalled()
  })

  it('shows processing state', () => {
    render(<ConversationUI {...defaultProps} isProcessing={true} />)
    expect(screen.getByText(/Dr. Costi is responding/i)).toBeInTheDocument()
  })

  it('disables input during processing', () => {
    render(<ConversationUI {...defaultProps} isProcessing={true} />)
    expect(screen.getByPlaceholderText(/type your question/i)).toBeDisabled()
  })

  it('shows transcript toggle when messages exist', () => {
    const messages: ConversationMessage[] = [
      { id: '1', role: 'patient', content: 'Hello', timestamp: '2025-01-01T00:00:00Z', contentType: 'text' }
    ]
    render(<ConversationUI {...defaultProps} messages={messages} />)
    expect(screen.getByText(/Show.*transcript.*1 messages/i)).toBeInTheDocument()
  })

  it('shows messages when transcript is toggled', async () => {
    const user = userEvent.setup()
    const messages: ConversationMessage[] = [
      { id: '1', role: 'patient', content: 'Is Botox safe?', timestamp: '2025-01-01T00:00:00Z', contentType: 'text' },
      { id: '2', role: 'avatar', content: 'Yes, when administered properly.', timestamp: '2025-01-01T00:01:00Z', contentType: 'text' }
    ]
    render(<ConversationUI {...defaultProps} messages={messages} />)

    await user.click(screen.getByText(/Show.*transcript/i))

    expect(screen.getByText('Is Botox safe?')).toBeInTheDocument()
    expect(screen.getByText('Yes, when administered properly.')).toBeInTheDocument()
  })
})
