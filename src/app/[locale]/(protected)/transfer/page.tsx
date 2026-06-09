import React from 'react';
import { TransferForm } from '@/components/transfer/TransferForm';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function TransferPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem 2rem 2rem', gap: '32px', height: '100%', minHeight: 0 }}>
      <TransferForm dict={dict.transfer_page} />
    </div>
  );
}
