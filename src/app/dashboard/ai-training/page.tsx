import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Edit, Plus, Bot, MessageSquare, Briefcase, FileText, Settings, AlertTriangle, ShieldOff, Building } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AITrainingPage() {
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
    
  let context: any = null

  if (clientUser) {
    const { data: aiContext, error } = await supabase
      .from('ai_context')
      .select('*')
      .eq('client_id', clientUser.client_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!error && aiContext) {
      context = aiContext
    }
  }

  const sections = [
    { id: 'ai_persona_behavior', title: 'AI Persona & Behavior', icon: <Bot className="h-5 w-5 text-indigo-500 mr-2" /> },
    { id: 'conversation_examples', title: 'Conversation Examples', icon: <MessageSquare className="h-5 w-5 text-indigo-500 mr-2" /> },
    { id: 'brand_information', title: 'Brand Information', icon: <Briefcase className="h-5 w-5 text-indigo-500 mr-2" /> },
    { id: 'sales_guidelines', title: 'Sales Guidelines', icon: <FileText className="h-5 w-5 text-indigo-500 mr-2" /> },
    { id: 'response_rules', title: 'Response Rules', icon: <Settings className="h-5 w-5 text-indigo-500 mr-2" /> },
    { id: 'escalation_rules', title: 'Escalation Rules', icon: <AlertTriangle className="h-5 w-5 text-indigo-500 mr-2" /> },
    { id: 'restricted_topics', title: 'Restricted Topics', icon: <ShieldOff className="h-5 w-5 text-indigo-500 mr-2" /> },
    { id: 'business_policies', title: 'Business Policies', icon: <Building className="h-5 w-5 text-indigo-500 mr-2" /> }
  ]

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      <div className="flex justify-between items-center border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            AI Training Context
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            View the rules, behavior, and information that powers your AI agent.
          </p>
        </div>
        
        {context ? (
          <Link
            href={`/dashboard/ai-training/${context.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Edit className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            Edit Context
          </Link>
        ) : (
          <Link
            href="/dashboard/ai-training/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Setup AI Context
          </Link>
        )}
      </div>

      {context ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {sections.map((section) => {
            const content = context[section.id]
            if (!content) return null

            return (
              <div key={section.id} className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-100">
                <div className="px-4 py-5 sm:px-6 bg-gray-50/50 border-b border-gray-100 flex items-center">
                  {section.icon}
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6 text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {content}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow sm:rounded-lg border border-gray-200">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No context found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by setting up the behavior and rules for your AI agent.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/ai-training/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Setup AI Context
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
