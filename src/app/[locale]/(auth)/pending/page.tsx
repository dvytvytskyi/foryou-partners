import AuthLayout from '@/components/layout/AuthLayout';
import Link from 'next/link';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function PendingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AuthLayout
      title={
        <>
          {dict.auth.pending.title_1}<br />{dict.auth.pending.title_2}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
        <div style={{ color: '#002f75', fontSize: '16px', lineHeight: '1.5' }}>
          {dict.auth.pending.message_1}
          <br /><br />
          {dict.auth.pending.message_2}
        </div>

        <div style={{ marginTop: '2rem', fontSize: '14px', color: '#64748b' }}>
          <Link href="/login" className="auth-link" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
            &larr; {dict.auth.pending.back_to_login}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
