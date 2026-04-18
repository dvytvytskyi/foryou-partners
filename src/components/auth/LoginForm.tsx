'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/leads');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--grey-500)' }}>Email address</label>
        <input
          type="email"
          className="input"
          placeholder="eg. johnfrans@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
          name="user_email_identity"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--grey-500)' }}>Password</label>
          <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary-color)' }}>
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          className="input"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          name="user_password_secure"
        />
        <p style={{ fontSize: '11px', color: 'var(--grey-400)', marginTop: '6px' }}>
          Must be at least 8 characters
        </p>
      </div>

      <button 
        type="submit" 
        className="button button-primary mt-4" 
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Sign in'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ fontSize: '13px', color: 'var(--grey-500)' }}>
          Don't have an account? <Link href="#" style={{ color: 'var(--primary-color)', fontWeight: '500' }}>Contact administrator</Link>
        </p>
      </div>
    </form>
  );
}
