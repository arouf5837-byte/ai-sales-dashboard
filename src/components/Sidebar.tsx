'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, MessageCircle, Settings, LogOut, LayoutDashboard, Bot, ShoppingCart } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, hasBadge: true },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Train your AI Sales Agent', href: '/dashboard/ai-training', icon: Bot },
  { name: 'FAQ', href: '/dashboard/faq', icon: MessageCircle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar({ clientId, initialPendingCount = 0 }: { clientId?: string, initialPendingCount?: number }) {
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [pendingOrders, setPendingOrders] = useState(initialPendingCount)

  useEffect(() => {
    // Update local state if server state changes on navigation
    setPendingOrders(initialPendingCount)
  }, [initialPendingCount])

  useEffect(() => {
    // Clear badge when visiting the orders page
    if (pathname === '/dashboard/orders') {
      setPendingOrders(0)
    }
  }, [pathname])

  useEffect(() => {
    if (!clientId) return

    // Subscribe to realtime changes
    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as any
            if (newOrder.status?.toLowerCase() === 'pending') {
              setPendingOrders(prev => prev + 1)
            }
          } else if (payload.eventType === 'UPDATE') {
            const oldOrder = payload.old as any
            const newOrder = payload.new as any
            
            const wasPending = oldOrder.status?.toLowerCase() === 'pending'
            const isPending = newOrder.status?.toLowerCase() === 'pending'
            
            if (wasPending && !isPending) {
              setPendingOrders(prev => Math.max(0, prev - 1))
            } else if (!wasPending && isPending) {
              setPendingOrders(prev => prev + 1)
            }
          } else if (payload.eventType === 'DELETE') {
            const oldOrder = payload.old as any
            if (oldOrder.status?.toLowerCase() === 'pending') {
              setPendingOrders(prev => Math.max(0, prev - 1))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="w-64 bg-white shadow-md flex flex-col justify-between h-full">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-indigo-600">FashionAdmin</span>
        </div>
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-indigo-700' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </div>
                {item.hasBadge && pendingOrders > 0 && pathname !== item.href && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Sign out
        </button>
      </div>
    </div>
  )
}
