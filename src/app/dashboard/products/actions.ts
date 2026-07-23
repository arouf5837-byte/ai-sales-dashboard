'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import { regenerateEmbedding } from '@/lib/regenerateEmbedding'

export async function deleteProduct(id: string) {
  const supabase = createClient()
  
  const { error } = await (await supabase)
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    throw new Error('Could not delete product')
  }

  revalidatePath('/dashboard/products')
}

export async function quickUpdateAdIds(id: string, meta_ad_ids: string[]) {
  const supabase = await createClient()
  
  // 1. Update the database
  const { error, data: product } = await supabase
    .from('products')
    .update({ meta_ad_ids })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating ad IDs:', error)
    return { error: 'Could not update Ad IDs' }
  }

  // 2. Regenerate AI Embedding
  const mergedText = `Product ID: ${product.id} | Name: ${product.name || ''} | Bangla Name: ${product.name_bn || ''} | Description: ${product.description || ''} | Category: ${product.category || ''} | Price: ${product.price || ''} | Sale Price: ${product.sale_price || ''} | Sizes: ${(product.sizes || []).join(', ')} | Colors: ${(product.colors || []).join(', ')} | Ad IDs: ${(product.meta_ad_ids || []).join(', ')}`
  
  regenerateEmbedding({
    table: 'products',
    recordId: product.id,
    clientId: product.client_id,
    mergedText
  })

  revalidatePath('/dashboard/products')
  return { success: true }
}
