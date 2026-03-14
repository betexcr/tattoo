import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { PortfolioItem } from '../types'

export function usePortfolio(publishedOnly = true) {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('portfolio_items')
      .select('*')
      .order('sort_order', { ascending: true })

    if (publishedOnly) query = query.eq('published', true)

    const { data, error: err } = await query
    if (err) setError(err.message)
    else setItems((data ?? []) as unknown as PortfolioItem[])
    setLoading(false)
  }, [publishedOnly])

  useEffect(() => { fetch() }, [fetch])

  const create = async (item: Omit<PortfolioItem, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase
      .from('portfolio_items')
      .insert(item)
      .select()
      .single()
    if (err) return { error: err.message }
    setItems(prev => [...prev, data as unknown as PortfolioItem])
    return { error: null }
  }

  const update = async (id: string, updates: Partial<PortfolioItem>) => {
    const { error: err } = await supabase
      .from('portfolio_items')
      .update(updates)
      .eq('id', id)
    if (err) return { error: err.message }
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
    return { error: null }
  }

  const remove = async (id: string) => {
    const { error: err } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', id)
    if (err) return { error: err.message }
    setItems(prev => prev.filter(i => i.id !== id))
    return { error: null }
  }

  const reorder = async (id: string, newOrder: number) => {
    const { error: err } = await supabase
      .from('portfolio_items')
      .update({ sort_order: newOrder })
      .eq('id', id)
    if (!err) await fetch()
    return { error: err?.message ?? null }
  }

  return { items, loading, error, refetch: fetch, create, update, remove, reorder }
}
