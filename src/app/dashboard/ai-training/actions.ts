'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function triggerWebhook(clientId: string, data: any) {
  const webhookUrl = 'https://2248-1556.n8nbysnbd.top/webhook/prompt'
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        ...data
      }),
    })
    if (!response.ok) {
      console.error('Webhook failed:', await response.text())
    }
  } catch (err) {
    console.error('Webhook fetch error:', err)
  }
}

export async function createAIContext(formData: FormData) {
  const data = {
    ai_persona_behavior: formData.get('ai_persona_behavior')?.toString() || '',
    conversation_examples: formData.get('conversation_examples')?.toString() || '',
    brand_information: formData.get('brand_information')?.toString() || '',
    sales_guidelines: formData.get('sales_guidelines')?.toString() || '',
    response_rules: formData.get('response_rules')?.toString() || '',
    escalation_rules: formData.get('escalation_rules')?.toString() || '',
    restricted_topics: formData.get('restricted_topics')?.toString() || '',
    business_policies: formData.get('business_policies')?.toString() || ''
  }

  const hasData = Object.values(data).some(val => val.trim().length > 0)
  if (!hasData) {
    return { error: 'Please provide at least some training instructions.' }
  }

  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'Not authenticated' }

  const { data: clientUser, error: clientUserError } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .single()
    
  if (clientUserError || !clientUser) {
    return { error: 'Failed to find your brand. Please ensure you have setup a brand.' }
  }

  const { error: insertError } = await supabase
    .from('ai_context')
    .insert({
      ...data,
      client_id: clientUser.client_id
    })

  if (insertError) {
    console.error('Failed to insert ai_context to database:', insertError)
    return { error: 'Failed to save context.' }
  }

  await triggerWebhook(clientUser.client_id, data)

  revalidatePath('/dashboard/ai-training')
  return { success: true }
}

export async function updateAIContext(id: string, formData: FormData) {
  const data = {
    ai_persona_behavior: formData.get('ai_persona_behavior')?.toString() || '',
    conversation_examples: formData.get('conversation_examples')?.toString() || '',
    brand_information: formData.get('brand_information')?.toString() || '',
    sales_guidelines: formData.get('sales_guidelines')?.toString() || '',
    response_rules: formData.get('response_rules')?.toString() || '',
    escalation_rules: formData.get('escalation_rules')?.toString() || '',
    restricted_topics: formData.get('restricted_topics')?.toString() || '',
    business_policies: formData.get('business_policies')?.toString() || ''
  }

  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: 'Not authenticated' }

  const { data: clientUser, error: clientUserError } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .single()
    
  if (clientUserError || !clientUser) {
    return { error: 'Failed to find your brand.' }
  }

  const { error: updateError } = await supabase
    .from('ai_context')
    .update(data)
    .eq('id', id)
    .eq('client_id', clientUser.client_id) // ensure they own it

  if (updateError) {
    console.error('Failed to update ai_context in database:', updateError)
    return { error: 'Failed to update context.' }
  }

  await triggerWebhook(clientUser.client_id, data)

  revalidatePath('/dashboard/ai-training')
  return { success: true }
}

export async function deleteAIContext(id: string) {
  const supabase = createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Not authenticated')

  const { data: clientUser, error: clientUserError } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .single()
    
  if (clientUserError || !clientUser) throw new Error('Failed to find your brand.')

  const { error } = await supabase
    .from('ai_context')
    .delete()
    .eq('id', id)
    .eq('client_id', clientUser.client_id)

  if (error) {
    console.error('Error deleting AI Context:', error)
    throw new Error('Could not delete AI Context')
  }

  revalidatePath('/dashboard/ai-training')
}
