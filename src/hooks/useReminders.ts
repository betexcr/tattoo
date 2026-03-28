import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Reminder } from '../types'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'reminders'), orderBy('date', 'asc'))
      const snap = await getDocs(q)
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Reminder))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (reminder: Omit<Reminder, 'id' | 'created_at'>) => {
    try {
      const ref = await addDoc(collection(db, 'reminders'), {
        ...reminder,
        created_at: new Date().toISOString(),
      })
      setReminders(prev => [...prev, { id: ref.id, ...reminder, created_at: new Date().toISOString() } as Reminder])
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const toggleComplete = async (id: string) => {
    const r = reminders.find(r => r.id === id)
    if (!r) return { error: 'Not found' }
    try {
      await updateDoc(doc(db, 'reminders', id), { completed: !r.completed })
      setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reminders', id))
      setReminders(prev => prev.filter(r => r.id !== id))
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { reminders, loading, error, refetch: fetch, create, toggleComplete, remove }
}
