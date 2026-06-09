import React from 'react';
import { ReferralsClient } from '@/components/referrals/ReferralsClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function ReferralsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <ReferralsClient dict={dict.referrals_page} />;
}
