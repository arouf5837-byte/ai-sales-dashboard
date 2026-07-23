import { createClient } from '@/utils/supabase/server'
import OrdersTable from '@/components/OrdersTable'

export default async function OrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="text-red-500">Not authenticated</div>
  }

  // Find the client_id for this user
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .single()

  if (!clientUser) {
    return <div className="p-6">You must set up your client profile first.</div>
  }

  // Fetch orders for this client
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('client_id', clientUser.client_id)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="text-red-500">Error loading orders: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
      </div>

      <OrdersTable initialOrders={orders || []} />
    </div>
  )
}
