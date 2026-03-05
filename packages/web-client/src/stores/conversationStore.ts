import { create } from 'zustand'
import type { ConversationMessage, ConversationListItem } from 'shared-types'

interface ConversationStore {
  currentConversationId: string | null
  messages: ConversationMessage[]
  isActive: boolean
  conversationHistory: ConversationListItem[]

  startConversation: (id: string) => void
  endConversation: () => void
  addMessage: (message: ConversationMessage) => void
  clearMessages: () => void
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  currentConversationId: null,
  messages: [],
  isActive: false,
  conversationHistory: [],

  startConversation: (id) => {
    set({
      currentConversationId: id,
      messages: [],
      isActive: true
    })
  },

  endConversation: () => {
    const { currentConversationId, messages, conversationHistory } = get()

    if (currentConversationId && messages.length > 0) {
      // Save to history
      const historyItem: ConversationListItem = {
        id: currentConversationId,
        startedAt: messages[0]?.timestamp || new Date().toISOString(),
        endedAt: new Date().toISOString(),
        status: 'completed',
        summary: messages.find((m) => m.role === 'patient')?.content,
        topics: [],
        messageCount: messages.length
      }

      set({
        conversationHistory: [historyItem, ...conversationHistory],
        currentConversationId: null,
        messages: [],
        isActive: false
      })
    } else {
      set({
        currentConversationId: null,
        messages: [],
        isActive: false
      })
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  }
}))
