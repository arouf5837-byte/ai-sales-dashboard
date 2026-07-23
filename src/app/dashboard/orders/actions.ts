'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Using RLS to ensure they can only update their own orders
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    return { error: 'Failed to update order status' }
  }

  revalidatePath('/dashboard/orders')
  return { success: true }
}

export async function deleteOrder(orderId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Using RLS to ensure they can only delete their own orders
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (error) {
    console.error('Error deleting order:', error)
    return { error: 'Failed to delete order' }
  }

  revalidatePath('/dashboard/orders')
  return { success: true }
}
