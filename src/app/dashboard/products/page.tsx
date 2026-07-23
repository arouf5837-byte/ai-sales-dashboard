import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { deleteProduct } from './actions'
import { DeleteButton } from '@/components/DeleteButton'
import { QuickAdAssign } from '@/components/QuickAdAssign'

export default async function ProductsPage() {
  const supabase = createClient()
  
  // Note: RLS ensures this only fetches products for the user's client
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="text-red-500">Error loading products: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="mt-1 text-sm text-gray-500">প্রোডাক্ট অ্যাড, এডিট বা ডিলিট করুন এবং প্রোডাক্টের সাথে অ্যাড আইডি (Ad ID) অ্যাসাইন করুন!!</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded overflow-hidden">
                      {product.image_url ? (
                        <img className="h-10 w-10 object-cover" src={product.image_url} alt="" />
                      ) : (
                        <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {product.name}
                        {product.meta_ad_ids && product.meta_ad_ids.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {product.meta_ad_ids.length} Ad{product.meta_ad_ids.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{product.name_bn || 'No BN Name'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ৳{product.price}
                  {product.sale_price && (
                    <span className="ml-2 text-red-500 line-through text-xs">৳{product.sale_price}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.stock_qty}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <QuickAdAssign productId={product.id} initialAdIds={product.meta_ad_ids || []} />
                    <Link href={`/dashboard/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteProduct(product.id)
                    }}>
                      <DeleteButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
