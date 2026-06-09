import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getDictionary, Locale } from '@/i18n/getDictionary';

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <ProtectedRoute>
      <DashboardLayout dict={dict.layout}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
