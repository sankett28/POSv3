/**
 * Theme management utilities for runtime CSS variable injection.
 * 
 * This module handles:
 * - Fetching theme from backend API
 * - Applying theme by setting CSS variables on document root
 * - Graceful fallback to defaults if theme fetch fails
 * 
 * IMPORTANT: This is the ONLY place where CSS variables should be modified.
 * Never set inline styles or modify CSS variables elsewhere.
 */

/**
 * Theme interface matching backend API response.
 * All colors are optional - if not provided, defaults from globals.css are used.
 */
export interface Theme {
  primary?: string;
  secondary?: string;
  background?: string;
  foreground?: string;
  accent?: string;
  danger?: string;
  success?: string;
  warning?: string;
}

/**
 * Apply theme to document by setting CSS variables.
 * 
 * This is the authoritative method for theme application.
 * Sets CSS variables on document.documentElement (root).
 * 
 * @param theme - Theme object with color values (hex codes)
 * 
 * @example
 * ```ts
 * applyTheme({
 *   primary: '#912b48',
 *   background: '#fff0f3',
 *   foreground: '#610027'
 * });
 * ```
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  // Only set variables that are provided
  // Undefined values will use defaults from globals.css
  if (theme.primary) {
    root.style.setProperty('--theme-primary', theme.primary);
  }
  
  if (theme.secondary) {
    root.style.setProperty('--theme-secondary', theme.secondary);
  }
  
  if (theme.background) {
    root.style.setProperty('--theme-background', theme.background);
  }
  
  if (theme.foreground) {
    root.style.setProperty('--theme-foreground', theme.foreground);
  }
  
  if (theme.accent) {
    root.style.setProperty('--theme-accent', theme.accent);
  }
  
  if (theme.danger) {
    root.style.setProperty('--theme-danger', theme.danger);
  }
  
  if (theme.success) {
    root.style.setProperty('--theme-success', theme.success);
  }
  
  if (theme.warning) {
    root.style.setProperty('--theme-warning', theme.warning);
  }
}

/**
 * Reset theme to defaults by removing runtime CSS variables.
 * 
 * This allows globals.css defaults to take effect.
 */
export function resetTheme(): void {
  const root = document.documentElement;
  
  root.style.removeProperty('--theme-primary');
  root.style.removeProperty('--theme-secondary');
  root.style.removeProperty('--theme-background');
  root.style.removeProperty('--theme-foreground');
  root.style.removeProperty('--theme-accent');
  root.style.removeProperty('--theme-danger');
  root.style.removeProperty('--theme-success');
  root.style.removeProperty('--theme-warning');
}

/**
 * Fetch theme from backend API.
 * 
 * @returns Theme object (empty if no custom theme configured)
 * @throws Error if API request fails
 */
export async function fetchTheme(): Promise<Theme> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/themes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when auth is implemented
      },
      credentials: 'include', // Include cookies for auth
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch theme: ${response.status} ${response.statusText}`);
    }
    
    const theme: Theme = await response.json();
    return theme;
  } catch (error) {
    console.error('Error fetching theme:', error);
    throw error;
  }
}

/**
 * Initialize theme on app bootstrap.
 * 
 * Fetches theme from backend and applies it.
 * Gracefully handles errors by falling back to defaults.
 * 
 * Call this once on app initialization (e.g., in root layout useEffect).
 * 
 * @returns Promise that resolves when theme is applied (or fails gracefully)
 */
export async function initializeTheme(): Promise<void> {
  try {
    const theme = await fetchTheme();
    
    // Only apply if theme has at least one color defined
    if (Object.keys(theme).length > 0 && Object.values(theme).some(v => v)) {
      applyTheme(theme);
      console.log('✅ Custom theme applied successfully');
    } else {
      console.log('ℹ️ No custom theme configured, using defaults');
    }
  } catch (error) {
    console.warn('⚠️ Failed to load custom theme, using defaults:', error);
    // Don't throw - gracefully fall back to defaults
  }
}

/**
 * Save theme to backend API.
 * 
 * @param theme - Theme object to save
 * @returns Saved theme response from backend
 * @throws Error if API request fails or validation fails
 */
export async function saveTheme(theme: Theme): Promise<any> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/themes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when auth is implemented
      },
      credentials: 'include',
      body: JSON.stringify({
        primary_color: theme.primary,
        secondary_color: theme.secondary,
        background_color: theme.background,
        foreground_color: theme.foreground,
        accent_color: theme.accent,
        danger_color: theme.danger,
        success_color: theme.success,
        warning_color: theme.warning,
        source: 'manual'
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save theme');
    }
    
    const savedTheme = await response.json();
    return savedTheme;
  } catch (error) {
    console.error('Error saving theme:', error);
    throw error;
  }
}

/**
 * Validate theme without saving.
 * 
 * Useful for live validation in theme editor UI.
 * 
 * @param theme - Theme object to validate
 * @returns Validation result with errors and warnings
 * @throws Error if API request fails
 */
export async function validateTheme(theme: Theme): Promise<{
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  contrast_ratios: Record<string, number>;
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/themes/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        primary_color: theme.primary,
        secondary_color: theme.secondary,
        background_color: theme.background,
        foreground_color: theme.foreground,
        accent_color: theme.accent,
        danger_color: theme.danger,
        success_color: theme.success,
        warning_color: theme.warning,
        source: 'manual'
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to validate theme');
    }
    
    const validation = await response.json();
    return validation;
  } catch (error) {
    console.error('Error validating theme:', error);
    throw error;
  }
}
