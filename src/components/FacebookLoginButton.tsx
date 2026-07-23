'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

// Add FB types for TypeScript
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

interface FacebookLoginButtonProps {
  onPageSelected: (page: FacebookPage) => void;
}

export default function FacebookLoginButton({ onPageSelected }: FacebookLoginButtonProps) {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pages, setPages] = useState<FacebookPage[]>([])

  useEffect(() => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
      setIsSdkLoaded(true)
    };
  }, [])

  const handleLogin = () => {
    if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
      setError("Facebook App ID is not configured in .env.local")
      return
    }

    setLoading(true)
    setError(null)

    window.FB.login((response: any) => {
      if (response.authResponse) {
        fetchPages()
      } else {
        setLoading(false)
        setError('User cancelled login or did not fully authorize.')
      }
    }, {
      // Scopes required to read pages and get page access tokens
      scope: 'pages_show_list,pages_manage_metadata,pages_messaging',
      return_scopes: true
    })
  }

  const fetchPages = () => {
    window.FB.api('/me/accounts', (response: any) => {
      setLoading(false)
      if (response && !response.error) {
        if (response.data && response.data.length > 0) {
          setPages(response.data)
        } else {
          setError("No Facebook Pages found for this account. Please create a Page first.")
        }
      } else {
        setError(response.error?.message || "Failed to fetch pages.")
      }
    })
  }

  if (pages.length > 0) {
    return (
      <div className="mt-4 p-4 border border-indigo-200 bg-indigo-50 rounded-md">
        <h4 className="text-sm font-medium text-indigo-900 mb-2">Select a Page to connect:</h4>
        <div className="space-y-2">
          {pages.map(page => (
            <button
              key={page.id}
              type="button"
              onClick={() => {
                onPageSelected(page)
                setPages([]) // Hide list after selection
              }}
              className="w-full text-left px-4 py-2 bg-white border border-indigo-100 rounded-md shadow-sm hover:bg-indigo-50 flex items-center justify-between"
            >
              <span className="font-medium text-gray-900">{page.name}</span>
              <span className="text-xs text-gray-500">ID: {page.id}</span>
            </button>
          ))}
        </div>
        <button 
          type="button"
          onClick={() => setPages([])} 
          className="mt-3 text-xs text-indigo-600 hover:text-indigo-800"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end">
      <Script 
        src="https://connect.facebook.net/en_US/sdk.js" 
        strategy="lazyOnload" 
      />
      <button
        type="button"
        onClick={handleLogin}
        disabled={!isSdkLoaded || loading}
        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#1877F2] hover:bg-[#1864D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] disabled:opacity-50"
      >
        <svg className="mr-2 h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {loading ? 'Connecting...' : 'Connect your Facebook Page here'}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600 max-w-[250px] text-right">{error}</p>
      )}
    </div>
  )
}
