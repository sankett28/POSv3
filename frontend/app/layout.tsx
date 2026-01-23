'use client'

import { Sora, Manrope } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import { initializeTheme } from '@/lib/theme'
import { Toaster } from '@/components/ui/toast'
import Footer from '@/components/ui/Footer'

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-sora',
})

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-manrope',
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
    // Skip theme fetching on public pages (landing, auth, onboarding)
    const isPublicPage = isAuthPage || isLandingPage || isOnboardingPage
    
    // Initialize theme immediately (skip fetch on public pages)
    initializeTheme(isPublicPage)
    
    // Listen for theme updates from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme-updated') {
        console.log('🔄 Theme updated in another tab, reloading...')
        // Reload theme when another tab saves changes (don't skip on public pages here)
        initializeTheme(false)
      }
      
      // Reinitialize theme when user logs in (access_token is set)
      if (e.key === 'access_token' && e.newValue) {
        console.log('🔄 User logged in, loading theme...')
        // Small delay to ensure token is fully set
        setTimeout(() => {
          initializeTheme(false)
        }, 100)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isAuthPage, isLandingPage, isOnboardingPage])
  
  // Reinitialize theme when navigating to authenticated pages
  useEffect(() => {
    if (showSidebar) {
      // User is on an authenticated page, ensure theme is loaded
      const token = localStorage.getItem('access_token')
      if (token) {
        initializeTheme(false)
      }
    }
  }, [showSidebar, pathname])

  return (
    <html lang="en" className="h-full">
      <head>
        <title>Garlic - Cafe POS System</title>
        <meta name="description" content="Garlic - Modern cafe management and POS system" />
      </head>
      <body className={`${manrope.variable} ${sora.variable} font-sans h-full bg-app-background antialiased`}>
        {showSidebar ? (
          <div className="relative flex min-h-screen w-full">
            {/* Sidebar - fixed on large screens, overlay or hidden on mobile */}
            <div className="fixed inset-y-0 left-0 z-30 md:static md:z-auto">
              <Sidebar />
            </div>

            {/* Main content area */}
            <div className="flex-1 ml-0 transition-all duration-300">
              <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
                {children}
              </main>
            </div>
          </div>
        ) : (
          children
        )}
        
        {/* Footer on all pages */}
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}