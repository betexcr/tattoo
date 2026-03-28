import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { AppNotification } from '../types'

export function useNotifications(userId?: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const q = query(
        collection(db, 'notifications'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
      )
      const snap = await getDocs(q)
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }) as AppNotification))
      setError(null)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    if (unread.length === 0) return
    try {
      const batch = writeBatch(db)
      for (const n of unread) {
        batch.update(doc(db, 'notifications', n.id), { read: true })
      }
      await batch.commit()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  const create = async (input: Omit<AppNotification, 'id' | 'created_at' | 'read'>) => {
    try {
      const data = { ...input, read: false, created_at: new Date().toISOString() }
      const ref = await addDoc(collection(db, 'notifications'), data)
      setNotifications(prev => [{ id: ref.id, ...data } as AppNotification, ...prev])
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { notifications, unreadCount, loading, error, refetch: fetch, markRead, markAllRead, create }
}
