'use client'

import { useState } from 'react'
import { setupAgent } from '@/app/dashboard/setup-actions'
import FacebookLoginButton from './FacebookLoginButton'

export default function SetupAgentForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Controlled inputs for auto-filling from FB Login
  const [brandName, setBrandName] = useState('')
  const [fbPageId, setFbPageId] = useState('')
  const [fbPageToken, setFbPageToken] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await setupAgent(formData)
    
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
    // On success, the layout will automatically re-render because of revalidatePath
  }

  const handlePageSelected = (page: { id: string; name: string; access_token: string }) => {
    setBrandName(page.name)
    setFbPageId(page.id)
    setFbPageToken(page.access_token)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-white">Setup Your AI Sales Agent</h2>
          <p className="mt-2 text-indigo-100">
            Connect your Facebook Page and optionally WooCommerce to get started.
          </p>
        </div>

        <div className="px-6 py-8 sm:p-10">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm font-medium border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Facebook Integration (Required)</h3>
                <FacebookLoginButton onPageSelected={handlePageSelected} />
              </div>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700">Page Name (Brand Name)</label>
                  <div className="mt-1">
                    <input 
                      type="text" 
                      name="brand_name" 
                      id="brand_name" 
                      required 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 border" 
                      placeholder="e.g. Fashion BD" 
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="language_default" className="block text-sm font-medium text-gray-700">Default Language</label>
                  <div className="mt-1">
                    <select id="language_default" name="language_default" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 border bg-white">
                      <option value="bn">Bengali (bn)</option>
                      <option value="en">English (en)</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="fb_page_id" className="block text-sm font-medium text-gray-700">Facebook Page ID</label>
                  <div className="mt-1">
                    <input 
                      type="text" 
                      name="fb_page_id" 
                      id="fb_page_id" 
                      required 
                      value={fbPageId}
                      onChange={(e) => setFbPageId(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md px-4 py-2" 
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="fb_page_token" className="block text-sm font-medium text-gray-700">Facebook Page Access Token</label>
                  <div className="mt-1">
                    <textarea 
                      id="fb_page_token" 
                      name="fb_page_token" 
                      rows={3} 
                      required 
                      value={fbPageToken}
                      onChange={(e) => setFbPageToken(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md px-4 py-2" 
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    * You can type your token manually, or click the blue "Connect your Facebook Page here" button above to fill it automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">WooCommerce Integration (Optional)</h3>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="woo_url" className="block text-sm font-medium text-gray-700">Website URL</label>
                  <div className="mt-1">
                    <input type="url" name="woo_url" id="woo_url" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 border" placeholder="https://yourstore.com" />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="woo_consumer_key" className="block text-sm font-medium text-gray-700">Consumer Key</label>
                  <div className="mt-1">
                    <input type="text" name="woo_consumer_key" id="woo_consumer_key" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 border" />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="woo_consumer_secret" className="block text-sm font-medium text-gray-700">Consumer Secret</label>
                  <div className="mt-1">
                    <input type="password" name="woo_consumer_secret" id="woo_consumer_secret" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-4 py-2 border" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
              >
                {loading ? 'Initializing Agent...' : 'Launch AI Sales Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
