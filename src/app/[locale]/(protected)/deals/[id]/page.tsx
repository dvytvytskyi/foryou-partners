import React from 'react';
import { getDictionary, Locale } from '@/i18n/getDictionary';
import { DealDetailClient } from '@/components/deals/DealDetailClient';

export default async function DealDetailPage({ params }: { params: Promise<{ locale: Locale, id: string }> }) {
  const resolvedParams = await params;
  const dict = await getDictionary(resolvedParams.locale);

  return <DealDetailClient id={resolvedParams.id} locale={resolvedParams.locale} dict={dict.deal_detail} />;
}
