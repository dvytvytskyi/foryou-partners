import React from 'react';
import { FeedbackClient } from '@/components/feedback/FeedbackClient';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function FeedbackPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <FeedbackClient dict={dict.feedback_page} />;
}
