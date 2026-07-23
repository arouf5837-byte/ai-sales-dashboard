'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function disconnectFacebookPage(clientId: string) {
  const supabase = createClient()
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify this user has access to this client_id
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .eq('client_id', clientId)
    .single()

  if (!clientUser) return { error: 'Unauthorized' }

  // Disconnect the page
  const { error } = await supabase
    .from('clients')
    .update({ 
      fb_page_id: null, 
      fb_page_token: null 
    })
    .eq('client_id', clientId)

  if (error) {
    console.error('Error disconnecting Facebook page:', error)
    return { error: 'Failed to disconnect Facebook page' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function connectFacebookPage(clientId: string, pageData: { id: string; name: string; access_token: string }) {
  const supabase = createClient()
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify this user has access to this client_id
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .eq('client_id', clientId)
    .single()

  if (!clientUser) return { error: 'Unauthorized' }

  // Update the page
  const { error } = await supabase
    .from('clients')
    .update({ 
      fb_page_id: pageData.id, 
      fb_page_token: pageData.access_token,
    })
    .eq('client_id', clientId)

  if (error) {
    if (error.code === '23505') {
      return { error: 'This Facebook Page ID is already connected to another account.' }
    }
    console.error('Error connecting Facebook page:', error)
    return { error: 'Failed to connect Facebook page' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
