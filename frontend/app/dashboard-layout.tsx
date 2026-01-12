'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-[#F5F3EE]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

