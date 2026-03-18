import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { AppNotification } from '../types'

export function useNotifications(userId?: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

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
    } catch {
      setNotifications([])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { /* */ }
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read)
    for (const n of unread) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {})
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
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

  return { notifications, unreadCount, loading, refetch: fetch, markRead, markAllRead, create }
}
