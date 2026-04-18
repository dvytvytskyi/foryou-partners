'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  };

  const handleBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.post('/auth/password/forgot', { email });
      setMessage({ type: 'success', text: 'Instructions have been sent to your email' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error processing request. Please try again later' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {message && (
        <div className="badge" style={{ 
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fee2e2', 
          color: message.type === 'success' ? '#059669' : '#dc2626', 
          width: '100%', 
          justifyContent: 'center', 
          padding: '0.75rem',
          borderRadius: '6px'
        }}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--grey-500)' }}>Email address</label>
        <input
          type="email"
          className="input"
          style={{ borderColor: emailError ? '#dc2626' : undefined }}
          placeholder="eg. john@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          onBlur={handleBlur}
          required
          autoComplete="off"
          name="forgot_email"
        />
        {emailError && (
          <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '-4px' }}>{emailError}</p>
        )}
      </div>

      <button 
        type="submit" 
        className="button button-primary mt-1" 
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Reset Password'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
        <Link href="/login" style={{ fontSize: '14px', color: 'var(--grey-500)', fontWeight: '500' }}>
          Back to login
        </Link>
      </div>
    </form>
  );
}
