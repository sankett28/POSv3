/**
 * Theme Editor Component
 * 
 * Provides UI for customizing business theme colors.
 * Features:
 * - Color pickers for all semantic slots
 * - Live preview (applies theme before saving)
 * - Validation with error/warning display
 * - Save & reset actions
 */
'use client'

import { useState, useEffect } from 'react'
import { Theme, applyTheme, fetchTheme, saveTheme, validateTheme, resetTheme } from '@/lib/theme'
import Button from './Button'
import { SliderPicker } from 'react-color'

interface ValidationResult {
  is_valid: boolean
  errors: string[]
  warnings: string[]
  contrast_ratios: Record<string, number>
}

export default function ThemeEditor() {
  const [theme, setTheme] = useState<Theme>({
    primary: '#912b48',
    secondary: '#ffffff',
    background: '#fff0f3',
    foreground: '#610027',
    accent: '#b45a69',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  })
  
  const [originalTheme, setOriginalTheme] = useState<Theme>({})
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load current theme on mount
  useEffect(() => {
    loadCurrentTheme()
  }, [])

  const loadCurrentTheme = async () => {
    setIsLoading(true)
    try {
      const currentTheme = await fetchTheme()
      
      // Map backend response to editor state
      // Backend returns: { primary, secondary, background, foreground, accent, danger, success, warning }
      // All fields are optional - use defaults if not provided
      const loadedTheme: Theme = {
        primary: currentTheme.primary || '#912b48',
        secondary: currentTheme.secondary || '#ffffff',
        background: currentTheme.background || '#fff0f3',
        foreground: currentTheme.foreground || '#610027',
        accent: currentTheme.accent || '#b45a69',
        danger: currentTheme.danger || '#ef4444',
        success: currentTheme.success || '#22c55e',
        warning: currentTheme.warning || '#f59e0b',
      }
      
      setTheme(loadedTheme)
      setOriginalTheme(loadedTheme)
      
      // Apply the loaded theme immediately
      applyTheme(loadedTheme)
      
      console.log('✅ Theme loaded from database:', loadedTheme)
    } catch (error: any) {
      console.error('Failed to load theme:', error)
      
      // Check if it's an auth error
      if (error.message && (error.message.includes('401') || error.message.includes('404'))) {
        setMessage({ 
          type: 'error', 
          text: 'Please log in to load your theme settings.' 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Failed to load theme from server. Using defaults.' 
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleColorChange = (slot: keyof Theme, value: string) => {
    const updatedTheme = { ...theme, [slot]: value }
    setTheme(updatedTheme)
    
    // Live preview
    applyTheme(updatedTheme)
    
    // Clear previous validation
    setValidation(null)
  }

  const handleValidate = async () => {
    setIsLoading(true)
    try {
      const result = await validateTheme(theme)
      setValidation(result)
      
      if (result.is_valid) {
        setMessage({ type: 'success', text: 'Theme is valid! ✓' })
      } else {
        setMessage({ type: 'error', text: 'Theme has validation errors' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to validate theme' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)
    
    try {
      // Validate first
      const result = await validateTheme(theme)
      
      if (!result.is_valid) {
        setValidation(result)
        setMessage({ type: 'error', text: 'Cannot save: Theme has validation errors' })
        setIsSaving(false)
        return
      }
      
      // Save theme to backend
      await saveTheme(theme)
      setOriginalTheme(theme)
      
      // ✨ REAL-TIME UPDATE: Apply theme immediately to current page
      applyTheme(theme)
      
      // ✨ BROADCAST: Notify other tabs/windows to update their theme
      // This uses localStorage event to sync across tabs
      localStorage.setItem('theme-updated', Date.now().toString())
      
      setMessage({ type: 'success', text: '✓ Theme saved and applied successfully!' })
      
      console.log('✅ Theme applied in real-time:', theme)
    } catch (error: any) {
      console.error('Error saving theme:', error)
      
      // Provide specific error messages
      let errorMessage = 'Failed to save theme'
      
      if (error.message) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorMessage = 'Please log in to save theme settings'
        } else if (error.message.includes('404')) {
          errorMessage = 'Business not found. Please complete onboarding first.'
        } else if (error.message.includes('validation')) {
          errorMessage = 'Theme validation failed: ' + error.message
        } else {
          errorMessage = error.message
        }
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setTheme({
      primary: originalTheme.primary || '#912b48',
      secondary: originalTheme.secondary || '#ffffff',
      background: originalTheme.background || '#fff0f3',
      foreground: originalTheme.foreground || '#610027',
      accent: originalTheme.accent || '#b45a69',
      danger: originalTheme.danger || '#ef4444',
      success: originalTheme.success || '#22c55e',
      warning: originalTheme.warning || '#f59e0b',
    })
    applyTheme(originalTheme)
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
    applyTheme(defaults)
    setValidation(null)
    setMessage(null)
  }
  

  const colorSlots: Array<{ key: keyof Theme; label: string; description: string }> = [
    { key: 'primary', label: 'Primary', description: 'Main brand color for CTAs and key elements' },
    { key: 'secondary', label: 'Secondary', description: 'Secondary buttons and less prominent elements' },
    { key: 'background', label: 'Background', description: 'Main background color' },
   
    { key: 'accent', label: 'Accent', description: 'Accent color for highlights' },
   
  ]

  if (isLoading && !theme.primary) {
    return <div className="p-6">Loading theme editor...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-card-background rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-primary-text mb-2">Theme Editor</h2>
        <p className="text-secondary-text mb-6">
          Customize your business theme colors. Changes are previewed live.
        </p>

        <SliderPicker color={"#fff"} onChangeComplete={(color) => console.log('color from picker', color)} />

        {/* Color Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {colorSlots.map(({ key, label, description }) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium text-primary-text">
                {label}
              </label>
              <p className="text-xs text-secondary-text mb-2">{description}</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme[key] || '#000000'}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-16 h-10 rounded border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={theme[key] || ''}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Validation Results */}
        {validation && (
          <div className="mb-6 space-y-3">
            {validation.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h3 className="font-semibold text-red-800 mb-2">Validation Errors:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {validation.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Warnings:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                  {validation.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.is_valid && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
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
          <div className={`mb-6 p-4 rounded ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleValidate}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Validating...' : 'Validate'}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Theme'}
          </Button>
          
          <Button
            onClick={handleReset}
            disabled={isLoading || isSaving}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Reset Changes
          </Button>
          
          <Button
            onClick={handleResetToDefaults}
            disabled={isLoading || isSaving}
            className="bg-gray-400 hover:bg-gray-500 text-white"
          >
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-card-background rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-primary-text mb-4">Live Preview</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded bg-primary text-white">Primary Button</div>
            <div className="px-4 py-2 rounded bg-secondary text-foreground border border-border">Secondary Button</div>
            <div className="px-4 py-2 rounded bg-accent text-white">Accent Button</div>
          </div>
          
          <div className="p-4 rounded bg-background border border-border">
            <p className="text-foreground mb-2">This is foreground text on background</p>
            <p className="text-secondary-text">This is secondary text</p>
          </div>
          
          <div className="flex gap-3">
            <div className="px-3 py-2 rounded bg-success text-white text-sm">Success</div>
            <div className="px-3 py-2 rounded bg-warning text-white text-sm">Warning</div>
            <div className="px-3 py-2 rounded bg-danger text-white text-sm">Danger</div>
          </div>
        </div>
      </div>
    </div>
  )
}
