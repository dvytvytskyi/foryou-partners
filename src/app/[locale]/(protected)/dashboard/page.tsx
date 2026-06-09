import React from 'react';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <DashboardClient dict={dict.dashboard} />;
}
