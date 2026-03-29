import type { ChatMessage } from '../../types'

export interface ArtistDisplayMessage {
  id: string
  from: 'user' | 'artist'
  text: string
  timestamp: string
  read: boolean
}

export function dbToDisplay(msg: ChatMessage): ArtistDisplayMessage {
  return {
    id: msg.id,
    from: msg.sender_role === 'client' ? 'user' : 'artist',
    text: msg.text,
    timestamp: msg.created_at,
    read: msg.read,
  }
}

export function findChatbotMatch(text: string, chatbotResponses: Record<string, string>): string | null {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const keys = Object.keys(chatbotResponses)
  for (const key of keys) {
    const keyNorm = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (normalized.includes(keyNorm)) return key
  }
  return null
}

export interface ChatbotMessage {
  id: string
  from: 'user' | 'bot'
  text: string
  timestamp: string
}
