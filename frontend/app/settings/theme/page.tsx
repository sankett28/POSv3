/**
 * Theme Settings Page
 * 
 * Admin page for customizing business theme.
 */
'use client'

import ThemeEditor from '@/components/ui/ThemeEditor'

export default function ThemeSettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <ThemeEditor />
    </div>
  )
}
