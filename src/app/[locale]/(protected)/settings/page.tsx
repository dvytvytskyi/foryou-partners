import React from 'react';
import { UsersTable } from '@/components/admin/UsersTable';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function SettingsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <UsersTable dict={dict.settings_page} />
      </div>
    </div>
  );
}
