import { collection, addDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase'
import type { Order } from '../types'

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

export function useOrders() {
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

      return {
        error: null,
        data: {
          id: orderRef.id,
          client_id: user?.uid ?? null,
          client_name: input.client_name,
          client_email: input.client_email,
          client_phone: input.client_phone ?? '',
          client_address: input.client_address ?? '',
          total: input.total,
          status: 'pending',
          created_at: new Date().toISOString(),
        } as Order,
      }
    } catch (e: unknown) {
      return { error: (e as Error).message }
    }
  }

  return { create }
}
