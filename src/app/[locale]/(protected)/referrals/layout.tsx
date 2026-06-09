import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Рефералы - FOR YOU Partners',
};

export default function ReferralsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
