import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { StudioSettings } from '../types'

const SETTINGS_DOC = doc(db, 'studio_settings', 'main')

export function useStudioSettings() {
  const [settings, setSettings] = useState<StudioSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const snap = await getDoc(SETTINGS_DOC)
      if (snap.exists()) {
        setSettings({ id: snap.id, ...snap.data() } as StudioSettings)
      }
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const save = async (updates: Partial<StudioSettings>) => {
    try {
      await setDoc(SETTINGS_DOC, { ...updates, updated_at: new Date().toISOString() }, { merge: true })
      setSettings(prev => prev ? { ...prev, ...updates } : prev)
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { settings, loading, error, refetch: fetch, save }
}
