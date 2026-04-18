'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/password/reset', { token, password });
      router.push('/login?reset=success');
    } catch (err: any) {
      setError('Error resetting password. The link may have expired');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '100%', padding: '0.75rem', borderRadius: '6px' }}>
        Token is missing or invalid
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '100%', padding: '0.75rem', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--grey-500)' }}>New password</label>
        <input
          type="password"
          className="input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--grey-500)' }}>Confirm password</label>
        <input
          type="password"
          className="input"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <button 
        type="submit" 
        className="button button-primary mt-2" 
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Set new password'}
      </button>
    </form>
  );
}
