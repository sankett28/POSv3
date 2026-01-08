'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import { Store } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      console.log('Login successful:', result)
      
      // Small delay to ensure localStorage is updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Verify token was saved
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Token was not saved. Please try again.')
      }
      
      router.push('/pos-billing')
    } catch (err: any) {
      console.error('Login error:', err)
      // Show more detailed error message
      let errorMessage = 'Invalid credentials. Please check your email and password.'
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.detail || err.response.statusText || errorMessage
      } else if (err.request) {
        // Request was made but no response (network error, backend not running)
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:8000'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <Store className="w-8 h-8 text-black mr-2" />
          <h1 className="text-2xl font-bold text-black">Retail Boss</h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

