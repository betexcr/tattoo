import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, query, where, orderBy, getDocs, addDoc, doc,
  onSnapshot, type Unsubscribe, writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { ChatMessage, ChatConversation } from '../types'

export function useChat(clientId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unsubRef = useRef<Unsubscribe | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!clientId) { setLoading(false); return }
    setLoading(true)
    try {
      const q = query(
        collection(db, 'chat_messages'),
        where('client_id', '==', clientId),
        orderBy('created_at', 'asc'),
      )
      const snap = await getDocs(q)
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ChatMessage))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const subscribe = useCallback(() => {
    if (!clientId) return
    const q = query(
      collection(db, 'chat_messages'),
      where('client_id', '==', clientId),
      orderBy('created_at', 'asc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ChatMessage))
    }, (e) => {
      setError(e.message)
    })
    unsubRef.current = unsub
  }, [clientId])

  const unsubscribe = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current()
      unsubRef.current = null
    }
  }, [])

  const send = async (text: string, senderRole: 'client' | 'artist') => {
    if (!clientId) return { error: 'No client ID' }
    try {
      await addDoc(collection(db, 'chat_messages'), {
        client_id: clientId,
        sender_role: senderRole,
        text,
        read: false,
        created_at: new Date().toISOString(),
      })
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const markRead = async () => {
    if (!clientId) return
    const unreadMsgs = messages.filter(m => !m.read)
    if (unreadMsgs.length === 0) return
    try {
      const batch = writeBatch(db)
      for (const m of unreadMsgs) {
        batch.update(doc(db, 'chat_messages', m.id), { read: true })
      }
      await batch.commit()
      setMessages(prev => prev.map(m => ({ ...m, read: true })))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  return { messages, loading, error, send, markRead, subscribe, unsubscribe, refetch: fetchMessages }
}

export function useChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'chat_messages'),
        orderBy('created_at', 'desc'),
      )
      const snap = await getDocs(q)
      const msgs = snap.docs.map(d => d.data())

      if (msgs.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const profileSnap = await getDocs(collection(db, 'profiles'))
      const profileMap = new Map<string, string>()
      profileSnap.docs.forEach(d => {
        profileMap.set(d.id, (d.data().full_name as string) || 'Cliente')
      })

      const convMap = new Map<string, ChatConversation>()
      for (const m of msgs) {
        const cid = m.client_id as string
        if (!convMap.has(cid)) {
          convMap.set(cid, {
            client_id: cid,
            client_name: profileMap.get(cid) ?? 'Cliente',
            last_message: m.text as string,
            last_timestamp: m.created_at as string,
            unread: 0,
          })
        }
        if (!m.read && m.sender_role === 'client') {
          convMap.get(cid)!.unread += 1
        }
      }

      setConversations([...convMap.values()])
      setError(null)
    } catch (e: unknown) {
      setError((e as Error).message)
      setConversations([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { conversations, loading, error, refetch: fetch }
}
