import React from 'react';
import { ProfileClient } from '@/components/profile/ProfileClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function ProfilePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <ProfileClient dict={dict.profile_page} />;
}
