import { useCallback } from 'react'
import { useConversationStore } from '../stores/conversationStore'
import { api } from '../services/api.service'

export function useConversation() {
  const store = useConversationStore()

  const startConversation = useCallback(async () => {
    try {
      const { data } = await api.createAvatarSession({ language: 'en' })
      const responseData = data.data as Record<string, string> | undefined
      if (responseData?.conversationId) {
        store.startConversation(responseData.conversationId)
      }
    } catch {
      // Fallback: create local conversation ID
      store.startConversation(crypto.randomUUID())
    }
  }, [store])

  const endConversation = useCallback(() => {
    store.endConversation()
  }, [store])

  const addMessage = useCallback(
    (msg: { role: 'patient' | 'avatar'; content: string; contentType: 'text' | 'audio' }) => {
      store.addMessage({
        id: crypto.randomUUID(),
        conversationId: store.currentConversationId || '',
        role: msg.role,
        content: msg.content,
        contentType: msg.contentType,
        timestamp: new Date().toISOString()
      })
    },
    [store]
  )

  return {
    messages: store.messages,
    currentConversationId: store.currentConversationId,
    isActive: store.isActive,
    startConversation,
    endConversation,
    addMessage
  }
}
