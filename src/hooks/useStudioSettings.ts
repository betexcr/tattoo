import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { StudioSettings } from '../types'

export function useStudioSettings() {
  const [settings, setSettings] = useState<StudioSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('studio_settings')
      .select('*')
      .limit(1)
      .single()
    if (err) setError(err.message)
    else setSettings(data as unknown as StudioSettings)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const save = async (updates: Partial<StudioSettings>) => {
    if (!settings) return { error: 'No settings loaded' }
    const { error: err } = await supabase
      .from('studio_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
    if (err) return { error: err.message }
    setSettings(prev => prev ? { ...prev, ...updates } : prev)
    return { error: null }
  }

  return { settings, loading, error, refetch: fetch, save }
}
