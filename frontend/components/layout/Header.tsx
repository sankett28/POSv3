'use client'

import Image from 'next/image'
import { logout, getCurrentUserId } from '@/lib/auth'
import { LogOut, User, ShoppingBag, Receipt, Users, Package, Megaphone, ShoppingCart, Home, LayoutGrid, DollarSign, Mic, LineChart, Bell } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const userId = getCurrentUserId()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { name: 'Products', href: '/products', icon: ShoppingCart },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Billing', href: '/pos-billing', icon: DollarSign },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Marketing', href: '/marketing', icon: Megaphone },
    { name: 'Analytics', href: '/analytics', icon: LineChart },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left section: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Home className="w-8 h-8 text-black" />
          </Link>
          <span className="text-xl font-bold text-black">Retail Boss</span>
          <span className="bg-black text-white text-xs px-2 py-1 rounded-full">AI-POWERED</span>
        </div>

        {/* Middle section: Navigation Tabs */}
        <nav className="hidden md:flex flex-grow justify-center">
          <ul className="flex gap-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <span
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-lg font-medium ${
                      pathname === item.href ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                    } transition-colors`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right section: Profile Icon and Logout */}
        <div className="flex items-center gap-2">
          <Link href="/admin-profile" className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors">
            <User className="w-5 h-5 text-gray-600" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  )
}

