'use client';

import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProtectedGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
