'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ 
  text, 
  loadingText = 'Saving...' 
}: { 
  text: string, 
  loadingText?: string 
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? loadingText : text}
    </button>
  )
}
