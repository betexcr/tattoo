import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, query, orderBy, where, getDocs, limit,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { ShopItem } from '../types'
import { mapFirestoreError } from '../utils/mapFirestoreError'

export function useShop(category?: string) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchIdRef.current
    setLoading(true)
    setError(null)
    try {
      const q = category
        ? query(collection(db, 'shop_items'), where('category', '==', category), orderBy('created_at', 'asc'), limit(100))
        : query(collection(db, 'shop_items'), orderBy('created_at', 'asc'), limit(100))
      const snap = await getDocs(q)
      if (fetchIdRef.current !== id) return
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ShopItem))
      setLoading(false)
    } catch (e: unknown) {
      if (fetchIdRef.current !== id) return
      setError(mapFirestoreError(e))
      setLoading(false)
    }
  }, [category])

  useEffect(() => { fetch() }, [fetch])

  return { items, loading, error, refetch: fetch }
}
