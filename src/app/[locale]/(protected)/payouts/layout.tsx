import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Выплаты - FOR YOU Partners',
};

export default function PayoutsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
