'use client'

import '../globals.css'

/**
 * Auth Layout
 * 
 * Minimal layout for authentication pages (login, signup)
 * No sidebar, no dashboard chrome - just the auth form centered on the page
 * 
 * Note: This layout doesn't include html/body tags as they're provided by the root layout
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
