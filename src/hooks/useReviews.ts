import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, query, orderBy, limit, getDocs, addDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Review } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

function firestoreErrorCode(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e) {
    return String((e as { code: string }).code).replace(/^firestore\//, '')
  }
  return ''
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'), limit(50))
      const snap = await getDocs(q)
      if (fetchIdRef.current !== id) return
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Review))
      setLoading(false)
    } catch (e: unknown) {
      if (fetchIdRef.current !== id) return
      // Public read should succeed; if rules/App Check block guests, avoid a misleading "log in" banner — fall back to empty list (e.g. static reviews on Home).
      if (firestoreErrorCode(e) === 'permission-denied') {
        setReviews([])
        setError(null)
      } else {
        setError(mapFirestoreError(e))
      }
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (review: { name: string; text: string; rating: number; style: string }) => {
    try {
      const user = auth.currentUser
      const data = {
        ...review,
        client_id: user?.uid ?? null,
        created_at: new Date().toISOString(),
      }
      const ref = await addDoc(collection(db, 'reviews'), data)
      setReviews(prev => [{ id: ref.id, ...data } as Review, ...prev])
      return { error: null }
    } catch (e: unknown) {
      return { error: mapFirestoreError(e) }
    }
  }

  return { reviews, loading, error, refetch: fetch, create }
}
