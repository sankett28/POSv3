import { api } from './api'

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

export function logout(): void {
  api.logout()
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('user_id')
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('access_token')
}

