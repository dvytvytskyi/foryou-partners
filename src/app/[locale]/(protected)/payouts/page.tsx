import React from 'react';
import { PayoutsClient } from '@/components/payouts/PayoutsClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function PayoutsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <PayoutsClient dict={dict.payouts_page} />;
}
