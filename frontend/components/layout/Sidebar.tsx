'use client'

import { memo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth'
import { BarChart3, FileText, LogOut, Menu, ReceiptText, Settings, User, UtensilsCrossed, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

// Performance: Memoize navItems to prevent recreation on every render
const navItems = [
  { href: '/orders', label: 'Orders', icon: ReceiptText },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/transactions', label: 'Transactions', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings/taxes', label: 'Settings', icon: Settings },
  { href: '/admin-profile', label: 'Profile', icon: User },
]

// Mobile Header Component
function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card-background/95 backdrop-blur-sm border-b border-border/10 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="md" showAccent={true} />
          <span className="text-sm text-coffee-brown font-medium">Cafe Management</span>
        </div>
        <button
          onClick={onMenuClick}
          className="p-2 text-coffee-brown hover:bg-warm-cream/50 rounded-lg transition-all duration-200"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
      }
    }

    // Close sidebar on route change
    setIsOpen(false)
    
    // Add resize listener
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [pathname])

  const isRouteActive = (href: string) => {
    if (pathname === href) return true
    if (href !== '/' && pathname?.startsWith(`${href}/`)) return true
    return false
  }

  const toggleSidebar = () => {
    // Toggle body scroll lock when sidebar is open on mobile
    if (typeof window !== 'undefined') {
      document.body.style.overflow = !isOpen ? 'hidden' : ''
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      <MobileHeader onMenuClick={toggleSidebar} />
      {/* Backdrop for mobile */}
      <div 
        className={cn(
          'fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-card-background to-warm-cream/95 backdrop-blur-sm',
          'border-r border-border/10 shadow-xl transition-all duration-300 ease-in-out transform',
          'flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Sidebar Header */}
        <div className="px-4 py-6 border-b border-border/10 bg-gradient-to-r from-card-background to-warm-cream/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="lg" showAccent={true} />
              <div className="hidden lg:flex flex-col">
                <span className="text-sm font-medium text-coffee-brown">Cafe Management</span>
              </div>
            </div>
            <button 
              className="lg:hidden p-1.5 text-coffee-brown hover:bg-warm-cream/50 rounded-lg transition-colors"
              onClick={toggleSidebar}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = isRouteActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2.5 mx-2 rounded-xl text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-primary-text hover:bg-brand-dusty-rose/10 hover:text-coffee-brown',
                'mb-1.5'
              )}
            >
              <div className={cn(
                'flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-colors',
                isActive ? 'bg-white/15' : 'bg-warm-cream group-hover:bg-card-background/50'
              )}>
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-white' : 'text-primary-text group-hover:text-coffee-brown'
                )} />
              </div>
              <span className="ml-3 text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border/10">
        <button
          type="button"
          onClick={logout}
          className="group w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-primary-text hover:bg-brand-dusty-rose/10 hover:text-coffee-brown transition-colors"
        >
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-warm-cream group-hover:bg-card-background/50 transition-colors">
            <LogOut className="w-5 h-5 text-primary-text group-hover:text-coffee-brown" />
          </div>
          <span className="ml-3 text-sm font-medium">Logout</span>
        </button>
      </div>
      </aside>
    </>
  )
}

// Performance: Memoize Sidebar to prevent unnecessary re-renders
export default memo(Sidebar)

