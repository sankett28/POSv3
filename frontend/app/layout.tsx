'use client'

import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { initializeTheme } from '@/lib/theme'
import { Toaster } from '@/components/ui/toast'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Pages that should not have sidebar
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isLandingPage = pathname === '/'
  const isOnboardingPage = pathname === '/onboarding'
  const showSidebar = !isAuthPage && !isLandingPage && !isOnboardingPage

  // Initialize theme on app bootstrap
  useEffect(() => {
    initializeTheme()
    
    // Listen for theme updates from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme-updated') {
        console.log('🔄 Theme updated in another tab, reloading...')
        // Reload theme when another tab saves changes
        initializeTheme()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Lichi - Cafe POS System</title>
        <meta name="description" content="Lichi - Modern cafe management and POS system" />
      </head>
      <body className={`${inter.className} h-full bg-app-background antialiased`}>
        {showSidebar ? (
          <div className="relative flex min-h-screen w-full">
            {/* Sidebar - fixed on large screens, overlay or hidden on mobile */}
            <div className="fixed inset-y-0 left-0 z-30 md:static md:z-auto">
              <Sidebar />
            </div>

            {/* Main content area */}
            <div className="flex-1  ml-0 transition-all duration-300">
              <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
        ) : (
          children
        )}
        <Toaster />
      </body>
    </html>
  )
}