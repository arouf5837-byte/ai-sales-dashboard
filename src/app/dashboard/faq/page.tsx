import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, Edit } from 'lucide-react'
import { deleteFAQ } from './actions'
import { DeleteButton } from '@/components/DeleteButton'

export default async function FAQPage() {
  const supabase = createClient()
  
  const { data: faqs, error } = await supabase
    .from('faq')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="text-red-500">Error loading FAQs: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">FAQs</h2>
        <Link
          href="/dashboard/faq/new"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add FAQ
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {faqs?.map((faq) => (
              <tr key={faq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">{faq.answer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {faq.category || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <Link href={`/dashboard/faq/${faq.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteFAQ(faq.id)
                    }}>
                      <DeleteButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!faqs || faqs.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">
                  No FAQs found. Click "Add FAQ" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
