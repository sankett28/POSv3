'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Login via API
      const response = await api.login(email, password);
      
      // Store user info
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_id', response.user_id);
        localStorage.setItem('user_email', response.email);
      }
      
      // Check if user has completed onboarding
      const onboardingComplete = localStorage.getItem('onboarding_completed');
      
      if (onboardingComplete === 'true') {
        // User has completed onboarding, go to orders page
        router.push('/orders');
      } else {
        // User hasn't completed onboarding, redirect there
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      padding: '2rem 1rem'
    }}>
      <style>{`
        .auth-input::placeholder {
          color: #999999 !important;
          opacity: 1;
        }
      `}</style>
      <div style={{
        background: '#ffffff',
        borderRadius: '0.75rem',
        padding: '3rem 2.5rem',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#1a1a1a',
            marginBottom: '0.5rem',
            letterSpacing: '-0.01em'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            fontSize: '0.9375rem', 
            color: '#666666',
            fontWeight: '400'
          }}>
            Sign in to continue to Lichi
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.875rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#1a1a1a',
                marginBottom: '0.5rem'
              }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="auth-input"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                background: '#ffffff',
                color: '#1a1a1a',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a1a1a';
                e.target.style.boxShadow = '0 0 0 3px rgba(26, 26, 26, 0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="password"
              style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#1a1a1a',
                marginBottom: '0.5rem'
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="auth-input"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                background: '#ffffff',
                color: '#1a1a1a',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a1a1a';
                e.target.style.boxShadow = '0 0 0 3px rgba(26, 26, 26, 0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              background: loading ? '#666666' : '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#000000';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#1a1a1a';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#666666'
        }}>
          Don't have an account?{' '}
          <Link
            href="/signup"
            style={{
              color: '#1a1a1a',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            Sign up
          </Link>
        </div>

        <div style={{ 
          marginTop: '1.25rem', 
          textAlign: 'center' 
        }}>
          <Link 
            href="/"
            style={{
              fontSize: '0.875rem',
              color: '#999999',
              textDecoration: 'none'
            }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
