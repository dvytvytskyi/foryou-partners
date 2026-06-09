import React from 'react';
import { AdminPartnersClient } from '@/components/admin/partners/AdminPartnersClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function AdminPartnersPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <AdminPartnersClient dict={dict.admin_partners_page} />;
}
