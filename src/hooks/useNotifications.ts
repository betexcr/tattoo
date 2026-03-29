import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { AppNotification } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

export function useNotifications(userId?: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current
    if (!userId) {
      setNotifications([])
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const q = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        limit(50),
      )
      const snap = await getDocs(q)
      if (fetchIdRef.current !== id) return
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }) as AppNotification))
      setLoading(false)
    } catch (e: unknown) {
      if (fetchIdRef.current !== id) return
      setError(mapFirestoreError(e))
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (e: unknown) {
      setError(mapFirestoreError(e))
    }
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    if (unread.length === 0) return
    try {
      for (let i = 0; i < unread.length; i += 500) {
        const chunk = unread.slice(i, i + 500)
        const batch = writeBatch(db)
        for (const n of chunk) {
          batch.update(doc(db, 'notifications', n.id), { read: true })
        }
        await batch.commit()
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e: unknown) {
      setError(mapFirestoreError(e))
    }
  }

  const create = async (input: Omit<AppNotification, 'id' | 'created_at' | 'read'>) => {
    try {
      const data = { ...input, read: false, created_at: new Date().toISOString() }
      const ref = await addDoc(collection(db, 'notifications'), data)
      setNotifications(prev => [{ id: ref.id, ...data } as AppNotification, ...prev])
      return { error: null }
    } catch (e: unknown) {
      return { error: mapFirestoreError(e) }
    }
  }

  return { notifications, unreadCount, loading, error, refetch: fetch, markRead, markAllRead, create }
}
