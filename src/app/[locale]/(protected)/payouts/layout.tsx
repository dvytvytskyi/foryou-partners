import { Metadata } from 'next';

import { getDictionary, Locale } from '@/i18n/getDictionary';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const dict = await getDictionary(params.locale as Locale);
  return {
    title: dict.hardcoded.payouts_for_you_partners,
  };
}

export default function PayoutsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
