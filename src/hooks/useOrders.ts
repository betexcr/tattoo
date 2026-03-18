import { useState, useEffect, useCallback } from 'react'
import {
  collection, query, orderBy, getDocs, addDoc, updateDoc, doc, where,
} from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Order, OrderItem } from '../types'

interface CreateOrderInput {
  client_name: string
  client_email: string
  client_phone?: string
  client_address?: string
  total: number
  items: Array<{
    shop_item_id: string
    quantity: number
    size: string
    color: string
    price: number
  }>
}

export function useOrders(clientId?: string | null) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const constraints = clientId
        ? [where('client_id', '==', clientId), orderBy('created_at', 'desc')]
        : [orderBy('created_at', 'desc')]
      const q = query(collection(db, 'orders'), ...constraints)
      const snap = await getDocs(q)
      const orderList = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order)

      const itemSnap = await getDocs(collection(db, 'order_items'))
      const allItems = itemSnap.docs.map(d => ({ id: d.id, ...d.data() }) as OrderItem)
      const itemsByOrder = new Map<string, OrderItem[]>()
      for (const item of allItems) {
        const list = itemsByOrder.get(item.order_id) ?? []
        list.push(item)
        itemsByOrder.set(item.order_id, list)
      }

      for (const order of orderList) {
        order.items = itemsByOrder.get(order.id) ?? []
      }

      setOrders(orderList)
    } catch (e: unknown) {
      setError((e as Error).message)
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => { fetch() }, [fetch])

  const create = async (input: CreateOrderInput): Promise<{ error: string | null; data?: Order }> => {
    try {
      const user = auth.currentUser

      const orderRef = await addDoc(collection(db, 'orders'), {
        client_id: user?.uid ?? null,
        client_name: input.client_name,
        client_email: input.client_email,
        client_phone: input.client_phone ?? '',
        client_address: input.client_address ?? '',
        total: input.total,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

      for (const item of input.items) {
        await addDoc(collection(db, 'order_items'), {
          order_id: orderRef.id,
          ...item,
        })
      }

      const newOrder = {
        id: orderRef.id,
        client_id: user?.uid ?? null,
        client_name: input.client_name,
        client_email: input.client_email,
        client_phone: input.client_phone ?? '',
        client_address: input.client_address ?? '',
        total: input.total,
        status: 'pending',
        created_at: new Date().toISOString(),
      } as Order
      setOrders(prev => [newOrder, ...prev])

      return { error: null, data: newOrder }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      return { error: null }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { orders, loading, error, refetch: fetch, create, updateStatus }
}
