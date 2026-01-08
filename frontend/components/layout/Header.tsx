'use client'

import { logout, getCurrentUserId } from '@/lib/auth'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const userId = getCurrentUserId()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-black">Retail Boss POS</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-5 h-5" />
            <span className="text-sm">User ID: {userId?.substring(0, 8)}...</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

