'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { regenerateEmbedding } from '@/lib/regenerateEmbedding'

function parseFormData(formData: FormData) {
  return {
    question: formData.get('question') as string,
    question_bn: formData.get('question_bn') as string,
    answer: formData.get('answer') as string,
    answer_bn: formData.get('answer_bn') as string,
    category: formData.get('category') as string,
    keywords: (formData.get('keywords') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
  }
}

export async function createFAQ(formData: FormData) {
  const supabase = createClient()
  const userReq = await supabase.auth.getUser()
  if (!userReq.data.user) throw new Error('Not authenticated')

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', userReq.data.user.id)
    .single()

  if (!clientUser?.client_id) throw new Error('User does not belong to any client')

  const parsed = parseFormData(formData)

  const { data, error } = await supabase
    .from('faq')
    .insert({
      ...parsed,
      client_id: clientUser.client_id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating FAQ:', error)
    throw new Error('Could not create FAQ')
  }

  const mergedText = `Question: ${data.question || ''} | Bangla Question: ${data.question_bn || ''} | Answer: ${data.answer || ''} | Bangla Answer: ${data.answer_bn || ''} | Category: ${data.category || ''} | Keywords: ${(data.keywords || []).join(', ')}`
  regenerateEmbedding({
    table: 'faq',
    recordId: data.id,
    clientId: clientUser.client_id,
    mergedText
  })

  revalidatePath('/dashboard/faq')
  redirect('/dashboard/faq')
}

export async function updateFAQ(id: string, formData: FormData) {
  const supabase = createClient()
  
  const { data: currentFAQ, error: fetchError } = await supabase
    .from('faq')
    .select('id, client_id')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw new Error('Could not fetch FAQ')
  }

  const parsed = parseFormData(formData)

  const { data: updatedFaq, error } = await supabase
    .from('faq')
    .update(parsed)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating FAQ:', error)
    throw new Error('Could not update FAQ')
  }

  const mergedText = `Question: ${updatedFaq.question || ''} | Bangla Question: ${updatedFaq.question_bn || ''} | Answer: ${updatedFaq.answer || ''} | Bangla Answer: ${updatedFaq.answer_bn || ''} | Category: ${updatedFaq.category || ''} | Keywords: ${(updatedFaq.keywords || []).join(', ')}`
  regenerateEmbedding({
    table: 'faq',
    recordId: updatedFaq.id,
    clientId: currentFAQ.client_id,
    mergedText
  })

  revalidatePath('/dashboard/faq')
  redirect('/dashboard/faq')
}

export async function deleteFAQ(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('faq')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting FAQ:', error)
    throw new Error('Could not delete FAQ')
  }

  revalidatePath('/dashboard/faq')
}
