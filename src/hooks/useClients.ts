import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Profile } from '../types'

export function useClients() {
  const [clients, setClients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'profiles'), where('role', '==', 'client'))
      const snap = await getDocs(q)
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Profile))
    } catch {
      setClients([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { clients, loading, refetch: fetch }
}
