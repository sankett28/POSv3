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
    <div className="onboarding-container">
      <div className="onboarding-card" style={{ maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: 'var(--color-text)',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            fontSize: '0.9375rem', 
            color: 'var(--color-text-muted)' 
          }}>
            Sign in to continue to Lichi
          </p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#c33'
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
                color: 'var(--color-text-muted)',
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
              className="onboarding-input"
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label 
              htmlFor="password"
              style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--color-text-muted)',
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
              className="onboarding-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="onboarding-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)'
        }}>
          Don't have an account?{' '}
          <Link
            href="/signup"
            style={{
              color: 'var(--color-primary)',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            Sign up
          </Link>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center' 
        }}>
          <Link 
            href="/"
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
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
