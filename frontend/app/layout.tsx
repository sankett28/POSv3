'use client'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import '../styles/globals.css'
import Header from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isLoginPage && <Header />}
        {children}
      </body>
    </html>
  )
}

