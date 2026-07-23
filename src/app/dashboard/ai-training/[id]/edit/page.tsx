import AITrainingForm, { AIContextData } from '@/components/AITrainingForm'
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditAITrainingPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .single()
    
  if (!clientUser) {
    notFound()
  }

  const { data: aiContext, error } = await supabase
    .from('ai_context')
    .select('*')
    .eq('id', id)
    .eq('client_id', clientUser.client_id)
    .single()

  if (error || !aiContext) {
    notFound()
  }

  const initialData: Partial<AIContextData> = {
    id: aiContext.id,
    ai_persona_behavior: aiContext.ai_persona_behavior,
    conversation_examples: aiContext.conversation_examples,
    brand_information: aiContext.brand_information,
    sales_guidelines: aiContext.sales_guidelines,
    response_rules: aiContext.response_rules,
    escalation_rules: aiContext.escalation_rules,
    restricted_topics: aiContext.restricted_topics,
    business_policies: aiContext.business_policies
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 border-b border-gray-200 pb-5">
        <Link href="/dashboard/ai-training" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Edit AI Context
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update instructions and rules for your AI agent.
          </p>
        </div>
      </div>

      <AITrainingForm initialData={initialData} />
    </div>
  )
}
