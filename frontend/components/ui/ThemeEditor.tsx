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
import { Theme, applyTheme, fetchTheme, saveTheme, validateTheme } from '@/lib/theme'
import Button from './Button'

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
  const [inputMode, setInputMode] = useState<'manual' | 'url' | null>(null)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isExtractingColors, setIsExtractingColors] = useState(false)

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

  const handleExtractFromUrl = async () => {
    if (!websiteUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid website URL' })
      return
    }

    // Validate URL format
    try {
      new URL(websiteUrl)
    } catch {
      setMessage({ type: 'error', text: 'Please enter a valid URL (e.g., https://www.example.com)' })
      return
    }

    setIsExtractingColors(true)
    setMessage(null)

    try {
      console.log('🎨 Extracting colors from:', websiteUrl)

      // Call our Next.js API route which proxies to brand.dev
      const response = await fetch('/api/extract-colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })

      const data = await response.json()

      console.log('📊 API Response:', { status: response.status, data })

      if (!response.ok) {
        // More detailed error messages based on response
        let errorMessage = data.error || 'Failed to extract colors'
        
        if (data.details) {
          console.error('Error details:', data.details)
        }

        // Check if it's an API endpoint issue
        if (response.status === 403 && errorMessage.includes('endpoint')) {
          errorMessage = '⚠️ API Configuration Issue: The brand.dev API endpoint is incorrect. Please check BRAND_DEV_API_ENDPOINT_GUIDE.md for instructions on finding the correct endpoint from https://docs.brand.dev'
        }
        // Check if it's an API key configuration issue
        else if (errorMessage.includes('not configured') || response.status === 500) {
          errorMessage = '⚠️ Setup Required: Please add your brand.dev API key to .env.local and restart the server. See BRAND_DEV_INTEGRATION_SUMMARY.md for instructions.'
        }

        throw new Error(errorMessage)
      }

      if (data.success && data.colors) {
        console.log('✅ Colors extracted successfully:', data.colors)
        console.log('📦 Raw brand data:', data.rawData)

        // Apply the extracted colors to the theme
        const extractedTheme: Theme = {
          primary: data.colors.primary,
          secondary: data.colors.secondary,
          accent: data.colors.accent,
          background: data.colors.background,
          foreground: data.colors.foreground,
          danger: data.colors.danger,
          success: data.colors.success,
          warning: data.colors.warning,
        }

        setTheme(extractedTheme)
        applyTheme(extractedTheme)
        
        setMessage({ 
          type: 'success', 
          text: '✓ Colors extracted successfully! Review and save when ready.' 
        })

        // Switch to manual mode to show the extracted colors
        setInputMode('manual')
      } else {
        throw new Error('Invalid response from color extraction service')
      }
      
    } catch (error: any) {
      console.error('❌ Error extracting colors:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to extract colors from website. Please try again or use manual input.' 
      })
    } finally {
      setIsExtractingColors(false)
    }
  }
  

  const colorSlots: Array<{ key: keyof Theme; label: string; description: string }> = [
    { key: 'primary', label: 'Primary', description: 'Main brand color for CTAs and key elements' },
    { key: 'secondary', label: 'Secondary', description: 'Secondary buttons and less prominent elements' },
    { key: 'accent', label: 'Accent', description: 'Accent color for highlights' },
    { key: 'background', label: 'Background', description: 'Main background color' },
  ]

  if (isLoading && !theme.primary) {
    return <div className="p-6">Loading theme editor...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Input Mode Selection */}
      {!inputMode && (
        <div className="bg-white rounded-lg shadow-md p-8 border border-border">
          <h2 className="text-2xl font-bold text-primary-text mb-4">Customize Your Theme</h2>
          <p className="text-secondary-text mb-6">Choose how you'd like to set up your brand colors</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setInputMode('manual')}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Add Manually</h3>
                <p className="text-sm opacity-90">Pick colors using color pickers and customize each element</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </button>

            <button
              onClick={() => setInputMode('url')}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Add URL</h3>
                <p className="text-sm opacity-90">Extract colors automatically from your cafe's website</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </button>
          </div>
        </div>
      )}

      {/* URL Input Mode */}
      {inputMode === 'url' && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 border border-border">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <button
                onClick={() => {
                  setInputMode(null)
                  setWebsiteUrl('')
                  setMessage(null)
                }}
                className="text-secondary-text hover:text-primary-text transition-colors p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg shrink-0"
                title="Back to selection"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-text truncate">Extract Colors from Website</h2>
            </div>
            <button
              onClick={() => {
                setInputMode(null)
                setWebsiteUrl('')
                setMessage(null)
              }}
              className="text-secondary-text hover:text-primary-text transition-colors p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg shrink-0 ml-2"
              title="Close"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-primary-text mb-2">
                Website URL
              </label>
              <p className="text-xs sm:text-sm text-secondary-text mb-3">
                Enter your cafe's website URL to automatically extract brand colors
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://www.yourcafe.com"
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
                <Button
                  onClick={handleExtractFromUrl}
                  disabled={isExtractingColors || !websiteUrl.trim()}
                  className="bg-black hover:bg-gray-900 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold whitespace-nowrap text-sm sm:text-base w-full sm:w-auto"
                >
                  {isExtractingColors ? 'Extracting...' : 'Extract Colors'}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs sm:text-sm text-blue-800 min-w-0">
                  <p className="font-semibold mb-1">How it works:</p>
                  <ul className="list-disc list-inside space-y-1 ml-1 sm:ml-2">
                    <li className="break-words">We'll analyze your website's design</li>
                    <li className="break-words">Extract dominant colors from your branding</li>
                    <li className="break-words">Automatically apply them to your theme</li>
                    <li className="break-words">You can fine-tune the colors afterwards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Input Mode - Existing Color Picker Interface */}
      {inputMode === 'manual' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setInputMode(null)
                  setMessage(null)
                }}
                className="text-secondary-text hover:text-primary-text transition-colors p-2 hover:bg-gray-100 rounded-lg"
                title="Back to selection"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-primary-text">Customize Colors Manually</h2>
            </div>
            <button
              onClick={() => {
                setInputMode(null)
                setMessage(null)
              }}
              className="text-secondary-text hover:text-primary-text transition-colors p-2 hover:bg-gray-100 rounded-lg"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleValidate}
              disabled={isLoading}
              className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {isLoading ? 'Validating...' : 'Validate'}
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {isSaving ? 'Saving...' : 'Save Theme'}
            </Button>
            
            <Button
              onClick={handleReset}
              disabled={isLoading || isSaving}
              className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset Changes
            </Button>
            
            <Button
              onClick={handleResetToDefaults}
              disabled={isLoading || isSaving}
              className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Reset to Defaults
            </Button>
          </div>
        </>
      )}

      {/* Message - Show for all modes */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
