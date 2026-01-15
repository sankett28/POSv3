'use client'

import { useState, useCallback } from 'react'
import { logout } from '@/lib/auth'

// Performance: Only import icons that are actually used
import { Bell, Leaf, LogOut, MessageCircle, Search, Settings, User } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // Performance: Memoize logout handler to prevent recreation
  const handleLogout = useCallback(() => {
    logout()
  }, [])

  // Performance: Memoize profile dropdown toggle handler
  const handleProfileDropdownToggle = useCallback(() => {
    setIsProfileDropdownOpen(prev => !prev)
  }, [])

  // Performance: Memoize profile dropdown close handler
  const handleProfileDropdownClose = useCallback(() => {
    setIsProfileDropdownOpen(false)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-b border-[#E5E7EB] shadow-sm">
      <div className="h-[72px] px-4 sm:px-6 flex items-center gap-4">
        <Link href="/orders" className="flex items-center">
          <div className="w-10 h-10 rounded-2xl bg-[#DC586D]/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-[#DC586D]" />
          </div>
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4C1D3D]/55" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search menu..."
                className="w-full h-11 pl-11 pr-4 rounded-full bg-[#F9F9F9] border border-[#E5E7EB] text-sm text-[#4C1D3D] placeholder:text-[#4C1D3D]/45 focus:outline-none focus:ring-2 focus:ring-[#DC586D]/30 focus:border-[#DC586D]"
              />
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-[#F9F9F9] border border-[#E5E7EB] flex items-center justify-center hover:bg-white transition-colors" type="button">
            <MessageCircle className="w-5 h-5 text-[#4C1D3D]" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#F9F9F9] border border-[#E5E7EB] flex items-center justify-center hover:bg-white transition-colors" type="button">
            <Bell className="w-5 h-5 text-[#4C1D3D]" />
          </button>

          <button
            onClick={handleProfileDropdownToggle}
            className="w-10 h-10 rounded-xl bg-[#F9F9F9] border border-[#E5E7EB] flex items-center justify-center hover:bg-white transition-colors"
            type="button"
          >
            <User className="w-5 h-5 text-[#4C1D3D]" />
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-2 z-50">
              <Link
                href="/admin-profile"
                onClick={handleProfileDropdownClose}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#4C1D3D] hover:bg-[#DC586D]/10 rounded-xl transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                href="/settings/taxes"
                onClick={handleProfileDropdownClose}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#4C1D3D] hover:bg-[#DC586D]/10 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <div className="h-px bg-[#E5E7EB] my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#4C1D3D] hover:bg-[#DC586D]/10 rounded-xl transition-colors"
                type="button"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
