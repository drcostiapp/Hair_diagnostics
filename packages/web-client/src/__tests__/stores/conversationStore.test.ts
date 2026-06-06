import { describe, it, expect, beforeEach } from 'vitest'
import { useConversationStore } from '../../stores/conversationStore'

describe('conversationStore', () => {
  beforeEach(() => {
    useConversationStore.setState({
      currentConversationId: null,
      messages: [],
      isActive: false,
      conversationHistory: []
    })
  })

  it('starts with default state', () => {
    const state = useConversationStore.getState()

    expect(state.currentConversationId).toBeNull()
    expect(state.messages).toEqual([])
    expect(state.isActive).toBe(false)
    expect(state.conversationHistory).toEqual([])
  })

  it('startConversation sets id and activates', () => {
    useConversationStore.getState().startConversation('conv-1')
    const state = useConversationStore.getState()

    expect(state.currentConversationId).toBe('conv-1')
    expect(state.isActive).toBe(true)
    expect(state.messages).toEqual([])
  })

  it('addMessage appends to the messages list', () => {
    useConversationStore.getState().startConversation('conv-1')
    useConversationStore.getState().addMessage({
      id: 'm1',
      role: 'patient',
      content: 'Hello',
      timestamp: '2025-01-01T00:00:00Z',
      contentType: 'text'
    })

    const { messages } = useConversationStore.getState()
    expect(messages).toHaveLength(1)
    expect(messages[0].content).toBe('Hello')
  })

  it('endConversation saves to history when messages exist', () => {
    const store = useConversationStore.getState()
    store.startConversation('conv-1')
    store.addMessage({
      id: 'm1', role: 'patient', content: 'Question',
      timestamp: '2025-01-01T00:00:00Z', contentType: 'text'
    })
    store.addMessage({
      id: 'm2', role: 'avatar', content: 'Answer',
      timestamp: '2025-01-01T00:01:00Z', contentType: 'text'
    })

    useConversationStore.getState().endConversation()
    const state = useConversationStore.getState()

    expect(state.isActive).toBe(false)
    expect(state.currentConversationId).toBeNull()
    expect(state.messages).toEqual([])
    expect(state.conversationHistory).toHaveLength(1)
    expect(state.conversationHistory[0].id).toBe('conv-1')
    expect(state.conversationHistory[0].messageCount).toBe(2)
    expect(state.conversationHistory[0].status).toBe('completed')
  })

  it('endConversation without messages does not save to history', () => {
    useConversationStore.getState().startConversation('conv-empty')
    useConversationStore.getState().endConversation()

    const state = useConversationStore.getState()
    expect(state.conversationHistory).toHaveLength(0)
  })

  it('clearMessages empties the message list', () => {
    useConversationStore.getState().startConversation('conv-1')
    useConversationStore.getState().addMessage({
      id: 'm1', role: 'patient', content: 'Hi',
      timestamp: '2025-01-01T00:00:00Z', contentType: 'text'
    })

    useConversationStore.getState().clearMessages()
    expect(useConversationStore.getState().messages).toEqual([])
  })

  it('history accumulates across multiple conversations', () => {
    const store = useConversationStore.getState()

    // First conversation
    store.startConversation('c1')
    store.addMessage({ id: '1', role: 'patient', content: 'Q1', timestamp: '2025-01-01T00:00:00Z', contentType: 'text' })
    useConversationStore.getState().endConversation()

    // Second conversation
    useConversationStore.getState().startConversation('c2')
    useConversationStore.getState().addMessage({ id: '2', role: 'patient', content: 'Q2', timestamp: '2025-01-02T00:00:00Z', contentType: 'text' })
    useConversationStore.getState().endConversation()

    expect(useConversationStore.getState().conversationHistory).toHaveLength(2)
    // Most recent first
    expect(useConversationStore.getState().conversationHistory[0].id).toBe('c2')
  })
})
