import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, limit,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Reminder } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const q = query(collection(db, 'reminders'), orderBy('date', 'asc'), limit(200))
      const snap = await getDocs(q)
      if (fetchIdRef.current !== id) return
      setReminders(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Reminder))
      setLoading(false)
    } catch (e: unknown) {
      if (fetchIdRef.current !== id) return
      setError(mapFirestoreError(e))
      setLoading(false)
    }
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
      return { error: mapFirestoreError(e) }
    }
  }

  const toggleComplete = async (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (!reminder) return { error: 'No encontrado' }
    const nextCompleted = !reminder.completed
    try {
      await updateDoc(doc(db, 'reminders', id), { completed: nextCompleted })
      setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: nextCompleted } : r))
      return { error: null }
    } catch (e: unknown) {
      return { error: mapFirestoreError(e) }
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reminders', id))
      setReminders(prev => prev.filter(r => r.id !== id))
      return { error: null }
    } catch (e: unknown) {
      return { error: mapFirestoreError(e) }
    }
  }

  return { reminders, loading, error, refetch: fetch, create, toggleComplete, remove }
}
