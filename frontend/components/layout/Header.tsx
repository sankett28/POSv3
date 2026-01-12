'use client'

import { useState } from 'react'

import { logout, getCurrentUserId } from '@/lib/auth'
import { LogOut, User, ShoppingBag, Receipt, Users, Package, Megaphone, ShoppingCart, Home, LayoutGrid, DollarSign, Mic, LineChart, Bell, Menu, X, Coffee, ChefHat, UtensilsCrossed, FileText, BarChart3, Settings } from 'lucide-react'
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
    { name: 'Orders', href: '/orders', icon: Receipt },
    { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
    { name: 'Transactions', href: '/transactions', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Marketing', href: '/marketing', icon: Megaphone },
    { name: 'Customers', href: '/customers', icon: Users },
  ]

  return (
    <header className="sticky top-0 z-50 shadow-md rounded-b-2xl bg-[#FAF7F2]">
        <div className="px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
          <button className="md:hidden p-3 rounded-xl bg-[#3E2C24] text-white hover:bg-[#2c1f19] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        {/* Left section: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <div className="w-10 h-10 bg-[#C89B63] rounded-xl flex items-center justify-center shadow-md">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#3E2C24]">BrewBite</span>
              <span className="text-xs text-[#9CA3AF] font-medium tracking-wide">Cafe Management</span>
            </div>
          </Link>
        </div>

        {/* Middle section: Navigation Tabs */}
        <nav className="hidden md:flex flex-grow justify-center">
          <ul className="flex gap-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <span
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${pathname === item.href ? 'bg-[#3E2C24] text-white' : 'text-[#3E2C24] hover:bg-[#C89B63]/10'}`}
                  >
                    <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : 'text-[#3E2C24]'}`} />
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right section: Profile Icon and Logout */}
        <div className="flex items-center gap-3">
            <Link href="/admin-profile" className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5E7EB] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
            <User className="w-5 h-5 text-[#3E2C24]" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-3 rounded-xl bg-[#C89B63] text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="relative w-4/5 h-full bg-[#FAF7F2] shadow-2xl p-6 animate-slide-in-left rounded-r-2xl" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 p-3 rounded-xl bg-[#3E2C24] text-white hover:bg-[#2c1f19] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 mb-8 mt-4">
              <div className="w-12 h-12 bg-[#C89B63] rounded-xl flex items-center justify-center shadow-lg">
                <Coffee className="w-7 h-7 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-[#3E2C24] leading-tight">BrewBite</span>
                <span className="text-sm text-[#9CA3AF] font-medium tracking-wide">Cafe Management</span>
              </div>
            </div>
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${pathname === item.href ? 'bg-[#3E2C24] text-white shadow-lg' : 'text-[#3E2C24] hover:bg-[#C89B63]/10'}`}
                >
                  <item.icon className={`w-6 h-6 ${pathname === item.href ? 'text-white' : 'text-[#3E2C24]'}`} />
                  <span className="font-semibold text-lg">{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
              <Link href="/admin-profile"
                className="flex items-center gap-4 px-5 py-4 rounded-xl text-[#3E2C24] hover:bg-[#C89B63]/10 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] mb-3"
              >
                <User className="w-6 h-6 text-[#3E2C24]" />
                <span className="font-semibold text-lg">Profile Settings</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-[#C89B63] text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] w-full shadow-md"
              >
                <LogOut className="w-6 h-6 text-white" />
                <span className="font-semibold text-lg">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
