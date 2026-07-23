import { SubmitButton } from '@/components/SubmitButton'
import Link from 'next/link'

export function FAQForm({ 
  action, 
  initialData = {} 
}: { 
  action: (formData: FormData) => void | Promise<void>, 
  initialData?: any 
}) {
  return (
    <form action={action} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-6 sm:space-y-5">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">FAQ Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Provide the question and answer in both English and Bengali.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-5">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700">Question (English)</label>
              <div className="mt-1">
                <input type="text" name="question" id="question" required defaultValue={initialData?.question} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
            <div>
              <label htmlFor="question_bn" className="block text-sm font-medium text-gray-700">Question (Bangla)</label>
              <div className="mt-1">
                <input type="text" name="question_bn" id="question_bn" defaultValue={initialData?.question_bn} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Answer (English)</label>
              <div className="mt-1">
                <textarea id="answer" name="answer" required rows={4} defaultValue={initialData?.answer} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"></textarea>
              </div>
            </div>
            <div>
              <label htmlFor="answer_bn" className="block text-sm font-medium text-gray-700">Answer (Bangla)</label>
              <div className="mt-1">
                <textarea id="answer_bn" name="answer_bn" rows={4} defaultValue={initialData?.answer_bn} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"></textarea>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <div className="mt-1">
                <input type="text" name="category" id="category" defaultValue={initialData?.category} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">Keywords (Comma separated)</label>
              <div className="mt-1">
                <input type="text" name="keywords" id="keywords" defaultValue={initialData?.keywords?.join(', ')} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="delivery, shipping, policy" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end space-x-3">
          <Link
            href="/dashboard/faq"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          <SubmitButton text="Save FAQ" />
        </div>
      </div>
    </form>
  )
}
