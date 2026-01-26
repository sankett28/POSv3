'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // Performance: Check auth once per render
  const authenticated = isAuthenticated()

  useEffect(() => {
    if (!authenticated) {
      router.push('/login')
    }
  }, [router, authenticated])

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col">
      <div className="flex flex-1 pt-16 lg:pt-0">
        <Sidebar />
        <main className="flex-1 md:ml-64 transition-all duration-300">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

