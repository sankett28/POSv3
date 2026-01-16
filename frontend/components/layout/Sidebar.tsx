'use client'

import { memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'
import { BarChart3, FileText, LogOut, ReceiptText, Settings, User, UtensilsCrossed } from 'lucide-react'
import Logo from '@/components/ui/Logo'

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
    <aside className="hidden md:block w-72 bg-linear-to-b from-card-background to-warm-cream border-r border-border h-screen sticky top-0 shadow-lg rounded-r-2xl">
      <div className="p-8 border-b border-border bg-linear-to-r from-card-background to-warm-cream rounded-tr-2xl">
        <div className="flex items-center gap-3">
          <Logo size="lg" showAccent={true} />
          <div className="flex flex-col">
            <span className="text-sm text-coffee-brown font-medium">Cafe Management</span>
          </div>
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
              className={`group mb-1.5 transition-colors flex items-center justify-center w-12 h-12 rounded-full md:w-auto md:h-auto md:justify-start md:gap-3 md:px-3 md:py-2.5 md:rounded-xl ${
                isActive
                  ? 'bg-coffee-brown text-white'
                  : 'text-primary-text hover:bg-brand-dusty-rose/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-full md:rounded-xl flex items-center justify-center transition-colors ${
                isActive ? 'bg-white/15' : 'bg-warm-cream group-hover:bg-card-background'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary-text'}`} />
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
          className="group transition-colors text-primary-text hover:bg-brand-dusty-rose/10 flex items-center justify-center w-12 h-12 rounded-full md:w-full md:h-auto md:justify-start md:gap-3 md:px-3 md:py-2.5 md:rounded-xl"
        >
          <div className="w-10 h-10 rounded-full md:rounded-xl flex items-center justify-center transition-colors bg-warm-cream group-hover:bg-card-background">
            <LogOut className="w-5 h-5 text-primary-text" />
          </div>
          <span className="hidden md:inline text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

// Performance: Memoize Sidebar to prevent unnecessary re-renders
export default memo(Sidebar)

