import React from 'react';
import { SupportClient } from '@/components/support/SupportClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function SupportPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <SupportClient dict={dict.support_page} />;
}
