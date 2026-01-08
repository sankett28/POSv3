'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, Package, Receipt, Users, Megaphone } from 'lucide-react'

const navItems = [
  { href: '/pos-billing', label: 'Billing', icon: Receipt },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/products', label: 'Products', icon: Store },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/marketing', label: 'Marketing', icon: Megaphone },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-black" />
          <span className="font-bold text-lg text-black">Retail Boss</span>
        </div>
      </div>
      <nav className="p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md mb-2 transition-colors ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

