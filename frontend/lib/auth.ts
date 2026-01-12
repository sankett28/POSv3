import { api } from './api'
import { supabase } from './supabase'

export interface User {
  id: string
  email: string
}

export async function login(email: string, password: string): Promise<User> {
  const response = await api.login(email, password)
  return {
    id: response.user_id,
    email: response.email,
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

