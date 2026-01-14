'use client'

import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import '../styles/globals.css'
import Header from '@/components/layout/Header'

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
      <body className={`${inter.className} bg-[#F5F3EE]`}>
        {!isLoginPage && <Header />}
        {children}
      </body>
    </html>
  )
}

