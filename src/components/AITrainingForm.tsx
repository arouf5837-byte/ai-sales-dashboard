'use client'

import { useState } from 'react'
import { createAIContext, updateAIContext } from '../app/dashboard/ai-training/actions'
import { Bot, MessageSquare, Briefcase, FileText, Settings, AlertTriangle, ShieldOff, Building } from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface AIContextData {
  id?: string
  ai_persona_behavior: string
  conversation_examples: string
  brand_information: string
  sales_guidelines: string
  response_rules: string
  escalation_rules: string
  restricted_topics: string
  business_policies: string
}

export default function AITrainingForm({ initialData }: { initialData?: Partial<AIContextData> }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState<Partial<AIContextData>>({
    ai_persona_behavior: initialData?.ai_persona_behavior || '',
    conversation_examples: initialData?.conversation_examples || '',
    brand_information: initialData?.brand_information || '',
    sales_guidelines: initialData?.sales_guidelines || '',
    response_rules: initialData?.response_rules || '',
    escalation_rules: initialData?.escalation_rules || '',
    restricted_topics: initialData?.restricted_topics || '',
    business_policies: initialData?.business_policies || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value || '')
    })

    let result;
    if (initialData?.id) {
      result = await updateAIContext(initialData.id, form)
    } else {
      result = await createAIContext(form)
    }

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      router.push('/dashboard/ai-training')
      router.refresh()
    }
  }

  const sections = [
    {
      id: 'ai_persona_behavior',
      title: 'AI Persona & Behavior',
      icon: <Bot className="h-5 w-5 mr-2 text-indigo-500" />,
      description: 'Describe how your AI agent should interact with customers. What is the tone of voice? Are there specific rules it must follow?',
      placeholder: 'Example: You are a friendly sales agent for Fashion BD. Always greet the user with a smile. Be polite but concise.'
    },
    {
      id: 'conversation_examples',
      title: 'Conversation Examples',
      icon: <MessageSquare className="h-5 w-5 mr-2 text-indigo-500" />,
      description: 'Provide a few examples of how the AI should respond to common customer queries.',
      placeholder: 'Customer: Do you have this shirt in blue?\nAgent: Yes, we do have it in blue! You can check it out here: [link]'
    },
    {
      id: 'brand_information',
      title: 'Brand Information',
      icon: <Briefcase className="h-5 w-5 mr-2 text-indigo-500" />,
      description: 'General information about your brand, history, target audience, and core values.',
      placeholder: 'Example: We are an eco-friendly clothing brand based in Dhaka. We specialize in sustainable fashion for youth.'
    },
    {
      id: 'sales_guidelines',
      title: 'Sales Guidelines',
      icon: <FileText className="h-5 w-5 mr-2 text-indigo-500" />,
      description: 'Instructions on how to upsell, offer discounts, or handle objections.',
      placeholder: 'Example: If a user buys 3 items, offer a 10% discount. Recommend accessories if they buy a shirt.'
    },
    {
      id: 'response_rules',
      title: 'Response Rules',
      icon: <Settings className="h-5 w-5 mr-2 text-indigo-500" />,
      description: 'Specific rules on formatting, language, or length of responses.',
      placeholder: 'Example: Always reply in English or Banglish based on the users language. Keep answers under 2 sentences.'
    },
    {
      id: 'escalation_rules',
      title: 'Escalation Rules',
      icon: <AlertTriangle className="h-5 w-5 mr-2 text-indigo-500" />,
      description: 'When and how the AI should hand over the conversation to a human agent.',
      placeholder: 'Example: If the customer asks for a refund, apologize and say a human agent will contact them shortly.'
    },
    {
      id: 'restricted_topics',
      title: 'Restricted Topics',
      icon: <ShieldOff className="h-5 w-5 mr-2 text-indigo-500" />,
      description: 'Topics the AI must absolutely avoid discussing.',
      placeholder: 'Example: Never discuss politics, religion, or competitors pricing.'
    },
    {
      id: 'business_policies',
      title: 'Business Policies',
      icon: <Building className="h-5 w-5 mr-2 text-indigo-500" />,
      description: 'Your return policies, shipping times, warranty information, etc.',
      placeholder: 'Example: We offer 7-day returns if the tag is intact. Delivery inside Dhaka takes 2-3 days, outside Dhaka 5-7 days.'
    }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl pb-12">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.id} className="bg-white shadow sm:rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              {section.icon}
              {section.title}
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>{section.description}</p>
            </div>
            <div className="mt-5">
              <textarea
                name={section.id}
                rows={section.id === 'conversation_examples' ? 6 : 4}
                value={formData[section.id as keyof AIContextData]}
                onChange={handleChange}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 transition-colors duration-200 hover:border-gray-400"
                placeholder={section.placeholder}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="sticky bottom-0 bg-gray-50/80 backdrop-blur-sm p-4 border-t border-gray-200 -mx-4 sm:mx-0 sm:rounded-lg flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/ai-training')}
          className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save AI Context'
          )}
        </button>
      </div>
    </form>
  )
}
