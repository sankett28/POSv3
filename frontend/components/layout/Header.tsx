'use client'


import { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'
import { Bell, LogOut, MessageCircle, Settings, User, X, ReceiptText, UtensilsCrossed, FileText, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'


// Navigation items
const navItems = [
  { name: 'Orders', href: '/orders', icon: ReceiptText },
  { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { name: 'Transactions', href: '/transactions', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
]


export default function Header() {
  const pathname = usePathname()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


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


  // Performance: Memoize mobile menu close handler
  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])


  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="h-18 px-4 sm:px-6 flex items-center gap-4">
        {/* Logo */}
        <Link href="/orders" className="flex items-center">
          <Logo size="md" showAccent={true} />
        </Link>


        {/* Middle section: Navigation Tabs */}
        <nav className="hidden md:flex grow justify-center">
          <ul className="flex gap-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <span
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                      pathname === item.href 
                        ? 'bg-coffee-brown text-white' 
                        : 'text-primary-text hover:bg-brand-dusty-rose/10'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : 'text-primary-text'}`} />
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>


        {/* Right section: Actions */}
        <div className="relative flex items-center gap-2">
          <button 
            className="w-10 h-10 rounded-xl bg-warm-cream border border-border flex items-center justify-center hover:bg-card-background transition-colors" 
            type="button"
          >
            <MessageCircle className="w-5 h-5 text-primary-text" />
          </button>
          
          <button 
            className="w-10 h-10 rounded-xl bg-warm-cream border border-border flex items-center justify-center hover:bg-card-background transition-colors" 
            type="button"
          >
            <Bell className="w-5 h-5 text-primary-text" />
          </button>


          <button
            onClick={handleProfileDropdownToggle}
            className="w-10 h-10 rounded-xl bg-warm-cream border border-border flex items-center justify-center hover:bg-card-background transition-colors"
            type="button"
          >
            <User className="w-5 h-5 text-primary-text" />
          </button>


          {isProfileDropdownOpen && (
            <div className="absolute right-0 top-12 w-52 bg-card-background rounded-2xl shadow-lg border border-border p-2 z-50">
              <Link
                href="/admin-profile"
                onClick={handleProfileDropdownClose}
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-brand-dusty-rose/10 rounded-xl transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                href="/settings/taxes"
                onClick={handleProfileDropdownClose}
                className="flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-brand-dusty-rose/10 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <div className="h-px bg-border my-2" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-text hover:bg-brand-dusty-rose/10 rounded-xl transition-colors"
                type="button"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 md:hidden backdrop-blur-xs" onClick={handleMobileMenuClose}>
          <div className="relative w-[72%] max-w-[320px] h-full bg-card-background shadow-2xl p-6 animate-slide-in-left rounded-r-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 p-3 rounded-xl bg-coffee-brown text-white hover:bg-brand-dusty-rose transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]" 
              onClick={handleMobileMenuClose}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-8 mt-4">
              <Logo size="lg" showAccent={true} />
              <div className="flex flex-col">
                <span className="text-sm text-muted-text font-medium tracking-wide">Cafe Management</span>
              </div>
            </div>
            
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleMobileMenuClose}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                    pathname === item.href 
                      ? 'bg-coffee-brown text-white shadow-lg' 
                      : 'text-primary-text hover:bg-brand-dusty-rose/10'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${pathname === item.href ? 'text-white' : 'text-primary-text'}`} />
                  <span className="font-semibold text-lg">{item.name}</span>
                </Link>
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-border">
              <Link 
                href="/admin-profile"
                className="flex items-center gap-4 px-5 py-4 rounded-xl text-primary-text hover:bg-brand-dusty-rose/10 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] mb-3"
                onClick={handleMobileMenuClose}
              >
                <User className="w-6 h-6 text-primary-text" />
                <span className="font-semibold text-lg">Profile</span>
              </Link>
              
              <Link 
                href="/settings/taxes"
                className="flex items-center gap-4 px-5 py-4 rounded-xl text-primary-text hover:bg-brand-dusty-rose/10 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] mb-3"
                onClick={handleMobileMenuClose}
              >
                <Settings className="w-6 h-6 text-primary-text" />
                <span className="font-semibold text-lg">Settings</span>
              </Link>
              
              <button
                onClick={() => {
                  handleLogout()
                  handleMobileMenuClose()
                }}
                className="flex items-center gap-4 px-5 py-4 rounded-xl bg-coffee-brown text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] w-full shadow-md hover:bg-brand-dusty-rose"
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
