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
    <div className="w-64 bg-[#0f172a] shadow-2xl flex flex-col justify-between h-full transition-all duration-300">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            AI Sales Agent
          </span>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  {item.name}
                </div>
                {item.hasBadge && pendingOrders > 0 && pathname !== item.href && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                    {pendingOrders}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-4 py-3 text-sm font-medium text-slate-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-500 group-hover:text-rose-400 transition-transform duration-200 group-hover:-translate-x-1" />
          Sign out
        </button>
      </div>
    </div>
  )
}
