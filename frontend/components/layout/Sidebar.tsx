'use client'

import { memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'
// Performance: Only import icons that are actually used
import { BarChart3, FileText, Leaf, LogOut, ReceiptText, Settings, User, UtensilsCrossed } from 'lucide-react'

// Performance: Memoize navItems to prevent recreation on every render
const navItems = [
  { href: '/orders', label: 'Orders', icon: ReceiptText },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/transactions', label: 'Transactions', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings/taxes', label: 'Settings', icon: Settings },
  { href: '/admin-profile', label: 'Profile', icon: User },
]

function Sidebar() {
  const pathname = usePathname()

  const isRouteActive = (href: string) => {
    if (pathname === href) return true
    if (href !== '/' && pathname.startsWith(`${href}/`)) return true
    return false
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 md:w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
      <div className="h-[72px] flex items-center justify-center md:justify-start px-4 border-b border-[#E5E7EB]">
        <div className="w-10 h-10 rounded-2xl bg-[#DC586D]/10 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-[#DC586D]" />
        </div>
        <div className="hidden md:flex flex-col ml-3 leading-tight">
          <span className="text-sm font-semibold text-[#4C1D3D]">LICHY</span>
          <span className="text-xs text-[#4C1D3D]/60">Premium café POS</span>
        </div>
      </div>

      <nav className="px-3 py-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isRouteActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 transition-colors ${
                isActive
                  ? 'bg-[#DC586D] text-white'
                  : 'text-[#4C1D3D] hover:bg-[#DC586D]/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isActive ? 'bg-white/15' : 'bg-[#F9F9F9] group-hover:bg-white'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#4C1D3D]'}`} />
              </div>
              <span className="hidden md:inline text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <button
          type="button"
          onClick={logout}
          title="Logout"
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-[#4C1D3D] hover:bg-[#DC586D]/10"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-[#F9F9F9] group-hover:bg-white">
            <LogOut className="w-5 h-5 text-[#4C1D3D]" />
          </div>
          <span className="hidden md:inline text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

// Performance: Memoize Sidebar to prevent unnecessary re-renders
export default memo(Sidebar)

