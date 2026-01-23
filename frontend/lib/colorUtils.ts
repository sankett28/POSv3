/**
 * Color utility functions for generating chart color palettes
 * from the primary theme color
 */

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Converts RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Adjusts the brightness of a color
 * @param hex - Hex color string
 * @param percent - Percentage to adjust (-100 to 100, negative = darker, positive = lighter)
 */
function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const factor = percent / 100
  
  if (factor > 0) {
    // Lighten: move towards white
    const r = rgb.r + (255 - rgb.r) * factor
    const g = rgb.g + (255 - rgb.g) * factor
    const b = rgb.b + (255 - rgb.b) * factor
    return rgbToHex(r, g, b)
  } else {
    // Darken: move towards black
    const r = rgb.r * (1 + factor)
    const g = rgb.g * (1 + factor)
    const b = rgb.b * (1 + factor)
    return rgbToHex(r, g, b)
  }
}

/**
 * Gets the primary color from CSS variables
 */
export function getPrimaryColor(): string {
  if (typeof window === 'undefined') return '#912b48' // Default fallback for SSR
  
  const root = document.documentElement
  const primaryColor = getComputedStyle(root).getPropertyValue('--primary').trim()
  
  // If it's a CSS variable reference, resolve it
  if (primaryColor.startsWith('var(')) {
    const varName = primaryColor.match(/var\((--[^)]+)\)/)?.[1]
    if (varName) {
      return getComputedStyle(root).getPropertyValue(varName).trim() || '#912b48'
    }
  }
  
  return primaryColor || '#912b48'
}

/**
 * Generates a color palette based on the primary color
 * Creates shades from lighter to darker
 * 
 * @param count - Number of colors needed
 * @returns Array of hex color strings
 */
export function generateChartColors(count: number): string[] {
  const primaryColor = getPrimaryColor()
  
  if (count === 1) {
    return [primaryColor]
  }
  
  if (count === 2) {
    return [primaryColor, adjustBrightness(primaryColor, -20)]
  }
  
  // For 3+ colors, create a range from lighter to darker
  const colors: string[] = []
  
  // Calculate the range of brightness adjustments
  // Start lighter, end darker
  const maxLighten = 40
  const maxDarken = -40
  const range = maxLighten - maxDarken
  const step = range / (count - 1)
  
  for (let i = 0; i < count; i++) {
    const adjustment = maxLighten - (step * i)
    colors.push(adjustBrightness(primaryColor, adjustment))
  }
  
  return colors
}

/**
 * Generates a single color shade from the primary color
 * @param index - Index of the color in the palette
 * @param total - Total number of colors needed
 */
export function getChartColor(index: number, total: number): string {
  const colors = generateChartColors(total)
  return colors[index % colors.length]
}
