import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, query, orderBy, limit, getDocs, addDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Review } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

const ACCESS_DENIED_CODES = new Set(['permission-denied', 'unauthenticated'])

/** Normalize Firestore / Firebase client errors (incl. wrapped `cause`). */
function isFirestoreAccessDenied(e: unknown): boolean {
  let cur: unknown = e
  for (let depth = 0; depth < 4 && cur != null; depth++) {
    if (typeof cur === 'object' && cur !== null && 'code' in cur) {
      const raw = String((cur as { code: string }).code).replace(/^firestore\//, '')
      if (ACCESS_DENIED_CODES.has(raw)) return true
    }
    if (typeof cur === 'object' && cur !== null && 'cause' in cur) {
      cur = (cur as { cause: unknown }).cause
      continue
    }
    break
  }
  const msg = e instanceof Error ? e.message.toLowerCase() : ''
  if (msg.includes('permission') && (msg.includes('denied') || msg.includes('insufficient'))) return true
  return false
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
      // If rules / App Check block reads, fail quietly: static reviews on Home still show; no error banner.
      if (isFirestoreAccessDenied(e)) {
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
