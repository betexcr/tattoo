import { useState, useEffect, useCallback } from 'react'
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Review } from '../types'

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Review))
      setError(null)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
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
      return { error: (e as Error).message }
    }
  }

  return { reviews, loading, error, refetch: fetch, create }
}
