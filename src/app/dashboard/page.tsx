import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquare, CalendarDays } from 'lucide-react'
import FacebookConnectionManager from '@/components/FacebookConnectionManager'

export default async function DashboardPage() {
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

  if (!clientUser?.client_id) {
    return <div>User not linked to any client.</div>
  }

  // Fetch client details
  const { data: clientData } = await supabase
    .from('clients')
    .select('fb_page_id, fb_page_token, brand_name')
    .eq('client_id', clientUser.client_id)
    .single()

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const todayStart = `${dateStr}T00:00:00.000Z`;
  const monthStartStr = dateStr.substring(0, 8) + '01';
  const monthStart = `${monthStartStr}T00:00:00.000Z`;

  // Fetch Today's Messages
  const { count: todayCount, error: todayError } = await supabase
    .from('n8n_chat_histories')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientUser.client_id)
    .gte('created_at', todayStart)

  // Fetch Monthly Messages
  const { count: monthCount, error: monthError } = await supabase
    .from('n8n_chat_histories')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientUser.client_id)
    .gte('created_at', monthStart)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Today's Messages Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <MessageSquare className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Messages</dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">
                      {todayError ? (
                        <span className="text-sm text-red-500" title={todayError.message}>Error (Needs created_at)</span>
                      ) : (
                        (todayCount || 0)
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* This Month's Messages Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <CalendarDays className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Messages This Month</dt>
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">
                      {monthError ? (
                        <span className="text-sm text-red-500" title={monthError.message}>Error (Needs created_at)</span>
                      ) : (
                        (monthCount || 0)
                      )}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facebook Connection Manager */}
      <FacebookConnectionManager 
        clientId={clientUser.client_id}
        currentBrandName={clientData?.brand_name || null}
        isConnected={!!clientData?.fb_page_id && !!clientData?.fb_page_token}
      />
    </div>
  )
}
