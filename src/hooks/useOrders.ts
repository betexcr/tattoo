import { supabase } from '../lib/supabase'
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
    const user = (await supabase.auth.getUser()).data.user

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        client_id: user?.id ?? null,
        client_name: input.client_name,
        client_email: input.client_email,
        client_phone: input.client_phone ?? '',
        client_address: input.client_address ?? '',
        total: input.total,
      })
      .select()
      .single()

    if (orderErr || !order) return { error: orderErr?.message ?? 'Failed to create order' }

    const orderItems = input.items.map(i => ({
      order_id: order.id,
      ...i,
    }))

    const { error: itemsErr } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsErr) return { error: itemsErr.message }

    return { error: null, data: order as unknown as Order }
  }

  return { create }
}
