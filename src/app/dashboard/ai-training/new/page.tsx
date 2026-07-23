import AITrainingForm from '@/components/AITrainingForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewAITrainingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 border-b border-gray-200 pb-5">
        <Link href="/dashboard/ai-training" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Add New AI Context
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a new set of instructions and rules for your AI agent.
          </p>
        </div>
      </div>

      <AITrainingForm />
    </div>
  )
}
