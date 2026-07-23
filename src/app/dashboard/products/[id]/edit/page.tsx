import { ProductForm } from '@/components/ProductForm'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditProductPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: product, error } = await (await supabase)
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/products" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <ProductForm initialData={product} isEdit={true} />
      </div>
    </div>
  )
}
