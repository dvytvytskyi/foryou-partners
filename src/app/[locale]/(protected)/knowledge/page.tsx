import React from 'react';
import { getDictionary, Locale } from '@/i18n/getDictionary';
import { KnowledgeClient } from '@/components/knowledge/KnowledgeClient';

export default async function KnowledgePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <KnowledgeClient dict={dict.knowledge_page} />;
}
