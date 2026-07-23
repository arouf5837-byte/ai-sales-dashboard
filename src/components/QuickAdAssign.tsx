'use client'

import { useState } from 'react'
import { Megaphone, X } from 'lucide-react'
import { quickUpdateAdIds } from '@/app/dashboard/products/actions'

interface QuickAdAssignProps {
  productId: string
  initialAdIds: string[]
}

export function QuickAdAssign({ productId, initialAdIds }: QuickAdAssignProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [metaAdIds, setMetaAdIds] = useState<string[]>(initialAdIds || [])
  const [metaAdIdInput, setMetaAdIdInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleAddMetaAdId = () => {
    if (metaAdIdInput.trim() && !metaAdIds.includes(metaAdIdInput.trim())) {
      setMetaAdIds(prev => [...prev, metaAdIdInput.trim()])
      setMetaAdIdInput('')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await quickUpdateAdIds(productId, metaAdIds)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => setIsOpen(false), 1000)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-indigo-50"
        title="Assign Meta Ad IDs"
      >
        <Megaphone className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Megaphone className="h-5 w-5 mr-2 text-indigo-500" />
                Assign Meta Ad IDs
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 bg-gray-50">
              {metaAdIds.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {metaAdIds.map((id, index) => (
                    <div key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      <span>{id}</span>
                      <button
                        type="button"
                        onClick={() => setMetaAdIds(prev => prev.filter(a => a !== id))}
                        className="ml-2 flex-shrink-0 inline-flex text-indigo-400 hover:text-indigo-600 focus:outline-none"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={metaAdIdInput}
                  onChange={(e) => setMetaAdIdInput(e.target.value)}
                  placeholder="e.g. ad_123456789"
                  className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddMetaAdId()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddMetaAdId}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add
                </button>
              </div>
              
              <p className="mt-3 text-xs text-gray-500">
                Add the Ad IDs where this product is currently being promoted. This helps your AI Sales Agent instantly recognize the product when customers reply to your ads. (আপনার যে Ad-গুলোতে এই প্রোডাক্টটি প্রমোট করা হচ্ছে, সেগুলোর Ad ID এখানে দিন। এর ফলে কাস্টমাররা কোনো Ad থেকে মেসেজ দিলে আপনার AI Sales Agent খুব সহজেই প্রোডাক্টটি চিনে নিতে পারবে।)
              </p>
              
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              {success && <p className="mt-2 text-sm text-green-600">Saved successfully!</p>}
              
            </div>
            
            <div className="bg-white p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
