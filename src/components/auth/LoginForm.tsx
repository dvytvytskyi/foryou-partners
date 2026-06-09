'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function LoginForm({ dict }: { dict: any }) {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Field errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    if (!value) return dict.errors.email_required;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return dict.errors.email_invalid;
    return null;
  };

  const validatePassword = (value: string) => {
    if (!value) return dict.errors.password_required;
    if (value.length < 8) return dict.errors.password_min;
    return null;
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all before submit
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    
    if (eErr || pErr) {
      setEmailError(eErr);
      setPasswordError(pErr);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      // Update the global auth store
      setAuth(data.user, { 
        access_token: data.access_token, 
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || dict.errors.invalid_credentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Email Field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '14px', color: '#64748b' }}>{dict.email_label}</label>
        <input
          type="email"
          className="input"
          style={{ borderColor: emailError ? '#dc2626' : undefined, height: '42px', fontFamily: 'var(--font-inter)' }}
          placeholder={dict.email_placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          onBlur={handleEmailBlur}
          required
          autoComplete="off"
          name="user_email_identity"
        />
        {emailError && (
          <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '-4px' }}>{emailError}</p>
        )}
      </div>

      {/* Password Field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '14px', color: '#64748b' }}>{dict.password_label}</label>
        <input
          type="password"
          className="input"
          style={{ borderColor: passwordError ? '#dc2626' : undefined, height: '42px', fontFamily: 'var(--font-inter)' }}
          placeholder={dict.password_placeholder}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(null);
          }}
          onBlur={handlePasswordBlur}
          required
          autoComplete="new-password"
          name="user_password_secure"
        />
        {passwordError && (
          <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '-4px' }}>{passwordError}</p>
        )}
      </div>

      <button 
        type="submit" 
        className="auth-button"
        disabled={loading}
        style={{
          height: '42px',
          width: '172px',
          background: 'linear-gradient(88.02deg, #003077 2.89%, #0059DD 97.11%)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          padding: '12px 18px',
          marginTop: '8px'
        }}
      >
        {loading ? dict.loading_btn : dict.submit_btn}
      </button>

      <div style={{ marginTop: '2rem', fontSize: '14px', color: '#64748b' }}>
        {dict.no_account} <Link href="/register" className="auth-link" style={{ color: '#3b82f6', textDecoration: 'none' }}>{dict.register_link} &rarr;</Link>
      </div>
    </form>
  );
}
