import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { ChatMessage, ChatConversation } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useChat(clientId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!clientId) { setLoading(false); return }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true })
    if (err) setError(err.message)
    else setMessages((data ?? []) as unknown as ChatMessage[])
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const subscribe = useCallback(() => {
    if (!clientId) return
    const channel = supabase
      .channel(`chat:${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as unknown as ChatMessage])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          setMessages(prev =>
            prev.map(m => m.id === (payload.new as { id: string }).id
              ? payload.new as unknown as ChatMessage
              : m
            )
          )
        }
      )
      .subscribe()

    channelRef.current = channel
  }, [clientId])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [])

  const send = async (text: string, senderRole: 'client' | 'artist') => {
    if (!clientId) return { error: 'No client ID' }
    const { error: err } = await supabase
      .from('chat_messages')
      .insert({ client_id: clientId, sender_role: senderRole, text })
    return { error: err?.message ?? null }
  }

  const markRead = async () => {
    if (!clientId) return
    await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('client_id', clientId)
      .eq('read', false)
    setMessages(prev => prev.map(m => ({ ...m, read: true })))
  }

  return { messages, loading, error, send, markRead, subscribe, unsubscribe, refetch: fetchMessages }
}

export function useChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('client_id, text, created_at, read, sender_role')
      .order('created_at', { ascending: false })

    if (!msgs || msgs.length === 0) {
      setConversations([])
      setLoading(false)
      return
    }

    const clientIds = [...new Set(msgs.map(m => m.client_id))]

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', clientIds)

    const profileMap = new Map((profiles ?? []).map(p => [p.id, p.full_name]))

    const convMap = new Map<string, ChatConversation>()
    for (const m of msgs) {
      if (!convMap.has(m.client_id)) {
        convMap.set(m.client_id, {
          client_id: m.client_id,
          client_name: profileMap.get(m.client_id) ?? 'Cliente',
          last_message: m.text,
          last_timestamp: m.created_at,
          unread: 0,
        })
      }
      if (!m.read && m.sender_role === 'client') {
        const c = convMap.get(m.client_id)!
        c.unread += 1
      }
    }

    setConversations([...convMap.values()])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { conversations, loading, refetch: fetch }
}
