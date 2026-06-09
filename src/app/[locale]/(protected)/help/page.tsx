import React from 'react';
import { HelpClient } from '@/components/help/HelpClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function HelpPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <HelpClient dict={dict.help_page} />;
}
