'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, Package, Receipt, Users, Megaphone, Coffee, UtensilsCrossed, FileText, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { href: '/orders', label: 'Orders', icon: ({ className }) => <span className={`flex items-center text-xl ${className}`}>₹</span> },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/transactions', label: 'Transactions', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin-profile', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:block w-72 bg-gradient-to-b from-white to-warm-cream border-r border-gray-200 h-screen sticky top-0 shadow-lg rounded-r-2xl">
      <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-white to-warm-cream rounded-tr-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-coffee-brown to-caramel rounded-xl flex items-center justify-center shadow-lg">
            <Coffee className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-coffee-brown leading-tight">BrewBite POS</span>
            <span className="text-sm text-caramel font-medium">Cafe Management</span>
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
                  ? 'bg-coffee-brown text-white shadow-lg hover:shadow-xl'
                  : 'text-secondary-text hover:bg-white hover:text-coffee-brown hover:shadow-md'
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

