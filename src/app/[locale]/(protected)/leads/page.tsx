import React from 'react';
import { LeadsBoard } from '@/components/leads/LeadsBoard';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function LeadsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="flex flex-col">
      <LeadsBoard dict={dict.leads_page} />
    </div>
  );
}
