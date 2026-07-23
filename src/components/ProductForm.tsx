'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function ProductForm({ 
  initialData = {},
  isEdit = false
}: { 
  initialData?: any,
  isEdit?: boolean
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.image || [])
  const [existingVideos, setExistingVideos] = useState<string[]>(initialData?.video || [])
  const [metaAdIds, setMetaAdIds] = useState<string[]>(initialData?.meta_ad_ids || [])
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [videoUrlInput, setVideoUrlInput] = useState('')
  const [metaAdIdInput, setMetaAdIdInput] = useState('')
  const [error, setError] = useState('')

  const handleAddMetaAdId = () => {
    if (metaAdIdInput.trim() && !metaAdIds.includes(metaAdIdInput.trim())) {
      setMetaAdIds(prev => [...prev, metaAdIdInput.trim()])
      setMetaAdIdInput('')
    }
  }

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setExistingImages(prev => [...prev, imageUrlInput.trim()])
      setImageUrlInput('')
    }
  }

  const handleAddVideoUrl = () => {
    if (videoUrlInput.trim()) {
      setExistingVideos(prev => [...prev, videoUrlInput.trim()])
      setVideoUrlInput('')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideos(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Capture form data synchronously before any awaits
    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    setIsSubmitting(true)
    setError('')
    setUploadStatus('')

    try {
      let imageUrls: string[] = [...existingImages]
      let videoUrls: string[] = [...existingVideos]
      let primaryImageUrl = initialData.image_url || ''

      // Upload Images
      if (images.length > 0) {
        setUploadStatus(`Uploading ${images.length} images...`)
        const uploadFormData = new FormData()
        images.forEach(img => uploadFormData.append('file', img))
        
        const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
        if (!res.ok) {
           const err = await res.json()
           throw new Error(err.error || 'Failed to upload images')
        }
        const data = await res.json()
        imageUrls = [...imageUrls, ...data.urls]
      }

      // Ensure primary image is valid
      if (imageUrls.length > 0) {
        if (!imageUrls.includes(primaryImageUrl)) {
          primaryImageUrl = imageUrls[0]
        }
      } else {
        primaryImageUrl = ''
      }

      // Upload Videos
      if (videos.length > 0) {
        setUploadStatus(`Uploading ${videos.length} videos...`)
        const uploadFormData = new FormData()
        videos.forEach(vid => uploadFormData.append('file', vid))
        
        const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
        if (!res.ok) {
           const err = await res.json()
           throw new Error(err.error || 'Failed to upload videos')
        }
        const data = await res.json()
        videoUrls = [...videoUrls, ...data.urls]
      }

      setUploadStatus('Saving product data...')
      
      const payload = {
        id: initialData.id,
        name: formData.get('name'),
        name_bn: formData.get('name_bn'),
        description: formData.get('description'),
        price: formData.get('price'),
        sale_price: formData.get('sale_price'),
        stock_qty: formData.get('stock_qty'),
        category: formData.get('category'),
        sizes: (formData.get('sizes') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
        colors: (formData.get('colors') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
        is_active: formData.get('is_active') === 'true',
        image_url: primaryImageUrl,
        image: imageUrls,
        video: videoUrls,
        meta_ad_ids: metaAdIds
      }

      const endpoint = isEdit ? '/api/products/update' : '/api/products/create'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save product')
      }

      setUploadStatus('Success! Redirecting...')
      router.push('/dashboard/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
      setUploadStatus('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-6 sm:space-y-5">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Product Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Provide product info, images, and videos.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6 sm:space-y-5">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name (English)</label>
              <div className="mt-1">
                <input type="text" name="name" id="name" required defaultValue={initialData?.name} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
            <div>
              <label htmlFor="name_bn" className="block text-sm font-medium text-gray-700">Name (Bangla)</label>
              <div className="mt-1">
                <input type="text" name="name_bn" id="name_bn" defaultValue={initialData?.name_bn} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <div className="mt-1">
              <textarea id="description" name="description" rows={3} defaultValue={initialData?.description} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (Regular)</label>
              <div className="mt-1">
                <input type="number" step="0.01" name="price" id="price" required defaultValue={initialData?.price} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
            <div>
              <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700">Sale Price (Optional)</label>
              <div className="mt-1">
                <input type="number" step="0.01" name="sale_price" id="sale_price" defaultValue={initialData?.sale_price} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
            <div>
              <label htmlFor="stock_qty" className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <div className="mt-1">
                <input type="number" name="stock_qty" id="stock_qty" defaultValue={initialData?.stock_qty ?? 10} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <div className="mt-1">
                <input type="text" name="category" id="category" defaultValue={initialData?.category} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sizes" className="block text-sm font-medium text-gray-700">Sizes (Comma separated)</label>
              <div className="mt-1">
                <input type="text" name="sizes" id="sizes" defaultValue={initialData?.sizes?.join(', ')} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="S, M, L, XL" />
              </div>
            </div>
            <div>
              <label htmlFor="colors" className="block text-sm font-medium text-gray-700">Colors (Comma separated)</label>
              <div className="mt-1">
                <input type="text" name="colors" id="colors" defaultValue={initialData?.colors?.join(', ')} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="Red, Blue, Green" />
              </div>
            </div>
          </div>

          {/* Meta Ad IDs Section */}
          <div className="border-t pt-5">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Meta Ad IDs (For AI Sales Agent)</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                  Add Ad ID
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Add the Ad IDs where this product is currently being promoted. This helps your AI Sales Agent instantly recognize the product when customers reply to your ads. (আপনার যে Ad-গুলোতে এই প্রোডাক্টটি প্রমোট করা হচ্ছে, সেগুলোর Ad ID এখানে দিন। এর ফলে কাস্টমাররা কোনো Ad থেকে মেসেজ দিলে আপনার AI Sales Agent খুব সহজেই প্রোডাক্টটি চিনে নিতে পারবে।)
              </p>
            </div>
          </div>

          {/* Image & Video Uploads */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Images (Max 10MB each)</label>
              
              {existingImages.length > 0 && (
                <div className="mb-3 mt-2">
                  <p className="text-xs text-gray-500 mb-2">Existing Images:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt="existing" className="h-16 w-16 object-cover rounded-md border" />
                        <button 
                          type="button" 
                          onClick={() => setExistingImages(prev => prev.filter(img => img !== url))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
              />
              <div className="mt-3 flex gap-2">
                <input 
                  type="url" 
                  value={imageUrlInput} 
                  onChange={e => setImageUrlInput(e.target.value)} 
                  placeholder="Or paste image URL" 
                  className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" 
                />
                <button 
                  type="button" 
                  onClick={handleAddImageUrl}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add URL
                </button>
              </div>
              {images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {images.map((file, i) => (
                    <img key={i} src={URL.createObjectURL(file)} alt="preview" className="h-16 w-16 object-cover rounded-md border" />
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Videos (Max 50MB each)</label>
              <p className="text-xs text-gray-500 mt-1 mb-2">
                If the file is above the size limit, upload the video to Google Drive and provide us the link below.
              </p>
              
              {existingVideos.length > 0 && (
                <div className="mb-3 mt-2">
                  <p className="text-xs text-gray-500 mb-2">Existing Videos:</p>
                  <div className="flex flex-col gap-2">
                    {existingVideos.map((url, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border rounded-md text-sm bg-gray-50">
                        <span className="truncate w-48 text-gray-600">{url.split('/').pop()}</span>
                        <button 
                          type="button" 
                          onClick={() => setExistingVideos(prev => prev.filter(v => v !== url))}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input 
                type="file" 
                multiple 
                accept="video/*" 
                onChange={handleVideoChange}
                className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
              />
              <div className="mt-3 flex gap-2">
                <input 
                  type="url" 
                  value={videoUrlInput} 
                  onChange={e => setVideoUrlInput(e.target.value)} 
                  placeholder="Or paste video URL" 
                  className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border" 
                />
                <button 
                  type="button" 
                  onClick={handleAddVideoUrl}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Add URL
                </button>
              </div>
              {videos.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {videos.length} video(s) selected
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input id="is_active" name="is_active" type="checkbox" value="true" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Product is active and visible
            </label>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-indigo-600">
            {uploadStatus}
          </div>
          <div className="flex justify-end space-x-3">
            <Link
              href="/dashboard/products"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
