import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, orderBy, where, getDocs,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { ShopItem } from '../types'

export function useShop(category?: string) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = category
        ? query(collection(db, 'shop_items'), where('category', '==', category), orderBy('created_at', 'asc'))
        : query(collection(db, 'shop_items'), orderBy('created_at', 'asc'))
      const snap = await getDocs(q)
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }) as ShopItem))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [category])

  useEffect(() => { fetch() }, [fetch])

  return { items, loading, error, refetch: fetch }
}
