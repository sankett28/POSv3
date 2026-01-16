'use client'

import { memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Performance: Only import icons that are actually used
import { UtensilsCrossed, FileText, BarChart3, Settings } from 'lucide-react'
import Logo from '@/components/ui/Logo'

// Performance: Memoize navItems to prevent recreation on every render
const navItems = [
  { href: '/orders', label: 'Orders', icon: ({ className }: { className?: string }) => <span className={`flex items-center text-xl ${className}`}>₹</span> },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/transactions', label: 'Transactions', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin-profile', label: 'Settings', icon: Settings },
]

function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:block w-72 bg-linear-to-b from-white to-[#FFF0F3] border-r border-gray-200 h-screen sticky top-0 shadow-lg rounded-r-2xl">
      <div className="p-8 border-b border-gray-200 bg-linear-to-r from-white to-[#FFF0F3] rounded-tr-2xl">
        <div className="flex items-center gap-3">
          <Logo size="lg" showAccent={true} />
          <div className="flex flex-col">
            <span className="text-sm text-[#912B48] font-medium">Cafe Management</span>
          </div>
        </div>
      </div>
      <nav className="p-6">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl mb-3 transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-[#610027] text-white shadow-lg hover:shadow-xl'
                  : 'text-[#610027] hover:bg-white hover:text-[#912B48] hover:shadow-md'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="font-semibold text-base">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// Performance: Memoize Sidebar to prevent unnecessary re-renders
export default memo(Sidebar)

