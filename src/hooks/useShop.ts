import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ShopItem } from '../types'

export function useShop(category?: string) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('shop_items').select('*').order('created_at', { ascending: true })
    if (category) query = query.eq('category', category)
    const { data, error: err } = await query
    if (err) setError(err.message)
    else setItems((data ?? []) as unknown as ShopItem[])
    setLoading(false)
  }, [category])

  useEffect(() => { fetch() }, [fetch])

  return { items, loading, error, refetch: fetch }
}
