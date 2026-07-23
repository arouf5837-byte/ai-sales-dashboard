import { FAQForm } from '@/components/FAQForm'
import { createFAQ } from '../actions'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewFAQPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/faq" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">Add New FAQ</h2>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <FAQForm action={createFAQ} />
      </div>
    </div>
  )
}
