'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function ResetPasswordForm({ dict }: { dict: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const validatePassword = (val: string) => {
    if (!val) return dict.password_required;
    if (val.length < 8) return dict.password_min;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const pErr = validatePassword(password);
    if (pErr) {
      setPasswordError(pErr);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError(dict.password_mismatch);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/password/reset', { token, password });
      router.push('/login?reset=success');
    } catch (err: any) {
      setError(dict.error_msg);
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
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--grey-500)' }}>{dict.password_label}</label>
        <input
          type="password"
          className="input"
          style={{ borderColor: passwordError ? '#dc2626' : undefined }}
          placeholder={dict.password_placeholder}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(null);
          }}
          required
          autoComplete="new-password"
        />
        {passwordError && (
          <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '-4px' }}>{passwordError}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--grey-500)' }}>{dict.confirm_password_label}</label>
        <input
          type="password"
          className="input"
          style={{ borderColor: confirmError ? '#dc2626' : undefined }}
          placeholder={dict.confirm_password_placeholder}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmError) setConfirmError(null);
          }}
          required
          autoComplete="new-password"
        />
        {confirmError && (
          <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '-4px' }}>{confirmError}</p>
        )}
      </div>

      <button 
        type="submit" 
        className="button button-primary mt-1" 
        disabled={loading}
      >
        {loading ? dict.loading_btn : dict.submit_btn}
      </button>
    </form>
  );
}
