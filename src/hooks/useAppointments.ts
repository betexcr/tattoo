import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../types'

export function useAppointments(clientOnly = false) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })

    if (err) setError(err.message)
    else setAppointments((data ?? []) as unknown as Appointment[])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (appt: Omit<Appointment, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase
      .from('appointments')
      .insert(appt)
      .select()
      .single()
    if (err) return { error: err.message }
    setAppointments(prev => [...prev, data as unknown as Appointment])
    return { error: null, data: data as unknown as Appointment }
  }

  const updateStatus = async (id: string, status: Appointment['status']) => {
    const { error: err } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
    if (err) return { error: err.message }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    return { error: null }
  }

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const { error: err } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
    if (err) return { error: err.message }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
    return { error: null }
  }

  const remove = async (id: string) => {
    const { error: err } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    if (err) return { error: err.message }
    setAppointments(prev => prev.filter(a => a.id !== id))
    return { error: null }
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

  const filtered = clientOnly
    ? appointments
    : appointments

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
