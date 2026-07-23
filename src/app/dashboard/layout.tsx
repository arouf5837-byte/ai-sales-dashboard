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
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
              {!hasClient ? (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Info className="w-3 h-3 mr-1" />
                  Setup your AI Sales Agent
                </span>
              ) : (
                <div className="ml-4 flex items-center">
                  <AgentStatusToggle 
                    clientId={clientUser.client_id} 
                    isActive={isActive}
                    isLocked={isPaymentLocked}
                  />
                  {isPaymentLocked && (
                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      Payment Locked
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {user.email}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
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
