'use client'

import { useState } from 'react'

import { logout, getCurrentUserId } from '@/lib/auth'
import { LogOut, User, ShoppingBag, Receipt, Users, Package, Megaphone, ShoppingCart, Home, LayoutGrid, DollarSign, Mic, LineChart, Bell, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const userId = getCurrentUserId()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        <div className="px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-black" />
          </button>
        {/* Left section: Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Home className="w-8 h-8 text-black" />
          </Link>
          <span className="text-xl font-bold text-black">Retail Boss</span>
          <span className="bg-black text-white text-xs px-2 py-1 rounded-full inline-flex">AI-POWERED</span>
        </div>

        {/* Middle section: Navigation Tabs */}
        <nav className="hidden md:flex flex-grow justify-center">
          <ul className="flex gap-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <span
                    className={`flex items-center gap-2 px-3 py-1 text-base sm:px-4 sm:py-2 sm:text-lg ${
                      pathname === item.href ? 'bg-black text-white rounded-full' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="relative w-3/4 h-full bg-white shadow-lg p-6 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6 text-black" />
            </button>
            <div className="flex items-center gap-2 mb-8">
              <Home className="w-8 h-8 text-black" />
              <span className="text-xl font-bold text-black">Retail Boss</span>
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md ${
                    pathname === item.href ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  } transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on navigation
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-lg">{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-4 border-t border-gray-200">
              <Link href="/admin-profile"
                className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span className="font-medium text-lg">Profile</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-lg">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

