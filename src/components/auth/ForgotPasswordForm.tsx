'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.post('/auth/password/forgot', { email });
      setMessage({ type: 'success', text: 'Інструкції для відновлення надіслано на ваш email' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Помилка при запиті. Спробуйте пізніше' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {message && (
        <div className="badge" style={{ 
          backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fee2e2', 
          color: message.type === 'success' ? '#059669' : '#dc2626', 
          width: '100%', 
          justifyContent: 'center', 
          padding: '0.75rem' 
        }}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label style={{ fontSize: '14px', fontWeight: 'var(--font-weight-medium)' }}>Email</label>
        <input
          type="email"
          className="input"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
          name="forgot_email"
        />
      </div>

      <button 
        type="submit" 
        className="button button-primary mt-2" 
        disabled={loading}
        style={{ fontSize: '14px' }}
      >
        {loading ? 'Надсилання...' : 'Відновити пароль'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link href="/login" style={{ fontSize: '14px', color: 'var(--grey-500)' }}>
          Повернутися до входу
        </Link>
      </div>
    </form>
  );
}
