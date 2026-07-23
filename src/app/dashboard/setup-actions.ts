'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setupAgent(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const brand_name = formData.get('brand_name') as string
  const fb_page_id = formData.get('fb_page_id') as string
  const fb_page_token = formData.get('fb_page_token') as string
  const language_default = formData.get('language_default') as string || 'bn'
  
  // Optional WooCommerce fields
  const woo_url = formData.get('woo_url') as string | null
  const woo_consumer_key = formData.get('woo_consumer_key') as string | null
  const woo_consumer_secret = formData.get('woo_consumer_secret') as string | null

  if (!brand_name || !fb_page_id || !fb_page_token) {
    return { error: 'Please fill in all required fields (Page Name, ID, Token)' }
  }

  // Generate the client_id beforehand to avoid RLS .select() issue
  const client_id = crypto.randomUUID()

  // 1. Create client without returning data. is_active is set to false (pending payment).
  const { error: clientError } = await supabase
    .from('clients')
    .insert({
      client_id,
      brand_name,
      fb_page_id,
      fb_page_token,
      language_default,
      woo_url: woo_url || null,
      woo_consumer_key: woo_consumer_key || null,
      woo_consumer_secret: woo_consumer_secret || null,
      is_active: false // IMPORTANT: Defaults to false as requested
    })

  if (clientError) {
    if (clientError.code === '23505') { // Unique constraint violation
      return { error: 'This Facebook Page ID is already registered.' }
    }
    console.error('Error creating client:', clientError)
    return { error: 'Failed to create agent. Please check your data and try again.' }
  }

  // 2. Link user to client
  const { error: linkError } = await supabase
    .from('client_users')
    .insert({
      user_id: user.id,
      client_id: client_id,
      email: user.email,
      role: 'admin' // Default role
    })

  if (linkError) {
    console.error('Error linking user:', linkError)
    return { error: 'Failed to link user to brand.' }
  }

  // Revalidate dashboard layout so it fetches the new client data
  revalidatePath('/dashboard', 'layout')
  
  return { success: true }
}
