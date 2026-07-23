'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleAgentStatus(clientId: string, isActive: boolean) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify the user has access to this client and get payment lock status
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .eq('client_id', clientId)
    .single()

  if (!clientUser) throw new Error('Unauthorized')

  // Check if client is payment locked
  const { data: clientData } = await supabase
    .from('clients')
    .select('is_payment_locked')
    .eq('client_id', clientId)
    .single()

  if (clientData?.is_payment_locked) {
    return { error: 'Your account is locked due to pending payments.' }
  }

  const updatePayload = {
    is_active: isActive
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updatePayload)
    .eq('client_id', clientId)
    .select()

  if (error) {
    console.error('Error toggling agent status:', error)
    return { error: 'Failed to update agent status' }
  }

  if (!data || data.length === 0) {
    console.error('No rows updated, likely due to RLS or missing client_id:', clientId)
    return { error: 'Failed to update agent status (unauthorized or not found)' }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
