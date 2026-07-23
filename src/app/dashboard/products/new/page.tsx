import { ProductForm } from '@/components/ProductForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/products" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <ProductForm />
      </div>
    </div>
  )
}
