import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, orderBy, where, getDocs, addDoc, updateDoc, deleteDoc, doc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { PortfolioItem } from '../types'

export function usePortfolio(publishedOnly = true) {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const q = publishedOnly
        ? query(collection(db, 'portfolio_items'), where('published', '==', true), orderBy('sort_order', 'asc'))
        : query(collection(db, 'portfolio_items'), orderBy('sort_order', 'asc'))
      const snap = await getDocs(q)
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }) as PortfolioItem))
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [publishedOnly])

  useEffect(() => { fetch() }, [fetch])

  const create = async (item: Omit<PortfolioItem, 'id' | 'created_at'>) => {
    try {
      const ref = await addDoc(collection(db, 'portfolio_items'), {
        ...item,
        created_at: new Date().toISOString(),
      })
      setItems(prev => [...prev, { id: ref.id, ...item, created_at: new Date().toISOString() } as PortfolioItem])
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const update = async (id: string, updates: Partial<PortfolioItem>) => {
    try {
      await updateDoc(doc(db, 'portfolio_items', id), updates)
      setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'portfolio_items', id))
      setItems(prev => prev.filter(i => i.id !== id))
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const reorder = async (id: string, newOrder: number) => {
    try {
      await updateDoc(doc(db, 'portfolio_items', id), { sort_order: newOrder })
      await fetch()
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { items, loading, error, refetch: fetch, create, update, remove, reorder }
}
