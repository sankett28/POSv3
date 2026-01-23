'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Signup via Supabase
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signupError) {
        throw signupError;
      }
      
      if (!data.user) {
        throw new Error('Signup failed. Please try again.');
      }
      
      // Store auth tokens
      if (data.session) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.session.access_token);
          localStorage.setItem('refresh_token', data.session.refresh_token);
          localStorage.setItem('token_expires_at', String(Math.floor(Date.now() / 1000) + 3600));
          localStorage.setItem('user_id', data.user.id);
          localStorage.setItem('user_email', data.user.email || '');
          
          // Also set cookie for middleware (24 hour expiry)
          document.cookie = `access_token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;
        }
      }
      
      // Show success toast
      toast({
        title: 'Account created',
        description: 'Welcome! Let\'s set up your business.',
      });
      
      // After successful signup, redirect to onboarding
      // New users always have onboarding_completed=false by default
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup. Please try again.');
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
            Create Account
          </h1>
          <p style={{ 
            fontSize: '0.9375rem', 
            color: '#666666',
            fontWeight: '400'
          }}>
            Sign up to get started with Lichi
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

          <div style={{ marginBottom: '1.25rem' }}>
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
              placeholder="At least 6 characters"
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
              htmlFor="confirmPassword"
              style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#1a1a1a',
                marginBottom: '0.5rem'
              }}
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#666666'
        }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: '#1a1a1a',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            Sign in
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
