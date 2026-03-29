import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, query, where, orderBy, limit, getDocs, addDoc, doc,
  documentId, onSnapshot, type Unsubscribe, writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { ChatMessage, ChatConversation } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

export function useChat(clientId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const unsubRef = useRef<Unsubscribe | null>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const fetchIdRef = useRef(0)

  const fetchMessages = useCallback(async () => {
    const id = ++fetchIdRef.current
    if (!clientId) {
      setMessages([])
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const q = query(
        collection(db, 'chat_messages'),
        where('client_id', '==', clientId),
        orderBy('created_at', 'asc'),
        limit(100),
      )
      const snap = await getDocs(q)
      if (fetchIdRef.current !== id) return
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ChatMessage))
      setLoading(false)
    } catch (e: unknown) {
      if (fetchIdRef.current !== id) return
      setError(mapFirestoreError(e))
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    if (!unsubRef.current) fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    return () => { unsubRef.current?.() }
  }, [clientId])

  const subscribe = useCallback(() => {
    if (!clientId) return
    if (unsubRef.current) unsubRef.current()
    const q = query(
      collection(db, 'chat_messages'),
      where('client_id', '==', clientId),
      orderBy('created_at', 'asc'),
      limit(100),
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ChatMessage))
    }, (e) => {
      setError(mapFirestoreError(e))
    })
    unsubRef.current = unsub
  }, [clientId])

  const unsubscribe = useCallback(() => {
    if (unsubRef.current) {
      unsubRef.current()
      unsubRef.current = null
    }
  }, [])

  const send = useCallback(async (text: string, senderRole: 'client' | 'artist') => {
    if (!clientId) return { error: 'ID de cliente no disponible' }
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
      return { error: mapFirestoreError(e) }
    }
  }, [clientId])

  const markRead = useCallback(async () => {
    if (!clientId) return
    const unreadMsgs = messagesRef.current.filter(m => !m.read)
    if (unreadMsgs.length === 0) return
    try {
      for (let i = 0; i < unreadMsgs.length; i += 500) {
        const chunk = unreadMsgs.slice(i, i + 500)
        const batch = writeBatch(db)
        for (const m of chunk) {
          batch.update(doc(db, 'chat_messages', m.id), { read: true })
        }
        await batch.commit()
      }
      setMessages(prev => prev.map(m => ({ ...m, read: true })))
    } catch (e: unknown) {
      setError(mapFirestoreError(e))
    }
  }, [clientId])

  return { messages, loading, error, send, markRead, subscribe, unsubscribe, refetch: fetchMessages }
}

export function useChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const q = query(
        collection(db, 'chat_messages'),
        orderBy('created_at', 'desc'),
        limit(50),
      )
      const snap = await getDocs(q)
      if (fetchIdRef.current !== id) return
      const msgs = snap.docs.map(d => d.data())

      if (msgs.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const clientIds = [...new Set(msgs.map(m => m.client_id as string))]
      const profileMap = new Map<string, string>()
      for (let i = 0; i < clientIds.length; i += 30) {
        const batch = clientIds.slice(i, i + 30)
        const pSnap = await getDocs(query(collection(db, 'profiles'), where(documentId(), 'in', batch)))
        if (fetchIdRef.current !== id) return
        pSnap.docs.forEach(d => {
          profileMap.set(d.id, (d.data().full_name as string) || 'Cliente')
        })
      }

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
      setLoading(false)
    } catch (e: unknown) {
      if (fetchIdRef.current !== id) return
      setError(mapFirestoreError(e))
      setConversations([])
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { conversations, loading, error, refetch: fetch }
}
