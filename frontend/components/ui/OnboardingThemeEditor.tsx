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
 * - Validation support (calls backend validation endpoint)
 * - Returns theme data to parent component
 */
'use client'

import { useState, useEffect } from 'react'
import { Theme, applyTheme, validateTheme } from '@/lib/theme'
import Button from './Button'

interface OnboardingThemeEditorProps {
  onThemeChange?: (theme: Theme) => void
  initialTheme?: Theme
}

interface ValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  contrast_ratios: Record<string, number>
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

  const [originalTheme, setOriginalTheme] = useState<Theme>(initialTheme || {
    primary: '#912b48',
    secondary: '#ffffff',
    background: '#fff0f3',
    foreground: '#610027',
    accent: '#b45a69',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  })

  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
    
    // Clear previous validation when colors change
    setValidation(null)
    setMessage(null)
  }

  const handleValidate = async () => {
    setIsValidating(true)
    setMessage(null)
    
    try {
      const result = await validateTheme(theme)
      setValidation(result)
      
      if (result.is_valid) {
        setMessage({ type: 'success', text: 'Theme is valid! ✓' })
      } else {
        setMessage({ type: 'error', text: 'Theme has validation errors' })
      }
    } catch (error: any) {
      console.error('Validation error:', error)
      setMessage({ type: 'error', text: 'Failed to validate theme. Please try again.' })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSaveTheme = () => {
    // For onboarding, we don't actually save to backend here
    // The theme will be saved as part of onboarding completion
    // This button just confirms the selection and updates the parent
    setOriginalTheme(theme)
    setMessage({ type: 'success', text: '✓ Theme saved! It will be applied when you complete onboarding.' })
    
    if (onThemeChange) {
      onThemeChange(theme)
    }
  }

  const handleResetChanges = () => {
    setTheme(originalTheme)
    setValidation(null)
    setMessage(null)
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
    setValidation(null)
    setMessage(null)
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

      {/* Validation Results */}
      {validation && (
        <div className="space-y-3">
          {validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Validation Errors:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Warnings:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {validation.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.is_valid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✓ Theme is valid</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>Contrast ratios:</p>
                <ul className="list-disc list-inside ml-4">
                  {Object.entries(validation.contrast_ratios).map(([key, ratio]) => (
                    <li key={key}>
                      {key.replace('_', ' / ')}: {ratio.toFixed(2)}:1
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
        >
          {isValidating ? 'Validating...' : 'Validate'}
        </Button>
        
        <Button
          onClick={handleSaveTheme}
          disabled={isValidating}
          className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Save Theme
        </Button>
        
        <Button
          onClick={handleResetChanges}
          disabled={isValidating}
          className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Reset Changes
        </Button>
        
        <Button
          onClick={handleResetToDefaults}
          disabled={isValidating}
          className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}
