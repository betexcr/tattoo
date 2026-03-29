import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Profile } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

export function useClients() {
  const [clients, setClients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const q = query(collection(db, 'profiles'), where('role', '==', 'client'), limit(500))
      const snap = await getDocs(q)
      if (fetchIdRef.current !== id) return
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Profile))
      setLoading(false)
    } catch (e: unknown) {
      if (fetchIdRef.current !== id) return
      setError(mapFirestoreError(e))
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { clients, loading, error, refetch: fetch }
}
