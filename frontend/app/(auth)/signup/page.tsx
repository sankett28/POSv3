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
          // Mark onboarding as not completed
          localStorage.setItem('onboarding_completed', 'false');
        }
      }
      
      // Show success toast
      toast({
        title: 'Account created',
        description: 'Welcome! Let\'s set up your business.',
      });
      
      // After successful signup, redirect to onboarding
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup. Please try again.');
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
            Create Account
          </h1>
          <p style={{ 
            fontSize: '0.9375rem', 
            color: 'var(--color-text-muted)' 
          }}>
            Sign up to get started with Lichi
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
              placeholder="At least 6 characters"
              className="onboarding-input"
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label 
              htmlFor="confirmPassword"
              style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--color-text-muted)',
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
              className="onboarding-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="onboarding-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)'
        }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: 'var(--color-primary)',
              fontWeight: '600',
              textDecoration: 'underline'
            }}
          >
            Sign in
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
