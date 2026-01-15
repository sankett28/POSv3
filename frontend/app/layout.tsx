'use client'

import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import '../styles/globals.css'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

// Performance: Optimize font loading with display swap to prevent render blocking
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text during font load
  preload: true, // Preloads font for better performance
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <html lang="en">
      <head>
        <title>Lichi - Cafe POS System</title>
        <meta name="description" content="Lichi - Modern cafe management and POS system" />
      </head>
      <body className={`${inter.className} bg-[#F9F9F9]`}>
        {isLoginPage ? (
          children
        ) : (
          <div className="min-h-screen bg-[#F9F9F9]">
            <Sidebar />
            <div className="md:pl-64 pl-16">
              <Header />
              <main className="min-h-[calc(100vh-72px)] px-4 py-5 sm:px-6 sm:py-6">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}

