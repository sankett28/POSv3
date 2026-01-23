/**
 * Onboarding Theme Editor Component
 * 
 * Simplified theme editor for onboarding flow.
 * Unlike the main ThemeEditor, this doesn't fetch existing theme
 * since the business doesn't exist yet during onboarding.
 * 
 * Features:
 * - Color pickers for primary semantic slots
 * - Live preview (applies theme before saving)
 * - No validation (validation happens on backend during onboarding submission)
 * - Returns theme data to parent component
 */
'use client'

import { useState, useEffect } from 'react'
import { Theme, applyTheme } from '@/lib/theme'

interface OnboardingThemeEditorProps {
  onThemeChange?: (theme: Theme) => void
  initialTheme?: Theme
}

export default function OnboardingThemeEditor({ 
  onThemeChange,
  initialTheme 
}: OnboardingThemeEditorProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme || {
    primary: '#912b48',
    secondary: '#ffffff',
    background: '#fff0f3',
    foreground: '#610027',
    accent: '#b45a69',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  })

  // Apply theme changes live
  useEffect(() => {
    applyTheme(theme)
    
    // Notify parent component of theme changes
    if (onThemeChange) {
      onThemeChange(theme)
    }
  }, [theme, onThemeChange])

  const handleColorChange = (slot: keyof Theme, value: string) => {
    const updatedTheme = { ...theme, [slot]: value }
    setTheme(updatedTheme)
  }

  const handleResetToDefaults = () => {
    const defaults: Theme = {
      primary: '#912b48',
      secondary: '#ffffff',
      background: '#fff0f3',
      foreground: '#610027',
      accent: '#b45a69',
      danger: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
    }
    setTheme(defaults)
  }

  const colorSlots: Array<{ key: keyof Theme; label: string; description: string }> = [
    { key: 'primary', label: 'Primary', description: 'Main brand color for CTAs and key elements' },
    { key: 'secondary', label: 'Secondary', description: 'Secondary buttons and less prominent elements' },
    { key: 'accent', label: 'Accent', description: 'Accent color for highlights' },
    { key: 'background', label: 'Background', description: 'Main background color' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* Color Preview Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-lg overflow-hidden shadow-lg">
        <div 
          className="h-64 flex flex-col items-center justify-center text-white relative"
          style={{ backgroundColor: theme.secondary || '#ffffff' }}
        >
          <h3 className="text-3xl font-bold tracking-widest mb-4" style={{ color: theme.primary }}>SECONDARY</h3>
          <p className="text-lg font-mono" style={{ color: theme.primary }}>{theme.secondary?.toUpperCase()}</p>
        </div>
        
        <div 
          className="h-64 flex flex-col items-center justify-center text-white relative"
          style={{ backgroundColor: theme.primary || '#912b48' }}
        >
          <h3 className="text-3xl font-bold tracking-widest mb-4">PRIMARY</h3>
          <p className="text-lg font-mono opacity-80">{theme.primary?.toUpperCase()}</p>
        </div>
        
        <div 
          className="h-64 flex flex-col items-center justify-center relative"
          style={{ backgroundColor: theme.accent || '#b45a69' }}
        >
          <h3 className="text-3xl font-bold tracking-widest mb-4 text-white">ACCENT</h3>
          <p className="text-lg font-mono text-white opacity-80">{theme.accent?.toUpperCase()}</p>
        </div>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colorSlots.map(({ key, label, description }) => (
          <div key={key} className="space-y-2">
            <label className="block text-base font-bold text-primary-text">
              {label}
            </label>
            <p className="text-sm text-secondary-text mb-3">{description}</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme[key] || '#000000'}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="w-20 h-12 rounded-lg border-2 border-border shadow-sm cursor-pointer"
              />
              <input
                type="text"
                value={theme[key] || ''}
                onChange={(e) => handleColorChange(key, e.target.value)}
                placeholder="#000000"
                className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base font-mono"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={handleResetToDefaults}
          className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
