import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Reminder } from '../types'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('reminders')
      .select('*')
      .order('date', { ascending: true })
    if (err) setError(err.message)
    else setReminders((data ?? []) as unknown as Reminder[])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (reminder: Omit<Reminder, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase
      .from('reminders')
      .insert(reminder)
      .select()
      .single()
    if (err) return { error: err.message }
    setReminders(prev => [...prev, data as unknown as Reminder])
    return { error: null }
  }

  const toggleComplete = async (id: string) => {
    const r = reminders.find(r => r.id === id)
    if (!r) return
    const { error: err } = await supabase
      .from('reminders')
      .update({ completed: !r.completed })
      .eq('id', id)
    if (!err) {
      setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
    }
  }

  const remove = async (id: string) => {
    const { error: err } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
    if (!err) setReminders(prev => prev.filter(r => r.id !== id))
  }

  return { reminders, loading, error, refetch: fetch, create, toggleComplete, remove }
}
