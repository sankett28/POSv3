'use client'

import { useState } from 'react'
import { login } from '@/lib/auth'
import { Mail, Lock, ChefHat } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export default function LoginPage() {
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
      
      // Wait a bit longer to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Verify token was saved
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Token was not saved. Please try again.')
      }
      
      // Use window.location for a full page reload to ensure middleware sees the cookie
      window.location.href = '/orders'
    } catch (err: any) {
      console.error('Login error:', err)
      // Show more detailed error message
      let errorMessage = 'Invalid credentials. Please check your email and password.'
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.detail || err.response.statusText || errorMessage
      } else if (err.request) {
        // Request was made but no response (network error, backend not running)
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        errorMessage = `Cannot connect to server. Please ensure the backend is running on ${apiUrl}`
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF0F3] py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-[#E5E7EB] animate-fade-in">
          <div className="flex flex-col items-center mb-8">
          <div className="mb-6 animate-bounce-in">
            <Logo size="xl" showAccent={true} />
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-[#610027] mb-2">Welcome Back</h2>
            <p className="text-[#6B6B6B]">Your cafe management starts here</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-slide-in-bottom shadow-md">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#6B6B6B] mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="manager@lichy.com"
                className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027] placeholder-[#9CA3AF]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#6B6B6B] mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#912B48] focus:border-[#912B48] bg-white hover:bg-[#FFF0F3]/10 transition-all duration-200 text-[#610027] placeholder-[#9CA3AF]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#912B48] text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 hover:bg-[#B45A69]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <ChefHat className="w-5 h-5" />
                <span>Start My Shift</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-[#912B48] rounded-full animate-pulse"></div>
            <span className="text-xs text-[#9CA3AF] font-medium">Secure & Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}
