'use client'

import { useState, useTransition } from 'react'
import { toggleAgentStatus } from '@/app/dashboard/agent-actions'
import { Power, Loader2 } from 'lucide-react'

interface AgentStatusToggleProps {
  clientId: string
  isActive: boolean
  isLocked?: boolean
}

export default function AgentStatusToggle({ clientId, isActive, isLocked = false }: AgentStatusToggleProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useState(isActive)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = () => {
    if (isLocked) return

    const newStatus = !optimisticStatus
    setOptimisticStatus(newStatus)
    setError(null)

    startTransition(async () => {
      const res = await toggleAgentStatus(clientId, newStatus)
      if (res.error) {
        setOptimisticStatus(!newStatus) // revert
        setError(res.error)
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <button
        onClick={handleToggle}
        disabled={isPending || isLocked}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
          optimisticStatus ? 'bg-indigo-600' : 'bg-gray-200'
        } ${(isPending || isLocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="switch"
        aria-checked={optimisticStatus}
      >
        <span className="sr-only">Toggle AI Agent</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            optimisticStatus ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          ) : (
            <Power
              className={`h-3 w-3 ${
                optimisticStatus ? 'text-indigo-600' : 'text-gray-400'
              }`}
            />
          )}
        </span>
      </button>
      <span className={`text-[10px] font-extrabold tracking-widest leading-none ${optimisticStatus ? 'text-indigo-600' : 'text-gray-500'}`}>
        {optimisticStatus ? 'ON' : 'OFF'}
      </span>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  )
}
