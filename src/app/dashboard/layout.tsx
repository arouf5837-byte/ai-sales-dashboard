import Sidebar from '@/components/Sidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, Info } from 'lucide-react'
import SetupAgentForm from '@/components/SetupAgentForm'
import AgentStatusToggle from '@/components/AgentStatusToggle'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch client details to check if active
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .single()

  let clientData = null
  if (clientUser?.client_id) {
    const { data: clientRes } = await supabase
      .from('clients')
      .select('is_active, is_payment_locked')
      .eq('client_id', clientUser.client_id)
      .single()
    clientData = clientRes
  }

  const hasClient = !!clientUser?.client_id
  const isActive = hasClient ? (clientData?.is_active ?? true) : false
  const isPaymentLocked = hasClient ? (clientData?.is_payment_locked ?? false) : false

  // Fetch pending orders count on the server
  let pendingCount = 0
  if (clientUser?.client_id) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientUser.client_id)
      .ilike('status', 'pending')
    pendingCount = count || 0
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar clientId={clientUser?.client_id} initialPendingCount={pendingCount} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {hasClient && !isActive && (
          <div className="bg-red-600">
            <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
              <div className="flex items-center flex-wrap">
                <div className="w-0 flex-1 flex items-center">
                  <span className="flex p-2 rounded-lg bg-red-800">
                    <AlertTriangle className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                  <p className="ml-3 font-medium text-white">
                    <span className="hidden md:inline">
                      Your service is currently inactive. {isPaymentLocked ? 'Your account has been locked due to pending payments.' : 'Reason: Service temporarily paused by your organization!'}
                    </span>
                    <span className="md:hidden">
                      Service inactive. {isPaymentLocked ? 'Payment locked.' : 'Paused by your organization!'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Dashboard</h1>
              {!hasClient ? (
                <span className="ml-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
                  <Info className="w-3.5 h-3.5 mr-1.5" />
                  Setup your AI Sales Agent
                </span>
              ) : (
                <div className="ml-5 flex items-center">
                  <AgentStatusToggle 
                    clientId={clientUser.client_id} 
                    isActive={isActive}
                    isLocked={isPaymentLocked}
                  />
                  {isPaymentLocked && (
                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm animate-pulse">
                      Payment Locked
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm font-medium text-gray-500 bg-gray-100/50 px-3 py-1.5 rounded-full border border-gray-200/50">
                {user.email}
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50">
          {!hasClient ? (
            <div className="w-full min-h-full py-8">
              <SetupAgentForm />
            </div>
          ) : (
            <div className="p-6">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
