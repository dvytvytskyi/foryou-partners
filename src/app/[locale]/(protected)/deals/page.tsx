import React from 'react';
import { DealsClient } from '@/components/deals/DealsClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function DealsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <DealsClient dict={dict.deals_page} />;
}
