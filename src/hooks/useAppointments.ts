import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Appointment } from '../types'

export function useAppointments(clientOnly = false) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'appointments'), orderBy('date', 'asc'))
      const snap = await getDocs(q)
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Appointment))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (appt: Omit<Appointment, 'id' | 'created_at'>) => {
    try {
      const ref = await addDoc(collection(db, 'appointments'), {
        ...appt,
        created_at: new Date().toISOString(),
      })
      const newAppt = { id: ref.id, ...appt, created_at: new Date().toISOString() } as Appointment
      setAppointments(prev => [...prev, newAppt])
      return { error: null, data: newAppt }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const updateStatus = async (id: string, status: Appointment['status']) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status })
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      await updateDoc(doc(db, 'appointments', id), updates)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'appointments', id))
      setAppointments(prev => prev.filter(a => a.id !== id))
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const getOccupiedSlots = useCallback((): Record<string, string[]> => {
    const slots: Record<string, string[]> = {}
    for (const a of appointments) {
      if (a.status === 'rejected') continue
      const d = a.date
      if (!slots[d]) slots[d] = []
      const t = a.time.length === 5 ? a.time : a.time.slice(0, 5)
      slots[d].push(t)
    }
    return slots
  }, [appointments])

  const filtered = clientOnly ? appointments : appointments

  return {
    appointments: filtered,
    loading,
    error,
    refetch: fetch,
    create,
    updateStatus,
    updateAppointment,
    remove,
    getOccupiedSlots,
  }
}
