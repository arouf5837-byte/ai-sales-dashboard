'use client'

import { useState } from 'react'
import FacebookLoginButton from './FacebookLoginButton'
import { connectFacebookPage, disconnectFacebookPage } from '@/app/dashboard/facebook-actions'

type FacebookConnectionManagerProps = {
  clientId: string
  currentBrandName: string | null
  isConnected: boolean
}

export default function FacebookConnectionManager({ 
  clientId, 
  currentBrandName, 
  isConnected 
}: FacebookConnectionManagerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect this Facebook Page? Your AI Agent will stop working until you connect a new one.')) return
    
    setLoading(true)
    setError(null)
    const res = await disconnectFacebookPage(clientId)
    if (res?.error) {
      setError(res.error)
    }
    setLoading(false)
  }

  const handlePageSelected = async (page: { id: string; name: string; access_token: string }) => {
    setLoading(true)
    setError(null)
    const res = await connectFacebookPage(clientId, page)
    if (res?.error) {
      setError(res.error)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <span className="text-blue-600 font-bold mr-2">f</span>
            Facebook Page Connection
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage the Facebook Page connected to your AI Sales Agent.
          </p>
        </div>
      </div>
      <div className="p-5">
        {error && (
          <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        {isConnected ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="flex p-2 rounded-lg bg-green-100 text-green-600 mr-3 text-lg font-bold">
                ✓
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Connected to: <span className="font-bold text-green-700">{currentBrandName || 'Your Page'}</span>
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Your AI Agent is ready to respond on this page.
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Disconnecting...' : 'Disconnect Page'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-yellow-50 rounded-lg p-4 border border-yellow-100">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="flex p-2 rounded-lg bg-yellow-100 text-yellow-600 mr-3 text-lg font-bold">
                !
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  No Page Connected
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  Your AI Agent cannot respond until you connect a page.
                </p>
              </div>
            </div>
            <div className="relative">
              {loading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">...</div>}
              <FacebookLoginButton onPageSelected={handlePageSelected} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
