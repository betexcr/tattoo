import { useState, useEffect, useCallback } from 'react'
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Review } from '../types'

interface StoredReview extends Review {
  id: string
  client_id: string | null
  created_at: string
}

export function useReviews() {
  const [reviews, setReviews] = useState<StoredReview[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'))
      const snap = await getDocs(q)
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() }) as StoredReview))
    } catch {
      setReviews([])
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
      setReviews(prev => [{ id: ref.id, ...data } as StoredReview, ...prev])
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { reviews, loading, refetch: fetch, create }
}
