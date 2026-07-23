'use client'

import { Trash2 } from 'lucide-react'

export function DeleteButton() {
  return (
    <button 
      type="submit" 
      className="text-red-600 hover:text-red-900" 
      onClick={(e) => {
        if (!confirm('Are you sure you want to delete this item?')) {
          e.preventDefault()
        }
      }}
    >
      <Trash2 className="h-5 w-5" />
    </button>
  )
}
