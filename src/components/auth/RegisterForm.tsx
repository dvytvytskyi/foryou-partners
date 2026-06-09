'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
export default function RegisterForm({ dict }: { dict: any }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [direction, setDirection] = useState('');
  const [partnerType, setPartnerType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!partnerType) {
      setError('Оберіть тип партнера / Выберите тип партнера');
      return;
    }
    if (!direction) {
      setError('Оберіть напрямок / Выберите направление');
      return;
    }
    if (password !== confirmPassword) {
      setError(dict.errors.password_mismatch);
      return;
    }
    if (!consent) {
      setError(dict.errors.consent_required);
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, firstName, lastName, phone, direction, partnerType });
      router.push('/pending');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || dict.errors.register_failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {error && (
          <div className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '6px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="text"
            className="input"
            style={{ height: '42px', fontFamily: 'var(--font-inter)' }}
            placeholder={dict.first_name_placeholder}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="text"
            className="input"
            style={{ height: '42px', fontFamily: 'var(--font-inter)' }}
            placeholder={dict.last_name_placeholder}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="tel"
            className="input"
            style={{ height: '42px', fontFamily: 'var(--font-inter)' }}
            placeholder={dict.phone_placeholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="email"
            className="input"
            style={{ height: '42px', fontFamily: 'var(--font-inter)' }}
            placeholder={dict.email_placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
          />
        </div>


        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <select
            className="input"
            style={{ height: '42px', fontFamily: 'var(--font-inter)' }}
            value={partnerType}
            onChange={(e) => setPartnerType(e.target.value)}
            required
          >
            <option value="" disabled>{dict.partner_type_default}</option>
            <option value="фриланс-брокер">{dict.partner_type_freelance}</option>
            <option value="агентство">{dict.partner_type_agency}</option>
            <option value="банк-прайват клиенты">{dict.partner_type_bank}</option>
            <option value="другое (заполнить поле ниже)">{dict.partner_type_other}</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <select
            className="input"
            style={{ height: '42px', fontFamily: 'var(--font-inter)' }}
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            required
          >
            <option value="" disabled>{dict.direction_default}</option>
            <option value="Дубай">{dict.direction_dubai}</option>
            <option value="Абу-Даби">{dict.direction_abudhabi}</option>
            <option value="РАК">{dict.direction_rak}</option>
            <option value="Оман">{dict.direction_oman}</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="password"
            className="input"
            style={{ height: '42px', fontFamily: 'var(--font-inter)' }}
            placeholder={dict.password_placeholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            type="password"
            className="input"
            style={{ height: '42px', fontFamily: 'var(--font-inter)' }}
            placeholder={dict.confirm_password_placeholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#64748b', cursor: 'pointer', marginTop: '4px' }}>
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
          {dict.consent_label}
        </label>

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
          {dict.has_account} <Link href="/login" className="auth-link" style={{ color: '#3b82f6', textDecoration: 'none' }}>{dict.login_link} &rarr;</Link>
        </div>
      </form>
  );
}
