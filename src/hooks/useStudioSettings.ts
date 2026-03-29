import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useStudioConfig } from '../contexts/StudioConfigContext'
import type { StudioSettings } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

const SETTINGS_DOC = doc(db, 'studio_settings', 'main')

export function useStudioSettings() {
  const { rawSettings, loading, error, refetch } = useStudioConfig()

  const save = async (updates: Partial<StudioSettings>) => {
    try {
      await setDoc(SETTINGS_DOC, { ...updates, updated_at: new Date().toISOString() }, { merge: true })
      await refetch()
      return { error: null }
    } catch (e: unknown) {
      return { error: mapFirestoreError(e) }
    }
  }

  return { settings: rawSettings, loading, error, refetch, save }
}
