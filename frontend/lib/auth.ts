import { api } from './api'
import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  onboarding_completed: boolean
  has_business: boolean
}

export async function login(email: string, password: string): Promise<User> {
  const response = await api.login(email, password)
  // Backend now returns complete user state with onboarding_completed and has_business
  return {
    id: response.user.id,
    email: response.user.email,
    onboarding_completed: response.user.onboarding_completed,
    has_business: response.user.has_business,
  }
}

export async function logout(): Promise<void> {
  await api.logout()
  await supabase.auth.signOut()
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('user_id')
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('access_token')
}

